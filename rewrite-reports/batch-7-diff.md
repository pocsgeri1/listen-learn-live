# Batch 7 diff report

Autonomous batch. 10 concepts: 600, 161, 168, 192, 280, 314, 381, 397, 406, 487.
Mechanical check: `node tools/check-fields.js drafts-batch7.json` — 0 hard fails, 14 warns eyeballed (all false positives / already-compliant short hooks, see notes per concept).

---

## 600 — Choice Paralysis
- hook, plain, prompt: unchanged (already compliant).
- **analogy** (2 sentences, em-dash, explanation trailer, 35w → 1 sentence, 18w): "If you walk into a shop with 7 types of jam, you'll probably buy one. If there are 27, you'll leave without buying anything — not because you don't want jam, but because choosing feels impossible." → "A shop with 7 jam flavors gets browsers buying; a shop with 27 gets browsers walking out empty-handed."

## 161 — Limbic Capitalism
- hook, plain, prompt: unchanged (already compliant).
- **analogy** (3 sentences, 36w → 1 sentence, 18w): dropped the closing "Instagram, fast food, and gambling apps..." list sentence (redundant explanatory tail), condensed slot-machine image to one line.

## 168 — Performance Vs. Excitement Matrix
- **hook**: reverted to the original two-sentence form per Gergely's review — "Passion with no audience is a diary. Audience with no passion is a trap." Kept as an explicit exception to the one-sentence rule: clause 2 mirrors clause 1's grammar and inverts its conclusion (frame-flip/reversal pattern, guide pattern #5), rather than continuing or explaining it. See discussion in chat re: possible new hook rule for this exception.
- **plain** (4 sentences, 51w → 3 sentences, 50w): removed parenthetical asides "(ideas proven to resonate)" / "(ideas you actually want to explore)", folded into the sentence directly; kept payoff line.
- **analogy** (3 sentences, 36w, explanatory tail → 1 sentence, 19w): dropped the "career happens when..." trailer.
- prompt: unchanged.

## 192 — Entrepreneur Sweet Spot
- **hook** (2 sentences → 1, joined via colon): "Passion, problem, payment. You need all three or the business dies." → "Passion, problem, payment: you need all three or the business dies." (warn: possible triad — false positive, literal 3-item enumeration is the term's own framework)
- **plain** (5 sentences, 50w → 2 sentences, 37w): dropped "Most people optimize one and ignore the others" and "Find the compromise that ticks all three" as redundant summary lines.
- **analogy** (4 fragmented sentences, 36w, explanatory tail → 1 sentence, 16w): condensed corporate-lawyer story, dropped explicit "uses expertise, serves a world..." trailer.
- prompt: unchanged.

## 280 — Vulnerability Signaling
- **hook** (2 sentences → 1, joined via "but"): "Communicating need once ensured survival. Now it fires with no threat in sight." → joined into one sentence (14w — within ceiling; warn "bare -ing opener" is a false positive, "Communicating" is the sentence's grammatical subject)
- **plain** (58w, over the 55 ceiling → 50w): removed the parenthetical "(i.e., vulnerability signaling)" self-naming aside, tightened the first sentence.
- **analogy** (3 sentences, 34w, explanatory tail → 1 sentence, 17w): dropped the redundant closing sentence restating the hook's point; reworded opener to "Strangers in..." to avoid repeating batch 6's "Everyone at" pattern.
- prompt: unchanged.

## 314 — Your Irreplaceable Edge
- **hook**: tightened slightly ("the only thing left is" → "all that's left is"), still 1 sentence, kept the "what it's like to be you" phrase.
- **plain** (52w → 53w, still within ceiling): reworded the closing clause from "what it's like to be you" to "the specific texture of being you" — the original phrase was duplicated verbatim in both hook and plain, which breaks the no-overlap-with-plain rule for hooks; only the plain side was changed since the hook's phrasing is the stronger line.
- **analogy** (3 sentences, ~36w, explanatory "That's you:" tail → 1 sentence, 16w): dropped the explicit "That's you" trailer; also changed opener from "Everyone can" to "3D-printing a..." to avoid echoing batch 6's "Everyone at" opener.
- prompt: unchanged.

## 381 — Mental Adaptability
- **hook** (2 sentences → 1, joined via "and"): "Certainty is disappearing. Living with ambiguity is the new skill." → joined.
- **plain** (definitional fragment opener "(also known as mental adaptability)" → removed entirely): rewrote the first sentence as a full sentence instead of a term-naming fragment; now 2 sentences, 30w.
- **analogy** (4 sentences, ~36w, explanatory tail "The difference isn't luck..." → 1 sentence, 15w): condensed to the pandemic image alone; opener changed to "Some people's lives..." to avoid a third "A [noun]" opener in this batch.
- prompt: unchanged.

## 397 — The Effort Filter
- hook: unchanged (already 1 sentence; short at 5w, but effective and within all hard rules — no floor requirement, only a 14w ceiling).
- **plain**: minor grammar cleanup only (comma → colon before "that's where relationships deepen" to fix the run-on), no other changes.
- **analogy** (3 sentences, 36w, explanatory tail "that conversation cements the friendship" → 1 sentence, 19w): condensed to the concrete list of stressors; reworded opener from "Your friend's kid" to "She's fighting with her ex..." to avoid echoing batch 6's "Your friend is" opener (id 229) from the immediately preceding batch.
- prompt: unchanged.

## 406 — The Blame Trade
- hook, plain: unchanged (already compliant).
- **analogy** (4-5 fragmented sentences, ~36w, "maybe true" filler → 1 sentence, 19w): condensed the boss/promotion example into a single parallel-contrast sentence.
- prompt: unchanged.

## 487 — Identity Protection
- hook, plain: unchanged (already compliant; warns are false positives — "Staying" is the grammatical subject, not a dangling opener; "Staying busy, scrolling, or avoiding" is a literal list, not a rhetorical triad).
- **analogy** (3 sentences, ~36w, explanatory tail → 1 sentence, 16w): folded the "why" (avoiding the failed-entrepreneur label) into the single sentence via a "because" clause instead of a separate trailing explanation.
- prompt: unchanged.

---

### Cross-batch repetition check (vs. last 30 style-log entries, batches 4–6)
Two near-collisions caught and fixed before finalizing:
- 314's original analogy opener "Everyone can..." echoed batch 6 id 284's "Everyone at..." (poker table) — changed to "3D-printing a Picasso is easy now...".
- 397's original analogy opener "Your friend's kid..." echoed batch 6 id 229's "Your friend is..." (breakup) from the immediately preceding batch — changed to "She's fighting with her ex...".
Also diversified two "A [noun]" openers (192, 381) to reduce within-batch repetition of that sentence pattern (6 of 10 draft analogies initially started with "A ___").

### Self-check summary
0 hard-rule failures across all 10 concepts. 14 warns, all eyeballed and dismissed as false positives, already-compliant short hooks, or documented literal lists/enumerations (see notes above).

### Result
Clean: 10/10, needs_human: 0, candidates remaining after this batch: 70 of 100.
