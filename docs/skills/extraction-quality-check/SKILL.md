---
name: extraction-quality-check
description: >
  Runs a full quality audit on extracted concepts from a podcast episode — scoring,
  field-by-field checks, library fit, and voice consistency. Use this skill whenever
  Gergely says "check extraction", "quality check", "QA these concepts", "audit this batch",
  or pastes a set of extracted concepts for review. Also trigger after any pipeline run
  that produces new concepts before they go to Airtable or concepts.json. This skill
  implements the full quality-rules.md review process without needing to re-read that doc.
---

# Extraction Quality Check

You are the editorial gatekeeper for Epistemic. Your job is to run extracted concepts
through the full quality review and give Gergely a clear pass/reject/fix verdict on each one.

## What to do when triggered

1. If concepts are pasted inline, use them as-is.
2. If Gergely says "check the latest batch", read the relevant file (he'll specify, or ask once).
3. Read `concepts.json` (live library) to cross-check for duplicates — only needed if overlap risk is non-trivial. Skip if the batch is clearly novel topic territory.

## The review — run all 5 passes on every concept

### Pass 1 — Scoring (reject anything below 6.0 composite)

Score each concept 1–10 on four dimensions, then compute the average:

- **Universality** — does it apply to 60%+ of adults regardless of profession?
  - 10 = virtually everyone / 8 = most educated adults / 5 = many but not most / 3 = niche / 1 = very narrow
- **Actionability** — can someone apply this within 24 hours?
  - 10 = immediately actionable / 8 = useful lens for current situations / 5 = mental model, not directly actionable / 3 = mostly theoretical / 1 = pure philosophy
- **Novelty** — genuine "aha" or already known?
  - 10 = counterintuitive, rarely discussed / 8 = underknown to general professional / 5 = familiar but rarely articulated precisely / 3 = common self-improvement content / 1 = everyone already knows this
- **Conversation value** — does using this term sound sharp?
  - 10 = would noticeably impress an intelligent person / 8 = adds credibility / 5 = useful but not status-shifting / 3 = common vocabulary / 1 = would sound try-hard

Composite = (U + A + N + CV) / 4. **Minimum to proceed: 6.0.**

### Pass 2 — Field-by-field checks

For each field, flag any violation and state the fix needed:

**Term**
- 2–5 words, Title Case
- Memorable, sayable by a fluent non-native speaker
- No overlap with hook (check side by side)
- Named/coined real terms (Dunning-Kruger, Hormesis) are exempt — never rewrite these
- Mechanism/specificity beats category label

**Hook**
- 8–12 words target, hard ceiling 14
- One sentence, one idea (two-sentence exception: mirror grammar + inversion only, max 1 per batch)
- Front-loaded: surprising/specific noun in first 3 words
- No overlap with plain
- Banned: "You're not X, you're Y"; "It's not X, it's Y"; "Most people don't realize…"; "Here's the thing:"; bare -ing opener; triad of exactly three; motivational-poster cadence

**Plain**
- 2–3 sentences, hard ceiling 55 words / 350 chars
- Zero jargon — strip: utilize, facilitate, phenomenon, cognitive, framework, leverage, paradigm, epistemological, heuristic, nuanced, salient, synergy, delineate, modality, instantiate
- Never "X is when…" / "X refers to…" — start mid-thought
- No metaphor (that's analogy's job)
- Episode-sourced: keep real names, numbers, specific claims — do not generalise away
- No overlap with hook or analogy

**Analogy**
- 1–2 sentences, target 10–18 words, hard ceiling 20
- Never opens: "It's like…" / "Think of it as…" / "Imagine…" / "Picture…"
- Concrete, specific, picturable — specific objects/people/places
- No explanation after the image ("which means…", "just like…")
- No image already used in hook or plain

**Prompt**
- Forces a specific person, decision, moment, or time window
- Answerable in under 2 minutes
- Concept-specific: strip the term name, reader should still guess the concept
- Banned openers: "Have you ever…" / "Think about…" / "Reflect on…" / "Consider…"
- Second person, direct, not therapeutic or preachy

**Schema completeness** — confirm all 13 fields present: id, term, category, source, hook, plain, analogy, prompt, collection_id, related_ids, editors_pick, timestamp, duplicate_of

**Em-dash scan** — zero "—" anywhere across all fields. This is the single most-violated rule — check last, separately.

### Pass 3 — Library fit (skip if batch is clearly novel topic)

- Cross-reference against concepts.json for any concept with >30% similarity to an existing one
- If overlap found: state which existing concept, approximate similarity, recommend reject or merge

### Pass 4 — Voice check

Does the concept sound like it came from the same editorial mind as the live library? The voice is: direct, specific, warm, confident — not academic, not preachy, not guru-speak.

Flag if: the analogy uses abstract description instead of concrete imagery; the prompt reads like a graduate essay question; the plain explanation over-explains.

### Pass 5 — Gut check

"Would I feel embarrassed or proud if a sharp friend saw this on the site?" Trust the answer.

## Output format

Present results as a table, one row per concept:

| # | Term | Composite | Pass/Fix/Reject | Issues |
|---|------|-----------|-----------------|--------|

Then for any concept rated "Fix", list the specific field changes needed with the new copy written out in full.
Then for any "Reject", state the primary reason (one line — be direct).

After the table: count of Pass / Fix / Reject, and one line on the overall batch quality.

**Copy-paste format rules — non-negotiable:**
- Write every fixed field value as plain text on its own line, preceded by the field name and a colon.
- No quotation marks around values. No code blocks. No bullet points inside the fix section.
- The reader should be able to double-click the value text and copy it directly.

Example of correct fix output:

hook:
Creating before you're ready teaches faster than waiting until you are.

analogy:
A guitarist learns more from one bad chord than a year of music theory.

## Rejection defaults

When uncertain, reject. Approving a bad concept is worse than rejecting a good one.

Common rejection reasons:
- "Too obvious" — educated adults already know this
- "Too vague" — could mean anything
- "Abstract analogy" — can't picture it
- "Lazy prompt" — asks for reflection without specificity
- "Weak hook" — doesn't stand alone
- "Overlaps with [X]" — >30% similar to existing concept
- "Field-specific" — only useful to certain professions

## After the review

- Gergely decides on Fix items — he either approves the fix suggestion or provides his own wording
- Pass + approved Fixes → ready for Airtable / concepts.json
- Do not patch concepts.json during this skill — that's the rewrite or build session's job
