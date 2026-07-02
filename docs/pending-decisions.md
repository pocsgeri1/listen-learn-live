# Pending Decisions

## Pipeline: Make.com vs. GitHub Actions
**Status:** RESOLVED for the publish step, 2026-07-02 — see below. Episode Intel automation (originally what this doc was about) still undecided/deferred.

**Context:** Gergely's actual workflow, confirmed 2026-07-02: paste transcript + episode info into `extract.html` (browser) -> review/edit -> "send all to Airtable" (direct browser-to-Airtable write, no Make.com involved) -> review again in Airtable, flip Status PENDING -> APPROVED -> go to Make.com, manually hit "Run scenario" -> `publish-batch.js` commits to GitHub, site goes live.

Make.com's ONLY actual role in the live pipeline is that last manual step: watch Status=APPROVED rows, POST them to `/api/publish-batch`, write results back to Airtable. There is a second Make.com scenario (Airtable Intake row -> `api/extract-concepts.js`) that was built for a fully automated extraction path, but **Gergely confirmed he never uses it** — always uses `extract.html` directly instead. That scenario/endpoint is being left in place (not deleted) but is not part of the active flow — see the header comment in `api/extract-concepts.js`.

**Decision:** replaced the Make.com "APPROVED -> publish" scenario with a manually-triggered GitHub Action (`.github/workflows/publish-approved.yml` + `tools/publish-approved.js`, added 2026-07-02). Same trigger UX (one click), same commit mechanism (`/api/publish-batch` on Vercel, unchanged) — only the orchestration (fetch APPROVED rows from Airtable, build the batch payload, write results back) moved from Make.com's visual scenario to a small Node script, so new Airtable fields (scores, intel data, etc.) can be added without touching Make.com's IML at all.

**Confirmed working, 2026-07-02:** ran end-to-end on a live test episode — Airtable APPROVED -> GitHub Action -> `/api/publish-batch` -> GitHub commit -> site live -> Airtable flipped to PUBLISHED. Gergely: "Fantastic, it all worked now." Hit one bump along the way, a 403 `INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND` from Airtable, fixed by rotating the `AIRTABLE_API_KEY` GitHub secret to a freshly-generated Airtable PAT (see build-journal.md — this is a recurring Airtable failure mode, not specific to this migration). **Action still needed:** the old Make.com "APPROVED -> publish" scenario has not yet been explicitly paused — do that now to avoid double-triggering a publish.

**Still open / deferred:** the Episode Intel pipeline (`generate-episode-intel.js` — Summary/Vocab Vault/Tension) has never been wired to Make.com or Airtable at all; it writes straight to `episode_meta.json` via the `extract.html` intel panel. The original recommendation below (moving that generation + an eventual Airtable write to a GitHub Action) is unrelated to the publish-step change above and remains undecided.

**Original context (kept for reference):** the current pipeline used Make.com to trigger extraction and write to Airtable. It worked but was fragile and painful to update when the payload shape changed.

**Option A — Keep Make.com**
Pros: visual, non-developer friendly. Cons: fragile on schema changes, slow to debug, awkward to version-control.

**Option B — Replace with a Node script + GitHub Actions**
Pros: version-controlled, readable in 30 seconds, free, triggers on push. Cons: requires a developer to update (already the case anyway).
The write-to-Airtable half is ~50 lines of Node on top of the existing `generate-episode-intel.js`. One script handles generation + Airtable write.

**Recommendation (when ready to act, for Episode Intel specifically):**
1. Finish locking the full intel schema in `episode_meta.json`
2. Update Airtable table schema to add: `summary_style`, `sharpest_line`, `tension`, `verdict_listen`, `verdict_skip`, `vocab_vault`
3. Replace Make.com scenario with a GitHub Action that runs `generate-episode-intel.js` on push and calls Airtable REST API directly
