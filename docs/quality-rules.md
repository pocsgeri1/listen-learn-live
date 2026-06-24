# Quality Rules — Epistemic

**Last updated:** June 2026 — Hook/Term/Plain field-by-field sections below now point to their dedicated style guides (hook-style-guide.md v2.0, term-style-guide.md v2.0, plain-style-guide.md v2.0) instead of carrying separately-drifting copies of the same rules. This doc keeps a short-form summary for quick reference; the style guides are the canonical source.
**Purpose:** The editorial constitution. Non-negotiable standards for every concept that goes live. When in doubt, reject. Quality is the moat.

---

## The prime directive

Every concept that goes live on the site must make a thoughtful user feel smarter, sharper, or more articulate within 30 seconds of reading it.

If it doesn't — reject it. No exceptions.

---

## A concept MUST be approved if all of these are true

- Someone could use it in a sentence tomorrow and sound sharper for it
- The analogy makes a non-native English speaker immediately understand the concept
- The hook could stand alone as a tweet and get organic engagement
- It applies to at least 60% of adults regardless of profession
- The plain explanation contains zero jargon
- The concept name is 2–5 words and memorable

---

## A concept MUST be rejected if any of these are true

- It's something most educated people already know ("supply and demand", "time management")
- The term itself is rarely used in real conversation
- The analogy is abstract rather than concrete ("it's like a mental process that…")
- The plain explanation contains jargon or requires specialized knowledge
- The prompt is vague ("think about how this applies") rather than specific
- It applies only to one narrow profession or demographic
- It's a personal anecdote dressed up as a framework
- The concept name is too long, generic, or forgettable
- It's more than 30% similar to a concept already in the library
- The source is unclear or ambiguous

---

## Concept Schema (current as of 2026-06-24)

Every concept must conform to this exact JSON shape:

```json
{
  "id": [integer, max(existing_id) + 1 — never reuse gaps],
  "term": "[2-5 words, Title Case, sayable and memorable — see term-style-guide.md v2.0]",
  "category": "[one of the 14 valid categories — see below]",
  "source": "[legacy: still required on new writes — see below]",
  "hook": "[one sentence, 8-12 words target, hard ceiling 14 — see hook-style-guide.md v2.0]",
  "plain": "[2-3 sentences, zero jargon, 350 char/~55 word ceiling — see plain-style-guide.md v2.2]",
  "analogy": "[one concrete real-world scenario, 1-2 sentences]",
  "prompt": "[one question that helps someone apply this in real life]",
  "collection_id": [integer or null],
  "related_ids": [array of integer IDs, or [] — 3-5 preferred, cross-category links prioritised],
  "editors_pick": [boolean, default false — editorial standout flag],
  "timestamp": [integer seconds or null],
  "duplicate_of": [integer original-concept ID, or null — set by publish-batch for cross-episode repeats]
}
```

### Valid categories (14)

Alphabetical: `business`, `creativity`, `finance`, `health`, `identity`,
`language`, `philosophy`, `power`, `psychology`, `relationships`, `science`,
`society`, `tech-ai`, `thinking`.

### Source field (legacy)

Still required on new concept writes during the transition. Must be one of:
- `core` — foundational/universal
- `cw` — Chris Williamson / Modern Wisdom
- `ah` — Alex Hormozi
- `dk` — Dan Koe

The site UI no longer reads or displays this field. It will be retired from
the agent pipeline and Airtable in Group C.

### collection_id field

- `null` = concept not yet placed in a collection (default for the original 163)
- `1` to `6` = foundational curated collection (see `collections.json`)
- `10+` = episode-based collection (assigned when the episode is processed)

### Tech-AI category — special rule

Concepts in `tech-ai` must pass the **15-year-old analogy test**: a smart
15-year-old must be able to grasp the concept from the analogy alone, with
zero prior technical knowledge. If the analogy requires assumed familiarity
with computing, networking, or AI specifics, the concept fails this test
and either needs a better analogy or doesn't belong in this MVP.

### Editorial standards (v2.0 — see hook-style-guide.md / term-style-guide.md / plain-style-guide.md for full rules)

- Hooks must be punchy, specific, and feel something before they're understood — not generic
- Analogies must be concrete (a specific scenario), not abstract
- Plain explanations must pass the repeat-back test: a friend could explain the mechanism back five minutes later, not just recall a phrase
- Prompts must be actionable today, not theoretical
- No scenario, image, or example may repeat across hook/plain/analogy/prompt on the same card
- Reject concepts that are too obvious, too niche, or too abstract

---

## Scoring rubric

Every extracted concept is scored on four dimensions, 1–10 each. The composite score is the average. **Minimum composite for approval: 6.0.**

### Universality (1–10)

- **10:** Applies to virtually everyone regardless of profession, culture, or age
- **8:** Applies to most educated adults across Western professional contexts
- **5:** Applies to many but not most — depends on life stage or situation
- **3:** Niche — applies only to specific professions or contexts
- **1:** Only useful to a very narrow audience

### Actionability (1–10)

- **10:** Someone could apply this within 24 hours of reading it
- **8:** Useful immediately as a lens for interpreting current situations
- **5:** Valuable mental model but not directly actionable
- **3:** Mostly theoretical with vague practical implications
- **1:** Pure philosophy with no connection to daily action

### Novelty (1–10)

- **10:** Counterintuitive, rarely discussed, genuine "aha" moment
- **8:** Known in certain circles but underknown to the general professional
- **5:** Familiar concept but rarely articulated this precisely
- **3:** Commonly discussed in self-improvement content
- **1:** Everyone already knows this — adds no value

### Conversation value (1–10)

- **10:** Using this term correctly would noticeably impress someone intelligent
- **8:** Adds credibility in professional or intellectual conversation
- **5:** Useful vocabulary but not status-shifting
- **3:** Common vocabulary anyone could use
- **1:** Using this term might actually sound awkward or try-hard

---

## Field-by-field quality checks

### Term

**Full standard: term-style-guide.md (v2.0).** Short version:
- 2–5 words, Title Case, memorable, sayable out loud by a fluent non-native speaker
- Concrete imagery beats abstract labels ("The Velvet Rope Effect" over "Exclusivity-Driven Value Perception")
- Real, citable, exotic-sounding vocabulary is PRESERVED, not simplified (Hormesis, Dunning-Kruger) — novelty is part of the value
- Named/coined terms are exempt from rewriting entirely
- No overlap with hook — check explicitly, side by side, every time
- Specificity/mechanism beats category label ("Three Prices, One Decoy" over "Good, Better, Best")
- If it isn't broken, don't fix it — many older terms are already good
- **Examples of good:** "Steelmanning", "Asymmetric Risk", "Parental Attribution Error"
- **Examples of bad:** "Thinking about how people reason", "The idea that we should listen more"

### Category

- Exactly one of: finance | psychology | thinking | power | relationships | language | business | identity | health | philosophy | society | creativity | science | tech-ai
- When in doubt between two, ask: where would someone most want to find this when searching?
- `language` is the flagship category — covers vocabulary, rhetoric, framing, speaking, and writing. Both knowing the right word AND the skill of expressing it clearly.
- `business` is for building, selling, scaling — not general career advice
- `identity` is for self-concept, ego, values, personal narrative — not general psychology
- `tech-ai` requires the 15-year-old standard: if a curious teenager couldn't follow the analogy, rewrite it
- `science` is for how knowledge is made and evaluated — not specific scientific facts
- `society` is for patterns at civilisational or cultural scale — not interpersonal dynamics

### Source

- `cw` — originated with or prominently discussed by Chris Williamson / Modern Wisdom
- `ah` — Alex Hormozi
- `dk` — Dan Koe
- `core` — universal concept that predates any modern voice (e.g., Opportunity Cost, Loss Aversion)
- When a podcast discusses an old concept, use `core`, not the host's initials

### Hook

**Full standard: hook-style-guide.md (v2.0).** Short version:
- Target 8–12 words, hard ceiling 14. One sentence preferred; two clauses only if clause 2 reframes/inverts/punches.
- Job: make the reader feel something before they understand anything — not explain, not summarise, hit.
- Voice blend: Dan Koe primary (internal trap), Hormozi + Naval secondary (blunt cost / compression), Sahil Bloom / Esther Perel seasoning (stakes / subtext)
- Front-load the trigger word — specific/surprising noun in the first 3 words, not buried at the end
- One dominant lever per hook, not several stacked
- No overlap with plain — must approach from a different angle, not a compressed restatement
- **Test:** would a sharp person screenshot this without the card?
- **Examples of good:**
  - "Your money making money on your money."
  - "The less you know, the more confident you feel."
  - "When the watchdog becomes the pet of what it's watching."
- **Examples of bad:**
  - "This concept is about how people make decisions."
  - "Loss aversion is when you don't want to lose things."

### Plain

**Full standard: plain-style-guide.md (v2.2).** Short version:
- 2 sentences default, target ceiling 350 chars / ~55 words / 3 sentences max. Hard ceiling always wins over vividness — fix over-length by cutting the weakest sentence, never by abstracting the surviving ones.
- Zero jargon — 21-word strip list (utilize, facilitate, phenomenon, cognitive, framework, leverage, etc.)
- Start mid-thought, never "X is when..." — but acronyms/named terms must still state their literal expansion somewhere in the field
- Concrete, specific wording over abstract noun phrases (word choice, not metaphor — that's analogy's job)
- Episode-sourced concepts MUST keep transcript-specific content (real names, examples, claims) — do not generalise away the actual source material. Only `core` (evergreen) concepts avoid fabricated precision.
- All-fields non-repetition — no scenario/image/fact may repeat across hook, plain, analogy, prompt
- **Repeat-back test:** would a friend, five minutes later, be able to explain the actual mechanism, not just recall a phrase?

### Analogy

- One concrete real-world scenario
- 1–2 sentences
- Must use specific, tangible imagery — not abstract description
- **Test:** Can you picture it vividly?
- **Good:** "You're more upset losing your wallet than happy finding one with the same amount inside."
- **Bad:** "It's like when you feel worse about negative outcomes than you feel good about positive ones."

### Prompt

- One question
- Specific and actionable today
- **Good:** "Where in your life are you accepting treatment you wouldn't accept if you valued yourself more?"
- **Bad:** "Think about how this applies to your life."
- **Good:** "Who in your life gives you advice while also having a stake in the outcome?"
- **Bad:** "Consider the role of incentives in advice."

---

## Category assignment rules

When a concept could fit multiple categories, use these tiebreakers:

| If the concept is primarily about... | Assign to |
|---------------------------------------|-----------|
| Money, investing, economic systems, risk capital | finance |
| Mental patterns, biases, emotions, self-awareness | psychology |
| Reasoning, decision-making, frameworks, mental models | thinking |
| Influence, control, status, negotiation | power |
| Connection, trust, conflict resolution, interpersonal EQ | relationships |
| Vocabulary, rhetoric, framing, speaking, writing, precise expression | language |
| Building, selling, scaling, offers, strategy | business |
| Self-concept, ego, values, identity, personal narrative | identity |
| Physical performance, sleep, energy, body, habits of the body | health |
| Meaning, ethics, stoicism, existential questions | philosophy |
| Culture, systems, politics, how groups behave at civilisational scale | society |
| Ideas, originality, taste, creative thinking, making things | creativity |
| Evidence, empirical thinking, research literacy, how knowledge is made | science |
| Technology, artificial intelligence, digital systems | tech-ai |

**Edge cases:**
- A psychological concept used in business → psychology (primary mechanism wins)
- A business concept with relationship implications → business (primary domain wins)
- A rhetorical tool that's also a thinking technique → language (specificity wins)
- A concept about who you are vs how you think → identity beats psychology
- An AI ethics concept → tech-ai beats philosophy (domain specificity wins)
- A societal pattern rooted in individual psychology → society if it operates at scale, psychology if it's individual
- Tech-AI concepts must always pass the 15-year-old analogy test — if the analogy requires technical knowledge, rewrite it before approving

---

## Rejection reasons — be liberal with these

Approving a bad concept is worse than rejecting a good one. The library's quality is the moat.

Common reasons to reject:
- "Too obvious" — most educated adults already know this
- "Too vague" — could mean anything in context
- "Analogy is abstract" — you can't picture it
- "Prompt is lazy" — asks for reflection without specificity
- "Hook is weak" — doesn't work standalone
- "Overlaps with [existing concept]" — too similar to reduce library value
- "Field-specific" — only useful to certain professions
- "Not actually a framework" — personal anecdote or opinion

---

## Editorial voice

The product speaks with a consistent tone. Every concept should sound like it came from the same mind.

- **Direct, not mealy-mouthed.** "This is how it works" beats "Some might argue that this could be seen as…"
- **Specific, not general.** Real scenarios beat hypothetical ones.
- **Respectful of the reader's intelligence.** Don't over-explain. Trust them to connect dots.
- **Warm, not clinical.** The analogy should feel like it came from a friend explaining something, not a textbook.
- **Confident, not arrogant.** State things clearly without performing expertise.

---

## Anti-patterns to avoid

### "Guru-speak" — reject if you see:
- "The truth is…"
- "What most people don't realize…"
- "The secret to success is…"
- "As I always say…"

### Self-help clichés — reject if the concept is:
- "You are the average of the five people you spend time with"
- "Mindset is everything"
- "Success is a choice"
- "Everything happens for a reason"

These aren't concepts. They're bumper stickers.

### Over-intellectualizing — reject if:
- The concept is simple but the explanation is academic
- The analogy uses philosophy references instead of concrete imagery
- The prompt reads like a graduate school essay question

---

## Quality review process

For every batch of extracted concepts:

1. **First pass — scoring.** Each concept gets scored on the four dimensions. Anything below composite 6.0 is rejected outright.

2. **Second pass — quality checks.** Run each remaining concept through the field-by-field checklist above. Reject anything that fails any check.

3. **Third pass — library fit.** Cross-reference against the existing library. If it overlaps more than 30% with an existing concept, reject or merge.

4. **Fourth pass — voice check.** Does this sound like it came from the same editorial mind as the other concepts? If not, edit or reject.

5. **Fifth pass — human gut check.** Would I feel embarrassed or proud if a sharp friend saw this concept on my site? Trust the gut.

---

## When you're uncertain — default to rejection

It is always correct to reject a concept if you're uncertain about its quality. The library's strength comes from what's NOT in it as much as what is.

Every week, you will reject more concepts than you approve. That's the right ratio. When you're approving too easily, quality is drifting.

---

## Evolving these rules

These rules are not fixed forever. As the library grows and the audience clarifies, refine them.

**Signals that the rules need updating:**
- Approval rate consistently above 80% → rules may be too lenient
- Approval rate below 40% → rules may be too strict, or the extraction prompt needs work
- User feedback reveals consistent confusion about certain concepts → specific field rules may need tightening
- New category or source added → rules section needs extension

**Stale editorial rules produce a stale library.** Revisit quarterly.
