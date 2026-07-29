# Ideas Parking Lot — Epistemic
# What this file is: a holding area for features and ideas that have been discussed,
# are genuinely worth building, but have been deliberately deferred.
# What this file is NOT: a graveyard. These are real candidates for future sessions.
# How to use: add an entry when an idea is proposed but not prioritized.
# Remove it when it gets promoted to roadmap.md Next Up, or is permanently dropped.
---

## Deferred ideas

### `related_episode_ids` — cross-episode thematic links
**What it is:** An array of episode IDs that share strong thematic overlap with a given episode. Stored in `episode_meta.json` per episode.

**Why deferred:** Requires a cross-episode "second pass" — Haiku cannot identify related episodes when processing one episode at a time. It needs ALL episode summaries sent in a single prompt, which requires a separate script that runs after all episodes are enriched.

**What it needs to be built:**
1. A `tools/relate-episodes.js` script that: loads all episode summaries from `episode_meta.json`, sends them in one batch to Claude Sonnet (not Haiku — needs more reasoning), asks it to identify thematic overlaps and output a map of `{ episode_id: [related_ids] }`, writes the result back to each episode entry.
2. A UI decision: where does this surface on the site? "Listen next" card in the episode drawer? A "related episodes" row? Not designed yet.

**Estimated effort:** Medium. Script is ~1 day. UI is a separate session.

---
