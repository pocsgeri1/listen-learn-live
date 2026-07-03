# Batch 4 — Autonomous Rewrite Diff Report

Run mode: autonomous (1 batch). All 10 concepts diagnosed against all 5 style guides, not just scanner `flags`. Fields changed only where diagnosis independently confirmed a violation.

## Post-review revisions (Gergely, before push)

After the autonomous pass below, Gergely reviewed and made these changes before going live. Tables further down show the ORIGINAL autonomous-run "New" values; this list is the authoritative final state (also reflected in `concepts.json`):

- **638 — term reverted.** "Single-Contact Trap" → back to original "Relationship Paranoia." The autonomous rename was a judgment call with no scanner flag behind it; Gergely didn't want it.
- **310 — plain edited.** Inserted "(i.e. AI)" behind "A system smart enough" per Gergely's direct request, so the plain now reads "...A system smart enough (i.e. AI) to out-perform humans..."
- **New rule: analogy hard ceiling 25 → 20 words** (target 10-18 unchanged), "one clear sentence" language strengthened. Cascading trims applied to 184, 210 (margin), 403, 483.
- **New rule: hooks must be exactly 1 sentence, no exceptions.** The old "two clauses allowed if clause 2 reframes/inverts" exception is removed entirely. Cascading rewrites applied to 184, 210, 310, 317.
- **486 — plain edited (caught by the new `tools/check-fields.js` checker, not by Gergely).** "every framework you use" → "every role you take on." "Framework" is on the banned jargon list; this slipped through the original hand-check.
- Final field values for all 10 concepts, post-revision, verified with `node tools/check-fields.js` — 0 hard-rule failures.

Style guides and `docs/concept-rewrite-prompt.md` updated to match the two new rules (analogy-style-guide.md, hook-style-guide.md v2.1).

---

## 184 — Situational Model

| Field | Old | New | Self-check |
|---|---|---|---|
| Plain | "People buy when you answer four things in order: where am I now, where do I want to be, what's blocking me, what's the easiest next step. Your pitch must map all four, or the buyer stalls. Most people skip the obstacle or assume the path forward is obvious. It never is." | "People buy when you answer four things in order: where they are now, where they want to be, what's blocking them, and the easiest next step. Skip the obstacle or leave the path vague, and the buyer stalls." | pass — was 4 sentences/~52w, cut to 2 |
| Analogy | Labeled 4-part list ("Current: ... Desired: ... Obstacle: ... Path: ..."), 38w, explanation tail | "A gym ad that skips 'no time for workouts' and jumps straight to 'get fit' loses the tired parent scrolling past it." | pass — was list-format, not a scene; over ceiling |

Not flagged by scanner but caught in diagnosis: plain's sentence count, analogy's list-structure (not a real scene) and explanation tail.

---

## 210 — Perspective Seeking

| Field | Old | New | Self-check |
|---|---|---|---|
| Plain | Contained a quoted line ("Tell me how you came to that") that duplicated analogy's quoted line | Rewritten with no quote, refocused on mechanism (why it works) vs. hook's instruction | pass |
| Analogy | 40w, "Your friend says..." with explanation tail, quoted line duplicated plain's quote | "Your coworker insists the merger will fail; you ask what convinced her, and she walks you straight through her reasoning." | pass |

Not flagged by scanner: plain/analogy shared the same quoted-dialogue device — caught by the cross-field image check, not a mechanical rule.

---

## 310 — Meta-Invention

| Field | Old | New | Self-check |
|---|---|---|---|
| Term | "Meta-invention" (lowercase second word) | "Meta-Invention" | Title Case fix |
| Plain | 4 sentences, ended "It's not a tool. It's a replacement inventor." (banned construction) | "Every past invention was a fixed tool that did one thing forever. A system smart enough to out-perform humans at science and engineering can improve itself and then build whatever comes next, so the process of inventing no longer needs a human in the loop." | pass |
| Analogy | 39w, 3 sentences, "AI is like hiring a scientist who hires 10 more..." (simile crutch + explanation tail) | "Edison never built a machine that designed better light bulbs; this one does, then builds whatever's next." | pass |

Hook (13w) diagnosed and kept — not a banned fragment, clears format and single-lever checks.

---

## 317 — Singularity Event Horizon

| Field | Old | New | Self-check |
|---|---|---|---|
| Plain | Opened "The point where AI improves..." (dictionary-style opener); built an "Imagine a new iPhone version..." scenario (metaphor — analogy's job); 51w/4 sentences | "AI keeps improving itself faster than any previous technology, until it moves past the speed a human can track or understand (this acceleration point is called the singularity). Once you're past it, new capabilities appear faster than anyone can learn what they even do." | pass |
| Analogy | 39w, 3 sentences, named the term directly ("That's singularity"), used non-traveling idiom "lost the plot" | "Blink, and the phone in your hand is already three models behind." | pass |
| Prompt | Passed the 5 mechanical checks, but structurally near-identical to sibling concept 310's prompt ("Now imagine X escalates, what disappears") — these two concepts are cross-referenced in each other's `related_ids` | "Pick one skill you're proud of right now. In five years, will it still be the fastest way to do that job?" | pass — editorial judgment call, not a scanner flag |

---

## 403 — The Re-Exposure Effect

| Field | Old | New | Self-check |
|---|---|---|---|
| Term | "Reminder Systems for Personal Growth" (5w, generic category label, "X for Y" academic construction) | "The Re-Exposure Effect" | mechanism-named, no hook overlap |
| Hook | "You don't need new ideas. You need to remember the ones you have." (banned "not X, need Y" pattern) | "Every self-help book says something you already knew and forgot." | pass |
| Plain | "isn't about X... It's about Y" (banned construction), 4 sentences | "Growth rarely comes from a brand-new principle: it comes from hearing the same handful of core truths often enough that they finally stick. Religion used to deliver that repetition through ritual; podcasts do the job now." | pass |
| Analogy | Triad ("walk, sleep more, say how you feel"), banned "It's not X, it's Y", 39w | "Dentists mail the same reminder postcard every six months, not because you forgot dentistry exists, but because you forgot to floss." | pass |

---

## 483 — The Certainty Trap

| Field | Old | New | Self-check |
|---|---|---|---|
| Term | "The Known Path Fallacy" (scanner-flagged: shares "known, path" with hook) | "The Certainty Trap" | confirmed real overlap, not a false positive |
| Plain | "not because it works, but because it's familiar" (banned-adjacent construction), triad ("school, job, retirement") | "Familiarity, not effectiveness, is what keeps you on the default script: school, then a steady job. Staying dodges the discomfort of uncertainty, even while the path is visibly leading you somewhere you don't want to end up." | pass |
| Analogy | 39w flagged; also closed on "at least you know what to expect" — near-verbatim repeat of hook's own closing line | "Three generations of your family took the same accounting job, and none of them liked it, but you're filling out the application anyway." | pass |
| Prompt | "the one area where you're following the script" — hits the explicitly banned generic-scope phrasing ("an area of your life") | "Name the next milestone on the default script you're chasing right now, the promotion or the house. Did you choose it, or just never stopped to check?" | pass — not scanner-flagged, caught in diagnosis |

---

## 486 — Construct-Aware Stage

| Field | Old | New | Self-check |
|---|---|---|---|
| Plain | Dictionary-style opener ("At the construct-aware stage..."), triad ("founder, parent, or thought leader") | "You can hold your own identity, and every framework you use, as a useful fiction rather than an absolute truth (developmental psychologists call this the construct-aware stage). That lets you throw yourself into being a founder or a parent with full commitment, without mistaking the role for who you actually are." | pass |
| Analogy | 40w, named the term directly ("construct-aware founder"), explanation-tail sentence | "Meryl Streep plays a killer on stage every night, then drives home and walks the dog like nothing happened." | pass |
| Prompt | "role you play in life right now" borders on banned generic-scope phrasing; 3 stacked questions | "Pick the role you're playing hardest right now, at work or at home. If you stopped believing it was who you are, what would you do differently tomorrow?" | pass — not scanner-flagged, caught in diagnosis |

Term and hook diagnosed and kept ("Construct-Aware Stage" is a real developmental-psych term, no hook overlap).

---

## 638 — Single-Contact Trap

| Field | Old | New | Self-check |
|---|---|---|---|
| Term | "Relationship Paranoia" (misleading category label — reads as romantic-relationship anxiety; actual concept is a business/power dynamic) | "Single-Contact Trap" | mechanism-named — not scanner-flagged, caught in diagnosis |
| Hook | 15w (scanner-flagged, confirmed real) | "Account teams are too scared to skip past their contact to the real boss." | 14w, at ceiling |
| Analogy | 37w flagged | "The agency finds a million-dollar pricing fix and buries it in a slide deck the CFO will never see." | pass |

Plain (49w/3 sentences) and prompt diagnosed and kept — no hard-rule violations found.

---

## 599 — Famous Orders

| Field | Old | New | Self-check |
|---|---|---|---|
| Hook | "Celebrities' favorite orders simplify choice and drive sales." — format-legal but bone-dry, fails the relatability/emotion checkpoint explicitly named in the hook guide | "Mariah Carey's actual McDonald's order became a permanent menu item." | pass — not scanner-flagged, caught in diagnosis |
| Plain | Triad of names ("Travis Scott, Mariah Carey, Stormzy") + triad of verb phrases ("reduced... created... made...") — two separate triad violations | "McDonald's Famous Orders campaign took a celebrity's actual order, like Travis Scott's or Stormzy's, and turned it into a one-click menu item. It cut decision fatigue and made ordering feel like insider knowledge, a choice-reduction hack that just looks like celebrity endorsement." | pass |
| Analogy | Em-dash (scanner-flagged), triad of food items, 37w | "Tap the button with a rapper's face on it, and dinner's already decided for you." | pass |
| Prompt | Named the term directly ("create a Famous Order") — fails the strip-term test | "Pick one person your customers actually admire. If you built one pre-set bundle around their exact order or picks, what would be in it?" | pass — not scanner-flagged, caught in diagnosis |

Term kept unchanged — explicitly listed as an exempt, already-good example in term-style-guide.md.

---

## 625 — Founder-Led Premium

| Field | Old | New | Self-check |
|---|---|---|---|
| Hook | "Founder-led companies outperform management-led peers, consistently." — 6w, bone-dry/textbook register, and repeats "Founder-led" verbatim from the term (direct term/hook overlap) | "The person who built the company still signs off on where every dollar goes." | 14w, pass — overlap not scanner-flagged, caught in diagnosis |
| Plain | Triad ("frontline focus... bias for action... owner's mentality...") | "Companies run by their founder consistently outperform those handed to professional managers. Founders still talk to customers directly and treat every dollar like it's their own, because it is." | pass |
| Analogy | Em-dash (scanner-flagged), 37w, closed on explanation-tail ("the mental models are completely different"), used idiom "in front of the mast" (accessibility risk) | "Willie Walsh, who now runs British Airways' parent company, used to fly the planes himself." | pass |

Term kept unchanged — explicitly listed as an exempt, already-good example in term-style-guide.md.

---

## Cross-batch repetition check (analogy openers + images)

No prior log existed (`rewrite-style-log.json` created fresh this batch). All 10 analogy openers within the batch are distinct first words/phrases:

A gym ad (184) · Your coworker (210) · Edison (310) · Blink (317) · Dentists (403) · Three generations (483) · Meryl Streep (486) · The agency (638) · Tap (599) · Willie Walsh (625).

No repeated core images across the 10 cards.

## `needs_human`

None. All 10 concepts cleared self-check + cross-batch check within the correction cap.

## Summary

10 concepts processed, 10 clean, 0 needs_human. Candidates remaining after rescan: 415 (425 minus these 10).
