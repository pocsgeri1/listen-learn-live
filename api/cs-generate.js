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

  const { concept, ctx, mode, userInput, candidates } = req.body || {};

  // ── SITUATION MODE (Corner Mode) ───────────────────────────────────────────
  if (mode === 'situation') {
    if (!userInput || !Array.isArray(candidates) || !candidates.length) {
      return res.status(400).json({ error: 'userInput and candidates array required for situation mode.' });
    }

    const situationSystemPrompt = `You are a sharp, direct conversation coach — think of a smart friend who reads a lot and gives real advice, not a self-help book. You help people find the right mental frame for a real situation they're about to face.

Rules:
- Only use concepts from the provided candidate list. Never hallucinate or invent concepts.
- Pick 2–3 concepts. At least one should be an obvious strong fit. Include one wildcard: a concept that applies in a surprising or non-obvious way — label it as such.
- Write like a person, not a product. Short sentences. No corporate language. No em-dashes.
- The "opener" field is a practical tip or reframe — not a script to memorize. It should be specific to their actual situation. Think: what would a sharp mentor say right before they walked in?
- Output ONLY valid JSON. No markdown, no preamble.`;

    const candidateList = candidates.map((c, i) =>
      `${i + 1}. ID:${c.id} | "${c.term}" (${c.category})\n   Hook: ${c.hook}\n   Plain: ${c.plain}`
    ).join('\n\n');

    const situationPrompt = `Someone just told me this about their situation:
"${userInput}"

Pick 2–3 concepts from the list below that genuinely help them. Include one wildcard pick — something that applies in a surprising way. Mark it with isWildcard: true.

For each concept, write:
- conceptId: the integer ID
- fitScore: 0–100 (how well it fits their actual situation, not the concept in general)
- isWildcard: boolean
- whyThisFits: 2–3 sentences. Be specific — reference their actual words. Sound like a person, not a product description.
- toFrameItWell: 1–2 sentences. What should they actually do or think before they walk in? Be concrete.
- watchOutFor: 1–2 sentences. The thing a real mentor would warn them about. The thing people don't say.

Also write:
- opener: a practical tip or mindset shift specific to their situation. This is NOT a line to memorize — it's a reframe, an insight, or a step-by-step micro-tip they can actually use. Keep it short (2–3 sentences max). Make it feel like something a sharp friend texted them right before.

CANDIDATE CONCEPTS:
${candidateList}

Respond ONLY with valid JSON:
{
  "concepts": [
    {
      "conceptId": 123,
      "fitScore": 94,
      "isWildcard": false,
      "whyThisFits": "...",
      "toFrameItWell": "...",
      "watchOutFor": "..."
    }
  ],
  "opener": "..."
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
          max_tokens: 900,
          system: situationSystemPrompt,
          messages: [{ role: 'user', content: situationPrompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Anthropic API error (situation):', err);
        return res.status(502).json({ error: 'Upstream API error.' });
      }

      const data = await response.json();
      const raw = data?.content?.[0]?.text || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!Array.isArray(parsed.concepts) || !parsed.concepts.length) {
        return res.status(502).json({ error: 'Malformed situation API response.' });
      }

      return res.status(200).json(parsed);

    } catch (e) {
      console.error('cs-generate situation error:', e);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }
  // ── END SITUATION MODE ─────────────────────────────────────────────────────

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
