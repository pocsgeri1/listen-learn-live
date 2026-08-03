# Batch 23 Diff Report

**Date:** 2026-08-03  
**IDs processed:** 631, 94, 234, 61, 126, 130, 422, 556, 564, 569  
**Tool:** check-fields.js  
**Result:** 0 HARD FAILs, 0 needs_human

---

## ID 631 — Pay for the Result

| Field | Old | New |
|-------|-----|-----|
| hook | "Shift payment from upfront cost to shared savings; removes buyer's risk entirely." | "Shift payment from upfront cost to shared savings; removes buyer risk entirely." |
| plain | "Instead of selling a product for a fixed price, provide it for free and charge a percentage of the measurable benefit it creates. Matthew Boulton and James Watt did this in 1775 with steam engines, charging 50% of the coal savings instead of asking mines to buy the machine upfront." | "Instead of selling a product for a fixed price, provide it free and charge a percentage of the measurable benefit it creates. Matthew Boulton and James Watt did this in 1775 with steam engines, charging 50% of the coal savings instead of asking mines to buy the machine upfront." |
| analogy | "A solar panel company installs panels on your roof at no charge and takes 30% of your reduced electricity bills. You only pay if it works. Zero risk, immediate adoption." | "Solar panels go on your roof at no cost; the installer takes a cut of your smaller electricity bill." |

**Self-check:** PASS (warn: analogy 19w, within ceiling)  
**Cross-batch analogy:** "Solar panels go" — new opener, new image. CLEAR.

---

## ID 94 — The Status Game

| Field | Old | New |
|-------|-----|-----|
| hook | "People don't buy a Porsche for the engineering. Neither do they argue politics for the truth." | "Nobody buys a Porsche for the engineering or argues politics for the truth." |
| plain | "From Will Storr: careers, consumption, political opinions, even social media arguments are driven by the need to raise or defend status within your tribe. We're not exchanging ideas, we're performing rank." | "From Will Storr: careers, consumption, political opinions, and social media arguments are driven by the need to raise or defend status within your tribe. People are not exchanging ideas; they are performing rank." |
| analogy | "Two people debate a topic neither has researched. They're not trying to learn anything. They're proving to the room that they belong on the smart side." | "Two strangers debate a topic neither researched, proving to the room they belong on the smart side." |
| prompt | "What's one belief you argue for publicly that, if you're brutally honest, exists partly to signal belonging to your tribe rather than because you've actually examined it?" | "What is one belief you argue for publicly that, if you are brutally honest, exists partly to signal belonging to your tribe rather than because you have actually examined it?" |

**Self-check:** PASS (warn: hook 13w within ceiling)  
**Cross-batch analogy:** "Two strangers debate" — new opener, new image. CLEAR.

---

## ID 234 — Language That Hides the Problem

| Field | Old | New |
|-------|-----|-----|
| term | "Language That Hides THE Problem" | "Language That Hides the Problem" |
| hook | "You've learned to say 'attachment style.' You still can't say 'he's mean to me.'" | "The right vocabulary can become the best excuse for ignoring the real problem." |
| plain | "When sophisticated psychological vocabulary prevents you from naming a simple, concrete issue. You articulate your triggers, your need for space, your communication patterns — but you can't admit the person you're with treats you badly. The jargon becomes a shield against reality." | "Sophisticated psychological vocabulary can prevent you from naming a simple, concrete issue. You can articulate your triggers and your need for space, yet still cannot admit the person you are with treats you badly. The jargon becomes a shield against reality." |
| analogy | "Debating the optimal room temperature while the house is on fire. Yes, climate control matters — but sometimes the answer isn't better thermostat settings, it's leaving the burning building." | "Debating thermostat settings in a house that is on fire." |

**Self-check:** PASS (warn: hook 13w within ceiling). Term fixed: "THE" to "the". Old hook was 2 sentences (HARD FAIL). Old plain had em-dash (HARD FAIL). Old analogy had em-dash and multi-sentence explanation (HARD FAIL). All resolved.  
**Cross-batch analogy:** "Debating thermostat settings" — new opener, new image. CLEAR.

---

## ID 61 — Locus of Control

| Field | Old | New |
|-------|-----|-----|
| hook | "Victims explain. Agents decide." | "Where you place the cause of your life determines what you do with it." |
| plain | "Internal locus: you believe you control your outcomes through your choices. External locus: you believe external forces control your life. Internal is strongly linked to resilience and long-term success." | "Internal locus: you believe your choices drive your outcomes. External locus: you believe outside forces do. People with an internal locus tend to be more resilient and more successful over the long run." |
| analogy | "Two people get rejected for the same job. One thinks 'I need to improve my interview skills.' The other thinks 'the system is rigged.' Same event — different trajectories." | "Two runners miss a qualifying time: one books a coach, the other blames the course." |

**Self-check:** PASS (warn: hook 14w at ceiling). Old hook was 2 sentences (HARD FAIL). Old analogy was multi-sentence with em-dash (HARD FAIL). Old plain had "resilience and long-term success" triad. All resolved.  
**Cross-batch analogy:** "Two runners miss" — new opener, new image. CLEAR.

---

## ID 126 — The One-Person Business

| Field | Old | New |
|-------|-----|-----|
| hook | "One person with the right audience beats a 20-people team without one." | "One person with the right audience can beat a twenty-person team without one." |
| plain | "A single person with expertise, an audience, and a digital product can earn significant income without employees, overhead, or investors. The internet provides leverage that used to require teams." | "A single person with expertise, an audience, and a digital product can earn significant income without employees, overhead, or investors. The internet gives individuals the reach and scale that used to require entire teams." |
| analogy | "A writer with 50,000 email subscribers and a €97 guide can earn more than an agency with 20 employees — with a fraction of the complexity, cost, and stress." | "A writer with fifty thousand subscribers selling a ninety-seven euro guide can out-earn an agency with twenty staff." |

**Self-check:** PASS (warn: hook 13w within ceiling). Old plain had jargon "leverage" (HARD FAIL). Old analogy had em-dash and explanation after image (HARD FAIL). All resolved.  
**Cross-batch analogy:** "A writer with" — new opener, new image. CLEAR.

---

## ID 130 — Niche of One

| Field | Old | New |
|-------|-----|-----|
| hook | "You are the niche. Your weird combination of interests IS your unfair advantage." | "Your exact intersection of obsessions creates a category nobody else can occupy." |
| plain | "Rather than picking a niche externally, your specific intersection of obsessions creates a category of one that nobody else can replicate. Your unique combination is your brand." | "Rather than picking a niche externally, your specific combination of interests creates a category of one that nobody else can replicate. Your unique intersection is your brand." |
| analogy | "Nobody else is both a former nightclub DJ and a philosophy-reading self-improvement podcaster. Chris Williamson didn't pick a niche externally — he became one through who he genuinely is." | "A former nightclub DJ who reads philosophy and makes self-improvement content occupies a slot no algorithm could have assigned." |

**Self-check:** PASS (warn: analogy 19w within ceiling). Old hook was 2 sentences (HARD FAIL). Old analogy was multi-sentence with em-dash (HARD FAIL). All resolved.  
**Cross-batch analogy:** "A former nightclub" — new opener, new image. CLEAR.

---

## ID 422 — Stage 3: Retroactive Realization

| Field | Old | New |
|-------|-----|-----|
| hook | "The worst betrayal is learning the beginning was fake." | "The worst betrayal is discovering the beginning was manufactured." |
| plain | "The discard hurts, but the real pain comes later: realizing the love bombing was never real. The cycle didn't start when they left. It started the moment they made you feel like the center of the universe. You weren't falling in love. You were being set up." | "The discard hurts, but the real pain comes later: realizing the love bombing was never real. The cycle did not start when they left; it started the moment they made you feel like the center of their world. You were not falling in love; you were being set up." |
| analogy | "Like rewatching a magic trick in slow motion and seeing the false bottom in the box. The reveal doesn't just ruin the ending — it poisons the whole memory." | "Rewatching a film knowing the ending reveals every early scene was already lying to you." |

**Self-check:** PASS (0 warnings). Old hook acceptable but "fake" weaker than "manufactured." Old plain had 5 short sentences (reduced to 3). Old analogy opened with "Like" (banned opener), had em-dash, multi-sentence explanation (HARD FAILs). All resolved.  
**Cross-batch analogy:** "Rewatching a film" — new opener, new image. CLEAR.

---

## ID 556 — Burden of Proof

| Field | Old | New |
|-------|-----|-----|
| plain | "When someone asserts something, it's their job to support it, not yours to disprove it (this has a name: *burden of proof*). Demanding doubters prove a negative is dodging the work of backing your own claim." | "When someone asserts something, it is their job to support it, not yours to disprove it. Demanding that doubters prove a negative is a way of dodging the work of backing your own claim." |
| analogy | "If someone says there's a treasure buried in your garden, it's on them to show it — not on you to dig up the whole yard proving there isn't." | "Someone says treasure is buried in your garden; proving it is their job, not yours to excavate." |

**Self-check:** PASS (0 warnings). Old plain had self-referential meta-note about the term name (removed). Old analogy had em-dash (HARD FAIL). All resolved.  
**Cross-batch analogy:** "Someone says treasure" — new opener, new image. CLEAR.

---

## ID 564 — A Euro Today Beats a Euro Tomorrow

| Field | Old | New |
|-------|-----|-----|
| hook | "Money now beats the same money later, every single time." | "Money now beats the same amount later, every time." |
| plain | "A dollar today can be invested, spent, or compounded immediately, making it worth more than the same dollar received in the future. Timing isn't neutral, inflation and opportunity cost make 'later' genuinely cheaper." | "A dollar today can be invested or spent immediately, making it worth more than the same dollar received in the future. Timing is not neutral; inflation and opportunity cost make later genuinely cheaper." |
| analogy | "Offered €1,000 now or €1,000 in a year, you take it now — you could invest it, and a year of inflation makes the later sum buy less anyway." | "Given a choice between a thousand euros now and a thousand in a year, you take it now." |

**Self-check:** PASS (warn: term 7w, coined/named concept — exempt). Old hook had motivational-poster "every single time." Old plain had triad "invested, spent, or compounded" and jargon-adjacent phrasing. Old analogy had em-dash and explanation after image (HARD FAIL). All resolved.  
**Cross-batch analogy:** "Given a choice" — new opener, new image. CLEAR.

---

## ID 569 — Mental Accounting

| Field | Old | New |
|-------|-----|-----|
| plain | "People mentally divide money into separate buckets and treat each pot as if it's different money, even when a dollar is fungible. This is why someone will protect a low-yield savings account while carrying high-interest debt, the labels override the math." | "People divide money into separate mental buckets and treat each pot as if it were different money, even when dollars are interchangeable. This leads someone to protect a low-yield savings account while carrying high-interest debt, letting labels override the math." |
| analogy | "Someone refuses to touch their €2,000 'holiday fund' while paying 20% interest on a €2,000 credit card — the money is interchangeable, but their mind won't let it be." | "Keeping the holiday jar untouched on the counter while a credit card at 20% drains from another drawer." |

**Self-check:** PASS (0 warnings). Old plain had jargon "fungible" (HARD FAIL) and rhetorical-adjacent "This is why" opener. Old analogy had em-dash and explanation after image (HARD FAIL). All resolved.  
**Cross-batch analogy:** "Keeping the holiday" — new opener, new image. CLEAR.

---

## Summary

10/10 concepts processed. 0 HARD FAILs. 0 needs_human. All 10 patched into concepts.json. rewrite-concepts.json updated (batch 23 moved to history, batch set to 24). rewrite-style-log.json trimmed to 50 entries with 10 new analogies appended.

**Fields changed:** hook (8), plain (8), analogy (10), term (1), prompt (2).
