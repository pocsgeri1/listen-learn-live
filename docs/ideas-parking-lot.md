# Ideas Parking Lot — Epistemic
# What this file is: a holding area for features and ideas that have been discussed,
# are genuinely worth building, but have been deliberately deferred.
# What this file is NOT: a graveyard. These are real candidates for future sessions.
# How to use: add an entry when an idea is proposed but not prioritized.
# Remove it when it gets promoted to roadmap.md Next Up, or is permanently dropped.
---

## Deferred ideas

### `hreflang` / multilingual SEO
**What it is:** HTML tags telling Google which language/region each page targets. Enables showing Hungarian (or other language) versions of concept pages to users in those regions.
**Why deferred:** Epistemic is English-only. Relevant only if a multilingual version is ever built.
**When to revisit:** If Epistemic launches a translated version of the concept library.

---

### Next.js migration
**What it is:** Migrating epistemic.live from a vanilla HTML/JS SPA to Next.js for server-side rendering (SSR), which would solve the SEO crawlability problem natively — every page would be pre-rendered HTML, no static build step needed.

**Why deferred:** Significant migration effort (full rewrite), adds framework complexity, and the static page generation approach (see `docs/seo-session-plan.md`) solves the same SEO problem with far less risk. Next.js is the right call if the site grows significantly in complexity or if the static build approach becomes unmanageable at scale.

**Estimated effort:** Large. Full framework migration, new deployment config, likely 1–2 weeks.

---

### `related_episode_ids` — cross-episode thematic links
**What it is:** An array of episode IDs that share strong thematic overlap with a given episode. Stored in `episode_meta.json` per episode.

**Why deferred:** Requires a cross-episode "second pass" — Haiku cannot identify related episodes when processing one episode at a time. It needs ALL episode summaries sent in a single prompt, which requires a separate script that runs after all episodes are enriched.

**What it needs to be built:**
1. A `tools/relate-episodes.js` script that: loads all episode summaries from `episode_meta.json`, sends them in one batch to Claude Sonnet (not Haiku — needs more reasoning), asks it to identify thematic overlaps and output a map of `{ episode_id: [related_ids] }`, writes the result back to each episode entry.
2. A UI decision: where does this surface on the site? "Listen next" card in the episode drawer? A "related episodes" row? Not designed yet.

**Estimated effort:** Medium. Script is ~1 day. UI is a separate session.

---
