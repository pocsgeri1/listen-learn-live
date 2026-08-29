# V3 build checklist

**Purpose:** the day-to-day working reference for executing `docs/v3-architecture.md`. That document is the source of truth for *why*; this one is the source of truth for *what ships when*. Each row links back to the architecture doc section for full rationale, schemas, and state machines — don't duplicate that detail here.

**Branch:** all phases below happen on `v3-build`, not `main`. Merging `v3-build` → `main` is the promotion step — no file rename, no swap.

**Resolved prerequisites (see `v3-architecture.md` §17):**
- §17.1 — new V3 code goes into `app.css` + `app.js` (plain `<link>`/`<script src>`, no bundler); legacy stays inline in `index.html`.
- §17.2 — model string bug (`claude-sonnet-4-5` → `claude-sonnet-4-6`) was fixed directly on `main`, independent of this branch.
- §17.3 — **resolved 2026-08-29: Chat is cut to V4.** V3 ends at phase 8. Decided at the phase 8 boundary as this section required, not before.

---

## Phase table

One row per phase. **Ships** = what lands. **Retires** = what gets removed *from the old surface* in that same commit (per the retire ledger below — nothing is removed before this table says so). **Migrations** = which numbered migration functions (see ledger below) ship in that phase. **Risk** carries over from §16.

| Phase | Version | Ships (full detail in `v3-architecture.md`) | Retires | Migrations | Risk | Status |
|---|---|---|---|---|---|---|
| 1 | v3.58 | Docs only. | — | — | none | ✅ shipped to `main` |
| 2 | v3.59 | Two shells, router, rail (desktop + mobile). Rail items open **existing** overlays unchanged. `_lsSet()` helper. | Nav bar (hidden in app shell) | 1, 2 | highest | ✅ shipped — 83 pure insertions to `index.html`, zero legacy edits |
| 3 | v3.60 | Library unified: concepts (789) + words (403) + episodes (57) lenses, `#/c/{id}` and `#/w/{word}` routes, URL filters. | Home drawer tabs, Read panel — unlinked from rail, not deleted (see below) | 3 | medium | ✅ shipped — found these tabs only ever showed saved/favourited subsets, never a full browse; this phase is a genuine new capability, not a re-skin |
| 4 | v3.61 | Boards index, viewport persistence, user-drawn connections, board covers (`coverIds`-based). | Home drawer Folders tab → `#/boards` | — | medium | ✅ shipped |
| 5 | v3.62 | Concept-detail primary actions (Write/Board/Save). | — | 4 (no-op) | medium | ✅ shipped, **scoped down** — investigation found the doc's premise (breadcrumb/swap and Corner already living in Spark) was wrong; full pane conversion deferred as its own pass, see phase 5 commit |
| 6 | v3.63 | Write → Capture inbox, `@` picker (built from scratch, no prior pattern existed), Practice re-homed to `#/write/practice`. | Lexi practice overlay re-homed (kept) | 5 | low | ✅ shipped |
| 7 | v3.64 | Write → Compose, `api/compose.js` (all 5 modes), voice dials, anti-slop gate, provenance, seed rule. | — | — | medium | ✅ shipped, **not live-tested** — built and verified up to the live-API boundary per user decision; needs a real persistent rate limiter (Vercel KV) and an Anthropic spend alert before production traffic, both flagged in the file header |
| 8 | v3.65 | Today: COTD (reused), streak (new trigger, same key), resume row, 6 of 7 Discover rails. | — | — | low | ✅ shipped — "Words from concepts you know" rail deferred, needs its own tile template |
| 9 | v3.66 | ~~Chat + `api/chat.js`~~ | — | — | — | ❌ **cut to V4** — decided at the phase 8 boundary per §17.3, deliberately, not by drift |
| 10 | v3.67 | ⌘K search, tags, keyboard nav, PWA manifest (network-first service worker), storage monitor. | — | — | low | ✅ shipped |
| 11 | v3.68 | Onboarding (§14.2). Export/import already shipped in phase 2, pulled forward per §14.1's own recommendation. | — | — | low | ✅ shipped — **V3 build complete** (phases 1-8, 10-11; phase 9/Chat cut to V4) |

**Minimum meaningful V3 = phases 2 + 3.** If the plan has to stop, stop at a phase boundary, never inside one.

**Phase 2 pre-flight (the one that can go wrong):** scope every new rule under `body[data-shell="app"]`, change zero existing selectors, ship the rail behind `?v3=1` for one commit before flipping the default, verify the marketing shell at 375/390px in both themes with JS disabled.

**Phase 7 pre-flight:** rate limits + server-side input caps + spend alert (§14.4) must exist before `api/compose.js` ships — this is a public, unauthenticated endpoint.

---

## Retire / merge ledger (full version: §11)

| Today | Fate | Lands in | Ships |
|---|---|---|---|
| Nav bar mode buttons | restructured | rail (desktop) / tab bar (mobile) | v3.59 |
| Home drawer — Episodes | moved | `#/library/episodes` | v3.60 |
| Home drawer — Concepts | moved | `#/library` (default lens) | v3.60 |
| Home drawer — Vocab | merged | `#/library/words` | v3.60 |
| Home drawer — Folders | promoted | `#/boards` | v3.61 |
| Home drawer — Practice | moved | `#/write/practice` | v3.63 |
| Home drawer shell | retired | — (rail replaces it) | v3.61 |
| Read panel (`#gvOverlay`) | dissolved | words → `#/library/words`; map → `#/library/words/map` | v3.60 |
| Lexi panel (pull tab) | retired | saved words → `#/library/words`; practice → `#/write/practice`; row detail → `#/w/{word}` | v3.62 |
| Lexi practice overlay | kept, re-homed | `#/write/practice` | v3.63 |
| Speak/Spark panel | kept, elevated | `#/c/{id}` right pane | v3.62 |
| Corner | kept, demoted | sub-state of `#/c/{id}` | v3.62 |
| Canvas (`#canvasOverlay`) | kept, promoted | `#/board/{id}` | v3.61 |
| Board share (`?import=`) | unchanged | do not touch | — |
| Story mode | kept, unchanged | sub-state of `#/c/{id}` | v3.62 |
| Marketing scroll page | preserved, isolated | `body[data-shell="site"]` | v3.59 |
| `lll_theme_filter` / `lll_podcast_filter` | deprecated in place | URL query params | v3.60 |

**Lexi day-one note (v3.62):** `lll_lexicon_v1` is never modified. First boot after v3.62, if it's non-empty, the rail's Library item shows a one-time dot and `#/library/words` opens pre-filtered with a dismissible explainer row. Old pull tab removed from DOM (not hidden) after `grep` confirms no other caller.

---

## Migration ledger (full version: §9.7)

Every migration is a numbered, idempotent function run once on boot, guarded by `lll_migrations_v1: [1,2,3,...]`.

| # | Ships in | Does |
|---|---|---|
| 1 | v3.59 | create `lll_user_id` if absent |
| 2 | v3.59 | folder `schema: 2 → 3` (fill six new fields) |
| 3 | v3.60 | read `lll_theme_filter`/`lll_podcast_filter` once into initial Library URL query, stop writing them |
| 4 | v3.62 | no-op for data; Lexi retirement is UI-only |
| 5 | v3.63 | seed `lll_captures_v1` from `cc_note_*` **as copies**, not moves; set `capture.source='concept'`, `conceptIds=[thatId]` |

---

## Cross-cutting, not tied to one phase

- **Export/import (§14.1 item 1)** should land in phase 2, not wait for phase 11 as originally tabled — it's the seatbelt for everything V3 asks users to invest (boards, captures, drafts) into a store Safari can wipe after 7 days of inactivity.
- **Counters** (`boards.length`, `captures.length`, monthly AI calls) — build from phase 2 onward even though nothing is gated yet (§14.9). Retrofitting later is expensive; building them now is not.
- **`qa: true` concept flag** (§14.3) gates Compose's public-format source picker to reviewed concepts only — needs to go through the Airtable → publish-batch pipeline, flag it early relative to phase 7.
- **SEO isolation** (§14.7) — the router only ever owns hash routes, never path routes; every phase's checklist includes viewing a static concept page with JS disabled.
