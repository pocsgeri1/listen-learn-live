// /api/cs-generate.js — v1.71
// Generates context-aware conversation starter via Claude API.
// Env var required: ANTHROPIC_API_KEY
// POST body: { concept: { term, hook, plain, analogy, prompt, category }, ctx?: string }
// If ctx is provided: returns { ctx: { prompt, openers, pitfall } } (single scenario)
// If ctx is omitted: returns { contexts: { partner, friend, colleague, meeting } } (legacy all-4)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY missing.' });
  }

  const { concept, ctx } = req.body || {};
  if (!concept || !concept.term) {
    return res.status(400).json({ error: 'concept object with term is required.' });
  }

  const CTX_DESCRIPTIONS = {
    partner:   'intimate/romantic partner, relaxed home setting, emotional honesty OK',
    friend:    'close friend, casual, humour allowed, no hierarchy',
    colleague: 'peer at work, professional but warm, aware of office dynamics',
    meeting:   'group setting, you want to surface an insight without lecturing'
  };

  const systemPrompt = `You are a conversation coach helping people use intellectual ideas in real-life interactions. You write in a warm, direct, non-preachy voice. Output only valid JSON — no markdown, no preamble.`;

  // Single-ctx mode
  if (ctx && CTX_DESCRIPTIONS[ctx]) {
    const userPrompt = `Given this concept card, generate a conversation starter for one specific social context.

CONCEPT:
Term: ${concept.term}
Hook: ${concept.hook}
Plain explanation: ${concept.plain}
Analogy: ${concept.analogy}
Original prompt: ${concept.prompt}
Category: ${concept.category}

CONTEXT: ${ctx} — ${CTX_DESCRIPTIONS[ctx]}

Provide:
- prompt: a genuine, natural question adapted for that specific relationship dynamic. Max 2 sentences.
- openers: exactly 2 verbatim sentences someone could say out loud to introduce this topic. Natural, not textbook. They should lead INTO the prompt.
- pitfall: one short warning about what could go wrong in this specific context. Max 15 words.

Respond ONLY with this JSON (no extra fields):
{ "prompt": "...", "openers": ["...", "..."], "pitfall": "..." }`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 700,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Anthropic API error:', err);
        return res.status(502).json({ error: 'Upstream API error.' });
      }

      const data = await response.json();
      const raw = data?.content?.[0]?.text || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!parsed.prompt || !Array.isArray(parsed.openers)) {
        return res.status(502).json({ error: 'Malformed API response.' });
      }

      return res.status(200).json({ ctx: parsed });

    } catch (e) {
      console.error('cs-generate single-ctx error:', e);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  // Legacy all-4-contexts mode (fallback)
  const userPrompt = `Given this concept card, generate conversation starters for 4 different social contexts.

CONCEPT:
Term: ${concept.term}
Hook: ${concept.hook}
Plain explanation: ${concept.plain}
Analogy: ${concept.analogy}
Original prompt: ${concept.prompt}
Category: ${concept.category}

For each of 4 contexts, provide:
- prompt: a genuine, natural question adapted for that specific relationship dynamic. Max 2 sentences.
- openers: exactly 2 verbatim sentences someone could say out loud to introduce this topic. Natural, not textbook.
- pitfall: one short warning about what could go wrong in that specific context. Max 15 words.

Contexts:
- partner: ${CTX_DESCRIPTIONS.partner}
- friend: ${CTX_DESCRIPTIONS.friend}
- colleague: ${CTX_DESCRIPTIONS.colleague}
- meeting: ${CTX_DESCRIPTIONS.meeting}

Respond ONLY with this JSON structure:
{
  "partner":   { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." },
  "friend":    { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." },
  "colleague": { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." },
  "meeting":   { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'Upstream API error.' });
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    const required = ['partner', 'friend', 'colleague', 'meeting'];
    for (const c of required) {
      if (!parsed[c] || !parsed[c].prompt || !Array.isArray(parsed[c].openers)) {
        return res.status(502).json({ error: 'Malformed API response.' });
      }
    }

    return res.status(200).json({ contexts: parsed });

  } catch (e) {
    console.error('cs-generate error:', e);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY missing.' });
  }

  const { concept } = req.body || {};
  if (!concept || !concept.term) {
    return res.status(400).json({ error: 'concept object with term is required.' });
  }

  const systemPrompt = `You are a conversation coach helping people use intellectual ideas in real-life interactions. You write in a warm, direct, non-preachy voice. Output only valid JSON — no markdown, no preamble.`;

  const userPrompt = `Given this concept card, generate conversation starters for 4 different social contexts.

CONCEPT:
Term: ${concept.term}
Hook: ${concept.hook}
Plain explanation: ${concept.plain}
Analogy: ${concept.analogy}
Original prompt: ${concept.prompt}
Category: ${concept.category}

For each of 4 contexts, provide:
- prompt: a genuine, natural question adapted for that specific relationship dynamic (not a copy of the original — rewrite it to fit the context, tone, and power dynamic). Max 2 sentences.
- openers: exactly 2 verbatim sentences someone could say out loud to introduce this topic in that context. Make them feel natural, not like a textbook. They should lead INTO the prompt, not state the concept.
- pitfall: one short warning about what could go wrong in that specific context (e.g. sounding preachy, triggering insecurity, seeming off-topic). Max 15 words.

Contexts:
- partner: intimate/romantic partner, relaxed home setting, emotional honesty OK
- friend: close friend, casual, humour allowed, no hierarchy
- colleague: peer at work, professional but warm, aware of office dynamics
- meeting: group setting, you want to surface an insight without lecturing

Respond ONLY with this JSON structure (no extra fields):
{
  "partner":   { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." },
  "friend":    { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." },
  "colleague": { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." },
  "meeting":   { "prompt": "...", "openers": ["...", "..."], "pitfall": "..." }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'Upstream API error.' });
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text || '';

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Validate shape
    const required = ['partner', 'friend', 'colleague', 'meeting'];
    for (const ctx of required) {
      if (!parsed[ctx] || !parsed[ctx].prompt || !Array.isArray(parsed[ctx].openers)) {
        return res.status(502).json({ error: 'Malformed API response.' });
      }
    }

    return res.status(200).json({ contexts: parsed });

  } catch (e) {
    console.error('cs-generate error:', e);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
