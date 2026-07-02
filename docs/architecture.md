# Architecture — Epistemic (post-2026-04-27 cleanup)

## Three-layer model

### Layer 1 — Concepts (the unit)
- Stored in `concepts.json` on GitHub, served from Vercel as `./concepts.json`
- Each concept has the 10-field schema (see quality-rules.md). 10th field `timestamp` (integer seconds, nullable) added v1.34 — drives the deep-link "↗ Listen" button on the live site with an 8-second pre-roll buffer.
- **Live count: 625 records as of v2.18 (2026-07-02). Do not cite a fixed number in docs or code — query `max(id)` from `concepts.json` instead.**
- Belongs to **one** category (of 14) and optionally **one** legacy
  `collection_id` (episode/curated-pack collection, may be `null`)
- **`curated_collection_ids` (added v1.78, re-scoped v2.18):** array of ids
  pointing into the themed collections. Originally AI-assigned into a 16-theme
  set (101–116, `status: "legacy"` in `collections.json`, no longer rendered).
  As of v2.18, computed **deterministically** from category (+ a composite
  score gate for newer concepts) into the current 6-theme set (201–206, see
  `THEME_CATEGORY_MAP` in `api/publish-batch.js` and `tools/migrate-themes.js`
  for the legacy grandfather-rule migration). Distinct from `collection_id`
  (Layer 2 episode/pack collections below). Powers the Themes grid
  (`index.html` — see "Themes feature" section below).

### Layer 2 — Collections (the container)
- Stored in `collections.json` on GitHub
- Two types, distinguished by the `type` field:
  - **Curated foundational packs** (`type: "curated"`, IDs 1–6): pre-existing
    thematic groupings of the original library. Shape: `{ id, title, type,
    description, categories[] }`. No people, no episode metadata.
    Existing 163 concepts are assigned to these via v1.15 backfill.
  - **Episode-based collections** (`type: "episode"`, IDs 10+): one per
    processed podcast episode. Shape: `{ id, title, type, podcast,
    people[], episode_url, aired_date, created_date }`. The `aired_date` field (added v1.34) is when the episode was published by the podcast — distinct from `created_date` (when we processed it). The Browse Episodes section sorts by `aired_date` desc, falling back to `created_date` when absent. The `podcast` field (added v1.31, 2026-05-06) names the show the episode is from — e.g. "Modern Wisdom", "Diary of a CEO". The frontend groups episode cards into rows by this value. Defaults to "Other" if missing. Created automatically by `/api/extract-concepts.js` when a transcript is processed (v1.18, D1).
- **Short collections** (`type: "short"`, IDs 500+): one per YT Short, clip, or
    single-idea video processed via `extract.html` Short mode. Shape identical to
    episode collections. Concept count is 1–3. On the front-end, single-concept
    shorts render inline as a flippable concept card with a thumbnail strip; multi-
    concept shorts (2–3) open the standard episode drawer. Short mode is selected
    via the mode toggle in `extract.html` before extraction.
- A collection can group multiple concepts, but each concept lives in only
  one collection (or none, when `collection_id` is null).
- Episode-based IDs start at 10, short-based IDs at 500 — both guaranteed via
    `Math.max(maxExisting + 1, minFloor)` in the extract function. Foundational
    packs (IDs 1–6) are never overwritten. The 500 floor for shorts is enforced
    in `extract.html`'s `createEpisodeCollectionViaGitHub` by checking
    `currentMode === 'short'`.

### Layer 3 — Categories (the lens)
- Hardcoded in `index.html` (CATEGORIES array + CAT_COLOR object)
- 14 of them, alphabetised with "All" first
- Used purely for filtering and visual styling — not a stored entity
- Adding a category = code change in `index.html` + colour entry + documentation update

## Data flow

**Note (2026-07-02):** the diagram below describes the original Make.com-driven design. The Intake→extract half (steps through `/api/extract-concepts.js`) was never actually adopted — Gergely always uses `extract.html` directly instead (see Path A/B below and `docs/pending-decisions.md`). The APPROVED→publish half (the last two steps) is accurate in shape, but as of 2026-07-02 the trigger is a manually-run GitHub Action (`tools/publish-approved.js` + `.github/workflows/publish-approved.yml`), not Make.com — confirmed working end-to-end in production. The actual current flow is:

`extract.html` (browser, manual paste of transcript + episode info) → review/edit → "send all to Airtable" (direct browser→Airtable write) → human review in Airtable, Status PENDING→APPROVED → GitHub Action (`publish-approved.yml`, manually triggered) → `/api/publish-batch.js` → commit to `concepts.json`/`collections.json` on GitHub → Vercel auto-deploy → live site → Airtable row flipped to PUBLISHED.

Original (largely inactive) design, kept for reference:

Podcast URL 
↓ (Airtable Intake form: episode title, host, URL, people, transcript) 
Intake row created (Status=NEW) 
↓ (Make.com polls Intake for NEW rows → POST to extract function) 
/api/extract-concepts.js: 
  1. Validates transcript and request 
  2. Calls Claude API with the extraction prompt 
  3. Creates new episode collection in collections.json on GitHub 
     (id ≥ 10, type=episode, people[] parsed from Intake.People) 
  4. Writes one PENDING row per concept to Airtable Concepts table 
     (Collection ID pre-filled with the new collection's id) 
  5. Updates Intake row → DONE (or FAILED with error detail) 
↓ (Human reviewer in Airtable: edit, approve, reject) 
Concept row: Status=APPROVED 
↓ (GitHub Action `publish-approved.yml`, manually triggered — replaced Make.com here 2026-07-02 → POST to publish function) 
/api/publish-concept.js or /api/publish-batch.js: 
  1. Validates the field shape 
  2. Computes next concept id = max(existing) + 1 
  3. Appends to concepts.json on GitHub 
↓ (Vercel auto-deploy) 
Live site

Collection creation now happens INSIDE the extract function, before any 
Airtable writes — if the GitHub commit fails, the whole job fails cleanly 
with no orphan concepts. Collection IDs reach concepts via the Airtable 
"Collection ID" field, then flow through the publish path (wired in v1.17).

## Where source attribution lives

The `source` field (core/cw/ah/dk) is legacy. It still exists on every
concept in `concepts.json` and is still required at extraction, but it
is no longer rendered anywhere in the UI (source filter UI removed v1.12,
source pill removed earlier).

The new model is **collections**. Each concept has a `collection_id`
pointing into `collections.json`. Collections come in two types:

- `curated` — foundational packs 1–6, no `people` array. Existing 162
  concepts are mapped here.
- `episode` — id ≥ 10, auto-created by `/api/extract-concepts.js` when
  a transcript is submitted. Has a `people` array sourced from the
  Intake form's People field (host first, then guests).

**Render path (live as of v1.19):**
- `index.html` fetches `collections.json` on page load alongside
  `concepts.json`, builds `COLLECTIONS_BY_ID`.
- Card template renders a `.people-pills` row when both conditions
  hold: `concept.collection_id != null` AND
  `collection.people.length >= 1`.
- Pills are display-only. No filter, no click handler, no routing.
  Click behavior on pills is deferred to a future task (Option B —
  episode landing pages).

**Note — index.html global search (added v2.2, originally spark.html):** The hero search bar searches concepts, episode titles, AND podcast/guest names from `COLLECTIONS_BY_ID`. Results appear grouped in the same dropdown (section labels "Concepts" / "Episodes"). Clicking an episode result opens that episode's drawer directly. This means `COLLECTIONS_BY_ID` is now load-critical for search, not just for card rendering.

**Failure modes:**
- `collections.json` 404 / parse error → pills don't render, cards
  still work. Console warning only.
- Concept has `collection_id` pointing to a missing collection → no
  pills, no error.
- Concept's collection has empty `people: []` → no pills (this is
  the foundational-pack case).

**Old model (pre-2026-04-26):** every concept had a `source` field
(core / cw / ah / dk). Cards showed a small "source pill". Filter row let
users filter by source.

**Why we changed it:** logically wrong. A "Modern Wisdom" concept might be
something the guest, not the host, said. Attributing the concept to one
podcaster collapses important information. And the site is moving to be
podcast-source-agnostic — focusing on ideas, not on which show.

**New model:** attribution lives on the collection (episode), not the
concept. The episode collection has a `people` array. Card UI shows a row
of small people pills pulled from the collection. The concept itself
carries no source attribution.

**Transition:** the `source` field still exists on all 165 existing
concepts as legacy data. The UI still renders the source filter pills
(this was intended to be removed in the v1.7 session but did not land —
re-application is a pending build task). The agent pipeline still
writes `source` on new concepts (must be valid: core / cw / ah / dk)
until Group C cleanup retires it from the write path.

---

## Concept of the Day (added 2026-04-26)

A modal that opens on first visit each calendar day, surfacing one concept
above the fold before the marketing hero is reached.

**Pick logic:** deterministic by date — `YYYYMMDD % pool.length`. Same
concept all day for all visitors; rolls over at local midnight. Not
personalized per user; user accounts are a Phase 3 concern.

**Dismissal logic:** localStorage key `lll_cotd_dismissed_v1` stores
`{ date: "YYYY-MM-DD" }`. While the date matches today, the modal does
not auto-open. New day → key is stale → modal opens again.

**Marking internalized:** clicking the primary CTA in the modal both adds
the concept to the `mastered` set AND counts it toward `openedToday`
(the daily-goal counter). Same write paths as the main grid; no new
storage keys.

**"Use it today":** reuses the existing `prompt` field. A dedicated
`useToday` field is a deferred Phase 1.5 task — would require schema
update + extraction prompt update + Airtable column + content backfill
for all 165 concepts.

## localStorage
- `lll_cs_history_v1` — Array (max 50, ring buffer). Each entry: `{ id, term, category, ctx, promptText, ts }`. Written ONLY by `_csLogHistoryWithPrompt()` after successful API response — never on concept render. `promptText` field added v1.72.
- `lll_cs_saved_v1` — Array (soft cap 100). Each entry: `{ id, term, category, savedAt, aiData }`. `aiData` is keyed by ctx: `{ partner, friend, colleague, meeting }` — each slot holds `{ prompt, openers[], coaching, pitfall }`. Written by `_csSaveConcept()` (upsert-on-ID, deep-merge per-ctx). Auto-saved on every successful `_applyAIToCtx` call (v1.74d — manual Save button retired). Also written by `_convGenerateCtx` (Stash inline generate) and `_csPickerGenerate` (Change Topic picker). Read by: Conversations overlay Saved tab, `_csRestoreOrLoad`, `_csUpdateScenarioBadges`.
- `lll_badge_count_v1` — **Orphaned. Do not use.** Badge reads directly from `lll_cs_saved_v1`.
- `lll_theme` — `"dark"` or `"light"`. Set by theme toggle.
- `lll_theme_filter` — last selected theme category (string, e.g. `"psychology"`). Restored into `_themeActiveFilterCat` on next load. Written by `themeFilterClick()`. *Added v2.2.*
- `lll_podcast_filter` — last selected podcast name (string, e.g. `"Modern Wisdom"`). Restored on next load; falls back to MW (mobile) or 'all' (desktop) if the saved podcast isn't in the current data. Written by `setEpisodePodcast()`. *Added v2.2.*
- `lll_voice_pref_v1` — **Orphaned.** Was written by voice picker (SpeechSynthesis feature, added v1.89, removed same session). Safe to ignore; will not cause errors.
- `ep_typed_v1` — timestamp (ms, integer string). Written on first typewriter play; read to check 2hr cooldown before replaying hero animation. Stored in `localStorage` (not sessionStorage) so it persists across tabs.
- sessionStorage keys: `lll_cs_ai_{conceptId}_{ctx}` — hot cache per concept+scenario. Written by `_loadAI` success, `_convGenerateCtx`, and `_csPickerGenerate`. Read first by `_csRestoreOrLoad` before checking localStorage.
- `window._podcastPillsExpanded` — **session-scoped only, not persisted.** Boolean; controls whether the podcast pills show-more is expanded. Set by "Show all podcasts ↓" click and auto-set by `setEpisodePodcast()` when a hidden podcast is selected. Reset to `false` on hard refresh. *Added v2.2.*

## CS modal state machine (v1.75b+)

**State 0 — Auto-open:** modal opens, API fires immediately. Generate button hidden. Skeleton shimmer shown inside prompt block. Static concept `prompt` field is cleared immediately — only AI-generated prompt is ever shown.

**State 1 — Post-generate:** prompt + coaching visible. Reveal pills: Change topic · Change scenario · Related concepts (with border-top divider separating from action row). Actions: Copy & Share · Surprise me · Prev ⤺ / Next ⤻. Feedback row appears after 8s.

**State 2 — Change Topic active:** concept pill + prompt block hidden (`style.display = 'none'` via `_csPickerHideMain`). Category pill row (14 pills, stamp animation, each colored with `CAT_COLOR`). User picks category → 3 candidate cards appear (stamp animation). Change scenario + Related pills hidden. "More ideas →" button below cards.

**State 3 — Candidate card expanded:** one card open (max-height accordion). Shows: plain text + 4 scenario buttons (pre-selected to `_csCtx`) + Generate starter button. Other 2 cards remain visible collapsed.

**State 4 — Picker generate:** loading message (per-scenario from `_CS_LOAD_MSGS[ctx]`) inside card → prompt + openers + coaching + pitfall inside card. Concept NOT yet committed. Other cards still generatable. Committed on Copy & Share or Prev/Next.

**CRITICAL: inline display:none rule**
`_csPickerHideMain()` sets `style.display = 'none'` on 6 elements: `csConceptPill`, `csPromptBlock`, `csCoaching`, `csDivider`, `csFeedbackRow`, `csGenerateRow`. Any function that restores the modal MUST clear `style.display = ''` on ALL 6 before calling `_applyAIToCtx` or `_csShowPostPrompt`. CSS visibility classes (`cs-visible`, `cs-hidden`) cannot override an inline style. Functions that do this: `_csPickerShowMain`, `_csSurprise`, `_csSwapConcept`.

**CRITICAL: two independent visibility systems**
`_csPickerHideMain` uses **inline `style.display`**. `_csHideAll` / `_csShowPostPrompt` use **CSS classes** (`cs-hidden` / `cs-visible`). They do not interact. `csActions` and `csRevealRow` are hidden via `cs-hidden` at init — they only become visible via `_csShowPostPrompt` (which runs inside `_applyAIToCtx`). Any restore function must handle both systems independently. `_csPickerShowMain` (v1.77+) now also explicitly adds `cs-visible` to `csActions` + `csRevealRow` and shows the generate button as a fallback when `_csAIData` is null.

**Key function relationships:**
- `_csToggleTopicReveal()` → opens picker, calls `_csPickerHideMain()`, builds cat row, fires `playBubblePopSFX()`
- `_csPickerBuildCatRow(null)` → stamp-animates 14 colored pills
- `_csSwitchCat(cat)` → if picker active: resets seenIds, rebuilds cat row with new selection, loads 3 new candidates
- `_csPickerLoad(cat)` → guards null, shuffles pool, stamps 3 cards in
- `_csPickerToggle(id)` → max-height accordion expand/collapse, one-at-a-time
- `_csPickerGenerate(id)` → API fetch, loading message from `_CS_LOAD_MSGS[ctx]`, updates `_csAIData[ctx]`, calls `_csUpdateScenarioBadges()`, saves to Stash, live-refreshes Stash if open
- `_csPickerCommit()` → clears `_csAIData` fresh, clears all badges, calls `_applyAIToCtx`, closes picker
- `_csClosePicker()` → hides picker wrap, restores scenario+related pills, calls `_csPickerShowMain()`
- `_csPickerShowMain()` → (v1.77+) clears inline `display` on 6 picker-hidden elements; adds `cs-visible` to `csActions`+`csRevealRow`; calls `_applyAIToCtx(_csCtx)` with 3-tier fallback (memory → sessionStorage → localStorage); shows generate button if all caches empty
- `_csSurprise()` → clears inline `display` on all 6, clears prompt text immediately, fires `_loadAI`, coaching appears via `_applyAIToCtx` on resolve
- `_csSwapConcept()` → clears inline `display` on all 6 before render
- `_csOpenStoryMode()` → hides picker wrap, shows `csStoryPanel`; sets scenario-aware eyebrow; calls `_csGetPickerCandidates()` then fetches story API; on success calls `_csRenderStoryMiniCards()` + `_csSaveStory()`
- `_csCloseStoryMode()` → cancels in-flight typewriter (`el._twCancel()`); hides story panel; closes picker; clears inline styles; restores concept view WITHOUT auto-firing `_loadAI` (checks memory/session cache, falls back to Generate button); shows `csBackToStoryBtn` if `_csStoryGenerated`
- `_csReopenStory()` → re-enters story mode without re-fetching (story DOM still populated)
- `spScenarioPill(el, scenario)` → checks `SP_STORY_SEEDS[scenario]` first; if seed exists, calls `_csPlayLockedSeed()` — no API call; if no seed, falls through to AI path with `_csInjectCandidatesAndStory`
- `_csPlayLockedSeed(seed, seedConcepts)` → sets eyebrow, hides main concept area, shows story panel, runs `_csTypewriter()` on pre-written story text; on done: fades in reveal btn + actions, saves to `lll_cs_stories_v1`
- `_csInjectCandidatesAndStory(concepts, scenario)` → builds candidate cards; calls `_csPickerHideMain()`; hides `csActions`+`csRevealRow` inline; activates picker; triggers `_csOpenStoryMode` after 80ms
- `SP_STORY_SEEDS` — `var` (not `const` — avoids TDZ crash); 4 locked seeds: `friend`, `dinner`, `date`, `work`; each has `concept_ids[]`, `eyebrow`, `story` (with `**bold**` and `[[LABEL:Term]]` markers)

## CS modal SVG branch (v1.75b+)

The "Change scenario" section uses a live-measured SVG for the hairline branch animation. On every open of `csScenarioSection`:
1. `getBoundingClientRect` measures `#csRevealScenario` (the pill), the SVG container, and each `.cs-ctx-btn`
2. `viewBox` set to real pixel dimensions (1:1 coordinates)
3. 4 cubic bezier `<path>` elements computed: origin = center-bottom of pill (`oy = 2`), destinations = `tx = btn center-x`, `ty = btn.top - svgRect.top` (top edge of button — lines arrive above button text)
4. `getTotalLength()` per path drives `strokeDasharray/Offset` for correct draw animation regardless of arc length
5. SVG is `position:absolute` overlaying the wrap — doesn't add height; buttons live in normal flow below `padding-top: 68px` (desktop) / `52px` (mobile)
6. Scenario buttons use `.btns-visible` for staggered appear (transition-delay 0.38–0.50s), then `.btns-settled` after 700ms resets `transition-delay: 0s !important` so hover responds instantly
7. Both `.btns-visible` and `.btns-settled` are removed on section close so re-open animates fresh

## SFX architecture

`SFX_ENABLED = false` gates ambient/card SFX globally (theme toggle, vault,
COTD, streak — all currently silent). UI-feedback sounds bypass this flag:
- `playBubblePopSFX()` — now a thin alias for `_playThemeEntranceSFX(8, 55)`
  (consolidated v1.81d, same 8-pop shape). Fires on Change Topic open AND on
  first "By Theme" entry (category pills stamp-in).
- `_playCandidateSFX()` — **3** softer sine pops, 380→140Hz, 80ms apart.
  Fires when CS picker candidate cards stamp in, and on every themes-grid
  render.
- `_playThemePreviewSFX()` (v1.86) — **3** quieter/deeper sine pops,
  150→60Hz @ 0.022 gain, 90ms apart. Fires when a theme card's 3-card
  preview expands — deliberately distinct from the two above.
- `playPillSFX()` — single quick rising blip (80→200Hz). Generic pill-click
  feedback (Library categories, browse toggle, theme filter pills,
  podcast/person filters). **No longer used for drawer category tabs**
  (v1.81d — felt too loud for that context).
- `_playSwapSFX()` (v1.81c/d) — single soft falling tick (320→180Hz, gain
  0.05). Used for: drawer category-tab content swap (Library `setCat`,
  episode/theme drawer tabs), and CS modal state changes (scenario switch,
  related-concept swap, Story Mode open/close).
- `_playCloseSFX()` (v1.94) — soft descending tone (260→130Hz, gain 0.045, 0.14s). Wired to both drawer X buttons. Distinct from swap woosh — lower pitch, slightly longer fade.
- `playExpandSFX()` — concept pill expand/collapse. Gated by `SFX_ENABLED`.
- `playCardFlipSFX()` — episode/theme drawer card flip. Not gated.

All share `_getSfxCtx()` / `_sfxCtxPool` (lazy AudioContext singleton,
resumed on first user gesture).

**Design rule (v1.81-1.88):** when adding a new pop-SFX for a new UI
context, reuse the "N pops, ~80ms apart" cadence but give it its own
pitch range/oscillator — don't reuse an existing function verbatim if it'll
fire in immediate succession with another (e.g. category pill → theme tile
→ preview cards). See build-journal 2026-06-13 #5.



## Episode Intelligence Layer — episode_meta.json

Stored in `episode_meta.json` at repo root. One entry per episode-type collection, keyed by `collection_id` (string).

**Fields per episode:**
- `collection_id` — integer, mirrors the key
- `dna` — object, category % distribution computed from concepts.json at build time (computed v2.11)
- `summary_style` — `"A"` / `"B"` / `"C"` / `"D"` — which style was used (set v2.12)
- `summary` — 110–125 word editorial summary, 3 paragraphs (null until generated)
- `sharpest_line` — single most quotable sentence from the episode
- `tension` — `"[Force A] vs. [Force B]"`, max 15 words
- `verdict_listen` — array of 2–3 "you've ever..." / "you work in..." fragments
- `verdict_skip` — array of 1–2 honest skip reasons
- `vocab_vault` — array of `{ word, definition, timestamp_seconds }`. Extraction
  now stores 20–25 entries per episode (extended from 5–7 in a prior session,
  July 2026), but the product UI still only *previews* the 5–7 best by
  default, with an option for the user to expand and see the rest. Storing
  more than we preview means we don't have to re-run extraction later if the
  preview count changes. **Backfill needed:** the 15 episodes that already
  had intel generated before this change only have 5–7 vocab_vault entries
  stored — rerun `tools/generate-episode-intel.js` (or the extract.html intel
  panel) on those 15 to backfill the full 20–25 list.

**Summary styles (v2.12):**
- **A — Opinionated Friend:** guest personality or debate drives. P3 = exactly 3 sentences.
- **B — One Premise:** one counterintuitive premise the whole episode orbits. P3 = exactly 2 sentences.
- **C — The Long Zoom:** real subject is larger/stranger than stated; wry zoom-out. P3 = exactly 2 sentences.
- **D — The Skeptic ("Surprise Me"):** strongest objection P1, one crack in it P2, where skeptic lands P3. P3 = exactly 2 sentences.

**Generation:** `tools/generate-episode-intel.js` — calls `claude-haiku-4-5-20251001`, writes to `episode_meta.json` after each episode (crash-safe). `extract.html` (epistemic-tools repo) has a browser-side intel panel for per-episode generation with style override.

**Universal rules:** no em dashes, no "not X but Y" variants, no triads, max 1 colon per summary, 110–125 words total, first names only after first mention, never start with guest/host name, never "In this episode..."

---

## Files of record

| File              | Owns                                              |
|-------------------|---------------------------------------------------|
| concepts.json     | The concept entities (the source of truth) — 669 concepts as of 2026-06-28 (was 594; 31 new concepts IDs 639–669 added, collection 519). Do not cite a fixed number in docs or code. |
| collections.json  | The collection entities (curated packs + episodes) — includes collection 519 (Something Is Very Wrong With Modern Life, Modern Wisdom) as of 2026-06-28 |
| **index.html**    | **The live site (v2.4+). spark.html promoted to index.html 2026-06-24. spark.html retired. Old index.html archived as index-legacy.html. Both JSON fetches cache-busted with `?v=Date.now()` (added v2.10).** |
| index-legacy.html | Archived legacy UI (v172 base, pre-spark, ~10k lines). Not served in production. Safe to delete after 2026-07-24. |
| airtable          | Editorial workflow + APPROVED gating              |
| make.com          | **Legacy.** Originally glue between Airtable and the GitHub publish API for both the Intake→extract scenario and the APPROVED→publish scenario. As of 2026-07-02 the APPROVED→publish half has moved to a GitHub Action (see `tools/publish-approved.js` row below); that Make.com scenario should be paused once confirmed (confirmed 2026-07-02 — see `docs/pending-decisions.md`). The Intake→extract scenario was never Gergely's actual workflow and has been inactive throughout. |
| /api/extract-concepts.js | Claude API → candidate concepts. **NOT part of the active workflow (confirmed with Gergely, 2026-07-02)** — Gergely always pastes transcripts into `extract.html` directly instead (see Path A/B below). Kept in place, untouched, in case the automated Airtable-Intake path is revived; do not build on top of it without checking first. Prompt content (v1.8.1, 2026-06-28) still kept in sync with the reference `extraction-prompt-v1_X.txt` files as a matter of hygiene, even though the endpoint isn't live-triggered today. See `docs/pending-decisions.md`. |
| /api/publish-concept.js  | Approved concept → committed to GitHub (per-concept fallback; see `/api/publish-batch.js` for the batch path) |
| /api/publish-batch.js | Approved concepts (array) → committed to GitHub in one PUT. The actual publish mechanism triggered by the GitHub Action below (unchanged by the 2026-07-02 migration — only who calls it changed). |
| tools/publish-approved.js + .github/workflows/publish-approved.yml | **Current live "APPROVED → publish" trigger (added 2026-07-02, replaces that half of Make.com).** Manually-triggered GitHub Action: fetches Airtable rows with Status=APPROVED, builds the batch payload, POSTs to `/api/publish-batch.js`, writes results back to Airtable. Same one-click UX as the old Make.com scenario. See `docs/pending-decisions.md`. |
| /api/subscribe.js | Newsletter signup (Brevo)                       |
| hook-style-guide.md / term-style-guide.md / plain-style-guide.md / analogy-style-guide.md / prompt-style-guide.md | Canonical editorial rule sets for all 5 concept fields. Kept in sync across `extract-concepts.js`, `extract.html`'s 3 prompt strings (EXTRACTION_PROMPT, SHORT_EXTRACTION_PROMPT, REGEN_SYSTEM_PROMPT), and `extraction-prompt-v1_X.txt` — when one changes, update all four locations. `analogy-style-guide.md` and `prompt-style-guide.md` added v2.10. |
| plain-batch.js / plain-batch.html | Plain-field batch rewrite tool (v2.1). Built but not yet proven at scale — see build-journal 2026-06-20/21 entry before relying on it for a large pass. |
| concept-rewrite-prompt.md | Reusable prompt for rewriting individual live concepts in a fresh chat. Contains all v1.8 field rules + self-check + commit format. Added v2.10. |
| extraction-prompt-v1_8.txt | Reference doc for the active extraction prompt. **NOT a live source** — `extract-concepts.js` and `extract.html` are the live files. Update this after updating the live files, not before. |

- Newsletter signup: `/api/subscribe.js` → Brevo POST /v3/contacts → list ID 3
- Feedback capture: `/api/feedback.js` → Brevo POST /v3/smtp/email → getepistemic.app@gmail.com
- Env var: BREVO_API_KEY (Vercel)

---

## index.html architecture (v1.76+ / spark.html; promoted to index.html 2026-06-24)

Active file. All `v172.html` logic preserved verbatim; structural additions only.

**v2.4 additions (2026-06-24):**
- Canonical + OG/Twitter meta tags added to `<head>` — `og:url` points to `https://epistemic.live/`. `og:image`/`twitter:image` omitted until `/og-image.png` exists in repo root.
- `.founder-reveal` scroll-reveal: `initScrollReveal('.founder-reveal', founderText)` runs post-render. Reuses existing `IntersectionObserver` + stagger pattern.
- Library scan toggle refactored: single `#spScanToggle` → `#spViewGrid` / `#spViewScan` pair inside `.sp-view-pair`. `spSetScanMode(bool)` is now the canonical function; `spToggleScan()` delegates to it.
- Founder emphasis classes: `.founder-line-bold` (italic + 700 weight, same size as `.founder-line-emphasis`), `.founder-italic-body` (italic, body size), `.founder-accent` (gold + weight 500).
- Podcast pills: always show all pills regardless of row-expand state. "Show less podcasts ↑" button added when rows are expanded beyond the default 3.

### Unified right panel (v2.5+)
- `conv-overlay` / `conv-panel` houses **three tabs**: Spark · Stash · History (Stories tab removed in v2.5, moves to dedicated Panel B in v2.6)
- `openSparkPanel(conceptId?)` — single entry point for ALL Spark panel opens. Replaces `openCSFromNav()` + `_csOpenPanel()`. Calls `_csRestoreOrLoad(concept)` after render — always tries to restore cached AI data before showing Generate button.
- `openConversations()` → opens `conv-panel`, activates Stash tab (`panelSwitchTab('stash')`)
- `_convOpenCSById(id)` → `panelSwitchTab('spark', true)` + `openSparkPanel(id)` — restores correctly
- `_mountCSInPanel()` — called once after concepts load; moves `cs-card-inner-scroll` into `#panelSectionSpark`
- `panelSwitchTab(tab)` — entering section: `translateY(10px→0)` + opacity 0.45s. Items stagger via `panelItemIn` keyframe.
- `cs-overlay` and `cs-card` shell: `display:none !important` — content is in the panel

**Spark tab state machine (v2.5):**
```
State READY:    concept loaded, Generate button visible, no AI data
State LOADING:  button spins, loading messages rotate below
State GENERATED: prompt (Playfair italic) + coaching block (surface2 container)
State SEARCHING: search results overlay concept area (clears on pick or Escape)
```
No scenario states. No picker states. No story states in Spark panel.

**Scenario system (killed v2.5):**
- `CS_OPENERS`, `_csCtx`, `_csCat` — removed (kept as `var` dummies for story mode compat)
- All picker/topic/scenario DOM and JS removed. ~400 lines deleted.
- `_csSwapConcept(id)` kept as minimal stub for story mode term pills.
- `spScenarioPill(el, scenario)` rewritten to open Spark with seed concept.

**Spark panel search bar (v2.5):**
- `#sparkSearchWrap` — bordered box (distinct from hero search), ✦ icon, italic placeholder
- Reuses `FUSE` instance (not `FUSE_INSTANCE` — important: the variable is called `FUSE`)
- Term-first sort: exact → startsWith → includes → Fuse score
- `_initSparkSearch()` called after concepts load

**Concept display (v2.5):**
- Eyebrow label + Playfair bold term (no expand pill)
- Desktop hover → `_spPreviewCard(id, pill, { panelMode:true })` — `position:fixed`, NO `+window.scrollY`, viewport-clipped
- Hover wired via DOM clone on every `_renderCSShell()` — no stale listener accumulation

**Coaching layer (v2.5):**
- `_applyAIData(d, doTypewriter)` — `true` fires typewriter then coaching; `false` expands prompt (0.45s fade) then coaching (500ms delay, instant `.visible`)
- `_showCoaching(animate)` — builds innerHTML, calls `_csShowPostPrompt()` (which clears inline `display:none` from roll collapse), staggers `.cs-opener-block.visible`
- Opener structure: `.cs-opener-intro` label (above) + `.cs-opener-line` (gold left border, italic) — label is a sibling, not inside the border
- Same structure for stash: `.stash-opener-block` > `.stash-opener-label` + `.stash-opener` (gold left border)
- Pitfall: `.cs-pitfall` (red left border, italic) — same size/style as opener lines

**Casino roll (v2.5):**
- `_csRollNewConcept()` — collapses prompt+coaching (0.18s), waits 220ms, rolls 12 terms, lands on random
- `_csSurprise()` kept as alias

### cs-generate.js (v2.5)
- **Model: `claude-sonnet-4-6`** — was `claude-sonnet-4-5` (deprecated, caused all 500 errors in prior sessions)
- `ctx: 'friend'` sent from frontend — compatible with old deployed file
- `ctx: 'universal'` branch added: 8 rotating tone styles (server-side variety), returns `{ ctx: { prompt, openers, pitfall } }`
- Legacy all-4 path still present as fallback
- Frontend fallback: `data.ctx` → `data.contexts.friend` → error reset

### Panel B — Stories (v2.6 — not yet built)
State machine designed: Entry (4 pills) → Loading → Story (typewriter + inline term pills) → Outro (Spark CTA + Save). My Stories tab. Locked seeds 1–2 in `SP_STORY_SEEDS`. See roadmap.md for full build sequence. `openStoriesPanel()` is a stub in v2.5.



### Hero Zone 1 (spark.html only)
- Tagline: "Ideas die in *your earbuds.*" + sub-tagline
- `#spSearchWrap` — Fuse.js hero search; `_spShowResults()` uses `position:fixed` + `getBoundingClientRect` to escape `overflow:hidden` on `.sp-hero`
- `#spDropdown` — `position:fixed`, max 12 results, `max-height:320px` scrollable; body click → `_spPreviewCard(id)` on desktop, `_spLoadConceptNoFire(id)` on mobile ≤700px (loads CS shell without `_loadAI`); CTA click → `_spSelectConcept(id)` on all devices
- `#spPreviewCard` — floating `position:fixed` back-face preview card; hidden ≤1024px
- Scenario pills: 8 total; on mobile ≤600px only 1 visible in row1 + `+`/`−` expand button; row2 `position:static` on mobile (prevents overlap with browse toggle); desktop row2 is `position:absolute`
- `sp-hero { overflow:visible }` — MUST stay visible; `overflow:hidden` clips absolute row2 pills
- Animated placeholder: `setInterval` cycles 5 real concept terms every 3s; pauses on focus
- Typewriter on `<em id="spTaglineTyped">`: `localStorage` 2hr cooldown (`ep_typed_v1`); character-by-character with jitter; `aria-label` on em for screen readers; triggers sub-tagline fade+zoom after completion
- `#spSub { opacity:0; transform:scale(0.96) }` initially — shown after typewriter via inline style

**Search prefix commands (`_parseSearchPrefix`, v1.90):**
- `source:[alias]` / `from:[alias]` → filters `CONCEPTS` by `.source` field; `SOURCE_ALIASES` map covers `modern wisdom/cw`, `hormozi/ah`, `koe/dk`, `core/foundational`
- `saved:` / `stash:` → returns IDs from `lll_cs_saved_v1`
- `story:[query]` → fuzzy-filters concepts, Enter clears search and calls `_csOpenStoryPicker(seed)` (no auto-fire)
- Gold hint label (`#searchPrefixHint`) appears below input while prefix active

### CS help bubble (spark.html v1.76e fix)
- `#csHelpBubble` is **teleported to `<body>`** by `_wireCSEvents()` on first init
- Show/hide via `.cs-help-bubble--visible` CSS class, added on `mouseenter` / removed on `mouseleave` of `#csHelpBtn`
- Coordinates set via `getBoundingClientRect` on `mouseenter`
- **Why:** `conv-overlay` (`z-index:1100`) creates a stacking context. Any `position:fixed` child is painted within that context regardless of its own z-index. Teleporting to `<body>` escapes all stacking contexts. `z-index:99999`.

### spark.html localStorage (additions only — all v172 keys unchanged)
- `lll_cs_stories_v1` — array, max 20 (ring buffer, newest first). Written by `_csSaveStory()` on every successful story generation. Each entry: `{ id, term, conceptIds[], conceptTerms[], conceptCategories[], story, opener, ts }`. Read by `_convRenderStories()` (moved to Panel B in v2.6).
- `lll_cs_history_v1` — array, max CS_HISTORY_MAX. Written by `_csLogHistory()` on every concept load in `_renderCSShell()`, updated with promptText by `_csLogHistoryWithPrompt()` when sparked. Each entry: `{ id, term, category, ctx, promptText, ts }`.
- `lll_cs_saved_v1` — Stash entries. Shape: `{ id, term, category, aiData: { universal: { prompt, openers, pitfall } } }`.
- `lll_user_context_v1` — (planned v2.7) personalized context. Shape: `{ role, situation, interests[] }`.
- `CS_SESSION_KEY` (`lll_cs_ai_`) + conceptId + `_universal` — session cache for generated AI data. Cleared on tab close.

### Typewriter utility — `_csTypewriter(el, rawText, opts)` (v1.97)
- Tokenises raw text into: `char`, `break` (`\n\n`), `label` (`[[LABEL:Term]]`), `bold_start`/`bold_end` (`**text**`)
- Renders progressively into `el`, creating `<p>` elements on break tokens
- **Break+label adjacency rule:** if `break` is immediately followed by `label`, skips new paragraph — label renders inline at end of current paragraph; consumes the following `break` and opens a new paragraph after
- Term labels: fade-in `<span class="cs-story-label">` with tooltip (uses `plainMap` keyed to `concept.term.toLowerCase()`)
- Bold: `<strong class="tw-bold">` — styled `color: var(--accent)` (gold)
- Cursor: `<span class="tw-cursor">` blinks during typing; `tw-done` class fades it on completion
- `el._twCancel()` stops the in-flight typewriter — call before replacing el content or on panel close
- Speed: `speed:4 + jitter:6` (avg ~7ms/char) — calibrated for 200-word story in 6-8s

### Scan Mode — `spToggleScan(btn)` (v1.96)
- Toggles `.scan-mode` class on `#netflixRows`
- On: calls `_spReinjectScanTiles(grid)` — removes stale tiles, injects `.sc-tile` divs into each `.nf-row` via `DocumentFragment`, registers single delegated click listener (`grid._scanDelegate`) on the grid
- Off: removes tiles, removes delegation listener, restores arrow visibility
- `buildGrid()` calls `_spReinjectScanTiles()` at end if scan mode is active — survives category changes
- Tile click → `_spScanTileClick(id, anchorEl)`: first click shows `_spScanPreview()`; second click on same tile calls `_spSelectConcept(id)`
- `_spScanPreview()`: fixed-position card anchored right of tile (or left if near screen edge); outside-click dismiss stored as `card._dismissFn` and removed cleanly by `spDismissPreview()`

### cs-generate.js (v1.97 / updated v2.5)
- Model: `claude-sonnet-4-6` (**was `claude-sonnet-4-5`** — updating this was the fix for all 500 errors across CS generation sessions. Never revert.)
- Story mode system prompt: Perel+Koe voice, "you" POV, profanity allowed, no em-dashes, no triads, no awakening moments, specific nouns, show-don't-tell, end small. Scene hints injected per `storyCtx` value.
- Story output format: `{"story": "text with [[LABEL:Term]] and **bold**", "opener": "..."}` — labels on their own line (tokeniser handles inline placement)
- Conversation starter mode: unchanged structure; prompts tightened (no therapy-speak, no em-dashes)



As of v1.33 there are two ways concepts enter the pipeline:

**Path A — Intake form (inactive, confirmed 2026-07-02)**
Airtable Intake form → Make.com → `/api/extract-concepts` (Claude API) → creates collection + writes PENDING concepts to Airtable Concepts table.
- Limit: ~95k chars before Airtable Long-text breaks.
- Status: code still works and is kept in place, but **Gergely confirmed (2026-07-02) he never uses this path** — always uses Path B instead. Not part of the active workflow; don't build on top of it without checking first. See `docs/pending-decisions.md`.

**Path B — `extract.html` (current, all transcript lengths, the only path actually used)**
Local browser tool → Claude API direct → GitHub commit (collections.json) → Airtable POST per concept.
- No length limit.
- Same security model as `upload.html` (private file, keys in browser inputs/localStorage, never committed).
- Use for everything going forward.

Both paths land concepts in Airtable as PENDING with the same shape. Approval and publish flow is identical from there: Status flip to APPROVED → **GitHub Action `publish-approved.yml`, manually triggered (replaced the Make.com watch step, 2026-07-02, confirmed working)** → `/api/publish-concept.js` or `/api/publish-batch.js` → commit to `concepts.json` → Vercel deploy.

## Source code attribution (v1.33+)

Source codes are open-ended. Known mappings (`cw`, `ah`, `dk`, `core`) take precedence. Unknown hosts get a 2-letter code generated from their name initials, lowercased. Collisions resolved by appending the next consonant from the last name (e.g. `ahu` for Andrew Huberman so as not to collide with Alex Hormozi).

The `Source` field in Airtable is a Single Select; `typecast: true` on the POST means new options auto-create on first use. No manual schema change needed when a new podcast launches.

## Current publish-path schema (as of 2026-05-12)

`/api/publish-concept.js` and `/api/publish-batch.js` write the full 11-field schema to `concepts.json`: id, term, category, source, hook, plain, analogy, prompt, collection_id, timestamp, editors_pick.

Make.com posts 10 fields per concept (the 7 content fields + collection_id + timestamp + editors_pick). The publish function generates `id` server-side as `max(existing id) + 1`, then appends the complete 11-field object.

`editors_pick` is boolean. Default false. Read directly off the incoming payload using `raw['editors_pick'] ?? raw["Editor's Pick"] ?? raw['Editors Pick']` — the `readField` helper cannot be used because it filters out booleans. Any of `true`, `"true"`, `1`, `"1"` coerce to true; anything else (including `false`, `null`, missing, `0`) becomes false. Live-site rendering checks `c.editors_pick === true` so older concepts without the field render as not-picked.

`collection_id` is integer or null. `timestamp` is integer (seconds) or null. Same null-normalization patterns as before.

- `related_ids` — `integer[]` — IDs of semantically related concepts, generated by Claude at extraction time. 3–5 IDs preferred, cross-category links prioritised. Bidirectional in the UI (reverse links computed at page load from the forward declarations). Empty array `[]` for concepts extracted before v1.49.

- `backfill-related-ids.html` (tools.epistemic.live) — dual-mode utility:
  Mode 1 syncs manually-curated Related IDs from Airtable; Mode 2 uses Claude
  API to auto-assign related_ids across the whole library. One-time backfill
  is complete (v1.50); tool retained for re-runs if schema changes.

Schema compliance: as of v1.43 the publish path matches the 11-field schema. The Editor's Pick infrastructure (Group D? Group E? — unlabeled in roadmap) is complete end-to-end.

**Batch publish path (v1.35+):** `/api/publish-batch.js` accepts an array of concepts and commits them in a single GitHub PUT. Each concept can use either lowercase keys (`term`, `hook`, `collection_id`) or Airtable-aggregator-cased keys (`Term`, `Hook`, `Collection ID`) — the function tries both. Output is `{ success, published_count, failed_count, results: [{airtable_id, term, concept_id, success, error}] }`. Per-concept results let Make.com flip Status to PUBLISHED on success or write an error message on failure, all in one scenario run. The per-concept `publish-concept.js` endpoint remains live as a fallback for one-off publishes.


---

## v170index.html — Test branch (2026-06-05)

A parallel test file `v170index.html` was created to QA v1.70/v1.71 changes without overwriting the stable `index.html` (v1.69). Vercel serves it at `epistemic.live/v170index`. It shares the same `concepts.json`, `collections.json`, `cs-generate.js`, and all other assets from the repo root.

Key architectural changes introduced in this branch:
- **Per-scenario CS generation:** `cs-generate.js` now accepts `ctx` param and returns `{ ctx: {...} }` for single-scenario calls (700 max_tokens). Legacy all-4 mode (`{ contexts: {...} }`) preserved as fallback when `ctx` is absent.
- **`initConversationStarter()` decoupled from `openCS()`** — modal init and modal display are now separate. Init runs after `loadConcepts()` resolves; open is user-triggered only.
- **Orphan concept drawers** (e.g. "Foundations: Power & Influence") are `collection_id`-grouped concepts where the collection has `type: "pack"` or `"core"` rather than `"episode"`. Cards inside are intentional groupings, not random. "More from this episode" button only renders when the collection has a valid `episode_url`. This is working as designed.

## LocalStorage keys added in v1.71

| Key | Purpose |
|-----|---------|
| `lll_badge_date_v1` | Date string of last badge count reset (daily) |
| `lll_badge_count_v1` | Integer count of concepts saved today (resets daily) |

---

## CS modal architecture — v1.74c state machine (v172.html)

The modal operates as a 4-state machine:

**State A (Loading):** Skeleton visible, brand-voice messages rotating. Coaching hidden. Reveal row + actions always visible so user can navigate. Triggered by: auto-open on page load, `_csSwitchCat()`, `_csSurprise()`, `_csSwapConcept()`, scenario button pick (when no cached data).

**State B (Prompt ready):** Prompt fades in via `cs-prompt-hidden → cs-prompt-visible`. Coaching fades in. All post-prompt elements revealed via `_csShowPostPrompt()`. Feedback row shown separately after 2s delay. Scenario buttons with existing prompts marked with `has-prompt` class (coral border `rgba(196,122,122,0.6)`).

**State C (Restored from cache):** Used by `_csRestoreOrLoad()` — session cache or saved storage has `aiData[ctx]`; `_applyAIToCtx()` called directly. No API call. Full coaching restored including openers/pitfall.

**State D (Concept loaded, no prompt):** New concept selected via category change, Prev/Next with no cache, or Browse → Chat. Coaching hidden. Reveal row, actions, and generate button all visible. User must trigger generate explicitly.

**Concept navigation stack:** `_csConceptStack[]` + `_csStackIdx`. Prev/Next use `_csRestoreOrLoad()` — checks session cache first, then `lll_cs_saved_v1`, only calls `_loadAI()` if nothing cached. Never blindly re-generates.

**One writer rule for history:** Only `_csLogHistoryWithPrompt()` writes to `lll_cs_history_v1`. Called once per successful API response in `_applyAIToCtx()`.

**Save button state (per-scenario v1.74b): `_csUpdateSaveBtn()` checks `savedEntry.aiData[_csCtx]` — green only if current scenario has a stored prompt. Called from `_renderCSShell`, `_applyAIToCtx`, `_csRestoreOrLoad`, and on every scenario button click.`

**aiData merge rule:** `_csSaveConcept()` uses `Object.assign({}, existing.aiData, new.aiData)` — per-ctx merge. A save from scenario B never overwrites scenario A's openers/pitfall.

**One writer rule for history:** Only `_csLogHistoryWithPrompt()` writes to `lll_cs_history_v1`. Called once per successful API response in `_applyAIToCtx()`.

**Key entry paths and their required UI state:**
| Entry path | Must show |
|---|---|
| `initConversationStarter()` | auto-generates; actions/reveal shown by `_csShowPostPrompt` |
| `openCSFromNav()` | restore if `_csAIData` exists; generate btn if not |
| `_csSwitchCat()` | reveal row + actions + generate btn |
| `_csLoadNewConcept()` | reveal row + actions; generate btn shown separately |
| `_convOpenCS()` | reveal row + actions + generate btn (Browse → Chat) |
| `_convOpenCSById()` | `_csRestoreOrLoad()` handles all sub-states |
| `_convOpenCSWithScenario()` | `_csRestoreOrLoad()` + scenario section pre-opened |

## LocalStorage keys — v1.74c

| Key | Purpose |
|-----|---------|
| `lll_cs_saved_v1` | Array. Entry: `{ id, term, category, savedAt, aiData }`. `aiData` is per-ctx object; merge on save. |
| `lll_cs_history_v1` | Array (max 50). Entry: `{ id, term, category, ctx, ts, promptText }`. Read-only by History tab. |
| `lll_badge_date_v1` | Orphaned — still written but badge reads saved array directly |
| `lll_badge_count_v1` | Orphaned — same |

**Badge logic:** `refreshNavBadge()` reads `lll_cs_saved_v1`, filters `savedAt` = today, counts. Daily counter keys unused.

**sessionStorage keys (v1.74):** `lll_cs_ai_{conceptId}_{ctx}` — written by both `_loadAI()` (CS modal) and `_convGenerateCtx()` (Stash inline generate). This is the shared hot cache. Any surface that generates a prompt must write here so the other surface picks it up without re-fetching.

**sessionStorage keys added in v2.7:** `corner_situation` — written by `_cornerSparkSituation()` before opening Spark. Not currently used (Sparring replaced Corner Spark).

**localStorage keys — full list (as of v2.8f):**
| Key | Purpose |
|-----|---------|
| `lll_cs_saved_v1` | Spark stash. Entry: `{ id, term, category, savedAt, aiData }`. |
| `lll_cs_history_v1` | Spark history (max 50). Entry: `{ id, term, category, ctx, ts, promptText }`. |
| `lll_badge_date_v1` | Orphaned — still written but badge reads saved array directly. |
| `lll_badge_count_v1` | Orphaned — same. |
| `lll_corner_saves_v1` | Corner sessions (max 30). Entry: `{ userInput, result, ts }`. Auto-saved every result. |
| `lll_stories_v1` | Story Mode saves (max 20). Entry: `{ scenario, date, preview, fullHtml, eyebrow, conceptIds }`. Dormant — Story Mode hidden. |
| `lll_streak_v1` | Reading streak tracker. |
| `lll_theme` | Dark/light mode preference. |

**`_csRestoreOrLoad` v1.74c behaviour:** Loads ALL ctxs from session cache + saved storage in one pass (merged). Never drops to fresh generate if *any* ctx has data — only generates fresh if the concept has zero cached data anywhere. `_csUpdateScenarioBadges()` called after every restore.

## LocalStorage keys added/changed in v1.72

| Key | Purpose |
|-----|---------|
| `lll_cs_history_v1` | Now includes `promptText` field per entry (added v1.72) |
| `lll_badge_date_v1` | Still written but badge no longer reads it (badge reads saved array directly now) |
| `lll_badge_count_v1` | Same — orphaned but not deleted |

**Badge logic change (v1.72c):** `refreshNavBadge()` now reads `lll_cs_saved_v1` directly, filters `savedAt` = today, counts that. Daily counter keys are obsolete.

---

## Themes feature — v1.79–v1.86 (spark.html)

**Toggle:** "By Episode / By Theme" (`browseSwitch()`) — Playfair-italic
underline tabs with an animated sliding gold indicator (`.browse-toggle-
underline`, v1.81c), positioned via `_positionBrowseUnderline()`.
`#episodesSection` shown by default; `#themesSection` `display:none` until
first switch, then renders via `_animateThemesEntrance()` (one-time,
`dataset.rendered` guard) — category filter pills stamp in (55ms stagger,
8-pop SFX, fires once), then the grid stamps in (80ms stagger, 3-pop SFX).

**Themes grid (`.theme-card`):** rendered as **per-row containers**
(`.themes-row`, each a 3-col grid, 3/2/1 cols at 1240px/900px/540px-ish
breakpoints), each followed by its own `.theme-preview-zone` (v1.86 — see
build-journal 2026-06-13 #2 for why per-row, not one shared grid). Each card:
- Loads `/images/themes/theme-{id}.jpg` (1024×1024 AI-generated,
  surreal/retro-poster style, v1.80). **The 6 new themes (201–206) have no
  image asset yet as of v2.18** — falls back to emoji cleanly, but
  `theme-201.jpg`…`theme-206.jpg` still need to be generated for visual parity
  with the old set.
- `onerror` fallback → emoji (`col.symbol`) on radial-gradient
  background — site never shows broken images even if an asset is
  missing/renamed
- Title overlay at bottom via `.theme-card-overlay` gradient
- **"Explore →" button** (v1.86): bottom-right, hover-reveal (always
  visible on touch via `(hover: none)`), opens `#themeDrawer` directly

**Grid renders only `status !== "legacy"` themes (v2.18)** — `renderThemesGrid()`
filters `COLLECTIONS_BY_ID` to `type === 'thematic' && status !== 'legacy'`,
so the retired 101–116 set stays in `collections.json` for historical
reference but never appears in the live grid or drawer.

**Category filter pills (`.theme-filter-pill`):** filter the 6 live themes
by `collections.json` `categories[]` overlap with the selected
category (`CATEGORIES` array, same 14 categories as concepts). Magnetic
cursor effect via `initMagneticPillsFor('#themesFilterRow', '.theme-
filter-pill')` (v1.81c, same effect as Library category pills).
Selecting "All" or changing filter resets `_themesShowAll = false` and
re-stamps the grid (3-pop SFX).
"Show all themes ↓" button appears only when filtered set > 9.

**Click flow (v1.86):** `themeClick(id)` finds the clicked card's
`.themes-row` and that row's `.theme-preview-zone#themePreviewZone{rowIdx}`,
toggles it open (`max-height` transition + vertical gold connector line +
glowing node positioned under the clicked card via `offsetLeft`), shows a
3-card flip preview (editors_pick-biased random pick from
`curated_collection_ids` matches, 280×370 — matches Library size), plays
`_playThemePreviewSFX()` (deeper/quieter 3-pop, distinct from grid SFX).
Clicking a different row's card closes the previous zone first. Footer
"Explore this theme →" (and now also each card's own "Explore →" overlay
button) opens `#themeDrawer` (full grid, reuses `.ep-drawer` CSS classes
and `.ep-cat-column` card styling verbatim — same pattern as the episode
drawer).

**Preview/drawer card styling:** preview cards wrap `_renderThemeCard()`
output in `<div class="theme-preview-inner nf-row">` (reuses `.nf-row`
flip/perspective mechanics + 280×370 sizing directly — simpler than the old
`.theme-preview-col`/`.ep-cat-column` wrapper). Drawer cards use plain
`.ep-cat-column` (now 4-per-row, fixed 280×370, see "Drawer redesign" below).

**Image asset convention:** `/images/themes/theme-{collection_id}.jpg`
— naming is the ONLY contract between `collections.json` and the
image files. To add/replace a theme image, just upload a correctly-
named file to that path; no code changes needed. Two prompt packs
exist for regeneration: `theme-image-prompts.md` (minimalist editorial)
and `theme-image-prompts-alt.md` (surreal/retro, currently in use).

**Term+hook centering (applies everywhere, v1.79):**
`.card-term { margin-top: auto }` + `.card-hook { margin-bottom: auto }`
centers the term+hook pair vertically between `.card-meta` (top) and
whatever comes after (flip-hint in `.nf-row`, nothing in
`.ep-cat-column` where flip-hint is `display:none`). Applies to
`.nf-row` (Library), `.ep-cat-column` (episode drawer, theme drawer) —
shared across card contexts.

## Drawer redesign — v1.81d–v1.88 (spark.html, `.ep-drawer` shared classes)

Both `#epDrawer` and `#themeDrawer` share the same structure and CSS
(`.ep-drawer`, `.ep-drawer-hero`, `.ep-drawer-cat-filter`, `.ep-cat-column`).

**Hero zone (`.ep-drawer-hero`, ~155px):** image full-bleed (or generative
bg for episodes, see below) with a bottom gradient scrim for legibility.
- `.ep-drawer-title` — Playfair 1.7rem, sits on the image with text-shadow
- `.ep-drawer-subtitle` — italic Playfair (theme tagline / episode guest
  names joined with " · ")
- `.ep-drawer-count-badge` — corner chip, concept count
- `.ep-drawer-handle` (v1.88) — absolute overlay inside the hero,
  top-centered; previously a separate flow element above the hero that
  created a visible gap/strip (see build-journal 2026-06-13 #4)

**Episode generative hero background (`_setEpisodeHeroBg`, v1.85, updated v1.94):** ~~3 blurred radial-gradient blobs (inline SVG data URI)~~ → **v1.94:** pure CSS `radial-gradient` layers (3 ellipses, positioned/sized via `_seedHash`) — same soft blob aesthetic, zero SVG filter cost. `feGaussianBlur stdDeviation="14"` was CPU-rendered on every drawer open; CSS gradients are GPU-composited.

**Category tabs (`.ep-drawer-cat-pill`):** underline-tab style (matches
By Episode/By Theme toggle), no fill — light-mode fix in v1.87 removed a
leftover `color-mix` filled-background override from the pre-redesign pill
style.

**Concept grid (`.ep-cat-column.visible`, v1.87):** 4-per-row, fixed
280×370 cards (was a flexible 3-col grid at 340px height) — matches
Library/preview card size exactly. 2-up at ≤1240px, single centered column
on mobile (≤700px), same card size throughout.

**Concept grid category switch (`filterDrawerCat` / `filterThemeDrawerCat`, v1.94):** instant swap — all columns `display:none` default; target column gets `.visible` (`display:grid`) immediately, then `.animating` in one `rAF` (`drawerCatFadeIn`: `opacity 0→1, translateY 8px→0, 0.18s`). `silent=true` param suppresses animation + SFX on initial render call. Old approach (160ms `setTimeout` delay + `position:absolute`/`max-height:0` layout hack) caused ~1s perceived lag.

## CS modal — "Connects to →" chip (v1.89)

Replaces "Related concepts" button in the CS panel reveal row. Rendered as `.cs-connects-chip` below the coaching section. Source: `related_ids[0]` on the current concept → look up in `CONCEPTS`; fallback = first same-category concept from `_renderRelated`'s pool. Click → `_csConnectsChipClick()` → `_csSwapConcept(targetId)`. "Related concepts" button HTML commented out (not deleted) — code preserved for potential restore.

## Mobile architecture (v1.90–v1.92)

**Scroll fix pattern:** touch devices should never have JS drag scroll handlers. `initDragScroll()` bails immediately on `'ontouchstart' in window || navigator.maxTouchPoints > 0`. Card tilt (`rotate(-0.8deg)`) suppressed via `@media (hover:none)` — rotated bounding box breaks touch hit-testing. `touch-action: pan-y` on `.concepts-grid` and `.concept-card` passes vertical scroll to the browser.

**Horizontal pill scroll (≤600px):** applied to `.cat-grid` (library) and `.themes-filter-row` (themes) — `flex-wrap:nowrap; overflow-x:auto; scroll-snap-type:x proximity; scrollbar-width:none`. Sticky cat bar: `.cat-grid { position:sticky; top:62px; z-index:50 }` on mobile.

**Scenario pill collapse:** `.sp-pills-row2` — `position:static` on mobile (prevents overlap with browse toggle below), `position:absolute` on `≥601px`. Row2 never has inline `style` attribute — CSS class fully controls `max-height`/`opacity`. The `+`/`−` toggle symbol is inside `<span class="sp-more-sym">` in DM Mono to avoid OS emoji rendering.

**Drawer swipe-down-to-close:** `_initDrawerSwipeClose(drawerEl, closeFn)` — attaches `touchstart`/`touchend` passive listeners on `.ep-drawer-hero`; ≥60px downward swipe calls `closeFn`. MutationObserver on each drawer's class list attaches the handler once on first `.open`.

**Search dropdown mobile:** centered via `left = (vw − dw) / 2`; compact display (hook + source pill hidden via CSS `@media (≤600px)`).

**Theme tile mobile:** `themeClick()` checks `window.matchMedia('(max-width:700px)')` — if true, calls `openThemeDrawer(id)` directly, skipping inline preview expansion.

**Mobile concept preview modal (v1.99j+):** `_spOpenMobilePreview(id, opts)` / `spDismissMobilePreview(goingToCS)` — full-screen, blurred-backdrop modal showing term/hook/plain/analogy/prompt, reusing `.back-section-label`/`.back-text`/`.back-analogy`/`.back-prompt` field classes so content always matches the real card-back. Replaces the desktop-only floating `.sp-preview-card` (CSS `display:none` ≤1024px) for three entry points: Library scan tiles, drawer scan tiles, and mobile search-result taps. `opts.fromSearch` flag controls what's left underneath on close (dropdown stays rendered, untouched, never hidden — modal just sits on top). Entrance animation: `rotateX(-8deg)` tilt settling flat, echoing the card-flip mechanic, 0.3s.

## Corner Mode — v2.7–v2.8f (index.html)

**Entry point:** `enterCornerMode()` / `exitCornerMode()` driven by `body.corner-mode` CSS class. All transitions are CSS-only (no JS mid-animation style writes beyond the class toggle + one CSS variable `--corner-translate-y`).

**Two search bars — separate DOM elements, no shared state:**
- `#spSearchWrap` — Explore mode. Has SVG magnifier icon, `#spSearchInput`, `#spPhOverlay`, `#spSearchClear`, `#spDropdown`. Hidden via `display:none` in Corner mode.
- `#spCornerSearchWrap` — Corner mode. Has 🥊 emoji icon, `#spCornerInput`, `#spCornerPhOverlay`, `#spCornerSubmit`. Hidden by default, shown on `enterCornerMode()`. Wired in `initSparkHero()` independently. Zero event listener sharing with Explore bar.
- **Why separate:** sharing a single input between two different modes always produces bleed. See build-journal Lesson 3.

**Fuse.js pre-filter (client-side):**
- Weights: `plain` 2x, `hook` 1.5x, `term` 1x. Threshold 0.55.
- Top 12 Fuse results + 4 editors_pick wildcards from underrepresented categories = 15 candidates to API.
- Runs synchronously in `_cornerGetCandidates()` before the API call fires.

**cs-generate.js branches:**
- `mode: 'situation'`: strict JSON, picks 1–3 from candidates only (no hallucination). Returns `{ concepts: [{conceptId, fitScore, isWildcard, whyThisFits, toFrameItWell, watchOutFor}], opener }`.
- `mode: 'sparring'`: single concept + situation → `{ anotherAngle, counterPerspective, oneLiner }`. 500 token limit.

**Corner panel (reuses Panel B DOM):**
- `storiesOverlay` + `storiesPanel` repurposed. Panel background: `#1a1a1a` (dark mode), `#f2ece0` (light mode).
- Tabs use `.conv-panel-tab` CSS class (identical to Spark panel tabs). `🥊 Corner` (results) + `🎪 Situations` (history).
- Brief cards: all `.corner-brief-card--accordion`. Card 0 `data-expanded="true"` (pre-expanded). Others collapsed. `_cornerToggleAccordion(idx)` handles all states.
- Sparring: `⚡ Sparring` button per card → `_cornerSparring(conceptId, cardIdx)` → `mode:'sparring'` API call → result fades in inline. Toggleable.
- Auto-save: `_cornerAutoSave()` called on every API success → `lll_corner_saves_v1` (max 30, ring buffer).

**Neural network constellation:**
- `requestAnimationFrame` canvas, `z-index:1`. Text elements at `z-index:2`.
- Hub anchored to `searchEl.getBoundingClientRect().bottom + 60px`. Rings scale to available height.
- 4 rings: 8 + 14 + 18 + 22 nodes. Each node has independent `speedX/Y`, `driftX/Y`, `dirX/Y` for organic motion.
- Fades in on `cornerSubmit()`, fades out on result arrival.

**localStorage keys added:**
| Key | Purpose |
|-----|---------|
| `lll_corner_saves_v1` | Array (max 30). Entry: `{ userInput, result, ts }`. Auto-saved on every API result. |

**Performance notes:**
- `will-change` only on `body.corner-mode .element` selectors — never on base element rules.
- `body::before/after` fades out in corner mode (`opacity:0`) to hide hairlines.
- No `backdrop-filter` anywhere in Corner Mode.
- Canvas animation paused via `cancelAnimationFrame` on result arrival.

---

## Panel B — Story Mode (v2.6, currently hidden)

Built and preserved. Story nav button `display:none`, scenario pills `display:none`, `openStoriesPanel()` is a no-op stub. `SP_STORY_SEEDS` with locked seeds 1–2 remains in codebase. `lll_stories_v1` localStorage key reserved (max 20 entries). Activate when an interactive mechanic justifies passive story reading.

**State machine (dormant):** Entry (scenario picker) → Loading → Story (Playfair body + `[[LABEL:Term]]` chip markers → gold term chips) → Term Peek (floats left of panel / bottom sheet mobile) → Outro (Spark CTA + Save + Another). My Stories tab with Revisit.

---

 `_spLockBodyScroll()`/`_spUnlockBodyScroll()` — saves `window.scrollY`, pins `body` with `position:fixed; top:-scrollY`, restores exact scroll position on unlock. Used by the mobile preview modal. **Do not use plain `document.body.style.overflow = 'hidden'/''` toggling for new modals** — it's known to leave the page stuck unscrollable on iOS Safari when paired with an inner `overflow-y:auto` element that was itself scrolled. (Note: ~7 older call sites elsewhere in `spark.html` — CS panel, episode drawer, theme drawer, nav menu — still use the plain toggle and have not been retrofitted; only fix forward if a scroll-stuck bug is actually reported there.)

**Two separate scan-tile implementations (do not assume a fix in one covers the other):** Library scan mode uses `.sc-tile` (built by `_spReinjectScanTiles`, delegated click listener on `#netflixRows`). Episode/theme drawers use a completely separate `.ep-drawer-scan-tile` (built inline inside `setDrawerView`, per-tile click listeners). Both should call `_spScanTileClick(id, anchorEl)` as their click handler — that function is mobile/desktop-aware (routes to `_spOpenMobilePreview` vs `_spScanPreview`). If either implementation is changed independently, check the other.

**Desktop scan preview column-awareness (v1.99m+):** `_spScanPreview` determines which side of its 2-column grid a tile sits in (`anchorEl.closest('.nf-row, .ep-drawer-scan-row')`, compare tile midpoint to grid midpoint) and opens the floating preview on that same side — left-column tiles preview left, right-column tiles preview right. Edge-of-viewport fallback still applies if the preferred side has no room.

## Engagement mechanics (v1.92)

**IntersectionObserver (`_initReadingProgress`):** observes all `.concept-card` elements at 55% threshold. On intersection: adds `.card-read` (one-shot per card, unobserve after). From 3rd card: adds `.card-streak` (faint gold `box-shadow` aura, single `streakPulseOnce` animation). Re-attaches on `_gridBuilt` custom event dispatched at end of `buildGrid()`. Streak glow applied inline — no MutationObserver.

**Session toast (`_showSessionToast`):** fires at `openedToday.size === 5` inside `toggleCard()` — counts unique card **flips**, not scroll-past. Gold DM Mono pill, `position:fixed bottom:24px`, slides up from bottom, 3.2s. `_toastShown` flag prevents repeat.

**PICK badge pulse:** `animation: pickBadgeBreathe 2s ease-in-out 3` — 3 cycles then stops. Box-shadow glow only (no opacity/transform). `prefers-reduced-motion: reduce` disables.

**Typewriter + sub-tagline:** hero `<em id="spTaglineTyped">` types in on each new session (2hr cooldown via `ep_typed_v1` localStorage). Initial delay `200ms` (was 680ms — reduced v1.93). `#spSub` starts `opacity:0; transform:scale(0.96)`, transitions to visible 120ms after typewriter completes. Placeholder cycles via `<span class="sp-ph-overlay">` crossfade overlay (opacity 0.35s) — replaced `setInterval` native placeholder swap in v1.93 (hard-cut, not animatable).

**`ep-preload` guard (v1.93):** `html.ep-preload` class set by inline script before first paint; removed via double-`rAF` after `render()`. Hides `.sp-hero`, `.browse-toggle-wrap`, `#episodesSection`, `#themesSection`, `#netflixRows` to `opacity:0`; `0.22s` fade-in on removal. Prevents episodes flashing before hero on hard refresh.

## Performance guardrails (v1.93–v1.95, accumulated)

Rules that have caused measurable regressions and are now non-negotiable:

- **No `backdrop-filter` on containers with active child transitions.** Even an invisible blur (e.g. on a near-opaque bg) creates a compositor stacking context that forces every child hover animation to recomposite per frame. `nav` has no `backdrop-filter` in either theme.
- **No `background-attachment: fixed` on large surfaces.** Forces full-page repaint on every scroll tick. `position:fixed` elements don't need it.
- **No SVG filters (`feTurbulence`, `feGaussianBlur`) in `background-image`.** CPU-rendered, not GPU. Use CSS `radial-gradient` / `linear-gradient` for similar visual effects.
- **No `filter: brightness/saturate` on large lists.** Creates a compositor layer per element. Use `color-mix()` on CSS variables or hardcoded values instead.
- **No `overflow:hidden` on large `position:fixed` compositor targets.** Clips all children on every repaint frame. Scope it to the smallest element that actually needs clipping.
- **`display:none` → animate requires two separate frames.** Set `display` in one step, add animation class in the next `rAF` — they cannot be combined.
- **No broad `transition` cascade on many DOM nodes.** Even `transition: background, color` on 18 selectors = hundreds of repaints per frame on theme switch. Scope transitions to individual elements.
- **No infinite CSS animations on off-screen elements.** Browser doesn't pause them when scrolled past — they composite every frame. (Resolved in v1.36/v1.02 retina pass; do not re-introduce.)


## Light mode (v1.92, updated v1.93–v1.95)

`[data-theme="light"] body` — solid `background-color: var(--bg)` (`#f5f0e8` warm parchment). ~~Paper grain via inline SVG `feTurbulence`~~ — **removed in v1.93** (CPU SVG filter, visually imperceptible at 3.5% opacity, caused paint cost on every scroll tick).

`[data-theme="light"] body::after` — `position:fixed; inset:0; pointer-events:none; z-index:0` — full-page editorial SVG layer containing: diagonal "EPISTEMIC" watermark (148px italic serif, rotate −28°, fill-opacity 0.045), left margin rule (x=52, stroke-opacity 0.18), right hairline (x=1388, 0.07), top/bottom rules (y=52/848), gold filled-circle crosshairs at all 4 corners, masthead text "IDEAS WORTH SAYING OUT LOUD" (top-left, monospace, fill-opacity 0.35), "EPISTEMIC" logotype (bottom-right, fill-opacity 0.28). All gold (`#b8860b`). `background-size:100% 100%; background-repeat:no-repeat` — ~~`background-attachment:fixed`~~ **removed in v1.93** (forced full-page repaint on every scroll; `position:fixed` element is already viewport-locked, so `scroll` attachment is visually identical).

**Critical:** `z-index:0` (not `-1`) — `z-index:-1` goes behind `body` background-color and is invisible. See build-journal 2026-06-14 #7.

**Category colours in light mode:** `filter: brightness/saturate` on `.cat-card` and `.card-cat` **replaced in v1.93** with `color-mix()` on `--cat-color` CSS variable — eliminates per-element compositor layer promotion on every card in the grid.

**Nav in light mode:** `backdrop-filter: blur(8px)` **removed in v1.95** — nav bg is `rgba(245,240,232,0.97)` so the blur was invisible, but it created a backdrop filter stacking context that forced every child hover transition (emoji reveal, epic pill, CS panel buttons) to recomposite the blur per animation frame.



`initConversationStarter()` no longer calls `openCS()` or `_loadAI()`
on page load — the auto-open-unless-dismissed-today logic from v1.72
is removed entirely. `openCSFromNav()` no longer auto-fires `_loadAI`
on first open either; it always shows the "Generate starter" button
(`#csGenerateRow`/`#csGenerateBtn`) unless `_csAIData[_csCtx]` already
has cached data for the current context, in which case the existing
prompt is shown as before (no behavior change for restores).

**Why:** zero API calls during UI iteration/testing. **Re-enable
path:** see roadmap "Next up" — decide between first-visit-only
auto-generate vs. permanent manual trigger before promoting toward
`index.html`.

**Unaffected:** `_csRestoreOrLoad()`, session/localStorage caching,
Stash, History, Stories tabs — all restore-from-cache logic is
untouched. Only the *initial, uncached* generation trigger changed.
## OG Easter Egg — founder expandable section (v2.13+)

**Location in DOM:** `og-section` is a direct child of `founder-inner` (the 2-col CSS grid). It uses `grid-column: 1 / -1` to span both the photo montage column (560px) and the text column (1fr), giving true full-width layout.

**Toggle:** `og-expand-row` div inside `founder-text` (right column). Calls `toggleOgSection()` → toggles `.open` class on `og-section`. CSS grid animation: `grid-template-rows: 0fr → 1fr` with `opacity: 0 → 1`. Smooth, no jumpiness.

**Content structure:**
- `og-story` — fine-tuned identity prose (private + public identity docs blend). 2-col CSS newspaper layout at full width.
- `og-map-wrap` → `og-map-scroll` → `og-map-inner` → inline SVG (Stalk the Impossible V9, `viewBox="0 0 2400 1500"`)
- All SVG defs namespaced with `og-` prefix (og-cg, og-dg, og-arr etc.) to prevent ID conflicts with other inline SVGs on the page.

**Clickable nodes:** DRIVE, GOALS, GRIT, FLOW STATE, Intrinsic, Curiosity. Each calls `ogShowConcepts(key)`. Top-5 concepts scored from live `concepts.json` (category match +4/+2, keyword scan +3/+1, editors_pick +1, duplicate_of −99). Slide-in panel (`og-concept-panel`, `position: fixed`).

**Zoom/pan:** `ogZoom(delta)` — delta=0 resets, ±0.25 increments. Mouse wheel zoom (passive:false listener). Click-drag pan. Touch pinch-to-zoom + single-finger drag. Scale bounded 0.5–4×. State: IIFE-scoped `scale`, `ox`, `oy` vars.

**JS scoping:** All OG JS in two IIFEs — the main easter egg IIFE (v2.13, attached to the existing `</script>` block) and the zoom/pan IIFE in its own `<script>` tag before `</body>`. `ogShowConcepts`, `ogClosePanel`, `toggleOgSection`, `ogZoom` are attached to `window` for onclick handlers.

**Known issue (deferred):** OG story text fine-tuning to be done in a separate session — prose is functional but not final.

