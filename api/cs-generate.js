// /api/cs-generate.js — v2.5
// Generates conversation starter via Claude API.
// v2.5: Added 'universal' ctx — single scenario-agnostic generation with variety.
// Env var required: ANTHROPIC_API_KEY
// POST body: { concept: { term, hook, plain, analogy, prompt, category }, ctx?: string }
// ctx='universal' → returns { ctx: { prompt, openers, pitfall } } with rotating opener style
// ctx=known_ctx  → returns { ctx: { prompt, openers, pitfall } } (legacy single-scenario)
// ctx omitted    → returns { contexts: { partner, friend, colleague, meeting } } (legacy all-4)

// Rotating opener styles — picked server-side so each generate feels fresh
const UNIVERSAL_OPENER_STYLES = [
  'curious and open, like you just encountered it and want to think it through together',
  'slightly surprised, like this reframed something you thought you understood',
  'conversational and direct, like you would genuinely say this to someone you trust',
  'energised — you find this genuinely interesting and want to share it',
  'reflective — you have been sitting with this and want to explore it aloud',
  'matter-of-fact — you heard something interesting and are passing it on',
  'warm and inviting — making the other person feel included in the idea',
  'lightly provocative — phrased to spark a reaction without being combative'
];

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

  const systemPrompt = `You are a conversation coach helping people use intellectual ideas in real-life interactions. You write in a warm, direct, non-preachy voice. Output only valid JSON — no markdown, no preamble.`;

  // ── UNIVERSAL CTX — v2.5 ─────────────────────────────────────────────────────
  if (ctx === 'universal') {
    const style = UNIVERSAL_OPENER_STYLES[Math.floor(Math.random() * UNIVERSAL_OPENER_STYLES.length)];

    const userPrompt = `Given this concept card, generate a conversation starter that works in any social context — with a friend, colleague, partner, or at a dinner table.

CONCEPT:
Term: ${concept.term}
Hook: ${concept.hook}
Plain explanation: ${concept.plain}
Analogy: ${concept.analogy}
Original prompt: ${concept.prompt}
Category: ${concept.category}

TONE: ${style}

Provide:
- prompt: a genuine, natural question that sparks real conversation. Works anywhere. Max 2 sentences. Do NOT start with "Have you ever" or "Did you know". Be specific to this concept.
- openers: exactly 2 verbatim sentences someone could say out loud to naturally introduce this topic. One should be slightly more casual than the other. No filler. They should lead INTO the prompt.
- pitfall: one short warning about what could go wrong when bringing this up. Max 15 words. Be specific.

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
      console.error('cs-generate universal error:', e);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  const CTX_DESCRIPTIONS = {
    partner:   'intimate/romantic partner, relaxed home setting, emotional honesty OK',
    friend:    'close friend, casual, humour allowed, no hierarchy',
    colleague: 'peer at work, professional but warm, aware of office dynamics',
    meeting:   'group setting, you want to surface an insight without lecturing'
  };

  // Single-ctx mode (legacy)
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
