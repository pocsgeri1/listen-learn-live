// /api/cs-generate.js — v1.97
// Generates context-aware conversation starters + stories via Claude API.
// Env var required: ANTHROPIC_API_KEY
// POST body (conversation starter): { concept: { term, hook, plain, analogy, prompt, category }, ctx?: string }
// POST body (story): { mode: 'story', concepts: [{term, plain, analogy}], storyCtx: string }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY missing.' });
  }

  const body = req.body || {};

  // ─── STORY MODE ────────────────────────────────────────────────────────────
  if (body.mode === 'story') {
    const { concepts, storyCtx } = body;
    if (!concepts || concepts.length < 2) {
      return res.status(400).json({ error: 'At least 2 concepts required for story mode.' });
    }

    const SCENE_HINTS = {
      friend:     'city walk, pub, someone\'s flat — two people who actually know each other',
      partner:    'home, morning, quiet evening — an honest conversation between two people in a relationship',
      colleague:  'work context — office, Slack, a meeting that could\'ve been an email',
      meeting:    'group setting — presentation, team discussion, something slightly high-stakes',
      dinner:     'dinner party, kitchen table, third bottle of wine — group of friends, slightly loose',
      date:       'first or second date — a bar, somewhere with good lighting, both people performing slightly',
      work:       'Wednesday afternoon, someone\'s commute home, a desk at 6pm',
      family:     'family gathering — the kind where you revert to being 16 within ten minutes',
      networking: 'conference drinks, a co-working space, someone handing out a business card',
      podcast:    'two people debriefing a podcast episode they both heard differently',
      solo:       'someone alone — commute, walk, late night — a thought that won\'t leave them alone',
    };

    const conceptList = concepts.map((c, i) =>
      `${i + 1}. ${c.term}: ${c.plain}`
    ).join('\n');

    const sceneHint = SCENE_HINTS[storyCtx] || SCENE_HINTS.friend;

    const systemPrompt = `You write short, human scenes for people who think too much about conversations they've already had. Your style sits between Esther Perel and Dan Koe: you name what's unspoken without explaining it, and you end before the moral arrives. You are never academic. You are never preachy. You never explain what a concept means — you show it through what a character does, says, or notices.`;

    const userPrompt = `Write ONE scene (180-210 words, hard ceiling) that weaves these ${concepts.length} ideas together as lived experience.

CONCEPTS (show each through action or dialogue — never name or define them):
${conceptList}

SCENE CONTEXT: ${sceneHint}

VOICE & STYLE RULES — ALL NON-NEGOTIABLE:
- "You" voice throughout. The reader is inside the story, not watching it.
- Casual and conversational. Write the way you'd tell this to a friend over a drink, not in a newsletter.
- Profanity is allowed where it feels natural. Don't force it, don't sanitise it.
- Use slang where it fits: "mate", "buddy", "Jheeze", "clocked it", "yeah-good-yeah" — make it feel lived-in.
- Use names (Sofia, Giovanni, Nadia) when they're a named character. Use "mate" or "buddy" for unnamed friends.
- No em-dashes anywhere. Use comma, colon, or full stop.
- No triads of exactly three. Vary counts or restructure as a sentence.
- No "Here's the thing:". No "Most people don't realise". No "It's not X, it's Y".
- No awakening moments: never write "she realised", "it hit him", "suddenly he understood". Show the shift, don't name it.
- No moral in the final sentence. End on something small and real — a laugh, a silence, a quiet action.
- Open mid-scene. The reader should feel like they walked into something already happening.
- Be specific. Name the actual thing: "Porsche 911, white, red leather" not "expensive car". "To wake up on a Tuesday excited" not "something simpler".
- Bold the hardest-hitting line or key question using **text** markdown. Only one bold moment per paragraph max.
- One concept per paragraph arc. Don't crowd them.

LABEL MARKERS:
After the paragraph where each concept peaks, insert [[LABEL:Term]] on its own line — using the exact term from the list above.

ALSO RETURN a single "opener" sentence (plain text, max 20 words) the reader could actually say out loud to start this conversation tonight.

FORMAT — return ONLY valid JSON, no markdown fences:
{"story": "paragraph one text\n\n[[LABEL:Term One]]\n\nparagraph two text\n\n[[LABEL:Term Two]]\n\nparagraph three text\n\n[[LABEL:Term Three]]", "opener": "..."}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Anthropic API error (story):', err);
        return res.status(502).json({ error: 'Upstream API error.' });
      }

      const data = await response.json();
      const raw = data?.content?.[0]?.text || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!parsed.story) {
        return res.status(502).json({ error: 'Malformed story response.' });
      }

      return res.status(200).json({ story: parsed.story, opener: parsed.opener || '' });

    } catch (e) {
      console.error('cs-generate story error:', e);
      return res.status(500).json({ error: 'Internal server error.' });
    }
  }

  // ─── CONVERSATION STARTER MODE ─────────────────────────────────────────────
  const { concept, ctx } = body;
  if (!concept || !concept.term) {
    return res.status(400).json({ error: 'concept object with term is required.' });
  }

  const CTX_DESCRIPTIONS = {
    partner:   'intimate/romantic partner, relaxed home setting, emotional honesty OK',
    friend:    'close friend, casual, humour allowed, no hierarchy',
    colleague: 'peer at work, professional but warm, aware of office dynamics',
    meeting:   'group setting, you want to surface an insight without lecturing',
  };

  const systemPrompt = `You are a conversation coach helping ambitious people use ideas in real conversations. You write in a warm, direct, non-preachy voice — the tone of a smart friend, not a consultant. Output only valid JSON, no markdown, no preamble.`;

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

RULES:
- prompt: a genuine, natural question adapted for that specific relationship dynamic. Max 2 sentences. No em-dashes. Not textbook. Not therapy-speak.
- openers: exactly 2 verbatim sentences someone could say out loud to introduce this topic. Casual and natural — the way you'd actually bring it up. They should lead INTO the prompt.
- pitfall: one short, specific warning about what could go wrong in this context. Max 15 words. Be direct.

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
          model: 'claude-sonnet-4-6',
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
- prompt: a genuine, natural question adapted for that specific relationship dynamic. Max 2 sentences. No em-dashes.
- openers: exactly 2 verbatim sentences someone could say out loud to introduce this topic. Casual, natural, not textbook.
- pitfall: one short, specific warning about what could go wrong in that specific context. Max 15 words.

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
        model: 'claude-sonnet-4-6',
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
