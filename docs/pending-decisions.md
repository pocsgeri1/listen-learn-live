# Pending Decisions

## Pipeline: Make.com vs. GitHub Actions
**Status:** Undecided — revisit once full episode intel schema is locked

**Context:** The current pipeline uses Make.com to trigger extraction and write to Airtable. It works but is fragile and painful to update when the payload shape changes.

**Option A — Keep Make.com**
Pros: visual, non-developer friendly. Cons: fragile on schema changes, slow to debug, awkward to version-control.

**Option B — Replace with a Node script + GitHub Actions**
Pros: version-controlled, readable in 30 seconds, free, triggers on push. Cons: requires a developer to update (already the case anyway).
The write-to-Airtable half is ~50 lines of Node on top of the existing `generate-episode-intel.js`. One script handles generation + Airtable write.

**Recommendation (when ready to act):**
1. Finish locking the full intel schema in `episode_meta.json`
2. Update Airtable table schema to add: `summary_style`, `sharpest_line`, `tension`, `verdict_listen`, `verdict_skip`, `vocab_vault`
3. Replace Make.com scenario with a GitHub Action that runs `generate-episode-intel.js` on push and calls Airtable REST API directly
