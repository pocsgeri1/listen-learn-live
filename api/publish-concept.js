// /api/publish-concept.js
// Receives an approved concept from Make.com, appends it to concepts.json on GitHub,
// and returns success. Vercel auto-redeploys on commit, so the concept goes live in ~60s.

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Simple shared-secret check so random people can't publish to your repo
  const providedSecret = req.headers['x-publish-secret'];
  if (providedSecret !== process.env.PUBLISH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Invalid secret.' });
  }

  // Extract the concept fields from the request body
  const {
    term,
    category,
    source,
    hook,
    plain,
    analogy,
    prompt,
    collection_id,
  } = req.body || {};

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
    return res.status(400).json({
      error: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  // Validate category and source against allowed values
  const allowedCategories = ['finance', 'psychology', 'thinking', 'power', 'relationships', 'language', 'business', 'identity', 'health', 'philosophy', 'society', 'creativity', 'science', 'tech-ai'];
  const allowedSources = ['core', 'cw', 'ah', 'dk'];

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      error: `Invalid category "${category}". Must be one of: ${allowedCategories.join(', ')}`,
    });
  }
  if (!allowedSources.includes(source)) {
    return res.status(400).json({
      error: `Invalid source "${source}". Must be one of: ${allowedSources.join(', ')}`,
    });
  }

  // GitHub API configuration
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
    // Step 1: fetch current concepts.json from GitHub
    const getResp = await fetch(githubApiUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'LLL-Publisher',
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

    // Step 2: compute next ID
    const maxId = concepts.reduce((max, c) => (typeof c.id === 'number' && c.id > max ? c.id : max), 0);
    const nextId = maxId + 1;

    // Step 3: check for duplicate term (case-insensitive) to prevent accidental double-publish
    const termLower = term.trim().toLowerCase();
    const duplicate = concepts.find(c => c.term && c.term.toLowerCase() === termLower);
    if (duplicate) {
      return res.status(409).json({
        error: `A concept with term "${term}" already exists (id: ${duplicate.id}). Not publishing duplicate.`,
      });
    }

    // Step 4: build new concept object matching the exact 9-field schema.
    // Normalize collection_id: accept integer, null, undefined, empty string, or 0 (Make.com null workaround).
    // Anything that isn't a positive integer becomes null.
    let normalizedCollectionId = null;
    if (collection_id !== undefined && collection_id !== null && collection_id !== '' && collection_id !== 0 && collection_id !== '0') {
      const parsed = parseInt(collection_id, 10);
      if (Number.isInteger(parsed) && parsed > 0) {
        normalizedCollectionId = parsed;
      }
    }

    const newConcept = {
      id: nextId,
      term: term.trim(),
      category,
      source,
      hook: hook.trim(),
      plain: plain.trim(),
      analogy: analogy.trim(),
      prompt: prompt.trim(),
      collection_id: normalizedCollectionId,
    };

    // Step 5: append and re-serialize with 2-space indentation to match existing file
    concepts.push(newConcept);
    const updatedContent = JSON.stringify(concepts, null, 2) + '\n';
    const updatedContentBase64 = Buffer.from(updatedContent, 'utf-8').toString('base64');

    // Step 6: commit the updated file back to GitHub
    const commitResp = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'LLL-Publisher',
      },
      body: JSON.stringify({
        message: `Add concept #${nextId}: ${newConcept.term}`,
        content: updatedContentBase64,
        sha: currentSha,
        branch: BRANCH,
      }),
    });

    if (!commitResp.ok) {
      const text = await commitResp.text();
      return res.status(502).json({
        error: `Failed to commit to GitHub. Status: ${commitResp.status}`,
        detail: text,
      });
    }

    const commitData = await commitResp.json();

    // Step 7: respond to Make.com with success
    return res.status(200).json({
      success: true,
      concept_id: nextId,
      term: newConcept.term,
      commit_sha: commitData.commit && commitData.commit.sha,
      message: `Published concept #${nextId}: ${newConcept.term}. Live on site in ~60s.`,
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected error while publishing concept.',
      detail: err.message,
    });
  }
}
