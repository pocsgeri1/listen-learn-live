# Batch 14 Diff Report

**Concepts processed:** 592, 231, 48, 237, 238, 396, 516, 28, 46, 127
**Date:** 2026-08-03

---

## ID 592 — Horsepower as Marketing Metric

| Field | Old | New |
|-------|-----|-----|
| hook | Matthew Boulton invented horsepower to sell steam engines. The metric wasn't science, it was persuasion. | Boulton created horsepower not to measure engines but to sell them. |
| analogy | A software company selling automation creates a metric: 'hours saved per week.' Customers couldn't compare products before, but now they see '40 hours saved per month' and the ROI is obvious. | Early coal sellers weighed each sack at the door; the scale turned 'trust us' into a receipt. |

**Fields changed:** hook, analogy
**Self-check:** PASS (checker run 1)
**Cross-batch analogy check:** "Early coal sellers" — not in log. CLEAR.

---

## ID 231 — Reputation Management

| Field | Old | New |
|-------|-----|-----|
| hook | Living for the imaginary audience that's barely watching. | You perform for an audience that forgot you existed five minutes ago. |
| plain | You treat every moment of visibility as a potential threat to how others perceive you. You're not experiencing anything — you're building a case against criticism that hasn't even been voiced yet. Every choice becomes a calculated move to avoid judgment. | You treat every moment of visibility as a potential threat to how others perceive you. Every choice becomes a calculated move to defend against criticism that hasn't even been voiced yet. The result is that you perform rather than participate. |
| analogy | Walking through your office believing everyone's drafting a performance review of you in real time. Even grabbing coffee becomes strategic — do I look lazy? Too social? The jury never stops deliberating. | A dinner guest who spends the whole meal rehearsing what the host will say about them after they leave. |

**Fields changed:** hook, plain, analogy
**Self-check:** PASS (checker run 2, after fixing "you're not X, you're Y" pattern)
**Cross-batch analogy check:** "A dinner guest" — not in log. CLEAR.

---

## ID 48 — Reversion to the Mean

| Field | Old | New |
|-------|-----|-----|
| hook | Extreme results rarely repeat. Average always comes back. | Outlier results pull the next result back toward average. |
| analogy | A basketball player who had the best game of his career will likely perform more average next game — not because he got worse, but because the peak was a statistical outlier. | After winning ten straight coin flips, the next ten still average out to five. |

**Fields changed:** hook, analogy
**Self-check:** PASS (checker run 2, after shortening hook from 16w to 9w)
**Cross-batch analogy check:** "After winning ten" — log has "After 100 auditions" (id 123); first 3 words differ at word 2. CLEAR.

---

## ID 237 — Trapped in the Story

| Field | Old | New |
|-------|-----|-----|
| hook | The diagnosis was supposed to help. Now you can't imagine life without it. | You stopped having the diagnosis and started being it. |
| plain | When a mental health label becomes so central to your self-concept that you can't imagine yourself without it. You're not someone who occasionally struggles — you ARE your disorder. The diagnosis was meant to help, but it became a cage because you built your entire personality around it. | A mental health label can shift from tool to identity when you stop seeing it as a description of what you experience and start using it to explain everything you are. The diagnosis was useful once; now it's the story you tell before anyone asks. |
| analogy | Getting a nickname in middle school and still introducing yourself that way at 30. What was meant to be descriptive became definitional, and now you don't know who you'd be without it. | The cast comes off at week six, but the arm stays bent for months from habit not fracture. |

**Fields changed:** hook, plain, analogy
**Self-check:** PASS (checker run 1)
**Cross-batch analogy check:** "The cast comes" — not in log. CLEAR.

---

## ID 238 — Radicalization Through Empathy

| Field | Old | New |
|-------|-----|-----|
| hook | The algorithm weaponizes your compassion. You can't out-care the feed. | The feed turns your outrage into proof you care, then demands more. |
| analogy | You donate to one cause, then the algorithm shows you ten more. Soon you're convinced anyone not as outraged as you is complicit. You're not more moral — you're just more exhausted. | Charity fundraisers who switched to showing individual children instead of statistics tripled donations but burned out volunteers inside six months. |

**Fields changed:** hook, analogy
**Self-check:** PASS (checker run 2, after trimming hook from 15w to 12w)
**Cross-batch analogy check:** "Charity fundraisers who" — not in log. CLEAR.

---

## ID 396 — Worst-Case Is a Safe Place

| Field | Old | New |
|-------|-----|-----|
| hook | Imagining catastrophe feels safer than admitting you don't know. | The brain prefers a vivid disaster over the blankness of not knowing. |
| analogy | Before a job interview, you run 47 disaster scenarios in your head — stammering, forgetting your résumé, the interviewer hating you. None of it helps. You're just manufacturing certainty out of fear. | Boarding a flight then mentally cataloguing every crash you've heard of before the seatbelt clicks. |

**Fields changed:** hook, analogy
**Self-check:** PASS (checker run 1)
**Cross-batch analogy check:** "Boarding a flight" — not in log. CLEAR.

---

## ID 516 — Minimum Viable Offer

| Field | Old | New |
|-------|-----|-----|
| hook | Your first product will be terrible. Ship it anyway. | Get paid for something imperfect today rather than perfect in two years. |
| plain | A bare-bones service you can sell immediately to start learning. A $500 consulting package. A single freelance skill. Tutoring on one narrow topic. The goal isn't perfection, it's getting real feedback fast so you can iterate. Most people wait years to launch. This gets you paid within weeks. | A minimum viable offer is the smallest thing you can sell right now: a $500 coaching call, one freelance skill, tutoring on a single topic. The goal is real customer feedback within weeks, not a polished product launched two years from now. |
| analogy | Like a food truck testing one menu item before opening a restaurant — you learn what people actually want by serving them today, not by planning in a notebook for 18 months. | A pop-up stall at Saturday market before signing a five-year commercial lease. |

**Fields changed:** hook, plain, analogy
**Self-check:** PASS (checker run 1)
**Cross-batch analogy check:** "A pop-up stall" — not in log. CLEAR.

---

## ID 28 — Moral Hazard

| Field | Old | New |
|-------|-----|-----|
| plain | When people are insulated from the downside of their actions, they behave more carelessly than if they'd personally pay the price. Banks, insurance, bailouts, all create this dynamic. | When people are insulated from the downside of their actions, they behave more carelessly than if they'd personally pay the price. Any institution that absorbs losses for someone else creates this dynamic. |
| analogy | A trader at a bank makes huge bets with depositor money. If he wins, he gets a bonus. If he loses, taxpayers bail out the bank. He has every incentive to gamble. | A surgeon paid per operation, never per outcome, schedules twice as many procedures. |

**Fields changed:** plain, analogy
**Self-check:** PASS (checker run 2, after fixing triad of exactly 3 in plain)
**Cross-batch analogy check:** "A surgeon paid" — not in log. CLEAR.

---

## ID 46 — Narrative Control

| Field | Old | New |
|-------|-----|-----|
| plain | The ability to shape how events, people, or ideas are perceived through the story you tell about them. Politicians and brands do this professionally, but everyone competes to control how they're understood. | The ability to shape how any situation is perceived through the story you tell about it. Politicians and brands do this professionally, but everyone competes to control how they're understood. |
| analogy | Two people describe the same argument to a mutual friend. Each version sounds like they're the reasonable one. Whoever tells it first and most convincingly often wins, regardless of what actually happened. | Whoever reaches the reporter first shapes the headline the other person spends weeks correcting. |
| prompt | Think of the last time someone misrepresented you. Did you let their version stand, or did you tell your own story? What would you say differently if you got a do-over? | When did someone else's version of events about you go unchallenged? What would you say now if you could reframe it? |

**Fields changed:** plain, analogy, prompt
**Self-check:** PASS (checker run 2, after fixing triad of 3 in plain and banned "Think of" opener in prompt)
**Cross-batch analogy check:** "Whoever reaches the" — not in log. CLEAR.

---

## ID 127 — Self-Actualize → Self-Monetize → Self-Transcend

| Field | Old | New |
|-------|-----|-----|
| hook | Master something real. Make money from it. Then use it to serve beyond yourself. | Dan Koe's path runs from mastery to income to something larger than either. |
| plain | Dan Koe's three-stage framework: pursue mastery because you genuinely care, turn that mastery into income, then use your platform and resources to grow beyond your own interests. | Dan Koe's three-stage model: pursue mastery because you genuinely care, turn that mastery into income, then use your platform and resources to grow beyond your own interests. |
| analogy | Stage 1: become a genuinely great cook. Stage 2: open a restaurant. Stage 3: train other chefs and build a food culture. Each stage builds on the foundation of the previous one. | A boxer who trains obsessively, wins the title, then opens a gym for kids in his old neighborhood. |

**Fields changed:** hook, plain, analogy
**Self-check:** PASS (checker run 1)
**Cross-batch analogy check:** "A boxer who" — not in log. CLEAR.

---

## Summary

10 concepts processed, 10 changed, 0 no-changes, 0 needs_human. Checker passed after 2 rounds (round 1 caught: 231 "not X, you're Y" in plain; 48 hook 16w over ceiling; 238 hook 15w over ceiling; 46 prompt banned opener; 28 triad of 3; 46 triad of 3). All 6 issues resolved in round 2. Zero em-dashes in any patched field. Zero needs_human flags.
