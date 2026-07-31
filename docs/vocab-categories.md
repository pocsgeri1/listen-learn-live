# Vocab Categories — Epistemic
# v2.0 — 2026-07-31
# Governs: vocab_vault word categorization in episode_meta.json
# Used by: generate-episode-intel.js (extraction), categorize-vocab.js (backfill), extract.html (review UI)
---

## The 5 categories

### 1. Small Talk
**Register:** Casual, everyday language.
**Rule:** Assign if a non-native speaker would use this word in a low-stakes social setting — at a bar, at a party with strangers, in a friendly chat with a colleague. Accessible to any educated non-native speaker, but still worth owning because non-native speakers often miss it or use something clunkier.
**Examples:** *small talk, banter, off the cuff, brush it off, take the edge off, candid*

### 2. Smartypants
**Register:** Intellectual, academic, or philosophical. Specialist-adjacent.
**Rule:** Assign if the word comes from philosophy, linguistics, logic, or social science — and a non-specialist would need to look it up. It signals you've read serious books. Not technical in a lab sense (that's Science), but theoretical. If it sounds like a term a professor would use in a humanities lecture, it's Smartypants.
**Examples:** *dialectic, ontology, heuristic, reductionism, tautology, solipsism, epistemic, contrarian, liminal*

### 3. Business
**Register:** Professional and organizational. Office-native.
**Rule:** Assign if the word lives primarily in professional and business contexts — strategy, management, finance, negotiation, organizational behavior. A non-native speaker would encounter it in a meeting, a business book, a LinkedIn post, or a pitch deck.
**Examples:** *leverage, bandwidth, stakeholder, scalable, pivot, due diligence, north star metric, skin in the game*

### 4. Science
**Register:** Scientific, technical, data-driven.
**Rule:** Assign if the word comes from hard or applied sciences — biology, neuroscience, physics, medicine, statistics, economics, or technology. Requires specialist knowledge to understand without a definition. If a researcher would use it in a paper, it belongs here.
**Examples:** *cortisol, neuroplasticity, placebo effect, compounding, asymmetric information, Bayesian, dopaminergic, myelin*

### 5. Mind & People
**Register:** Psychological, interpersonal, self-development.
**Rule:** Assign if the word relates to the inner life (mental states, emotional regulation, mindset, identity) OR to how humans relate to, influence, read, or misread each other (relationships, social dynamics, emotional intelligence). This merges Head Space and People Skills — use it for anything that lives in therapy, self-help, or relationship books.
**Examples:** *rumination, imposter syndrome, gaslighting, rapport, cognitive dissonance, passive-aggressive, self-sabotage, mirroring*

---

## Schema

Each word in `vocab_vault` has:
```json
{
  "word": "...",
  "definition": "...",
  "timestamp_seconds": null,
  "category": "Small Talk",
  "category_alt": null
}
```

- `category` — required. Exactly one of the 5 values: `"Small Talk"`, `"Smartypants"`, `"Business"`, `"Science"`, `"Mind & People"` (exact spelling, title case).
- `category_alt` — optional. A second category if the word genuinely lives in two registers. Null by default.

---

## Decision rules

When categorizing, apply in order:

1. **Primary context rule:** Assign the category that matches where a non-native English-speaking professional (25–40) would most likely *first encounter* this word in real life.

2. **Tie-break rule:** If two categories are equally plausible, pick the one with the *narrower* register.

3. **No invented categories:** Only the 5 above are valid. If the word does not fit cleanly, leave `category` as `null`.

4. **`category_alt` stays null:** Do not populate during extraction. Leave as `null`.

---

## Edge case guide

| Situation | Rule |
|-----------|------|
| Word fits Business AND Smartypants (e.g. *incentive structures*) | Business — more probable first encounter |
| Word fits Mind & People AND Smartypants (e.g. *cognitive dissonance*) | Mind & People — applied psychology, not academic theory |
| Word fits Science AND Smartypants (e.g. *Bayesian*) | Science — originates in a hard discipline |
| Inner life word (e.g. *rumination*) | Mind & People |
| Interpersonal word (e.g. *gaslighting*) | Mind & People |
| Scientific term used loosely in pop science (e.g. *dopamine hit*) | Science — even in casual usage, term originates in science |
| Business jargon used loosely in podcast (e.g. *leverage*) | Business |
| Word you'd find in a serious humanities lecture (e.g. *dialectic*) | Smartypants |
| Casual expression a non-native speaker often misses (e.g. *off the cuff*) | Small Talk |
