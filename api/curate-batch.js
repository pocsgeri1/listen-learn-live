// api/curate-batch.js
// Reusable curation endpoint: assigns curated_collection_ids to concepts.
// POST body: { concepts: [{id,term,category,hook}], collections: [{id,title,tagline}] }
// Returns: { result: [{id, curated_collection_ids: [...]}] }

export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY missing' });

  const { concepts, collections } = req.body || {};
  if (!Array.isArray(concepts) || !Array.isArray(collections)) {
    return res.status(400).json({ error: 'concepts and collections arrays required' });
  }
  if (concepts.length === 0) {
    return res.status(200).json({ result: [] });
  }

  const prompt = `You are a strict semantic curator for Epistemic, a concept-card library being organized into themed collections.

TASK: For each concept below, decide which collection(s) it STRONGLY and OBVIOUSLY belongs to.

STRICT RULES (read carefully — most concepts should get 0 or 1 collections, 2 is rare, never more than 2):
1. Only assign a collection if a thoughtful curator could defend the match in ONE sentence without hedging.
2. Category overlap is NOT sufficient. A concept being "psychology" doesn't mean it belongs in a psychology-themed collection — the SPECIFIC IDEA must match the collection's specific angle.
3. If a concept is interesting but doesn't have an obvious home in any of these 16 collections, return an empty array for it. This is expected and good — aim for roughly half of all concepts to get zero collections.
4. Maximum 2 collections per concept. Most should get 0 or 1.
5. When in doubt, leave it out. A loose, "could sort of fit" connection does not count.

COLLECTIONS (id, title, tagline — the tagline defines the SPECIFIC angle, not the general topic):
${JSON.stringify(collections)}

CONCEPTS TO CLASSIFY (id, term, category, hook):
${JSON.stringify(concepts)}

OUTPUT FORMAT: Return ONLY a valid JSON array, one object per concept, in the same order as input, sorted by id. No markdown, no preamble, no trailing commas, no commentary.
[{"id":1,"curated_collection_ids":[101]},{"id":2,"curated_collection_ids":[]},...]`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    if (!data.content || !data.content[0] || !data.content[0].text) {
      return res.status(500).json({ error: 'Unexpected API response shape' });
    }

    let text = data.content[0].text.trim();

    // Strip markdown code fences
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

    // Fix common JSON issues: trailing commas before ] or }
    text = text.replace(/,(\s*[\]}])/g, '$1');

    // If the model added any preamble text before/after the array, extract just the array
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      text = text.substring(firstBracket, lastBracket + 1);
    }
    // Re-apply trailing comma fix after extraction
    text = text.replace(/,(\s*[\]}])/g, '$1');

    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Failed to parse model output: ' + parseErr.message, raw: text.slice(0, 500) });
    }

    if (!Array.isArray(result)) {
      return res.status(500).json({ error: 'Model output was not a JSON array' });
    }

    // Validate and normalize each entry
    const inputIds = new Set(concepts.map(c => c.id));
    const validCollectionIds = new Set(collections.map(c => c.id));
    const normalized = [];
    for (const item of result) {
      if (typeof item.id !== 'number' || !inputIds.has(item.id)) continue;
      let ids = Array.isArray(item.curated_collection_ids) ? item.curated_collection_ids : [];
      ids = ids.filter(x => typeof x === 'number' && validCollectionIds.has(x));
      ids = [...new Set(ids)].slice(0, 2); // dedupe, max 2
      normalized.push({ id: item.id, curated_collection_ids: ids });
    }

    // Ensure every input concept has an output entry (fill missing with empty array)
    const resultMap = new Map(normalized.map(r => [r.id, r]));
    const finalResult = concepts.map(c =>
      resultMap.has(c.id) ? resultMap.get(c.id) : { id: c.id, curated_collection_ids: [] }
    );

    return res.status(200).json({ result: finalResult });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
