// api/plain-batch.js
// Plain Rewrite Pass v2.0 — editorial quality pass on the `plain` field only,
// across existing concept cards. Built from a full-library audit of 636
// concepts (75% found violating the 200-char ceiling) and the canonical
// plain-style-guide.md.
//
// Unlike feynman-batch.js (v1.81, which rewrote term/hook/plain/analogy/
// prompt together), this tool ONLY rewrites plain. hook/analogy/prompt are
// sent as READ-ONLY CONTEXT so the model can check the all-fields
// non-repetition rule, but they are never modified or returned.
//
// POST body: { concepts: [{id,term,category,hook,plain,analogy,prompt}] }
// Returns: { result: [{id, changed, plain?}] }

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

  const prompt = `You are doing an editorial quality pass on the PLAIN FIELD ONLY for
EXISTING concept cards on Epistemic. You are NOT touching term, hook,
analogy, or prompt — those are provided as READ-ONLY CONTEXT so you can
check for cross-field repetition. Never return them. Never rewrite them.

For each concept: id, term, category, hook (context only), CURRENT PLAIN
(the field to evaluate), analogy (context only), prompt (context only).

Decide PASS (plain is already fully compliant — leave untouched) or
REWRITE (plain fails one or more rules below — return only the new plain).

═══════════════════════════════════════════
SKIP RULE — THE RETROACTIVE BAR (read first)
═══════════════════════════════════════════
PASS only if the CURRENT plain already satisfies EVERY rule below — not
just length and jargon (the bar used in earlier passes). A plain that is
short and jargon-free but repeats an image already used in analogy, or
drops an acronym's expansion, or reads like a dictionary entry, has NOT
passed. Based on a full-library audit, expect roughly 75-90% of concepts
to need a REWRITE under this bar — most existing plains were written
before these rules existed and will fail on length, repetition, or the
repeat-back test even if they look fine at a glance.

═══════════════════════════════════════════
THE JOB
═══════════════════════════════════════════
Plain makes the reader actually understand the mechanism — completely,
simply, never boring. Not feel something (hook's job). Not paint a vivid
scenario (analogy's job). Explain it so clearly a smart 12-year-old or a
fluent non-native English professional gets it instantly and remembers it.

═══════════════════════════════════════════
LENGTH — HARD RULES
═══════════════════════════════════════════
- Default: 2 sentences. Hard ceiling: 3 sentences / 200 characters / 40
  words.
- Exception: 300 characters / 50 words — ONLY when compression has
  genuinely been attempted twice and the mechanism structurally requires
  a specific number or fact to hold together. This is NOT a default
  fallback. If you reach for the exception, you must be able to show that
  a tighter version would lose the actual mechanism, not just lose color.
- Ceiling always wins over vividness. If reaching for a concrete image
  would push the plain over the word count, cut the image before cutting
  the mechanism.
- May run SHORTER than 2 sentences if one sentence already fully passes
  the mid-thought rule, the acronym-expansion rule (if relevant), and the
  repeat-back test below. A forced second sentence at that point is
  padding, not compliance — do not add one just to hit a default.

Good (BATNA — power, 1 sentence doing all three jobs):
"Best Alternative To a Negotiated Agreement — the deal you'd walk straight
into if this one fell apart. The stronger that backup, the more power you
hold in the room."

Bad (too long, dictionary voice — exactly what this pass exists to fix):
"Supernormal stimuli refers to an exaggerated version of a stimulus that
produces a stronger response than the original natural stimulus would.
This phenomenon occurs because our nervous systems evolved to respond to
certain cues in our natural environment, but when those cues are
artificially amplified, our evolved responses go into overdrive..."

═══════════════════════════════════════════
ZERO JARGON — STRIP ON SIGHT
═══════════════════════════════════════════
Unless the word IS the term itself: utilize, facilitate, phenomenon,
paradigm, cognitive, epistemological, heuristic, non-local, empirical,
nuanced, salient, synergy, leverage, framework (say "way of thinking"),
delineate (say "show"), elucidate (say "explain"), modality (say "way"),
instantiate (say "create"), tranche, desensitize, acclimation,
incremental. "Optimize" is fine — common enough to pass.

Also zero: hedging ("research suggests", "it is worth noting"), corporate
filler ("in today's fast-paced world"), motivational-poster energy
("a new era of", "game-changing", "everything shifted").

═══════════════════════════════════════════
STRUCTURE
═══════════════════════════════════════════
- Start mid-thought — never "X is when..." or "X refers to...".
- EXCEPTION: if the term is an acronym or a named term, its literal
  expansion must still appear somewhere in the field, just not as the
  opening clause. BATNA must still spell out "Best Alternative To a
  Negotiated Agreement" — mid-thought start does not mean omitting what
  an acronym stands for.
- Concrete, specific wording over abstract noun phrases — this is a WORD
  CHOICE rule, not a metaphor-building rule. Painting a vivid scenario is
  analogy's job. Plain's job is specific, literal language, not a
  standalone image or story.
  Abstract: "the hardwired instinct to form in-groups and treat
  out-groups with hostility"
  Concrete, still literal: "anyone in your group reads as safe, anyone
  outside it reads as a threat — an old survival circuit, not a
  conscious choice"
- When listing or ordering multiple items, give each item a short
  bracketed concrete example: "one that pays the bills (copywriting),
  one that lights you up (psychology), one that stretches you
  (philosophy)".
- NO SPECIFIC REAL-WORLD CLAIMS in plain: no dollar figures, no named
  individuals, no specific dates, no one-off statistics from a single
  source episode. Plain explains the generalizable mechanism only. If a
  specific claim is genuinely illustrative, it belongs in analogy (do
  not move it there yourself — just don't put it in plain). If it's only
  color, drop it.
- No em-dashes anywhere.

═══════════════════════════════════════════
ALL-FIELDS NON-REPETITION (critical — this is new vs older passes)
═══════════════════════════════════════════
No scenario, image, fact, or example in plain may repeat one already used
in hook, analogy, or prompt on this same card. Before finalizing plain,
read the hook/analogy/prompt context provided and actively check: does
plain reach for the same image, scenario, or fact any other field already
used? Even if the wording differs, if it's the same underlying example,
rewrite plain toward a different angle or detail.

Example failure: plain uses "a factory dumping waste in a river" and
analogy ALSO uses a river/pollution scenario. Same image twice — fails,
even with different phrasing. Find a different concrete angle for plain.

═══════════════════════════════════════════
THE REPEAT-BACK TEST (the real quality gate)
═══════════════════════════════════════════
After drafting, cover the card and ask: could the reader, five minutes
later, explain the actual MECHANISM — not just recall a phrase or image?
If they could only repeat back an image but not the logic it was supposed
to carry, the image was decorative, not load-bearing. Fail and rewrite.
This single test replaces any "say it to a friend" or "sounds human"
heuristic from older passes — use this one, specifically.

═══════════════════════════════════════════
HARD BANS
═══════════════════════════════════════════
- "It's not X, it's Y" constructions
- "While X might seem true, Y is actually..."
- "Most people don't realize..." / "It's important to note..."
- Triads of exactly three ("fast, reliable, and efficient") — vary the
  count, or convert the list into a sentence
- Sentences all roughly the same length — mix short punchy ones with
  longer ones
- Rhetorical-question-then-answer pattern ("Why isn't X celebrated?
  Because Y.")
- "It's X: by the time Y, Z" colon-explainer constructions

═══════════════════════════════════════════
DENSE / FACT-HEAVY CONCEPTS
═══════════════════════════════════════════
Some concepts (often recent episode-sourced batches) are loaded with
specific facts that can't fit even at the 300-char exception without
losing real content. TRIM, DO NOT RELOCATE. Find the one mechanism or
fact the concept is actually about, state it cleanly, and cut the rest.
If the card genuinely cannot survive that cut without losing its point,
set "flagForReview": true on that entry instead of forcing a bad rewrite
— a human editor should look at whether the card itself is mis-scoped.

═══════════════════════════════════════════
THE BRACKETED TERM RULE
═══════════════════════════════════════════
When simplifying would lose a real, widely-used word worth knowing,
preserve it via bracketed clarification rather than dropping it: "(some
call this cognitive dissonance)". Max one per field. The sentence must
read fine if the bracket were deleted — it's a bonus, never load-bearing.

═══════════════════════════════════════════
INPUT
═══════════════════════════════════════════
CONCEPTS (id, term, category, hook [context], plain [field to evaluate],
analogy [context], prompt [context]):
${JSON.stringify(concepts)}

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════
Return ONLY a valid JSON array, input order, no preamble, no markdown
fences, no trailing commas.

For changed:false — omit the plain field entirely.
For changed:true — include ONLY "plain" (the new value). Never include
term, hook, analogy, or prompt in the output, even if you considered
changing them — that is out of scope for this pass.
For a card you believe is mis-scoped and cannot be fixed by trimming
alone, set "flagForReview": true alongside changed:false.

[{"id":1,"changed":false},
 {"id":2,"changed":true,"plain":"..."},
 {"id":3,"changed":false,"flagForReview":true}]`;

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

    // Validate and normalize each entry. Plain-only: strip any other field
    // the model might have accidentally included (defense in depth — the
    // prompt says plain-only, but never trust model output blindly).
    const inputIds = new Set(concepts.map(c => c.id));
    const normalized = [];
    for (const item of result) {
      if (typeof item.id !== 'number' || !inputIds.has(item.id)) continue;
      const changed = item.changed === true;
      const entry = { id: item.id, changed: changed };
      if (item.flagForReview === true) entry.flagForReview = true;
      if (changed) {
        if (typeof item.plain === 'string' && item.plain.trim().length > 0) {
          entry.plain = item.plain;
        }
        // If "changed:true" but no plain text actually included, treat as no-op
        if (!entry.plain) {
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
