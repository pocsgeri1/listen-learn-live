# Epistemic Term Style Guide — v2.0
**Scope:** The `term` field only (2-5 words, the concept's name)
**Last updated:** June 2026 (revised after full-library editorial pass, 636 concepts)
**Companion doc:** hook-style-guide.md (hooks), plain/analogy/prompt guide (future)

---

## What a term has to do

The term is the label someone will say out loud in conversation. It has to be sayable, memorable, and worth knowing. If it's clunky to say or forgettable five minutes later, it fails regardless of how accurate it is.

---

## Core rules (carried over from Feynman rewrite v1.81)

**Concrete imagery over abstract labels**
- Prefer terms that paint a picture over terms that sound like a textbook heading
- ✓ "The Velvet Rope Effect" over "Exclusivity-Driven Value Perception"

**Real, citable vocabulary is preserved — including exotic-sounding real terms**
- If a term is a genuine, recognized concept (Hormesis, Dunning-Kruger, Motte and Bailey), keep it. Don't dumb down real vocabulary just because it's unfamiliar.
- The job is to make people sound sharper by knowing real terms, not to hide difficulty

**Exotic/unfamiliar-sounding real words have standalone learnability value — don't over-rotate on accessibility for them**
- "Hormesis" doesn't make intuitive sense on its own, and that's fine — it's a real word that's genuinely interesting and fun to learn and say. The novelty IS part of the value.
- Don't reflexively flag every obscure-sounding real term for simplification. Ask: is this the kind of word a sharp non-native professional would be *glad* to add to their vocabulary? If yes, keep it, even if it's Latin/Greek-derived.
- This is in tension with the accessibility check below — when in doubt, prefer keeping real, citable, "impressive to know" vocabulary over inventing a softer paraphrase. The accessibility check is about whether someone can SAY it, not whether it's instantly intuitive.

**If it isn't broken, don't fix it**
- Don't rewrite a term just because a rule technically allows a rewrite. Pass1 (or any mechanical process) often makes a small "safe middle" edit (strip one word, fix capitalization) that doesn't actually fix the underlying blandness — and conversely, sometimes the original term was already good and didn't need touching at all.
- Examples kept as originally written across the full pass: "Recovery Is the Adaptation," "Famous Orders," "Director of Trivia," "The Curse of the Blank Page," "Eternal Markets," "Marketing Lives Outside Marketing" — these were already specific, concrete, and sticky. A rule existing doesn't mean it must be applied if the term already passes on its own merits.
- Don't accept a half-measure rewrite (pass1's small mechanical cleanup) if the underlying term is still bland — go further, even to the point of inventing something new, rather than settling.

**"X vs Y" format survives only when both nouns are independently teachable**
- ✓ "Function vs Feeling" — both sides are concepts on their own
- ✓ "Explore vs Exploit," "Latency vs Bandwidth," "Austrian vs Chicago Economics" — real, teachable pairs
- ✗ "Good vs Bad Advice" — not specific enough to be useful as a pair
- Symbols can replace "vs"/"over" when they read cleaner: "Correlation ≠ Causation," "Exchange > Imposition." A symbol is often punchier than the spelled-out word — prefer it when the meaning stays instantly clear.

**"X as Y" / "X of Y" / "X over Y" / "X through Y" are the single most common failure pattern — treat with default suspicion**
- These academic-paper constructions are usually a sign the term is describing the concept from the outside rather than naming it
- They are NOT automatically banned — but the bar is "would this survive as a real teachable concept," not just "does it avoid the pattern"
- ✓ KEPT despite the pattern: "Brands as Insurance" (concrete, specific metaphor that does real work), "Hardware as a Service" (real, citable industry term)
- ✗ REWRITTEN: "Creativity as Local Maximum Escape" → "Local Maximum Trap", "Constraints as Creativity" → "Fewer Options, Better Ideas", "Curiosity as Strategy" → "Build From Genuine Curiosity"
- Test: if removing "as/of/over/through" and the two halves don't independently mean anything, rewrite. If the construction is doing real metaphorical work (Insurance, Asset), it can stay.

**No overlap between term and hook/plain — this is a hard rule, check it explicitly every time**
- The term shouldn't repeat 2+ content words from the hook, or restate the hook's own angle/structure in different words
- This was the single most common mistake made during editorial review — it is easy to generate a term that "sounds different" but is actually just a paraphrase of the hook's exact framing
- Process: before finalizing any term, read the hook (and the plain field's opening sentence) side by side. If the term and hook are answering the same question from the same angle, the term needs a different angle entirely — pull from a different part of the concept (the mechanism, a consequence, a contrast, an example) rather than rephrasing the hook's own wording
- ✗ Bad: hook = "Adoption is slow, then explosive, then flat" / term = "Slow Start, Sudden Takeoff" (just restates the hook)
- ✓ Good: hook = "Adoption is slow, then explosive, then flat" / term = "Sigmoid Adoption Curve" or something that names the underlying shape/concept rather than re-describing what the hook already shows
- Real, established vocabulary (named/coined terms) is exempt from this check IF the established term is simply how the concept is known — preserving real vocabulary takes priority over avoiding overlap in that specific case

**Hyphenated compounds accepted**
- "Loyalty Tax," "Anti-Vision," "Short-Term Trap," "Founder-Led Premium" — fine when they compress an idea efficiently and read as natural English rather than constructed jargon

**Specificity and mechanism beat general labels**
- Prefer a term that names the actual cause/mechanism over one that just labels the category of thing
- ✓ "Three Prices, One Decoy" over "Good, Better, Best" (names the actual psychological lever — the decoy — not just the visible structure)
- ✓ "Selling Without a Brand" over "Government Messaging Gap" (specific behavior, not an abstract "gap")
- ✓ "The Headless Army" over "Kill the King Strategy" (names what survives the tactic, not just the tactic's name)
- When choosing between a generic-but-safe rewrite and a more specific, vivid one, default to the more specific one — even if it requires more invention

**Slang and podcast-native phrasing can outrank a "proper" rewrite**
- If a term is informal or slightly odd-sounding but it's how the source material (podcast, author) actually says it, and it has personality/stickiness, keep it over a more "correct"-sounding alternative
- Example: "Process Fetishism" — clinical-sounding by the letter of the rules, but it's the actual phrase used in the source material and has real personality. Kept as-is.
- Example: "Simp Shaming" — real internet slang, instantly recognizable, more useful to keep than to formalize into something blander

**Bracketed italicized terms approved for preserving real vocabulary inside simplified plain fields**
- Used when the real term needs to be present but the plain explanation needs to stay accessible

**Named/coined terms are exempt from rewrites**
- Dunning-Kruger, Motte and Bailey, Bikeshedding, etc. — these are real, established names. Never invent a "friendlier" replacement for an already-named phenomenon.

---

## Categories that are automatically exempt from rewriting

Built from patterns observed across the full library pass — these almost never need touching:

1. **Named/coined concepts with a real author or field** — Loss Aversion, Doorman Fallacy (Rory Sutherland, *Alchemy* — verify correct spelling/attribution before publishing; a transcription/extraction error turned this into "Dormant Fallacy" at one point, so always double check named-term accuracy against the source), Reward Prediction Error, Maya Principle, Survivorship Bias, Bikeshedding, Motte and Bailey, Hawthorne Effect, Set Point Theory, Falsifiability, Curse of Knowledge, Adjacent Possible, Functional Fixedness
2. **Widely-known idiomatic phrases that are already part of everyday English** — Dark Patterns, Brute Force, Technical Debt, Single Point of Failure, Switching Costs, Garbage In Garbage Out, Burden of Proof, Network Effect
3. **Real industry/technical vocabulary, even if multi-word** — Hardware as a Service, Burn Rate & Runway, Time Value of Money, Dollar-Cost Averaging
4. **Geopolitical/historical named concepts** — Plato's Cave, Bronze Age Collapse, Fortress America, Military-Industrial Complex, Mosaic Strategy (verify factual neutrality of surrounding plain/hook text for politically sensitive named concepts — keep the term, but flag the content for editorial tone review)
5. **Specific, vivid terms that were already good before any rewrite pass touched them** — don't assume an older term is automatically worse; many older/evergreen terms in the early-extraction part of the library needed zero changes

---

## What pass1 (automated rewrite) tends to get wrong

When reviewing any automated first-pass rewrite of terms, these are the recurring failure modes to check for:

- **Half-measures**: stripping one word or fixing capitalization without addressing the underlying blandness (e.g. "Pricing Over Volume Strategy" → "Price Over Volume" — technically shorter, still bad)
- **Introducing new jargon while removing old jargon**: "Sigmoid Curve of Adoption" → "Sigmoid Adoption Curve" doesn't fix anything; "Sigmoid" itself may still need addressing depending on the exotic-word principle above
- **Negative-connotation swaps that don't fit a neutral/analytical concept**: "China's Neutral Play" → "Neutral Profiteering" introduces a judgmental word ("Profiteering") where the original was analytically neutral
- **First-person or oddly-voiced terms**: "Choosing Silence to Stay Alive" → "Forfeiting My Life" — first-person phrasing is wrong for a term field, which should read as a third-person concept name
- **Accidentally creating hook overlap that didn't exist in the original**: pass1 sometimes pulls a phrase straight from the hook to "simplify" the term, which creates exactly the overlap problem this guide warns against

---

## Length and form

- 2–5 words, hard range
- Title case
- No punctuation except hyphens where natural (em-dashes never)
- Avoid starting with "The" unless it's doing real work (e.g. "The Pretty Privilege" earns it; "The Compound Effect" could just be "Compound Effect")

---

## The accessibility check

Every term must pass: would a fluent non-native English professional be able to say this term out loud in a meeting and have it land — not stumble over pronunciation, not sound like they're reading from a vocabulary flashcard?

This rules out:
- Overly academic Latin/Greek coinages with no real-world circulation
- Terms that only make sense once you've read the full plain explanation
- Puns or wordplay that don't translate outside native English

---

## What to avoid

- Generic category labels: "Time Management," "Communication Skills" — instantly rejected at the quality-rules.md level already, but applies doubly to term-naming
- Made-up scientific-sounding terms with no real basis (don't invent fake jargon to sound smart)
- Terms identical or near-identical (>30% similar) to an existing concept in the library
- Overlong descriptive phrases trying to cram the whole insight into the term

---

## Quick test before finalizing a term

1. Could someone use this in a sentence tomorrow and sound sharper for it?
2. Does it pass the non-native-speaker say-it-out-loud test? (Note: this tests pronounceability and circulation, not intuitive obviousness — a real, exotic-sounding word can still pass if it's genuinely learnable/citable.)
3. Is it 2-5 words? (Symbols like ">" "≠" can substitute for a word if cleaner.)
4. Does it avoid repeating 2+ content words from the hook, or restating the hook's own angle? (Check this explicitly, side by side — don't eyeball it.)
5. If it's a real established term — did we keep it real rather than softening it, and did we verify the correct name/spelling/attribution against the source?
6. If it already reads as specific, concrete, and sticky — are we rewriting it just because a rule technically allows it, or because it's actually still bland? (If it's already good, leave it alone.)
7. Does it name a mechanism/cause where possible, rather than just labeling a category?

If any answer is no, rewrite — but rewrite toward something genuinely better, not just toward rule-compliance.
