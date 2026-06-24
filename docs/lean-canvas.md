# Epistemic — Lean Canvas

**Last updated:** 2026-06-24
**Stage:** Live product, pre-revenue, GTM phase beginning
**Status:** `index.html` live at `epistemic.live`. 594 concepts across 14 categories. Full extraction → approval → publish pipeline live. CS panel (conversation starters + story mode) shipped. Founder section live. D7 retention is the north-star metric before any monetisation.

---

## Problem

The top three high-pain problems this product solves:

1. **The zero-to-retention gap.** People spend 5–15 hours per week consuming podcasts and retain less than 10% within 48 hours. Passive listening is a structurally broken learning format.

2. **The concept-to-conversation gap.** Understanding a concept intellectually and deploying it naturally in conversation are different skills — and the gap is especially brutal for non-native English speakers navigating professional life in a second language.

3. **The manual curation tax.** Anyone who wants to extract value from podcasts today has to take notes manually, search for definitions elsewhere, build their own analogies, and maintain their own review system. This is 45–90 minutes of effort per episode.

---

## Customer Segments

### Primary: Ambitious non-native English professionals (25–40)

- Already consume podcasts in English to stay sharp
- Acutely aware that vocabulary and conceptual fluency affect perceived intelligence
- Already paying for Duolingo, Blinkist, MasterClass, courses
- Estimated 80–120M people globally
- High founder-market fit (this is the founder's own profile)

### Secondary: Podcast-obsessed knowledge workers (28–45)

- Consultants, founders, PMs, salespeople using podcasts for professional development
- Know they retain little and have proven willingness to pay for learning tools
- Already buying solutions that partly work (Readwise, Snipd)

### Deliberately excluded for now

- Students and early-career: high usage, low willingness to pay
- Enterprises and L&D teams: sales cycles are 6–18 months, toxic for early-stage

---

## Unique Value Proposition

**The sentence you keep losing mid-conversation.**

Most podcast listeners retain less than 10% within 48 hours. The problem isn't memory — it's format. Passive listening is a broken learning format. Epistemic closes the loop: concept cards that are usable in real conversation, not just readable.

**One-liner for non-native English speakers:** The ideas were always yours. They just kept disappearing before you could use them.

**Economic framing:** This is professional development, not entertainment. A non-native professional who can deploy "asymmetric risk" or "epistemic humility" correctly in a client meeting is measurably more effective. Willingness to pay shifts from €5 to €20–50/month when framed this way.

---

## Solution — What's Actually Live

### The concept library
594 curated concept cards across 14 categories, each with a plain definition, concrete analogy, and conversation prompt. Sourced from Modern Wisdom, Diary of a CEO, Dan Koe, and others. Library, Episodes/Themes browsing, scan mode, search.

### The Conversation Starter (CS) panel
The core retention mechanic. Select any concept → get an AI-generated opener, coaching, and pitfall for a specific context (with a friend, dinner party, work, date). Story Mode weaves 3 concepts into a short scene. Prev/Next navigation, Stash, History, Stories tabs.

### The extraction pipeline (internal tool)
```
Podcast URL → extract.html (browser-direct Claude API call)
            → Structured concepts JSON
            → Airtable PENDING rows
            → Human review (~10-15 min per episode)
            → Make.com → publish-batch.js → concepts.json on GitHub
            → Vercel auto-deploy → live within 60 seconds
```

### What's not built yet (Phase 1)
- Quiz mode (3-round game loop exists but deferred)
- Streak system
- User accounts / cross-device sync
- Spaced repetition

---

## Channels

### Primary — active GTM (starting now)

**Reddit:** r/podcasts, r/selfimprovement, r/Entrepreneur, r/digitalnomad, r/languagelearning. Genuine value-add posts and comments, not spam. High intent, low cost.

**Facebook expat communities:** Non-native English professional groups. High founder-market fit alignment. Direct access to primary segment.

**Podcast content alignment:** Process episodes from target shows, share "I extracted the 30 sharpest concepts from EP#892" on Twitter/LinkedIn. Potential creator retweet. Free brand alignment.

### Secondary — builds over time

**SEO long-tail.** Each concept is a potential search hit — "what does steelmanning mean", "barbell strategy explained". Sustainable free acquisition within 6–12 months.

**Email (Brevo, List ID 3).** `getepistemic.app@gmail.com` sender. Retention mechanism + distribution channel. Welcome sequence live (2-email Brevo automation).

**Share cards.** Every concept generates a branded image. Users share to Twitter/LinkedIn/Instagram. Viral loop — built but not yet primary channel.

---

## Revenue Streams

### Staged monetization model

| Tier | Price | What's included |
|------|-------|-----------------|
| Free | €0 | Full concept library, daily goal tracker, category filters, share cards |
| Pro | €12/month | Cross-device sync, quiz mode, spaced repetition, podcast processing |
| Credits | €3/episode | Submit URL, receive structured concepts (or bundled in Pro) |
| B2B | €49–99/seat/month | Teams processing internal content (Month 12+) |

### Critical warnings

- **No ads at MVP stage.** Undermine premium positioning, require 50k+ MAU to generate meaningful revenue.
- **Don't launch Pro before month 3** or before 500 active users. Too early kills growth.
- **Annual plan reduces churn significantly.** €99/year = 2 months free.

---

## Cost Structure

Monthly costs at current scale:

| Item | Cost | Notes |
|------|------|-------|
| Claude API (extraction) | ~€8/mo | ~€0.15 per episode at 50 episodes/month |
| Claude API (CS panel) | ~€5–15/mo | Per-user CS generation; scales with active users |
| Make.com | €9/mo | Paid tier covers automation runs |
| Vercel | €0–20/mo | Free tier handles significant traffic |
| Airtable | €0–10/mo | Free tier ~1000 records |
| Brevo (email) | €0/mo | Free tier covers current volume |
| Umami (analytics) | €0/mo | Free self-hosted / cloud plan |
| **Total** | **~€30–60/mo** | Scales to ~€200/mo at 500 episodes/month |

Exceptional unit economics. Infrastructure stays under €300/month at significant scale.

---

## Key Metrics

**North star: D7 retention > 35%.** No Phase 2 feature work until this is proven.

| Metric | Target | Current status |
|--------|--------|----------------|
| D7 retention | >35% | Unmeasured — GTM phase just starting |
| Concept mastery rate | >40% | Trackable via localStorage mastered set |
| Agent quality score | >70% | % of extracted concepts approved without editing |
| Free → Pro conversion | >3% | Pre-revenue; not yet launched |
| Pipeline speed | <15 min | URL to live concept including review |
| Email list growth | +10% weekly | First milestone: 1,000 subscribers |
| CS engagement | >30% of sessions | % of sessions that open the CS panel |

---

## Unfair Advantage

### Strongest moats

**The curated concept library.** 594 concepts with editorial judgment across 14 categories. Proprietary taste + structured format (hook/plain/analogy/prompt). No competitor can recreate this quickly.

**Conversation Starter + Story Mode.** The CS panel closes the loop into real conversation deployment — not just passive reading. This is the product's most differentiated mechanic and the one most competitors don't have.

**Non-native English speaker positioning.** Underserved segment with high willingness to pay. Specificity creates trust. Hard to dislodge even by better-capitalized competitors once owned. Founder-market fit is real: founder is the target customer.

### Medium moats

**Podcast creator partnerships.** Direct links in show notes create distribution advantage that money can't buy. Relationship moat, not technical.

### Honest admission — weak moats

**The technology itself.** Transcript + Claude API pipeline is rebuildable by any developer in a week. Snipd, Readwise, or Spotify could add this as a feature. Library, brand, and community are the real defensible assets.

---

## Top Risks

### Critical — existential

**Platform risk: Spotify / Apple builds this natively.** Spotify has AI episode summaries in beta. If either adds concept extraction natively, distribution is immediate. Window: 12–24 months.

*Mitigation:* Move fast, build library and email list before this happens. Develop distribution independent of platforms.

### High — structural

**Extraction quality degradation.** Approving mediocre AI concepts under time pressure erodes library quality. Human review is quality control AND operational bottleneck.

*Mitigation:* Enforce quality rubric strictly. Reject liberally. Hire editorial help at €3k MRR.

### High — behavioural

**The "interesting but not sticky" problem.** Users find concepts interesting twice, then forget product exists. Graveyard of learning apps.

*Mitigation:* Build streak + quiz + Life Audit Mode before charging. Retention must be designed from day one.

---

## The VC view — honest assessment

This is a **solid bootstrappable business, not a venture-scale bet**. Moat is thin, market is real but not large enough for 100x returns.

As a founder-market-fit solo project targeting €5–10k MRR within 12 months with low capital? Genuinely promising.

**Highest-conviction path:**
1. Get D7 retention > 35% — the only metric that matters right now
2. Grow email list to 1,000 then 5,000
3. Validate that 3–5% pay €12/month
4. Only then decide whether to raise or stay bootstrapped

**Do not raise before 200 paying users.** Too much equity given up for too little validation.

**The single most important thing in the next 90 days:** retention. GTM is starting — Reddit + expat communities. But if new users don't come back, acquisition is pointless.

---

## Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Problem severity | 8.5 / 10 | Real, widely felt, underserved |
| Market size | 7.5 / 10 | Large but not venture-scale |
| Differentiation today | 7.5 / 10 | CS panel + story mode adds real depth vs. May 2026 version |
| Long-term defensibility | 5.5 / 10 | Technology is commodity; library + brand are real |
| Revenue model clarity | 6.5 / 10 | Freemium works, needs testing |
| Founder-market fit | 9.0 / 10 | Founder is the target customer |
| Execution complexity | 7.5 / 10 | Low — solo-buildable, vibe-codable |

**Overall: 7.2 / 10** — worth building as a bootstrapped product. No change in conviction since May; execution has advanced.
