# Vocab Categories — Epistemic
# v1.0 — 2026-07-29
# Governs: vocab_vault word categorization in episode_meta.json
# Used by: generate-episode-intel.js (extraction), categorize-vocab.js (backfill), extract.html (review UI)
---

## The 9 categories

### 1. Small Talk
**Register:** Casual, conversational, socially safe.
**Rule:** Assign if a non-native speaker would use this word in a low-stakes social setting — at a bar, at a party with strangers, in a friendly chat with a colleague. The word is common enough not to raise eyebrows, but still worth owning because non-native speakers often miss it or use something clunkier.
**Examples:** *small talk, banter, chit-chat, off the cuff, brush it off*

### 2. Dinner Party
**Register:** Impressive without trying too hard. Educated, but not academic.
**Rule:** Assign if the word would make you sound well-read and interesting at a dinner with smart people — not a lecture, not a boardroom, not a lab. It lifts the conversation without making others feel talked down to. If it would land in a Economist op-ed or a Sunday magazine, it belongs here.
**Examples:** *cognitive dissonance, liminal, epistemic, contrarian, zeitgeist (the concept), serendipity*

### 3. Smartypants
**Register:** Intellectual, academic, or philosophical. Specialist-adjacent.
**Rule:** Assign if the word comes from philosophy, linguistics, logic, or social science — and a non-specialist would need to look it up. It's the kind of word that signals you've read serious books. Not technical in a lab sense (that's Lab Coat), but theoretical. If it sounds like a term a professor would use in a humanities lecture, it's Smartypants.
**Examples:** *dialectic, ontology, heuristic, reductionism, phenomenological, tautology, solipsism*

### 4. Corporate
**Register:** Business, professional, organizational. Office-native.
**Rule:** Assign if the word lives primarily in professional and business contexts — strategy, management, finance, negotiation, organizational behavior. A non-native speaker would encounter it in a meeting, a business book, a LinkedIn post, or a pitch deck. It is not necessarily formal — it's the vocabulary of people who work in offices and talk about their work.
**Examples:** *leverage, bandwidth, stakeholder, scalable, pivot, due diligence, north star metric, skin in the game (business sense)*

### 5. People Skills
**Register:** Interpersonal, social, psychological (applied).
**Rule:** Assign if the word describes how humans relate to, influence, read, or misread each other — in relationships, social dynamics, communication, or emotional intelligence. Not abstract psychology (that's Smartypants) but the kind of language you'd find in a book about people, persuasion, or relationships written for a general audience.
**Examples:** *passive-aggressive, boundaries, deflect, rapport, mirroring, reciprocity, gaslighting, vulnerability*

### 6. Head Space
**Register:** Psychological, introspective, self-development.
**Rule:** Assign if the word relates to the inner life — mental states, emotional regulation, mindset, identity, or personal growth. It overlaps with People Skills on the emotion side, but Head Space is about the *self*, not about the *interaction*. If the word belongs in a therapy session or a self-help book rather than a negotiation or a relationship, it's Head Space.
**Examples:** *rumination, self-sabotage, avoidance, imposter syndrome, intrinsic motivation, ego depletion, emotional dysregulation*

### 7. Lab Coat
**Register:** Scientific, technical, data-driven.
**Rule:** Assign if the word comes from hard or applied sciences — biology, neuroscience, physics, medicine, statistics, economics, or technology. It requires specialist knowledge to understand without a definition. If a researcher would use it in a paper, or if it appears on a scientific Wikipedia page, it belongs here.
**Examples:** *cortisol, neuroplasticity, placebo effect, compounding, asymmetric information, Bayesian, dopaminergic, myelin*

### 8. Deep Cuts
**Register:** Rare, arcane, or niche. Low everyday frequency.
**Rule:** Assign if the word is genuinely uncommon — used by specialists, historians, rhetoricians, or the very well-read, but not in mainstream discourse. It is not wrong or obscure for the sake of it — it fills a gap no common word fills. If you'd find it in a dictionary but almost nowhere else, it's a Deep Cut. If it sounds like a word a Victorian intellectual might use, it probably belongs here.
**Examples:** *apophenia, interlocutor, sycophantic, apotheosis, heterodox, lacuna, sui generis*

### 9. Zeitgeist
**Register:** Culturally current. Trending in educated discourse.
**Rule:** Assign if the word or expression is having a cultural moment right now — actively circulating in podcasts, longform journalism, books, or public intellectual conversations. It is not fast-changing slang (that's excluded outright), but it has a modern, culturally aware feeling. If it would appear in a 2024–2026 Atlantic article or serious podcast episode without explanation, it fits here. If it will likely still feel current in 5 years, it might be Dinner Party instead — Zeitgeist is for what's *now*.
**Examples:** *polycrisis, vibes, doom-scrolling (educated usage), techno-optimism, soft power, Great Resignation, attention economy*

---

## Schema

Each word in `vocab_vault` has:
```json
{
  "word": "...",
  "definition": "...",
  "timestamp_seconds": null,
  "category": "Dinner Party",
  "category_alt": null
}
```

- `category` — required. Exactly one of the 9 values above (exact spelling, title case).
- `category_alt` — optional. A second category if the word genuinely lives in two registers. Null by default. Populated in a future dedicated pass — do NOT ask Haiku to populate it during initial extraction; leave as null.

---

## Haiku decision rules

When categorizing, Haiku must follow these rules in order:

1. **Primary context rule:** Assign the category that matches where a non-native English-speaking professional (25–40) would most likely *first encounter* this word in real life. Not the most interesting application — the most probable one.

2. **Tie-break rule:** If two categories are equally plausible, pick the one with the *narrower* register. (A word that works at a dinner party AND in a corporate meeting → Corporate wins, because it's the more specific context.)

3. **Frequency override:** If the word is too common to be worth calling out (e.g. *important*, *strategy*, *impact* used plainly), do not assign a category — reject the word from the vault entirely. Categories are not a fix for weak word selection.

4. **No invented categories:** Only the 9 above are valid. If the word does not fit cleanly into any, leave `category` as `null`. The validation script will flag it for manual review — do not force a fit.

5. **`category_alt` stays null:** Do not populate the secondary category field during extraction. Leave it as `null` in every word's output.

---

## Edge case guide

| Situation | Rule |
|-----------|------|
| Word fits Corporate AND Smartypants (e.g. *incentive structures*) | Corporate — business context is more probable first encounter |
| Word fits Head Space AND People Skills (e.g. *emotional regulation*) | Head Space — it's about self, not interaction |
| Word fits Dinner Party AND Zeitgeist (e.g. *epistemic*) | Dinner Party — if it will still feel current in 5 years, it's not Zeitgeist |
| Latin phrase (e.g. *post hoc ergo propter hoc*) | Smartypants |
| Scientific term used loosely in pop science (e.g. *dopamine hit*) | Lab Coat — even in casual usage, the term originates in science |
| Metaphor that's become a stable idiom (e.g. *skin in the game*) | Corporate or Dinner Party depending on context in *this episode* |
| Expression that's only trending in 2024–2026 (e.g. *polycrisis*) | Zeitgeist |
| Word you'd only find in a 19th-century novel (e.g. *lacuna*) | Deep Cuts |
| Informal but stable expression used by educated speakers (e.g. *shoot yourself in the foot*) | Small Talk or Dinner Party depending on register in episode |
