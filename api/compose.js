// /api/compose.js — v3.64 (V3 Write → Compose, phase 7)
// New endpoint per docs/v3-architecture.md §7.5. Deliberately NOT added to
// cs-generate.js — that file already carries four modes plus a legacy path
// in 461 lines and is called out in the architecture doc as the highest-
// risk file in the repo to touch.
//
// Env var required: ANTHROPIC_API_KEY
// POST body: { mode, format, concepts[], captures[], words[], voice{},
//              userText, boardName }
// See docs/v3-architecture.md §7.5 for the full contract and
// docs/ai-voice.md for the prompt layers this assembles.
//
// SYNC NOTE (from docs/ai-voice.md): HOUSE_VOICE below is mirrored
// verbatim from ai-voice.md §2. If you edit one, edit the other in the
// same commit — there is no build step that catches drift.
//
// RATE LIMITING — READ BEFORE DEPLOYING PUBLICLY.
// The in-memory counter below is a best-effort, single-instance limiter
// only: it resets on every cold start and is not shared across concurrent
// Vercel instances, so it does NOT provide the real protection §14.4
// calls "non-negotiable for a pre-revenue product with a public
// endpoint." A real limit needs a persistent store (Vercel KV or
// equivalent) that does not exist in this project yet and requires
// provisioning + a decision outside the scope of this build pass. Ship
// this endpoint behind that real limiter, and behind an Anthropic
// account spend alert, before it is reachable from production traffic.

const HOUSE_VOICE = `You are the writing intelligence inside Epistemic, a learning product that turns
podcast ideas into concepts people can actually use in conversation.

WHO YOU ARE WRITING FOR
An ambitious professional, 25-40, often a non-native English speaker. They are
smart. They understand ideas quickly. Their problem is not comprehension - it is
deployment: having the idea available, in their own words, at the moment it
matters. Never condescend. Never over-explain. Never assume they have heard the
term before.

WHAT YOU ARE DOING
You help them turn a concept they have read into words they own. You are not a
content generator. You are not a ghostwriter. You sharpen the user's own
thinking. If the user has not supplied thinking of their own, say so and stop.

VOICE
- Short sentences. Vary the length, but default short.
- Concrete over abstract. A named, specific example beats a category of example.
  "Your inbox at 11pm" beats "modern communication habits."
- One idea per paragraph. If a paragraph has two ideas, it has one too many.
- Illuminate, do not declare. "Here is how I think about it," never "here are the
  five steps to."
- Epistemic humility is in the name. If something is contested or uncertain, say
  so in the same sentence. Confidence is fine; false certainty is not.
- Write in the user's voice, not yours. You have no personality to express.

MECHANICS
- No em-dashes. Use a comma, a colon, or a full stop.
- No semicolons.
- No rhetorical question as an opening line.
- No emoji, unless the user's voice profile explicitly permits them.
- No hashtags, ever.
- No numbered listicles unless the user picked a format that requires one.
- Straight quotes only. Never curly quotes or typographic apostrophes.
- No headings inside short-form output.

BANNED STRINGS (never output these, in any casing)
unlock, leverage (as a verb), game-changer, deep dive, needle-mover, 10x,
hot take, at the end of the day, In today's fast-paced world, Here's the thing,
Let that sink in, The truth is, Most people don't realize, a thread, buckle up,
I'll say it louder for the people in the back.

ATTRIBUTION
When you build on a concept the user saved, the idea belongs to its source. Never
present a borrowed idea as the user's original insight. The interface shows the
sources; your text must not contradict that by claiming ownership.

FAILURE MODE
The single worst thing you can produce is fluent, confident, forgettable text
that sounds like every other AI. If a sentence could appear in any other
product's output, delete it.`;

function maxTokensFor(mode) {
  if (mode === 'draft') return 700;
  return 250;
}

function renderVoiceDials(voice) {
  if (!voice) return '';
  var lines = [];
  var register = { formal: 'Register: formal.', neutral: 'Register: neutral.', casual: 'Register: casual. Contractions welcome. Write as you would to a peer.' };
  var stance = { observational: 'Stance: observational.', personal: 'Stance: personal. Use I. Anchor claims in the writer\'s own experience.' };
  var edge = { warm: 'Edge: warm.', direct: 'Edge: direct.', sharp: 'Edge: sharp. State the cost of being wrong. Do not soften the ending.' };
  var length = { short: 'Rhythm: short.', mixed: 'Rhythm: mixed. Alternate 6-word and 20-word sentences.', flowing: 'Rhythm: flowing.' };
  var humour = { off: 'Humour: off.', dry: 'Humour: dry. Understatement only. Never a punchline.', on: 'Humour: on.' };
  if (voice.register && register[voice.register]) lines.push(register[voice.register]);
  if (voice.stance && stance[voice.stance]) lines.push(stance[voice.stance]);
  if (voice.edge && edge[voice.edge]) lines.push(edge[voice.edge]);
  if (voice.length && length[voice.length]) lines.push(length[voice.length]);
  if (voice.humour && humour[voice.humour]) lines.push(humour[voice.humour]);
  if (voice.firstLanguage) {
    lines.push(`The writer's first language is ${voice.firstLanguage}. Avoid idioms, phrasal verbs and cultural references that would not survive translation into ${voice.firstLanguage}. Prefer constructions the writer could produce unaided. If a word is precise but the writer would be unlikely to reach for it in speech, choose the one they would. The goal is text they can say out loud in a meeting without rehearsing it.`);
  }
  if (voice.fingerprint) lines.push('Style profile: ' + voice.fingerprint);
  return lines.join('\n');
}

function renderGrounding(concepts, captures, words) {
  var blocks = [];
  (concepts || []).slice(0, 3).forEach(function (c) {
    blocks.push(`CONCEPT ${c.id} - ${c.term} [${c.category}]\nHook: ${c.hook}\nPlain: ${c.plain}\nAnalogy: ${c.analogy || ''}\nPrompt: ${c.prompt || ''}`);
  });
  (captures || []).slice(0, 5).forEach(function (cap) {
    blocks.push(`THE WRITER'S OWN WORDS (this is the seed - build on it, do not replace it)\n${cap.text}`);
  });
  (words || []).slice(0, 8).forEach(function (w) {
    blocks.push(`WORDS THE WRITER IS LEARNING (use naturally if they fit; never force one in)\n${w.word} - ${w.definition}`);
  });
  return blocks.join('\n\n');
}

const TASK_INSTRUCTIONS = {
  note: 'Write a private journal entry, 80-150 words, in the writer\'s voice, working out what this concept means for them specifically. Not a summary. Thinking on paper. End mid-thought if that is honest. No conclusion required.',
  explain: 'Explain this concept the way the writer would explain it to a smart friend who has never heard the term. 100-180 words. Use one concrete example. If the writer\'s seed shows they misunderstood the mechanism, correct it in passing without pointing out that you are correcting it.',
  'talking-point': '60-100 words the writer could actually say out loud in a conversation, without rehearsing. Sayable, not readable: no clause stacking, no words they would stumble on. One idea. It should sound like a thought, not a quote.',
  email: '120-200 words for a small known audience. Lead with the point. No throat-clearing opener. No sign-off.',
  linkedin: '150-220 words. One idea, fully. First line earns the second, without being a hook-in-the-marketing-sense. No engagement bait. No question at the end asking for comments. No "Here\'s what I learned." If the writer\'s seed is thin, write less rather than padding.',
  thread: '5-7 posts, hard cap at 7. Each under 260 characters. Post 1 states the idea, not a promise of the idea. No "a thread", no numbering theatre, no final like-and-follow post. Each post must survive being read alone.'
};

const FEYNMAN_INSTRUCTION = `The learner explained a concept in their own words. Compare against the concept's
plain and analogy fields.

Return JSON only:
{ "verdict": "got-it" | "close" | "missed",
  "gotRight": ["..."], "missed": ["..."], "oneLineFix": "..." }

Grade the mechanism, not the vocabulary. A learner who explained it correctly in
simple words has got it. A learner who used the right jargon without the
mechanism has missed it. This distinction is the entire point of the exercise.
Be specific and kind. Never more than three items per array.`;

const CAPTION_INSTRUCTION = 'Name what this collection of concepts is actually about, in under 12 words. Not a list of the concepts. The thread running through them. Lowercase unless a proper noun.';

const VOICE_EXTRACT_INSTRUCTION = `Below are samples of one person's writing. Produce at most 120 words of specific,
observable style directives that would let another writer imitate them.

Rules:
- Describe habits, not impressions. "Opens with a one-line question, then answers
  it" is useful. "Engaging and conversational" is not.
- Include at least one thing they never do.
- Include their typical sentence length and paragraph length.
- Note punctuation habits, capitalisation habits, and whether they use lists.
- Do not evaluate the writing. Do not praise it. Do not suggest improvements.
- Output plain prose directives, no headings, no bullets, no preamble.`;

const PUBLIC_FORMATS = ['linkedin', 'thread'];
const MIN_SEED_WORDS = 40;

// ---- Best-effort, single-instance rate limit — see file header. ----
var _rateLimitBuckets = {};
function checkRateLimit(ip) {
  var now = Date.now();
  var bucket = _rateLimitBuckets[ip];
  if (!bucket || now - bucket.windowStart > 60 * 60 * 1000) {
    bucket = { windowStart: now, count: 0 };
    _rateLimitBuckets[ip] = bucket;
  }
  bucket.count++;
  return bucket.count <= 20; // 20/hour, matches §14.4's suggested figure
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY missing.' });
  }

  // Server-side input caps (§7.5, §14.4) — enforced regardless of what the
  // client sent, never trust the client for token budget.
  const bodySize = JSON.stringify(req.body || {}).length;
  if (bodySize > 8 * 1024) {
    return res.status(413).json({ error: 'Request body too large.' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }

  const { mode, format, concepts, captures, words, voice, userText, boardName } = req.body || {};
  const validModes = ['draft', 'voice-extract', 'voice-update', 'feynman-grade', 'caption'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: 'Invalid mode. Must be one of: ' + validModes.join(', ') });
  }
  if (concepts && concepts.length > 3) return res.status(400).json({ error: 'Max 3 concepts.' });
  if (captures && captures.length > 5) return res.status(400).json({ error: 'Max 5 captures.' });
  if (words && words.length > 8) return res.status(400).json({ error: 'Max 8 words.' });
  if (userText && userText.length > 4000) return res.status(400).json({ error: 'userText exceeds 4000 characters.' });

  try {
    let systemPrompt, userPrompt, maxTokens;

    if (mode === 'draft') {
      if ((!concepts || !concepts.length) && (!captures || !captures.length)) {
        // §7.6: Compose requires at least one source object. No
        // "write me a post about X" path with concepts alone unlinked
        // to the writer's own material.
        return res.status(400).json({ error: 'Compose requires at least one source (a concept or a capture).' });
      }
      if (PUBLIC_FORMATS.includes(format)) {
        const seedText = (captures || []).map(function (c) { return c.text; }).join(' ') + ' ' + (userText || '');
        const wordCount = seedText.trim().split(/\s+/).filter(Boolean).length;
        if (wordCount < MIN_SEED_WORDS) {
          return res.status(400).json({ error: `Public formats need a seed of at least ${MIN_SEED_WORDS} words — a capture, a practice answer, or text you write yourself. Compose rewrites your thinking; it does not invent it.` });
        }
      }
      const taskInstruction = TASK_INSTRUCTIONS[format];
      if (!taskInstruction) return res.status(400).json({ error: 'Invalid format for draft mode.' });
      // Assembly order per docs/ai-voice.md §4: Layer 1, then Layer 3
      // (grounding), then Layer 2 (voice), then the task instruction.
      systemPrompt = [HOUSE_VOICE, renderGrounding(concepts, captures, words), renderVoiceDials(voice), taskInstruction].filter(Boolean).join('\n\n');
      userPrompt = userText || 'Write the draft now.';
      maxTokens = maxTokensFor('draft');
    } else if (mode === 'voice-extract') {
      if (!userText) return res.status(400).json({ error: 'userText (writing samples) required.' });
      systemPrompt = HOUSE_VOICE + '\n\n' + VOICE_EXTRACT_INSTRUCTION;
      userPrompt = 'SAMPLES:\n' + userText;
      maxTokens = maxTokensFor('voice-extract');
    } else if (mode === 'voice-update') {
      if (!userText) return res.status(400).json({ error: 'userText required.' });
      systemPrompt = HOUSE_VOICE + '\n\nUpdate the existing style profile to account for what the writer changed. Keep what still holds, revise what the edit contradicts, and stay under 120 words. Describe habits, not impressions.';
      userPrompt = userText;
      maxTokens = maxTokensFor('voice-update');
    } else if (mode === 'feynman-grade') {
      if (!userText || !concepts || !concepts.length) return res.status(400).json({ error: 'userText and one concept required.' });
      systemPrompt = HOUSE_VOICE + '\n\n' + renderGrounding(concepts, null, null) + '\n\n' + FEYNMAN_INSTRUCTION;
      userPrompt = "LEARNER'S EXPLANATION:\n" + userText;
      maxTokens = maxTokensFor('feynman-grade');
    } else if (mode === 'caption') {
      if (!concepts || !concepts.length) return res.status(400).json({ error: 'concepts required for caption mode.' });
      systemPrompt = HOUSE_VOICE + '\n\n' + renderGrounding(concepts, null, null) + '\n\n' + CAPTION_INSTRUCTION;
      userPrompt = 'Board: ' + (boardName || 'Untitled');
      maxTokens = maxTokensFor('caption');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error (compose):', err);
      return res.status(502).json({ error: 'Upstream API error.' });
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text || '';

    if (mode === 'draft') {
      return res.status(200).json({
        body: raw.trim(),
        title: '',
        wordCount: raw.trim().split(/\s+/).filter(Boolean).length,
        sourceIds: (concepts || []).map(function (c) { return c.id; })
      });
    }
    if (mode === 'voice-extract' || mode === 'voice-update') {
      return res.status(200).json({ fingerprint: raw.trim() });
    }
    if (mode === 'feynman-grade') {
      const clean = raw.replace(/```json|```/g, '').trim();
      try {
        return res.status(200).json(JSON.parse(clean));
      } catch (e) {
        return res.status(502).json({ error: 'Malformed grading response.' });
      }
    }
    if (mode === 'caption') {
      return res.status(200).json({ caption: raw.trim() });
    }
  } catch (e) {
    console.error('compose error:', e);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
