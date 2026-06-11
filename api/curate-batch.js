// api/curate-batch.js
// POST { concepts: [...], collections: [...] }
// Returns { result: [...] }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY missing' });

  const { concepts, collections } = req.body;
  if (!concepts || !collections) return res.status(400).json({ error: 'concepts and collections required' });

  const prompt = `You are a semantic curator for Epistemic, a concept card library.

16 thematic collections and concept cards below (id, term, category, hook).

For each concept, decide which collection IDs it genuinely belongs to based on MEANING not category label. Be selective. Most concepts: 0-2 collections. Max 3.

COLLECTIONS:
${JSON.stringify(collections)}

CONCEPTS:
${JSON.stringify(concepts)}

Return ONLY a valid JSON array, one object per concept, sorted by id:
[{"id":1,"curated_collection_ids":[101,106]},{"id":2,"curated_collection_ids":[]},...]

No preamble. No markdown. Pure JSON only.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content[0].text.trim().replace(/^```json\n?|^```\n?|\n?```$/g, '').trim();
    const result = JSON.parse(text);
    return res.status(200).json({ result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
