# Epistemic Hook Style Guide — v2.0
**Scope:** Hook field rewrites and generation for all concepts
**Last updated:** June 2026 — added craft layer from direct-response/viral-hook mechanics (specificity, front-loading, single dominant lever, explicit emotion/relatability checkpoint). Tone stays Dan Koe-led and quiet — sarcasm-as-default and negativity-bias-as-default were considered and explicitly rejected. See "What v2.0 changed" at bottom.
**Companion doc:** term-style-guide.md (terms), plain/analogy/prompt guide (future)

---

## The goal

A hook is the first thing a user reads. It has one job: make them feel something before they understand anything. Not explain. Not summarise. Hit.

The standard: would a sharp person screenshot this and share it without the card?

---

## Voice blend (in order of weight)

| Weight | Creator | Instinct |
|--------|---------|----------|
| Primary | Dan Koe | Identity pressure. Names the internal trap the reader is living in. |
| Secondary | Alex Hormozi | Blunt cost. States the price of inaction in concrete terms. |
| Secondary | Naval Ravikant | Compression. One clean idea. Paradox. No wasted syllables. |
| Seasoning | Sahil Bloom / Esther Perel | Stakes framing (Sahil). Subtext reveal (Esther). |

The category voice seasoning rules from feynman-batch.js still apply — they map creator instinct to category (see table at bottom).

---

## Format — hard rules

- **Target: 8–12 words. Hard ceiling: 14.** A handful of approved exceptions ran 15-16 words across 149 reviewed concepts — only when every word in the second clause earned its place. Treat 14 as the real ceiling when generating fresh hooks; don't lean on the exception.
- **Two clauses allowed** only when the second reframes, inverts, or lands a punchline the first clause didn't promise. Never when clause two just continues or restates clause one.
- **One sentence preferred** by default.

---

## The relatability + emotion checkpoint (new in v2.0)

Every hook must clear this before anything else. A hook can be format-perfect and bone-dry — that's a fail.

Ask, in order:
1. **Does this name something the reader has actually lived, not a category of thing?** "Your inbox at 11pm" beats "modern communication habits."
2. **Does it make them feel something in the first read** — recognition, mild discomfort, a flash of "oh no, that's me," quiet relief, a small jolt of "wait, really?" If the honest answer is "informative but flat," it's not done.
3. **Could a stranger nod before they finish the sentence?** If it needs the plain/analogy field to land emotionally, the hook hasn't done its job.

This isn't permission to manufacture drama. It's a floor: hyper-specific and emotionally inert is still a fail.

---

## Craft layer — borrowed from direct-response/viral hook mechanics (new in v2.0)

These are mechanics, not tone. They sit underneath the existing voice blend and format rules — they don't replace them, and they don't license sarcasm or negativity-as-default (see "What v2.0 changed").

**Front-load the trigger word.** The word that makes someone stop reading must land in the first 3 words, not the last 3. Don't bury the specific, surprising, or identity-relevant noun at the end of the sentence.
- Weak order: *"People rarely notice this, but their comfort zone is actually a cage."*
- Front-loaded: *"Your comfort zone stopped being comfortable years ago."*

**One dominant psychological lever per hook — not several stacked.** Pick the single strongest lever the concept supports and commit. Don't try to hit identity threat, loss aversion, and curiosity gap in the same 12 words; it dilutes all three.
- Identity-relevance: implies something about who the reader is, not just what they do
- Cost-of-inaction: states what's already being lost, not what could be gained (Hormozi lane — already in the voice blend)
- Compression/paradox: one clean idea stated cleanly (Naval lane — already in the voice blend)
- Subtext reveal: names the thing under the thing (Perel lane — already in the voice blend)
- Pick the lever, then check: is every word in service of that one lever? Cut anything that isn't.

**Specificity-as-proof.** A precise, nameable detail does more credibility work than any adjective. This is really rule #1 from the existing approved-patterns list, stated as a generative principle rather than a pattern to recognize after the fact: when drafting, reach for the specific noun/number/scenario before reaching for an intensifier.
- Weak: *"This happens way more often than people think."*
- Specific: *"This happened in your last performance review and you didn't clock it."*

**Cut throat-clearing on the first pass, not the polish pass.** Draft without "So," "Here's the thing," "Listen," "The truth is" — these were already banned (see Hard Bans), but treat their absence as a drafting habit, not just an edit-stage check.

---

## What actually got approved — patterns ranked by how often they won

**1. Hyper-specific over abstract (highest hit rate)**
Replace a general claim with one vivid, nameable detail.
- *"Cold water, heavy weights, hard conversations: small doses of hard things build you up."* (Hormesis)
- *"Your degree was designed by a committee in 2005; the person who taught you the skill has 2M subscribers."*
- *"The person who launched the ugly version last year is lapping you while you're still tweaking fonts."*

**2. Funny/sarcastic + a specific visual**
Humor lands when it's attached to a concrete image, not just a wry tone.
- *"AI is now training AI. Humans are mostly just paying the electricity bill."*
- *"'We value work-life balance.' Said every company right before the Sunday Slack message."*
- *"Congratulations. You've suppressed every emotion so thoroughly you can't feel the good ones either."*

**3. Blunt one-line verdicts**
Short, declarative, no hedging.
- *"More hours isn't a strategy. Leverage is."*
- *"Victims explain. Agents decide."*
- *"The product is free because you are the product."*

**4. Relatable self-recognition ("that's me" moment)**
- *"You moved into your comfort zone. Now you're just living in it like a tenant who forgot they can leave."*
- *"He's attractive so he's probably smart too. Your brain just decided that."*

**5. Reversals / frame flips**
Take the assumed direction of a claim and invert it.
- *"The question was never 'did you steal it.' It's 'did you steal from the right people.'"*
- *"Every 'obvious truth' was once heresy. And vice versa."*

**6. Metaphor that unlocks a hard/Latin term**
For scientific or academic-sounding concept names, replace the mechanism with an everyday image.
- *"Tell someone a pill has side effects. Their body will produce them."* (Nocebo Effect)
- *"Aging isn't your body falling apart, but rather your body forgetting how to read its own instructions."* (Epigenetic Aging)

---

## Hard bans — confirmed by repeated rejection

- Em-dashes (—) anywhere
- "You're not X, you're Y" / "It's not X, it's Y" — banned even when it sounds good. If a draft naturally falls into this shape, rewrite the clause structure entirely, don't just swap words.
- "Most people don't realize…"
- "Here's the thing:"
- "Game-changing", "a new era of", "everything shifted"
- `-ing` verb opener with no subject: "Confusing busy with results." "Holding two views."
- Motivational poster cadence: "Small things compound into big things." "Tiny daily actions compound into massive results."
- Triads of exactly three
- Hook first-sentence = plain first-sentence (no overlap, see below)
- Academic register — if it sounds like a textbook, it failed
- Idioms/slang that don't travel for a fluent non-native reader (e.g. native-only phrases like "fires" as a verb for instinct, "lost the plot")
- **Sarcasm/wit as the default register (new in v2.0).** Sarcasm pattern #2 in the approved list above stays available as one option in rotation, never the default lever. It's the hardest register for a fluent non-native reader to parse under any cognitive load, and it's garnish, not the engine — the point must survive with the sarcasm removed.
- **Negativity/threat as the default lever (new in v2.0).** Loss aversion and cost-of-inaction (Hormozi lane) stay in the voice blend, but they're one lever among several, not the default. If every hook in a batch is running fear, status anxiety, or "you're doing this wrong," the batch has collapsed into one register — rotate levers per the category seasoning table below.

---

## The no-overlap rule (critical)

The hook must approach the concept from a **different angle** than `plain`. Not a restatement, not a compressed version.

Test: cover the hook, read the plain. Does the hook add a new angle? If no — rewrite.

---

## Category voice seasoning (quick ref)

| Category | Lead instinct | Rotate through |
|----------|--------------|----------------|
| business, power | Hormozi — blunt math | cost framing / what's actually happening / direct cause-effect |
| psychology, identity | Koe — internal trap | "notice when you do this" / "the story your brain tells" / name the conflict |
| philosophy, science | Naval — compression | one-clean-idea / paradox / strip the jargon |
| society, finance | Rory Sutherland | hidden incentive reveal / "people say X but really Y" / system-level pattern |
| relationships, language | Esther Perel | what's under the conversation / the unspoken dynamic / other person's frame |
| thinking, creativity, health, tech-ai | Plain Feynman | no personality seasoning — clarity only |

No two cards in the same category use the same angle within one batch.

---

## The share test

Before finalizing any hook, ask: would a sharp person screenshot this without the card? If no — rewrite.

---

## What v2.0 changed

Source: a working session comparing this guide against aggressive/viral social-hook conventions (negativity bias, sarcasm-as-default, status-anxiety framing). Decision was to **borrow the craft, reject the tone**:

**Added:**
- Relatability + emotion checkpoint as an explicit, ordered pre-check (was implicit in "the share test" before; now front-loaded so flat-but-correct hooks get caught earlier)
- Front-loading the trigger word as a generative rule
- Single-dominant-lever discipline (don't stack identity threat + loss aversion + curiosity gap in one hook)
- Specificity-as-proof reframed as a drafting principle, not just a pattern to spot after the fact

**Explicitly rejected and banned:**
- Sarcasm/wit as a default register — stays as one rotation option (pattern #2), not the lever to reach for first
- Negativity bias / threat-framing as a default lever — stays available (cost-of-inaction, Hormozi lane) but must rotate with the other levers, not dominate a batch

**Reasoning:** the audience opens the app by choice (not a cold scroll being stopped), sarcasm doesn't survive translation across fluency levels, and negativity-as-default would flatten the category voice seasoning system (Hormozi/Koe/Naval/Sutherland/Perel) into one repeated register.

