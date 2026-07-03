# Batch 6 diff report

Autonomous batch. 10 concepts: 284, 311, 467, 472, 604, 618, 385, 635, 229, 535.
Mechanical check: `node tools/check-fields.js drafts-batch6.json` — 0 hard fails, 10 warns eyeballed (all false positives / exempt, see notes per concept).

---

## 284 — Intersectional Neurosis
- **hook** (2 sentences → 1): "Marginalized identity becomes a competition. Who can claim the most layers?" → "Marginalized identity has become a competition over who can claim the most layers."
- **plain** (over ceiling → 42w/2s): tightened, dropped redundant repeated "who can claim the most" clause.
- **analogy** (multi-sentence dialogue, way over ceiling → 12w/1s): "A poker game where everyone keeps inventing new hands. You have a straight?...Eventually no one is playing poker." → "Everyone at the poker table keeps inventing new hands to beat yours."
- prompt: unchanged.

## 311 — Bullsh*t Job Layer
- **hook** (2 sentences → 1): "Half of all jobs produce nothing. They're theater." → "Half of all jobs produce nothing; they're pure performance."
- plain: unchanged (already compliant).
- **analogy** (3 sentences → 1): condensed pirate-ship crew count/roles into single sentence.
- **prompt** (2 sentences, soft → 1, sharper): "What's one task... Name it. Why are you still doing it?" → "Name one weekly task no one would miss if you quietly stopped doing it for 30 days."

## 467 — Identity-First Change
- **hook** (2 sentences → 1): "You're building the wrong habits on the wrong person. Identity comes first." → "You keep building habits onto the wrong identity instead of changing it first."
- **plain** (4 sentences → 3): dropped redundant bodybuilder aside, kept core mechanism.
- **analogy** (2 sentences, explanatory trailer → 1, no trailer).
- prompt: unchanged.

## 472 — Failing Forward, Faster
- **hook** (2 sentences → 1): "Smart isn't solving it once. Smart is failing forward until it works." → "Winning just means running more experiments than everyone else." (warn: "possible bare -ing opener" — false positive, "Winning" is the sentence's subject, not a dangling opener)
- plain: unchanged (already compliant).
- **analogy** (2 sentences → 1).
- **prompt**: "Describe three different experiments..." → "Name one experiment you could run this week to test a new approach." (single concrete ask instead of three)

## 604 — Outgrowing the Playbook
- hook: unchanged (already compliant).
- plain: unchanged (already compliant). (warn: "possible triad" on "mass reach, memorability, and brand-building" — false positive, literal enumerated list, not rhetorical cadence)
- **analogy** (3 sentences → 1): landscaper/Unilever contrast condensed to single sentence.
- prompt: unchanged.

## 618 — Go Watch It Get Made
- **hook**: reworded for punch, still 1 sentence.
- **plain** (3 sentences → 2): dropped redundant factory-tour detail list.
- **analogy** (2 sentences → 1, 19w — within 20 ceiling).
- prompt: unchanged.

## 385 — Borrowed Self-Worth
- **hook** (2 sentences → 1): "Neediness isn't desperation. It's caring more about their opinion than your own." → "Neediness means caring more about their opinion of you than your own."
- **plain**: removed parenthetical jargon aside ("this has a name: approval-seeking over self-trust") and redundant closing clause; tightened to 2 sentences. (warn: "possible triad" on "words, interests, or behavior" — false positive, literal list)
- **analogy** (3 sentences → 1): dropped redundant concert example, kept hiking example.
- prompt: unchanged.

## 635 — Copycat Buying
- **hook** (2 sentences → 1): "You didn't decide to buy it. You saw someone else buy it first." → joined with semicolon.
- **plain** (4 sentences → 2): condensed.
- **analogy** (replaced, not just trimmed): original electric-car example duplicates the car-purchase domain used in batch 5 id 477 ("red Honda suddenly everywhere"). Replaced with oat-milk latte example to diversify imagery: "You order the same oat-milk latte after watching your friend order one first."
- **prompt** (banned opener "Think of" → fixed): "Think of your last major purchase..." → "Name your last major purchase, then ask who owned one first and whether you'd have considered it otherwise."

## 229 — Type One Vs. Type Two Empathy
- term: unchanged. (warn: 6-word count — this is a named/coined paired-contrast term already established in the source concept, treated as exempt per the "named/coined terms exempt" rule rather than truncated, which would lose the Type One/Type Two distinction the card is about.)
- **hook** (2 sentences → 1): "You feel their pain. You still have no idea why they did it." → joined with "yet".
- **plain**: removed em-dash and parenthetical jargon aside ("sometimes called cognitive empathy"). (warn: "possible triad" on "sadness, anger, or fear" — false positive, literal list)
- **analogy**: removed em-dash and 3rd sentence, condensed to 1.
- prompt: unchanged.

## 535 — Regression to the Mean
- term/hook/prompt: unchanged (already compliant).
- plain: unchanged (already compliant).
- **analogy**: removed em-dash and explanatory trailer ("the coach 'learns' that screaming works..."), condensed to 1 sentence.

---

### Cross-batch repetition check (vs. last 20 style-log entries, batches 4–5)
No opener or image overlaps found, except the car-purchase domain collision on 635 (flagged and fixed above by swapping to a latte-ordering scenario).

### Self-check summary
0 hard-rule failures across all 10 concepts. 10 warns, all eyeballed and dismissed as false positives or documented exemptions (see notes above).

### Result
Clean: 10/10, needs_human: 0, candidates remaining after this batch: 80 of 100.
