# Session Plan — My Library → HOME (v3.17–v3.23)
# FINALIZED 2026-08-08 · Approved by Gergely (all recommendations) · Delete after v3.23 lands
# Status: READY TO EXECUTE

---

## HOW TO USE THIS DOCUMENT (read this first, executor)

- You were invoked with "Use cowork-default-instructions.md and execute session-plan.md."
- Complete the full protocol in `docs/cowork-default-instructions.md` FIRST (Step A reads, Step B statements, Step C rules). This includes reading ALL of `docs/engineering-standards.md` — non-negotiable before any CSS/JS.
- Also read before coding: `docs/design-tokens.md` (tokens, component specs) and the localStorage section of `docs/architecture.md` (~line 168).
- Version discipline: check top of `docs/changelog.md` for current version. Each phase = current + 0.01. The vX.XX numbers below are targets, not guarantees — NEVER go below changelog + 0.01.
- **Execute ONE PHASE PER SESSION.** Finish phase → tell Gergely to commit → update docs (⚠️ DOC UPDATES section of cowork-default-instructions.md) → stop. Do not start the next phase in the same session unless Gergely explicitly says "continue to phase N."
- Exception: Phases 4 and 5 may be paired in one session if Phase 4 finishes cleanly and Gergely approves continuing.
- Edit tool only, targeted old_string/new_string. NEVER rewrite index.html sections wholesale. NEVER run git commands.
- Before each phase: re-read that phase's spec below IN FULL, then run its "Locate" greps to find your edit targets. Do not trust line numbers — the file shifts every session.
- After each phase: run its Acceptance checklist + the Global pre-commit checklist at the bottom. Then the doc-update table.

---

## GOAL — one sentence
Rearchitect My Library into "Home": a compact pinned progress dashboard on top, four sections below (EPISODES · CONCEPTS · VOCAB · PRACTICE), simplified centered 5-button card toolbar, Lexi reduced to write → evaluate → coaching.

## APPROVED DECISIONS (do not re-litigate)
1. Layout: pinned collapsing dashboard + 4 tabs (no accordion)
2. Surface renamed "Home" — nav label, mobile tab label, drawer title "Home" + subtitle (see Phase 2 copy)
3. Toolbar: remove Related only; remaining 5 buttons CENTERED; keep the EXISTING master glyph exactly as-is (do NOT swap glyphs); Master→Save is tooltip/aria-label rename ONLY — zero visual change
4. Note (non-empty, on blur) auto-saves the concept. Note deletion does NOT un-save.
5. Episodes empty fallback = "Latest episodes" (never "trending")
6. Top-nav mode names unchanged: Read · Write · Speak
7. All Words + Word Map LAUNCH existing overlays (close Home first). No embedding.
8. Weekly/monthly dashboard deltas via localStorage snapshots (lll_stats_snapshot_v1)
9. Spark-a-word + vocab↔concept linking + keyword highlighting = PARKING LOT. Zero API work in this build.
10. Side pull tabs (Lexi left, Spark right) remain untouched. Design mandate: modern 2026 consumer-app dashboard feel, compact on mobile, beautiful empty states everywhere.

## ARCHITECTURE PRINCIPLE
3 nouns + 1 verb: Episodes/Concepts/Vocab = what the user owns; Practice = what they do with it.
Home shows collections; existing panels (Lexi, Spark, Global Vocab, Word Map, Quiz) remain workbenches.
Every mode entry point (top nav, pull tabs, Practice cards) calls the SAME existing function. No forked state, no duplicated logic.

## NEW localStorage KEYS (document each in architecture.md the session it ships)
- `lll_fav_episodes_v1` — `{ [collectionId]: ts }` — Phase 3
- `lll_recent_eps_v1` — array of `{collectionId, ts}`, ring buffer max 10 — Phase 3
- `lll_stats_snapshot_v1` — `{ snapshots: [{ts, epCount, conceptCount, wordCount}] }`, keep last ~8 — Phase 6
- `lll_quiz_stats_v1` — `{ plays, correct, lastTs }` — Phase 6

## STATE MACHINE (full)
```
HOME:       CLOSED → OPENING(_spLockBodyScroll ref-counted; dashboard render; stat count-up)
            → OPEN(section) → SECTION_SWITCH(double-rAF fade) → CLOSING(unlock)
DASHBOARD:  RANGE(week|month|all) toggle → bucket values re-render; bucket boxes fixed-size (no layout shift)
            SCROLL: EXPANDED ⇄ COMPACT one-line strip — opacity/transform ONLY, never height
EPISODES:   FAVS(n>0) | FALLBACK(latest + empty prompt) · ♥ toggle live-refreshes section if open
CONCEPTS:   FILTER {cat?, letter?, notes?} composable (AND logic) → fade-out → rebuild → fade-in
            TILE: COLLAPSED ⇄ EXPANDED (one at a time; insert → rAF → rAF → add class)
VOCAB:      SUBVIEW(my) renders in place · SUBVIEW(all|map) → close Home → open existing overlay
PRACTICE:   static launcher → click → close Home → existing mode open function
SAVE:       unsaved → saved via master-glyph click OR non-empty note blur (glyph pop + "Saved ✓" toast)
EP-FAV:     unfav ⇄ fav → lll_fav_episodes_v1 upsert/delete
```

---

# PHASE SPECS

## Phase 1 — v3.17 · Toolbar simplification + save semantics [MEDIUM]

**Locate:** `grep -n "btn-toolbar-div" index.html` and `grep -n "_spPreviewToolbar" index.html` and `grep -n "btn-icon-empty" index.html` — expect toolbar markup in 5 card templates + ep-drawer column builder + the shared `_spPreviewToolbar` helper (covers 4 preview surfaces). ALL locations change together or the UI forks.

**Steps:**
1. Remove the Related button from every toolbar location. Remove `.btn-icon-empty` placeholder logic and its CSS entirely.
2. Center the remaining 5 buttons: replace the left-group / `.btn-toolbar-div` flex:1 / right-group layout with a single centered group (`justify-content: center`), keep the thin divider glyph between position 3 and 4 (Share·Listen·Save | Spark·Note) — same `.btn-toolbar-div` visual, no flex:1 stretching. Do NOT touch glyphs, colors, sizes (30×30 stands), or hover/pop animations.
3. Tooltip/aria rename: every "Master"/"Mastered" title/aria-label on this button → "Save"/"Saved". No glyph change, no CSS change, no function rename (toggleMaster stays toggleMaster).
4. Note auto-save: in `_ccToggleNote` blur handler (grep `cc_note_meta_`, ~3 occurrences — update the shared path or all occurrences identically): if note non-empty AND concept id not in `lll_mastered_ts_v1` → call the same code path as toggleMaster's save branch (write ts, update glyph state on the card with its existing pop animation) + show a small toast "Saved ✓" (reuse an existing toast/feedback pattern if one exists — grep "Copied" for the notes-export ✓ pattern — else minimal fixed-position mono toast, fade in/out 1.6s, reduced-motion: no animation).
5. Related feature relocation: in the Home/Library Saved tile expansion row (grep `lib-detail-row`), add a "Related" button next to existing Spark + Open Episode buttons → calls the same function the toolbar button called (grep `_ccOpenRelated`). Must close/collapse gracefully: Related panel opens over/after the drawer — verify z-index and scroll-lock interplay; if conflict, close Home first then open Related.
6. Verify `duplicate_of` suppression: check whether saved concepts with `duplicate_of` set disappear from Library lists. If yes, note it in the changelog and fix ONLY the Library list filter (do not touch global suppression — that's a separate roadmap item).

**Acceptance:** 5 centered buttons on: main grid cards (all categories), theme cards, ep-drawer cards, sp-hero card, all-browse cards, and all 4 preview surfaces (mobile scan modal, desktop library preview, panel hover preview, corner stories preview). No `btn-icon-empty` remains (grep = 0). Note on an unsaved card → glyph fills + toast + concept appears in Saved tab. Note delete → still saved. Tooltips say Save/Saved.

**Docs:** changelog entry; architecture.md note on auto-save rule under lll_mastered_ts_v1; build-journal only if a trap was hit.

---

## Phase 2 — v3.18 · Home shell: rename, dashboard skeleton, 4 tabs [HIGH]

This is the structural session. Deliberately shell-first: correct structure, static data, polish comes later. Do not gold-plate.

**Locate:** `grep -n "openLibrary\|libTab-\|lib-tabs\|My Library\|nav-library-btn\|_libSwitchTab\|_libRender" index.html`

**Steps:**
1. **Rename surface → "Home":** desktop `.nav-library-btn` label; mobile tab bar "Library" label; hamburger menu item; drawer header title → "Home"; subtitle via existing `.panel-tagline` pattern → copy: "Everything you keep — episodes, ideas, words, practice." Keep ◱ glyph and ⌘⌥L shortcut + hint badge (verify current shortcut is ⌘⌥L per v3.14 — hint must match reality).
2. **Tab row restructure:** 4 tabs — EPISODES · CONCEPTS · VOCAB · PRACTICE (DM Mono, uppercase, small; existing `.lib-tab` underline pattern + counts). Default active tab: CONCEPTS (it has content from day one; Episodes may be empty until Phase 3). Remove Notes tab: delete `libTab-notes` button; keep `_libRenderNotes` function intact but unreferenced (Phase 4's ✏ filter covers the content; function may be salvaged or deleted at Phase 7).
3. **CONCEPTS tab = current Saved tab, wholesale.** Reuse `_libRenderSaved` and all tile/expansion/note code. Rename only what's user-visible; keep function names.
4. **VOCAB + EPISODES + PRACTICE tabs:** create panels with designed empty states only (real content in Phases 3/5/6). Empty-state pattern (use for ALL of them, and design once as a reusable class `.home-empty`): Playfair Display italic one-liner + one CTA button. Copy:
   - Episodes: "♥ any episode and it lives here." → [Browse episodes]
   - Vocab: "Words you save start collecting here." → [Open an episode's vocab]
   - Practice: "Three ways to make it stick." → cards come in Phase 6; interim: three plain buttons Spark / Write / Quiz calling `openSparkPanel()` / `openLexiPanel()` / quiz open fn (grep `quizOverlay` for its open function).
5. **Dashboard header skeleton:** above the tab row, inside the drawer scroll container.
   - Structure: greeting row ("Home" already in header — dashboard leads with the range toggle + buckets), 3-column bucket grid desktop / 2×2 compact grid mobile (≤600px), each bucket: big number (Playfair Display), label (DM Mono uppercase 10px, muted).
   - Buckets this phase (all-time, live but simple): Saved concepts (lll_mastered_ts_v1 count) · Words (lll_lexicon_v1 length) · Notes (cc_note_* scan) · Episodes ♥ (0 until Phase 3, render anyway).
   - Range toggle UI (Week · Month · All) rendered as a segmented mono pill, top-right — VISUALLY present, functionally all-time-only until Phase 6 (week/month options disabled state, `opacity:.4`, title "coming soon"). Fixed bucket min-width so numbers changing never shifts layout.
   - Count-up animation on open: 600ms, ease-out, integers only, `prefers-reduced-motion: reduce` → render final value instantly.
6. **Mobile check at 390px:** dashboard total height target ≤ ~150px (compact mandate); buckets 2×2; tab row fits one line; drawer inherits existing 88vh mobile pattern.
7. New CSS surfaces need light-mode rules (`html[data-theme="light"]`) same session.

**Acceptance:** "Home" everywhere (grep "My Library" → only in comments/docs). 4 tabs switch cleanly with double-rAF fade, counts render, CONCEPTS shows the full former Saved experience unchanged, empty states beautiful on the other 3, dashboard renders with count-up, nothing jumps on open, 390px compact, light mode correct, ⌘⌥L opens Home.

**Docs:** changelog; architecture.md — new Home structure section (tabs, dashboard, render functions); design-tokens.md — `.home-empty` + bucket pattern.

---

## Phase 3 — v3.19 · EPISODES section [MEDIUM]

**Locate:** `grep -n "openEpisodeDrawer\|ep-drawer" index.html` (drawer header build), Home episodes panel from Phase 2.

**Steps:**
1. ♥ button in episode drawer header (44×44 touch target; outline heart → filled with `var(--accent)` tint on fav; scale-pop 1 → 1.25 → 1 on toggle, 0.3s, reduced-motion: none). Writes/deletes `lll_fav_episodes_v1[collectionId] = ts`.
2. Log drawer opens → `lll_recent_eps_v1` ring buffer (unshift, dedupe by id, cap 10).
3. EPISODES panel render:
   - Fav tiles sorted by fav date desc: episode title (Playfair), podcast name (DM Mono muted), fav date relative, and the cross-stat line — compute via collection_id join against lll_mastered_ts_v1 + lll_lexicon_v1: "You kept 4 concepts · 6 words". Omit the line when both are 0.
   - Tile click → close Home → `openEpisodeDrawer(collectionId)`.
   - Unfav from tile (small ♥ on tile) → live re-render section.
   - Below favs: "Recently opened" row from lll_recent_eps_v1 (smaller tiles, horizontal scroll on mobile).
   - Zero favs → FALLBACK: "Latest episodes" list (most recent N=5 from collections data) under the `.home-empty` prompt.
4. Tile entrance: stagger 40ms/tile, translateY(6px)+opacity, 0.3s. Reduced-motion: instant.
5. Dashboard Episodes bucket now live. If Home open while ♥ toggled in drawer → refresh bucket + section on next Home open (no cross-panel live sync needed — drawer and Home are never open simultaneously; verify that assumption, if both can be open, add refresh on Home re-focus).

**Acceptance:** ♥ persists across reload; tiles show correct cross-stats; fallback shows latest 5 + prompt when no favs; unfav updates immediately; mobile 390px clean; light mode; keys documented.

**Docs:** changelog; architecture.md — both new keys.

---

## Phase 4 — v3.20 · CONCEPTS filters [MEDIUM]  *(may pair with Phase 5 on approval)*

**Locate:** existing category chips + ✏ Notes chip in the Concepts panel (grep `lib-cat-bar`, "With Notes" / `✏ Notes`), Word Map alphabet filter (grep alphabet / `wc-filter`).

**Steps:**
1. Composable filter state object: `{cat: null, letter: null, notesOnly: false}` — all three AND-combine. Single `_homeApplyConceptFilters()` renders the grid from state (fade-out 0.15s → rebuild → fade-in; reuse existing pattern).
2. A–Z letter rail: horizontal mono row of letters that EXIST in the saved set (others omitted, not disabled). Active letter highlighted; tap again clears. Mobile: horizontal scroll, `flex-wrap: nowrap`, scrollbar hidden. Match Word Map's letter styling; read term from data attributes, not textContent (build-journal lesson).
3. Wire existing category chips + ✏ Notes chip into the same state object (they currently filter independently — unify).
4. Empty filter result state: "Nothing here yet." + [Clear filters] button.
5. Filter counts update live (chip counts reflect current other-filter context OR keep global counts — keep global counts, simpler and predictable).

**Acceptance:** any combination of cat × letter × notes works and is clearable; grid always re-flows from top; one tile expansion at a time still works under filters; 390px: both filter rows scroll horizontally on one line each.

**Docs:** changelog.

---

## Phase 5 — v3.21 · VOCAB section + Lexi simplification [MEDIUM]

**Locate:** `grep -n "lll_lexicon_v1\|_lexiRenderPanel\|All Words\|openLexiPanel" index.html`; Global Vocab overlay open fn; Word Map open fn (grep `wordcloud\|wordMap\|openWordMap`).

**Steps:**
1. Segmented control at top of VOCAB panel: My Words · All Words · Word Map (mono segmented pill, same pattern as dashboard range toggle).
2. **My Words** (renders in place): tiles from `lll_lexicon_v1` — word (Playfair), definition snippet (1 line, ellipsis), practice-state badge (reuse Lexi's badge styling), ♥ if isFavorite, podcast/episode (DM Mono, muted, tiny). Sort: savedAt desc. Header CTA: "Practice N words →" + "Open Lexi →" → close Home → `openLexiPanel()`. Tile click → close Home → open Lexi (scrolled/highlighted to that word if cheap; otherwise just open Lexi — do not build deep-linking infrastructure for this).
   - Empty state: Phase 2 copy stands.
3. **All Words / Word Map**: NOT embedded. Click → close Home (full close + unlock) → open the existing overlay. If the Global Vocab overlay ("All Words") doesn't exist yet in production (check roadmap — it may still be planned), point the button at whatever global vocab surface exists (Read panel vocab view); if none, hide the segment and note it in changelog.
4. **Lexi examples-button disable:** locate the examples button in the Lexi practice flow → `display:none` via CSS + early-return guard in its click handler. DELETE NOTHING. Comment: `/* v3.21 — examples disabled, logic preserved, see session-plan */`. Verify the practice flow reads cleanly without it: write sentence → evaluator → coaching feedback.
5. Dashboard Words bucket verified live.

**Acceptance:** 3 segments switch correctly; My Words matches Lexi panel contents exactly; launches close Home cleanly (scroll lock count returns to 0 — no frozen page); examples button gone from UI but code intact; Lexi flow feels complete without it; 390px + light mode.

**Docs:** changelog; architecture.md — VOCAB section render notes.

---

## Phase 6 — v3.22 · PRACTICE launcher + live dashboard [MEDIUM]

**Locate:** quiz open function (grep `quizOverlay` / `nav-quiz-btn` onclick); Phase 2's interim Practice buttons.

**Steps:**
1. **Practice mode cards** (replace interim buttons): 3 large tappable cards, stacked mobile / row desktop. Each: glyph, mode name (Playfair), one-line hook (DM Sans, muted), live data line (DM Mono, accent):
   - Spark ✦ — "Turn a concept into conversation." — live: "N saved concepts to spark"
   - Write ✏ — "Put a word into your own sentence." — live: "N words waiting to practice" (lexicon entries with practiceState not yet practiced)
   - Quiz — "Test what stuck." — live: "Last score: X/Y" from lll_quiz_stats_v1 or "Never played"
   - Hover (desktop): border-color shift + translateY(-2px), 0.2s. Tap: close Home → existing open function.
2. **lll_quiz_stats_v1:** find quiz completion point (where final score is shown) → write `{plays: +1, correct, lastTs}`. Minimal, additive, no quiz logic changes.
3. **Dashboard live data:**
   - Snapshot mechanism: on every Home open, if newest snapshot older than 24h → push `{ts, epCount, conceptCount, wordCount}` (global content counts) to `lll_stats_snapshot_v1`, cap 8.
   - Range toggle goes live: Week/Month = delta vs nearest snapshot ≥7d/≥30d old ("+12 concepts added"); if no old-enough snapshot → show all-time value with muted "(tracking started)" note. All = totals.
   - Add global-growth buckets: "New episodes" + "New concepts · words" (deltas); keep the 4 personal buckets. 6 buckets total: 3×2 desktop, 2×3 mobile — re-verify ≤~150px is impossible with 6 on mobile; compact mobile solution: horizontal snap-scroll row of buckets (scroll-snap-type: x proximity, scrollbar hidden) instead of stacking. Choose whichever reads better at 390px; snap-row recommended.
   - Fingerprint line under buckets: one editorial mono sentence, e.g. "Strongest: psychology · Blind spot: economics" — derived from category counts of saved concepts vs. sparked (lll_cs_saved_v1). Omit gracefully under 5 saved concepts.
4. Range-toggle switch animation: bucket numbers cross-fade (opacity 0.15s out → swap → in). No count-up on range switch (count-up is open-only).

**Acceptance:** all 3 practice cards launch correct modes with clean Home close; quiz writes stats and card reflects them; range toggle functional with honest fallbacks; snapshots accumulate (verify by inspecting localStorage); no layout shift on range switch; 390px buckets legible; reduced-motion clean; light mode.

**Docs:** changelog; architecture.md — lll_quiz_stats_v1 + lll_stats_snapshot_v1 + snapshot algorithm.

---

## Phase 7 — v3.23 · Polish + interconnect [LOW]

1. **Dashboard scroll-collapse:** when Home panel scrolls >~80px, dashboard cross-fades to a compact one-line strip (e.g. "24 concepts · 31 words · 3 eps · ♥ streakless") — implement as TWO overlaid elements swapping opacity/transform (0.25s); NEVER animate height. Debounced scroll handler ≥16ms on the drawer's scroll container. Reduced-motion: instant swap.
2. `#home` deep link: on load, if `location.hash === '#home'` → `openLibrary()` (rename target fn reference as needed). Update hash on open, clear on close (replaceState, no history spam).
3. Nav badge: small count (total saved concepts + words) on the Home nav button, both desktop + mobile tab. Muted mono, dot-sized, no layout shift.
4. JSON export button (dashboard corner or Practice bottom): downloads/copies all `lll_*` + `cc_note_*` keys as one JSON blob. Reuse Notes-export ✓ feedback pattern.
5. Animation audit: every animation added in Phases 2–7 has a reduced-motion override (grep `prefers-reduced-motion` and count vs. new keyframes/transitions).
6. Dead code sweep: remove `_libRenderNotes` if truly unreferenced; remove Notes-tab CSS remnants.
7. Full doc sync: architecture.md (final Home section), design-tokens.md (dashboard bucket, segmented control, mode card, home-empty patterns), roadmap.md (mark Home build complete; move parking-lot items there), changelog.

**Acceptance:** scroll-collapse buttery on iOS Safari (test transform interplay — see build-journal iOS lessons); deep link works; export round-trips; grep audit clean.

---

# GLOBAL RULES (apply to every phase)

- **Engineering-standards hard rules:** no backdrop-filter on containers with child transitions; no height/top animations on scroll; no new hex values — tokens only; null-check every DOM lookup; light-mode rule for every new surface; 16px inputs on mobile; `touch-action: pan-y` where grids scroll; body scroll lock ONLY via `_spLockBodyScroll`/`_spUnlockBodyScroll`.
- **Fonts:** Playfair Display (display numbers/titles), DM Sans (body), DM Mono (labels/eyebrows/stats). Nothing else.
- **display:none → animate = two rAF frames**, always.
- **Never put positional/compositing CSS on bare `nav {}` or other shared element selectors** — scope to IDs (build-journal, cost 2 sessions).
- **Search dropdowns / popovers inside the drawer:** position:fixed + getBoundingClientRect (parents use overflow:hidden).
- **Grid with expandable tiles:** `align-items: start`.
- **Pre-commit, every phase:** no hardcoded hex; no curly quotes in JS; light-mode rules present; 390px verified; reduced-motion overrides present; new keys documented; `node --check` equivalent syntax pass if JS extracted for validation.
- **Communication:** flag anything ambiguous with **[ACTION]** and the most conservative interpretation; don't silently choose on HIGH-impact ambiguity.

# ROLLBACK
- One commit per phase → revert via GitHub Desktop.
- All new localStorage keys additive; no destructive writes to existing keys; no migrations.
- Phase 2 keeps `_libRenderNotes` + all Saved-grid code intact — rename shell only.
- `_spPreviewToolbar` is the single source for preview toolbars — fix regressions there, never per-surface.
- If Phase 6 snapshot logic misbehaves: buckets fall back to all-time (wrap delta math in try/catch → all-time).

# PARKING LOT (do not build — future sessions)
- **Spark-a-word:** Spark accepts Lexi words; prompt must inject the word's saved `sentences` + source episode so output stays context-rooted (needs cs-generate.js prompt variant — API work).
- **Vocab↔concept linking:** words mapped to closest concepts (embedding-based; ties into roadmap RAG item).
- **Keyword highlighting in card `plain` text + tap-to-add-Lexi:** client writes lll_lexicon_v1 only; JSON enrichment = separate pipeline/editorial tool.
- **Notes "journal view"** reading mode, if users miss the old tab.
- **All Words / Word Map embedded inside Home** — only if launch-out pattern proves annoying in real use.
