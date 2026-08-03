# Batch 27 Diff Report

Processed: 584, 587, 125, 388, 3, 131, 413, 537, 551, 562
Date: 2026-08-03
Checker: autonomous agent, claude-sonnet-4-6

---

## ID 3 — Confirmation Bias

| Field | Old | New |
|---|---|---|
| plain | "Your brain filters information to match what you already believe — you unconsciously ignore evidence that proves you wrong and notice evidence that proves you right." | "Your brain filters information to match what you already believe. You unconsciously ignore evidence that proves you wrong and notice evidence that proves you right." |
| analogy | "When you buy a red car, suddenly you see red cars everywhere. They were always there — you just notice them now because your brain is primed to." | "Buy a red car and red cars appear everywhere; they were always there, just invisible to you before." |

**Self-check:** PASS — 0 hard failures. Em-dash removed from plain and analogy. Analogy trimmed from 28w to 18w (well within 20-word ceiling).
**Cross-batch analogy check:** Opener "Buy a red" not in log. Core image (red car noticing) not repeated. Approved.

---

## ID 125 — Productize Yourself

| Field | Old | New |
|---|---|---|
| hook | "Stop trading hours for money. Package what you know and sell it while you sleep." | "Package what you know and sell it while you sleep." |
| analogy | "A consultant charges €200 per hour for advice. But the same consultant who writes a €97 course sells their advice to 10,000 people simultaneously without showing up." | "A consultant who writes a course earns from ten thousand students at once, while the hourly version earns from one." |

**Self-check:** PASS — 0 hard failures. Hook was 15w (two sentences, bare -ing opener "Stop trading") — reduced to 10w, 1 sentence. Analogy trimmed from 27w to 20w (at ceiling, passes).
**Cross-batch analogy check:** Opener "A consultant who" distinct from log entry id 126 ("A writer with"). Approved.

---

## ID 131 — Sovereign Individual

| Field | Old | New |
|---|---|---|
| hook | "The person who can't be fired because nobody hired them in the first place." | "The person who cannot be fired because nobody hired them in the first place." |
| plain | "Someone who controls their own time, income streams, and location, not dependent on any single employer, system, or geography (also known as the sovereign individual). Made newly possible by the internet and digital work." | "A sovereign individual controls their own time, income streams, and location, without depending on any single employer, system, or geography. Made newly possible by the internet and digital work." |
| analogy | "The opposite of someone who can be made redundant with a single email. The sovereign individual can't be fired — because nobody hired them in the first place." | "A street musician earns from the crowd, not a boss; no restructuring email ends her working day." |

**Self-check:** PASS — 0 hard failures. Analogy verbatim repeated the hook — rewritten. Plain parenthetical redundancy removed. Em-dash removed. Analogy 17w (within ceiling).
**Cross-batch analogy check:** Opener "A street musician" not in log. Image is original. Approved.

---

## ID 388 — The Unified Theory of Attractive

| Field | Old | New |
|---|---|---|
| hook | "If you're comfortable with yourself, everything else falls into place." | "If you are comfortable with yourself, everything else falls into place." |
| plain | "Attractiveness isn't about having the right opener, texting game, or date strategy (the technical term: non-neediness as unified theory of attractiveness). It's about being comfortable with who you are and willing to share it with the world. Men who struggle with women constantly ask, 'What does she want to hear?' Men who succeed just show up." (56w) | "Attractiveness is not about having the right opener, texting strategy, or date script. It is about being comfortable with who you are and willing to share that with the world. Men who struggle constantly ask what she wants to hear; men who succeed just show up." (46w) |
| analogy | "A guy who's amazing at meeting girls in bars but bombs on dates doesn't exist. If you've got the fundamentals, comfort with yourself, the rest is just execution." | "The guy who bombs every date but dazzles at bars does not exist. Solid fundamentals carry across every room." |

**Self-check:** PASS — 0 hard failures. Plain was 56w (over 55-word ceiling) and contained jargon parenthetical — rewritten to 46w. Analogy rewritten: old version had weak second sentence that trailed off. New analogy 19w (within 20-word ceiling).
**Cross-batch analogy check:** Opener "The guy who" not in log. Approved.

---

## ID 413 — Protected Hour Strategy

| Field | Old | New |
|---|---|---|
| plain | "Most people vastly overestimate the time required to start something new. One focused hour per day, taken when the world isn't demanding your energy, compounds into 365 hours of real progress annually. That's enough to become unrecognizable." | "Most people vastly overestimate the time required to start something new. One focused hour per day, taken when the world is not demanding your energy, compounds into 365 hours of real progress annually. That is enough to become unrecognizable." |
| analogy | "A single protected hour is like planting a tree every day for a year. You're not clearing forests — you're quietly building a grove that didn't exist before." | "One brick laid at the same hour each morning; a year later, a wall nobody saw being built." |
| prompt | "What's one project you'd start today if you believed one daily hour was actually sufficient?" | "What is one project you would start today if you believed one daily hour was actually sufficient?" |

**Self-check:** PASS — 0 hard failures. Old analogy used banned "is like" simile opener and contained em-dash; new analogy is a vivid concrete image, 18w, no banned openers.
**Cross-batch analogy check:** Opener "One brick laid" not in log. Image distinct from log entry id 521 (pottery students) and id 142 (first iPhone). Approved.

---

## ID 537 — The Replication Crisis

| Field | Old | New |
|---|---|---|
| analogy | "A recipe that only works once, for one cook, in one kitchen, isn't a recipe — it's a fluke. A real result works when anyone runs it again." | "A recipe only one cook has ever pulled off is not a recipe; it is a lucky afternoon." |
| prompt | "Pick a 'studies show' fact you repeat often. Have you ever checked whether it held up when others tried to replicate it?" | "Pick a studies-show fact you repeat often. Have you ever checked whether it held up when others tried to replicate it?" |

**Self-check:** PASS — 0 hard failures. Old analogy was 29w with em-dash; new is 18w, clean. Prompt curly-quote removed.
**Cross-batch analogy check:** Opener "A recipe only" not in log. Approved.

---

## ID 551 — Equivocation

| Field | Old | New |
|---|---|---|
| plain | "A term is used in one sense early in an argument and a different sense later, making the conclusion seem to follow when it doesn't (also known as *equivocation*). The deception hides in a word that quietly changed jobs." | "A term is used in one sense early in an argument and a different sense later, making the conclusion seem to follow when it does not. The deception hides in a word that quietly changed jobs." |
| analogy | "'Nothing is better than lifelong health. A cheap snack is better than nothing. So a cheap snack is better than lifelong health.' — 'nothing' switched meaning between sentences." | "Nothing beats lifelong health; a cheap snack beats nothing; so a cheap snack wins. One word, two jobs." |

**Self-check:** PASS — 0 hard failures. Term (1w) is coined/technical, exempt from 2-5 word rule. Hook (6w) below target but passes; no hard rule. Old analogy was 27w with em-dash; new is 18w. Plain parenthetical removed.
**Cross-batch analogy check:** Opener "Nothing beats lifelong" not in log. Approved.

---

## ID 562 — Lifestyle Creep

| Field | Old | New |
|---|---|---|
| plain | "As income rises, spending quietly expands to meet it, so the raise disappears into a hundred small upgrades that become the new baseline (some call this lifestyle creep). A year later you're earning more and no better off." | "As income rises, spending quietly expands to meet it, so the raise disappears into a hundred small upgrades that become the new baseline. A year later you are earning more and no better off." |
| analogy | "You earn 20% more, upgrade the car, the flat, the subscriptions — and a year later you're saving exactly as little as before, just surrounded by nicer things." | "Each pay rise buys a slightly more expensive version of the same month, leaving the savings gap unchanged." |
| prompt | "Compare your spending now to two years ago. What new 'essentials' appeared that didn't exist before?" | "Compare your spending now to two years ago. What new essentials appeared that did not exist before?" |

**Self-check:** PASS — 0 hard failures. Plain had redundant parenthetical "(some call this lifestyle creep)" — removed. Old analogy (28w) used em-dash and overlapped heavily with hook content; new analogy is 18w, distinct image. Prompt curly-quotes removed.
**Cross-batch analogy check:** Opener "Each pay rise" not in log. Approved.

---

## ID 584 — Emergent Behavior

| Field | Old | New |
|---|---|---|
| analogy | "No single ant knows how to build a colony, yet thousands following tiny instinctive rules produce tunnels, farms, and defenses. The design lives in the swarm, not any ant." | "No ant has the blueprints, yet thousands of them collectively produce tunnels, farms, and temperature control." |

**Self-check:** PASS — 0 hard failures. Old analogy was 29w (over ceiling); new is 16w. "Possible triad" warning verified — "tunnels, farms, and temperature control" is descriptive enumeration, not rhetorical poster triad.
**Cross-batch analogy check:** Opener "No ant has" not in log. Core image (ants building colony) is distinct from log. Approved.

---

## ID 587 — Selling Without a Brand

| Field | Old | New |
|---|---|---|
| analogy | "A company launches a new product but only lets hostile bloggers announce it. No ads, no website, no controlled messaging. Predictably, the launch fails and everyone blames the product." | "A firm with no ad budget that lets only critical journalists announce its products, then wonders why no one buys." |
| prompt | "Pick one government policy you think is unpopular mainly because of how it's framed. How would you reframe it as a fair trade to increase buy-in?" | "Pick one government policy you think is unpopular mainly because of how it was framed. How would you reframe it as a fair trade to increase buy-in?" |

**Self-check:** PASS — 0 hard failures. Old analogy was 29w, 3 sentences; new is 20w (at ceiling), 1 sentence. Prompt contraction removed.
**Cross-batch analogy check:** Opener "A firm with" not in log. Approved.

---

## Summary

10/10 concepts processed. 0 hard failures. 0 needs_human. Fields changed: 3 (plain, analogy), 125 (hook, analogy), 131 (hook, plain, analogy), 388 (hook, plain, analogy), 413 (plain, analogy, prompt), 537 (analogy, prompt), 551 (plain, analogy), 562 (plain, analogy, prompt), 584 (analogy), 587 (analogy, prompt). All patched into concepts.json.
