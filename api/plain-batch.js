// api/plain-batch.js
// Plain Rewrite Pass v2.1 — editorial quality pass on the `plain` field only,
// across existing concept cards. Built from a full-library audit of 636
// concepts (75% found violating the 200-char ceiling) and the canonical
// plain-style-guide.md.
//
// v2.1 fixes a real failure found in v2.0's first live batch: the model
// defaulted to PASS or made trivial synonym-swap edits instead of genuine
// rewrites. Root cause was an evaluate-then-patch prompt structure, which
// biases toward minimal diffs. v2.1 forces a draft-fresh-first sequence,
// adds the full anti-AI-slop ban list (ported from hook-style-guide.md and
// feynman-batch.js, previously incomplete here), and embeds five strong
// before/after examples at the magnitude of change actually expected.
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

═══════════════════════════════════════════
MANDATORY PROCESS — DRAFT FRESH FIRST, THEN COMPARE
═══════════════════════════════════════════
Do NOT edit the existing plain. Editing the old sentence biases you toward
small, safe, synonym-swap changes — exactly the failure this pass exists
to fix. Instead, for every single concept:

1. Cover your eyes to the current plain. Using only the term, category,
   and the read-only context fields, write a COMPLETELY FRESH plain from
   scratch — as if this concept had never been written before. Apply the
   concrete-image rule, the bracketed-example rule, and the repeat-back
   test from the start, not as a patch afterward.
2. ONLY AFTER drafting fresh, look at the current plain. Compare the two.
3. If your fresh draft is genuinely better — more concrete, more memorable,
   passes the repeat-back test more decisively — that fresh draft IS your
   REWRITE. Use it (cleaned up for the hard rules below), not a patched
   version of the old one.
4. PASS is RARE. A real PASS means: when you wrote your fresh draft, you
   ended up landing on essentially the same concrete image, length, and
   structure as the original — meaning the original was already doing the
   job. If your fresh draft and the original differ mainly in vocabulary
   choice but tell the exact same flat, abstract story, that is NOT a
   PASS — your fresh draft just wasn't good enough yet. Try again with a
   sharper concrete image before settling.
5. Do not output a result that is a minor reword of the input (changed
   punctuation, swapped one clause order, replaced one word with a
   synonym). If your output and the input share more than half their
   sentence structure, you have not actually drafted fresh — start over.

═══════════════════════════════════════════
WHAT "GENUINELY BETTER" LOOKS LIKE — CALIBRATION EXAMPLES
═══════════════════════════════════════════
These show the actual MAGNITUDE of change expected. A real rewrite changes
the sentence's skeleton, not just its word choice.

EXAMPLE 1 — Compound Interest (finance)
OLD: "Earn returns on your initial investment, then earn returns on those
returns. The growth accelerates over time without extra effort from you."
GOOD REWRITE: "Your money earns a return. Then that return earns its own
return, and that return earns one too. A snowball rolling downhill, getting
bigger on its own without you pushing it."
(Notice: NO em-dash — use a period instead, as shown. The skeleton changed
from an abstract definition to a concrete chain-reaction image that still
fully explains the mechanism. This is the bar.)

EXAMPLE 2 — Tribalism (society)
OLD: "The instinct to form in-groups and view out-groups with suspicion or
hostility. It drives politics, sports fandom, nationalism, and office
politics, often without people realizing it."
GOOD REWRITE: "Your brain is running ancient software. Anyone in my group
is safe, anyone outside it is a threat. Politics, sports, office cliques:
all the same circuit, different jersey."
(Notice: the abstract noun phrase "the instinct to form in-groups" became
a concrete image, "ancient software," that still teaches the exact same
mechanism. A weak rewrite would have kept "the instinct to form in-groups"
and just reordered the sentence.)

EXAMPLE 3 — Externalities (society)
OLD: "When your actions have consequences for people who weren't part of
the decision. Companies privatize profits while externalizing costs onto
others constantly."
GOOD REWRITE: "A factory dumps waste in the river instead of paying to
clean it up. The cost didn't disappear, it just landed on someone
downstream who never agreed to pay it."
(Notice: this drops the abstract framing entirely and opens directly on a
concrete scene. The mechanism is still 100% intact and explained.)

EXAMPLE 4 — BATNA (power) — acronym exception in action
OLD: "Best Alternative To a Negotiated Agreement. The stronger your
fallback, the more power you hold. Always know yours before entering the
room."
GOOD REWRITE: "Best Alternative To a Negotiated Agreement: the deal you'd
walk straight into if this one fell apart. The stronger that backup, the
more power you hold in the room."
(Notice: the acronym's literal expansion is still present, required by the
rules below, but everything after it was rebuilt around a concrete image
of walking into a backup deal, instead of the abstract "your fallback.")

EXAMPLE 5 — Domain of Mastery (thinking) — bracketed-list-example rule
OLD: "A framework for building authority without niching down to one
boring topic. Choose three interests: one that makes money, one that
excites you, and one that develops you. The overlap becomes your unique
voice."
GOOD REWRITE: "Pick three things: one that pays the bills (copywriting),
one that lights you up (psychology), one that stretches you (philosophy).
Where all three overlap is a voice nobody else has."
(Notice: "framework" — a banned jargon word — is gone. Each list item now
has a short bracketed concrete example. The closing line replaced the
generic "becomes your unique voice" with something more specific.)

THE FAILURE MODE TO AVOID: a previous batch of this exact pass produced
results like changing "When someone excels in one visible area, we
unconsciously assume..." to "Someone excels in one visible area, and we
unconsciously assume..." — that is NOT a rewrite. That is punctuation
shuffling. If your output looks like that compared to the input, you have
failed this task. Go back to step 1 and draft something with an actually
different skeleton and a real concrete image.

═══════════════════════════════════════════
SKIP RULE — THE RETROACTIVE BAR
═══════════════════════════════════════════
Based on a full-library audit, expect the large majority of concepts —
likely 80%+ — to need a genuine REWRITE under this bar. Most existing
plains were written before these rules existed and are built on abstract
noun-phrase definitions rather than concrete images, even when they're
already within the length ceiling. Being short and jargon-free is not
enough to PASS; the plain must already contain a load-bearing concrete
image or scene, not just compliant wording.

═══════════════════════════════════════════
THE JOB
═══════════════════════════════════════════
Plain makes the reader actually understand the mechanism, completely,
simply, never boring. Not feel something (hook's job). Not paint a vivid
scenario on its own (analogy's job, which gets a full dedicated scenario).
Plain explains the mechanism through specific, concrete language so
clearly that a smart 12-year-old or a fluent non-native English
professional gets it instantly and remembers it.

═══════════════════════════════════════════
LENGTH — HARD RULES
═══════════════════════════════════════════
- Default: 2 sentences. Hard ceiling: 3 sentences / 200 characters / 40
  words.
- Exception: 300 characters / 50 words, ONLY when compression has
  genuinely been attempted twice and the mechanism structurally requires
  a specific number or fact to hold together. This is NOT a default
  fallback.
- Ceiling always wins over vividness. If reaching for a concrete image
  would push the plain over the word count, cut the image before cutting
  the mechanism.
- May run SHORTER than 2 sentences if one sentence already fully passes
  the mid-thought rule, the acronym-expansion rule (if relevant), and the
  repeat-back test. A forced second sentence at that point is padding.

═══════════════════════════════════════════
ZERO JARGON — STRIP ON SIGHT
═══════════════════════════════════════════
Unless the word IS the term itself: utilize, facilitate, phenomenon,
paradigm, cognitive, epistemological, heuristic, non-local, empirical,
nuanced, salient, synergy, leverage, framework (say "way of thinking"),
delineate (say "show"), elucidate (say "explain"), modality (say "way"),
instantiate (say "create"), tranche, desensitize, acclimation,
incremental. "Optimize" is fine, common enough to pass.

Also zero: hedging ("research suggests", "it is worth noting"), corporate
filler ("in today's fast-paced world"), motivational-poster energy
("a new era of", "game-changing", "everything shifted").

═══════════════════════════════════════════
STRUCTURE
═══════════════════════════════════════════
- Start mid-thought or mid-scene, never "X is when..." or "X refers
  to...".
- EXCEPTION: if the term is an acronym or a named term, its literal
  expansion must still appear somewhere in the field, just not as a dry
  opening clause. See BATNA example above.
- Concrete, specific wording and images over abstract noun phrases. This
  is the single most important lever in this pass. A plain built on an
  abstract noun phrase ("the instinct to...", "a framework for...", "the
  tendency to...") has very likely failed even if it's short and
  jargon-free.
- When listing or ordering multiple items, give each item a short
  bracketed concrete example.
- NO SPECIFIC REAL-WORLD CLAIMS in plain: no dollar figures, no named
  individuals, no specific dates, no one-off statistics from a single
  source episode. Plain explains the generalizable mechanism only. Do not
  move such claims into analogy yourself, just don't put them in plain.
- No em-dashes anywhere, under any circumstance. Use a period, comma, or
  colon instead. This is a hard ban with zero exceptions, including in
  the calibration examples above, which themselves avoid em-dashes.

═══════════════════════════════════════════
ALL-FIELDS NON-REPETITION (critical)
═══════════════════════════════════════════
No scenario, image, fact, or example in plain may repeat one already used
in hook, analogy, or prompt on this same card. Before finalizing, check
your fresh draft against the hook/analogy/prompt context: does it reach
for the same image, scenario, or fact any other field already used? Even
with different wording, if it's the same underlying example, rebuild
around a different concrete angle.

═══════════════════════════════════════════
THE REPEAT-BACK TEST (the real quality gate)
═══════════════════════════════════════════
After drafting, cover the card and ask: could the reader, five minutes
later, explain the actual MECHANISM, not just recall a phrase or image?
If they could only repeat back an image but not the logic it was supposed
to carry, the image was decorative, not load-bearing. Fail and rewrite.

═══════════════════════════════════════════
HARD BANS — AI-SLOP TELLS (full list, apply strictly)
═══════════════════════════════════════════
- Em-dashes (—), anywhere, ever
- "It's not X, it's Y" / "You're not X, you're Y" constructions, banned
  even when they sound good. If a draft naturally falls into this shape,
  rewrite the clause structure entirely, don't just swap words
- "While X might seem true, Y is actually..." / "While X might seem
  right, Y is actually..."
- "Sure, X works. But Y is where the real..."
- Mid-sentence question trick: "The answer? Simpler than you think."
- "Most people don't realize..." / "It's important to note..."
- "Here's the thing:"
- "Game-changing", "a new era of", "everything shifted"
- -ing verb opener with no subject: "Confusing busy with results."
  "Holding two views."
- Motivational poster cadence: "Small things compound into big things."
  "Tiny daily actions compound into massive results."
- Triads of exactly three ("fast, reliable, and efficient"), vary the
  count or convert the list into a sentence
- Sentences all roughly the same length, mix short punchy ones with
  longer ones
- Rhetorical-question-then-answer pattern ("Why isn't X celebrated?
  Because Y.")
- "It's X: by the time Y, Z" colon-explainer constructions
- Academic register, if it sounds like a textbook, it failed
- NO GENERIC OPENERS: "This concept is about...", "It's important
  to...", "Many people...", "It's common to...", "We often...", "Studies
  show..."

═══════════════════════════════════════════
DENSE / FACT-HEAVY CONCEPTS
═══════════════════════════════════════════
Some concepts are loaded with specific facts that can't fit even at the
300-char exception without losing real content. TRIM, DO NOT RELOCATE.
Find the one mechanism the concept is actually about, state it cleanly
with a concrete image, and cut the rest. If the card genuinely cannot
survive that cut without losing its point, set "flagForReview": true on
that entry instead of forcing a bad rewrite.

═══════════════════════════════════════════
THE BRACKETED TERM RULE
═══════════════════════════════════════════
When simplifying would lose a real, widely-used word worth knowing,
preserve it via bracketed clarification: "(some call this cognitive
dissonance)". Max one per field. The sentence must read fine if the
bracket were deleted, it's a bonus, never load-bearing.

═══════════════════════════════════════════
INPUT
═══════════════════════════════════════════
CONCEPTS (id, term, category, hook [context], plain [field to evaluate
and rewrite], analogy [context], prompt [context]):
${JSON.stringify(concepts)}

═══════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════
Return ONLY a valid JSON array, input order, no preamble, no markdown
fences, no trailing commas.

For changed:false, omit the plain field entirely. Remember: PASS is rare,
only use it if your fresh draft genuinely converged on something close to
the original.
For changed:true, include ONLY "plain" (the new value, your fresh draft).
Never include term, hook, analogy, or prompt, even if you considered
changing them, that is out of scope for this pass.
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
    // Also strip any em-dash that slipped through, as a hard safety net,
    // by flagging it rather than silently fixing it (silent fixing could
    // mask a deeper rule-following failure worth knowing about).
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
          if (item.plain.includes('\u2014')) {
            entry.emDashWarning = true; // model violated the hard ban, surface it instead of hiding it
          }
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
