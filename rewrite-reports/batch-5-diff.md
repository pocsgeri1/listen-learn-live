# Batch 5 — Diff Report

Autonomous mode. All 10 concepts diagnosed against all 5 style guides (not
just scanner `flags`). Self-check run via `tools/check-fields.js` — 0 hard
failures across the batch. Cross-batch repetition check run against
`rewrite-style-log.json` (last 10 entries, batch 4) — no repeats found.

---

## 190 — Friction Creates Value

| Field | Old | New |
|---|---|---|
| Hook | Let everyone in and it feels worthless. Make them apply and they'll pay attention. | Free access feels worthless; forcing people to apply makes them value it. |
| Plain | A small barrier raises perceived value. Application, survey, waitlist. Humans equate effort with worth. If you give instant access, they assume it's cheap. Make them qualify and they assume it's exclusive, even if the content inside is identical. | A small barrier, like a form or waitlist, raises perceived value because humans equate effort with worth. Instant access reads as cheap; making people qualify reads as exclusive, even when the content behind both is identical. |
| Analogy | Two Slack groups on the same niche. One is open to anyone. The other requires a five-question form. The second will have higher engagement and members convinced the insights are better, even if both share the same links. | The gated Slack group buzzes with attention; the open one, same links, sits ignored. |

Reason: hook was 2 sentences (hard rule violation); plain ran 5 sentences,
tightened to 2; analogy was 38 words (ceiling 20), cut to one image, one
sentence. Self-check: PASS all fields. Cross-batch: opener "The gated" —
no match in log or batch.

## 222 — Breath as the First Word

| Field | Old | New |
|---|---|---|
| Hook | Pause before speaking. It shifts the entire power dynamic instantly. | Pausing before you speak instantly shifts the entire power dynamic. |
| Plain | In high-stakes conversations, your breath should be the first thing you say. Taking a deliberate pause before responding slows the interaction, lowers anxiety, and signals control. You don't get points for quick comebacks in real life. Measured responses land harder and give you time to think. | In high-stakes conversations, your breath should come before your words. A deliberate pause slows the interaction, lowers anxiety, and signals control, while a fast comeback earns you nothing in real life. |
| Analogy | Someone insults you in a meeting. Instead of snapping back, you take a slow breath, count to three, then calmly say, "I need you to repeat that." The room shifts. You just took control without raising your voice. | Someone insults you in a meeting; you take a slow breath, then calmly ask them to repeat it. |

Reason: hook was 2 sentences; plain was 4 sentences, tightened to 2 and
removed "room" to avoid duplicating analogy's setting; analogy was 38 words
with dialogue, cut to 18. Self-check: PASS all fields (1 dismissed warn:
"bare -ing opener" on hook — gerund is the sentence's actual subject, not
a dangling opener). Cross-batch: opener "Someone insults" — no match.

## 477 — Goal as Lens

| Field | Old | New |
|---|---|---|
| Hook | A goal doesn't push you forward. It changes what you notice. | Setting a specific goal instantly changes what your mind notices around you. |
| Plain | *(unchanged — passes: 40w, 3 sentences justified, no jargon, no metaphor)* | |
| Analogy | Decide to buy a red Honda and you'll see them everywhere within a day. They didn't multiply, your attention did. Same with business ideas or collaborators: name the outcome and your brain starts filtering reality for what matters. | Decide to buy a red Honda and suddenly they're everywhere on the road. |

Reason: hook was 2 sentences, also avoided reusing "rewires" already in
plain; analogy was 38 words, cut to the strongest image only (13w).
Self-check: PASS all fields (2 dismissed warns: "bare -ing opener" on hook,
same reasoning as 222; "possible triad" on plain's "Information, people,
and opportunities" — literal enumeration, not rhetorical triad slop).
Cross-batch: opener "Decide to buy" — no match.

## 605 — Missed Call Leverage

| Field | Old | New |
|---|---|---|
| Hook | Calling back a missed call amazes customers. Almost no one does it. | It takes ten minutes and leaves customers stunned that anyone bothered. |
| Plain | Caller ID has existed for 20 years. Almost no business uses it to call back missed calls. When someone does, it creates disproportionate delight because it's so rare. Zero-cost way to surprise customers, and almost every business ignores it. | Caller ID has existed for 20 years, yet almost no business uses it to call back missed calls. When someone does, it creates disproportionate delight because it's so rare. It's a zero-cost way to surprise customers, and almost every business ignores it. |
| Analogy | You call a Lotus dealership. No answer. Ten minutes later, they call you back: "I was outside with a customer and saw I missed your call." You're stunned. Second time in 20 years a business has done this. | You call a Lotus dealership, get no answer, and later that day they call back. |

Reason: candidate scan flagged term/hook overlap ("missed", "call" shared
literally) — resolved by rewriting the hook around a different angle
(effort/reaction) instead of the term, since the term is the more specific,
sticky handle. Hook was also 2 sentences. Plain tightened from 4 to 3
sentences. Analogy was 38 words with embedded dialogue, cut to 15w and
moved its timing detail off "ten minutes" (now only in hook) to avoid a
duplicate detail between hook and analogy. Self-check: PASS all fields.
Cross-batch: opener "You call a" — no match.

## 607 — Doorman Fallacy

| Field | Old | New |
|---|---|---|
| Analogy | A railway station replaces ticket clerks with machines to save wages. Passengers lose the clerk who would spot that buying a ticket from the next station saves £15, a service that built loyalty but was invisible to finance. | An airline self-check-in kiosk saves staffing costs but misses the agent who'd rebook your delayed connection for free. |

Term (coined/named term — exempt), hook, and plain diagnosed as passing
unchanged. Reason for analogy rewrite: it was 38 words, but the deeper
issue was that it just restated plain's own ticket-machine/clerk example
verbatim — a same-image violation, not just a length one. Replaced with an
unrelated image (airline kiosk) so hook/plain/analogy no longer share a
scene. Self-check: PASS. Cross-batch: opener "An airline" — no match.

## 315 — Unpredictability Barrier

| Field | Old | New |
|---|---|---|
| Hook | If you can predict a smarter agent's moves, you're as smart as it is. Contradiction. | Predicting a smarter agent's next move would make you just as smart. |
| Plain | By definition, you cannot predict what a superintelligent system will do. If you could, you'd be operating at its level of intelligence, which contradicts the idea that it's smarter than you. It's like your dog trying to predict why you do a podcast. It's outside the dog's model of the world. | By definition, you cannot predict what a smarter-than-you system will do. If you could, you'd be operating at its level of intelligence, which contradicts the premise that it's smarter than you. |
| Analogy | You're playing chess against a grandmaster. If you can predict every move they'll make, you're playing at their level, so they're not really better than you. True intelligence gaps mean you can't see their strategy coming. | You're playing chess against a grandmaster whose every move you can predict in advance. |
| Prompt | Think of the smartest person you know. Now imagine they're 10x smarter. What decisions of theirs would you stop trying to predict, and how would that change the relationship? | Name the smartest person you know, then imagine them ten times smarter. Which of their decisions would you stop trying to predict? |

Reason: hook was 15 words (over 14 ceiling) and 2 sentences. Plain had a
metaphor embedded ("your dog trying to predict...") — hard rule violation,
that job belongs to analogy only; removed and tightened. Analogy was 36
words, cut to the chess image alone (14w) now that plain no longer
duplicates it with the dog metaphor. Prompt opened with "Think of," a
banned-opener variant — rewritten with "Name" and split into one question.
Self-check: PASS all fields. Cross-batch: opener "You're playing chess" —
no match.

## 623 — Commercial Innovation

| Field | Old | New |
|---|---|---|
| Plain | Commercial innovation means innovating on pricing, presentation, packaging, or distribution without changing the core product. 'Share a Coke' didn't invent a new drink; it put names on cans. Amazon Prime didn't invent new products; it changed how you pay and receive them. Often, these shifts create more value than product R&D. | 'Share a Coke' didn't invent a new drink, it put names on cans. Amazon Prime didn't invent new products, it changed how you pay and receive them. Innovating on pricing, packaging, or distribution, without touching the product itself, often creates more value than R&D. |
| Analogy | Selling shampoo in tiny bottles at airports for triple the per-ounce price isn't product innovation — it's commercial innovation. You're solving a different job: "I need shampoo but I'm leaving tomorrow and don't want a full bottle". | Tiny shampoo bottles at airports cost triple per ounce yet sell out every day. |

Term and hook diagnosed as passing unchanged. Reason: plain opened with
"Commercial innovation means..." — the exact banned "X means/refers to"
opener — rewritten to start mid-thought with the examples. Analogy had an
em-dash (hard rule) and ran 37 words with embedded dialogue; cut to the
single strongest image (14w), no em-dash. Self-check: PASS (1 dismissed
warn: "possible triad" on plain's "pricing, packaging, or distribution" —
literal enumeration). Cross-batch: opener "Tiny shampoo" — no match.

## 194 — Innovation Creates Wealth

| Field | Old | New |
|---|---|---|
| Hook | The rich don't steal wealth. They invent it from intellectual property. | The rich don't steal wealth; they invent it from intellectual property. |
| Plain | Wealth isn't zero-sum. Entrepreneurs create new value by turning ideas into companies. When investors buy equity, they're buying something that didn't exist last year: formalized imagination. No one lost money. New wealth entered the system. | Wealth isn't zero-sum. Entrepreneurs create new value by turning ideas into companies, and when investors buy equity, they're buying something that didn't exist last year: formalized imagination. No one lost money; new wealth simply entered the system. |
| Analogy | A software company raises four hundred thousand pounds for ten percent equity, valuing it at four million. That 3.6 million didn't come from anyone's savings account. It appeared because an idea became an asset someone believed in. | A startup raises four hundred thousand pounds for ten percent, now valued at four million. |
| Prompt | Think of the business you want to build. If you raised money for ten percent, where would the valuation come from? What idea or intellectual property would make someone believe it's worth something? | Name the business you want to build, then say what percent you'd sell for four million. What idea makes that number believable? |

Reason: hook was 2 sentences, joined with a semicolon. Plain ran 5
sentences (fragments), consolidated to 3. Analogy was 37 words with a
trailing explanation clause, cut to the number-driven image alone (15w).
Prompt opened with banned "Think of," rewritten with "Name" and tightened
to one question. Self-check: PASS all fields. Cross-batch: opener "A
startup raises" — no match.

## 212 — Modeling Vs. Teaching

| Field | Old | New |
|---|---|---|
| Hook | You learned how to fight by watching, not instruction. Most had terrible teachers. | You learned how to fight by watching, not instruction, and most had terrible teachers. |
| Analogy | If your dad solved every disagreement by slamming doors and your mom gave silent treatment for days, you downloaded that playbook. Now when your partner asks where you want to eat, you either shut down or explode. | Dad slammed doors, mom gave silent treatment, and now you shut down when your partner disagrees. |

Term and plain diagnosed as passing unchanged. Reason: hook was 2
sentences, joined into one at 14 words (at the ceiling). Analogy was 37
words across 2 sentences with a trailing example, cut to 16w, one scene.
Self-check: PASS (2 dismissed warns: hook 14w is within ceiling, just off
the 8-12 target; "possible triad" on plain's "yelling, conflict, or even
physical aggression" — literal enumeration). Cross-batch: opener "Dad
slammed doors" — no match.

## 223 — Something Else Is Coming Up

| Field | Old | New |
|---|---|---|
| Plain | When you have a strong emotional response that doesn't match the situation, saying "I can tell something else is coming up for me, not sure yet what it is" invites your partner into the moment instead of forcing you to handle it alone. It's vulnerable and prevents misattribution. | When a reaction doesn't match the situation, saying "I can tell something else is coming up for me" invites your partner into the moment instead of leaving you to handle it alone. It's vulnerable, and it keeps your partner from blaming themselves for something that isn't about them. |
| Analogy | Your partner mentions dinner plans and you feel inexplicably upset. Instead of snapping or withdrawing, you say, "I'm having a bigger reaction than this deserves. Something else is happening, give me a second to figure it out." | Your partner mentions dinner plans and you feel inexplicably upset, so you name it out loud instead of snapping. |

Term, hook, and prompt diagnosed as passing unchanged. Reason: plain ended
on "prevents misattribution" — clinical jargon that fails the plain-English
test, replaced with a concrete consequence; also trimmed to stay under the
55-word ceiling after the fix. Analogy had embedded dialogue and ran 34
words, cut to one sentence (19w). Self-check: PASS all fields. Cross-batch:
opener "Your partner mentions" — no match.

---

## Summary

- Clean (passed self-check, no needs_human): 10 / 10
- `needs_human`: 0
- Candidates remaining after this batch: 90 of 100 (scan not yet stale,
  refill triggers under ~10 remaining)
