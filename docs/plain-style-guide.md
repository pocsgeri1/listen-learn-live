# Epistemic Plain Style Guide — v2.2
**Scope:** The `plain` field only (the concept's actual explanation)
**Last updated:** June 2026 (v2.0 built from full-library audit of 636 concepts; v2.2 corrects v2.0 after live-testing; extraction prompt updated to v1.8 which compresses plain rules to 8 max for reliable model output — this guide remains the full editorial reference for human review)
**Companion doc:** hook-style-guide.md (hooks), term-style-guide.md (terms)

---

## What plain has to do

Plain's job is to make the reader actually understand the concept — completely, simply, and without boredom. Not feel something (that's hook's job). Not paint a vivid scenario (that's analogy's job). Explain the mechanism so clearly that a smart 12-year-old or a fluent non-native professional gets it instantly, and remembers it.

The standard: would a friend who just asked "wait, what does that mean?" actually understand your answer — and could they repeat the mechanism back five minutes later, not just a memorable phrase?

---

## Why this guide exists

The audit that produced this guide found the documented length rule already being violated by 75% of the live library (median plain was running 264 characters against a 200-character ceiling), with the worst offenders running 400-600 characters. Three separate surfaces generate or regenerate plain (the live extraction prompt, the feynman-batch editorial pass, and the regenerate-button prompt in extract.html) and all three carried different, partially-conflicting versions of the rules — notably, the regenerate button had no length cap at all, which is almost certainly how the worst offenders were created. This guide is the single canonical version. All surfaces (extraction-prompt-v1_7.txt, extract.html's regen prompt, extract-concepts.js) are kept in sync with it.

---

## Why v2.0 was wrong, and what v2.2 fixes

The original v2.0 rules (200-char ceiling, ban on specific real-world claims in plain) were written from the audit data alone, without testing them against real concepts at scale. When actually run across the library, they produced a serious failure: the model defaulted to deleting the actual, specific, recognizable details that came from the source podcast — replacing them with generic, vague filler to hit the tight ceiling.

Example of the failure, caught live:
- Original strong draft: "...their brains start flagging trivial things as catastrophic: microaggressions, processed foods, **the wrong pronoun**. The reaction is wildly disproportionate..."
- v2.0's "fix": "...a slow wifi connection, a clumsy text, an inconvenience."

The second version is shorter and technically jargon-free — and worse. It deleted the one sharp, specific, recognizable detail that made the card worth reading and replaced it with placeholder language that explains nothing.

This happened because v2.0 conflated two separate jobs this product does:
1. **Extraction** — give the reader an accurate overview of what was actually said in a 2-3 hour podcast, fast. This requires keeping specific names, numbers, and examples from the episode — that specificity *is* the value being extracted.
2. **Translation** — turn the idea into everyday language the reader can say out loud.

v2.0's "no specific real-world claims" rule only served job 2, and actively worked against job 1. v2.2 fixes this directly: see "Specific real-world claims" below.

---

## Length — hard rules

- **Ceiling: 350 characters / ~55 words.** This is the standard target for every plain, not a rare exception — aim for it by default.
- **No fixed sentence count.** 2-4 sentences is normal, depending on how much specific content the source material needs to land the mechanism.
- **Plain may run shorter** than the ceiling when it already fully explains the mechanism and passes the repeat-back test — don't pad a short, complete answer just to fill space.

### When a draft runs over 350 characters: TRIM, DON'T ABSTRACT

This is the single most important rule in this guide, because abstracting away specifics is the most common and most damaging failure mode (see "Why v2.0 was wrong" above).

- **Do NOT** rewrite the whole plain into something more generic to hit the ceiling.
- **Do NOT** swap a specific real detail (a name, number, or concrete example from the episode) for a vaguer placeholder. That defeats the extraction job this product exists to do.
- **INSTEAD:** find the single weakest sentence and cut it whole. Leave every other sentence exactly as drafted. Re-measure. If still over, repeat with the next-weakest sentence.

A weak sentence is usually one of:
- A generalizing summary that restates what the prior sentence already said
- A second or third example when one already landed the point
- A speculative or unfalsifiable claim layered on top of the core mechanism
- A parenthetical that just re-names something already named

This means most over-length plains get fixed by **one clean cut**, not a full rewrite.

Good (BATNA — power, acronym expanded, mechanism intact, no em-dash):
> "Best Alternative To a Negotiated Agreement: the deal you'd walk straight into if this one fell apart. The stronger that backup, the more power you hold in the room."

Good (Haber-Bosch Process — episode-sourced, real specifics kept, fixed with one weak-sentence cut rather than abstracted away):
> "In the late 1800s, the world faced mass starvation because fertilizer came from bird droppings on South American islands, and those deposits were running out. Scientists figured out how to compress atmospheric nitrogen into fertilizer (the technical term: Haber-Bosch process). The threat vanished and global population exploded."

Bad (too long — needs the trim-weakest-sentence treatment, not abstraction):
> "Supernormal stimuli refers to an exaggerated version of a stimulus that produces a stronger response than the original natural stimulus would. This phenomenon occurs because our nervous systems evolved to respond to certain cues in our natural environment, but when those cues are artificially amplified, our evolved responses go into overdrive, and this explains a huge range of modern behavioral problems from junk food addiction to social media compulsion to pornography use..."

Bad (the v2.0 failure mode — never do this, even though it's shorter):
> Strong original: "...microaggressions, processed foods, the wrong pronoun. The reaction is wildly disproportionate..."
> Wrong "fix": "...a slow wifi connection, a clumsy text, an inconvenience."
> (shorter, but deleted the real, specific, recognizable examples and replaced them with generic placeholders that explain nothing)

---

## Zero jargon — strip on sight

Replace these with plain alternatives. (Exception: if the word IS the term itself — e.g. "Leverage" as a concept name — it can appear, but should still be explained in plain language around it.)

utilize, facilitate, phenomenon, paradigm, cognitive, epistemological, heuristic, non-local, empirical, nuanced, salient, synergy, leverage, framework (say "way of thinking"), delineate (say "show"), elucidate (say "explain"), modality (say "way"), instantiate (say "create"), tranche, desensitize, acclimation, incremental

"Optimize" is fine — common enough to pass.

Also zero:
- Hedging: "research suggests," "it is worth noting," "some researchers argue," "one might argue"
- Corporate filler: "in today's fast-paced world," "at the end of the day"
- Motivational-poster energy: "a new era of," "game-changing," "everything shifted"

---

## Start mid-thought — but never lose the literal meaning

Never open with "X is when..." or "X refers to..." — start at the mechanism, the consequence, or the scene, not at the announcement of the term.

**Exception that's easy to get wrong: acronyms and named terms still need their literal meaning stated somewhere in the field.** Starting mid-thought means skipping the dry dictionary-style opener — it does NOT mean omitting what an acronym stands for. If the term is BATNA, ROI, or another acronym, the expansion must appear in plain, just not as the opening clause.

- ✗ Wrong (drops the literal meaning entirely): "The deal you'd walk into if this one fell apart. The stronger your fallback, the more power you hold."
- ✓ Right (mid-thought start, expansion still present): "Best Alternative To a Negotiated Agreement — the deal you'd walk straight into if this one fell apart. The stronger that backup, the more power you hold in the room."

---

## Concrete, specific wording over abstract noun phrases

This is a word-choice rule, not a metaphor-building rule. Painting a vivid scenario is analogy's job — plain's job is to explain using specific, concrete language rather than category labels, without constructing a standalone image or story around it.

- Abstract: "the hardwired instinct to form in-groups and treat out-groups with hostility"
- Concrete, still literal: "anyone in your group reads as safe, anyone outside it reads as a threat — an old survival circuit, not a conscious choice"

Test: if you removed the specific wording and replaced it with a generic label, would the sentence still teach the mechanism? If yes, the language wasn't concrete enough to begin with.

---

## Bracketed examples for lists

When plain lists or orders multiple items, give each item a short bracketed concrete example rather than leaving the list abstract.

Good (Domain of Mastery):
> "Pick three things: one that pays the bills (copywriting), one that lights you up (psychology), one that stretches you (philosophy). Where all three overlap is a voice nobody else has."

---

## Specific real-world claims — keep them (v2.2 reverses the old v2.0 ban)

For **episode-sourced concepts** (any source other than `core`): specific names, numbers, dates, and examples from the source material should be **preserved**, not stripped. They are the actual content being extracted from the podcast — that's job 1 (see "Why v2.0 was wrong" above). Only cut a specific detail if it's the weakest sentence under the trim rule above, never because it's "too specific" on its own.

For **`core` (evergreen, non-episode) concepts**: don't invent a fake-precise stat or claim that isn't from a real source — a generalizable mechanism without fabricated false precision is correct here.

- If a specific claim is genuinely illustrative and the plain is already at the ceiling, it's fine for it to also live in `analogy` in a different form — but don't strip it from plain just to "make room."
- The old v2.0 instinct here was to treat every dense, fact-heavy plain as a length problem solvable by deleting specifics. In practice this produced boring, generic cards that lost the actual value of the source episode. The real fix for genuinely overloaded cards is still the trim-weakest-sentence method above, applied with judgment — not blanket specificity removal.

---

## All-fields-vs-all-fields non-repetition (critical)

No scenario, image, fact, or example may repeat across hook, plain, analogy, and prompt on the same card. This is broader than the old hook-vs-plain overlap check — it applies to every pair of fields, checked every time any one field is touched.

Process: before finalizing plain, read hook, analogy, and prompt side by side. If plain reaches for the same scenario, image, or fact that any other field already uses, plain needs a different angle or example — even if the wording differs.

- ✗ Bad: plain uses a factory-dumping-waste-in-a-river image, and analogy also uses a river/pollution scenario. Same image twice, even with different phrasing, fails the card.
- ✓ Good: each field on the card delivers its own distinct "aha" — no two fields could be swapped for each other without losing something.

Every sentence across the whole card should add new value. If a sentence in plain could be deleted because analogy already said it, cut it.

---

## The repeat-back test (the real quality gate)

After drafting plain, cover the card and ask: **could the reader, five minutes later, explain the actual mechanism — not just repeat a memorable phrase?**

This single test replaces two older, separately-run checks (the "would you say this to a friend" test and a standalone mechanism-completeness check) — they were testing the same thing from two angles and ran the risk of inconsistent application across a large batch. One test, one pass/fail:

- If the reader could only repeat back an image or a phrase, but not the logic the image was supposed to carry — fail. The image was decorative, not load-bearing.
- If the reader could explain the mechanism but it sounded like a dictionary entry — fail, on vividness/wording grounds (see concrete-wording rule above).
- If both the language is alive AND the mechanism is intact — pass.

This test also governs the short-form allowance: if one sentence already passes the repeat-back test in full, a second sentence is padding, not a requirement.

---

## Hard bans — carried over from the broader anti-slop rules

- "It's not X, it's Y" constructions
- "While X might seem true, Y is actually…"
- "Most people don't realize…" / "It's important to note…"
- Triads of exactly three ("fast, reliable, and efficient") — vary the count, or convert lists into a sentence
- Sentences all roughly the same length — mix short punchy ones with longer ones
- No rhetorical-question-then-answer pattern ("Why isn't X celebrated? Because Y.")
- No "It's X: by the time Y, Z" colon-explainer constructions
- No em-dashes anywhere

---

## The Bracketed Term Rule

When simplifying plain would lose a real, widely-used word worth knowing, preserve it via a bracketed clarification rather than dumbing it down entirely.

Good: "Your mind smooths over the contradiction so it doesn't have to sit with the discomfort (some call this cognitive dissonance)."

This is the same rule used in term-style-guide.md — applies here most often, since plain is where real vocabulary most often needs a safety net to stay accessible without disappearing.

---

## Dense, fact-heavy concepts — what to do when the source material won't compress

Some concepts (notably episode-sourced cards built on a transcript with multiple specific facts — names, dollar figures, dates, percentages) run well over the 350-character ceiling in a first draft.

**Trim, don't relocate, don't abstract.** This is the same trim-weakest-sentence method described above, applied at scale: find the one mechanism or fact the concept is actually about, keep its sharpest specific detail intact, and cut the weakest supporting sentence — repeating if needed. Moving displaced facts into `analogy` just shifts the bloat problem into a field with its own tight budget; abstracting them away loses the extraction value entirely. If a card genuinely cannot survive any cut without losing its point — which is rare — that's a signal the card itself is mis-scoped, closer to a mini-essay than a teachable concept, and it should be flagged for the quality-rules.md rejection/restructure process rather than stretched or hollowed out to fit.

---

## Skip rule — for editorial rewrite passes

During any batch rewrite of existing plains, leave a card's plain field untouched **only if it already passes every rule in this guide** — not just the length and jargon checks used in earlier passes. A plain that's short and jargon-free but repeats an image already used in analogy, or skips an acronym's expansion, has NOT passed and should still be flagged for rewrite.

---

## Quick test before finalizing a plain field

1. Is it within the 350-character / ~55-word ceiling? If over, did you fix it by cutting the single weakest sentence — not by abstracting real content into something vaguer?
2. Does it avoid every word on the jargon strip list?
3. Does it start mid-thought — and if the term is an acronym or named term, is the literal expansion still present somewhere in the field?
4. Is the wording concrete and specific rather than an abstract noun phrase?
5. If it lists multiple items, does each one have a bracketed example?
6. For episode-sourced concepts: did you KEEP the specific names/numbers/examples from the transcript rather than stripping them? (For `core` concepts: did you avoid inventing a fake-precise stat?)
7. Read hook, analogy, and prompt side by side — does plain repeat any scenario, image, or fact already used elsewhere on the card?
8. Repeat-back test: would a friend understand and be able to explain the actual mechanism five minutes later — not just recall a phrase?
9. Does it avoid every item on the hard-ban list (triads, em-dashes, rhetorical-question pattern, etc.)?
10. If real vocabulary had to be simplified, was it preserved via the Bracketed Term Rule instead of just dumbed down?

If any answer is no, fix it — but fix it by trimming or sharpening, never by deleting the real, specific content that makes the card worth reading.
