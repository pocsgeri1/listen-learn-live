// /api/publish-batch.js
// Receives an array of approved concepts from Make.com, appends them ALL to
// concepts.json on GitHub in a single commit, and returns per-concept success/fail.
// Single GitHub commit = single Vercel build = no SHA race conditions.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const providedSecret = req.headers['x-publish-secret'];
  if (providedSecret !== process.env.PUBLISH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Invalid secret.' });
  }

  const { concepts: incomingConcepts } = req.body || {};

  if (!Array.isArray(incomingConcepts) || incomingConcepts.length === 0) {
    return res.status(400).json({
      error: 'Body must contain a non-empty "concepts" array.',
    });
  }

  const allowedCategories = ['finance', 'psychology', 'thinking', 'power', 'relationships', 'language', 'business', 'identity', 'health', 'philosophy', 'society', 'creativity', 'science', 'tech-ai'];

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'pocsgeri1';
  const REPO_NAME = 'listen-learn-live';
  const FILE_PATH = 'concepts.json';
  const BRANCH = 'main';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server misconfigured: GITHUB_TOKEN missing.' });
  }

  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;

  try {
    // Step 1: fetch current concepts.json from GitHub ONCE
    const getResp = await fetch(githubApiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Epistemic-Publisher',
      },
    });

    if (!getResp.ok) {
      const text = await getResp.text();
      return res.status(502).json({
        error: `Failed to fetch concepts.json from GitHub. Status: ${getResp.status}`,
        detail: text,
      });
    }

    const fileData = await getResp.json();
    const currentSha = fileData.sha;
    const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');

    let concepts;
    try {
      concepts = JSON.parse(decodedContent);
    } catch (parseErr) {
      return res.status(500).json({ error: 'concepts.json on GitHub is not valid JSON.', detail: parseErr.message });
    }

    if (!Array.isArray(concepts)) {
      return res.status(500).json({ error: 'concepts.json is not an array.' });
    }

    // Step 2: validate and normalize each incoming concept
    const results = [];
    const validNewConcepts = [];
    let nextId = concepts.reduce((max, c) => (typeof c.id === 'number' && c.id > max ? c.id : max), 0);

    // Track terms across this batch + existing to catch duplicates within the batch itself
    const existingTermsLower = new Set(concepts.map(c => c.term && c.term.toLowerCase()).filter(Boolean));

    for (const incoming of incomingConcepts) {
      const { term, category, source, hook, plain, analogy, prompt, collection_id, timestamp, airtable_id } = incoming || {};

      // Validate required fields
      const missing = [];
      if (!term) missing.push('term');
      if (!category) missing.push('category');
      if (!source) missing.push('source');
      if (!hook) missing.push('hook');
      if (!plain) missing.push('plain');
      if (!analogy) missing.push('analogy');
      if (!prompt) missing.push('prompt');

      if (missing.length > 0) {
        results.push({
          airtable_id: airtable_id || null,
          term: term || '(missing)',
          success: false,
          error: `Missing required fields: ${missing.join(', ')}`,
        });
        continue;
      }

      if (!allowedCategories.includes(category)) {
        results.push({
          airtable_id: airtable_id || null,
          term,
          success: false,
          error: `Invalid category "${category}".`,
        });
        continue;
      }

      const termLower = term.trim().toLowerCase();
      if (existingTermsLower.has(termLower)) {
        results.push({
          airtable_id: airtable_id || null,
          term,
          success: false,
          error: `Duplicate term "${term}" — already exists or already in this batch.`,
        });
        continue;
      }

      // Normalize source
      let normalizedSource = 'core';
      if (typeof source === 'string') {
        const s = source.trim().toLowerCase();
        if (/^[a-z]{2,4}$/.test(s)) normalizedSource = s;
      }

      // Normalize collection_id
      let normalizedCollectionId = null;
      if (collection_id !== undefined && collection_id !== null && collection_id !== '' && collection_id !== 0 && collection_id !== '0') {
        const parsed = parseInt(collection_id, 10);
        if (Number.isInteger(parsed) && parsed > 0) {
          normalizedCollectionId = parsed;
        }
      }

      // Normalize timestamp
      let normalizedTimestamp = null;
      if (timestamp !== undefined && timestamp !== null && timestamp !== '') {
        const parsedTs = parseInt(timestamp, 10);
        if (Number.isInteger(parsedTs) && parsedTs >= 0) {
          normalizedTimestamp = parsedTs;
        }
      }

      nextId += 1;
      const newConcept = {
        id: nextId,
        term: term.trim(),
        category,
        source: normalizedSource,
        hook: hook.trim(),
        plain: plain.trim(),
        analogy: analogy.trim(),
        prompt: prompt.trim(),
        collection_id: normalizedCollectionId,
        timestamp: normalizedTimestamp,
      };

      validNewConcepts.push(newConcept);
      existingTermsLower.add(termLower);

      results.push({
        airtable_id: airtable_id || null,
        term: newConcept.term,
        concept_id: nextId,
        success: true,
      });
    }

    // If nothing valid to publish, return early with the per-item errors
    if (validNewConcepts.length === 0) {
      return res.status(400).json({
        error: 'No valid concepts to publish.',
        results,
      });
    }

    // Step 3: append all valid concepts and commit ONCE
    concepts.push(...validNewConcepts);
    const updatedContent = JSON.stringify(concepts, null, 2) + '\n';
    const updatedContentBase64 = Buffer.from(updatedContent, 'utf-8').toString('base64');

    const firstId = validNewConcepts[0].id;
    const lastId = validNewConcepts[validNewConcepts.length - 1].id;
    const commitMessage = validNewConcepts.length === 1
      ? `Add concept #${firstId}: ${validNewConcepts[0].term}`
      : `Add ${validNewConcepts.length} concepts (#${firstId}–#${lastId})`;

    const commitResp = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Epistemic-Publisher',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: updatedContentBase64,
        sha: currentSha,
        branch: BRANCH,
      }),
    });

    if (!commitResp.ok) {
      const text = await commitResp.text();
      // Mark every "success" as failed since the commit itself failed
      const failedResults = results.map(r => r.success ? { ...r, success: false, error: `Commit failed: ${commitResp.status}` } : r);
      return res.status(502).json({
        error: `Failed to commit to GitHub. Status: ${commitResp.status}`,
        detail: text,
        results: failedResults,
      });
    }

    const commitData = await commitResp.json();

    return res.status(200).json({
      success: true,
      published_count: validNewConcepts.length,
      failed_count: results.filter(r => !r.success).length,
      commit_sha: commitData.commit && commitData.commit.sha,
      results,
      message: `Published ${validNewConcepts.length} concept(s). Live on site in ~60s.`,
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected error while publishing batch.',
      detail: err.message,
    });
  }
}
