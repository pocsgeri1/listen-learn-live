// api/feynman-batch.js
// Feynman Rewrite Pass v1.81 — editorial quality pass on existing concept cards.
// POST body: { concepts: [{id,term,category,hook,plain,analogy,prompt}] }
// Returns: { result: [{id, changed, term?, hook?, plain?, analogy?, prompt?}] }

export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY missing' });

  const { concepts } = req.body || {};
  if (!Array.isArray(concepts)) {
    return res.status(400).json({ error: 'concepts array required' });
  }
  if (concepts.length === 0) {
    return res.status(200).json({ result: [] });
  }

  const prompt = `You are doing an editorial quality pass on EXISTING concept cards for
Epistemic, NOT extracting new ones.

For each concept: id, term, category, current hook, plain, analogy, prompt.

Decide PASS (no change) or REWRITE (only failing fields, in scope: term,
hook, plain, analogy, prompt).

═══════════════════════════════════════════
PASS BAR — READ FIRST
═══════════════════════════════════════════
PASS requires the field to be genuinely sharp, sticky, and something you'd
say out loud to a smart friend over coffee, NOT just mechanically
rule-compliant. A field with zero banned words/patterns and correct word
count can STILL be REWRITE if it is bland, generic, textbook-sounding, or
forgettable. Target: most concepts (70-80%) will need at least one field
rewritten. Concepts written before v1.4 (roughly ids 1-200 across core/cw/
ah/dk batches) are the most likely to need full rewrites across all fields.

═══════════════════════════════════════════
TERM RULES (v2.0 — 2-5 words, with exceptions)
═══════════════════════════════════════════
Job: the term is the label someone says out loud in conversation. Must be
sayable, memorable, worth knowing.

EXEMPT FROM REWRITE (always PASS for term, regardless of length/pattern):
- Named/coined terms using a person's name: "Hume's Guillotine",
  "Dunning-Kruger Effect", "Maslow's Hierarchy"
- Universal/evergreen coined terms that keep their original name regardless
  of word count
- Real, citable, exotic-sounding vocabulary (Hormesis, Motte and Bailey,
  Bikeshedding) — these are PRESERVED, not simplified. Novelty is part of
  the value; don't flag an exotic-but-real word just for being unfamiliar.

ALLOWED PATTERNS (do not flag these as needing rewrite):
- "X vs Y" / "x > y" / "x → y" symbol constructions, but ONLY if both
  nouns are independently teachable: "Signal vs Noise" (yes), "Good vs Bad
  Advice" (no — not specific enough as a pair)
- Hyphenated compound nouns: "Trade-Off", "Fat-Tailed Marketing",
  "Third-of-Life Tax"
- Step sequences using ➜ where it TRULY clarifies a process or transition
  (use sparingly, only when the term IS fundamentally about a sequence or
  shift, e.g. "Effort ➜ Outcome Gap" — do not force this onto terms that
  aren't inherently sequential)
- "X = Y" equation-style terms ARE POSSIBLE but treat as an EXCEPTION, not
  a default rewrite target. Only use if the equation is genuinely sticky
  and not just a vague aphorism in disguise ("Success = Mindset" would
  FAIL this bar; something with two concrete, specific halves could pass).
  Flag any "X = Y" rewrite for human review rather than treating it as
  automatically correct.
- DUPLICATE TERMS ACROSS THE LIBRARY ARE ALLOWED — do not avoid a strong
  term because it might resemble another concept's term
- "X as/of/over/through Y" is DEFAULT SUSPICION, not automatic rewrite.
  Test: remove the connector — do the two halves independently mean
  something? If yes, it can PASS (e.g. "Brands as Insurance", "Hardware
  as a Service" — real industry term). If no, it's a REWRITE TRIGGER
  (e.g. "Creativity as Local Maximum Escape" should become something like
  "Local Maximum Trap").

REWRITE TRIGGERS for term:
- "X of Y" / "X as Y" pattern that FAILS the independent-meaning test
  above (e.g. "Soft Bigotry of Male Expectations", "Catastrophe as
  Certainty Drug", "Declassification as Rolling Process")
- "X (qualifier)" parenthetical that is NOT a natural part of the term
  itself, e.g. "Meritocracy (myth of)" — REWRITE.
  Note: parentheticals/hyphens that ARE the term's natural written form are
  fine ("Trade-Off", "Fat-Tailed Marketing", "Third-of-Life Tax" are NOT
  parentheticals in the problematic sense and are always fine; this rule is
  about explanatory asides bolted onto an otherwise normal term, like
  "(myth of)" or "(stop scrolling!)")
- Academic/paper-title phrasing — reads like a paper section header,
  nobody would say it at dinner
- Over 5 words, unless covered by an exception above

NO OVERLAP WITH HOOK — check explicitly, side by side, every time:
- The term must not repeat 2+ content words from the hook, or restate the
  hook's own angle/structure in different words
- This is the single most common mistake in past rewrite passes — a term
  can "sound different" while still just paraphrasing the hook's exact
  framing
- Process: read the hook and the term side by side. If they're answering
  the same question from the same angle, pull the term from a different
  part of the concept (mechanism, consequence, contrast, example)
- Real, established vocabulary is exempt from this check IF the
  established term is simply how the concept is known — preserving real
  vocabulary takes priority over avoiding overlap in that specific case

NEW TERM REQUIREMENTS:
- 2-5 words (try to land on 2-3 where possible)
- "Say it at dinner" test: a real phrase someone would use in conversation
- Reverse-test: could someone guess the rough domain/topic from the term
  alone?
- Concrete words over abstract Latinate ones — UNLESS the Latinate word is
  itself real, citable, and "impressive to know" (see exempt list above)
- Specificity/mechanism beats category label: "Three Prices, One Decoy"
  over "Good, Better, Best"
- GLOBAL ACCESSIBILITY CHECK: would a fluent non-native English speaker
  (expat professional) be able to SAY this term out loud in a meeting
  without stumbling on pronunciation? This tests sayability/circulation,
  NOT intuitive obviousness — a real, exotic-sounding word can still pass.
  Avoid regionally-specific idioms (e.g. UK-only medical/cultural
  imagery). Prefer phrases recognized globally.

IF IT ISN'T BROKEN, DON'T FIX IT:
- Don't rewrite a term just because a rule technically allows a rewrite.
  Only rewrite genuine blandness — if the term already reads as specific,
  concrete, and sticky, leave it alone even if some rule above could
  technically apply.

PRESERVING REAL VOCABULARY (when the original term is a widely-known real
word the reader benefits from learning, e.g. "Meritocracy", "Virtue
Signaling", "Sunk Cost"):
- Do not discard the underlying idea just because the term itself needs
  rewriting
- Rename the term per the rules above, then preserve the original word
  inside "plain" via the Bracketed Term Rule below

═══════════════════════════════════════════
BRACKETED TERM RULE
═══════════════════════════════════════════
When simplifying a field would lose a real, widely-used word worth knowing,
preserve it as an italicized aside rather than dropping it.

Rotate connector phrasing across the batch — never repeat the same connector
twice within one batch:
  (this is called X) / (i.e., X) / (also known as X) /
  (the technical term: X) / (some call this X) / (this has a name: X)

Rules:
- Max ONE bracketed term per field
- Only for terms the reader is LIKELY to encounter again (news, books,
  conversation) — not invented jargon
- The sentence must read completely fine if the bracket were deleted —
  bracket is a bonus, never load-bearing

═══════════════════════════════════════════
HOOK RULES (v2.0 — 8-12 words target, 14 hard ceiling)
═══════════════════════════════════════════
Job: make the reader feel something before they understand anything. Test:
would a sharp person screenshot this without the card?

VOICE BLEND (weighted):
- Primary: Dan Koe — names the internal trap the reader is living in
- Secondary, equal weight: Hormozi (blunt cost) + Naval (compression/paradox)
- Seasoning only: Sahil Bloom (stakes) / Esther Perel (subtext)
- Category steers which lever leads: business/power → Hormozi; psychology/
  identity → Koe; philosophy/science → Naval; society/finance → hidden-
  incentive (Sutherland); relationships/language → unspoken dynamic
  (Perel); thinking/creativity/health/tech-ai → plain clarity, no seasoning.
- This is a ROTATION, not a single register. Do not default every hook to
  the same lever — that collapses the whole point of the voice blend.

FORMAT: target 8-12 words, hard ceiling 14 (do not lean on old 15-16 word
exceptions). One sentence preferred. Two clauses only if clause 2
reframes, inverts, or punches — never if it just continues clause 1.

GENERATION/REVIEW SEQUENCE — apply in this order:
1. Front-load the trigger word — the specific/surprising/identity-relevant
   noun lands in the first 3 words, not the last 3.
   Weak: "People rarely notice this, but their comfort zone is actually a
   cage." Fixed: "Your comfort zone stopped being comfortable years ago."
2. One dominant lever only (identity-relevance / cost-of-inaction /
   compression-paradox / subtext-reveal). Cut anything not serving it.
3. Specific noun/number/scenario before any intensifier.
   Weak: "This happens way more often than people think." Fixed: "This
   happened in your last performance review and you didn't clock it."
4. EVERYDAY LANGUAGE CHECK: every word must be something an expat
   professional or a 12-year-old would instantly understand. No academic
   register, no native-only idioms ("lost the plot," "fires" as
   instinct-verb). This applies ONLY to hook/plain/analogy/prompt — never
   to term.
5. NO-OVERLAP CHECK: cover the hook, read plain's first sentence. If the
   hook doesn't add a new angle, rewrite.

PATTERN MENU (ranked — pattern 1 should be the most common choice,
rotate the rest):
1. Hyper-specific over abstract (highest hit rate, default choice)
2. Funny/sarcastic + concrete visual (sarcasm always paired with a
   specific image, never alone)
3. Blunt one-line verdict
4. Relatable self-recognition ("oh no, that's me")
5. Reversal / frame flip
6. Metaphor that unlocks a hard/Latin term

BATCH-LEVEL TONE BALANCE: aim ~60% straight/specific/blunt (patterns 1,
3, 6), ~40% funny/twisted/surprising (patterns 2, 4, 5) across a batch.
Let each concept self-select its natural fit — don't force a tone onto a
bad fit. Check the ratio after drafting, not per-card.

Questions allowed: "What if your confidence is just ignorance?"
"You" allowed sparingly, only when it adds punch.
NO fancy vocabulary — clean, punchy, direct.
NO em-dashes anywhere — use period, comma, or colon.

NO GENERIC OPENERS:
"This concept is about...", "It's important to...", "Many people...",
"It's common to...", "We often...", "Studies show..."

HARD BANS (AI-slop tells):
- "You're not X, you're Y" / "It's not X, it's Y" — banned even when it
  sounds good; if a draft naturally falls into this shape, rewrite the
  clause structure entirely, don't just swap words
- "While X might seem right, Y is actually..."
- "Sure, X works. But Y is where the real..."
- Mid-sentence question trick: "The answer? Simpler than you think."
- "Most people don't realize..."
- "Here's the thing:"
- "Game-changing", "a new era of", "everything shifted"
- -ing verb opener with no subject: "Confusing busy with results."
- Motivational poster cadence: "Small things compound into big things."
- Triads of exactly three
- Academic register — if it sounds like a textbook, it failed
- Sarcasm/negativity as the BATCH DEFAULT — fine as rotation per the tone
  balance above, never the dominant register across a batch

CRITICAL — HOOK vs PLAIN OVERLAP:
Hook must NOT say nearly the same thing as plain's first sentence. If they
would overlap, plain's first sentence must open from a different angle
(mechanism, consequence, specific example, "here's why").

GLOBAL ACCESSIBILITY CHECK applies here too (see Term Rules above) — the
hook must land for a fluent non-native English speaker AND a 12-year-old,
not just a native adult reader.

═══════════════════════════════════════════
PLAIN RULES
═══════════════════════════════════════════
Default: 2 sentences. Absolute ceiling: 3 sentences / 200 chars / 40 words.
EXCEPTION for genuinely complex philosophy/science concepts that cannot be
compressed further: up to 4 sentences / 300 chars / 60 words.

WORDS TO STRIP ON SIGHT (replace with plain alternatives):
utilize, facilitate, phenomenon, paradigm, cognitive, epistemological,
heuristic (unless that IS the term), non-local, empirical, nuanced,
salient, synergy, leverage (unless that IS the term), framework (say "way
of thinking"), delineate (say "show"), elucidate (say "explain"), modality
(say "way"), instantiate (say "create"), tranche, desensitize, acclimation,
incremental.
"Optimize" is fine, common enough.

ZERO:
- Hedging: "research suggests", "it is worth noting", "some researchers
  argue", "one might argue"
- Corporate filler: "in today's fast-paced world", "at the end of the day"
- Motivational-poster energy: "a new era of", "game-changing", "everything
  shifted"

STRUCTURE:
- Start mid-thought, NEVER with the term name ("Leverage is when..." is
  banned)
- Explain what the concept IS, not what it "relates to" or "involves"
- Sound human: write it the way you'd explain it to a friend who just
  asked "wait, what does that mean?"
- No em-dashes anywhere
- No triads of exactly three ("fast, reliable, and efficient") — vary
  counts, or convert lists into a sentence
- Vary sentence lengths — mix short punchy ones with longer ones, don't
  make every sentence the same rhythm
- No rhetorical-question-then-answer pattern ("Why isn't X celebrated?
  Because Y.")
- No "It's X: by the time Y, Z" colon-explainer constructions
- BANNED: "It's not X, it's Y" / "While X might seem true, Y is actually..."
  / "Most people don't realize..." / "It's important to note..."

"WOULD YOU REPEAT THIS TO A FRIEND?" TEST:
If it sounds like a dictionary entry or Wikipedia intro, REWRITE even if
technically compliant with length/banned-word rules.

Must open from a different angle than the hook (see Hook Rules).
Bracketed Term Rule applies here most often.
GLOBAL ACCESSIBILITY CHECK applies here too.

═══════════════════════════════════════════
ANALOGY RULES (1-2 sentences)
═══════════════════════════════════════════
Concrete, specific, vivid. Must be picturable.
Must pass the 12-year-old test: no abstraction, no jargon.
Famous-person references allowed: "Like when Federer misses an easy shot
because he's thinking about the last point."
No em-dashes.

DO NOT USE:
- "It's like a machine that...", "Think of it as a process...", "Imagine
  a system where..."
- "It's not X, it's Y" / "Sure, X works, but Y is the real..."

"Imagine..." is allowed occasionally, but not as the opener for 3+
analogies within one batch — vary openers across the batch.

AVOID forced triads of exactly three sequential steps inside an analogy
("first X, then Y, then Z") — if a sequence is needed, use 2 beats or
restructure as a flowing narrative rather than a 3-item list.

PASS BAR: a grammatically valid but generic scenario ("It's like how two
people might disagree about something") FAILS even with no banned patterns
— must be SPECIFIC enough to actually picture (a doctor who smokes, a
mansion owner banning AC, a pianist praised for guitar).

GLOBAL ACCESSIBILITY CHECK applies here too.

═══════════════════════════════════════════
PROMPT RULES — the most-failed field, treat with most care
═══════════════════════════════════════════

THE REVERSE TEST (primary rewrite trigger, overrides everything else):
Strip the term, show only the prompt. Could a reader guess which concept
this came from? If NO, REWRITE regardless of word count, em-dashes, or any
other check passing.

CHOOSE THE RIGHT TYPE (re-typing IS in scope if current type is mismatched
for the category — this is a legitimate rewrite reason on its own):

TYPE A — REFLECTION (most common)
  Use for: psychology, identity, relationships, philosophy, health
  Forces the user to surface a specific memory, person, or situation.
  Example: "Name the last time your ego cost you something. What would you
  do differently with two more minutes of pause?"

TYPE B — SCENARIO / ACTION
  Use for: business, power, language, thinking (tactical/behavioral)
  Puts the user in a specific situation, asks what they'd do or say.
  Example: "You have 48 hours to test whether demand exists for your idea
  before spending a cent on building it. What's the test?"

TYPE C — CONVERSATION STARTER
  Use for: relationships, language, society, power (social/shareable)
  Gives the user a specific line or question they could use tonight.
  Example: "Next time someone confidently explains something you disagree
  with, try: 'What would have to be true for that to be wrong?' See what
  happens."

TYPE D — CHALLENGE / PROVOCATION
  Use for: society, thinking, philosophy, tech-ai (counterintuitive/
  contrarian)
  Challenges the user to test or confront the concept directly.
  Example: "Write down the three most confident opinions you hold about
  people who are different from you. Now ask: have you actually spent time
  with them?"

TYPE E — OBSERVATION
  Use for: science, society, systems-level, tech-ai (where self-reflection
  doesn't fit)
  Directs attention outward, observe/notice/spot a pattern in the world.
  Example: "In the next 48 hours, notice when someone uses complexity to
  avoid a direct answer. Count how many times it happens."

RULES THAT APPLY TO ALL TYPES:
1. FORCES SPECIFICITY: a specific person, decision, moment, resource,
   sentence, or time window. Never "an area of your life" or "a situation."
2. CONCEPT-SPECIFIC (see Reverse Test above)
3. PERMISSION-GIVING / DIAGNOSTIC LANGUAGE: lower the bar for action.
   "Smallest, ugliest version" beats "minimum viable approach." "What would
   the conversation actually sound like" beats "consider having the
   conversation."
4. ANSWERABLE IN UNDER 2 MINUTES — no "write a 10-year plan" prompts
5. NEVER OPEN WITH: "Have you ever...", "Think about how this applies...",
   "Reflect on...", "Consider the role of..."
   ALSO CAP: "Where in your life are you..." — heavily overused across the
   existing 636, allow at most 1 per batch
6. NO TEMPLATE OVERUSE: no more than 3 prompts per batch may begin with the
   same first 4 words
7. No em-dashes — use commas
8. GLOBAL ACCESSIBILITY CHECK applies here too

ANTI-PATTERNS — REJECT AND REWRITE IF PROMPT:
- Structure "In your most important X, are you A or B?"
- Could fit 3+ different concepts (swappable-prompt failure)
- Restates the concept's definition instead of applying it
- Asks user to "think about" something without forcing a concrete answer
- Ends with "...would serve you better?" or similar generic closer
- Borrows generic thinking-tropes ("10 years on repeat", "if a friend asked
  you...") UNLESS the concept genuinely IS about that trope

═══════════════════════════════════════════
GLOBAL BANS (any field, no exceptions)
═══════════════════════════════════════════
- Em-dashes (—) anywhere, in any field. Use period, comma, colon, or
  semicolon instead.
- "You're not X, you're Y" / "It's not X, it's Y"
- "While X might seem..., Y is actually..."
- "Most people don't realize..."
- "Here's the thing:"
- Triads of exactly three
- Unearned profundity: "game-changing", "a new era of", "everything
  shifted"
- Hook/Plain first-sentence redundancy (see Hook Rules)

═══════════════════════════════════════════
TOPICAL/POLITICAL CONTENT CARVE-OUT (addition to PRESERVE FROM SOURCE)
═══════════════════════════════════════════
PRESERVE FROM SOURCE still applies by default (see below). EXCEPTION: if
the source material's specific examples are tied to a current political
figure, administration, or actively-developing news story (e.g. a sitting
president's specific policy), and that specificity:
  (a) dates the card, or
  (b) makes a universal concept feel partisan, or
  (c) adds no teaching value beyond a generic version of the same example
...then REPLACE the topical specifics with a generic or evergreen version
of the same mechanism. The underlying CONCEPT and its category stay the
same; only the dated/political illustrative wrapper is swapped for a
timeless, non-partisan version.
Non-political specific examples (named studies, books, historical events,
non-controversial named people, brand names, etc.) are still preserved as
normal.

═══════════════════════════════════════════
CATEGORY VOICE SEASONING — light touch, rules always win, ROTATE within
batch (no two cards in the same category use the same angle in one batch)
═══════════════════════════════════════════

business, power → Alex Hormozi instinct, rotate:
  (a) blunt math/numbers framing
  (b) "here's what's actually happening behind the scenes"
  (c) cost/tradeoff framing
  (d) direct cause-and-effect

psychology, identity → Dan Koe instinct, rotate:
  (a) "notice when YOU do this"
  (b) "here's the story your brain tells you"
  (c) "this happens without you realizing"
  (d) name the internal conflict directly

philosophy, science → Naval Ravikant instinct, rotate:
  (a) one-clean-idea-per-sentence compression
  (b) "strip away the fancy language and it's just..."
  (c) paradox framing

society, finance → Rory Sutherland instinct, rotate:
  (a) hidden incentive reveal
  (b) "people SAY X, but really Y" (without the banned "it's not X it's Y"
      phrasing)
  (c) zoom out to system-level pattern

relationships, language → Esther Perel instinct, rotate:
  (a) "here's what's happening underneath the conversation"
  (b) name the unspoken dynamic directly
  (c) reframe from the other person's perspective

thinking, creativity, health, tech-ai → no personality seasoning, plain
Feynman voice only. tech-ai analogies must ALSO pass the 15-year-old test:
zero technical background required to follow.

RULE: rules above always override seasoning. Within one batch, no two cards
in the same category use the same rotating angle.

═══════════════════════════════════════════
PRESERVE FROM SOURCE
═══════════════════════════════════════════
Keep specific podcast examples, named people, named products, specific
studies, or distinctive phrases that trace back to the original source
material. Do not genericize real examples away for the sake of
simplification. (See TOPICAL/POLITICAL CARVE-OUT above for the one
exception.)

═══════════════════════════════════════════
INPUT
═══════════════════════════════════════════
CONCEPTS (id, term, category, hook, plain, analogy, prompt):
${JSON.stringify(concepts)}

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════
Return ONLY a valid JSON array, input order, no preamble, no markdown
fences, no trailing commas.

For changed:false — omit all text fields.
For changed:true — include ONLY the fields actually rewritten (term, hook,
plain, analogy, prompt — any subset).

[{"id":1,"changed":false},
 {"id":2,"changed":true,"plain":"...","prompt":"..."}]`;

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
        max_tokens: 8000,
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
    const ALLOWED_FIELDS = ['term', 'hook', 'plain', 'analogy', 'prompt'];
    const normalized = [];
    for (const item of result) {
      if (typeof item.id !== 'number' || !inputIds.has(item.id)) continue;
      const changed = item.changed === true;
      const entry = { id: item.id, changed: changed };
      if (changed) {
        for (const field of ALLOWED_FIELDS) {
          if (typeof item[field] === 'string' && item[field].trim().length > 0) {
            entry[field] = item[field];
          }
        }
        // If "changed:true" but nothing actually included, treat as no-op
        if (Object.keys(entry).length === 2) {
          entry.changed = false;
        }
      }
      normalized.push(entry);
    }

    // Ensure every input concept has an output entry (fill missing with PASS)
    const resultMap = new Map(normalized.map(r => [r.id, r]));
    const finalResult = concepts.map(c =>
      resultMap.has(c.id) ? resultMap.get(c.id) : { id: c.id, changed: false }
    );

    return res.status(200).json({ result: finalResult });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
