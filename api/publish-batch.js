// /api/publish-batch.js
// Receives an array of approved concepts from Make.com, appends ALL of them
// to concepts.json on GitHub in a SINGLE commit, and returns per-concept
// success/failure so Make can flip Status individually in Airtable.
//
// Why batch: the per-concept publisher fires N HTTP commits in rapid succession,
// which Vercel coalesces into one build that misses the last 1-2 commits. One
// batch = one commit = one deterministic build.
//
// Accepts BOTH shapes for each concept object:
//   (a) lowercase keys: term, category, source, hook, plain, analogy, prompt,
//       collection_id, timestamp, airtable_id
//   (b) Airtable raw aggregator output: Term, Category, Source, Hook, Plain,
//       Analogy, Prompt, "Collection ID", Timestamp, ID
// This means Make.com can dump the array aggregator output directly as
// { "concepts": {{2.array}} } without trying to reshape it in IML (which
// has no working object-mapping primitive on free tier).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Shared-secret check
  const providedSecret = req.headers['x-publish-secret'];
  if (providedSecret !== process.env.PUBLISH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized. Invalid secret.' });
  }

  const { concepts: incomingConcepts } = req.body || {};

  if (!Array.isArray(incomingConcepts) || incomingConcepts.length === 0) {
    return res.status(400).json({
      error: 'Request body must include a non-empty `concepts` array.',
    });
  }

  // Hard cap to prevent accidental floods
  if (incomingConcepts.length > 100) {
    return res.status(400).json({
      error: `Batch too large: ${incomingConcepts.length} concepts. Max is 100 per call.`,
    });
  }

  const allowedCategories = [
    'finance', 'psychology', 'thinking', 'power', 'relationships', 'language',
    'business', 'identity', 'health', 'philosophy', 'society', 'creativity',
    'science', 'tech-ai',
  ];

  // GitHub config
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'pocsgeri1';
  const REPO_NAME = 'listen-learn-live';
  const FILE_PATH = 'concepts.json';
  const BRANCH = 'main';

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Server misconfigured: GITHUB_TOKEN missing.' });
  }

  const githubApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`;

  // Helper: read a field from either lowercase or Airtable-cased version.
  // Returns trimmed string, or '' if missing/empty/non-string.
  function readField(obj, ...keys) {
    for (const k of keys) {
      const v = obj[k];
      if (v === undefined || v === null) continue;
      if (typeof v === 'string') {
        const t = v.trim();
        if (t) return t;
      } else if (typeof v === 'number') {
        return String(v);
      }
    }
    return '';
  }

  // Helper: read an int field (or null) from either casing
  function readIntOrNull(obj, ...keys) {
    for (const k of keys) {
      const v = obj[k];
      if (v === undefined || v === null || v === '' || v === 0 || v === '0' || v === 'null') continue;
      const parsed = parseInt(v, 10);
      if (Number.isInteger(parsed) && parsed > 0) return parsed;
    }
    return null;
  }

  function readTimestampOrNull(obj, ...keys) {
    for (const k of keys) {
      const v = obj[k];
      if (v === undefined || v === null || v === '') continue;
      const parsed = parseInt(v, 10);
      if (Number.isInteger(parsed) && parsed >= 0) return parsed;
    }
    return null;
  }

  // Normalize each incoming concept into the canonical shape, OR record a validation error.
  // We do this BEFORE fetching GitHub so we fail fast if the whole batch is bad.
  const normalized = [];
  const results = []; // per-concept result objects

  for (let i = 0; i < incomingConcepts.length; i++) {
    const raw = incomingConcepts[i] || {};

    const airtable_id = readField(raw, 'airtable_id', 'ID', 'id', 'Record ID', 'record_id');
    const term = readField(raw, 'term', 'Term');
    const category = readField(raw, 'category', 'Category');
    const sourceRaw = readField(raw, 'source', 'Source');
    const hook = readField(raw, 'hook', 'Hook');
    const plain = readField(raw, 'plain', 'Plain');
    const analogy = readField(raw, 'analogy', 'Analogy');
    const prompt = readField(raw, 'prompt', 'Prompt');
    const collection_id = readIntOrNull(raw, 'collection_id', 'Collection ID');
    const timestamp = readTimestampOrNull(raw, 'timestamp', 'Timestamp');
    // Read editors_pick directly — readField above only handles strings/numbers
    // and would silently coerce boolean true → '' (= false).
    const editorsPickRaw = raw['editors_pick'] ?? raw["Editor's Pick"] ?? raw['Editors Pick'];
    const editors_pick = editorsPickRaw === true
                      || editorsPickRaw === 'true'
                      || editorsPickRaw === 1
                      || editorsPickRaw === '1';
    // related_ids: array of ints, or empty array. Never null in output.
    const relatedIdsRaw = raw['related_ids'] ?? raw['Related IDs'] ?? [];
    const related_ids = Array.isArray(relatedIdsRaw)
      ? relatedIdsRaw.map(v => parseInt(v, 10)).filter(n => Number.isInteger(n) && n > 0)
      : typeof relatedIdsRaw === 'string' && relatedIdsRaw.trim()
        ? relatedIdsRaw.split(',').map(v => parseInt(v.trim(), 10)).filter(n => Number.isInteger(n) && n > 0)
        : [];

    const missing = [];
    if (!term) missing.push('term');
    if (!category) missing.push('category');
    if (!hook) missing.push('hook');
    if (!plain) missing.push('plain');
    if (!analogy) missing.push('analogy');
    if (!prompt) missing.push('prompt');

    if (missing.length > 0) {
      results.push({
        airtable_id: airtable_id || null,
        term: term || `(index ${i})`,
        concept_id: null,
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      });
      continue;
    }

    if (!allowedCategories.includes(category)) {
      results.push({
        airtable_id: airtable_id || null,
        term,
        concept_id: null,
        success: false,
        error: `Invalid category "${category}". Must be one of: ${allowedCategories.join(', ')}`,
      });
      continue;
    }

    // Normalize source: any 2-4 lowercase letter code, else fall back to "core"
    let normalizedSource = 'core';
    if (sourceRaw) {
      const s = sourceRaw.toLowerCase();
      if (/^[a-z]{2,4}$/.test(s)) normalizedSource = s;
    }

    normalized.push({
      _index: i,
      airtable_id: airtable_id || null,
      term,
      category,
      source: normalizedSource,
      hook,
      plain,
      analogy,
      prompt,
      collection_id,
      timestamp,
      editors_pick,
      related_ids,
    });
  }

  // If every concept failed validation, bail before touching GitHub
  if (normalized.length === 0) {
    return res.status(400).json({
      success: false,
      published_count: 0,
      failed_count: results.length,
      results,
      error: 'No concepts passed validation. Nothing committed.',
    });
  }

  try {
    // Step 1: fetch current concepts.json
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

    let existingConcepts;
    try {
      existingConcepts = JSON.parse(decodedContent);
    } catch (parseErr) {
      return res.status(500).json({ error: 'concepts.json on GitHub is not valid JSON.', detail: parseErr.message });
    }

    if (!Array.isArray(existingConcepts)) {
      return res.status(500).json({ error: 'concepts.json is not an array.' });
    }

    // Step 2: build a lowercase term set for duplicate detection
    const existingTermsLower = new Set(
      existingConcepts.filter(c => c && c.term).map(c => c.term.toLowerCase())
    );

    // Also dedupe within the batch itself
    const batchTermsLower = new Set();

    // Step 3: compute starting ID
    let nextId = existingConcepts.reduce(
      (max, c) => (typeof c.id === 'number' && c.id > max ? c.id : max),
      0
    ) + 1;

    // Step 2b: map lowercase term -> original (lowest) concept id, so a
    // cross-episode repeat can point back at the first occurrence.
    const termToOriginalId = new Map();
    for (const c of existingConcepts) {
      if (!c || !c.term || typeof c.id !== 'number') continue;
      const t = c.term.toLowerCase();
      // Keep the earliest (lowest) id as the canonical original.
      if (!termToOriginalId.has(t) || c.id < termToOriginalId.get(t)) {
        termToOriginalId.set(t, c.id);
      }
    }

    // Step 4: validate each normalized concept, append to file.
    // Cross-episode repeats are PUBLISHED with a duplicate_of marker so the
    // concept still appears in its episode drawer. Same-term-twice within a
    // single batch is still rejected (that's an extraction mistake).
    const toAppend = [];
    for (const n of normalized) {
      const termLower = n.term.toLowerCase();

      if (batchTermsLower.has(termLower)) {
        results.push({
          airtable_id: n.airtable_id,
          term: n.term,
          concept_id: null,
          success: false,
          error: `Term "${n.term}" appears more than once in this batch. Only the first occurrence is published.`,
        });
        continue;
      }

      batchTermsLower.add(termLower);

      // If this term already exists in the live file, this is a legitimate
      // cross-episode repeat: publish it, tagged back to the original id.
      const duplicateOf = existingTermsLower.has(termLower)
        ? (termToOriginalId.get(termLower) || null)
        : null;

      const newConcept = {
        id: nextId,
        term: n.term.trim(),
        category: n.category,
        source: n.source,
        hook: n.hook.trim(),
        plain: n.plain.trim(),
        analogy: n.analogy.trim(),
        prompt: n.prompt.trim(),
        collection_id: n.collection_id,
        timestamp: n.timestamp,
        editors_pick: n.editors_pick === true,
        related_ids: n.related_ids || [],
        duplicate_of: duplicateOf,
      };

      toAppend.push(newConcept);
      results.push({
        airtable_id: n.airtable_id,
        term: n.term,
        concept_id: nextId,
        success: true,
        error: duplicateOf
          ? `Published as cross-episode duplicate of concept #${duplicateOf}.`
          : null,
      });

      nextId++;
    }

    // If nothing made it through after dedup, don't commit
    if (toAppend.length === 0) {
      const failed = results.filter(r => !r.success).length;
      return res.status(200).json({
        success: false,
        published_count: 0,
        failed_count: failed,
        results,
        message: 'No concepts to publish after validation and dedup. No commit made.',
      });
    }

    // Step 5: append and serialize
    const updatedConcepts = existingConcepts.concat(toAppend);
    const updatedContent = JSON.stringify(updatedConcepts, null, 2) + '\n';
    const updatedContentBase64 = Buffer.from(updatedContent, 'utf-8').toString('base64');

    // Step 6: single commit with all appended concepts
    const commitMessage = toAppend.length === 1
      ? `Add concept #${toAppend[0].id}: ${toAppend[0].term}`
      : `Batch publish: add ${toAppend.length} concepts (#${toAppend[0].id}–#${toAppend[toAppend.length - 1].id})`;

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
      return res.status(502).json({
        error: `Failed to commit to GitHub. Status: ${commitResp.status}`,
        detail: text,
      });
    }

    const commitData = await commitResp.json();
    const publishedCount = toAppend.length;
    const failedCount = results.filter(r => !r.success).length;

    return res.status(200).json({
      success: true,
      published_count: publishedCount,
      failed_count: failedCount,
      commit_sha: commitData.commit && commitData.commit.sha,
      results,
      message: `Published ${publishedCount} concept(s) in 1 commit. Live on site in ~60s.`,
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Unexpected error while batch publishing.',
      detail: err.message,
    });
  }
}
