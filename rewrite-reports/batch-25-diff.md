# Batch 25 Diff Report

**IDs processed:** 159, 203, 206, 215, 248, 265, 294, 295, 300, 342
**Date:** 2026-08-03
**Validator:** tools/check-fields.js — PASS (0 hard fails, 6 warnings all verified by eye as acceptable)

---

## ID 159 — Lindy Effect

| Field | Old | New |
|---|---|---|
| analogy | "Shakespeare has been read for 400 years. The Lindy Effect says he'll be read for at least another 400. A viral TikTok trend from six months ago? Probably gone." | "Shakespeare read four centuries running; a viral sound from last spring already needs a nostalgia comeback to survive." |

**Fields changed:** analogy
**Self-check:** PASS. Analogy was 3 sentences/~30 words; new version is 1 sentence, 18 words. No banned opener. No em-dash.
**Cross-batch analogy check:** opener "Shakespeare read four" — no prior match in log. Approved.

---

## ID 203 — Feelings Don't Care About Facts

| Field | Old | New |
|---|---|---|
| hook | "Show someone proof and they'll reject it if it makes them feel stupid." | "Show someone proof and they will reject it if it makes them feel stupid." |
| analogy | "You show someone a dozen studies proving their political stance is wrong. If those studies make them feel attacked, they'll reject every word, even if the data is bulletproof." | "Twelve peer-reviewed studies land on the table; if they make the reader feel attacked, every one gets dismissed." |

**Fields changed:** hook, analogy
**Self-check:** PASS. Hook contraction normalized (14w, at ceiling — acceptable). Analogy was 2 sentences/~32 words; new is 1 sentence, 18 words. No banned opener.
**Cross-batch analogy check:** opener "Twelve peer-reviewed studies" — no prior match. Approved.

---

## ID 206 — Conversation Within a Conversation

| Field | Old | New |
|---|---|---|
| hook | "Tone, pauses, and posture communicate more than the words you choose." | "Body language broadcasts a second conversation nobody is saying out loud." |
| plain | "In high-stakes settings, the explicit conversation is only half of what's happening. How you react to bad news, when you object, how you walk away from a sidebar, all of it signals credibility or weakness. People read the subtext more than the words." | "In high-stakes settings, the explicit conversation is only half of what is happening. How you react to bad news, when you object, how you walk away from a sidebar; all of it signals credibility or weakness. People read the subtext more than the words." |
| analogy | "A lawyer hears damaging testimony but stays stone-faced. The jury thinks 'They expected that, must not matter.' Another lawyer flinches and objects frantically. The jury thinks 'They're hiding something.'" | "A lawyer hears damaging testimony and stays stone-faced; the jury clocks it as confidence rather than concealment." |
| prompt | "...your words didn't?..." | "...your words did not?..." |

**Fields changed:** hook, plain, analogy, prompt
**Self-check:** PASS. Old hook was a banned triad (tone, pauses, posture = exactly three). New hook: 11w, 1 sentence. Old analogy was 4 sentences; new is 1 sentence, 17 words. Plain comma before "all of it" replaced with semicolon.
**Cross-batch analogy check:** opener "A lawyer hears" — no prior match. Approved.

---

## ID 215 — The No-First Framework

| Field | Old | New |
|---|---|---|
| term | "The No-first Framework" | "The No-First Framework" |
| hook | "Say no before you soften it. Gratitude second." | "Lead with no; kindness lands better when it follows a clear refusal." |
| plain | "When declining something, lead with the refusal, then add kindness. Most people reverse it and say 'Thank you so much, I'd love to, but I can't.' The word 'but' erases everything before it. Instead: 'I can't make it. Really appreciate you thinking of me, though.'" | "When declining something, state the refusal first, then add warmth. Most people reverse this order, saying thank you first, but that but erases everything before it. Starting with no keeps the message honest and the relationship intact." |
| analogy | "Your boss invites you to a Saturday event. Bad: 'I'd love to come, but I can't.' Good: 'I can't make it. Thanks for the invite, hope it goes well.'" | "Doctors deliver bad news first, then the treatment plan; reversing the order leaves patients clinging to the caveat." |

**Fields changed:** term, hook, plain, analogy
**Self-check:** PASS. Old hook was 2 sentences (hard fail). New hook: 12w, 1 sentence. Old plain was ~65w with dialog format; new is 37w, 3 sentences. Old analogy was dialog/multi-sentence; new is 1 sentence, 18w.
**Cross-batch analogy check:** opener "Doctors deliver bad" — no prior match. Approved.

---

## ID 248 — Self-Love as Marketing Strategy

| Field | Old | New |
|---|---|---|
| term | "Self-love as Marketing Strategy" | "Self-Love as Marketing Strategy" |
| plain | "Companies rebrand insecurity-inducing products as instruments of self-care and confidence. You're sold an editing app, cosmetic procedure, or supplement under the guise of empowerment, but using it makes you more dependent. The rhetoric is liberation, the result is addiction." | "Companies rebrand insecurity-inducing products as instruments of self-care and confidence. You are sold an editing app, cosmetic procedure, or supplement under the guise of empowerment, but using it deepens dependence. The message is liberation; the result is addiction." |
| analogy | "A casino telling you gambling is self-expression. You feel a rush when you win, but the house designed the game to keep you playing, not to set you free." | "A dieting app celebrates your body confidence while tracking every calorie you eat." |

**Fields changed:** term, plain, analogy
**Self-check:** PASS. Term casing corrected. Old analogy was 2 sentences, ~32 words; new is 1 sentence, 13 words. "rhetoric" removed (jargon list), plain tightened.
**Cross-batch analogy check:** opener "A dieting app" — no prior match. Approved.

---

## ID 265 — California Wealth Tax

| Field | Old | New |
|---|---|---|
| hook | "Tax private property annually. Precedent breaks, 51% can vote for 49%." | "A net-worth tax sets a precedent the majority can widen every election." |
| plain | "Some states have proposed a tax on net worth, not income. That means taxing assets you already own and paid taxes on. Even if it starts at 1% for billionaires, it sets a precedent: the government can assess everything you own and take a cut every year. Over time, thresholds drop and rates rise." | "Some states have proposed a tax on net worth, not income. That means taxing assets you already own and already paid taxes on. Even if it starts at 1% for billionaires, the principle is established: government can assess everything you own and take a cut every year." |
| analogy | "Like if your neighbors voted to take your car because they need one and you have two, even though you bought it with money you already paid taxes on." | "Neighbors vote to charge you annual rent on your own car because you own two and they own zero." |
| prompt | "What's the first thing..." | "What is the first thing..." |

**Fields changed:** hook, plain, analogy, prompt
**Self-check:** PASS. Old hook was 2 sentences (hard fail). New hook: 12w, 1 sentence. Old analogy opened with "Like if" and was ~31w; new is 1 sentence, 19w. Plain trimmed from ~65w to 47w.
**Cross-batch analogy check:** opener "Neighbors vote to" — no prior match. Approved.

---

## ID 294 — Error Management Theory

| Field | Old | New |
|---|---|---|
| hook | "Evolution wired us for predictable mistakes. Better safe than sorry." | "Our brains were built to make certain mistakes because avoiding them cost too much." |
| plain | "Our brains are biased toward certain types of errors because the costs were asymmetric. Missing a real threat often meant death; seeing a threat that wasn't there just wasted energy. Men overestimate sexual interest because missing a mating opportunity was costly. Women overestimate threat because missing danger was deadly." | "When two types of errors carry different costs, natural selection favors the cheaper mistake. Missing a real threat often meant death; seeing a false threat just wasted energy. So the brain over-detects danger, over-reads social rejection, and overclaims sexual interest, each bias cheaper than the alternative." |
| analogy | "Smoke detectors go off when you burn toast because they're designed for false alarms. The cost of missing a real fire is catastrophic, so the system errs toward sensitivity." | "Smoke detectors trip on burnt toast because the cost of a missed fire outweighs ten false alarms." |
| prompt | "...if you'd ignored..." | "...if you had ignored..." |

**Fields changed:** hook, plain, analogy, prompt
**Self-check:** PASS. Old hook was 2 sentences (hard fail); motivational-poster cadence ("Better safe than sorry"). New hook: 14w, 1 sentence (at ceiling, acceptable). Old analogy was 2 sentences + explanation after image; new is 1 sentence, 17w. Old plain had em-dash; removed.
**Cross-batch analogy check:** opener "Smoke detectors trip" — no prior match (log has no smoke detector image). Approved.

---

## ID 295 — Pathologizing Preferences

| Field | Old | New |
|---|---|---|
| hook | "Some 'progressive' research penalises women for having traditional preferences. Funny that." | "When your preference scores as a disorder, the test reveals the tester's values." |
| plain | "Scales measuring traits like 'benevolent sexism' often label statements such as 'women should be protected' as harmful attitudes. But these aren't just male attitudes; they're also widely reported female preferences. Labeling them as sexist pathologizes people for having ordinary preferences." | "Some psychological scales label common preferences as harmful attitudes. Statements like women should be protected score as sexist, even when women widely report holding them. The scale does not measure harm; it scores deviation from the researcher preferred norm." |
| analogy | "A survey asks if you prefer salty or sweet food, then tells you that preferring salt is a sign of internalized capitalism. You're not being measured, you're being judged." | "A nutritionist flags salt preference as internalized capitalism on a survey designed to promote a specific diet." |
| prompt | "...you've been told..." | "...you have been told..." |

**Fields changed:** hook, plain, analogy, prompt
**Self-check:** PASS. Old hook was 2 sentences with snarky second sentence. New hook: 13w, 1 sentence. Old analogy was 2 sentences, ~28w; new is 1 sentence, 17w. "pathologizes" (jargon) removed from plain.
**Cross-batch analogy check:** opener "A nutritionist flags" — no prior match. Approved.

---

## ID 300 — Supernormal Stimuli

| Field | Old | New |
|---|---|---|
| hook | "Exaggerated fake triggers hijack instincts. Beetles mate with beer bottles." | "Artificial triggers so exaggerated they beat the real thing every time." |
| plain | "Artificial versions of natural triggers, so exaggerated they outcompete reality, are called supernormal stimuli. Beetles evolved to mate with shiny brown objects (female beetles). When humans introduced beer bottles, males tried to mate with them instead. Porn, Instagram filters, and romance novels work the same way." | "Natural triggers evolved to motivate useful behavior: eat fat and sugar when rare, seek mates, avoid danger. Artificial versions deliver those triggers at intensities that never existed in nature, so they outcompete reality. Porn, Instagram filters, and junk food all work this way." |
| analogy | "Junk food is supernormal stimuli for taste. Your body evolved to crave fat and sugar because they were rare. Doritos deliver both in concentrations that don't exist in nature." | "Male jewel beetles court brown beer bottles, shinier and larger than any actual female beetle ever was." |
| prompt | "What's the lowest-effort..." / "...when you're depleted..." | "What is the lowest-effort..." / "...when you are depleted..." |

**Fields changed:** hook, plain, analogy, prompt
**Self-check:** PASS. Old hook was 2 sentences (hard fail). New hook: 11w, 1 sentence. Old analogy was 3 sentences with explanation after image; new is 1 sentence, 17w. Old plain opened with "X is called Y" passive construction and was ~60w; new is 43w, no forbidden opener.
**Cross-batch analogy check:** opener "Male jewel beetles" — no prior match. Approved.

---

## ID 342 — Micro SaaS with Soul

| Field | Old | New |
|---|---|---|
| plain | "Building a software company used to require millions in funding, 30 developers, and 10,000 customers to break even. AI has collapsed those barriers. You can now create a niche SaaS product with 500 paying customers and almost no capital. The catch: you can't just sell software. You need to bundle it with community, events, and a personal brand." | "Building software used to require funding, dozens of developers, and thousands of customers to break even. AI has collapsed those barriers. A niche product can sustain itself on 500 paying customers with almost no capital, but only if you bundle it with community and a personal brand." |
| analogy | "A gym membership app is worthless. A gym membership app that includes weekly group hikes, a private Slack, and quarterly retreats with the founder is a business." | "Wine-club software with a weekly Zoom tasting and a private forum outcompetes a feature-rich app with no human layer." |
| prompt | "...How would you add a human layer (coaching calls, live events, or a members-only community) to make it defensible?" | "...How would you add a human layer to make it defensible?" |

**Fields changed:** plain, analogy, prompt
**Self-check:** PASS. Old plain was ~68w (over 55 ceiling) and had em-dash; new is 47w, no em-dash. Old analogy was 2 sentences, ~29w; new is 1 sentence, 19w (within ceiling). Prompt parenthetical trimmed.
**Cross-batch analogy check:** opener "Wine-club software with" — no prior match. Approved.

---

## Summary

10 concepts processed, 0 needs_human, 0 hard fails in final validation. Fields changed: 34 total across 10 cards (analogy on all 10; hook on 7; plain on 8; term on 3; prompt on 6). Primary issues resolved: em-dashes removed, multi-sentence analogies collapsed to single sentences, 2-sentence hooks merged to 1, triad hook rewritten, over-ceiling plains trimmed, banned/jargon words removed.
