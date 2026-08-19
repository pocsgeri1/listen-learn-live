# Changelog — Epistemic

**Purpose:** Human-readable log of feature changes by version. Build journal is for lessons/bugs; this file is for "what's different now."

**How to use:** Add new versions at the TOP (newest first). Bump the version number with each notable change. Ask Claude at the end of any build session: *"update the changelog with what we just built."*

---

## v3.58 — 2026-08-11 · Docs: V3 architecture + AI voice system

**Documentation only. Zero code changes.** This version is the complete V3 build plan — the strategy session output that v3.59 onward executes against.

### docs/v3-architecture.md (NEW, 1,276 lines)
- **§0 Preconditions + corrections.** Three factual errors in the V3 brief corrected against the live repo: `lll_saved_v1` does not exist (it is `lll_mastered_ts_v1`), `lll_user_id` is not implemented (roadmap-only), and `folder.vocabWords[]` holds objects since v3.56 (not strings). Two live findings: the `claude-sonnet-4-6` vs `claude-sonnet-4-5` model-string conflict (8 call sites on 4-5), and z-index — **1200 is occupied** by `.lexi-panel` / `.egg-overlay` / `.stories-overlay`, so the V3 rail takes **1150**, the free band beneath the whole legacy overlay stack.
- **§2 The core decision — two shells, one file.** `body[data-shell="site"]` (the existing marketing scroll, untouched) vs `body[data-shell="app"]` (fixed left rail + routed panes). Resolves the collision the brief never named: a persistent sidebar cannot coexist with the hero/how-it-works/founder/newsletter page that is 100% of organic acquisition. Cost is one ~150-line router.
- **§3 Navigation model.** Left rail (`--rail-w: 236px`, z-index 1200, no width animation), five destinations (Today / Library / Boards / Write / Chat) plus pinned boards. Full authoritative route table: `#/today`, `#/library[/words[/map]|/episodes]`, `#/c/{id}`, `#/w/{word}`, `#/boards`, `#/board/{id}`, `#/write[/compose|/practice]`, `#/chat`. `#home` and `#canvas-{id}` permanently aliased; `?import=` untouched. Mobile: three nav modes via `body[data-nav]` (tabs / drawer / immersive), reusing the existing `.mobile-tab-bar` DOM.
- **§4 Discover — decided.** It is all three of the brief's options, which is exactly why it gets no nav slot: it becomes the lower two-thirds of Today, as seven algorithmic rails (Because you saved X, Your blind spot, Finish the episode, Editor's picks, New this week, Words from concepts you know, Revisit) with a cold-start fallback ladder so rails never render empty.
- **§5 Vocab — decided.** Options A + C + a new D. Library gains a `Concepts · Words · Episodes` lens switch; Boards keep the vocab canvas element; Practice moves to Write. Option B (vocab on the concept card) rejected on data-integrity grounds — vocab is episode-scoped in `episode_meta.json`, so concept-scoped vocab would be a lie rendered in the UI.
- **§6 Surface-by-surface IA.** Today (ritual block of max 3 elements), Library (three lenses, filters as URL query params, 40 tiles per rAF frame), Concept detail (480px right pane not a modal, action bar 7 → 4 + overflow, inline always-visible note, related chips always visible, breadcrumb depth 3 → 5), Boards (mini canvas previews, viewport persistence, typed connections).
- **§7 Write — the new pillar.** Three modes: **Capture** (zero-friction, no AI, `⌘Enter`, `@` picker, every entry point pre-links), **Compose** (six formats — four private/thinking, two public — with mandatory visible provenance, attribution default-on, five anti-slop rules including a banned-strings list), **Practice** (absorbs Lexi practice, adds the new `feynman-grade` "Explain the concept" exercise). Contains the containment rule: *Compose is a rewriting tool, not a writing tool* — public formats require a user-written seed of ~40 words; private formats do not. Plus the three-layer AI voice architecture and the `api/compose.js` contract.
- **§8 Chat.** Ships last, capped hard: required context selector, max 8 concepts (~1,000 tokens), 20 turns, 20 threads. Removable context chips are the feature. Real RAG explicitly deferred to ≥1,000 concepts with a one-function swap path.
- **§9 Data model.** The atomic-unit rule (everything references `concept.id`), what changes in every existing key, the evolved board schema (six new optional fields + `schema: 3` migration marker), seven new `lll_*` keys (`lll_user_id`, `lll_captures_v1`, `lll_drafts_v1`, `lll_voice_v1`, `lll_tags_v1`, `lll_chat_v1`, `lll_route_v1`, `lll_onboard_v1`, `lll_storage_v1`), the **four-axis taxonomy** (category / source / mastery / tag, each in its own lane, intersecting only in Library filters), a storage budget table, and a numbered idempotent migration ledger.
- **§10 Surface state machines.** Router, Library, Concept detail, Board canvas, Write (Capture / Compose / Practice), Chat — written in the same notation as the existing CS modal state machine in `architecture.md`.
- **§11 Retire / merge / restructure ledger.** 17 rows: every existing surface mapped to its fate, destination and shipping version. Includes the literal answer to "what does a Lexi user see the day the panel disappears" (`lll_lexicon_v1` is never modified; one dismissible row; the pull tab is deleted, not hidden).
- **§12 Eden — adopt / skip / invert.** 13 patterns with reasoning. Notably: **skip Spaces→Boards** (premature hierarchy over 3 boards), **skip publishing/clipper/extension permanently** (they kill the editorial moat), **adopt related-content suggestion aggressively** (our pre-computed `related_ids` is the one asset Eden cannot match), **invert library-grounded AI** (they ground to help you publish, we ground to help you understand).
- **§13 Phased build order.** 11 phases, v3.58 → v3.68, each independently shippable. During phases 2–6 the rail launches the existing drawer/overlays unchanged before replacing them — that is what makes a single-file migration safe. Smallest meaningful V3 = v3.59 + v3.60.
- **§14 What is not being thought about.** Ten items, ordered by expected damage: browser-clear data loss (export/import must ship in phase 2, not phase 11), missing onboarding, concept quality debt becoming a public-embarrassment risk once Compose quotes cards into posts (proposed `qa` flag as a shipping gate), zero-auth API cost and abuse, the 5 MB `QuotaExceededError` silent-failure mode (mandatory `_lsSet()` helper), 1.58 MB payload, SEO cannibalisation, cheap perceived-quality wins (⌘K, keyboard nav, PWA), where the free/Pro line should fall, and shared boards as the only zero-cost distribution loop.
- **§15 Design language.** The one conceptual shift: overlay → place. New component patterns (rail item, pane, context chip, provenance line, empty state), animation grammar (pane enter .18s / exit .12s — exit always faster), density tokens. No new colours, fonts, radii or spacing values.
- **§16 Risks.** 12 rows with likelihood, impact and mitigation. Highest: the phase-2 shell split breaking the marketing page.
- **§17 Open decisions — [ACTION].** Three calls needed: (1) split `app.css` / `app.js` out of `index.html` for new V3 code only (still vanilla, no bundler — one-way door, needs a yes before phase 2); (2) resolve the model-string conflict; (3) confirm Chat ships in V3.

### docs/ai-voice.md (NEW, 293 lines)
- The single source of truth for every AI-generated word in the product. Mirrored as the `HOUSE_VOICE` constant in `api/compose.js` — sync note at the top of both.
- **Layer 1 — House Voice:** the full static prompt (~400 tokens), derived from `quality-rules.md` and the four style guides so runtime output and the curated library sound like the same product. Includes the banned-strings list, the em-dash ban (inherited from `hook-style-guide.md` v2.2), and the straight-quotes-only rule (production bug vector per `engineering-standards.md`).
- **Layer 2 — User Voice Profile:** five dials with literal string values, the **first-language** field that makes the non-native positioning functional rather than decorative, plus the `voice-extract` and `voice-update` prompts. Learn-from-edits is opt-in and never silent.
- **Layer 3 — Grounding:** the concept/capture/vocab serialization format used identically by Compose, Chat and Practice grading. RAG-lite at ~1,200 tokens in / 400 out, with no embeddings or vector store, which only works because the content is already chunked into concept objects.
- Per-mode task instructions for all six Compose formats plus `feynman-grade`, `caption` and `chat`. A five-check quality bar (banned strings, em-dash/curly-quote strip, length, provenance, sampled logging). A "what this voice is not" section: not a personality, not a coach, not a summarizer, not a growth tool.

### docs/architecture.md
- **Drift fixed:** `lll_folders_v1` was still documented with `vocabWords: string[]`. Corrected to objects `{ word, definition, category, colId }` (v3.56), with the mandatory `typeof w === 'object'` reader guard and a note on why v3.57a needed three fixes. Added `emoji` and `canvasItems` to the documented shape and a pointer to the V3 extensions.
- **Added:** an explicit note that `lll_saved_v1` does not exist and must never be introduced — saved concepts are `lll_mastered_ts_v1`.

### docs/roadmap.md
- Next Up restructured around the V3 phase plan.

---

## v3.57a — 2026-08-11 · Bug fixes — vocab folder integration

### index.html
- **Bug: Folder disappears after adding vocab word** — `_folderBuildItemBody`, `_folderRemoveVocab`, and `_cvAddVocabMenu` all treated `vocabWords[]` entries as plain strings, but `_vocabFolderToggle` stores them as objects `{ word, definition, category, colId }`. Fixed all three with `(w && typeof w === 'object') ? w.word : w` guards. Also hardened the single-quote escaping in the remove button.
- **Bug: Read panel auto-closes when using folder picker** — `_gvOutsideClickHandler` uses a capture `mousedown` on `document`. The folder picker popover and backdrop are appended to `body` (not inside `#gvPanel`), so any click inside the picker triggered an "outside click" and closed the Read panel. Fixed by adding two early-return guards: skip if `e.target.id === 'fpBackdrop'` or if target is inside `#folderPickerPopover`.
- **Bug: Home Vocab tab has no folder button** — tapping a word in the Vocab tab bottom sheet only offered "Practice →". Added a "+ Folder" button to `vws-actions` in `_vwsOpen`. New helper `_vwsAddToFolder(btn, word)` looks up the word in `_vwsSorted` and calls `_vocabFolderPickerOpen` with full word metadata.

## v3.57 — 2026-08-11 · Phase 7 — Board sharing + Phase 4 missed items

### index.html
- **Board sharing (`_cvShare`, `_cvShareToast`):** New ⤴ Share button in canvas header. Encodes entire folder as base64 JSON → `?import=` URL param. Copies link to clipboard; falls back to `prompt()` on iOS. Toast notification on success.
- **Import board (`_showImportBanner`, `_importBoard`, `_dismissImportBanner`):** On page load, detects `?import=` param, decodes and parses the folder, shows a fixed top banner with folder emoji, name, concept count, vocab count, and "Import" button. Imports into local folders storage with a fresh timestamp ID. Cleans the URL after parsing.
- **Canvas deep link (`#canvas-{folderId}`):** Opening a canvas now sets `window.location.hash = '#canvas-{id}'`. Closing clears the hash. On page load, hash is detected and the corresponding canvas opens automatically.
- **Mobile pinch-to-zoom:** Two-pointer `touchmove` on `#canvasContainer` computes pinch distance ratio and applies zoom toward the midpoint between fingers — same range and pan-update logic as wheel zoom. Uses `{ passive: false }` to allow `preventDefault()` on two-finger scroll.
- **Connections toggle (`_cvToggleArrows`):** ⌁ Connections button in canvas header. Toggles `canvasArrowLayer` opacity 0 ↔ 1 and dims the button via `.cv-btn-off` when hidden.
- **PNG export (`_cvExportPNG`):** ⬇ Export button in canvas header. Lazy-loads html2canvas 1.4.1 from cdnjs on first click. Captures `#canvasContainer` at 1× scale with the current background color. Downloads as `{folder-name}.png`.
- **4 new CSS classes:** `.cv-header-btn`, `.cv-toast`, `.import-banner` (+ inner/text/btn/dismiss), `.cv-btn-off`

## v3.56 — 2026-08-11 · Phase 3 missed — + Folder on all vocab surfaces

### index.html
- **Vocab folder picker (`_vocabFolderPickerOpen`, `_vocabFolderPickerBuildHtml`, `_vocabFolderToggle`):** New parallel to concept folder picker but for vocab words. Stores words as objects `{ word, definition, category, colId }` in `folder.vocabWords[]`. Same popover UI as concept picker. Checks for existing entry by `w.word` matching.
- **GV word rows (Word Map list):** ＋ Folder button added to each word row's actions area alongside "Add to Lexi" and "↗ episode". Calls `_vocabFolderPickerOpen`.
- **Word Map lane chip popover:** Lane def popover now wraps "Add to Lexi" and new folder button inside `.wc-lane-pop-actions` flex row. Close button curly-quote replaced with HTML entity.
- **Word Cloud tooltip:** Folder button added to the `srcRow` flex strip alongside "Add to Lexi" and "↗ episode". Uses same `.wc-tt-folder` style.
- **Lexi panel word rows:** Folder icon button (`.lexi-folder-btn`) added before the heart/remove buttons. Hidden until row hover; reveals at 42% opacity, accent on hover. Calls `_vocabFolderPickerOpen`.
- **5 new CSS classes:** `.lexi-folder-btn`, `.gv-folder-btn`, `.wc-tt-folder`, `.wc-lane-pop-actions`, `.wc-lane-pop-folder`

## v3.54 — 2026-08-11 · Phase 5 — Canvas element types: Note, Label, Vocab, YT Clip, Link

### index.html
- **Bottom toolbar:** Replaced header "＋ Add" / "Auto-arrange" buttons with a centered floating pill toolbar at the bottom of the canvas. 7 buttons: 📝 Note, 🏷 Label, 💬 Vocab, ▶ Clip, 🔗 Link, ─, ＋ Concept, ⊞ Arrange. Icon + label on desktop, icon-only on mobile. Smooth hover tint on each button.
- **Mini picker popover (`#cvMiniPicker`):** Shared `position:fixed` popover used by Vocab, Clip, and Link toolbar buttons. Appears above anchor button, auto-positioned to avoid viewport edges. Backdrop closes it on click.
- **📝 Free Note:** 190px amber-tinted dashed-border card. Textarea (DM Sans, auto-save on blur). Drag via header handle only — textarea stays interactive. Warm amber palette: `color-mix(in srgb, #e8d5a3 7%, var(--surface))`. Dark + light mode.
- **🏷 Section Label:** Invisible text label (DM Mono, uppercase, letter-spacing 0.2em). Editable via `contenteditable` on click. Turns accent color on hover with left accent bar. Minimal — near-invisible until interacted with. Draggable from anywhere except the text itself.
- **💬 Vocab Pill:** Rounded pill from folder's `vocabWords[]`. Hover reveals a definition tooltip card (sourced from `lll_lexicon_v1`). Accent-colored border, spring hover animation. Mini picker shows all folder vocab words, greyed out if already on canvas.
- **▶ YouTube Clip:** 244px card with thumbnail (`img.youtube.com/vi/{ytId}/mqdefault.jpg`), red play button overlay, timestamp label (DM Mono red), episode title + concept term. Click thumbnail → collapses thumb, shows live iframe embed with autoplay. Only available for concepts already on canvas that have timestamps. Draggable via card body.
- **🔗 External Link:** 204px dashed card with domain (DM Mono) + title + "↗ Open" button. URL input form in mini picker; auto-extracts domain as fallback title. Hover reveals action buttons.
- **Architecture:** `_CV.extraItems[]` added alongside existing `_CV.layout{}` (backward compatible — no migration). `_cvSaveItems()` persists to `f.canvasItems`. `_cvBuildStage()` now renders both concept cards and extra items. `dragItem` handler added to `_cvBindEvents` pointermove/pointerup. `_cvMakeDraggable(el, item, handle?)` is a shared drag utility. `_cvBuildExtraItemEl(item)` dispatches to type builders. `_cvUpdateEmpty()` checks both arrays.
- **22 new functions:** `_cvItemId`, `_cvCenterPos`, `_cvMakeDraggable`, `_cvBuildExtraItemEl`, `_cvRemoveItem`, `_cvAddNote`, `_cvBuildNoteEl`, `_cvAddLabel`, `_cvBuildLabelEl`, `_cvAddVocabMenu`, `_cvPlaceVocab`, `_cvBuildVocabEl`, `_cvAddYTMenu`, `_cvFmtTs`, `_cvPlaceYT`, `_cvBuildYTEl`, `_cvYTExpand`, `_cvAddLinkMenu`, `_cvSubmitLink`, `_cvBuildLinkEl`, `_cvShowMiniPicker`, `_cvCloseMiniPicker`.

## v3.53 — 2026-08-11 · Folder glyph on preview + mobile preview; canvas dot grid fix

### index.html
- **Folder button in `_spPreviewToolbar`:** Added 6th action to the shared preview toolbar used by both `_spPreviewCard` (search/hover floating preview, desktop) and `_spOpenMobilePreview` (full-screen mobile preview modal). Folder glyph now present on every concept surface across the entire product.
- **Canvas dot grid fixed:** Removed `::before` pseudo-element approach (which was hidden behind the transparent stage). Applied `background-image: radial-gradient` directly to `#canvasContainer` — dots now render correctly through the transparent stage. Light mode variant uses black dots at 10% opacity.

## v3.52 — 2026-08-11 · Folder edit + folder glyph on all cards + tile dot clarification

### index.html
- **Folder inline edit:** Pencil ✎ button appears on folder row hover. Opens an inline edit form (slides in, replaces the header row) with: name input, emoji picker, color swatch picker. Enter saves, Escape cancels. `_folderEdit`, `_folderSaveEdit`, `_folderCancelEdit`, `_folderEditPickEmoji`, `_folderEditPickColor` functions. Edit state is isolated per folder via `_folderEditState{}`.
- **Folder glyph on all cards:** Added `CC_G.folder` (folder + plus SVG icon) to the icon registry. Added `btn-folder` button (6th action) to all 5 card action bars: home feed cards, episode drawer cards, theme cards, all-concepts grid cards, and folder canvas cards. `.btn-icon.btn-folder` CSS: muted default, accent on hover.
- **Tile dot explained:** The 6px dot on the bottom-right of library grid tiles (`.lib-tile-note-badge`) is the existing note indicator — it marks concepts that have a saved note. Not new, not a bug.
- **Right-click / long-press clarification:** Desktop = right-click any tile to open folder picker. Mobile = 500ms long-press. The tile `::after` hint text updated to `＋` (was `⊕`).

## v3.51 — 2026-08-11 · Phase 4 — Infinite spatial canvas per folder

### index.html
- **Canvas overlay:** Full-screen `#canvasOverlay` (z-index 8000) with fade-in animation. Opened via "⬡ Open Canvas" button in every folder's expanded detail footer. Closed with ✕ or Escape key.
- **Header bar:** Folder emoji + name (left), zoom controls — [−] [100%] [+] [⌂ reset] (center), [Auto-arrange] [＋ Add] [✕] (right). Mobile: horizontal reflow, zoom label hidden.
- **Infinite pan:** Pointer drag on stage background pans the canvas. `grabbing` cursor during pan. Pointer events via `pointerdown/pointermove/pointerup` on `#canvasContainer`.
- **Pinch/scroll zoom:** Mouse wheel zooms toward cursor position. Zoom clamped 0.25×–2.5×. Zoom buttons step ±15% toward viewport center.
- **Draggable concept cards:** `.cv-card` (175px wide, category left-border, Playfair term, DM Mono category label). Drag via pointer capture — no jitter, no offset errors. Position stored in `_CV.layout` and persisted to `folder.canvasLayout` on drag end.
- **Hover expand:** Card hover reveals hook text (max-height animation) and 3 action buttons: ✦ Spark, ◱ View (opens library detail), ✕ Remove from canvas.
- **SVG arrow layer:** `#canvasArrowLayer` is a `position:absolute` SVG spanning the stage. Dashed quadratic bezier arrows drawn between related concept pairs where both are on the canvas. Redrawn via `requestAnimationFrame` throttle on every drag frame. Offset by 2000px to allow negative-coordinate arrows without clipping.
- **Add concepts panel:** Bottom sheet (`#canvasAddPanel`) with search input + scrollable results list. Each row shows category dot, term, category label, and ✓ if already on canvas. Click toggles on/off. New concepts placed at cascading grid positions.
- **Auto-arrange:** Calculates √N columns, arranges all canvas cards in a clean grid (210px × 140px spacing) from (60, 60). Plays SFX.
- **Dotted grid background:** CSS `radial-gradient` dot pattern on `#canvasContainer::before` — editorial, minimal, dark + light mode.
- **Persistence:** Canvas positions saved to `folder.canvasLayout` (already in schema from v3.49) on every drag end and add/remove. Restored on next open.
- **Empty state:** Floating 🗺 icon + headline + CTA button shown when canvas has no cards.
- **CSS:** ~220 lines — overlay, header, zoom controls, ghost buttons, container, stage, SVG arrows, `.cv-card` with hover expand, add panel + results, empty state, dot grid. Full dark + light mode. `prefers-reduced-motion` override. Mobile breakpoints.

## v3.50 — 2026-08-11 · Add-to-folder surfaces: picker popover, detail button, chip bubbles, tile context

### index.html
- **Folder picker popover:** `_folderPickerOpen(anchorEl, conceptId)` — creates a `position:fixed` popover listing all folders with color dot, emoji, name, and ✓ checkmark. Click any row to toggle the concept in/out of that folder. Closes on backdrop click or ✕ button. On mobile (≤700px) renders as a bottom sheet with darkened backdrop and `env(safe-area-inset-bottom)` padding.
- **＋ Folder button:** Added to `lib-detail-actions` in every expanded concept card (`_libBuildDetailBody`). Accent-colored with subtle border, hover background via `color-mix()`.
- **Related chip ＋ bubble:** Each related chip is now wrapped in `.lib-chip-wrap`. A `.lib-chip-add` ＋ bubble (accent circle) appears on hover above the chip — click to open picker for that related concept. Reveals with scale spring animation (`cubic-bezier(0.34,1.56,0.64,1)`).
- **Tile right-click (desktop):** `oncontextmenu` on every `.lib-tile` opens the folder picker anchored to the tile. Default context menu suppressed.
- **Tile long-press (mobile):** Touch delegation on `#libConceptGrid` — 500ms hold triggers picker. `touchmove` and `touchend` cancel the timer. Visual feedback via `.lib-tile-lp` (slight scale-down + accent border).
- **Picker state functions:** `_folderPickerBuildHtml`, `_folderPickerRefill`, `_folderPickerClose`, `_folderPickerToggle`, `_folderPickerGoCreate`, `_folderChipQuickAdd`. Toggle updates `lll_folders_v1`, refreshes folder tab count badge, refreshes open folder item in-place. Plays `_playSwapSFX` on toggle.
- **CSS:** `#folderPickerPopover` (fixed, 230px, spring animation), `.fp-mobile` (bottom sheet, border-radius 14px top), `@keyframes fpIn` + `fpMobileIn`, `#fpBackdrop`, `.fp-header`, `.fp-title`, `.fp-close`, `.fp-list`, `.fp-row`, `.fp-row-color/emoji/name/check`, `.fp-row.fp-checked`, `.fp-footer`, `.fp-create-btn`, `.fp-empty`, `.lib-detail-btn-folder`, `.lib-chip-wrap`, `.lib-chip-add`, `.lib-tile-lp`, `.lib-tile::after` hover hint. Light-mode override for popover shadow.

---

## v3.49 — 2026-08-11 · Folders — data model, panel, CRUD, inline concept search

### index.html
- **Folders tab:** New "Folders" tab added to the Home drawer between Concepts and Episodes. Tab shows folder count badge. Wired into `_HOME_TABS`, `_libRender`, and `_libUpdateAllTabCounts`.
- **`lll_folders_v1` data model:** New localStorage key. Schema: `{ id, name, icon, color, conceptIds[], vocabWords[], noteIds[], canvasLayout, createdAt, updatedAt, pinned }`. Future-proofed for canvas (Phase 4) and vocab (Phase 5).
- **CRUD helpers:** `_foldersGet`, `_foldersSet`, `_folderCreate`, `_folderAddConcept`, `_folderRemoveConcept`, `_folderAddVocab`, `_folderRemoveVocab`, `_folderDelete`.
- **Folder list:** `_libRenderFolders` renders folder rows with left-color-accent border, emoji, name, concept/vocab counts, 3 preview chips, expand chevron.
- **Create form:** Slide-down `folder-create-wrap` with name input, 16-emoji icon picker, 8 color swatches (all matching category palette). Enter key submits. Auto-expands new folder on create.
- **Folder accordion:** Click any folder row → expands inline to show concept rows (with category dot + remove button), vocab chips, inline concept search, footer actions (Add concepts / Delete folder).
- **Inline concept search:** `_folderOpenSearch` / `_folderSearchConcepts` — searches saved concepts by term/hook, shows category dot + name + category label. Click to add. Fuse.js fallback when available.
- **`_folderRefreshItem`:** Rebuilds a single folder row in-place after add/remove — no full re-render.
- **Empty state:** Animated floating 🗂️ icon with headline, sub-copy, and CTA to open create form.
- **CSS:** ~280 lines of new folder panel styles — header, create form, emoji/color pickers, folder rows, expanded detail, concept rows, vocab chips, search, all with `[data-theme="light"]` overrides and `@media (max-width:520px)` mobile tweaks. No hardcoded hex values; uses `var(--accent)`, `var(--border)`, `color-mix()`.

## v3.48 — 2026-08-11 · Related chip in-place swap + breadcrumb back-nav

### index.html
- **Related chip click fixed:** Clicking a related concept chip no longer closes the library and jumps to the main grid. Content swaps in-place inside the expanded card with a 175ms fade + subtle translateY animation. Library stays open, scroll position unchanged.
- **Breadcrumb trail:** After a related chip swap, a "Exploring from → ← [Original Term]" breadcrumb bar appears at the top of the detail row. Clicking any breadcrumb navigates back to that concept (stack-aware, max 3 deep). Breadcrumb fades in with a slide-down animation; hidden on initial open.
- **Shared detail builder:** Extracted `_libBuildDetailBody(conceptId, bcStack)` and `_libWireDetailNote(row, conceptId)` from `_libToggleSaved` — both are now reused by the swap path. `_libToggleSaved` is ~60% shorter. No behaviour change on initial card open.
- **New functions:** `_libBuildDetailBody`, `_libWireDetailNote`, `_libSwapRelatedConcept`, `_libRenderBreadcrumb`, `_libBcNavTo`
- **CSS:** `.lib-detail-breadcrumb`, `.lib-detail-bc-btn`, `.lib-detail-bc-sep`, `.lib-detail-bc-label`, `.lib-detail-body`, `.lib-detail-body.lib-swapping`, `@keyframes bcFadeIn` — all with dark + light mode variants
- **Related chip label updated:** "Related" → "Related — explore" to signal the new interactive behaviour
- **SFX:** `_playSwapSFX()` fires on each swap (same sound as scenario/tab switches)

## v3.47 — 2026-08-11 · Expanded card redesign + YT embed centering

### index.html
- **Expanded concept card redesign:** Each content section (Plain English, Analogy, Prompt, Note) now has its own frosted card panel with subtle border and background — depth and layering visible in both light and dark mode.
- **Hook upgraded:** Playfair Display italic, warm background panel, accent left border — reads like an editorial pull quote.
- **YouTube embed centred:** Constrained to `max-width: 480px`, `margin: auto`, with a deeper box-shadow. No longer left-aligned.
- **Note editor:** Borderless textarea inside a dedicated frosted container — cleaner, feels like a real notepad.
- **Actions row:** Now separated by a top border from the content above.
- **`lib-detail-row` border-top:** Accent colour accent-line at top of expanded row for clear visual connection to the opened tile.

---

## v3.46 — 2026-08-11 · YouTube embed in Home > Concepts expanded cards, heatmap Mon–Sun, Listen scroll fix

### index.html
- **YouTube embed:** When a saved concept has a `collection_id` with a YouTube `episode_url` and a `timestamp`, expanding the card in Home > Concepts now shows an embedded YouTube player starting 8 seconds before the concept's timestamp. Uses existing `getYouTubeId()` helper. Modest size, lazy-loaded, responsive 16:9.
- **Heatmap week order:** Changed from Sun–Sat to Mon–Sun. Row labels updated to show Tue / Thu / Sun. Month labels now appear on first week a new month appears (more reliable alignment).
- **Listen nav button:** Now scrolls to `#episodesSection` with nav-height offset instead of scrolling to top.

---

## v3.45 — 2026-08-11 · Search bar fix, heatmap months, badge today count, goal 25, counts smooth

### index.html
- **Search bar bug fixed:** Placeholder typewriter animation now pauses on `visibilitychange` (tab hidden) and restarts cleanly on return. Prevents garbled characters appearing after switching tabs.
- **Home nav badge:** Now shows today's new concepts + words saved (resets at midnight). Uses `lll_mastered_ts_v1` + `lll_lexicon_v1` `savedAt` timestamps filtered to today. Badge is `position:absolute` so it no longer shifts "Home" text alignment.
- **Heatmap month labels:** Rewritten to label the first week column where each new month appears (was: only when the 1st of month fell in that week — caused many months to be unlabelled).
- **Weekly goal:** 5 → 25 concepts per week.
- **Count-up animation:** Replaced mixed elastic/bounce easings with uniform smooth ease-out cubic. All 4 buckets still staggered (60–200ms) with varied durations (1.3–1.9s).

### api/subscribe.js
- **All signups → founding member:** Everyone who signs up now goes to list 3 (Newsletter) + list 6 (Modal Signups) with `FOUNDING_MEMBER=true`. No source distinction at this stage — everyone is a founding member.

## v3.44 — 2026-08-11 · Modal copy, mood egg, count-up slowdown, pull quote fix

### index.html
- **Modal copy:** Title → "The library that talks back." Subtext → "The gap between hearing and knowing is finally closed." Bullets: personal library / weekly digest / AI tools no credit card.
- **Mood row:** Reduced to single 😎 button, no label, no other emojis. Opacity 0.18 at rest, brightens + tilts on hover — subtle easter egg feel.
- **Count-up animation:** All 4 home buckets now animate with varied durations (1400–2000ms), different easing curves per bucket (quartic, ease-in-out quad, cubic, subtle elastic), staggered delays. Was 700ms single number.
- **Bar chart:** Staggered per-bar animation — each bar rises with a randomised delay (60–400ms) and duration (0.55–0.85s) using spring easing.
- **Pull quotes:** Media query raised `900px → 1440px`. Now hidden on 13" and smaller laptops; only shown on 16" MacBook and larger displays.

## v3.43 — 2026-08-11 · Nav hover redesign, emoji fix, tour centering, bg revert

### index.html
- **Nav hover redesign:** Removed rectangular background on hover entirely. New mechanic: text brightens (`--muted → --text`) + letter-spacing expands (`0.12em → 0.15em`) + a 1px accent underline slides in left-to-right via `::before scaleX(0→1)` transition. No background ever.
- **Nav emojis unified:** All 5 island links (Listen/Read/Write/Speak/Home) now use identical hidden-by-default / reveal-on-hover pattern. Removed old duplicate v2.94 block.
- **Listen + Home emojis hidden by default** — consistent with Read/Write/Speak. Only text visible at rest.
- **Tour step 2 centered across modes:** Tooltip now uses `below-modes` position — measures Read + Speak bounding rects, places tooltip at the midpoint. Targets `.nav-write-btn` (middle button) for bottom reference.
- **Dark bg reverted:** `#111210 → #0d0d0d`. Tried and reverted same session (too warm for dark). Light bg `#f7f3ec` kept.
- **Modal width reverted:** `580px → 440px`. Copy changes kept.

## v3.42 — 2026-08-11 · Nav 5-link island (Listen+Home), modal copy, bg colors, tour rewrite

### index.html
- **Nav island expanded to 5 links:** Added `Listen` (closes panels, scrolls to top) and `Home` as centre-island link. Home visually distinct via left border separator. Old `navLibraryBtn` pill hidden (kept for badge/shortcut compat).
- **`_homeUpdateNavBadge()` updated:** Now injects badge into `.nav-home-center-btn` (centre island) in addition to legacy hidden btn + mobile tab.
- **Tour rewritten — 4 steps:** Listen → (Read/Write/Speak together) → Home → Signup. Copy speaks to new user; targets updated to `.nav-listen-btn`, `.nav-read-btn`, `.nav-home-center-btn`, `.nav-signup-btn`.
- **Modal copy updated:** Title → "The ideas worth keeping, finally kept." Subtext → "The gap between knowing and using is smaller than you think." Bullets: Save ideas that hit different / Weekly recap / Unlock all AI tools, no credit card.
- **Modal width enlarged:** `max-width: 440px → 580px` (~30% wider).
- **Background colors:** Dark bg `#0d0d0d → #111210` (warm charcoal). Light bg `#faf8f4 → #f7f3ec` (parchment). All hardcoded references updated incl. meta theme-color and `toggleTheme()`.
- **Double badge fix:** Removed `navLibraryBadge` span (was showing a second count alongside `_homeUpdateNavBadge`). `refreshNavBadge()` now delegates to `_homeUpdateNavBadge()`.
- **Mood row label:** "How are you feeling?" → "I feel epic!"

### docs/design-tokens.md
- Updated `--bg` dark/light values and light-mode accent to reflect v3.41–v3.42 changes.

## v3.41 — 2026-08-10 · Nav redesign, signup modal + email gate, light mode overhaul, mood row

### index.html
- **Nav right side redesigned:** Removed `.nav-epic-standalone` (I Feel Epic) and concept count pill from nav. Added `.nav-theme-pill` (pill-shaped toggle with icon + label replacing the circle button). Added `.nav-signup-btn`. Reduced nav-right gap to 8px.
- **Nav center links:** Switched to editorial DM Mono text links with underline + dot separator (·) between items. No background pill. Active state uses forest green accent underline.
- **Signup modal built:** Full email-capture modal (`ep-signup-overlay`) with founding member banner, Variation 2 aspirational copy, benefits list, email input, POST to `/api/subscribe` with `source:'modal'`. Dark + light mode. z-index 9000. Reduced-motion override.
- **Email gate system:** `epIsUnlocked()`, `epCheckGate(featureName, onUnlock)`, `epSignupSubmit()` added. One free use per feature tracked via `ep_used_{feature}` in localStorage. Second use triggers modal. On success: `ep_unlocked=true` stored, contextual continue button calls `onUnlock` callback.
- **Light mode overhaul — Crisp Paper palette:** Updated root `[data-theme="light"]` variables: `--bg:#faf8f4`, `--surface:#f2ede3`, `--surface2:#e8e0d0`, `--accent:#3d6b52` (forest green), `--muted2:#5c4a38`. Replaced all gold rgba variants (`rgba(184,134,11,…)`, `rgba(150,120,40,…)`, `rgba(196,169,107,…)`) with forest green equivalents across all `[data-theme="light"]` rules.
- **SVG hairline body::after:** URL-encoded color updated `%23b8860b` → `%233d6b52`.
- **`toggleTheme()` updated:** Pill icon/label toggle (☽/◑, Dark/Light). Meta theme-color corrected to `#faf8f4` (was `#f5f2ed`).
- **`refreshNavBadge()` fixed:** Updated to use `navLibraryBadge` ID (was `navSavedBadge` — was broken). Now shows total saved count (not daily count).
- **I Feel Epic → Home panel:** Mood row with 4 emoji buttons (😎😊😐😔) added below `home-momentum` inside Home dashboard. CSS: DM Mono label, 44×44px touch targets, scale hover, border-top separator, reduced-motion override.

### api/subscribe.js
- **Modal source handling:** `source:'modal'` → lists `[3, 4]` + `FOUNDING_MEMBER: true` attribute. `source:'inline'` → list `[3]` only. `updateEnabled: true` prevents duplicate-contact errors.

## v2.95 — 2026-08-10 · extract.html: sticky counter, step status bar, Send+Enrich, Deploy button, card animations

### extract.html
- **Sticky concept counter bar:** Appears above the concept list once extraction runs. Shows total count, sent count, and flag pills (fields over limit / edited cards / skipped). Collapse All / Expand All buttons. Updates live as concepts are sent or edited.
- **Visual step-based status bar:** Replaced the plain log line with a 5-step indicator: Fetch → Extract → Intel → Send → Enrich. Each step lights up as active (accent) or done (green). Progress bar underneath with smooth cubic-bezier easing.
- **Send + Enrich combined button:** "Send to Airtable + Enrich" runs `sendAllToAirtable()` then auto-calls `generateEnrichment()` sequentially. "Send only" still available as a secondary button. Enrichment button in the intel panel now reads "Regenerate enrichment" for clarity.
- **Deploy button:** After a successful send, a "⬆ Deploy to live site" button appears. Calls `POST /repos/pocsgeri1/listen-learn-live/actions/workflows/publish-approved.yml/dispatches` via GitHub API. Shows success/error status inline. Requires the GitHub PAT to have `actions: write` permission.
- **Smooth card expand/collapse animation:** Replaced `display:none/block` toggle with CSS `grid-template-rows: 0fr → 1fr` transition (0.22s ease). Added `.concept-card-body-inner` wrapper. Chevron rotates via `transform: rotate(180deg)` with matching transition.
- **`toggleCard` now calls `updateConceptCounter()`** so the counter stays in sync when individual cards are opened.
- **Deploy row auto-hides** until all concepts are successfully sent. Cleared on `clearAll()`.
- **`clearAll` resets** counter bar, deploy row, and status steps.

### index.html (listen-learn-live)
- **Fixed `.reverse()` bug in `_renderDrawerContent`:** `.reverse()` was silently reversing chronologically-sorted concepts inside episode drawers. Removed. Collection 524 now displays in ascending timestamp order as intended.

---

## v3.40 — 2026-08-09 · Heatmap fix (52-week GitHub layout), vocab tap → instant practice

### index.html
- **Heatmap bug fixed + expanded to 52 weeks:** Root cause was `ts * 1000` treating `Date.now()` millisecond timestamps as Unix seconds → dates ~52 years in the future. Fixed to `new Date(Number(ts))`. Grid expanded from 12 → 52 weeks (365 days). Added month label row and day-of-week labels (Mon/Wed/Fri) matching GitHub's exact layout. Logarithmic intensity scale so even single-concept days show color. Stagger animation by column (12ms per week).
- **Vocab card tap → instant practice:** Removed the sheet-open intermediary. Card `onclick` now calls `_vwsPracticeNow(word)` directly — closes library, double-rAF, opens `#lexiPracticeOverlay`. Bottom sheet still exists for other entry points but is no longer triggered from the grid.

## v3.39 — 2026-08-08 · Heatmap, episode thumbnails + podcast pills, vocab sheet, quick fixes

### index.html
- **Activity heatmap:** 12-week GitHub-style contribution grid added to Stats section. Each cell = one day, color intensity = concepts saved that day. Cascading stagger animation in. Full-width card (`grid-column: 1/-1`). Hover tooltip shows date + count. CSS variable intensity levels (`--hm0` → `--hm4`) themed for dark and light modes.
- **Episode thumbnails:** YouTube video ID extracted from `episode_url` → `img.youtube.com/vi/{id}/mqdefault.jpg`. Graceful fallback to a colored initial letter placeholder. `onerror` hides broken images.
- **Podcast filter pills:** When ≥3 podcasts are favorited, pills appear above the episode grid. Filters without re-fetching (client-side, `panel._epActivePodcast` state). Resets on library close.
- **Episode concept hover popover:** Hovering a concept name in the episode detail shows `#epConceptPopover` with category color, term, and hook. Clicking navigates in-library via `_libNavToCard`. Replaces useless text-only list.
- **Episode category dots:** Up to 4 colored dots below the title showing which categories dominate this episode's saved concepts.
- **Episode tile layout:** Inner flex row — thumbnail | text | unfav button. Cleaner visual hierarchy.
- **Related concept chip:** Changed from `_ccOpenRelated` (opens bottom panel) to `_libNavToCard(rid)` — navigates to the concept on the main grid, closes library cleanly.
- **Collapsed strip centered:** Stats text now `justify-content: center`. Verbose "↑ Show dashboard" label removed. Arrow `↑` stays right via `position: absolute; right: 16px`.
- **Vocab sheet — Practiced removed:** No manual practiced toggle. Practiced state auto-tags via Lexi session completion. Sheet now shows a `✓ practiced` pill (read-only) + single "Practice →" CTA only.
- **Word Map → Lanes default:** `_wcViewMode = 'lanes'` on init. Active button class synced.

## v3.38 — 2026-08-08 · Vocab 2×2 grid, word sheet, related preview, episode accent, chart fixes

### index.html
- **Vocab 2-col card grid:** Replaced full-width list with a 2-column CSS grid. Each card shows word (Playfair), 3-line definition clamp, source meta, and a green practiced dot in the top-right corner. Solves the "only left half filled" layout problem.
- **Word detail bottom sheet:** Tapping a vocab card now slides up a bottom sheet (`#vocabWordSheet`) with full definition, Lexi session history (verdict + sentence + feedback), and action buttons (Mark practiced / Practice now). Smooth `translateY` animation, backdrop tap to close, Escape key support.
- **Related concept hover preview:** Hovering `.lib-detail-chip` in the concept detail panel shows a floating `#relConPreview` card with category color, term, and hook — no click required. Positioned above the chip via `getBoundingClientRect`. 120ms debounced hide.
- **Episode tile accent color:** After `_libRenderEpisodes` renders, `_epAccentTiles()` paints each tile's left border with the color of its most-saved concept category. Podcast name promoted to top as a monospace tag.
- **Bar chart bug fixed:** Bars rendered at `height:0%` (percentage on flexbox parent with no definite height = always 0). Switched to explicit pixel heights (`BAR_MAX_PX = 52`). Stored in `data-h`, animated in via double-rAF.
- **Donut gap fixed:** `slice(0, 5)` left ~23% of circumference grey. Now draws ALL categories; legend shows top 5 + "Other N%" row. `stroke-linecap` changed from `round` to `butt`.
- **Practice word bypass:** `_libVocabPracticeWord()` / `_vwsPracticeNow()` call `_lexiStartSession()` directly — no Lexi panel open step. Instant overlay with smooth animation.

## v3.37 — 2026-08-08 · Scroll fix, tab order, light/dark depth, vocab practice

### index.html
- **Scroll-collapse animation fixed:** Replaced `max-height: 600px → 36px` CSS transition (janky ceiling) with JS-measured explicit pixel heights. `_homeCollapseDashboard()` snapshots `getBoundingClientRect().height` before collapsing, stores it in `wrap._openH`, then animates `height` to `36px`. `_homeExpandDashboard()` animates back to the stored value, then releases to `height: auto` via `transitionend`. No more empty-air-first jank.
- **Collapse is now one-way:** `_homeOnPanelScroll` only triggers collapse (scroll down > 80px). Expanding is manual (strip tap only). Removes threshold-jitter from bidirectional toggling.
- **Tab order — Concepts first:** Tabs now read Concepts → Episodes → Vocab → Practice, matching the dashboard hero (Concepts count is the primary metric).
- **Dark mode ambient depth — more vivid:** Four-layer radial gradient blobs with stronger opacity: teal (top-left), purple (top-right), gold (bottom-center), blue (mid-left).
- **Light mode — dramatic overhaul:** Background is now a warm golden-hour palette — terracotta/coral (top-left), soft blue (top-right), violet (bottom), warm gold (mid-left). Hero card gets `backdrop-filter: blur(28px)` + pure white borders. Mini-cards get a white box-shadow to pop against the colorful backdrop. `lib-drawer` light bg shifted to `#ede6d9`.
- **Vocab — Practice this word:** Replaced "Open Lexi →" with "Practice this word →" (`vocab-tile-action-practice` CSS class). Calls `_libVocabPracticeWord(word)` which closes the library, opens Lexi, then calls `_lexiStartSession(word)` — launching a focused single-word practice session directly on that word.
- **Momentum text:** No longer shows the "X to go" milestone message (milestone bar handles that). Now shows streak signal ("7-day streak. That's a habit forming.") or close-milestone alert only for last 3 steps.
- **Goal strip label:** Shortened from "Weekly goal — save 5 concepts" to "Weekly goal" — strip is too small for verbose labels.

---

## v3.36 — 2026-08-08 · Home & Vocab visual overhaul

### index.html
- **Home subtitle:** Added 3-word `.lib-subtitle` ("your knowledge in motion") beneath the "Home" header title — DM Mono uppercase, muted, minimal.
- **Ambient background depth:** `.home-dashboard::before` — three layered radial gradients (teal, purple, gold) float behind the dashboard surface at low opacity. Light-mode variant uses cooler tones. Creates real depth behind glass elements.
- **Hero glass card — real blur:** Added `backdrop-filter: blur(22px)` + stronger inset shadows to `.home-hero-card`. Now reads as genuine frosted glass against the ambient depth. Light mode updated accordingly.
- **Hero number bigger:** `font-size: clamp(4.5rem, 14vw, 6.5rem)`, `letter-spacing: -0.04em` — more visual gravity, tighter editorial feel.
- **Mini stat cards:** Replaced flat dot-separated "34 words · 3 eps · 4 notes" row with three `.home-mini-card` glass cards — each shows a large Playfair number + DM Mono label. Tappable with hover lift. Light + dark mode both handled.
- **Milestone progress bar:** `.home-milestone-wrap` appears below hero card — shows current count vs. next milestone (e.g. 81 → 100) as a two-label thin bar. Fills animate on paint via double-rAF trick.
- **Always-visible goal strip:** `.home-goal-strip` sits permanently above the Stats toggle — shows "Weekly goal · N / 5" with thin progress bar. Animated fill. Turns green when done. Stats section no longer contains a duplicate goal card.
- **Activity bar chart — pill bars + 3-letter days:** Bars are now fully rounded (`border-radius: 6px`), 72px tall (up from 56px). Days render as Sun/Mon/Tue/Wed/Thu/Fri/Sat. Peak activity bar gets `.peak` class with accent glow box-shadow.
- **Vocab nav — nav links:** "All Words ↗" and "Word Map ↗" are now styled as `.vocab-seg-nav` link buttons (no border, lower weight) separated by a `|` from the "My Words" active segment pill. Both navigate away — consistent visual treatment signals this.
- **Vocab controls — sort vs filter split:** Replaced single cluttered sort row with `.vocab-controls` two-row component. Row 1: `SORT` label + pill buttons (Newest / A–Z / New first). Row 2: `SHOW` label + solid-toggle square buttons (All / Practiced). Shape + style difference makes the distinction obvious at a glance.
- **Single CTA:** Shows either "Practice N →" (when unpracticed words exist) or "Lexi →" (when all practiced) — never both simultaneously.
- **Practiced dot:** Text badge `practiced` replaced by 6px green circle (`.vocab-practiced-dot`). Inline after word, minimal. `_libVocabMarkPracticed` updated to toggle dot instead of badge.
- **Tile expand chevron:** Each tile row now contains a `.vocab-tile-chevron` (`›`) on the right. Rotates 90° on open — clear tap affordance without adding visual noise.

---

## v3.35 — 2026-08-08 · Home panel design audit

### index.html
- **Hero glass card:** Wrapped the big concept count + label + activity line in `.home-hero-card` — a rounded glass card (`border-radius: 20px`, `rgba(255,255,255,0.04)` bg, subtle inset highlight, deep drop shadow). Light mode uses white/translucent with proper shadow. Dashboard now reads as an iPhone-style stat widget, not raw text on a dark surface.
- **Category chips → dot-pills:** Replaced the brick-style chips (left border, rectangular) with compact pill buttons (`border-radius: 999px`, `0.5px border`). Each chip now has a `.lib-chip-dot` (6px colored circle) instead of a colored left border. Counts are hidden from the pill (`.lib-cat-chip em { display: none }`) to reduce noise — color dot communicates the category.
- **Note badge → colored dot:** The `✏` pencil glyph badge on concept tiles is replaced by a 6px `border-radius: 50%` dot using `var(--cat-color)`. Subtler, on-brand, non-emoji.
- **Sort merged into search row:** The standalone "Newest / A–Z" sort row below the filter chips is removed (`display: none`). Instead, small pill toggle buttons ("New" / "A–Z") sit inline inside the search input row (`.lib-search-sort`), right-aligned. Less visual clutter, same functionality.
- **Share button moved into stats:** Removed the Share button from the Stats toggle row. It now lives inside `.home-stats-share-row` at the bottom of the stats section — only visible when stats are expanded.
- **Ghost bars in activity chart:** Empty days in the 7-day bar chart now render a visible ghost bar (`14%` height, `opacity: 0.1`, `.ghost` class using `--muted2` color). Previously empty days had no bar at all, making the chart feel broken.
- **Momentum line — single color:** Removed the accent color override on `em` inside `.home-momentum`. The whole line now renders in `var(--muted2)`, unified and calm.
- **Tile category label — colored:** `.lib-tile-cat` now uses `var(--cat-color)` for text and a translucent `color-mix` border, instead of fixed `var(--muted2)`. Each saved concept tile now shows its category in the right hue.
- **Tab counts — all tabs:** New `_libUpdateAllTabCounts()` function updates Episodes, Concepts, and Vocab tab badges simultaneously. Called from `openLibrary()`. Previously only Concepts had a count.

---

## v3.34 — 2026-08-08 · Page load smoothing

### index.html
- **Font FOUT eliminated:** Changed Google Fonts from `display=swap` to `display=block`. Browser holds text invisible until Playfair Display / DM Sans / DM Mono arrive instead of rendering a fallback font and swapping — no more text reflow/resize during load. Since the `ep-preload` guard already hides content during the data fetch, fonts are ready before any text is revealed on most connections.
- **Nav entrance animation:** Logo, nav island (Read · Write · Speak), and right side each slide in separately with `cubic-bezier(0.16, 1, 0.3, 1)` easing. Logo arrives first (0.05s), island second (0.17s), right side last (0.27s). Logo gets a brief accent glow (`text-shadow: 0 0 28px rgba(232,213,163,0.22)`) at the 55% mark that settles clean. `prefers-reduced-motion` suppresses all entrance animations.
- **Staggered content reveal:** Replaced the simultaneous single opacity fade-in with a JS-driven cascade after the `ep-preload` guard lifts. Each section is held at `opacity: 0` via inline style then revealed 90ms apart: hero (40ms) → browse toggle (130ms) → episodes (220ms) → content rows (310ms) → themes (400ms). Each element uses its own CSS transition so the timing is handled per-element cleanly.
- **Nav hover effects delayed:** Nav emoji expand and "I feel epic" reveal are disabled for the first 1.5s via `#mainNav:not(.nav-hover-ready)` selector with `transition: none !important`. After 1.5s, `setTimeout` adds `.nav-hover-ready` class to `#mainNav`, activating all hover transitions. Prevents any hover jank from interfering with the page load sequence.
- **Nav emojis:** Reverted to original `max-width: 0 → 1.4em` expand-on-hover behavior (user preference). The `.nav-hover-ready` delay means they never fire during load.
- **"I feel epic" button:** Reverted to `opacity: 0; pointer-events: none; transform: scale(0.9)` default, reveals on `#mainNav.nav-hover-ready:hover`. Invisible during load, available after 1.5s.

---

## v3.33 — 2026-08-08 · Polish pass

### index.html
- **Compact strip label:** Strip now prefixes "↑ Show dashboard" in a tiny DM Mono label so the purpose is self-evident — especially for new users who've never seen it collapsed.
- **Back btn auto-dismiss:** Auto-hides after 6s on desktop, extended to 10s on touch devices (detected via `(hover: none)` media query) — more time to tap on mobile.
- **Unfav toast:** Removing an episode from favourites now shows a 3s toast ("Removed from favourites"). Toast element (`#libToast`) is position:fixed, translates in from below, fades out. `_libShowToast(msg, durationMs)` helper added for reuse.
- **Practice tab refresh:** Removed `panel.dataset.rendered = '1'` guard from `_libRenderPractice` — panel now re-renders on every tab visit so recent sessions and live word counts stay current.

---

## v3.32 — 2026-08-08 · Stats share card

### index.html
- **Share button:** A small "Share ↗" button sits alongside the Stats toggle. Opens a modal with a beautiful dark card showing the user's stats.
- **Share card modal:** Full-screen backdrop (`rgba(0,0,0,0.72)`) with a centered `.home-share-card` dark glass panel. Contains: "epistemic.live" brand label, Playfair hero concept count, streak + words row, top-5 category chips (colored with `CAT_COLOR`), and today's date footer.
- **Copy text action:** "Copy text" button in the modal writes a shareable sentence to clipboard ("I've mastered N concepts on epistemic.live — N-day streak 💬") via `navigator.clipboard`. Falls back to showing the text in a toast.
- **`_homeShowShareCard()` / `_homeCloseShareCard()` / `_homeCopyShareText()`:** Three new functions. Modal closes on backdrop click too.

---

## v3.31 — 2026-08-08 · Concepts power-up + practice history

### index.html
- **Concepts sort row:** "Newest" / "A–Z" sort buttons appear above the concept grid. `_libConceptSort` state; `_libConceptSetSort()` updates active button and re-renders grid. Alpha sort uses `localeCompare`; newest sort by `lll_mastered_ts_v1` timestamp.
- **Related concept chips:** When a concept tile expands, `related_ids` are rendered as tappable color-tinted chips (each chip border/text uses that concept's category color at 20% opacity). Clicking a chip closes Home and fires `_ccOpenRelated()`. Replaces the old `⋯ Related` plain button.
- **Practice history in Vocab tiles:** When a word entry has `grading.gradedAt` (set by Lexi's `_lexiSavePracticeResult()`), the expanded tile shows a "Last Lexi session" section: verdict badge (great / good / needs-work color coded), the user's sentence in Playfair italic, and Lexi's feedback snippet.
- **Practice tab recent sessions:** After the 3 practice mode cards, a "Recent Lexi sessions" section lists the 5 most-recently-practiced words (by `grading.gradedAt`) with verdict badge + user sentence. No new storage needed — reads existing `lll_lexicon_v1` entries.

---

## v3.31 — 2026-08-08 · Stats section: charts + donut + weekly goal

### index.html
- **Stats toggle:** A compact "Stats ↓" button sits between the dashboard and the tab bar. Taps open/close a collapsible `.home-stats-section` with max-height transition. Charts only render when opened (no wasted compute).
- **7-day activity bar chart:** SVG-free pure CSS bars. Reads `lll_mastered_ts_v1` timestamps, buckets by calendar day, draws proportional bars with DM Mono day labels. Today's bar = full accent opacity; days with activity = 75%; empty days = 25% ghost. Heights animate in via CSS transition on render.
- **Category donut:** SVG circle-based donut using `stroke-dasharray` arcs. Top 5 categories from saved concepts, each segment colored with the app's `CAT_COLOR` map. Inner ring = subtle glass fill. Compact legend beside: dot + category name + percentage.
- **Weekly goal:** Hard-coded goal of 5 concepts/week (easy to make dynamic later). Progress bar + "N to go" / "✦ Goal reached" status. Bar fill color switches to green when complete.
- **Glass card aesthetic:** Cards use `background: rgba(255,255,255,0.035)`, `border: 0.5px solid rgba(255,255,255,0.09)`, `box-shadow: 0 2px 20px rgba(0,0,0,0.28)`, `border-radius: 14px`. Zero `backdrop-filter` — GPU cost near zero.

---

## v3.30 — 2026-08-08 · Hero dashboard + Concepts search

### index.html
- **Dashboard hero redesign:** Replaced 4-bucket grid + 3-cell stats row with a single centered layout. One large Playfair number (concept count, 5rem). DM Mono label below. One DM Mono activity line ("7 this week · 5-day streak") — only shown when there's activity. Three tappable inline secondary items (words · eps ♥ · notes) as small DM Mono pills — navigate to their respective tabs. Momentum copy line below, max-width 320px centered. All grids/boxes/borders gone from the dashboard interior.
- **Momentum rewritten:** No longer repeats the week count (already in activity line). Focuses on: milestone proximity ("Just 4 more to reach 75 concepts"), then recency ("The library is waiting"), then first-time. Cleaner, more purposeful copy.
- **Concepts search bar:** Minimal underline-only input at top of Concepts panel (`lib-search-input`). Filters live on `oninput` against term + category. `_libOnConceptSearch()` rebuilds the grid without re-rendering the full panel (preserves focus). `_libConceptSearch` state persists across filter changes, cleared on `_libClearFilters()`.

---

## v3.29 — 2026-08-08 · Dashboard beauty pass + personal stats + quick fixes

### index.html
- **Dashboard hover shine:** Removed permanent left-border color on buckets. Added `::before` pseudo-element — a 2px colored top-border that `scaleX(0→1)` from center on hover ("shines through"). Neutral at rest, alive on interaction. `@media (hover:none)` suppresses it on touch.
- **Bucket reorder:** Episodes → Concepts → Words → Notes (was Concepts/Words/Notes/Eps).
- **Range toggle removed:** WK/MO/ALL toggle hidden (`.home-range-toggle { display:none }`). Platform stats bar hidden too. Range JS code preserved but dormant.
- **Personal stats row:** New `.home-personal-stats` — 3 centered cells below bucket grid: (1) Day streak — computed from `lll_mastered_ts_v1` + `lll_lexicon_v1` savedAt timestamps, consecutive days with any activity; (2) This week — total concepts + words saved in last 7 days, with sub-label breakdown; (3) Next milestone — concepts left to the next threshold (10/25/50/75/100/150/200/300/500/750/1000).
- **JSON button removed** from lib-header.
- **Episodes: Unfav → ♥ icon only** — removed "Unfav" text label from the unfav button.
- **Episode expansion: concept names tappable** — each concept row calls `_libNavToCard(id)` on click (stopPropagation so tile doesn't toggle). Hover color → accent.
- **Concepts filter: "All" pill** — prepended as first chip in the filter scroll row. Active when no filters are set. Calls `_libClearFilters()`.
- **Vocab tile: no definition repeat** — `.vocab-tile-open .vocab-my-def { display:none }` hides the truncated one-liner when the tile is expanded (full def already shows in `.vocab-tile-def-full`).
- **Vocab "Practiced" filter** — new pill in sort row (right-aligned, toggles). `_libVocabFilter` state ('all'|'practiced'). `_libVocabSetFilter()` handles toggle + fade rebuild. Same animation pattern as sort.

---

## v3.28 — 2026-08-08 · Home v2 Phase E+F — Vocab sort/expand + Episode expand-first

### index.html
- **Vocab sort row (#11):** New `_libVocabSort` state ('newest'|'alpha'|'unpractised'). Sort row rendered above the word list — 3 compact pill buttons (Newest, A–Z, New first). Changing sort fades the list out then re-renders (`sort-fade` class + 130ms timeout). `_libVocabSetSort()` handles state + animation.
- **Vocab inline tile expand (#10):** Word tiles now expand inline on tap instead of closing Home and opening Lexi. Each tile gets a `.vocab-tile-detail` section (max-height: 0 → 300px, opacity transition). Expanded view shows: full definition, "Mark practiced" toggle button (persists to `lll_lexicon_v1`), "Open Lexi →" button. Badge in tile header updates live when mark-practiced is toggled. `_libVocabToggleTile()` manages open/close; `_libVocabMarkPracticed()` writes to localStorage.
- **Episode expand-first (#9):** Favourite episode tiles with saved items now expand on tap instead of immediately going to the episode drawer. Expanded inline section (`.ep-tile-detail`) shows: saved concept names (Playfair italic, up to 6), saved word chips (up to 8), "Open episode →" button. Episodes with no saved items still go directly to the drawer. `_libEpToggleTile()` manages open/close; only one tile open at a time. Episodes without saved items retain old click-through-to-drawer behavior.

---

## v3.27 — 2026-08-08 · Home v2 Phase D — Navigation: URL hash tabs, compact strip expand, back button

### index.html
- **URL hash tab persistence (#14):** `openLibrary` now reads `#home/concepts` / `#home/vocab` / `#home/episodes` / `#home/practice` from `location.hash` when no tab is explicitly passed. `_libSwitchTab` writes `#home/<tab>` on every tab switch. `openLibrary` writes `#home/<tab>` (was `#home`). DOMContentLoaded handler uses `.startsWith('#home')` so all formats deep-link correctly.
- **Compact strip tap-to-expand (#15):** `#homeCompactStrip` now has `cursor:pointer`, `onclick="_homeExpandDashboard()"`, and a `::after` `↑` arrow hint (accent color, right-aligned). New `_homeExpandDashboard()` removes `.collapsed` from `#homeCollapseWrap` and smooth-scrolls the active panel back to `scrollTop:0`.
- **Back to Home button (#16):** New `#backToHomeBtn` — a fixed pill button `position:fixed; bottom:24px; left:50%` that slides up when shown. Appears automatically when `_libNavToCard()` is called (navigating from Home to a concept card). Auto-hides after 6 seconds. Clicking it calls `_homeBackBtn()` → `openLibrary(lastTab)` returning to exactly where the user was. `_libNavFromHomeTab` stores the originating tab. Button is hidden and cleared whenever `openLibrary` is called normally.

---

## v3.26 — 2026-08-08 · Home v2 Phase C — Concepts filter overhaul + note badges

### index.html
- **Filter row redesign:** `.lib-cat-bar` (wrapping chips) replaced with a single `.lib-filter-row`: a horizontal scrolling chip strip on the left, and a compact action button group on the right (divided by a `border-left`). No more multi-line wrapping.
- **Category chips:** `flex-wrap: nowrap` with `overflow-x: auto` on the scroll strip. Each chip retains its `border-left: 2px solid var(--cat-color)` color indicator. Active state uses `color-mix(in srgb, var(--cat-color) 12%, transparent)` for a tinted highlight.
- **Notes filter button:** Moved out of the chip row entirely. Now a compact `✏︎` icon button in `.lib-filter-actions` (right side of filter row). Active = accent colored. Hides automatically if no notes exist.
- **A–Z toggle:** New `A–Z` action button (right side). Tap to open/close the letter rail with a smooth `max-height` transition (0 → 44px). `_libToggleAZ()` manages open state + clears letter filter when closed. Rail has `id="libLetterRail"` + `.open` class toggled.
- **`_libAzOpen` state variable:** Tracks A–Z panel open/closed; persists across `_homeApplyConceptFilters()` re-renders.
- **Note badge on tiles:** Moved from inline `✏` text in `.lib-tile-meta` to `.lib-tile-note-badge` — `position:absolute; top:7px; right:8px`. Small, premium, fades up to 0.9 opacity on tile hover. Uses text variation selector `✏︎` to prevent emoji render on mobile.

---

## v3.25b — 2026-08-08 · Dashboard refinement — accent borders, compact stats, duplicate fix
### index.html
- **Bucket accent left-borders:** Each personal bucket now has a permanent `2.5px solid var(--bucket-accent)` left border — color identity is always visible, not just on hover. Hover adds a subtle `color-mix` tinted background wash + number lifts in accent color. Number size increased to 2.5rem Playfair.
- **Platform stats → compact bar:** Removed the two giant "27 / 744" secondary blocks. Replaced with a single compact `.home-stats-bar` DM Mono line ("↗ 27 new eps · ↗ 739 new concepts"). Range delta/tracking note appended inline to the same bar. Looks proportional and secondary — doesn't compete with the 4 personal buckets.
- **Duplicate concept count fixed:** `nTotalCon` now filters `!c.duplicate_of` — matches the headline count (739, not 744).
- **Mobile 2×2 grid:** Personal buckets go 2×2 on ≤600px. Top two get a `border-bottom` to form the grid.

## v3.25 — 2026-08-08 · Home v2 Phase B — dashboard redesign + momentum + smooth collapse
### index.html
- **Dashboard extreme redesign:** Entire layout rebuilt. Panel tagline removed. New structure: eyebrow row ("Your library" + range toggle) → 4 personal buckets (full-width 4-col grid) → 2 platform stat buckets (secondary row, muted) → momentum line. Each personal bucket: 2rem Playfair number, tappable, `--bucket-accent` CSS var drives a scaleX(0→1) top-border reveal on hover + number color shift + translateY(-1px) scale(1.04). Bucket colors: Concepts=gold, Words=teal, Notes=purple, Eps ♥=red. `hover:none` + `prefers-reduced-motion` suppress all transforms.
- **Tappable buckets:** Each personal bucket routes via `_homeBucketNav(tab, extra)`. Saved→Concepts tab, Words→Vocab tab, Notes→Concepts tab with notesOnly filter activated, Eps ♥→Episodes tab.
- **Momentum line (`#homeMomentum`):** DM Sans italic, below platform stats. Reads `lll_mastered_ts_v1` timestamps to compute this-week count + days-since-last. Copy ranges from "3 concepts this week. Keep the streak alive." to "It's been a while. The library is waiting." Key numbers wrapped in `<em>` (Playfair italic, accent color). Called on every `_homeRenderDashboard()`.
- **Smooth scroll-collapse:** Replaced instant `height: 36px` snap with `max-height: 600px → 36px` transition (`0.28s cubic-bezier(0.4,0,0.2,1)`). Combined with existing opacity cross-fade, collapse now feels silky instead of jarring. `prefers-reduced-motion` skips the transition.

## v3.24 — 2026-08-08 · Home v2 Phase A — quick wins + polish
### index.html
- **Fingerprint line removed:** "Strongest / Blind spot" line was pure clutter with no actionable path. Removed from HTML, CSS, and `_homeRenderDashboard`. Space reclaimed.
- **Episode ♥ button relocated:** Moved from absolute-positioned hero overlay (was clashing with concept count pill) to inline inside the pills row — after Listen, before "Is it worth my time?". On mobile: `order: 3`, IWTMT forced to `order: 4`. Now a compact border-pill button, consistent with the row's design language.
- **Practice mode — mobile glyph fix:** Write card used `✏️` emoji on mobile due to system font fallback. Fixed by (1) adding `font-family: 'DM Mono', monospace` to `.practice-card-glyph` and (2) using `&#x270F;&#xFE0E;` (pencil + text variation selector) in JS.
- **Practice mode — desktop 3-column layout:** On ≥700px, `.practice-cards` switches to `flex-direction: row` — 3 cards side by side, equal width. Mobile remains stacked column.
- **Note placeholder reduced:** `.card-note-input::placeholder` and `.lib-detail-note-ta::placeholder` font sizes reduced to 0.62rem/0.65rem respectively. Placeholder opacity also softened (0.5/0.7). No longer oversized vs. card body text.
- **Shortcut updated to ⌘⌥H:** `aria-label` on `#navLibraryBtn` updated to `"Home ⌘⌥H"`. Drawer header shortcut hint title updated to `"⌘⌥H"`. Keyboard handler updated in v3.23; `KeyL` kept as legacy alias.

## v3.23 — 2026-08-08 · Phase 7 polish + interconnect
### index.html
- **Dashboard scroll-collapse:** `.home-collapse-wrap` wraps `#homeDashboard` + `#homeFingerprint`. Scroll >80px on any active `.lib-panel` (debounced ≥16ms, passive listener) adds `.collapsed` to wrapper — height snaps to 36px, dashboard fades out (0.25s opacity), compact one-line strip fades in (0.25s opacity + translateY). Strip shows "N concepts · N words · N eps ♥". `prefers-reduced-motion` skips transitions. Listeners bound in `openLibrary`, unbound + state reset in `closeLibrary`.
- **`#home` deep link:** `openLibrary()` sets `location.hash = '#home'` via `history.replaceState`. `closeLibrary()` clears hash (replaces with `pathname + search`). DOMContentLoaded block: if `location.hash === '#home'`, calls `openLibrary()` after 300ms.
- **Nav badge:** `_homeUpdateNavBadge()` reads saved concepts (`lll_saved_v1`) + vocab words (`lll_lexicon_v1`), renders `<span class="nav-lib-badge">N</span>` inside `.nav-library-label` (desktop) and `.mob-tab-label` (mobile). Called on every `openLibrary()`. Badge hidden when total = 0.
- **Export all button:** `↓ JSON` button (`#homeExportBtn`) in `lib-header`. `_homeExportAll()` dumps all `lll_*` + `cc_note*` localStorage keys as JSON to clipboard via `navigator.clipboard` (fallback: `execCommand`). Button flashes "✓ Copied" for 2s.
- **Dead code sweep:** `_libRenderNotes()` stubbed to no-op (function signature kept for `_libNoteDelete`/`_libNoteSave` back-compat). `.lib-panel-notes .lib-grid` CSS rule removed; note tile CSS retained for future reuse.

## v3.22 — 2026-08-08 · PRACTICE cards + live dashboard + snapshots
### index.html
- **PRACTICE mode cards:** Three large tappable cards replace interim buttons — Spark ✦ / Write ✏ / Quiz ◈. Each shows: glyph, Playfair name, DM Sans hook, live DM Mono accent data line (Spark: N saved concepts; Write: N words waiting / "All words practiced"; Quiz: "Last score: X/180" or "Never played"). Hover: border shift + translateY(-2px), 0.2s. `prefers-reduced-motion` + `hover:none` suppress transform.
- **`lll_quiz_stats_v1`:** Written at top of `renderEndScreen()` — `{ plays, score, max, lastTs }`. Score = `quizState.score` out of 180. Practice card reads this on render.
- **`lll_stats_snapshot_v1`:** Snapshot mechanism in `_homeMaybeSnapshot()` — called on every `openLibrary()`. If newest snapshot > 24h old: pushes `{ts, epCount, conceptCount, wordCount}`, caps at 8 entries. Used by range toggle delta logic.
- **Range toggle live:** `_homeSetRange(range)` handles Wk / Mo / All. Wk/Mo find nearest snapshot ≥7d/≥30d via `_homeGetSnapshot(days)`. If no snapshot old enough: shows all-time total + "tracking started" in delta row. Range switch cross-fades bucket numbers (0.15s opacity out → rebuild → in). `_homeRange` module var tracks state.
- **6 dashboard buckets:** Added New Eps + New Concepts (platform growth) to the 4 personal buckets. Desktop: 3-col × 2-row grid. Mobile: horizontal snap-scroll row (`scroll-snap-type: x proximity`, scrollbar hidden).
- **Fingerprint line:** `#homeFingerprint` strip — shows "Strongest: [cat] · Blind spot: [cat]" from category distribution of saved concepts. Only shown with ≥5 saved concepts; hidden otherwise.
- **Bucket cross-fade:** Range switch adds `.fading` (opacity 0) to all `.home-bucket-num` elements, waits 150ms, rebuilds values, removes class. `prefers-reduced-motion` skips fade.

## v3.21 — 2026-08-08 · VOCAB section + Lexi examples disabled
### index.html
- **VOCAB panel — 3-segment control:** My Words · All Words · Word Map. All Words → closes Home → `_openGlobalVocabView()`. Word Map → closes Home → `_openConstellationView('lexi')`. My Words renders tiles in-place.
- **My Words tiles:** sorted by `savedAt` desc from `lll_lexicon_v1`. Each tile: word (Playfair), definition snippet (1 line, ellipsis), practice-state badge (accent mono pill for practiced/mastered), podcast/episode source (DM Mono muted). Tile click → close Home → open Lexi. Header bar: word count + "Practice N →" CTA (only when unpractised words exist) + "Open Lexi →". Empty state: Phase 2 copy ("Words you save start collecting here.").
- **Dashboard Words bucket:** already live from v3.18 (lll_lexicon_v1.length).
- **Lexi examples button disabled — v3.21:** `.lexi-word-gen-btn:not(.lexi-word-gen-btn--practice) { display: none }` + early `return` guard in click handler. Comment: `/* v3.21 — examples disabled, logic preserved, see session-plan */`. Practice flow reads cleanly: write sentence → evaluator → coaching.

## v3.20 — 2026-08-08 · CONCEPTS composable filters: cat × letter × notes
### index.html
- **Composable filter state:** Replaced `_libActiveCat` (single) with `_libConceptFilter = { cat, letter, notesOnly }`. All three AND-combine. Legacy `_libActiveCat` getter/setter shim retained for safety.
- **A–Z letter rail:** `.lib-letter-rail` — horizontal scrolling mono row of only letters that exist in the saved set (others omitted entirely). Tap toggles; tap again clears. Mobile: `touch-action: pan-x`, scrollbar hidden.
- **`_homeApplyConceptFilters()`:** Single function that updates button active states + fade-rebuilds the grid (0.15s opacity out → rebuild → in). Called by all three filter setters. `prefers-reduced-motion` skips fade.
- **`_libRenderConceptGrid(ids, tsMap)`:** Extracted grid-only render from `_libRenderSaved`. Applies all three filters, renders tiles, or shows `.lib-filter-empty` with Clear button if result is empty.
- **`_libSetFilter(key, val)`:** Unified toggle handler for cat, letter, notesOnly. Toggle: same value clears. `_libClearFilters()` resets all three at once.
- **Empty filter state:** `.lib-filter-empty` — Playfair italic "Nothing here yet." + Clear filters button.
- **`#libConceptGrid`:** Grid div now has a stable ID so `_homeApplyConceptFilters` can target it without re-rendering the filter bars.

## v3.19 — 2026-08-08 · EPISODES section: ♥ fav, recents, latest-5 fallback
### index.html
- **♥ Fav button in episode drawer:** Added to top-left of the hero header (`#epFavBtn`). Outline heart → filled accent on fav; scale-pop animation on toggle (0.3s, reduced-motion: none). 44×44 touch target. Mobile: shifts right of count badge to avoid collision.
- **`lll_fav_episodes_v1`:** New localStorage key `{ [collectionId]: ts }`. Written/deleted by `_epToggleFav()`. Read by `_libRenderEpisodes()` and `_homeRenderDashboard()`.
- **`lll_recent_eps_v1`:** New localStorage key — array of `{ collectionId, ts }`, ring buffer max 10. Written by `_epLogRecent()` on every `openEpisodeDrawer()` call.
- **EPISODES panel — full render:** `_libRenderEpisodes()` now renders real content. If favs exist: fav tiles grid (Playfair title, DM Mono podcast/date, accent cross-stats line "N concepts · N words kept", Unfav button) with 40ms stagger entrance animation + "Recently opened" horizontal chip row. If no favs: empty prompt + latest-5 episode list (most recent by `aired_date`).
- **Dashboard Episodes ♥ bucket live:** `_homeRenderDashboard()` now counts `lll_fav_episodes_v1` keys for the Episodes bucket (was hardcoded 0).
- **`_epCurrentColId` tracking:** Module-level var set on every drawer open — used by the ♥ button inline onclick (avoids closure over stale collectionId).

## v3.18 — 2026-08-08 · Home shell: rename, dashboard skeleton, 4 tabs
### index.html
- **"My Library" renamed to "Home":** Drawer title, all JS open/close calls, and aria references updated. "My Library" remains only in code comments for historical context.
- **4-tab architecture:** Tabs are now Episodes · Concepts · Vocab · Practice (replacing old Saved · Notes). `_HOME_TABS` array governs valid tab names. Default tab is 'concepts'. Panel IDs: `libPanel-episodes`, `libPanel-concepts`, `libPanel-vocab`, `libPanel-practice`.
- **Home dashboard:** `.home-dashboard` strip added above the tab row — 4 stat buckets (Saved, Words, Notes, Episodes ♥) with Playfair Display numbers and DM Mono labels. Count-up animation (600ms ease-out cubic) on drawer open via `_homeRenderDashboard()`. `prefers-reduced-motion` skips animation. Wk/Mo range buttons stubbed (disabled, coming Phase 6).
- **Tab labels:** `.lib-tab` switched to DM Mono, uppercase, 0.62rem — consistent with stat labels.
- **Empty states:** Episodes, Vocab, Practice panels render placeholder states (`home-empty` pattern) with contextual CTAs. Concepts panel renders saved concept tiles (existing `_libRenderSaved` logic).
- **Panel rename:** `libPanel-saved` → `libPanel-concepts` throughout JS (refresh, collapse, querySelectorAll calls).

## v3.17 — 2026-08-08 · Toolbar simplification + save semantics
### index.html
- **Related button removed from all card toolbars:** Removed from all 5 card template locations (main grid, ep-drawer, theme cards, all-browse, Fl cards) and from `_spPreviewToolbar` (all 4 preview surfaces). `btn-icon-empty` CSS class and placeholder logic removed entirely — no more disabled ghost button.
- **Toolbar centered:** `.card-actions.card-actions-top` now uses `justify-content: center`. `.btn-toolbar-div` changed from `flex: 1` (stretch) to `flex: none; width: 16px` (fixed spacer) — 5 buttons now sit centered on the card back.
- **Tooltip rename — Save/Saved:** All master button tooltip updates via `toggleMaster()` now say "Save" (unsaved) / "Saved ✓" (saved). Removed "Save to Mastered" wording everywhere.
- **Note auto-save:** In `_ccToggleNote` blur handler: if note is non-empty and concept is not yet saved, the concept is automatically saved — writes `lll_mastered_ts_v1`, updates `mastered` Set, fires `saveMastered()` + `updateProgress()`, triggers spring-pop on the nearest master button, and shows a "Saved ✓" toast (new `_ccShowSavedToast()` function, reuses `.lex-toast` CSS). Note deletion does NOT un-save.
- **Related relocated to Home/Library saved tile:** "⋯ Related" button added to `.lib-detail-actions` row alongside Spark + Episode buttons. Only shown when `related_ids` is non-empty. Closes Library first, opens Related panel with 80ms delay.
- **`duplicate_of` suppression:** Verified — all discovery paths (main grid, Spark, all-browse, CotD, search) filter `duplicate_of` concepts. They cannot be saved via UI, so Library list requires no additional filter.

## v3.16 — 2026-08-07 · Mobile nav gap fix
### index.html
- **Tab bar height locked to 52px:** Added explicit `height: 52px` to `.mobile-tab-bar` on mobile. Previously `height: auto` caused the bar to render fractionally under 52px, leaving a 1–2px gap between the tab bar and the logo strip below it — content was visible peeking through on scroll.

## v3.15 — 2026-08-07 · Mobile nav restructure + phantom strip fix
### index.html
- **Mobile nav restructured:** `#mainNav` is now hidden on mobile (`display: none`). The mobile-tab-bar (Read · Write · Speak | Library · Join · ≡) has moved from the bottom of the screen to the top (`top: 0; bottom: auto`). Border and shadow flipped to suit a top bar (`border-bottom`, `box-shadow: 0 4px …`).
- **Phantom strip eliminated:** `nav.scrolled { height: 52px }` added inside the `@media (max-width: 768px)` block — prevents the desktop scroll-shrink animation (76→62px) from firing on mobile and expanding the nav, which was creating a 10px gap between the nav and `mob-logo-reveal` that content could peek through.
- **`mobile-tab-bar` inherited styles cleared:** `top: auto; height: auto` overrides added in the mobile media query to prevent the base `nav {}` rule (`top: 0; height: 52px`) from bleeding into the tab bar, which was causing it to appear at the top even when it was meant to be bottom-docked.
- **iOS compositing scoped to `#mainNav`:** Moved `transform: translateZ(0)` and `-webkit-backface-visibility: hidden` from `nav {}` (applied to all `<nav>` elements) to `#mainNav {}` specifically — prevents the CSS transform from breaking `position: fixed` on the sibling `.mobile-tab-bar` on iOS Safari.
- **Logo strip hides when panels open:** Added `body.mob-panel-open .mob-logo-reveal { opacity: 0; pointer-events: none; transform: translateY(-4px) }` with a 0.2s ease transition. `mob-panel-open` class is added to `<body>` in `openCS`, `openLexiPanel`, `openLibrary` and removed in their respective close functions — so the black Epistemic + tagline strip disappears when any drawer opens and fades back in when it closes.
- **`mob-logo-reveal` z-index lowered:** Changed from 99 to 89 so it sits below panels and drawers (which use z-index 100–900).

## v3.14 — 2026-08-05 · Mobile nav scroll fix, shortcut change, Spark/Lexi polish
### index.html
- **"↺ New" button label:** Was changed to "↺ concept" in error; corrected to "↺ New" (keep symbol + New, remove "concept").
- **Spark button jump fixed (properly):** Replaced `_collapseEl` (which set `display:none` on coaching/divider/feedbackRow, collapsing layout and making cs-actions jump up) with opacity-only fade using `.cs-hidden` class. Elements stay in document flow but become invisible — the action row no longer moves during the 1-2s roll animation.
- **Lexi word names no longer cut off:** `.lexi-word-name` changed from `white-space: nowrap; overflow: hidden; text-overflow: ellipsis` to `word-break: break-word; overflow-wrap: break-word`. Long terms like "well-intentioned harm" now wrap to two lines instead of being truncated.
- **Keyboard shortcut changed to ⌘⌥L:** `Cmd+Shift+L` was being consumed by password manager extensions (1Password, LastPass) before reaching the page. Changed to `Cmd+Alt+L` (metaKey + altKey + KeyL) — not used by Chrome, macOS, or common extensions. Panel header hint updated to `⌘⌥L`.
- **Mobile nav scroll fixed:** `#mobLogoReveal` changed from `position: sticky` to `position: fixed; top: 52px; z-index: 99`. Sticky was placing the element at 0px in document flow (under the fixed nav), causing layout interference and triggering iOS URL-bar scroll artifacts. Fixed element stays below the nav without touching document flow.
- **Nav iOS compositing:** Added `-webkit-transform: translateZ(0)` and `-webkit-backface-visibility: hidden` to `nav` — forces GPU compositing layer on iOS Safari/Chrome, preventing nav from jumping when the browser URL bar shows/hides on scroll.
- **Hero padding corrected:** Mobile hero `padding-top` updated from 56px → 92px to clear both the fixed nav (52px) and the fixed logo reveal bar (36px). Both the `max-width: 900px` and `max-width: 390px` breakpoints updated.
- **Hamburger menu `top` corrected:** Updated from 52px → 88px so the menu opens below both the nav and the logo reveal bar.

## v3.13 — 2026-08-05 · Nav polish, Spark panel fixes, Cmd+Shift+L fix
### index.html
- **Mobile tab bar ✏ glyph fix:** Added `font-family: 'DM Mono', monospace` to `.mob-tab-glyph` — prevents ✏ from rendering as emoji (system font fallback). Now matches the text glyph used in the hamburger menu.
- **Logo row always visible:** Removed scroll-reveal animation from `#mobLogoReveal`. The Epistemic + eyebrow banner is now statically visible on mobile (no JS scroll listener, no opacity/max-height transition). Sticky at `top: 52px`.
- **Hamburger closes on second tap:** Fixed `_mobileNavOutside` to also exclude `#mobTabHamburger` (bottom tab bar toggle) from triggering close — previously tapping the hamburger to close would close+reopen because the outside-click handler fired in capture phase before `toggleMobileNav`.
- **Cmd+Shift+L fixed:** Changed `e.key === 'L'` to `(e.code === 'KeyL' || e.key === 'L' || e.key === 'l')` for layout-independence. Added `capture: true` so the listener fires even if a focused input has called `stopPropagation`.
- **Spark panel — "New concept" → "↺ concept":** Removed the word "New" from the button label (and its "Rolling…" intermediate state).
- **Spark panel — button jump fixed:** When "↺ concept" is clicked, the scroll container's `minHeight` is locked to its current height before collapsing the prompt/coaching sections. Released after the roll completes (100ms after last term lands), preventing the action buttons from jumping up during the 1-2s animation.

## v3.12 — 2026-08-05 · Mobile scroll-reveal logo, hamburger animation, Library saved tile upgrades
### index.html
- **Mobile scroll-reveal logo row:** A sticky banner (`#mobLogoReveal`) sits just below the nav bar. Hidden at page top (max-height:0, opacity:0). When user scrolls >60px, it smoothly expands in (0.38s cubic-bezier) showing "Epistemic." in Playfair italic + the "Ideas worth saying out loud" eyebrow in DM Mono uppercase. Reverses on scroll back to top.
- **Mobile hamburger menu — smooth animation:** Replaced `display:none`/`display:flex` toggle with CSS `max-height` + `opacity` + `transform` transitions (0.38s ease). Menu items stagger in with `@keyframes mobNavItemIn` (each child delayed 40ms apart, 0.3s duration). Top corrected from 76px → 52px (actual mobile nav height).
- **Mobile nav — Lexi → Write rename:** Bottom tab bar glyph changed from `✦` → `✏` (pencil), label changed to "Write". Hamburger menu item updated from "✦ Lexi" to "✏ Write". Pencil glyph is visually distinct from the `✎` used on concept card Notes.
- **Mobile episode/theme section 20px up:** `.browse-toggle-wrap` `margin-top` reduced by 20px at `max-width: 600px` breakpoint — tightens the gap between search bar and the browse section.
- **Desktop Cmd+Shift+L shortcut:** Global `keydown` listener opens My Library (`openLibrary()`) on `metaKey/ctrlKey + Shift + L`. Shortcut hint `⌘⇧L` displayed in the library panel header as a small bordered monospace badge (hidden on mobile).
- **Library saved tile — Prompt section added:** Right column of the detail row now shows Analogy + Prompt (with distinct styling). Prompt has a gold left-border accent.
- **Library saved tile — Plain/Analogy restyled:** "What it means" renamed to "Plain English", uses `.lib-detail-plain` (softer opacity, DM Sans). Analogy uses `.lib-detail-analogy` (Playfair Display italic).
- **Library saved tile — smooth expand/collapse animation:** Detail row now animates via `max-height` transition (0 → 700px, 0.36s cubic-bezier) + `padding` transition. Collapse removes `lib-detail-open` class and removes the DOM element after 380ms. No more instant pop-in.

## v3.11 — 2026-08-05 · Nav redesign (mobile + desktop), Lexi left-slide, 16px zoom fix
### index.html
- **Mobile Lexi panel — left slide:** Changed from bottom-sheet (`translateY(100%)`) to left slide-in (`translateX(-100%)`), matching the desktop behavior. Width `min(340px, 88vw)`, full height, no rounded corners.
- **Mobile bottom tab bar — full redesign:** New order: Read (◫) → Lexi (✦) → Speak (◉) | hairline divider | Library (◱) → Join (✦) → More (≡ hamburger). Replaced 📚/💬 emojis with DM Mono–compatible glyphs. My Library button is lightly gold-tinted and separated by a vertical hairline divider from the 3 mode tabs.
- **Mobile hamburger menu — redesign:** Dark/light mode toggle moved here from the top nav. New items: all 3 modes + My Library + Quiz mode + theme toggle (with pill indicator) + Sign up + Easter egg. Clean horizontal dividers between groups.
- **Dark mode confirmed default:** No `data-theme` attribute = dark. Only `lll_theme === 'light'` stored in localStorage switches to light. No system-preference fallback; dark is always the cold-start default.
- **Desktop Nav — My Library button:** Distinct 4th button (`.nav-library-btn`) that sits right of the island, separated by a 10px margin + hairline border pill. Glyph ◱ scales up and shifts on hover; label letter-spacing expands. Not connected to the island — clearly a different type of action.
- **iOS 16px zoom fix:** Added `@media (max-width: 768px)` rule setting `font-size: 16px !important` on `.lib-note-ta`, `.lib-detail-note-ta`, `.sp-search-input`, and `.spark-search-input` — prevents iOS Safari from auto-zooming when focusing any of these inputs.

## v3.10 — 2026-08-05 · Notes tab redesign, Lexi panel overhaul
### index.html
- **Notes tab — full design upgrade:** Note tiles now carry a category-coloured left accent border (`--note-cat-color`). Each tile has a new `.lib-note-header` row: bigger `i` button (20×20, coloured border matching category) placed LEFT of the term; term shown in Playfair Display; category chip in coloured monospace pill; date on the right. The body text and char count remain but layout is cleaner.
- **Note sync (Saved → Notes):** Notes saved via the Saved tab inline textarea write to the same localStorage key (`cc_note_${id}`) that the Notes tab reads. No additional sync needed — switching to the Notes tab re-renders from localStorage and picks up the note automatically.
- **Lexi panel — row swap:** Actions row (All Words / Practice N Words buttons) now appears FIRST above the category filter pills. Filter pills moved below with a "Filter by category" micro-label above them to visually distinguish the two rows.
- **Lexi panel — collapsible podcast + episode headers:** Podcast name and episode title headers are now toggleable. Click to collapse/expand the words beneath. Chevron (▸) rotates 90° when open. All sections start expanded. Episode titles inside podcast groups are also individually collapsible.
- **Lexi panel — episode arrow moved:** The ↗ source episode button now appears between the practice state badge and the ♥ heart button (was far left, before the chevron).
- **Desktop preview cards — prompt removed:** Kept plain + analogy only on desktop preview cards (no "Reflect & use it" section). Mobile preview still shows the full prompt section.

## v3.09 — 2026-08-05 · Preview toolbar bug fixes, scan view filter fix
### index.html
- **Listen button fixed:** `_spPreviewToolbar` no longer calls the non-existent `_playConceptAudio`. It now computes the timestamped YouTube URL at render time via `buildTimestampedUrl` and renders a proper `<a>` tag (same pattern as main card listen buttons). If no timestamp/URL exists for a concept, the button is shown dimmed and disabled.
- **Share button fixed:** Was calling `openShareModal(id)` which doesn't exist. Fixed to `shareCard(event, id)`.
- **Scan view — Picks / Mastered filter carried through:** `_spReinjectScanTiles` now reads `spActiveSort` and applies picks/mastered filtering identically to `buildGrid`. Switching to scan view while Picks or Mastered sort is active now shows only those filtered tiles.

## v3.08 — 2026-08-05 · Unified preview toolbar everywhere, prompt layout, note action fix
### index.html
- **Shared preview toolbar:** Extracted `_spPreviewToolbar(id, dismissFn)` helper that builds the 6-button toolbar (share / listen / master | divider | related / spark / note) as reusable HTML. Used by all 4 preview surfaces: mobile scan modal, desktop library preview, panel hover preview, corner stories preview.
- **Button order unified:** All toolbars now follow the same order: share → listen → master | divider | related → spark → note. Matches the concept card toolbar order.
- **Note button fixed:** Tapping Note in any preview now calls `_openConceptNote(id)` — a dedicated helper that navigates to the concept category, scrolls the card into view, flips it, and opens the note textarea. The preview is dismissed first with appropriate delay.
- **Prompt layout:** The "Reflect & use it" section in the mobile preview now renders `💬` and the prompt text inline in a flex row (`sp-mp-prompt`), saving a full row of vertical space.
- **Desktop previews — "Talk about this" removed everywhere:** All 3 desktop preview card variants (library scan, panel hover, corner stories) now show the shared toolbar instead of the Talk button.
- **Search dropdown CTA:** "Talk about this →" changed to "✦ Spark it →" which calls `openSparkPanel` directly.
- **Old `.sp-mp-toolbar` / `.sp-preview-talk-btn` CSS removed:** Replaced by `.sp-pv-toolbar` / `.sp-pv-btn` / `.sp-pv-divider` shared classes used across all preview surfaces.

## v3.07 — 2026-08-05 · Scroll fix (root cause), preview toolbar, vocab re-render, word map pills
### index.html
- **Scroll jump — root cause fixed:** Replaced `position:fixed + scrollY restore` with `overflow:hidden` on `<html>` + `touch-action:none` on body. Scroll position is never changed, so there is nothing to restore and no flash. Added reference-counting so nested lock/unlock calls don't break each other. Affects every panel: library, scan preview, episode drawer, word map, spark panel.
- **Notes tab layout fix:** `.lib-note-meta-row` is now a 3-zone flex row (term | i-button | char-count). Delete `✕` is `position:absolute` top-right of tile — never wraps.
- **Saved tile expansion — inline note editor:** Detail row now contains a `textarea` for notes instead of read-only text. Typing and blurring saves to localStorage; tile updates ✏ indicator live.
- **"With Notes" filter chip:** Category bar in Saved tab now includes a `✏ Notes · N` chip that filters to concepts that have notes.
- **Scan preview — 6-button toolbar:** Removed "Talk about this" button. Footer now shows the same 6 `btn-icon` buttons (listen, master, note, related, spark, share) in a bordered toolbar row — identical design to the concept card toolbar. State (mastered, has-note) is reflected at render time.
- **Ep drawer vocab cat filter — re-render from top:** `buildVocabCatPills` now rebuilds the grid DOM on category switch (fade out → clear → rebuild → fade in) instead of hiding rows in-place. Filtered words always flow from the top.
- **Word Map category pills — single row:** Added `white-space:nowrap; flex-shrink:0` to `.wc-filter-pill`. Picks/Recent/category names no longer wrap to a second line; row scrolls horizontally.

## v3.06 — 2026-08-05 · Library polish: cat filter, tile expansion, notes preview, scroll fix
### index.html
- **Close scroll jump fixed:** `_spUnlockBodyScroll` now uses synchronous `scrollTop` assignment instead of `window.scrollTo`, eliminating the flash-to-top on panel close. Affects all panels sharing the lock pattern.
- **Category chips — filterable:** Chips in the Saved tab are now `<button>` elements. Clicking a chip filters the grid to that category; clicking again clears. Active chip gets a highlight. All categories shown (no `slice(6)` cap).
- **Divider between category bar and grid:** `<hr class="lib-cat-divider">` separates chips from tiles.
- **Card ID hidden:** `.lib-tile-id { display: none }` — `#110` label removed from tile UI. Note indicator ✏ kept.
- **Saved tab scrollbar hidden:** `.lib-panel { scrollbar-width: none }` applied.
- **Tile expansion redesigned:** Expanded detail is now a separate grid-sibling `.lib-detail-row` (not inside the tile), so the 2-col layout is never disrupted. Contains: hook (italic, cat-color left border), 2-col plain+analogy layout, note quote if present, Spark + Episode action buttons. Animates in with opacity + translateY.
- **Notes tab — concept preview popup:** Small `i` button on each note tile opens a fixed `lib-note-popover` showing the concept's hook, term (in category color), and plain definition — styled like the Word Map lane popover. Clicking the same concept or clicking outside closes it.

## v3.05 — 2026-08-05 · Library UX: Saved inline expand, Notes redesign, Spark button, panel taglines
### index.html
- **Sparks tab removed:** My Library is now 2 tabs only — Saved and Notes. All `_libRenderSparks()` logic removed. `openLibrary()` and `_libSwitchTab()` updated accordingly.
- **Spark/Speak button on cards:** `btn-chat` now calls `openSparkPanel(id)` on all 5 card templates instead of `toggleChatSave(id)`. Removed saved-state class toggle from button.
- **Saved tab — category bar:** Concept tiles now grouped/sorted by category. A `.lib-cat-bar` strip shows active category chips with `--cat-color` left-border accents above the grid.
- **Saved tab — inline expansion:** Clicking a tile expands it to full grid width (`grid-column: 1 / -1`) with concept detail (plain, analogy, note snippet, Spark button, Open Episode button). Only one tile open at a time. Double-rAF pattern; `max-height + opacity` transition; no `display:none` flash.
- **Notes tab — note-text-first design:** Single-column layout; note text is primary (large, DM Sans); concept term is secondary (DM Mono, tiny, uppercase). No cat-color left border. Includes: char count, inline edit (click text → textarea, blur to save), per-tile delete, sticky count header with export button.
- **Notes export:** Copies all notes to clipboard as "Term\nnote\n\n---\n\n" blocks. Button shows ✓ Copied feedback.
- **Panel taglines:** All 4 main panels now have a `.panel-tagline` subtext strip directly below their header, identically styled. Copy: Lexi — "Save words that stayed with you, then practise using them."; Spark — "Pick a concept. Get a prompt that takes it into real conversation."; Read — "Browse the full concept and vocabulary library by category."; My Library — "Your saved concepts and personal notes."

## v3.04 — 2026-08-05 · Library layout, My Library width + 2-col, mobile scan fix
### index.html
- **Library header restructure:** "My Library" button moved from sort pills row to a new `.app-title-row` next to "The Library" heading — visible on same line on both mobile and desktop. Button sized up to match header visual weight.
- **My Library drawer width:** Changed desktop constraint from fixed 680px to `width: 62%; max-width: 920px; min-width: 480px` — matches the Read (Vocab) panel proportions exactly.
- **My Library 2-column grid:** Replaced single-column `.lib-row` list with a 2-col `.lib-grid` / `.lib-tile` layout. Tiles use `--cat-color` left-border accent (matches sc-tile pattern). Collapses to 1-col below 420px. All 3 render functions updated.
- **Mobile scan fix:** Added `touch-action: pan-y` to `#netflixRows.scan-mode .nf-row` at all widths (including mobile `@media (max-width: 600px)` override). Vertical scroll no longer hijacked by tile click handlers on touch devices.

## v3.03 — 2026-08-05 · My Library drawer
### index.html
- **My Library drawer:** Full bottom drawer (88vh mobile, 680px desktop centered). Entry button added to sort pills row. 3 tabs — Saved, Sparks, Notes — with gold `::after` underline indicator (CSS-only, no layout measurement). Tab switch uses double-rAF pattern so outgoing panel fades out and incoming fades in without `display:none` flash.
- **Saved tab:** Lists all mastered concepts sorted by mastered timestamp (most recent first). Each row shows term, category pill, concept #, and relative date. Clicking navigates to and flips open the card.
- **Sparks tab:** Lists `lll_cs_saved_v1` sorted by `savedAt` desc. Shows term, category, relative date.
- **Notes tab:** Scans localStorage for `cc_note_*` keys, sorts by `cc_note_meta_${id}.ts` desc. Shows term, category, relative date, and a 90-char snippet of the note text.
- **Mastered timestamps:** `toggleMaster()` now writes `lll_mastered_ts_v1` JSON map on each master action.
- **Note timestamps:** `_ccToggleNote` blur handler now writes `cc_note_meta_${id}` `{ts}` on save; removes it on clear.
- **No GPU-heavy properties:** drawer uses `translateY` (same pattern as ep-drawer). No `backdrop-filter`, no `box-shadow` on large surfaces, no `filter`. `@media (prefers-reduced-motion)` overrides included.
### docs/architecture.md
- Documented `lll_mastered_ts_v1`, `cc_note_${id}`, `cc_note_meta_${id}` localStorage keys.

## v3.02 — 2026-08-05 · Note animation, card-person pill, Related episode button
### index.html
- **Note textarea smooth expand:** Replaced `display:none/block` toggle with `max-height` + `opacity` + `padding` transition (0.28s ease). Two-frame rAF pattern on open; CSS handles collapse. Added `@media (prefers-reduced-motion)` override.
- **Note text color:** Changed `.card-note-input` color from `var(--muted)` to `var(--text)` so typed notes are clearly readable.
- **Card-person pill on card front:** Added `.card-person` element in card-meta row (next to category pill) showing only the first person (host). Applied across all 5 card template locations (sp-hero, filter/flow, theme `_renderThemeCard`, all-browse, ep-drawer). People-pills hidden on card-back via CSS (`display:none`).
- **Related panel — Open episode button:** `_ccOpenRelated` now rebuilds an episode button each call (concept-specific). Shows episode title + → arrow; clicking closes Related panel and calls `openEpisodeDrawer(collectionId)`. Only shown when concept has a `collection_id` pointing to an episode or short collection.

## v3.01 — 2026-08-05 · Toolbar: 18px glyphs, uniform colors, group layout, Related always visible
### index.html
- **Glyph size:** CSS controls SVG size (`width/height: 18px` on `.btn-icon svg`). Removed `width`/`height` attrs from `CC_G` constants. No dead-space padding.
- **No hover backgrounds:** Removed all `background` from `.btn-icon` hover/active states. Color-only transitions.
- **Uniform default color:** All 6 buttons start at `var(--muted)`. Removed `color: var(--accent)` default from `.btn-icon.btn-listen`. Removed individual per-button default colors.
- **Active states (color-only):** Master green, Spark purple, Note gold — no background fill.
- **No border-radius:** `border-radius: 0` — no rounded rectangle shape.
- **Border-bottom removed** from toolbar. Border-top only.
- **btn-group layout:** Left group (Share/Listen/Master) left-aligned, `.btn-toolbar-div` (`flex:1` + `::after` pseudo line) centers the divider, right group (Related/Spark/Note) right-aligned. `gap: 6px` within each group.
- **Related always rendered:** Conditionally adds `.btn-icon-empty` (opacity 0.22, no pointer-events) so toolbar shape is consistent across all cards.
- **Backwards-compat scoped:** All old `.btn-chat`, `.btn-listen` etc. rules now `:not(.btn-icon)` — eliminates red bleed from `#c47a7a` border-color onto new icon buttons.
- **Applied to all 5 card templates + ep-drawer column builder.**

## v3.00 — 2026-08-05 · Card toolbar fixes: 30×30, animation groups, divider, order, no red
### index.html
- **Button size:** Reverted to 30×30 total (padding: 0, box-sizing: border-box) — explicit Gergely override of 44×44 mobile rule for toolbar density.
- **Animation groups unified:** Group A (Share, Listen, Master) → `scale(1.15)` hover + `btn-scale-pop` on trigger. Group B (Related, Chat, Note) → `scale(1.1) rotate(-8deg)` hover + `btn-tilt-pop` on trigger. Removed per-button divergent transforms.
- **Chat/Spark color:** Removed `#c47a7a` red. Saved state now `var(--purple)`. Hover neutral.
- **Button order:** Share → Listen → Master | divider | Related → Chat(Spark) → Note(Pencil).
- **Divider:** `.btn-toolbar-div` — 0.5px × 12px `var(--border-hover)` rule between groups.
- **No full borders:** Removed background highlight on all hover states except master (green tint) and group B (very subtle). border-radius reduced to 5px.
- **Toolbar padding:** tightened to 3px 6px so all 6 buttons fit without overflow.

## v2.99 — 2026-08-05 · Card toolbar redesign — SVG glyphs, reorder, animations, note position
### index.html
- **SVG glyphs:** Replaced all emoji characters (🔗★💬🎧⟡✎) with inline SVG paths across all 5 card-render locations (sp-hero, episode, theme, all-browse, filter). `CC_G` constant object holds all 6 glyphs, referenced in templates.
- **Button size:** `btn-icon` resized to 30×30px visual target; 44×44 hit area via `padding: 7px; box-sizing: content-box` (mobile touch standard).
- **Button order:** Reordered left→right: Listen → Master → Note → Related → Chat → Share (source → learn → capture → explore → apply → distribute).
- **Toolbar border:** Added `border-bottom: 0.5px solid var(--border)` to `.card-actions-top` — toolbar now has top + bottom border, feels like a contained bar.
- **Animations:** `transition` upgraded to spring cubic-bezier `(0.34,1.56,0.64,1)`. Per-button hover transforms: Related rotates 18°, Note tilts −8°, Share floats up 2px. New keyframes: `btn-note-pop` (pencil bounce on open), `btn-share-pop` (upward arc on click). Master `master-pop` preserved unchanged.
- **Note position:** Note textarea now inserts as `cardBack.firstChild` (above toolbar) via `insertBefore`, not `appendChild` (was below card body).
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables all new and existing card animations.

## v2.98 — 2026-08-04 · Lanes popover · Picks/Recent Word Map fix · Card toolbar + Related + Note · Signup mobile

### index.html

- **Lanes def popup — floating popover:** Replaced full-width inline `.wc-lane-def` with a `#wcLaneDef` element positioned at the clicked chip via `getBoundingClientRect()`. Compact (280px), no dead space, smooth `opacity + translateY + scale` animation. Click same chip or outside to dismiss. `_wcShowLaneDef()` / `_wcHideLaneDef()` / `_wcLaneDefOutside()`.
- **Picks/Recent filter in Word Map — fixed:** Stage spans in `_wcRenderStars` now carry `data-editorspick` and `data-recent` dataset attrs. `_wcFilterCat` handles `★ Picks` and `⟳ Recent` pseudo-categories by checking those attrs. `_wcRenderLanes` dims chips individually for pseudo-cat filters (`.wc-lane-chip-dimmed`). Lanes view re-renders on pseudo-cat filter change.
- **Card toolbar redesign:** `.btn-icon` reduced to `28×28px`, `border:none`, `color:var(--muted)`, accent on hover (no border). `.card-actions-top` is now `display:flex; gap:4px; padding:6px 10px; border-top:0.5px solid var(--border)`. `.card-actions-divider` hidden via `display:none`. Applied to all 5 card instances.
- **5th card button ⟡ Related:** Appears when `related_ids` non-empty. Triggers `_ccOpenRelated(id)` — builds a bottom-sheet overlay with up to 3 related concept mini-cards (term + plain). Dismissable by close button or backdrop tap.
- **6th card button ✎ Note:** Triggers `_ccToggleNote(id, btn)` — toggles a `.card-note-wrap` div appended to the card-back. Textarea auto-resizes, saves to `localStorage('cc_note_${id}')` on blur. Button shows accent color when note exists (`.has-note`).
- **Signup — mobile not full-width:** Newsletter button gains `align-self: center; width: auto` on mobile — no longer stretches to full row width. Email input gets `font-size: 16px` on mobile to prevent iOS viewport zoom on focus.

---

## v2.97 — 2026-08-04 · Mobile nav centre · ←→ shortcut · Podcast filter · Lanes view

### index.html

- **Mobile nav — 3 modes centred:** New `nav-mob-modes` div extracted from `nav-right`. Nav grid on mobile: `max-content 1fr max-content` (logo | centred modes | right actions). Mode buttons spaced `gap: 20px`. Theme toggle + signup stay right.
- **Corner mode shortcut → ←→×3:** `Cmd+Shift+C` removed (conflicted with Chrome DevTools). Replaced with IIFE sequence detector: `ArrowLeft ArrowRight × 3` within 1.5s triggers `enterCornerMode()`. Ignores when cursor is inside `INPUT`/`TEXTAREA`/`contentEditable`.
- **Read panel — podcast filter row:** New `gv-podcast-row` element above category grid. Populated from `_gvGetPodcasts(allWords)` (unique podcasts from vocab index). Active pill filters words fed to `_gvBuildCatGrid`. Reset on panel close. Hidden when only one podcast present.
- **Read panel — Picks + Recent first in grid:** `GV_CATS` reordered: `['★ Picks', '⟳ Recent', 'All', ...]`. On mobile 2-col grid, both special cards land in row 1 together.
- **Read panel — Picks + Recent filter pills styled:** `data-special="picks"` (gold border/bg) and `data-special="recent"` (green border/bg). Thin `gv-filter-divider` `<div>` inserted between special pills and regular category pills.
- **Word Map — Lanes view replaces Clusters + Nebula:** ◉ Clusters and ⬡ Nebula buttons removed. New `≡ Lanes` button + `_wcRenderLanes()`. Each category gets a horizontal swim lane: DM Mono label on left (94px), word chips scrollable right. Chips are colour-coded per category via `--chip-color` CSS variable + `color-mix()`. Clicking a chip expands an inline definition row with Add to Lexi button. Category filter dims non-matching lanes with `wc-lane-dimmed`. Nebula drift animation removed.

---

## v2.96 — 2026-08-04 · Mobile nav fix · Word Map overhaul · Picks/Recent cards

### index.html

- **Mobile nav — Read + theme toggle added:** `navMobRead` button added (📚). Theme toggle now shown on mobile (was `display:none`). All nav action buttons at `30px`. `nav-right` uses `flex-end` + `gap:2px`. Mode buttons get subtle `border-radius:8px` border on tap.
- **Word Map header restructured:** Header is now 3 stacked rows: (1) title `WORD MAP` + view mode pills (✦ Free / ◉ Clusters / ⬡ Nebula) + close/list buttons; (2) category filter pills (horizontally scrollable, `flex-wrap:nowrap; overflow-x:auto`); (3) alphabet search bar.
- **Word Map alphabet search bar:** A–Z row below category pills. Letters with matching words = bright/clickable. Letters with no words = muted/disabled. Click to filter by first letter. Resets on category change. `_wcBuildAlphaBar()` built from global vocab words. `_wcFilterAlpha()` respects both active category and active letter simultaneously.
- **Word Map — Nebula spread tightened:** `spread` reduced from `0.2 * min(W,H)` to `0.13 * min(W,H)`. Zone positions spread further apart to reduce inter-cluster bleeding.
- **Word Map — Clusters spacing:** `ROW_H` increased `24→28px`, `PAD` increased `10→14px`, `MAX_W` reduced `230→210px` to keep zones tighter and prevent row bleed across zone boundaries.
- **Collect grid row height:** `ROW_H` increased `30→42px` — eliminates overlapping words in collected grid view.
- **Picks & Recent card design:** `★ Picks` card: gold border, gold count/name, star glyph `::after`, subtle gold background tint. `⟳ Recent` card: green-accent border (`#7aaf8a`), matching count/name color, `⟳` glyph `::after`, green accent bar.

---

## v2.95 — 2026-08-04 · Read panel redesign + curation layer

### index.html

- **Read panel — 62% centered width:** `.gv-panel` changed from full-width (`left:0; right:0; width:100%`) to centered (`left:50%; width:62%; max-width:920px; min-width:480px`). Transform updated from `translateY(-100%)` to `translateX(-50%) translateY(-100%)` (open: `translateX(-50%) translateY(0)`). Border-radius `0 0 14px 14px`, box-shadow added. Doesn't cover left Lexi panel.
- **Overlay pointer-events fixed:** `gv-overlay.open` no longer sets `pointer-events: all` (was blocking Lexi interaction). Only `.gv-overlay.open .gv-panel` has `pointer-events: all`. Lexi panel stays fully interactive with Read panel open simultaneously.
- **Click-outside-to-close:** `_gvOutsideClickHandler` added (capture-phase `mousedown`). Attached in `_openGlobalVocabView`, removed in `_closeGlobalVocabView`. Ignores clicks inside `gvPanel` and `lexiPanelInner` — both panels can coexist.
- **Word list — 3-column grid:** `.gv-word-rows` changed from flex column to `display:grid; grid-template-columns:repeat(3,1fr)`. Each `.gv-word-row` is now a card (`border`, `border-radius: 8px`, hover state). `.gv-word-row.gv-hidden` changed from height-collapse to `display:none` (correct for grid). Mobile: 2-column grid.
- **Word card redesign:** Word in Playfair italic, podcast source label in DM Mono accent, definition in DM Sans muted, actions row (pill add button + ↗ source). `.gv-word-source` new element showing `COLLECTIONS_BY_ID[colId].podcast`.
- **Category card polish:** Top accent bar `::before`, `translateY(-2px)` hover lift, episode count label (`gv-cat-ep-count`), larger count number (`1.6rem`).
- **Flying animation — Lexi open target:** `_lexiFlyParticle` now targets `lexiPanelCount` (panel header word count) when `lexiPanel.classList.contains('open')`, falls back to `lexiPullTab` otherwise. Badge pulse also targets `lexiPanelCount` when open (uses `gvBump` animation).
- **Curation layer — Phase 7:**
  - `_buildGlobalVocabIndex` now computes `isEditorsPick` (word's episode has ≥1 editors_pick concept in CONCEPTS), `isRecent` (word's episode is in top-3 most recently aired), `podcast` (from `COLLECTIONS_BY_ID[colId].podcast`) per word.
  - `GV_CATS` extended with `★ Picks` and `⟳ Recent` pseudo-categories (before the real vocab categories).
  - `_GV_SPECIAL` map added for special-category handling in filter/render logic.
  - `_gvRenderCatGrid` + `_gvRenderWordList` + `_gvFilterWordRows` all updated to handle special categories.
  - Word rows store `data-editorspick` and `data-recent` attributes for client-side filtering.
  - Picks card gets gold tint via `[data-cat="picks"]` CSS.

---

## v2.94 — 2026-08-04 · Nav restructure: Read · Write · Speak

### index.html

- **Nav island replaced:** Old "Speak + Apply" buttons removed. New three-mode nav: Read (`_openGlobalVocabView`) · Write (`openLexiconPanel`) · Speak (`openSparkPanel`). Each has a hover-reveal emoji (📚 / ✍️ / 💬) using the existing nav emoji pattern.
- **Apply hidden everywhere:** `nav-corner-nav-btn`, `navMobApply`, `mobTabApply`, mobile menu Apply button all set to `display:none`. Corner mode accessible via `Cmd+Shift+C` keyboard shortcut only.
- **Lexi tab removed from Spark panel:** `panelTabLexicon` hidden, `lexicon` removed from `panelSwitchTab` sections map and forEach array.
- **Mobile tab bar:** Replaced Apply tab with Read tab. Order: Read · Write · Speak. `mobTabRead` → `_openGlobalVocabView()`. `mobTabLexi` label updated to "Write".
- **Mobile nav menu:** Restructured to Read · Write · Speak (removed Apply, removed Lexi as separate entry).
- **Lexi panel tagline:** Updated to "Practice your saved words. Write, get feedback, make them yours."
- **First-visit tour:** Updated to 3 steps — Read nav button · Lexi pull tab · Speak nav button. Removed Apply step.
- **Read panel (Global Vocab) — top-slide:** `.gv-panel` changed from right-slide (420px fixed width, `translateX`) to full-width top-slide (`translateY(-100%) → translateY(0)`). Compact at `max-height: 42vh` (category grid), expands to `72vh` when a category is selected. `.gv-panel.expanded` class toggled in `_gvAnimateCatToList` / `_gvAnimateListToCat` / `_closeGlobalVocabView`. Backdrop added to `gv-overlay.open`. Category grid: 3-col on desktop, 2-col on mobile. `gv-body` changed to `overflow-y: auto`. Header padding clears nav bar.
- **Right Speak pull tab:** New `right-tabs-group` div + `speak-pull-tab` button mirrors left Write (Lexi) tab design. Right-anchored, slides right, hides via `body.cs-panel-open` CSS rule. Desktop only.

---

## v2.94 — 2026-08-10 · Analogy ceiling revert to 20w + intel max_tokens fix (extraction-prompt-v2.4)

### extract.html — extraction prompt (epistemic-tools repo)
- **Analogy ceiling reverted: 25w → 20w.** Ceiling had silently drifted from 20 (v1.9 standard) to 25 in v2.17. Reverted across all three locations: quick-reference field rules, full ANALOGY FIELD RULES section, and regen-field rules. Word counter target updated to 15w (was 18w).
- **Good/bad analogy examples restored** (from v1.8, stripped in v1.9). Four calibration examples added back to ANALOGY FIELD RULES and regen-field rules to prevent model drift.
- **Self-check item 4 strengthened:** Added explicit note that analogy word count drift is the #1 quality failure mode — model must count manually before finalising.
- **Extraction prompt version bumped: 2.3 → 2.4.** Stamped on every extracted concept.

### extract.html — intel generation
- **max_tokens raised: 2000 → 4000.** Root cause of recurring "Unterminated string in JSON" error. Summary + sharpest_line + tension + verdicts + 35–40 vocab items regularly exceeded 2000 tokens, truncating mid-JSON. 4000 gives safe headroom.

### What was NOT changed (intentionally kept from v2.3+)
- Separated extraction/intel flow (intel auto-triggers after concepts)
- Enrichment button (generate enrichment → episode_meta.json)
- Vocab vault: 35–40 words, clean single-instruction format, categories/dropdowns UI
- Chronological sort in publish-batch.js (site-side, not extract.html)
- Field counters, sticky rules sidebar, Copy QC button, related_ids propagation

### REVERT INSTRUCTIONS
- To revert analogy ceiling back to 25w: search "20-word ceiling" / "20 words" in extract.html, change to 25. Also update `analogy: { kind: 'words', target: 15, ceiling: 20 }` → target: 18, ceiling: 25.
- To revert max_tokens: change `max_tokens: 4000` back to `2000` in generateIntel() (~line 3125).

---

## v2.93 — 2026-08-04 · Enrichment button in extract.html + vocab vault prompt revert

### extract.html (epistemic-tools repo)
- **Enrichment button added:** "Generate enrichment" button appears below the intel save row after intel is generated. Calls Claude Haiku using concept cards only (no transcript re-read). Writes `difficulty_level`, `tone`, `guest_field`, `key_quotes`, `core_claim`, `episode_type`, `actionability_score`, `evergreen`, `controversy_flag` directly to `episode_meta.json` on GitHub. Replaces the terminal command `node tools/generate-episode-enrichment.js --id [ID]`.
- **Vocab vault prompt reverted:** Removed Tier 1 / Tier 2 / Tier 3 language (introduced in v2.46). Reverted to single clean instruction: "Raw vocabulary only: Latin phrases, academic terms, expressions that compress a complex idea." Added one new filter from the Tier system: New Yorker / Atlantic test for informal expressions. Chronological sort and 35–40 word target preserved.

### Pipeline clarification
- Concept extraction + intel + vocab: one API call in extract.html (unchanged)
- Enrichment (profile + quotes fields): separate button in extract.html, runs after intel is saved
- Terminal command `generate-episode-enrichment.js` still works for backfill; browser button is the new default

---

## v2.92 — 2026-08-03 · Editorial rewrite batches 8–28 + surgical em-dash pass

### concepts.json
- **210 concepts rewritten** across batches 8–28 (IDs below), plus a surgical em-dash pass on 16 additional concepts. Total today: 226 concepts touched.
- **Fields touched:** analogy (virtually all), hook (~60%), plain (~50%), prompt (~15%), term (~5% renamed).
- **Root causes fixed:** analogy ceiling violations (20–42w → 10–20w), multi-sentence hooks, em-dashes, banned analogy openers ("It's like", "Imagine", bare -ing), jargon in plain (cognitive, leverage, fungible, heuristic, rhetoric), plains over 55w, cross-field image overlaps, parenthetical self-references, banned prompt openers.
- **Term renames (301 redirects added to vercel.json):** 384 → "Asymmetric Fit Partner", 405 → "Deliberate Overlearning", 408 → "Earned Value Effect", 474 renamed, 527 renamed, 617 → "Design vs. Human Reality", 234 casing fixed.

### ep-commit.sh
- **Auto-stages untracked files:** Added `git add rewrite-reports/` and `git add concepts/` so diff reports and new concept slug HTML pages are never missed in commits.

### docs/cowork-default-instructions.md (v1.4 → v1.5)
- **SEO integration baked into editorial workflow:** Backup before rewrites (`cp concepts.json tools/concepts-backup.json`), run `generate-static-pages.js` + `update-seo-redirects.js` after each batch, single commit covers everything.

### Batch IDs processed today:
- **Batch 8:** 519, 612, 616, 627, 630, 240, 242, 377, 110, 292
- **Batch 9:** 307, 319, 328, 330, 476, 615, 528, 633, 411, 23
- **Batch 10:** 93, 121, 188, 193, 205, 211, 216, 218, 220, 285
- **Batch 11:** 298, 382, 629, 637, 162, 239, 241, 228, 565, 26
- **Batch 12:** 122, 123, 186, 195, 230, 293, 297, 318, 324, 367
- **Batch 13:** 412, 474, 488, 524, 527, 603, 608, 138, 235, 321
- **Batch 14:** 592, 231, 48, 237, 238, 396, 516, 28, 46, 127
- **Batch 15:** 160, 164, 208, 245, 250, 253, 254, 308, 316, 320
- **Batch 16:** 376, 390, 391, 408, 478, 517, 590, 594, 598, 622
- **Batch 17:** 232, 363, 542, 543, 67, 91, 111, 136, 154, 155
- **Batch 18:** 183, 187, 204, 246, 296, 384, 398, 405, 469, 470
- **Batch 19:** 471, 479, 522, 601, 614, 617, 626, 591, 628, 666
- **Batch 20:** 400, 128, 236, 262, 534, 539, 554, 567, 109, 135
- **Batch 21:** 214, 217, 244, 282, 306, 309, 329, 340, 366, 369
- **Batch 22:** 404, 407, 475, 513, 521, 523, 583, 595, 610, 624
- **Batch 23:** 631, 94, 234, 61, 126, 130, 422, 556, 564, 569
- **Batch 24:** 619, 18, 24, 50, 90, 118, 132, 142, 145, 149
- **Batch 25:** 159, 203, 206, 215, 248, 265, 294, 295, 300, 342
- **Batch 26:** 364, 371, 383, 409, 480, 482, 484, 525, 526, 580
- **Batch 27:** 584, 587, 125, 388, 3, 131, 413, 537, 551, 562
- **Batch 28:** 568, 570, 581, 589, 12, 19, 97, 116, 120, 137
- **Em-dash pass:** 395, 529, 544, 124, 541, 560, 582, 550, 415, 416, 99, 399, 419, 561, 563, 620

---

## v2.72 — 2026-08-03 · SEO Session 2 — OG images: 710 branded PNGs per concept

### tools/generate-og-images.js (new)
- **710 branded OG images generated** — one 1200×630 PNG per non-duplicate concept, output to `/og/[id].png`.
- **Design:** dark background (`#0d0d0d`), 4px left category stripe, corner ornaments, category pill + `#ID` eyebrow (DM Mono), Playfair Display Bold term (font-size scales 72→38px by length), italic category-colored hook, "1000+ concepts" + "epistemic.live" wordmark bottom row.
- **Font loading:** woff1 files read from locally-installed `@fontsource` packages (`files/[name]-latin-[weight]-[style].woff`) — Satori supports woff1 only, not woff2.
- **Satori helper functions:** `el(style, children)` and `txt(style, text)` guarantee every div has `display: flex` as required by Satori.
- **Dead code removed:** Old draft `buildElement` variants with syntax errors stripped before final run.
- **Run:** `node tools/generate-og-images.js` — skips `duplicate_of` concepts automatically.

### tools/generate-static-pages.js
- **Per-concept OG image tag:** `og:image` now points to `/og/${concept.id}.png` instead of the shared `/og-image.png`.
- **Static pages regenerated** after OG images to pick up the per-concept URLs.

### package.json
- Dependencies `satori`, `sharp`, `@fontsource/playfair-display`, `@fontsource/dm-mono` already present from earlier session.

---

## v2.71 — 2026-08-03 · Chronological concept + vocab ordering

### docs/extraction-prompt-v2_0.txt (new)
- **Sort order changed:** Output sort changed from "composite score descending" to "timestamp ascending (nulls last), composite score as tiebreaker." Applies to both the concepts array and vocab_vault array.
- **Timestamp extraction mandatory:** Self-check item 7 added — LLM must scan backwards for the nearest transcript timestamp marker rather than defaulting to null. Only emit null if the entire transcript has zero markers.
- **vocab_vault timestamp_seconds:** Instruction strengthened from "integer or null" to required integer with fallback rule. Schema example updated from `null` to `1394`.

### api/publish-batch.js
- **Chronological sort before append:** `toAppend` array is now sorted by timestamp asc (nulls last), composite desc as tiebreaker, immediately before being concatenated to `existingConcepts`. Ensures all future publish batches land in concepts.json in episode chronological order.

### tools/sort-by-timestamp.js (new)
- **Retroactive sort script:** Reads concepts.json, sorts within each collection by timestamp asc (nulls last, composite desc as tiebreaker), writes back. Applied once — 349 of 715 concepts reordered across 14 collections. Idempotent / safe to re-run.

### concepts.json
- **Retroactively sorted:** 349 concepts reordered into chronological order within their episode collections (collections 15, 501–522). No IDs changed; related_ids and duplicate_of links unaffected.

## v2.70 — 2026-08-03 · SEO redirect helper

### tools/update-seo-redirects.js (new)
- **Rename detector:** Diffs an old `concepts.json` backup against current, finds any concepts where the term (and therefore URL slug) changed, writes 301 redirect entries directly into `vercel.json`.
- **Workflow:** Before any rewrite session that may rename terms: `cp concepts.json tools/concepts-backup.json`. After session: `node tools/update-seo-redirects.js tools/concepts-backup.json`. Commit `vercel.json` + `concepts.json` together.
- **Handles:** Duplicate detection (skips already-present redirects), removed concepts (warns but doesn't auto-redirect — manual review), slug-only renames (e.g. capitalisation changes that don't affect slug are silently skipped).

## v2.69 — 2026-08-03 · SEO Session 3 — 14 category hub pages + deep-link fix

### tools/generate-static-pages.js
- **Category pages:** Added `buildCategoryPages()` — generates `/category/[name].html` for all 14 categories. Each page: breadcrumb, category accent bar, concept count pill, full concept list as linked rows with term + hook, CTA to SPA filtered by category.
- **Sitemap updated:** Category URLs now included at `priority: 0.8` (above concept pages at 0.7, below homepage at 1.0).
- **Duplicate `buildSitemap` removed** — old function replaced by new one that includes both concept and category URLs.

### index.html
- **Deep-link fix (v2.68b):** Handler now calls `setCat(concept.category)` before attempting to find the card — guarantees card is in DOM even if it was filtered. Skips `duplicate_of` concepts gracefully. Delay increased to 400ms + 350ms stagger for reliable DOM settlement.

## v2.68 — 2026-08-03 · SEO Session 1 — static concept pages, sitemap, GSC, deep-link CTA

### tools/generate-static-pages.js (new)
- **Static page generator:** Reads `concepts.json`, outputs `/concepts/[id]-[slug].html` for every concept. Fully Epistemic-branded — dark bg, Playfair term, category color accent stripe and pill, analogy + prompt blocks, related concept chips. Skips `duplicate_of` concepts.
- **Sitemap:** Writes `sitemap.xml` at repo root with all concept URLs + homepage.
- **Robots.txt:** Writes `robots.txt` pointing to sitemap.

### tools/setup-hooks.sh (new)
- **Pre-push hook installer:** Run once from Terminal (`chmod +x tools/setup-hooks.sh && ./tools/setup-hooks.sh`). Installs `.git/hooks/pre-push` that auto-regenerates all static pages on every push — zero chance of stale pages deploying.

### package.json (new)
- Added `"build:seo": "node tools/generate-static-pages.js"` npm script for manual runs.

### vercel.json
- **SPA fallback rewrite added:** `{ "source": "/(.*)", "destination": "/index.html" }` — ensures all unmatched routes serve the SPA while static files in `/concepts/` are served correctly first (Vercel checks static files before rewrites).

### index.html
- **GSC verification tag:** Added `<meta name="google-site-verification">` to `<head>` (getepistemic.app@gmail.com account).
- **Deep-link hash handler:** After `render()` + grid paint, checks `window.location.hash` for `#open=[id]`. If present, scrolls to the card and calls `toggleCard(id)`. Used by concept static pages' primary CTA so visitors land directly on the right card.

## v2.67 — 2026-07-31 · Constellation Clusters view + Collect animation, pull quote flash fix + drag smooth

### index.html — Pull quote: flash fix
- Default CSS `top: 50%` → `top: -100vh`. Quotes are off-screen until `_alignPQ()` sets real position. Prevents mid-hero flash on page refresh with scroll restoration.

### index.html — Pull quote: drag smoothness
- Removed settle timer (was snapping `_pqTargetDrag = 0` causing sudden jump on stop).
- Lerp loop now decays target naturally each frame (`*= 0.91`). Both target and current drain together — symmetric, smooth arrival in both directions.

### index.html — Constellation: Clusters view
- New `◉ Clusters` view button (between Free and Nebula). `_wcClustersLayout()`: groups words by category into 5 zone centers, packs each group into rows within their zone (row height 24px, char width estimated 7.2px). No overlap guaranteed by row layout. Tiny ±4px jitter keeps it organic.

### index.html — Constellation: Collect button
- Appears in Free view when a category filter is active. Animates active words into a centered grid (0.9s cubic-bezier `left/top` transition). Inactive words fade to 0. Toggles to `⊡ Scatter` to restore original positions. Gentle pulse animation on button.
- Original positions stored in `dataset.origLeft/origTop` at render time.

## v2.66 — 2026-07-31 · Constellation view modes (Free / Nebula), pull quote lerp drag

### index.html — Constellation view modes
- **✦ Free / ⬡ Nebula toggle:** new `.wc-view-row` with 2 mode buttons in the constellation header. State stored in `_wcViewMode`.
- **Nebula layout:** `_wcNebulaLayout()` — 5 zone centers spread across canvas (top-left, top-right, center, bottom-left, bottom-right); each category assigned to a zone via `_WC_CAT_ZONES`. Words placed near their zone center with bell-curve spread (`spread = min(W,H)*0.2`).
- **Ambient drift:** `_wcStartDrift()` / `_wcDriftFrame()` rAF loop — each word orbits its position on a 8–12s sine cycle with 2.5–4.5px amplitude. Starts after bloom completes in nebula mode. Stops on close or view switch.
- **`dataset.baseRot`** stored per-word so drift can compose with seeded rotation.

### index.html — Pull quote drag (lerp spring)
- Replaced CSS-transition approach with true lerp rAF loop (`_pqLerpLoop`). Lerp factor 0.04 = ~0.6s to mostly settle — heavy, natural drag feel.
- Target accumulates scroll velocity (clamped ±32px); resets to 0 after 80ms idle. Loop self-terminates when motion is negligible.
- Removed CSS `transition: transform` from `.sp-pull-quote` (no longer needed).

## v2.65 — 2026-07-31 · Constellation category filter fix, pull quote drag redesign

### index.html — Constellation category filter
- **Bug fix:** `_wcFilterCat` now sets `s.style.opacity` directly (from `s.dataset.baseOpacity`), overriding the inline opacity set during bloom-in. CSS class `.wc-dimmed { opacity: 0.07 }` alone was overridden by inline style. Category pills now correctly dim/undim words.

### index.html — Pull quotes
- **No blur:** removed all `filter: blur()` from pull quote drag. No more shake/blur effect.
- **CSS transition drag:** replaced rAF velocity loop with direct drag-offset calculation on each scroll event. CSS `transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94) 0.15s` provides the delayed-start and eased-arrival feel. Settle fires after 220ms idle via `setTimeout`.
- **Left quote:** now 150px below right quote (was 50px) — clearer asymmetry.
- **Rem:** updated `right`/`left` from `9.32rem` to `9.35rem`.

## v2.64 — 2026-07-31 · Constellation visuals, ◎ pulse, pull quote drag, episode source links

### index.html — Constellation visual improvements
- **Rotation:** each word rotated ±10° (seeded per word index) — feels handwritten and alive
- **3-tier font sizes:** 0.65rem / 0.75rem / 0.86rem (seeded) — visual depth without noise
- **Opacity depth:** 0.55–0.90 per word (seeded) — foreground/background feel
- **Hover:** switched from `transform: scale` to `filter: brightness(1.15)` to avoid fighting seeded rotation

### index.html — ◎ pulse animation
- `@keyframes wcMapPulse`: opacity 0.55→1→0.55, 3s ease-in-out infinite. CSS only, no GPU cost beyond normal opacity compositing. Applied to both `.lexi-map-btn` and `.gv-map-btn`. Stops on hover. Suppressed with `prefers-reduced-motion`.

### index.html — Pull quotes
- Left quote now 50px lower than right quote (offset in `_alignPQ`)
- Drag+blur scroll effect: JS velocity tracking on scroll event, `_pqDragFrame` rAF loop applies `translateY(drag)` + `filter:blur()` proportional to velocity, settles when velocity < 0.15
- `9.28rem` → `9.32rem`

### index.html — Episode source links
- `_openSourceEpisode(collectionId)`: closes all panels (constellation → vocab → lexi), then calls `openEpisodeDrawer(colId)` after 340ms
- `↗` button in Lexi panel word row top bar (hidden until hover, `.lexi-src-btn`)
- `↗` button in Vocab panel word row bottom row (alongside "Add to Lexi")
- `↗ episode` link in constellation tooltip (`wc-tt-src`)

---

## v2.63 — 2026-07-31 · Fix constellation ID/class collision with Conversation Starter

### index.html — Root cause of ◎ doing nothing
- **Root cause:** The existing Conversation Starter modal already uses `id="csOverlay"`, `class="cs-overlay"`, and has a permanent `display: none !important` rule on `.cs-overlay`. My constellation overlay shared both — so `getElementById('csOverlay')` found the wrong element, and `.cs-overlay` was permanently hidden.
- **Fix:** Renamed all constellation HTML, CSS, and JS from `cs-` / `csXxx` prefix to `wc-` / `wcXxx` (Word Constellation). Zero conflicts with existing code.

---

## v2.62 — 2026-07-31 · Constellation fixes, button layout, backdrop close

### index.html — ◎ button moved
- Removed from `.lexi-panel-actions` row (was squeezing Practice + All Words text). Moved to `.lexi-panel-header` left of close button — same pattern as Vocab panel header.

### index.html — closeLexiPanel: close Vocab alongside
- Clicking Lexi backdrop (or ✕) now also closes Vocab panel if it's open. Handles "click middle area → both close" case.

### index.html — Constellation scroll lock fix
- **Root cause of ◎ not working:** `_spLockBodyScroll()` was called even when Lexi already held the body lock, overwriting `_spScrollLockY` to 0. `_csDidLockBody` flag now skips lock/unlock if body was already fixed.

### index.html — Pull quotes
- `9.25rem` → `9.28rem`

---

## v2.61 — 2026-07-31 · Global Vocab Mode B: Word Constellation + quick fixes

### index.html — Word Constellation (Mode B)
- **New:** full-screen overlay (z-index 2000) with all vocab words as absolutely-positioned `<span>` elements, colored by category
- **Layout:** grid-jitter algorithm — seeded deterministic random (LCG), each word gets a grid cell + ±35% jitter. Stable across reloads.
- **Entrance:** words bloom in with 3ms/word stagger (capped 900ms) via opacity transition
- **Hover/tap tooltip:** `position:fixed` card showing category badge (colored), word, definition, "+ Add to Lexi" button. Flips left/right to stay in viewport.
- **Category filter:** pills in header, active pill filled with category color. Non-matching words dim to `opacity: 0.07` (280ms transition).
- **Mobile (≤600px):** 3-column pill grid instead of constellation; tap pill to expand definition inline.
- **Entry:** "◎" circle icon button added to Lexi panel actions + Vocab panel header.
- **"⊞ List" toggle:** closes constellation, opens Vocab panel (Mode A).
- **Light mode + reduced motion:** full overrides applied.

### index.html — Quick fixes
- Flying word animation: `0.55s` → `0.85s` (transition + setTimeout)
- Pull quotes: `9.2rem` → `9.25rem` (left + right)

---

## v2.60 — 2026-07-31 · Vocab panel UX polish + pull quote nudge

### index.html — Vocab panel z-index fix
- **Root cause:** Vocab panel was z-index 600; Lexi panel backdrop is z-index 1200 and intercepts all clicks. Raised Vocab overlay to z-index 1300, backdrop `pointer-events: none`, only `.gv-panel` captures clicks — both panels now coexist without closing each other.

### index.html — Flying word animation + bump
- **New:** clicking "Add to Lexi" spawns a ghost `<span>` that flies from the button to `#lexiPanelCount`, then removes itself. On arrival: `_lexiRenderPanel()` refreshes counts, `gvBump` keyframe pulses `#lexiPanelCount` and `#lexiPracticeCount` (if visible).

### index.html — Hide scrollbars
- Vocab panel (`.gv-word-rows`, `.gv-cat-grid`, `.gv-word-list`): `scrollbar-width: none` + `::-webkit-scrollbar: display:none`.
- Site-wide: `html { scrollbar-width: none }` + webkit override.

### index.html — Pull quotes
- Both left and right pull quotes nudged from `9.3rem` → `9.2rem`.

---

## v2.59 — 2026-07-31 · Fix global vocab data path, button row layout

### index.html
- **Bug fix:** `_buildGlobalVocabIndex` was iterating `EPISODE_META` directly; correct path is `EPISODE_META.episodes`. Caused empty Vocab panel.
- **Button layout:** `.lexi-panel-actions` → `display:flex; flex-direction:row; gap:8px`. Removed `width:100%` from `.lexi-action-secondary`.

---

## v2.58 — 2026-07-31 · Global Vocab Mode A: Category Browse

### index.html — Global Vocab overlay (Mode A)
- **New feature:** "All Words" button added to Lexi panel (`.lexi-action-secondary`, outline style) above Practice button
- **New overlay:** `.gv-overlay` / `.gv-panel` — 420px right-panel, same z-index 600, backdrop + slide-in transition using `cubic-bezier(0.32, 0.72, 0, 1)`
- **Category grid:** 6 cards (All + 5 categories), 2-col grid, shows word count + 3 preview words per card
- **Word list:** filterable by category pills, shows word + definition + "Add to Lexi" / "In Lexi" state per row
- **Data:** `_buildGlobalVocabIndex()` walks `EPISODE_META`, deduplicates by lowercase word, sorts alphabetically, caches in `_globalVocabCache`; cache invalidates if episode count changes
- **Transitions:** cat→list (slide left/right, 200ms out, 280ms in); list→cat (reverse); filter pills hide rows via `.gv-hidden` (height collapse)
- **Add to Lexi:** calls `_lexiconSave()` with correct 7-arg signature, updates badge via `_lexiUpdateBadge()`
- **Body scroll lock:** uses `_spLockBodyScroll()` / `_spUnlockBodyScroll()` — correct iOS-safe pattern
- **Light mode:** `.gv-overlay`, `.gv-panel`, `.gv-cat-card` overrides added
- **Mobile:** `gv-panel` goes `width: 100%` at ≤480px
- **Reduced motion:** all `.gv-*` transitions suppressed

---

## v2.57 — 2026-07-31 · Pull quotes final position, vocab layout, Lexi typography

### index.html — pull quotes horizontal position (final)
- Right quote: `right: 9.3rem`. Left quote: `left: 9.3rem`. Settled after iterating through 9.35 → 9.4 → 9.3rem. This is the locked position.

### index.html — vocab view layout
- `.vv-content` left padding raised to `3.2rem` (~51px) to clear the 38px fixed pull tabs. `.vv-back-bar` gets matching left padding.
- `.vv-grid` changed to `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` — wider minimum column prevents cramped 8-column layouts on large screens.
- Each vocab cell gets an editorial gradient divider at bottom: `linear-gradient(to right, transparent 0%, rgba(232,213,163,0.15) 12%, rgba(232,213,163,0.15) 88%, transparent 100%)` as a 1px `background-image`.

### index.html — Lexi panel typography
- Episode group labels (`.lexi-ep-group-label`): switched to Playfair Display italic, 0.78rem, opacity 0.72.
- Word definitions (`.lexi-word-def`): switched to Playfair Display italic, 0.84rem, letter-spacing 0.01em.

---

## v2.56 — 2026-07-31 · Pull quotes SVG-derived position, Lexi+vocab font pass

### index.html — pull quote horizontal positioning
- Attempted `left: 3.61vw` / `right: 3.61vw` derived from SVG hairline positions (x=52 and x=1388 in 1440-wide viewBox). Too close to viewport edges on 16" MacBook. Reverted to rem values in v2.57.

### index.html — pull quote scroll trigger
- Replaced broken load-time `getBoundingClientRect()` approach (runs before layout is stable) with scroll-triggered measurement: `getBoundingClientRect().top + window.scrollY` on first scroll event. Quotes now align correctly regardless of page load timing.
- Pull quotes only revealed after `scrollY > 80` — avoids flash at page top.

---

## v2.55 — 2026-07-31 · Vocab view bug fix, global vocab session plan

### index.html — vocab view display bug fix
- **Root cause:** `_resetDrawerVocabView()` set `vocabView.style.display = 'none'` as inline style, which overrode CSS `.vv-entering { display: flex }`. Words disappeared after first open.
- **Fix:** Added `vocabView.style.display = ''` to clear the inline style before adding `.vv-entering` class.

### docs/global-vocab-session-plan.md (new)
- Full 2-session plan for the "All Words" global vocabulary feature inside the Lexi panel.
- **Mode A (Session 1) — Category Browse:** full-screen overlay, 6 category cards (All + 5), word list with Add to Lexi per row, full animation spec (7 transitions with timing curves), HTML structure, CSS rules, JS function signatures.
- **Mode B (Session 2) — Word Constellation:** canvas-less absolutely-positioned spans, seeded random layout, category dim filter, mode toggle in header.
- Data architecture: `_buildGlobalVocabIndex()` walks all `episode_meta.json` vocab_vault arrays, deduplicates, caches in `window._globalVocabCache`.
- Entry point: "All Words" button added to Lexi panel above Practice button.

---

## v2.54 — 2026-07-31 · Lexi ℒ symbol, Vocab pull tab animation, Vocab replaces card grid

### index.html — Lexi pull tab symbol
- Replaced `📝` emoji with `ℒ` (U+2112, Script Capital L) — typographic, no emoji rendering inconsistency, matches editorial aesthetic.

### index.html — Vocab pull tab animated entrance (desktop only)
- `.vocab-pull-tab` added to the `.left-tabs-group` below the Lexi tab.
- Tab is hidden by default (`opacity: 0`, `pointer-events: none`). After episode drawer opens (350ms), a 420ms delayed CSS animation (`.vv-entering`) springs the tab in using `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Tab disappears on drawer close via `_resetDrawerVocabView()`.
- Desktop only — hidden via `.left-tabs-group { display: none }` at ≤900px.

### index.html — Vocab view replaces card grid in drawer
- Clicking Vocab tab now opens an in-drawer vocab view (`#epDrawerVocabView`) that slides over the episode card grid — cards animate out, vocab list animates in.
- Back button (`.vv-back-bar`) restores card grid with reverse animation.
- Category filter pills (`.vocab-cat-pill`) filter in-place without DOM rebuild.
- JS functions: `_openDrawerVocabView()`, `_closeDrawerVocabView()`, `_resetDrawerVocabView()`, `openDrawerVocabTab()`.
- Module-level vars `_vvCurrentList`, `_vvCurrentColId`, `_vvCurrentPrefix`, `_vvBuildCell` expose the closure-scoped `buildVocabCell` function for reuse outside `_renderIntelRow`.

---

## v2.53 — 2026-07-31 · 5-category vocab system, Aa Vocab pull tab (desktop), SEO session plan

### docs/vocab-categories.md — rewrite to v2.0
- Collapsed 9 categories → 5: **Small Talk**, **Smartypants**, **Business**, **Science**, **Mind & People**.
- Each category has: register description, assignment rule, examples, edge case guidance.
- Decision rules: primary context rule → tie-break by narrower register → no invented categories → `category_alt` stays null during extraction.
- Edge case table covers 10 common ambiguous cases.

### tools/categorize-vocab.js + tools/generate-episode-intel.js + epistemic-tools/extract.html
- `VALID_CATEGORIES` updated to the 5 new categories in all three files.
- System prompts updated with new category definitions and rules.

### index.html — CATS / LX_CATS arrays
- `CATS`: `['All','Small Talk','Smartypants','Business','Science','Mind & People']`
- `LX_CATS`: `['All','Favorites','Small Talk','Smartypants','Business','Science','Mind & People']`

### index.html — Aa Vocab pull tab (desktop only)
- Fixed left-edge pull tab group (`.left-tabs-group`): `position: fixed; left: 0; top: 50%; transform: translateY(-50%); z-index: 500; flex-direction: column; gap: 4px`. Hidden on mobile.
- Lexi and Vocab tabs are `position: relative` children of the group — share the fixed anchor.
- Tab hover: slides right `4px` using `translateX`.

### docs/seo-session-plan.md — rewrite to v2.0
- Added SPA explanation (why Google can't crawl the current site).
- Architecture locked: Node build script → static HTML files → `/public/concepts/` → Vercel serves alongside SPA. No Next.js.
- Canonical URL format: `/concepts/[zero-padded-id]-[term-slug]`.
- 4-session breakdown: (1) static pages + routing, (2) OG images + meta tags, (3) structured data + sitemap + robots.txt, (4) category pages + redirect helper.
- Model recommendation: claude-sonnet-4-6.
- Mandatory file-read start command for each session.

### docs/ideas-parking-lot.md
- Added **Next.js migration** entry — deferred in favour of static page generation approach.

---

## v2.52 — 2026-07-31 · Hero tighten, pull quotes ×10 + left mirror, Lexi favorites

### index.html — hero mobile spacing (rev 2)
- **Change:** Further compressed eyebrow margin (0.5rem), sub margin (0.9rem), CTA margin (1.25rem), card height (450px→400px), card-col bottom padding (2.5rem→1.25rem), stats padding (1.5rem→1rem). Total vertical saving ~80px; Episodes/Themes section now peeks at bottom of most phone viewports.

### index.html — pull quotes expanded to 10 stats + left-side mirror
- **Change:** STATS array replaced with 10 selected stats (90%, 79%, 89%, 1/5, 300, 66%, 1%, 50%, 6h 40m, 2×). Added `.sp-pull-quote-left` element mirrored on the left side of viewport (text-align left, border-left, positioned at `left: 9.35rem`). Left quote offset by 5 indices from right quote so they never show the same stat simultaneously.

### index.html — Lexi favorites feature
- **Change:** Added `isFavorite: boolean` field to lexicon entry schema (backward-compat migration in `_lexiconLoadStore`). Heart button `♥` (`.lexi-fav-btn`) added between state badge and ✕ on each word row — subtle (opacity 0.22) until active (gold, opacity 1). `lexiFavPop` spring animation on save. `♥ Saved · N` pill added to Lexi category row (first position). Favorites filter renders only `isFavorite === true` entries.

## v2.51 — 2026-07-30 · Hero mobile fix, library filter fix, vocab animation

### index.html — hero mobile padding
- **Root cause:** `padding: 46px` was 10px less than the mobile nav height (56px), causing hero content to start behind the opaque fixed nav. Also `hero-eyebrow-outer margin-bottom` was 2rem, pushing copy far down the viewport.
- **Fix:** `padding: 56px 0 0 0` at ≤900px and ≤390px. Reduced eyebrow margin-bottom 2rem → 1rem, H1 margin-bottom 1.25rem → 0.75rem, hero-sub margin 2rem → 1.25rem, hero-cta margin 2.5rem → 1.75rem.

### index.html — Library filter / Picks / Mastered intersection bug
- **Root cause:** `spSetSort('picks')` and `spSetSort('mastered')` called `_spRenderFilteredGrid()` which ignores `activeCat`. And `setCat()` → `buildGrid()` ignored `spActiveSort`. The two filter axes were completely independent and never intersected.
- **Fix:** `buildGrid()` now reads `spActiveSort` and applies picks/mastered filter in addition to `activeCat`. `spSetSort()` routes through `buildGrid()` when `activeCat !== 'all'` so the intersection always works.

### index.html — Vocab + Lexi category animation
- **Root cause:** Category filter in Vocab panel did full DOM rebuild (`innerHTML` wipe), causing instant height jump and content flash.
- **Fix:** Vocab panel: cells stay in DOM, toggling `.vocab-row--hidden` (opacity 0, scale 0.9, 0.18s transition). Lexi panel: fade list out (opacity+scale), re-render, fade back in (150ms).

## v2.50 — 2026-07-29 · Single mobile nav bar, polish, hero padding

### index.html — mobile nav final polish (rev 3)
- **Logo clipping fixed**: `grid-template-columns: max-content 1fr` (was `auto 1fr`) + `overflow: visible` on `.nav-logo`. "Episte:" truncation eliminated.
- **Buttons resized to 35×35px** for a cleaner, less crowded feel.
- **Theme toggle hidden on mobile** — one less distraction in the slim nav bar.
- **Signup button pulsing animation**: `navSignupPulse` keyframe (scale 1→1.28, glow shadow, 2.4s infinite). Replaces the static gold pill with an attention-drawing animated ✦ star icon.
- **Nav spacing**: `justify-content: space-evenly` on `.nav-right` keeps buttons equally distributed without crowding.

### index.html — hero top padding (mobile)
- `padding-top` reduced from 76px → 46px at both `≤900px` and `≤390px` breakpoints. Hero copy now sits ~30px closer to the top; Episodes/Themes section peeks into view on most phone screens.

---

## v2.50 — 2026-07-29 · Single mobile nav bar, pill order fix, difficulty colors

### index.html — mobile nav (definitive fix, v2.50 rev 2)
- **Bottom tab bar eliminated on mobile** (`display: none !important`). There were always TWO bars (top `#mainNav` + bottom `mobile-tab-bar`); user only saw the bottom one and didn't realise the top existed.
- **Lexi / Speak / Apply added directly to `nav-right`** as icon buttons (`.nav-mob-action`, mobile-only): `Aa` (Playfair italic) · `💬` · `🥊`. All 40×40px touch targets.
- **Hamburger removed on mobile** — all actions now inline in the top bar; hamburger still available in HTML for desktop hover menu.
- **Nav layout**: `[Epistemic.] ......... [Aa][💬][🥊][☽][✦]` — one row, all visible.
- **Signup button** overridden on mobile to icon-only (gold ✦, no pill/shimmer/shadow from desktop style).
- **`body { padding-bottom: 0 }`** on mobile — removes the 60px gap that existed for the now-removed tab bar.
- **Nav eyebrow hidden** on mobile (was causing text overflow into nav-right).
- **Nav padding**: `0 0.75rem` on mobile for tighter fit.

### index.html — Quotes pill mobile order
- View-selector `◫` button `order` raised from 12 → 20 so it always sits last.
- Mobile pill order confirmed: Vocab(11) → Profile(12) → Quotes(13) → ◫(20).

### index.html — Profile popover difficulty colors
- Added `.ep-profile-pop-score-val.diff-1/2/3` and `.tag-action-high` color rules. Previously the JS was setting these classes on score-val elements but only `.ep-profile-pop-tag.diff-*` rules existed, so no color showed.

---

## v2.49 — 2026-07-29 · Intel pills restructure, Profile polish, mobile fixes

### index.html — intel pills restructure
- **Key Quotes promoted to standalone pill** (`Quotes`): positioned between DNA and Vocab in desktop order (DNA → Quotes → Vocab → Tension → Line → Profile → IWTMT). On mobile: shown after Vocab and Profile (order 13 via CSS).
- **Line pill moved** to after Tension (was after DNA). New desktop order confirmed: DNA | Quotes | Vocab | Tension | Line | Profile | IWTMT.
- **Profile pill**: Key Quotes removed — Profile now shows only core_claim, type/tone/guest tags, and difficulty/actionability scores. Key Quotes have their own pill.
- **Mobile Profile sheet**: Tension now renders with proper `ep-intel-tension-vs` pill-vs-pill grid (was rendering as plain text). Fix applies to all `vs.`-format tensions.

### index.html — desktop Profile popover
- **Opens upward**: popover now always opens above the pill row (same direction as IWTMT), never downward into the drawer.
- **Wider**: min-width increased to 500px (was 320px).
- **Redesigned layout**: core_claim in Playfair italic, then a type/tone/guest/evergreen/controversy tag row, then a structured scores row (Difficulty ● and Takeaway ⚡ with labels). Cleaner than the old badge jumble.

### index.html — hero pull quote animation
- Pull quote starts at `opacity: 0` on page load. Fades in with a 1.4s ease transition after a 1600ms delay — appears after the main hero elements have settled.
- `pq-hidden` scroll-hide logic updated to only remove hidden state if `.pq-visible` class is already set.

### index.html — lexi panel
- **Pill row left padding**: `padding-left: 8px` added so "All" pill no longer butts against the panel edge.
- **Mobile top offset**: `.lexi-panel-header` gets `padding-top: calc(env(safe-area-inset-top) + 56px)` on mobile — fixes X button hidden behind Chrome/Safari URL bar.

### index.html — mobile nav
- **Eyebrow hidden on mobile**: "Ideas worth saying out loud" (`nav-eyebrow`) was `white-space: nowrap` and overflowing onto nav-right buttons, hiding the theme toggle, signup icon, and hamburger. Now `display: none` on mobile.
- **Nav padding reduced**: `0 2.5rem → 0 1rem` on mobile for more breathing room.
- **Logo**: `min-width: 0; overflow: hidden` prevents layout bleed.
- **Theme toggle + signup ✦ + hamburger**: all confirmed visible on mobile.
- **Hamburger still present**: the `≡` menu contains Lexi, Speak, Apply, Sign Up, and the I feel epic egg — kept as utility overflow menu.

---

## v2.48 — 2026-07-29 · Mobile nav fixes + hero scroll

### index.html — mobile nav
- **Nav-right grid placement fixed:** on mobile, `nav-right` now explicitly placed in `grid-column: 2; grid-row: 1`, fixing a bug where it wrapped to row 2 (clipped by nav height), hiding the theme toggle and compressing the logo.
- **Theme toggle:** ensured `display: flex; min-width/height: 44px` on mobile — always visible and touch-friendly.
- **Episodes tab removed** from mobile bottom tab bar (`mobTabHome` ◉) — button did nothing useful; 3 tabs remain (Lexi, Speak, Apply).
- **✦ signup button added** to `nav-right` — icon-only, `DM Mono`, accent-colored, 44×44px touch target, links to `#signup` section. Visible on mobile only (hidden on desktop via default `display: none`, shown at ≤768px).

### index.html — hero scroll
- **Hero top padding reduced** on mobile: `90px → 76px` at ≤900px; `390px` breakpoint adds further tightening on hero-cta, hero-card-col, hero-stats, hero-sub so the Episodes/Themes toggle peeks into viewport without scrolling.

---

## v2.46 — 2026-07-29 · Vocab categories, enrichment layer, new tools

### docs/vocab-categories.md (new)
- **9 register-based vocab categories:** Small Talk, Dinner Party, Smartypants, Corporate, People Skills, Head Space, Lab Coat, Deep Cuts, Zeitgeist — each with a crisp rule, examples, Haiku decision logic, and an edge case table.
- **Dual-category schema defined:** `category` (primary, required) + `category_alt` (secondary, null by default — reserved for a future dedicated pass once category filter UI exists).

### tools/generate-episode-intel.js
- **Vocab vault target raised:** 20–25 → 35–40 words per episode.
- **Tier 2 + Tier 3 vocab rules added:** smart idioms (Tier 2) and stable educated-speaker expressions (Tier 3) now explicitly included. New Yorker/Atlantic test defined for Tier 3. Explicit exclusions added: proper nouns, common dictionary words, guest-coined jargon, internet-only slang.
- **Category field added to vocab_vault output:** each word now includes `category` (one of 9 values) and `category_alt: null`. Validation step added — any category not in the approved list is nulled rather than saved.

### tools/categorize-vocab.js (new)
- Backfill script: adds `category` to all existing vocab_vault entries missing it. One Haiku call per episode. Validates against the 9-category list before writing. Resume-safe.

### tools/generate-episode-enrichment.js (new)
- New script separate from intel generation. Adds: `difficulty_level`, `tone`, `guest_field`, `key_quotes`, `core_claim`, `episode_type`, `actionability_score`, `evergreen`, `controversy_flag` (via Haiku). Auto-calculates `guest_return` (from collections.json) and `concept_density` (concept count). Seeds `episode_length_minutes: null` as placeholder for manual backfill.

### epistemic-tools/extract.html
- **Vocab display updated:** category shown inline in textarea as `word — definition [Category]` or `word — definition [Category | AltCat]`. Parse/serialize updated to round-trip correctly.
- **Counter updated:** vocab entry count range changed from 20–25 to 35–40.
- **Vocab vault schema example updated:** includes `category` and `category_alt` fields.
- **INTEL SELF-CHECK prompt updated:** now checks for 35–40 entries with valid categories.

### docs/ideas-parking-lot.md (new)
- New file for deferred feature ideas. First entry: `related_episode_ids`.

### docs/architecture.md
- `vocab_vault` schema updated: new category fields, 35–40 target, backfill note.
- All enrichment fields documented under new "Enrichment fields" subsection.

### docs/roadmap.md
- Reference to `docs/ideas-parking-lot.md` added.

---

## v2.45 — 2026-07-29 · Micro-labels tour, mobile bottom tab bar, hero polish

### index.html
- **Hero tagline font:** `.sp-product-tagline` switched to DM Mono, 0.6rem, letter-spacing 0.18em, uppercase — matches eyebrow style. `.sp-eyebrow-kicker` set to `visibility: hidden` (space preserved, text gone).
- **Pull quote position:** JS-aligned to `#browseToggleWrap` (Episodes/Themes header) via `getBoundingClientRect()` on load. `right` kept at `9.35rem`.
- **Micro-labels tour JS:** IIFE checks `lll_toured_v1` or `?tour=1` URL param. 3 sequential `.sp-tour-step` callouts pointing at: Lexi pull tab (arrow-left), Speak nav (arrow-top), Apply nav (arrow-top). 4s auto-advance per step, click-to-advance, dismiss button on each. Saves `lll_toured_v1 = '1'` on completion or dismiss.
- **Mobile bottom tab bar:** `<nav class="mobile-tab-bar" id="mobileTabBar">` — 4 fixed-bottom tabs: Episodes (◉) · Aa Lexi · 💬 Speak · 🥊 Apply. `env(safe-area-inset-bottom)` for iPhone home indicator. Body gets `padding-bottom: calc(60px + env(...))`. Only visible at ≤768px. Hamburger stays for Sign Up / Epic.

---

## v2.44 — 2026-07-29 · Pull quote: fixed position, stat cycling, fade, nav final

### index.html
- **Pull quote always visible on load:** `opacity: 0.45` by default (was `0` awaiting scroll). No scroll-trigger to show — only fades out when nearing library (`#netflixRows`).
- **Pull quote fixed position:** always `position: fixed; right: 9.35rem` — no class-switching between absolute/fixed (was causing duplicate-looking element on scroll). Opacity-only control.
- **Stat cycling:** starts immediately on page load (`setInterval(_nextStat, 5000)` — no initial delay). Crossfade via `.pq-swapping` class (opacity 0 → swap text → opacity back). Stats: `94%` / `14%` / `10,000`.
- **Fade trigger:** scroll listener hides pull quote when `#netflixRows` top < `window.innerHeight + 100`. Removed `.pq-hidden` on hero/episode scroll — it now only hides near library.
- **Nav Browse button removed:** from desktop nav island and mobile nav menu.
- **Lexi moved to left pull tab:** `#lexiPullTab` — `position: fixed; left: 0; top: 50%; border-radius: 0 8px 8px 0`. Vertical text: Playfair italic "Aa" + DM Mono "LEXI". Badge `#lexiPullBadge` shows word count. Fly particle + badge pulse updated to target `#lexiPullTab`. Hidden on mobile.
- **Nav rename:** SPARK → 💬 Speak, CORNER → 🥊 Apply. Apply nav button calls `enterCornerMode()` directly (no intermediate panel).
- **Corner mode scroll guard:** `enterCornerMode()` checks `window.scrollY > 60` — if scrolled, calls `window.scrollTo({top:0, behavior:'smooth'})` then re-invokes after 350ms.
- **Corner mode pills in hero:** "Past situations ↗" and "← Explore" pill buttons appear in `#spModeToggleRow` when corner mode activates; hidden when exiting.
- **Hero product tagline:** `<p class="sp-product-tagline">` added below search bar. Text: "Save ideas from podcasts. Practice the words. Use them." DM Sans 0.8rem (later updated to DM Mono in v2.45).

---

## v2.43 — 2026-07-29 · Spark + Corner panel animation fix (canonical)

### index.html
- **Overlay animation pattern (canonical):** `conv-overlay` and `stories-overlay` now always `display: flex; pointer-events: none` in base CSS. `.active` class adds `pointer-events: all` and background fade. Removed all `display` toggling from JS open/close functions — no more `display:flex` in `openCS()`/`openCornerHistory()` or `display:none` in close functions.
- **`openCS()` fix:** removed `overlay.style.display = 'flex'` + two-frame rAF pattern. Now just `overlay.classList.add('active')`.
- **`openCornerHistory()` fix:** same — removed two-frame rAF, now direct `overlay.classList.add('active')`.
- **Micro-labels CSS:** `.sp-tour-backdrop`, `.sp-tour-step`, `.sp-tour-label`, `.sp-tour-desc`, `.sp-tour-dismiss`, `.sp-tour-step-counter` added. Arrow variants: `arrow-left`, `arrow-right`, `arrow-bottom`, `arrow-top`. Light-mode shadow variant. `prefers-reduced-motion` fallback.

---

## v2.42 — 2026-07-29 · Lexi UX: word removal animation, vocab pill, episode grouping, grading persist

### index.html
- **Vocab pill dual behaviour:** Custom IIFE replaces `makePill` for VOCAB. Desktop hover shows N+More popover (7 words preview + "+N more" cell). Pill click → `openVocabPanel(vocab)` directly (full expansion). Mobile tap → bottom sheet. `VOCAB_PREVIEW_COUNT = 7`.
- **Lexi word removal animation:** `removeBtn` click: `row.style.maxHeight` set to current pixel height, then rAF sets `opacity: 0`, `transform: translateY(-6px)`, `maxHeight: 0`. Row removed from DOM at 380ms. `_lexiUpdateBadge()` called after removal.
- **Lexi scrollbar hidden:** `.lexi-panel-list { scrollbar-width: none }` + `.lexi-panel-list::-webkit-scrollbar { display: none }`. Scroll still works.
- **Episode grouping in Lexi panel:** Podcast → Episode → Words 3-level hierarchy. `_lexiconSave` now writes `podcastName` (from `COLLECTIONS_BY_ID[colId].podcast`) and `episodeTitle`. `_lexiRenderPanel` groups by `podcastName` then `episodeTitle`. CSS: `.lexi-podcast-group`, `.lexi-podcast-header` (DM Mono accent), `.lexi-ep-group`, `.lexi-ep-group-label` (DM Sans muted2).
- **Episode grouping backfill:** lazy migration in `_lexiRenderPanel` — for entries missing `podcastName`, reads `COLLECTIONS_BY_ID` and re-saves with `podcastName` + `episodeTitle` populated.
- **Practice grading persist:** `_lexiSaveGrading(word, sentence, verdict, feedback, suggestedSentence)` saves `{ verdict, feedback, sentence, userSentence, gradedAt }` to word entry in `lll_lexicon_v1`. Grading recap rendered inside word row: verdict badge, feedback text, suggested sentence in accent monospace with left-border.

### api/cs-generate.js
- **Grading prompt rewrite:** 3-paragraph system prompt — Paragraph 1: verdict opener (`✓ Hits the mark.` / `⚑ Almost there.` / `✗ Off the mark.`) + 1–2 sentences. Paragraph 2: specific detail. Paragraph 3: "Try:" rewrite (omitted if verdict = hit). Returns `{ verdict: "hit"|"almost"|"off", feedback: "...", sentence: null|"Try: ..." }`. Model: `claude-haiku-4-5-20251001`, `max_tokens: 380`.

---

## v2.41a — 2026-07-28 · Polish pass: bug fixes, animations, panel headlines, shimmer, UX refinements

### index.html
- **Bug fix:** `lexi-practice` API 502 — strip markdown code fences from Haiku response before `JSON.parse`. Haiku occasionally wraps JSON in ` ```json ... ``` ` fences; regex strips them before parsing.
- **Vocab pill:** clicking VOCAB pill now shows all words immediately — no "+N more" click required. `VOCAB_PREVIEW_COUNT` limit removed.
- **Panel taglines:** short 8–10 word italic description added to Lexi, Spark, and Corner panels. `.panel-tagline` component — DM Sans 0.78rem italic, `var(--muted)`, bottom border. Spark tagline toggles with tab switching.
- **Lexi word buttons redesign:** "Generate examples" and "Practice this word" replaced by compact equal-width pill pair (`✦ Examples` / `▶ Practice`) inside `.lexi-word-actions` flex row. Gold glow on hover for Examples, green glow for Practice (`box-shadow: 0 0 0 3px rgba(..., 0.07)`).
- **Shimmer refinement:** `::after` pseudo reduced opacity (0.35→0.22), narrower highlight band (30–70% → 38–62%), `border-radius: 4px`, slower cycle (4s→5s), wider background-size (200%→300%). More subtle and premium.
- **Nav Aa centering:** `.nav-lexicon-emoji { position: relative; top: 0.5px; }` — compensates for Playfair italic cap-height vs. nav text baseline.
- **Spark + Corner panel animations:** `openCS()`, `openCornerHistory()`, `_cornerOpenPanel()` now use two-frame rAF to set `display:flex` one frame before adding `.active` class — allows panel slide-in and backdrop fade to fire. `closeCS()` and `closeCornerPanel()` clear `display` after transition (300–400ms timeout).
- **Typewriter for generated sentences:** `_lexiRenderSentences` now calls `_lexiTypewriter(el, text)` per sentence. Varied typing speed (~20ms/char, 55ms on punctuation, 18ms on spaces). Blinking cursor (`.lexi-cursor`) removed when done. Sentences stagger (second starts after first finishes). Respects `prefers-reduced-motion` — instant render if set.
- **Loading skeleton:** replaced plain `.lex-skeleton` divs with `.lexi-skel-line` — 4 pulsing lines with varied widths and staggered `animation-delay`.
- **Mobile: eyebrow hidden:** `.sp-eyebrow-kicker { display: none; }` at ≤768px — reduces visual noise on small screens.

### api/cs-generate.js
- **`lexi-practice` JSON parse fix:** added `.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')` before `JSON.parse`. Also added `console.error` with raw response text for future debugging.

### docs/architecture.md
- Updated `lll_lexicon_v1` entry with full v2.40 schema (practice fields added).

### docs/design-tokens.md
- Added component specs for `.lexi-practice-overlay` and `.panel-tagline`.
- Updated shimmer spec values to v2.41a values.

---

## v2.41 — 2026-07-28 · Lexi Phase 4: full practice mode (overlay, session, API, voice, state)

### index.html
- **`#lexiPracticeOverlay`:** full-screen fixed overlay (z-index 2000). Opens with scale(0.97)→scale(1) + opacity fade (250ms). Header: progress bar, "N of M" counter, "✕ End" button. Stage: centered flex container holding the active card.
- **PROMPT card:** word (Playfair, accent, clamp 1.8–2.6rem), episode source label, collapsible definition toggle (CSS grid accordion), divider, textarea (DM Sans), mic button (hidden until SpeechRecognition detected), Submit + Skip buttons.
- **FEEDBACK card:** user sentence in Playfair italic, animated verdict label (`.lexi-verdict--hit/almost/off`), feedback body (DM Sans, `lexiFadeIn` 200ms + 120ms delay), Next button.
- **SUMMARY card:** ✦ icon, "Session complete.", stats row (practiced / hit the mark / mastered / skipped), Practice again + Back to Lexi buttons.
- **"▶ Practice this word"** button added to each expanded word row body in the Lexi panel (below Generate examples).
- **Practice session JS:** `_lexiStartSession(singleWord?)`, `_lexiRenderCard()`, `_lexiToggleDef()`, `_lexiSubmit()`, `_lexiRenderFeedback()`, `_lexiNext()`, `_lexiSkip()`, `_lexiEndSession()`, `_lexiRestartSession()`, `_lexiRenderSummary()`. Session state in `_lexiSession` object (in-memory only).
- **State persistence:** `_lexiSavePracticeResult(word, verdict)` — increments `practiceCount`, `hitCount`, sets `lastPracticedAt`. Mastered rule: `hitCount >= 2` AND `practiceCount >= 3`. Writes back to `lll_lexicon_v1`.
- **Voice input:** `_lexiInitVoice()` (shows mic button if `SpeechRecognition` available), `_lexiToggleVoice()` (toggle recording, interim results update textarea, `.recording` pulse animation).
- **`_lexiEndSession()`:** closes overlay, waits 260ms, opens Lexi panel (so user sees updated state badges immediately).
- **CSS tokens fixed:** `.lexi-verdict--hit` uses `var(--green)`, `.lexi-verdict--off` uses `var(--red)`, `.lexi-num--green` uses `var(--green)` — no raw hex.

### api/cs-generate.js
- **New `lexi-practice` mode:** accepts `{ mode, word, definition, userSentence }`. System prompt instructs Haiku to grade the sentence as a smart editor. Returns `{ verdict: "hit"|"almost"|"off", feedback: "..." }`. Model: `claude-haiku-4-5-20251001`, max_tokens: 220. Uses raw fetch (same pattern as other modes). Branch inserted before existing `lexicon` mode.

---

## v2.40 — 2026-07-28 · Lexi Phase 3: practice state fields + migration

### index.html
- **`_lexiconSave`:** new entries include `practiceState: 'new'`, `practiceCount: 0`, `hitCount: 0`, `lastPracticedAt: null`.
- **`_lexiconLoadStore`:** runs migration on load — any entry missing `practiceState` gets the four fields added and the store is re-persisted. No user action needed; transparent on next page load.

---

## v2.39 — 2026-07-28 · Lexi Phase 2: left panel — word list, lazy sentences, state badges

### index.html
- **`#lexiPanel`:** new fixed-position element covering full viewport (same pattern as `.conv-overlay` — panel = backdrop, inner = 360px content). Desktop: slides in from left (`translateX(-100%)→0`). Mobile (≤700px): bottom sheet (`translateY(100%)→0`, 92vh, rounded top corners).
- **Open/close:** `openLexiPanel()` / `closeLexiPanel()`. Clicking outside `.lexi-panel-inner` closes via `panel.onclick = closeLexiPanel`; inner has `stopPropagation`. Esc key bound via `_lexiEscHandler`. Body scroll lock via `_spLockBodyScroll()` / `_spUnlockBodyScroll()`.
- **`openLexiconPanel()`** now delegates to `openLexiPanel()` — nav button and mobile nav wiring unchanged.
- **`_lexiRenderPanel()`:** reads `lll_lexicon_v1`, groups words by `episodeTitle`, renders episode group labels + collapsible word rows. Updates count in header and Practice button count.
- **`_lexiBuildWordRow(entry)`:** each row has top bar (chevron + word name + state badge + remove ×) and a CSS-grid accordion body. Top bar click toggles `.expanded`; chevron rotates 90°. Remove × uses hover-reveal (always at 0.35 opacity on mobile).
- **`_lexiLoadSentences(entry, sentsEl)`:** lazy — checks `entry.sentences` then sessionStorage, else shows "✦ Generate examples" button. On click: `_lexiFetchSentences` → API call → `_lexiRenderSentences` → `_lexiPersistSentences`.
- **State badges:** `.lexi-state-new` (gold), `.lexi-state-practiced` (muted), `.lexi-state-mastered` (faded). Reads `entry.practiceState`, defaults to `'new'`.
- **Empty state:** illustrated empty panel with Aa glyph and instruction text.
- **CSS:** all tokens from design-tokens.md, no raw hex. Light-mode overrides, mobile bottom-sheet layout, reduced-motion (all transitions `none`). `align-items: start` pattern not needed (single-column list, not grid).
- **Performance:** no `backdrop-filter`, no `will-change` in base rules, `.lexi-panel` background transition is a single property on one element.

## v2.38 — 2026-07-28 · Lexi Phase 1: tap-to-save, fly particle, nav badge

### index.html
- **Drawer simplified:** `buildVocabCell` no longer creates a sentence accordion or triggers API calls. Tapping a word now saves it instantly to Lexi (one-tap bookmark). Re-tap unsaves (toggle).
- **Fly particle:** on save, the word text clones as a fixed-position `<span class="lexi-fly-particle">` that translates toward the nav Lexi button over 420ms (`cubic-bezier(0.22,1,0.36,1)`), then disappears. Two-frame rAF pattern per engineering-standards. Skipped entirely when `prefers-reduced-motion: reduce` is set.
- **Nav badge:** `<span class="nav-lexi-badge" id="navLexiBadge">` counts saved words on the Lexi nav button. Pulses (`lexiBadgePulse` 240ms) when a new word lands. Hidden at 0, updated on save/unsave/page-load/panel-open.
- **Saved chip state:** `.lexicon-word--saved` disables shimmer (`::after { display:none }`) and reduces opacity. A `.lexi-chip-check ✓` span appended to the word div.
- **`_lexiTapWord()`:** new function; replaces `_lexiconGenerate` as the drawer tap handler. Saves with empty `sentences: []` (generated lazily in panel).
- **`_lexiFlyParticle(fromEl)`:** fly animation function; respects reduced-motion.
- **`_lexiUpdateBadge()`:** reads `lll_lexicon_v1` length, updates badge. Called on page init, panel open, save, unsave.
- **CSS:** `.lexi-fly-particle`, `.nav-lexi-badge`, `@keyframes lexiBadgePulse`, `.lexicon-word--saved`, `.lexi-chip-check`, reduced-motion overrides. All tokens from design-tokens.md — no raw hex.

## v2.37 — 2026-07-28 · Lexi UX pass: click-to-generate, auto-save, collapsible panel

### index.html
- **Nav:** Renamed "Lexicon" → "Lexi" in desktop nav, mobile nav, and conv-panel tab. "Aa" glyph now renders in Playfair Display italic for a typographic emoji feel. Nav button now hidden by default, animates in on hover like Corner/Spark (removed custom pill/border).
- **Click-to-generate:** `buildVocabCell` no longer creates a "→ Use it" button. Clicking the shimmering `.lexicon-word` span triggers `_lexiconGenerate` directly. Second click collapses the accordion.
- **Auto-save:** `_lexiconReveal` calls `_lexiconSave` immediately after building sentences — no manual Save button. Free-form word search (`_lexiconShowSearchResult`) also auto-saves. `.lex-use-btn` and `.lex-save-btn` CSS hidden with `display:none !important` as cleanup guard.
- **Popover flip fix:** `showPopover` now re-reads `popover.offsetHeight` on each call instead of using the cached `_popH`. Prevents stale height (from an open sentence accordion) causing a spurious downward flip.
- **Panel card redesign:** `_lexiconBuildSavedCard` always shows definition (removed the `if (entry.definition)` guard). Sentences moved into a `lex-sentence-wrap` grid accordion. Clicking the word title toggles sentences with a `▸` chevron that rotates 90° when expanded.

## v2.36 — 2026-07-27 · Lexicon: vocabulary practice tool

### index.html
- **Lexicon chip UI:** `buildVocabCell` now renders each vocab word as a `.lexicon-word` span (Playfair, accent, animated shimmer sweep via `::after` + `lexiconShimmer` keyframe, staggered per `--shimmer-index`). "→ Use it" button added below definition.
- **State machine:** each word chip cycles IDLE → LOADING (skeleton shimmer) → REVEALED (staggered sentence accordion) → SAVED / ERROR. Re-tap on REVEALED collapses; re-tap on SAVED re-opens from localStorage. Multiple chips independent.
- **Session cache:** `sessionStorage` key `lll_lexicon_session_<wordkey>` prevents redundant API calls within a tab session.
- **Lexicon panel:** new tab "Aa Lexicon" added to `conv-panel`. Two sub-tabs: ✦ Lexicon (saved words grouped by episode) and ◈ Search (free-form word search). `panelSwitchTab` extended to include `'lexicon'`.
- **Nav button:** "Aa Lexicon" added to desktop nav island and mobile nav menu.
- **localStorage:** `lll_lexicon_v1` — ring buffer, max 100 entries. Entry shape: `{ word, definition, collectionId, episodeTitle, sentences, savedAt }`.
- **Toast:** overflow toast slides up from bottom when ring buffer drops oldest entry.
- **Light mode:** full `[data-theme="light"]` overrides for every new surface.
- **Reduced motion:** all new animations (`lexiconShimmer`, `lexSkelPulse`, transitions) disabled/instant.
- **Mobile:** safe-area-inset-bottom on scroll sections; touch-action: pan-y; 44px tap targets on all buttons.

### api/cs-generate.js
- **Lexicon mode branch:** new `mode: 'lexicon'` path — model `claude-haiku-4-5-20251001`, max_tokens 180, system prompt generates two natural usage sentences (casual + professional). Returns `{ sentences: [{label, text}] }`. JSON parse guarded with try/catch.

## v2.35 — 2026-07-27 — Pull quote shifted 40px more left (right: 7rem)

### index.html
- **Pull quote:** `right` changed from `4.5rem` to `7rem` — aligns bar with hairline SVG edge.

---

## v2.34 — 2026-07-27 — Eyebrow kicker up, episodes down 100px, pull quote shifted left

### index.html
- **Eyebrow kicker:** `margin-top: -2.5rem` pulls "Turn what you hear…" up toward top of hero without changing hero padding. Offset reset to 0 on mobile.
- **Episodes section gap:** `.browse-section-outer` gets `margin-top: 6rem` at ≥769px — adds ~100px breathing room between mode toggle buttons and Episodes/Themes row.
- **Pull quote position:** `right` shifted from `2rem` to `4.5rem` (~40px left), away from screen edge.

---

## v2.33 — 2026-07-27 — Pull quote right margin on hairline, dead space removed

### index.html
- **Pull quote repositioned:** Moved to `.browse-section-outer` wrapper (sibling of browse-toggle-wrap), `position:absolute; right:2rem; bottom:0` — bottom edge lands exactly on the hairline divider. Border-right accent bar aligns with hairline edge.
- **3-line format:** `94%` (1.8rem Playfair) on line 1; `of podcast ideas are` / `forgotten in 48 hours.` as small italic (0.68rem) below via `.sp-pull-body`.
- **Dead space removed:** Removed `margin-top: 5rem` desktop rule from `.browse-toggle-wrap`.

---

## v2.32 — 2026-07-27 — Pull quote to browse-toggle row, word swap 1.5s

### index.html
- **Pull quote relocated:** Moved `.sp-pull-quote` from hero section into `.browse-toggle-wrap` flex row. Now sits right-aligned on the same row as Episodes/Themes, with its border-right line landing exactly on the hairline divider. `margin-left:auto` pushes it to far right.
- **94% sizing:** `<strong>` matches `.browse-toggle` font-size (1.8rem Playfair). Body copy `.sp-pull-body` is 0.72rem italic, right-aligned below.
- **Word swap timing:** Crossfade transition extended from 1.1s to 1.5s. Hold phase updated accordingly.
- **Pull quote hidden on mobile:** `display:none` below 900px — browse-toggle row is too tight.

---

## v2.31 — 2026-07-27 — Hero: word swap fix, pull quote stat, eyebrow spacing, episodes padding

### index.html
- **Word swap fix:** `_initWordSwap` now wraps "die" text in `.sp-die-inner` span and fades that independently — parent `#spHW1` opacity was incorrectly hiding the child `.sp-word-live` span, making "live" invisible.
- **Pull quote stat:** Changed text to `94% of podcast ideas are forgotten in 48 hours.` with `<strong>94%</strong>` displayed as large accent-coloured Playfair block above the body text. Opacity bumped to 0.35.
- **Eyebrow kicker spacing:** `margin-bottom` increased from 1.2rem to 2rem for breathing room between kicker and h1.
- **Episodes section desktop shift:** `.browse-toggle-wrap` gets `margin-top: 5rem` at ≥769px, pushing the episodes section down ~80px to match hero shift.

---

## v2.30 — 2026-07-27 — Hero: word swap, pull quote, eyebrow kicker, desktop shift

### index.html
- **Word swap — "die → live → die":** `_initWordSwap(delay)` function crossfades #spHW1 "die" text to `.sp-word-live` "live" span (accent colour, italic) and back. 1.1s cubic-bezier on both opacities simultaneously. Triggers 2s after typewriter completes (both first-visit and already-seen paths). Respects `prefers-reduced-motion`. One-shot per page load.
- **Pull quote:** `.sp-pull-quote` — right-margin quote ("What if you remembered the best 1%…"), `position:absolute`, 28% opacity, accent border-right. Visible ≥900px only; hidden on mobile.
- **Eyebrow kicker:** `.sp-eyebrow-kicker` paragraph above h1 — "Turn what you hear into what you say". DM Mono, tracked, muted. Adds value signal above the fold on mobile.
- **Hero desktop shift:** `.sp-hero` gets `padding-top: 160px; align-items: flex-start` at ≥769px. Moves hero elements down ~80px visually, improves breathing room above fold.

---

## v2.29 — 2026-07-27 — Animation polish batch 1 (hero entrance, hover, theme, vault pop, shimmer, quiz lift)

### index.html
- **Card hover — outline swap:** `.nf-row` and `.ep-cat-column` card front hover changed from `box-shadow` upgrade to `outline: 1px solid rgba(255,255,255,0.12)`. Eliminates paint-on-hover repaint during flip animation. Light-mode override updated to match.
- **Episode card lift:** Added `transform: translateY(-2px)` to `.episode-card:hover`. Transition property was already declared but the rule had no translateY — dead transition.
- **Theme switch transition:** Added `background-color 150ms ease-in-out` to `body`, gated on `.theme-ready` class added after ep-preload guard lifts. Prevents FOUC on load; smooths the dark/light switch.
- **Vault button winPop:** `@keyframes masterPop` (scale 0.82→1.18→0.96→1, 0.38s spring cubic). Fires on save only, not remove. Skipped under `prefers-reduced-motion`.
- **Nav link hover lift:** Added `transform: translateY(-1px)` to `.nav-link:hover` and `:active` reset. `transform` added to transition list.
- **Nav signup shimmer:** `::before` diagonal shimmer sweep on hover (`translateX(-140%)→translateX(240%) skewX(-15deg)`, 0.55s). Lift `translateY(-1px)` added. `overflow: hidden` added to `.nav-signup-btn`.
- **Undo toast spring:** `.conv-undo-toast` transition changed from `ease` to `cubic-bezier(0.34,1.4,0.64,1)`. Travel reduced from 60px→24px. Opacity fade added (was opacity-less before).
- **Quiz option lift:** `transform: translateY(-1px)` on `.quiz-option:hover:not(:disabled)`. `:active` reset added.
- **Hero sequential entrance:** `.sp-tagline` slides in from left (`translateX(-32px)`→0) as preload guard lifts. `.sp-sub` slides from right (`translateX(28px)`→0) after typewriter completes. `.sp-search-wrap` floats up (`translateY(18px)`→0) 120ms after sub. Mode toggle pills float up 80ms after search. All gated on `prefers-reduced-motion: no-preference`. Transitions on base rules (not init classes) to ensure animation fires on class removal.
- **`cowork-default-instructions.md`:** Added hard STOP block (v1.4) requiring Claude to read engineering-standards.md, state current version, and confirm no-git-from-sandbox rule before touching any file.

## v2.28 — 2026-07-27 — Vocab backfill (15 eps → 20 words), 6 Umami events, OG image + meta tags, description copy update, timestamp patch for collection 522 (Daniel Kokotajlo × DOAC, 29 concepts)

### Changes

**episode_meta.json — vocab backfill**
- 15 episodes with 6-7 vocab words each expanded to 20 words each. Vocab generated editorially from concept content (no transcript or API call needed). Episodes covered: collections 11, 12, 13, 14, 501, 504, 510, 511, 512, 515, 516, 517, 518, 519, 520.

**index.html — 6 new Umami analytics events**
- `episode_drawer_opened` — fires in `openEpisodeDrawer()` with `{id, title}`
- `drawer_cat_filtered` — fires in `filterDrawerCat()` with `{cat}`
- `vocab_expanded` — fires on "+N more" vocab expand button click
- `corner_query_submitted` — fires in `cornerSubmit()` with `{chars}`
- `og_map_node_clicked` — fires in `window.ogActivate` with `{node}`
- `search_query` — fires in `_spShowResults()` with `{q}` (capped at 80 chars)

**index.html — OG meta tags**
- Added `og:image`, `og:image:width`, `og:image:height`, `twitter:image` meta tags pointing to `/og-image.png`
- Updated `og:description` copy: "Turn podcast ideas into concept cards you actually keep. Plain definitions, real analogies, Spark prompts to use them in conversation."

**og-image.png — new file (repo root)**
- 1200×630 PNG for social sharing previews. Dark bg (#0d0d0d), gold accent bar, "Epistemic." wordmark, tagline, 3 feature tiles (Concept Cards / Corner Mode / Quiz Mode), 5 mini concept card previews (Loss Aversion / Compounding / Status Signaling / Opportunity Cost / Imposter Syndrome), bottom bar with epistemic.live + source list. Generated with Python Pillow.

**concepts.json — timestamp patch, collection 522**
- 29 concepts (IDs 731–759, Daniel Kokotajlo × Steven Bartlett, Diary of a CEO — "No One Is Ready For What's Coming") had `timestamp: null` after extraction (context-window overflow caused Claude to default to null). Timestamps recovered by parsing the `episode_ref` field's time string for each concept. All 29 patched in one script pass, committed as v2.28.

---

## v2.26 — 2026-07-06 — OG Map perf fix (blur removed), deeper zoom, nav counter animation, extract.html CORS+data-wipe fixes, episode_meta 521, ogmap.json anti-slop

### Changes

**index.html — OG Map performance**
- `.og-spotlight-scrim`: removed `backdrop-filter: blur(3px)` and `-webkit-backdrop-filter` (was causing ~720ms INP on node click due to GPU compositing on every repaint). Replaced with `will-change: opacity` (compositor-layer promotion, near-zero paint cost). Background opacity bumped slightly from 0.80 to 0.85 to compensate for lost blur depth. Card border-radius and colored glow box-shadow are the visual anchor — no perceptible regression.
- `ogActivate`: zoom scale doubled — main/hub nodes `1.8 → 3.6`, sub-nodes `2.6 → 5.2`. Node fills the viewport on click instead of stopping at halfway.

**index.html — Nav concept counter**
- `updateHeaderCounts`: replaced instant `textContent` assignment with a two-phase count-up animation. Phase 1: ease-out cubic from 0 to `total − 5` over 1000ms (fast sweep). Phase 2: one tick per 500ms for the final 5 numbers (slow, satisfying landing). Fires on every page load/refresh.

**epistemic-tools/extract.html — bug fixes**
- `generateIntel()`: added missing `'anthropic-dangerous-direct-browser-access': 'true'` header to the Anthropic API fetch. All other API calls in the file already had it; this one was the only exception, causing a CORS preflight rejection on `tools.epistemic.live`.
- `generateIntel()` catch block: on regen failure, if `currentIntelResult` is populated (prior intel exists), the UI now restores `intelFields` and `intelSaveRow` visibility instead of leaving them hidden. Previous intel is preserved and still saveable after a failed regen.
- Library fetch for `related_ids`: switched URL from `https://epistemic.live/concepts.json` to `https://raw.githubusercontent.com/pocsgeri1/listen-learn-live/main/concepts.json`. GitHub raw is CORS-free and more reliably reachable from `tools.epistemic.live` without depending on Vercel CORS headers or CDN state.

**episode_meta.json**
- Added collection 521 (Alex Hormozi × Chris Williamson, Modern Wisdom). All six intel fields written: `summary_style: D`, Style D summary at 116 words, sharpest_line, tension, verdict_listen (3), verdict_skip (2), vocab_vault (24 terms). Data recovered from the UI state that was wiped by the CORS bug above.

**ogmap.json — anti-slop pass**
- Replaced all 94 em-dashes with colons. JSON validity confirmed post-edit. Affects `sources`, `insight`, `why`, `protocol`, `if_then`, `reflection`, and `neuro` fields throughout.

**docs/skills/** (new, not deployed — local reference files)
- `anti-slop/SKILL.md`: editorial rules for no-em-dash, banned words, banned patterns (not-X-but-Y, motivational-poster cadence, passive voice). Trigger: "apply anti-slop".
- `epistemic-session/SKILL.md`: working rules for Epistemic build sessions (response format, token discipline, stack constraints). Trigger: "epistemic mode".

---

## v2.25a — 2026-07-04 — OG Map content card rebuilt as a spotlight modal, decoupled from the SVG; intro+bullets content restructuring

### Why
First live test of v2.25 surfaced three real bugs, all traced to one root cause: the content card was an SVG `<foreignObject>` living inside `#ogMapInner`, the element the pan/zoom system applies a CSS `transform: scale()` to. That single choice caused (1) **bleed-through** — decorative map text scales up to 2.2-3.6× at zoom and ghosts through the card's translucent (93%-opaque) background; (2) **fuzzy text** — HTML nested inside a scaled SVG ancestor is laid out at normal size then raster-stretched, reading as soft/blurry; (3) **cut-off/overlapping text** — the foreignObject's fixed height ran out of room for stacked paragraphs. Gergely asked for a full proposal rather than a patch: 3 rated reveal-mechanism options (full-bleed takeover / restyled side panel-drawer / spotlight modal) were presented with a recommendation, plus a content-restructuring proposal (intro sentence + bullets vs. nested bullets) — both recommended options were approved.

### What shipped
- **Spotlight modal reveal mechanism.** New `#ogSpotlight` / `.og-spotlight-scrim` / `#ogSpotlightCard` markup lives as a sibling of `.og-map-wrap`, entirely outside both `#ogMapInner` (has the zoom transform) and `.og-map-wrap` (has `overflow-x:hidden`, which clips `position:fixed` descendants by DOM ancestry regardless of containing-block — not just a transform issue). The existing zoom-toward-node animation (`ogZoomToNode`, unchanged, v2.14c) still plays first as the "diving in" cue; once it settles, the map dims under a `blur(3px)` scrim and the solid, undistorted card fades/scales in on top. Same component collapses into a fullscreen bottom-sheet on mobile (`≤600px`) automatically, matching the "which is better on mobile" question Gergely raised — a fixed-position overlay was the answer either way, so the spotlight and drawer options converged on the same underlying mechanism; spotlight was chosen for a stronger desktop "wow" moment.
- **Content restructured as intro + bullets.** `insight`, `why`, and `protocol` now render as a lead sentence followed by a bulleted list of the remaining sentences, via a new sentence-boundary splitter (`ogSplitSentences`/`ogLeadBullets`) — chosen over an em-dash-based split after finding em-dashes used inconsistently across `ogmap.json` (sometimes a lead/detail separator, sometimes a parenthetical insertion). `neuro` stays a single compact colored tag line, `if_then` becomes one styled callout with an "If / Then" caption label (kept as one line rather than force-split into two, since one entry contains two chained if-then statements in a single string), and `reflection` stays one italicized paragraph.
- **Removed now-dead code**: `ogContentLayer()`, `ogClampBox()`, the `<g id="ogContentLayer">` SVG mount point, and the old foreignObject-oriented CSS (`.og-content-fo`, `.og-content-host`, `.og-zoom-back-btn`, `.og-uc-insight/-why/-protocol/-ifthen`) — replaced by the spotlight card CSS and new `.og-uc-lead/-bullets/-sublabel/-callout` classes. `.og-uc-title`, `.og-uc-cards/-card/-card-label`, `.og-uc-neuro`, `.og-uc-reflect`, `.og-pill-*`, and `.og-related-*` were kept as-is (internal card typography, not the container mechanism).

### Bug caught and fixed during QA (before shipping)
- The sentence splitter's regex required a terminator (`.`/`!`/`?`) to be immediately followed by whitespace or end-of-string. Two real `ogmap.json` entries (`drive.sub.purpose.activate.protocol`, `grit.sub.long_term_thinking.activate.protocol`) embed a quoted rhetorical question mid-sentence — e.g. `ask 'who else benefits if I get good at this?' → write one sentence...` — where the inner `?` is immediately followed by a closing quote, not whitespace. The original regex silently dropped the entire leading chunk of text in both cases (a real content-loss bug, not just a cosmetic one). Caught via a round-trip length check scripted against all 72 insight/why/protocol fields in the actual dataset (not just spot-checked) before shipping. Fixed by allowing an optional closing quote/apostrophe between the terminator and the required whitespace/end; re-ran the same check against all 72 fields with zero mismatches after the fix.

### Verified before shipping
Both OG Map JS blocks pass `node --check`; the full OG Map SVG (42.9KB) still parses as well-formed XML after removing the `ogContentLayer` mount point; all 24 clickable node IDs resolve 1:1 with `OG_PATH` (no orphans either direction); the spotlight markup sits confirmed outside `.og-map-wrap` in the DOM (sibling placement, not nested); the sentence-splitter round-trips cleanly against all 72 real content fields it touches.

### Notes / what to verify live
- This is a structural rebuild with no live browser preview available in this environment — worth a full click-through pass on both desktop and mobile after deploy: the scrim dimming/blur read, the spotlight card's entrance animation feel, the mobile bottom-sheet transition, and whether the fixed zoom-scale values (1.8× for main/hub nodes, 2.6× for sub-nodes — simplified from v2.25's per-card-width formula since the card no longer lives at SVG coordinates) feel right.
- Related-concept pills (`buildOgPills`) are unchanged internally, just re-hosted inside the new card — should still work identically, but worth a quick visual check now that the card sits in a fixed overlay instead of an SVG foreignObject.

## v2.25 — 2026-07-04 — OG Map hyper-zoom: "Stalk the Impossible" easter egg rebuilt as a full click-to-zoom experience

### What shipped
- **All 24 OG Map nodes are now individually clickable** (was 6): the central "Stalk the Impossible" hub, all 3 pillar nodes (Drive/Goals/Grit) plus Flow, and every sub-concept — Drive's Extrinsic/Intrinsic/Curiosity/Passion/Purpose/Autonomy/Mastery, Goals' MTP/High-Hard-Goals/Clear-Goals, Grit's Perseverance/Consistency/Resilience/Emotional-Regulation/Long-term-Thinking/Growth-Mindset, and 3 brand-new Flow sub-nodes (Challenge/Skill Balance, Clear Goals + Feedback, Rich Environment) drawn fresh since they didn't exist as visual elements before.
- **New hyper-zoom interaction**: clicking any node smoothly zooms the map in on that node and fades in a content card in-place — no side panel. Built by reusing the existing v2.14c pan/zoom transform system (the same `scale`/`ox`/`oy`/`apply()` closure that already powers wheel-zoom and drag-pan) rather than adding a second, redundant animation system — lower risk, one code path, nothing new to keep in sync.
- **New content model**: `ogmap.json` (new file, 25 entries) gives every node an "Understand" card (insight / why it matters / neurochemistry) and an "Activate" card (a concrete protocol, an if-then plan, a reflection prompt) — written for the power-user reader who clicks past the surface-level map, not the casual visitor.
- **Crown-jewel content**: the central hub ("Stalk the Impossible") and Flow's main node both got dedicated deeper content — the hub explains that the Drive→Goals→Grit→Flow loop doesn't end at Flow, it resets and re-runs with a bigger goal; Flow's card explains the 4-phase Struggle→Release→Flow→Recovery cycle and why skipping Recovery is the top burnout cause for ambitious people.
- **Related concept pills**, but only on the 6 nodes that map onto the site's existing concept-scoring categories (Drive, Goals, Grit, Flow, Intrinsic, Curiosity) — reuses the existing top-5 concept-matching + scoring logic untouched, restyled to match Corner's existing related-pill pattern (single-open-at-a-time expand, same visual language).
- Content cards render into a single `<g id="ogContentLayer">` mount point via JS-built `<foreignObject>`, clamped to always stay within the 2400×1500 map canvas regardless of which node (including edge nodes) is activated.
- Escape key, click-outside, and a "← Back to map" button all close the active card and zoom back out.

### Notes / what to verify live
- Old side-panel concept system (`ogShowConcepts`, `#ogConceptPanel`) deliberately left in place, unused — lower-risk than removing it, no visible difference to the user.
- Zoom-target scale values (2.2×–3.6×, formula-derived) and Grit's tightly-packed sub-node hit-circle sizing (kept small, +3px over the visible circle) are first-pass choices made without a live browser preview — worth a quick visual pass after this deploys to confirm nothing feels off or clips awkwardly on mobile.
- Verified before shipping: both new JS blocks pass `node --check` (no syntax errors), the full OG Map SVG parses as well-formed XML, all 24 click targets have no duplicate IDs and resolve to a complete `ogmap.json` entry, and the mobile (`≤600px`) responsive rules for the new content cards are in place.

## v2.24 — 2026-07-03 — Performance overhaul: CLS/INP fixes, card-flip + pill-hover latency, backdrop-filter/constellation tuning

### What shipped
- **`#themeToggle` nav CLS fix (was the single largest layout-shift contributor, CLS 0.2483).** `.nav-epic-standalone` was animating `max-width: 0→160px` + `padding` on nav hover, pushing the theme toggle sideways every time. Now the button keeps full padding/width always reserved and only animates `opacity` + `transform: scale()` (compositor-only) — nothing else in the nav moves. Tradeoff: a small fixed gap sits between nav-island and the theme toggle even when this button is invisible (accepted).
- **Episode drawer render chunked to fix 288-350ms INP on drawer open.** `_renderDrawerContent` built the entire card grid (every card, every category column) in one synchronous `innerHTML` pass. Extracted `_buildEpColumnHtml()` + `_finishEpDrawerRender()` and now render one category column per `requestAnimationFrame` instead of all at once. Identical final markup/behavior — filter-row build, parallax init, sort-row show, and scan reset now run once after the last column via the shared completion helper.
- **Intel-pill hover popovers were re-measuring their own size (forced layout reflow) on every single hover**, a regression from v2.20's vertical-space-aware flip fix. Now measured once at popover build time (`_popW`/`_popH` cached), reused on every hover — restores pre-v2.20 hover latency with identical flip-positioning behavior.
- **Card-flip animation sped up and de-janked.** Duration 0.62s → 0.4s with a snappier easing curve. Also decoupled the `.card-front` hover box-shadow (expensive repaint) from firing during the flip itself — hover shadow now scoped to `:not(.open)` only, since the front is already hidden via `backface-visibility` once flipped.
- **Reduced `backdrop-filter` blur cost** on two overlays: `.sp-mobile-preview-backdrop` blur(6px)→blur(3px), `.ep-intel-sheet-backdrop` blur(2px)→blur(0.5px) (already backed by a solid 0.55-alpha overlay, so the extra blur wasn't buying much).
- **Corner constellation (canvas background animation): capped to ~30fps** (was uncapped, running at full display refresh — 120fps on ProMotion Macs) via timestamp throttling, and **repositioned lower** (`topBound` 0.36→0.46, `cy` 0.64→0.74, `maxR` cap 380→340) — was overflowing into the placeholder text / search bar / submit button above it.
- **New standing rule set added**: `docs/cowork-default-instructions.md` Step 2a — default performance rules (transform/opacity-only animation, no forced-reflow reads in hot paths, chunk large DOM builds, minimal backdrop-filter, capped rAF loops, 0.3-0.45s flip transitions) for all future build sessions.

### Investigated, confirmed NOT an issue (light scan)
- **Podcast thumbnails do not render invisibly during drawer open** — the episode drawer's concept-card template has zero `<img>` tags. Episode hero background is a pure CSS radial-gradient (deterministic, seed-based, zero image requests). Theme drawer hero background does use an image but is already gated behind a preload (`new Image()`) before being applied — not a hidden cost.
- `_renderIntelRow` runs inside an async `.then()`, non-blocking relative to the main card-grid render — ruled out as an INP contributor.

### Not done this session (flagged for later, out of current scope)
- `_renderThemeDrawerContent` likely has the same synchronous-render pattern as the episode drawer and would benefit from the same chunking treatment — not touched this round to keep the diff contained.
- `.theme-card-img` (homepage theme grid) has no `loading="lazy"` — minor, free-ish win, not applied.
- Nav-island hover/emoji animations, nav height/scroll-shrink behavior, and `.nav-pill` were explicitly left untouched per Gergely's request.
- `setInterval` usage (Phase 5 item #10) explicitly left alone per Gergely's request.

## v2.23 — 2026-07-03 — OG Map nav fix, extract.html editorial tooling (counters/history/sticky rules), Spark feedback-row bug, Corner mobile fixes

### What shipped
- **OG Map panel no longer covers the site nav.** `.og-concept-panel` had a hardcoded `top:0;bottom:0` that fully overlapped the fixed nav (nav z-index 100 < panel z-index 9801). `ogShowConcepts()` now measures `nav.offsetHeight` live at panel-open time and sets `top`/`bottom:auto`/`height` inline, so it always sits correctly below the nav at whatever height it currently has (handles the 76px→62px scroll-triggered shrink).
- **`extract.html` (epistemic-tools repo): word/char counters on every editable field**, including Summary and Vocab Vault in Episode Intel. Pure rule-based JS, zero extra API tokens — three-tier status (ok/warn/over) using the existing green/amber/red CSS vars.
- **`extract.html`: version history is now real back/forward, not a one-way stack.** Replaced the old LIFO pop-only rollback with a pointer-based `{versions, pointer}` structure (Back/Forward/Restore original), so stepping back and then regenerating correctly truncates the abandoned forward branch instead of silently losing it.
- **`extract.html`: Episode Intel divider strengthened** (2px dashed, higher-contrast) — this tool's own editorial display only, does not touch the live-site drawer's dashed divider.
- **`extract.html`: new sticky rules sidebar.** Fixed-position column, sibling of `.page` (never touches the 880px content layout), only shown ≥1440px viewport. Cross-fades between the concept-editing field rules (from `concept-rewrite-prompt.md`) and the Episode Intel summary rules (from `generate-episode-intel.js`'s embedded prompt) based on scroll position, gated to only appear once results exist.
- **Spark "Did it land?" feedback row no longer appears instantly.** Root cause: `.cs-feedback-row` had an unconditional `animation: fadeIn 0.4s ease both`, which (via fill-mode `both`) overrode the `.cs-hidden` class's `opacity:0` almost immediately — so the row visually appeared ~0.4s after render regardless of the JS-driven 8-second reveal timer. Removed the redundant animation entirely; `.cs-post-prompt`'s existing `transition: opacity 0.3s ease` + the JS-toggled `cs-hidden`/`cs-visible` classes (already firing at the correct 8000ms mark) now solely control the reveal.
- **Corner submit button shrinks to the 🥊 emoji only on mobile (≤700px)**, fixing the "Corner me →" label overflowing/cramping the search bar on narrow screens. Implemented as `font-size:0` + `::after { content: '🥊' }` rather than a markup swap, because `cornerSubmit()`/`exitCornerMode()` set `submit.textContent` directly in multiple places (default label + "Finding your frame…" loading label) — a markup-based fix would get silently overwritten by that JS. Desktop (>700px) completely untouched.
- **Corner Sparring results now persist.** New `CORNER_SPARRING_KEY` localStorage store, global and keyed by concept ID (not per-save) — enforces "only 1x Sparring per term" and means Situations tab's "Revisit" automatically restores prior Sparring state for free, since `_cornerReplayHistory` → `_cornerOpenPanel` → `_cornerBuildCards` is the same render path used for fresh submissions.

### Notes
- Chronological ordering was scoped this session but explicitly deferred — see roadmap.md "Next up."
- OG Map light mode and theme thumbnails were scoped and explicitly skipped this session (low value / self-handled).
- OG Map content/schema (node inventory, sub-node structure) discussed in chat only this session — no code changed, see build-journal for the discussion summary.

## v2.22 — 2026-07-02 — GitHub Actions publish pipeline live (Make.com → GitHub Actions migration, publish step)

### What shipped
- **The "APPROVED → publish" step of the pipeline now runs through GitHub Actions instead of Make.com.** New `tools/publish-approved.js` + `.github/workflows/publish-approved.yml` (manual `workflow_dispatch` trigger — same one-click UX as the old Make.com scenario): fetches Airtable rows with `Status = APPROVED`, builds the batch payload, POSTs to the existing `/api/publish-batch` endpoint on Vercel (unchanged), writes results back to Airtable. Orchestration logic that used to live in Make.com's visual scenario (IML) now lives in a ~small, readable Node script — new Airtable fields (scores, intel data, etc.) can be added without touching Make.com at all.
- **Confirmed working end-to-end in production** on a live test episode: Airtable Status flipped to APPROVED → GitHub Action run → `/api/publish-batch` → commit to GitHub → site live → Airtable row flipped to PUBLISHED. Gergely: "Fantastic, it all worked now."
- **Fixed a 403 `INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND` error from Airtable during rollout** — the `AIRTABLE_API_KEY` GitHub secret's Personal Access Token had correct scopes and base access but still 403'd for no diagnosable reason. Fix: generated a brand-new Airtable PAT and rotated only the `AIRTABLE_API_KEY` GitHub secret to it (no code or scope changes). This is a known recurring Airtable failure mode — see build-journal.md.

### Notes
- The old Make.com "APPROVED → publish" scenario should be paused (not deleted) now that the GitHub Action replacement is confirmed working, to avoid double-triggering a publish. See `docs/pending-decisions.md`.
- This migration covers ONLY the publish step. The separate, still-inactive Make.com "Intake → `api/extract-concepts.js`" automated-extraction scenario is unrelated, was never Gergely's actual workflow (he always uses `extract.html` directly), and is untouched by this change. The Episode Intel (summary/vocab/tension) → Airtable wiring is also unrelated and remains undecided — see `docs/pending-decisions.md`.

## v2.21 — 2026-07-02 — DNA auto-populate fix + Vocab panel polish

### What shipped
- **DNA pill now auto-populates for every episode/theme going forward, no backfill required.** Root cause: DNA used to always show because it was originally computed live from the drawer's actual concept cards (the same category tally the (currently hidden) mix bar still computes) — not from `episode_meta.json`. A later backfill script started writing a precomputed `dna` object into that JSON for older episodes, but brand-new episodes (e.g. collection 520) get `dna: {}` until someone runs the backfill, so their DNA pill sat empty. Fix: `_renderIntelRow()` now accepts a live-computed fallback tally (`{category: pct}`, same math as the mix bar) from both `_renderDrawerContent` (episode) and `_renderThemeDrawerContent` (theme), and uses it whenever the backfilled `entry.dna` is missing/empty. Backfilled data still wins when present — zero behavior change for already-backfilled episodes.
- **Vocab "+N more" button restyled** — was stretching to fill the entire empty 8th grid cell (full height + width), reading as one big colored box. Now a small pill-shaped chip, vertically centered in the cell and sized to its own text.
- **Vocab inline drawer panel now spans the full drawer width.** It was inheriting a `max-width: 1040px` left over from the old floating-popover sizing, so on a wide desktop drawer it only ever filled the left portion (looked like it was capped to the category-filter-row's width, starting from the left edge). Removed the cap; the panel's word grid also switched from a fixed 4-column split to CSS `auto-fill` columns so it adapts to the drawer's actual width instead of stretching 4 columns unnaturally wide.

### Notes
- Flagged by Gergely after testing v2.20 on collection 520 (new episode, DNA showed empty) and the new Vocab panel (button too big, panel not full-width).

## v2.20 — 2026-07-02 — DNA popover off-screen fix + Vocab redesign (in-grid button + inline drawer panel)

### What shipped
- **DNA pill fixed on desktop, episode/theme drawers.** It was invisible only in the drawer context, only for episodes with many DNA categories (e.g. collections 518/519) — root cause: `showPopover()` always anchored the popover's bottom edge just above the pill with no vertical-space check, so tall DNA content computed a top edge above the viewport. Fixed by measuring the popover's real height against the space available above/below the pill and flipping it to open downward (or clamping to the viewport top) only when it doesn't fit — a no-op for Line/Tension/Vocab, whose content is always short enough to fit above.
- **Vocab "+N more" moved into the preview grid itself** — now sits in the grid's naturally-empty 8th cell (row 2, col 4) as a small button, instead of a separate full-width row below the grid.
- **Vocab "+N more" now expands an inline panel inside the drawer's own document flow** (`#epDrawerVocabPanel` / `#themeDrawerVocabPanel`, between the pills row and the category filter row) instead of growing inside the small floating hover popover — opening it visibly pushes the category filter pills and card grid down, revealing all 20-25 words. Touch devices keep the simpler behavior: the rest of the words append inline into the same grid.
- **`related_ids` empty-fetch bug fixed** (`extract.html` / `epistemic.live`) — root cause was CORS blocking the cross-origin fetch to `concepts.json`; fixed via a `vercel.json` CORS header, plus a visible warning in `extract.html` if the fetch fails for any other reason so it's never silently empty again.
- **`saveIntelToGitHub()` button feedback fixed** to match the established Airtable "sent" pattern — turns green/muted and stays disabled on a successful save (was ambiguous before), resets to clickable if intel is regenerated.

### Notes
- Didn't catch the DNA-auto-populate gap in this pass — DNA content itself (not just its positioning) was still empty for brand-new, non-backfilled episodes. Fixed in v2.21.

## v2.19 — 2026-07-02 — Theme grid legacy filter + doc accuracy fixes

### What shipped
- **`renderThemesGrid()` in `index.html` now filters out `status: 'legacy'` collections.** After the v2.18 migration, all 16 retired 101-116 theme entries stayed in `collections.json` for historical reference but were still `type: 'thematic'`, so the grid was pulling in all 22 thematic collections (16 legacy + 6 live) instead of just the 6 live ones. Drawer content and preview rendering already filtered correctly by `curated_collection_ids`, so no change needed there.
- **`architecture.md` accuracy pass:** concept count corrected (669 → 625 as of v2.18), `curated_collection_ids` description rewritten for the 201-206 system, noted the new themes have no image assets yet (emoji fallback), documented the legacy grid filter, "16 themes" references updated to "6 live themes."
- Confirmed the other files that read `collections.json` (`v170index.html`, `v172.html`, `index-legacy.html`, `index-netflix-test.html`, `map.html`) have no theme-grid rendering logic, so they're unaffected either way.

## v2.18 — 2026-07-02 — Migrate legacy concepts from 101-116 themes to 201-206

### What shipped
- **All 625 concepts migrated from the retired 16-theme system (101-116, LLM-assigned) to the new 6-theme system (201-206, deterministic by category).** Ran via new `tools/migrate-themes.js` (dry-run by default, `--apply` to write).
- **Grandfather rule** (decided with Gergely after discovering 0 of 625 legacy concepts have a `scores.composite` value): concepts with no composite score get a theme by category alone, no quality gate. Concepts with a real composite score still require ≥ 8.0, matching `publish-batch.js`'s `computeCuratedCollectionIds()`.
- Result: 100% coverage, 0 losses, 333 concepts gained a theme for the first time (previously had none under the old system). Distribution: Money & Power 136, Mind & Meaning 238, Self & Signal 63, Connection 90, Body & Evidence 35, Making & Building 63.
- Verified via backup + post-migration diff: only `curated_collection_ids` changed, no other fields touched.

## v2.17 — 2026-07-02 — Extraction prompt reconciliation + quality-drift guardrails

### What shipped
- **`concept-rewrite-prompt.md` rules ported into the live extraction prompts.** Cross-field image check and full-field anti-slop scope (was hook/plain only) added to the self-check in `extract.html`'s `EXTRACTION_PROMPT` and `REGEN_SYSTEM_PROMPT`, and in `api/extract-concepts.js`. Two new TERM rules added everywhere (prefer mechanism over category label; sparing scare-quotes on a single loaded word).
- **EPISODE INTEL section moved from mid-prompt to just before the self-check** in `extract.html`'s `EXTRACTION_PROMPT` — it was sitting between the concept field rules and the scoring rubric, diluting the concept rules right when the model needed them most.
- **`curated_collection_ids` LLM instruction removed from `api/extract-concepts.js`.** It was still telling the model to hand-pick from a 101-116 list; that's computed deterministically by the publish pipeline now, same as `extract.html` already does.
- **Quality-drift guardrails, in response to a direct risk review:** self-check reframed from "run before returning output" to "apply while drafting each concept" (continuous, not end-of-batch) in both `extract.html` and `extract-concepts.js`; added an explicit "quality over quantity" line (40 concepts is a ceiling, not a target); enabled extended thinking (`budget_tokens: 12000`, `max_tokens` 20000→32000) on `extract.html`'s main extraction call so the model has real scratch space to self-check 20-40 concepts + intel before committing final JSON — confirmed safe since response parsing already isolates the `text` content block.
- **`EXTRACTION_PROMPT_VERSION` bumped 2.1 → 2.2** with an inline changelog comment.

### Notes
- `upload.html` and `SHORT_EXTRACTION_PROMPT` deliberately left untouched (not currently in use).
- `api/extract-concepts.js`'s long-term role is still undecided (see `pending-decisions.md`, Make.com vs GitHub Actions) — got the same consistency fixes but no architectural change.
- vocab_vault: stores 20-25 entries per episode, UI still previews 5-7 by default. The 15 episodes with intel generated before the July expansion still need a rerun to backfill the larger list (see `architecture.md`).

## v2.16 — 2026-07-01 — Vocab Vault expansion + expand UI, mobile search zoom fix, Corner rate-bar bug

### What shipped
- **Vocab Vault raised from 5-7 to 20-25 words per episode.** Updated the extraction prompt in both `tools/generate-episode-intel.js` and `epistemic-tools/extract.html` (they carry separate copies of the same prompt) — added a note to draw vocab from across the full episode, not just the opening minutes.
- **Vocab drawer UI: click-to-expand for the full list.** The hover preview is untouched — still shows the first 7 words in the existing 2-row grid, same styling, same behavior as before. New: if there are more than 7 words, a "+N more" toggle appears below the preview. Clicking it smoothly expands (grid-row + opacity animation, ~0.4s) to reveal the rest in an identically-styled grid, with a dashed divider and an internal scroll cap (320px) so a 25-word list can't blow out the popover. Works in both the desktop hover popover and the mobile bottom sheet — same code path renders both.
- **Mobile search-bar auto-zoom fixed, site-wide.** Root cause: `.sp-search-input` (hero + Corner search) rendered at 15.2px, below the 16px threshold that makes iOS Safari auto-zoom on focus. Added a `@media (max-width: 768px)` rule forcing `font-size: 16px !important` on every search input on the site: hero, Corner, Spark, conversation, shorts, and episode search — several of which (`#shortsSearch`, `#episodeSearch`) had no explicit font-size at all and were relying on the browser default.
- **Corner rate bar bug fixed.** The score number ("NN/100") was always visible on all 3 result cards, but the visual bar next to it only ever animated in on card 1 — the code explicitly queried `#cornerCard0` and nothing else on panel open, and the accordion-expand fallback for the other cards queried the wrong DOM subtree (a dead code path). Now all 3 cards' bars animate in immediately when the panel opens, staggered slightly for a cascading reveal.

### Notes
- Vocab Vault regeneration for the 15 episodes that already have intel (currently capped at 5-7 words) is deferred until the Themes/foundational/shorts rethink is done — those categories are being restructured separately and re-running intel now would be wasted API spend if the schema shifts again.
- Corner's "universal / non-universal / wildcard" card-selection logic and a review of the Sparring button's behavior are deferred to the same future session as the theme drawer overhaul (see roadmap "Next up").

---

## v2.15d — 2026-07-01 — Impostor-syndrome line unified, light-mode kicker fix, $0

### What shipped
- **OG impostor-syndrome line — "almost" dropped and second bracket italicized on both breakpoints now** (previously desktop-only in v2.15c; mobile now matches). Base text is otherwise identical on mobile and desktop.
- **Desktop-only, on top of that:** "conversation" → "convo", and both parenthetical asides ("you follow the convo" / "you can't quite lead it") are now bold+italic, not just italic. Mobile brackets stay italic-only.
- **Light mode fix:** `.og-story p.og-kicker` (the section headlines — "The Podcasts Aren't Random" etc.) now uses the same light-mode color treatment as `.og-expand-label` ("The map behind the machine"): `#7a6830` at 0.72 opacity, instead of the low-contrast default accent/0.38 opacity. Dark mode unchanged.
- **Desktop-only closing line:** "Sign up for free" → "Sign up $0."

---

## v2.15c — 2026-07-01 — Desktop/mobile copy forking (Founder + OG text)

### What shipped
New utility classes `.fc-desktop-only` / `.fc-mobile-only` (plus `.founder-bullets li` / `.og-bullets li` variants) let specific lines carry genuinely different wording or line-breaks per breakpoint, instead of one string trying to serve both. `fc-mast-line`'s font-shrink hack from v2.15b is removed — superseded by this.

- **Founder Copy masturbation line** now forks: desktop — "masturbation... and a broken learning format." (ellipsis glued to "masturbation", fits on one line, no break). Mobile — "masturbation" (forced `<br>`) "...and a broken learning format." (ellipsis glued to "and").
- **Founder bullet 2** forks: desktop — "Podcast summaries — bullet points I'd skim once, forget instantly." Mobile — unchanged ("...I'd forget.").
- **OG impostor-syndrome line** forks: desktop drops "almost" and italicizes the second parenthetical (`you can't quite lead it`) so the whole sentence fits inside the left column without spilling "it)." onto the top of the right column. Mobile keeps "almost" and the non-italic second bracket (single-column layout doesn't have the column-break problem).
- **OG Spark bullet** forks: desktop drops the trailing "to it." Mobile keeps it.
- **"epistemic"** (Small Confession paragraph) now bold + italic on top of the existing accent color, on both breakpoints.
- **"Next up" separator symbols** fork: desktop keeps `〱`, mobile switches to `<` (Listen &lt; Read &lt; Write &lt; Speak &lt; Grow) since `〱` wasn't rendering on mobile. Both bold+italic.
- **Closing lines redesigned and forked:** desktop — 3 separate rows ("Stay tuned. Sign up for free. Share your feedback. (good or bad, it's helpful 🙏)" / "The next version of Epistemic, and you, is already loading." / "It's gonna be Epic."). Mobile — 2 rows (first two ideas combined into one paragraph, "It's gonna be Epic." broken out alone).

---

## v2.15b — 2026-07-01 — Copy tweaks + desktop drawer cat-filter bug fix

### What shipped
- **Founder Copy line-wrap:** dropped the forced `<br>` — desktop fits the full line naturally, no break. Mobile-only: `.fc-mast-line` font-size drops to 0.9rem so "Passive listening is just mental masturbation" still lands on row 1 without forcing a break.
- **`og-bullets`:** new list style for the OG text's 3 bullets (podcasts/Corner/Spark) — plain stacked lines (`display: block`) instead of the flex/baseline layout that was reading like a table.
- **Bullet copy updated:** "Key ideas per podcast — concept cards, vocabulary that matters, and a verdict on whether it's worth three hours of your time." / Corner / Spark, wording tightened per Gergely's edit.
- **`Listen〱Read〱Write〱Speak〱Grow`** now bold+italic (same font-size) for emphasis.
- **Map hint line rewritten:** "tap any node..." → "If you've ever read 'The Art of Impossible' you'll find this familiar | Tap any node to explore the concepts behind this."
- **"epistemic" in the Small Confession paragraph** now wrapped in `founder-accent` (on-brand gold).
- **Header weight:** `.og-expand-label` and `.og-story p.og-kicker` both bumped to `font-weight: 600` (were unset/inherited) so they read with equal visual weight.
- **Bug fix — desktop drawer "grid" (scan) view:** `.ep-drawer.drawer-scan-active .ep-drawer-cat-filter { display:none }` had no media-query guard, so switching to scan view on **desktop** hid the category pills entirely and left the 3 view buttons flush-left (they'd lost their flex:1 sibling). Wrapped that rule in `@media (max-width: 700px)` — it's a mobile-only affordance (mobile has a single cycling view button instead). Desktop cat pills now stay visible/usable in every view.
- **Bug fix — desktop drawer "All cards" view:** cat-filter pills were `pointer-events: none; opacity: 0.4` in `drawer-all-mode`, even though they're wired to scroll-to-category inside the flattened all-cards grid — so the feature was unreachable. Added a `@media (min-width: 701px)` override restoring `pointer-events: auto; opacity: 1`. Mobile behavior untouched.

---

## v2.15 — 2026-07-01 — index.html: OG text rewrite (Shazam angle) + Founder Copy line-wrap fix

### What shipped
- **`.og-story` block fully rewritten** — new 4-section structure: "The Podcasts Aren't Random" / "A Small Confession" / "Shazam for Ideas" / "The Curation Is the Product." Replaces the old "For the real ones" / Hungarian-boardroom / "moat" version.
- **Cut:** Lex Fridman mention, Dunning-Kruger example, Hungarian/boardroom/dinner-party paragraph, "on the surface / under the surface... very quiet, very confident, very dignified" triad.
- **Swapped:** Chris Williamson → Steven Bartlett in the pitch-line example.
- **Impostor syndrome line reformatted** from em-dash asides to parentheses: "It looks like intelligence (you follow the conversation), but it feels like inadequacy (you can't quite lead it)." "Second-Order Thinking" lowercased to "second-order thinking."
- **New value paragraph added** to "Right now" beat: 5 intelligence pills, 4-sentence summary, honest verdict, Corner, and Spark all named and explained in one punchy paragraph, before the "Listen, Read, Write, Speak, Grow" roadmap line.
- **Founder Copy fix:** "Passive listening is just mental masturbation... and a broken learning format." → ellipsis moved off "masturbation" and glued to "and" with `&nbsp;` so it can't wrap mid-word or dangle alone at the start of the next line.
- **`.og-story` mobile fix:** `columns: 2` had no mobile override, so the new OG text was rendering as a cramped 2-column layout on phones. Added `@media (max-width: 700px) { .og-story { columns: 1; } }`.
- **OG Map fullscreen (mobile rotate):** new expand button in `.og-zoom-bar` opens the impossible map fullscreen. On mobile (≤700px) it's rotated 90° via CSS transform with dimensions swapped (`100dvh`/`100dvw`) so the user has to turn their phone sideways to see it full-bleed — no device-orientation API needed, works even with rotation lock on. Includes a fading "turn your phone" hint, body scroll-lock, Escape-to-close, and icon swap on toggle (`ogToggleFullscreen()`).

---

## v2.15a — 2026-07-01 — Founder/OG copy polish + OG Map fullscreen reverted

### What shipped
- **Founder Copy line-wrap:** replaced the `&nbsp;`-only approach with a forced `<br>` — "Passive listening is just mental masturbation" now always closes line 1, "...and a broken learning format." always opens line 2, regardless of screen width.
- **Removed line:** "If you've ever gone 'nevermind' mid-sentence — this is for you." cut from Founder Copy.
- **Impostor syndrome line emphasis:** "looks" and "feels" now bold+italic, "you follow the conversation" now italic.
- **"Right now" paragraph converted to 3 bullets** (`➣`, matching Founder bullet style): podcasts → key ideas/vocabulary/verdict, Corner, Spark. Dropped internal "intelligence pills" terminology from user-facing copy.
- **"Next up" line rewritten:** "we'll wire it all together — Listen〱Read〱Write〱Speak〱Grow. Each one gets a new room in the house, but all interconnected, rooted in the ideas worth saying out loud."
- **"Stay tuned" closing line** switched from italic-only to bold+italic (`founder-line-bold`) for emphasis.
- **OG Map fullscreen feature fully reverted** — expand button, `.og-map-fs-hint`, all fullscreen/rotate CSS, and the `ogToggleFullscreen()` script block removed. Map is back to zoom/pan/reset only, desktop and mobile. (Shipped in v2.15, didn't hold up in testing.)

---

## v2.14b–j — 2026-07-01 — Intel pill UI polish: IWTMT popover, Vocab grid, mobile scan defaults

### What shipped
- **IWTMT popover redesign**: 50/50 two-column layout (`1fr 1fr` grid — not `50% 50%` which overflows with gap). Width +10% over v2.14g baseline (`min-width: min(1355px, 93vw)`). `max-height: calc(90vh - 76px)` — auto-sizes to content, no fixed height. Left-anchors from pill position, clamps to screen so never overflows right edge.
- **IWTMT positioning fix**: reverted "expand left" right-anchor branch — with a 1355px wide box it almost always triggered, placing the box on the wrong side. Now always left-anchors with right clamp (simple + correct).
- **Vocab "definition" sublabel removed**: `ep-intel-vocab-def-label` element removed from JS render entirely. Word + definition only, no header.
- **Vocab mobile**: `grid-template-columns: 1fr !important` on `.ep-intel-sheet .ep-intel-vocab-grid` — `!important` needed because JS sets inline `gridTemplateColumns` which beats any CSS rule without it.
- **Mobile scan default**: `drawer-scan-active` class applied immediately in `openEpisodeDrawer()` before rAF (fixes cat filter visibility race).
- **Cat filter pills hidden in scan**: `.ep-drawer.drawer-scan-active .ep-drawer-cat-filter { display: none !important }` — `!important` required to beat specificity of existing category filter rules.
- **Podcast pills**: one scrollable row on mobile (`flex-wrap: nowrap; overflow-x: auto`).
- **Intel pills spread**: `flex: 1` on pills so they fill the row evenly.
- **Dashed divider**: `.ep-pills-intel-sep` fixed — must be `display: block; height: 1px; border-top: 1px dashed` (not `border` on an inline element).
- **Cycle view button**: single `◫`/`⊟`/`⊞` cycling button injected into pills row on mobile, replacing 3 separate view buttons.
- **IWTMT popover overflow fix**: `position: fixed` popovers escape `overflow-y: auto` drawer clipping — use `bottom = window.innerHeight - pillRect.top + 10` to anchor above pill.

---

## v2.14 — 2026-06-30 — Intel pills live, map collapsible concepts, cursor off, zoom/light mode fixes

### What shipped
- **Intel pills wired**: Summary, Line, Tension, Verdict, Vocab all live with popovers. Greyed only when field is missing in episode_meta.json. Each pill type has bespoke popover layout (summary = paragraph text; line = italic Playfair quote; tension = plain phrase; verdict = listen-if/skip-if lists; vocab = word + definition rows). 15 episodes now have full intel.
- **Map — related concepts**: flat pills replaced with per-concept collapsible cards (Corner accordion pattern, `grid-template-rows 0fr→1fr`, 0.28s cubic-bezier). Each card shows term + category dot by default; expand reveals plain + analogy + "Open on map →" button. Arrow rotates on expand/close.
- **Map — zoom buttons**: now track last cursor position and zoom toward it instead of always viewport center. Scroll-wheel zoom-at-cursor was already correct.
- **Map — reset animation**: blur-in (4px, 300ms) then blur-out (600ms) during reset zoom, smooth 0.6s transition total.
- **Light mode text**: `og-expand-label` ("The map behind the machine") and `og-map-hint` ("tap any node…") get stronger color+opacity overrides in light mode — were barely visible.
- **Custom cursor**: disabled — CSS `display:none` + `return;` in `initEpCursor()`. Code fully preserved.
- **extract.html**: confirmed synced — all 4 style buttons (A/B/C/D) and regen buttons present.

---

## v2.13b/c/d — 2026-06-30 — OG section: full-width layout, broken-div fix, zoom/pan map

**Session scope:** Layout and functionality fixes for the v2.13 OG easter egg section across four patch commits.

### What shipped
- `og-section` moved outside `founder-text` column to direct child of `founder-inner`
- `grid-column: 1 / -1` spans both photo + text columns for true full-width display
- Removed all negative-margin hacks that caused left-side clipping and text disappearance
- Fixed broken div structure: extra `</div><\!-- /og-story -->`, `</div><\!-- /og-col-story -->`, `<div class="og-col-map">` tags were premature-closing `og-section`, leaving SVG map outside the toggle entirely
- Story text: `columns: 2; column-gap: 3rem` newspaper layout at full section width
- Map: wrapped SVG in `og-map-scroll` + `og-map-inner` divs for zoom/pan
- Zoom controls: `+` / `↺` / `−` buttons (`ogZoom(delta)`, reset at delta=0), mouse wheel zoom, click-drag pan, touch pinch-to-zoom + single-finger drag
- Rogue JS block (injected outside `<script>` tag, rendering as visible page text) removed and reinserted correctly
- All `\\!` bash-heredoc escape artifacts removed via binary byte scan (11 pairs fixed in final pass)
- GitHub Desktop lock file workflow documented: quit Desktop before sessions, `rm -f .git/HEAD.lock .git/index.lock` in Terminal when needed

---

## v2.13 — 2026-06-30 — OG easter egg: founder expandable section + Stalk the Impossible map

**Session scope:** Hidden expandable section beneath founder closing line. Completes "Founder section → expandable" roadmap item.

### What shipped
- Expand toggle ("The map behind the machine" ↓ arrow) added directly after "If you've ever gone 'nevermind' mid-sentence — this is for you."
- Collapsed by default; opens with smooth CSS transition
- OG story text: fine-tuned blend of `epistemic-identity-private.md` + `epistemic-identity-public.md` — playlist-as-worldview, Hungarian fluency gap, belonging infrastructure framing, moat-is-taste argument
- Inline interactive SVG map (Stalk the Impossible v9) — full V9 design, namespaced IDs (`og-*`) to prevent document conflicts
- Clickable nodes: DRIVE, GOALS, GRIT, FLOW STATE, Intrinsic, Curiosity
- Tap any node → slide-in concept panel pulls live from `/concepts.json`, scores top 5 by category + keyword match
- CSS animations: pulsing neuro dots (staggered), breathing glow halos, active dashed ring on selected node
- Mobile: concept panel slides up from bottom (78vh sheet)
- Vanilla JS only, IIFE-scoped, zero framework deps

---


## v2.12 — 2026-06-30 — Episode Intelligence Layer: intel locked (eps 504/515/516/11/501), Style D, extract.html intel panel

**Session scope:** Episode Intelligence Layer Phase 2. All intel fields generated and locked for 5 episodes. Style D invented and documented. `extract.html` (epistemic-tools repo) updated with full Episode Intel panel. `pending-decisions.md` created.

### episodes locked
- 504 (Style C), 515 (Style C), 516 (Style C), 11 (Style A), 501 (Style C — rewritten from A to remove banned "not X but Y" pattern and 2-colon violation)

### New style: Style D — "The Skeptic"
- Added to `docs/summary-style-guide.md` (v1.1 → v1.2): when to use, full spec, worked example (Ep 519 Arthur Brooks)
- Added to `tools/generate-episode-intel.js` SYSTEM_PROMPT with all 4 worked examples
- UI label: "Surprise Me" — "Style B" renamed to "One Premise" on buttons
- Style picker in prompt updated: "Styles A and B are most common. Do not default to C."

### extract.html — Episode Intel panel (epistemic-tools repo)
- Style picker row: Auto / A — Opinionated Friend / B — One Premise / C — The Long Zoom / D — Surprise Me
- Generate, Regenerate, Save to episode_meta.json buttons
- `INTEL_SYSTEM_PROMPT` constant with full 4-style guide + worked examples
- `generateIntel()`, `renderIntelFields()`, `saveIntelToGitHub()`, `showIntelSection()` functions
- Panel auto-reveals after successful Airtable send (`sendAllToAirtable`)

### New files
- `docs/pending-decisions.md` — Make.com vs GitHub Actions decision with context, pros/cons, recommended next steps

---

## v2.11 — 2026-06-28 — Episode Intelligence Layer: DNA + style guide + extraction prompt v1.9

**Session scope:** Episode Intelligence Layer Phase 1. New `episode_meta.json`. DNA pill live. Summary style guide locked. Extraction prompt v1.9 written.

### New files
- `episode_meta.json` — 46 entries (30 episodes + 16 themes). DNA computed from concepts.json for all. All intel fields null pending extraction pipeline.
- `docs/summary-style-guide.md` — locked style guide for episode summary field. Voice, format, bans, worked example.
- `docs/extraction-prompt-v1_9.txt` — extends v1.8 with episode_intel output block (summary, sharpest_line, tension, verdict_listen, verdict_skip, vocab_vault). Output schema changed to `{episode_intel, concepts}`.

### index.html
- Intel pill row injected into `ep-drawer-pills` (date/listen row). Desktop inline, mobile wraps to new line via flex separator.
- DNA pill: hover popover with category/bar/% sorted high to low. Tap-toggle on mobile.
- Future pills (Summary, Line, Tension, Verdict, Vocab) greyed out as placeholders.
- `EPISODE_META` fetch + cache. Both episode and theme drawers wired.

---

## v2.9 — 2026-06-28 — index.html: Corner Mode bug fixes + Cowork workflow established

### New file: episode_meta.json
- Scaffolded for all 30 existing episodes (collection_ids 1–519 where concepts exist)
- `dna` field computed from `concepts.json` — category % distribution per episode, sorted highest to lowest
- All other fields (`summary`, `sharpest_line`, `tension`, `verdict_listen`, `verdict_skip`, `vocab_vault`) null — ready for extraction pipeline

### index.html — Episode Intel pill row
- New `ep-intel-row` div inserted between `ep-drawer-mix` and `ep-drawer-filter-row` in both episode and theme drawers
- `DNA` pill: live, styled (DM Mono, 10px uppercase, ghost border). Shows category breakdown on hover (desktop) / tap (mobile)
- DNA popover: floats above pill row, no layout shift. Shows category name + coloured 3px bar + % — sorted highest to lowest. Categories at 0% omitted
- Future pills (`Summary`, `Line`, `Tension`, `Verdict`, `Vocab`) rendered greyed out (`opacity: 0.28`, pointer-events none) — placeholder until data exists
- `EPISODE_META` fetch + cache added (fetches once, reused across all drawer opens)
- Intel row cleared on each drawer re-open (no stale state)
- Full light-mode + mobile support
- Theme drawer wired identically to episode drawer (theme `collection_id` lookup)

---

## v2.9 — 2026-06-28 — index.html: Corner Mode bug fixes + Cowork workflow established

**Session scope:** Three Corner Mode fixes. GitHub Desktop + Cowork auto-commit workflow set up. Identity documents created. No new features.

### Corner Mode fixes
- **Ding ding SFX** — `_cornerDingSFX()` added: two metallic triangle-oscillator bell tones (820Hz + 1640Hz harmonic), 0.38s apart, fired at top of `cornerSubmit()`. Boxing bell on every "Corner me →" submit. Reuses `_cornerAudioCtx`.
- **Hero text restore on exit** — `exitCornerMode()` now forces a reflow tick (`void document.body.offsetHeight`) immediately after `classList.remove('corner-mode')` so CSS transitions read the new state cleanly before firing. Also resets `transitionDelay` on `spCornerTagline` so the 260ms entry delay doesn't trap the fade-out on exit.
- **Corner panel header layout** — both `_cornerOpenPanel()` and `openCornerHistory()` now use `conv-header` wrapping `conv-panel-tabs` (left, `flex:1`) + `conv-close` button (right). Identical structure to Spark panel. Previously used `stories-header` (X left, no flex) + loose `conv-panel-tabs` below — tabs took up half the panel height.

### Infrastructure
- `.gitignore` added to repo root — suppresses `.DS_Store` and editor temp files permanently.
- Cowork auto-commit workflow live: Claude edits files + commits via bash; Gergely clicks Push origin in GitHub Desktop.

---

## v2.10 — 2026-06-28 — Pipeline: extraction prompt v1.8/v1.8.1, cache fix, concept rewrites (collection 519)

**Session scope:** Editorial and pipeline session. No frontend version changes. Extraction prompt overhauled, cache bug fixed, 31 concepts rewritten, new style guides and tools created.

### Extraction prompt v1.8 — simplification pass
Root cause of live failures (31 concepts from collection 519): prompt had grown to 15–20 rules per field through v1.4–v1.7 accretion. Symptoms: hooks with 2 clauses continuing the same idea, plains averaging 60–75 words, em-dashes in every plain, all analogies opening with "It's like…"

- Each field compressed to max 8 rules
- Em-dash ban moved from self-check to `❌ NO EM-DASHES` header at top of each field — visible at write time, not audit time
- "It's like" ban added to analogy section AND self-check item 4
- Self-check trimmed from 11 items to 5 highest-signal checks
- Removed: hook pattern menu, voice-blend weighting table, generation sequence, repeat-back gate, bracketed-example rule

### Extraction prompt v1.8.1 — analogy rules tightened
After live-testing: analogies still bloated (3–4 sentences with explanatory tails). Also found v1.7→v1.8 migration had silently dropped three analogy rules.

- Analogy: 25-word hard ceiling, 1-sentence preference, no-explanation-after-image rule
- Analogy: restored "concrete/vivid/specific/picturable", "vary opener per batch", "famous people/objects/places encouraged"
- Plain: new rule 8 — never use metaphor/image in plain (belongs in analogy)
- Self-check item 4 upgraded: checks opener + word count + explanation sentence in one step
- Applied across: `extract-concepts.js`, all 3 prompt strings in `extract.html` (EXTRACTION_PROMPT, SHORT_EXTRACTION_PROMPT, REGEN_SYSTEM_PROMPT), `extraction-prompt-v1_8.txt`
- `feynman-batch.js` not modified (separate job)

### Bug fix — concepts.json cache not invalidating after publish
`fetch('./concepts.json')` with no cache param worked fine when file only ever grew. After deleting ~42 concepts then publishing 31 new ones, CDN served the old cached version — drawer showed 0 concepts for collection 519. Fix: `?v=' + Date.now()` appended to both `concepts.json` and `collections.json` fetches in `index.html`.

### Concept rewrites — collection 519 (31 concepts, IDs 639–669)
All 31 concepts extracted before v1.8 rewritten field-by-field against v1.8 rules. Batch workflow: 5 per batch, PASS/REWRITE diagnosis per field, approval, running JSON log, single merge to `concepts.json`. Fields changed: hook, plain, analogy across all 31. Terms and prompts largely preserved. Key fixes: em-dashes removed, "It's like" openers rewritten (content kept, opener only changed), plains trimmed to ≤55 words.

### New files
- `analogy-style-guide.md` — same format as hook/plain/term guides. Full rules, good/bad examples, self-check.
- `prompt-style-guide.md` — same format. All 5 prompt types (A–E) with examples, hard rules, self-check.
- `concept-rewrite-prompt.md` — reusable prompt for rewriting individual live concepts in a fresh chat. Contains all v1.8 field rules + self-check + commit format.

---

## v2.6 → v2.8f — 2026-06-27 — index.html + cs-generate.js: Corner Mode, Panel B (Story), Sparring

**Session scope:** Two major feature arcs built and refined across ~20 sub-versions. Panel B (Story Mode) fully built then deliberately hidden pending a stronger interactive mechanic. Corner Mode built from scratch as the primary new user-facing feature. cs-generate.js extended with two new API branches.

---

### Panel B — Story Mode (v2.6, now hidden)

- New `storiesOverlay` / `storiesPanel` DOM — fully independent of `convPanel`, z-index 1200.
- State machine: Entry (4 scenario pills) → Loading (rotating messages) → Story (Playfair body + inline gold term chips) → Term Peek (float card) → Outro (Spark CTA + Save + Another).
- My Stories tab with `localStorage` ring buffer (`lll_stories_v1`, max 20). Replay loads instantly.
- Locked seeds 1–2 (`SP_STORY_SEEDS`) both active (concepts 332/394/402, 419/547/480).
- Story mode hidden in v2.7 (nav button `display:none`, scenario pills `display:none`, `openStoriesPanel()` stub) — code preserved, not deleted.
- Scenario pills on hero section hidden at same time.

---

### Corner Mode (v2.7 → v2.8f)

**Concept:** User types a real situation. Epistemic matches 1–3 curated concepts, returns personalised coaching (Why this fits / To frame it well / Watch out for) + a practical opener tip. All within Corner — no Spark panel mixing.

**Hero mode toggle:**
- `[ 🔍 Explore ]  [ 🥊 Corner ]` pills replace scenario pills below hero search bar.
- Clicking Corner fires `enterCornerMode()` — nav island fades (logo stays), headline slides up as one block, sub-tagline slides down, content below pushes off-screen, search bar zooms to 42% viewport height, Corner tagline fades in.
- Body gets `overflow:hidden` (scroll lock). `body::before` / `body::after` hairlines fade out.
- SFX: Web Audio API — 78Hz + 156Hz + 234Hz resonant chord, 1.1s decay on enter; 155Hz exit tone.
- `exitCornerMode()` reverses all transitions.
- Corner pill hover: `cornerPillVibrate` keyframe shake + 55Hz sub-bass ping on mouseenter.
- **Two completely separate search bars:** `spSearchWrap` (Explore, SVG magnifier, concept dropdown) and `spCornerSearchWrap` (Corner, 🥊 icon, `spCornerInput`, `spCornerPhOverlay`, "Corner me →" button). Zero shared state between them.
- Corner placeholders: 5 situational prompts, italic, crossfade cycling. No bleed with Explore placeholders.
- 8 random Corner tagline variants (`CORNER_TAGLINES[]`, random on each enter).
- Corner input: `caretColor: transparent` until first keypress (no blinking cursor while placeholders show).

**Corner panel (repurposed Panel B):**
- Header: `🥊 Corner` label (hidden), two tabs using `conv-panel-tab` CSS (identical to Spark): `🥊 Corner` (results) + `🎪 Situations` (history).
- Panel background: `#1a1a1a` dark grey (distinct from Spark `#141414` and Stories `#111009`). Light mode: `#f2ece0` warm cream, cards `#e8dfd0`.
- Situation echo + curation line (`↳ Matched against N human-curated concepts`, live count).
- **Brief cards:** all accordion (summary row always visible). Card 0 pre-expanded (`data-expanded="true"`). Summary shows: category dot + term + fit score bar + arrow. Detail shows: curated chip (6 random variations) + term (hover → preview card) + 3 coaching blocks + ⚡ Sparring button.
- Fit score bar animates `0% → score%` on card open.
- Panel sequential fade-in: overlay bg → panel slide → situation block (380ms) → body (600ms) → cards stagger (500ms+, 350–380ms apart).
- Auto-saved to `lll_corner_saves_v1` (max 30) on every result.

**Sparring (v2.8e):**
- `⚡ Sparring` button per card replaces "Corner Spark" (which mixed Spark+Corner state machines — removed).
- Single `mode: 'sparring'` API call to `cs-generate.js` returning `{ anotherAngle, counterPerspective, oneLiner }`.
- Renders inline below card, toggleable. No panel switching.

**Neural network constellation (loading animation):**
- `requestAnimationFrame` canvas: hub + 3 rings (7/12/16 nodes in v2.8d, 8/14/18/22 in v2.8e).
- Hub positioned below search bar bottom + 60px (no text overlap).
- Rings scale to available viewport height. Each node has independent X/Y drift speed/direction.
- Cross-ring random spark (ring2→ring4). Hub has radial gradient glow.
- Canvas `z-index:1`; text elements `z-index:2` (no overlap).
- Fades in on submit, fades out when results arrive.

**Corner History (Situations tab):**
- `openCornerHistory()` opens unified Corner panel with Situations tab pre-selected.
- Shows date, situation quote, matched concept terms, Revisit button.
- `_cornerReplayHistory(idx)` reloads full result into Results tab.

**cs-generate.js — two new modes:**
- `mode: 'situation'`: picks 1–3 concepts from candidate list only (no hallucination guard), returns `{ concepts: [{conceptId, fitScore, isWildcard, whyThisFits, toFrameItWell, watchOutFor}], opener }`. Wildcard concept instruction included. Human-voice coaching prompt.
- `mode: 'sparring'`: single concept + situation → `{ anotherAngle, counterPerspective, oneLiner }`. Concise 500-token call.

**Fuse.js pre-filter (client-side, zero API cost):**
- Runs against `plain` (2x weight), `hook` (1.5x), `term` (1x).
- Top 12 Fuse results + 4 editors_pick wildcards from under-represented categories = 15 candidates to API.

---

### Other changes this session

- **Spark Copy + New Concept buttons:** stripped of gold fill. Now `transparent` bg, `rgba(255,255,255,0.22)` border, hover gold. Mobile stays row layout (was stacking vertically).
- **Corner pill vibration on hover:** `cornerPillVibrate` CSS keyframe (±2px X, 0.38s) + 55Hz sub-bass ping. Only fires in Explore mode.
- **Hero spacing:** `sp-hero` padding-bottom `3.5rem` (was `2rem`). Browse toggle wrap `margin-top: 1.5rem`.
- **Mode pills:** 20% larger (`0.78rem`, `9px 20px` padding), `1.6rem` top margin.
- **Headline animation:** `.sp-tagline` now transitions as a single block (`translateY(-40px) + opacity:0`) on Corner enter — no per-word stagger, no reflow from `<br>`. Sub-tagline slides down (`translateY(30px)`). Star Wars–style wipe.
- **Stray `-->`** text node (orphaned comment close, line 7575) deleted.
- **`body::before/after` hidden in corner mode** so hairlines don't show when nav fades.
- **Corner nav button:** `🥊 Corner` in desktop nav + mobile hamburger. Hover reveals 🥊 emoji (same pattern as Spark).
- **Nav Corner → opens unified Corner panel** (same panel as results, Situations tab pre-selected).
- **Light mode:** Corner mode pills darker border/text. History entries have visible dividers + readable timestamps. Revisit + Sparring buttons visible with distinct border/bg.

---

## v2.5 → v2.5j — 2026-06-25 — index.html + cs-generate.js: Spark panel rebuild, unified entry, coaching redesign

**Session scope:** Full rebuild of the Spark (CS) panel. Killed scenario system. New panel architecture: search bar, typewriter prompt, block-by-block coaching animation. History and Stash redesigned. cs-generate.js fixed. Stories panel deferred to v2.6.

### Nav bar — 3 items (Browse · Spark · Story)
- Replaced 4-item nav (Spark · Library · Collection) with Browse 🎬 · Spark 💬 · Story 📖
- Desktop hover reveals emoji (same animation as existing). Story is stubbed → `openStoriesPanel()` placeholder for v2.6.
- Mobile hamburger updated to match.

### Spark panel — unified entry (`openSparkPanel`)
- `openSparkPanel(conceptId?)` replaces `openCSFromNav()` + `_csOpenPanel()` + card-level `openCS()`. Single entry point, no auto-fire, no scenario.
- On `conceptId` provided: renders concept, calls `_csRestoreOrLoad()` — shows cached prompt+coaching instantly if available, else shows Generate button.
- On no arg + no prior concept: picks random from editors_picks pool.
- `openCSFromNav`, `_csOpenPanel`, `_csClosePanel` kept as aliases to avoid any stray call-site crashes.

### Scenario system killed
- Removed: `CS_OPENERS`, `_csCtx`, `_csCat` (kept as dummies for story mode compat), `_csPickerHideMain/ShowMain`, `_csPickerBuildCatRow`, `_csPickerLoad`, `_csPickerToggle`, `_csPickerGenerate`, `_csPickerShowResult`, `_csPickerCommit`, `_csPickerMore`, `_csPickerCtxButtons`, `_csPickerSetCtx`, `_csSwapConcept` picker logic, `_csToggleTopicReveal`, `_csToggleScenarioReveal`, `_csToggleRelatedReveal`, `_csConnectsChipClick`, `_csUpdateScenarioBadges`, `_buildCsCatRow`, `_csClosePicker`.
- Removed from DOM: `csRevealRow`, `csCatSection`, `csScenarioSection`, `csRelatedSection`, `csTopicPickerWrap`, `csPickerStoryBtn`, `csConnectsChip`, `csSkeleton`, `csOpener`, `csDate`, `csBackToStoryBtn`, `csSurpriseBtn`.
- `_csSwapConcept(id)` kept as minimal stub for story mode term pills.
- `spScenarioPill(el, scenario)` rewritten: opens Spark panel with seed concept (no story mode until v2.6).

### Panel search bar
- New `sparkSearchWrap` at top of panel — bordered box, ✦ icon, italic DM Sans placeholder — distinct from hero search.
- Reuses existing `FUSE` instance (bug: was called `FUSE_INSTANCE` — fixed to `FUSE`).
- Results: category-colour dot + term (DM Mono caps) + hook (DM Sans italic), 7 results max.
- Term-first result ordering: exact match → startsWith → includes → Fuse score.
- Outside click and Escape dismiss.

### Concept display — term only, no expand
- Killed expandable pill. Replaced with eyebrow label ("An epic idea to discuss" / "From [podcast]") + large Playfair bold term.
- Desktop hover on term → side preview card (term + hook + plain only, `panelMode:true`). Preview positioned via fixed viewport coords — no `scrollY` offset (was causing bottom-of-screen bug).
- Hover wired via DOM clone on every `_renderCSShell` call — eliminates stale listener accumulation.

### Generate flow
- Button: gold filled pill, label "✦ Spark". No auto-fire ever.
- On click: button spins (CSS `sparkSpin` keyframe on ✦). Loading messages rotate below button (10 fun messages, 3.2s interval, fade in/out). Label → "Sparking…".
- On API response: loading messages stop, prompt block reveals.
- Prompt block: `display:none` until first generate or restore. Italic Playfair, gold top border.
- Typewriter: character-by-character at 18–32ms/char. Fires only on fresh generate.
- Coaching: appears after typewriter finishes. Each block (opener + pitfall) fades+slides in (140ms + 160ms stagger). On restore: prompt fades in (0.45s), coaching follows 500ms later (instant, no typewriter).

### Coaching design
- Container: `background: var(--surface2)`, 10px border-radius, distinct from the italic prompt above.
- Opener label ("A natural way to say it:" / "Or try") sits ABOVE the gold left-border quote line as a sibling div — same pattern as "Watch out for:" above the red line.
- All bordered lines (gold + red) are italic DM Sans 0.84rem — consistent.
- "You could say:" label removed.

### Casino roll — New concept
- "↺ New concept" button: collapses prompt + coaching with 0.18s fade, then 220ms later fires 12-term casino roll with speed curve (60→200ms intervals). Lands on random concept.
- `_csSurprise()` kept as alias.

### History tab
- Now logs every concept viewed in `_renderCSShell` (not just sparked ones) via `_csLogHistory()`.
- `_csLogHistoryWithPrompt()` updates existing entry with promptText when sparked — no duplicate.
- Layout: term left (`flex:1`, truncates with ellipsis), category pill + timestamp right-aligned together in `.conv-hist-meta-right`.
- "Start talking about it" → compact "✦ Spark" pill (`hist-spark-btn`). `_convOpenCSById(id)` now calls `openSparkPanel(id)` which triggers `_csRestoreOrLoad` — prompt + coaching restore correctly.

### Stash tab
- 4-scenario tabs removed. Single universal prompt view.
- Opener structure matches coaching panel exactly: label above, gold left-border line.
- Watch out: label above, red left-border line (italic DM Sans).
- "Generate conversation starters →" → "✦ Spark" pill. "Spark again" removed.
- Copy button added to entry actions. `_convCopyEntry(id)` copies prompt + term + attribution.
- Stash entries: hover-lift (`translateY(-1px)` + gold tint + shadow).

### Tab animation
- `panelSwitchTab`: entering section slides in with `translateY(10px → 0)` + opacity fade (0.45s ease). Outgoing fades in 0.18s.
- Stash + history entries stagger in via `panelItemIn` keyframe.

### cs-generate.js fix
- **Root cause of all 500 errors:** model was `claude-sonnet-4-5` — this model ID no longer valid. Fixed to `claude-sonnet-4-6`. All other API files were already on the correct model; `cs-generate.js` was missed.
- Added `universal` ctx branch (rotating tone styles, server-side variety). Legacy `friend` ctx still works for backwards compat.
- Frontend sends `ctx: 'friend'` — works with both old and new server file.

### CSS bug fix (v2.5j)
- Stray orphaned CSS block (bare property declarations with no selector) between `.cs-opener-line` and `.cs-pitfall` was causing browser to misparse `.cs-pitfall` — losing italic and correct font. Removed.

### Headline
- "Say something" normal Playfair, " *epic.*" italic gold via `.spark-headline-accent`. Matches hero copy pattern.

### Panel B (Stories) — deferred to v2.6
- Stories tab removed from Spark panel tabs (was added in v1.96).
- `openStoriesPanel()` is a stub — opens Spark as placeholder.
- Full Panel B architecture designed and documented in roadmap.md.

---



**File rename note:** `spark.html` is now `index.html`. `spark.html` is retired. The old `index.html` (legacy v172 base) has been archived as `index-legacy.html`. All future sessions work in `index.html`. See architecture.md "Files of record" for the updated table.

---

### spark.html promoted to index.html (v2.4f)

- `spark.html` renamed to `index.html` on GitHub. Vercel now serves it at `epistemic.live/`.
- Old `index.html` (v172 legacy UI, ~10,000 lines, pre-spark) archived as `index-legacy.html`.
- `vercel.json` updated: redirect `/spark` → `/` (301 permanent) so any bookmarks or external links to `/spark` continue to work.
- Added canonical and Open Graph/Twitter meta tags to `<head>` (previously absent entirely):
  - `<link rel="canonical" href="https://epistemic.live/" />`
  - `<meta name="description" ...>`, `og:type`, `og:url`, `og:title`, `og:description`
  - `twitter:card`, `twitter:title`, `twitter:description`
  - `og:image` and `twitter:image` intentionally omitted until `/og-image.png` is added to repo root.

---

### Founder section: scroll-reveal animations (v2.4)

- Added `.founder-reveal` class to every child element inside `.founder-text` (label, heading, each `<p>`, bullet list, image blocks).
- `initScrollReveal('.founder-reveal', founderText)` called post-render — reuses existing `IntersectionObserver` + stagger-delay pattern from cards/episodes. Reduced-motion safe.

---

### Founder copy update (v2.4 → v2.4b)

- Heading stays: "The *sentence* I kept losing."
- New copy throughout. Key changes:
  - Mid-sentence quote now italic: *'it's like… ugh, nevermind.'*
  - `nevermind` in mid-sentence quote → gold accent (`<span class="founder-accent">`).
  - Podcast summaries bullet shortened: "bullet points I'd forget."
  - "Passive listening is just mental masturbation..." — own `<p>`, `founder-line-bold` class.
  - "But along the way…" — rewritten, cheat-sheet reference removed, ends "stumbling on their words too."
  - "So I built the tool I wished existed." — own `<p>`, `founder-line-bold`.
  - "Epistemic isn't trying…" — `.founder-italic-body` (body size, italic, gold on "Epistemic" word only).
  - Final `nevermind` — italic only, no gold.
- New CSS classes: `.founder-line-bold` (italic + weight 700 + 1.08rem, identical sizing to `.founder-line-emphasis`), `.founder-italic-body` (italic only, inherits body size), `.founder-accent` (gold + weight 500).
- "By the next morning, 90% of it was gone…" moved to `.founder-line-bold` (v2.4b) so all three emphasis lines are visually identical.

---

### Light mode: thicker founder-label border (v2.4)

- `[data-theme="light"] .founder-label { border-color: rgba(180,140,60,0.55); border-width: 2px; }`

---

### Library view toggle: ◫ / ⊞ pair (v2.4 → v2.4a)

- Replaced the single `◫` scan toggle button in the sort pills row with a `◫` / `⊞` side-by-side pair inside `.sp-view-pair` (right-aligned via `margin-left:auto`).
- Both buttons use existing `.sp-scan-toggle` CSS styling; `◫` starts `.active`.
- Old IDs: `spScanToggle`. New IDs: `spViewGrid` / `spViewScan`.
- `spSetScanMode(bool)` function added — drives both buttons and the scan grid; `spToggleScan()` now calls it. Reset path also updated to reference new IDs.
- A separate mobile-only toggle row placed below `catGrid` was added in v2.4 then removed in v2.4a (placed in wrong location); the sort-row pair is the final state.

---

### Mobile hamburger: double-divider fix (v2.4)

- Root cause: `.nav-mobile-link` has `border-bottom: 1px solid var(--border)` AND a `.nav-mobile-divider` element immediately below it = two visible lines.
- Fix: `.nav-mobile-no-border` class added to "I feel epic!" and "📌 Collection" buttons; `border-bottom: none !important` applied.

---

### Mobile library: rule and spacing cleanup (v2.4)

- `.nf-section-rule` (horizontal line after category name + count) hidden on ≤700px via `@media`.
- `.nf-section` top-padding reduced to `1rem` and `.nf-section-header` bottom-padding to `0.5rem` on mobile — eliminates excessive spacing between category label and cards.

---

### Editorial hairlines: removed "IDEAS WORTH SAYING OUT LOUD" label (v2.4c)

- Removed `<text>` top-label node from both dark-mode (`body::before`) and light-mode (`body::after`) SVG data URLs.
- Retained: margin rules, corner ornaments, VOL. I / EPISTEMIC logotype bottom-right. Retained: all other hairlines.
- Reason: duplicated the "Ideas worth saying out loud" text already present as `.nav-eyebrow` below the Epistemic logo in the nav.

---

### Podcast section: all pills always visible + "Show less" (v2.4c)

- Podcast pills row now always shows all pills regardless of `_podcastPillsExpanded` state (previously capped at 3 by default).
- Episode rows still default to top 3 expanded; `hasHidden` / `_podcastPillsExpanded` logic unchanged for rows.
- "Show less podcasts ↑" button rendered below rows when expanded and `allOrderedNames.length > 3` — collapses back to 3 rows on click.
- `setEpisodePodcast()` updated: clicking a "hidden" podcast pill (one whose row is not expanded) auto-expands rows, same as before.

---

### Founder images: desktop repositioning (v2.4c → v2.4e)

- `padding-top: 80px` added to `.founder-photo-montage` to push cluster toward vertical center of text column.
- `fpm-main` `top: 0` → `60px`; `fpm-notes2` `top: 330px` → `390px`; `fpm-gym` `top: 290px` → `350px` (v2.4e).
- Corresponding caption chips shifted +60px: `fpm-tag-main` `top: 265px` → `325px`; `fpm-tag-notes2` `top: 496px` → `556px`; `fpm-tag-gym` `top: 604px` → `664px`.
- Montage container height expanded: `660px` → `740px`.
- `fpm-notes` (top-right screenshot) and its caption unchanged.
- Desktop only — mobile layout uses separate `.founder-mobile-notes` / `.founder-mobile-gym` flow, untouched.

---

## v2.1 → v2.3i — 2026-06-21/23 — spark.html: UI overhaul, founder section, mobile fixes, podcast/library UX

**Version track note:** spark.html was at v1.99m. This session unified the two diverging version tracks (UI at v1.9x, editorial at v2.0x) into a single sequential line. spark.html resumes at **v2.1**, not v1.93 as originally labelled mid-session. Sub-versions within the session as tracked by Gergely: v2.1, v2.1a–b, v2.1c, v2.2, v2.3, v2.3b–v2.3i.

---

### Browse Episodes / By Themes toggle (iterated twice)

**v2.1:** Restyled as left-aligned Playfair Display italic labels matching "The Library" header (divider, gold animated underline `::after` on active label). Replaced the old centred underline-tab approach with a pure-CSS animated underline (width 0→100% on `.active`). Circular arc-swap JS keyframe animation attempted first, then replaced by plain scale+opacity CSS transition in v2.1a (the arc was visually unreliable), then replaced again in v2.1c with the final reliable pattern: scale(0.94)/opacity dim when inactive, scale(1)/opacity 1+italic when active — 0.3s cubic overshoot easing.

**v2.1c:** Reverted back to Playfair italic (user didn't like the DM Mono pill style introduced mid-session as an interim). Final state: Playfair Display, 1.8rem, italic when active, gold animated underline `::after`. `app-title` bumped to `2rem` to optically match the toggle's italic labels at the same numeric size.

---

### Dark-mode editorial hairlines

**v2.1:** `body::before` SVG added — margin rules, corner ornaments ("VOL. I" issue stamp, "IDEAS WORTH SAYING OUT LOUD" masthead label). No diagonal EPISTEMIC watermark (by design). Recolored for dark surface with gold hairlines. Hidden on mobile (≤768px via `@media`).

**v2.1 → v2.1b:** Brain constellation canvas (`<canvas id="epBrainCanvas">`) added (dark mode only, RAF loop, ~50 points in a brain-silhouette mask, pulse animations). Disabled in v2.1a due to performance issues (uncapped 60fps + `createRadialGradient()` per frame). Removed entirely in v2.1b — feature pulled, no trace left in the file.

---

### Scenario pill stuck-active bug (Phase 4 — fixed for real in v2.1c)

v2.1 patched `closeCS()` (the X button path). Outside-click and Escape routed through `closeConversations()` — a separate function never patched. Both functions now clear `.sp-pill.active` on close.

---

### Browse/Themes content alignment (v2.1c)

`themes-filter-row` and `themes-grid` max-width/padding brought to match `ep-podcast-pills-row` so swapping between views doesn't shift content left/right.

---

### Scroll-reveal (v2.2)

- `initScrollReveal(selector, container)` — reusable helper using IntersectionObserver. Stagger: `Math.min(idx, 8) × 40ms` inline `transition-delay`. Cards fade + `translateY(12px)` as they enter. Reduced-motion safe. Called from `buildGrid()` (`.concept-card`) and `buildEpisodes()` (`.episode-card`).

---

### Filter memory — localStorage (v2.2)

- `lll_theme_filter` — last selected theme category. Restored into `_themeActiveFilterCat` on load; pill row reflects persisted state on first render (was always showing "All" active, regardless of actual state).
- `lll_podcast_filter` — last selected podcast. Restored on load; falls back to `'Modern Wisdom'` (mobile) or `'all'` (desktop) if the saved podcast isn't in the data.

---

### Empty-state illustration system (v2.2)

`_emptyStateHTML(message)` — shared helper returning a small inline SVG (two unconnected dots + a faint dotted line between them — "an idea that hasn't connected yet"). Applied to every empty state across the site: hero search, library grid (all 3 render paths), episodes search, shorts filter (had no empty state at all before), stash search (was incorrectly showing "nothing saved yet" even when the user had saved items but a search matched nothing).

---

### Global hero search (v2.2)

Extended `_spShowResults()` to search episodes and podcast/guest names in addition to concepts. Results grouped under "Concepts" / "Episodes" section labels in the existing dropdown. Episode results show thumbnail, title, podcast name, concept count. Clicking an episode result calls `_spHideDropdown()` + `openEpisodeDrawer(id)`. Keyboard nav updated to include `.sp-drop-ep-item`. New CSS: `.sp-drop-section-label`, `.sp-drop-ep-item`, `.sp-drop-ep-thumb`, `.sp-drop-ep-title`, `.sp-drop-ep-meta`.

---

### Podcast pills — show-more pattern (v2.2 → v2.3i)

Default: first 3 podcasts visible (Modern Wisdom first by priority, then remaining by episode count desc). "Show all podcasts ↓" button appears below the episode rows when more exist — same `.themes-show-all` CSS. Clicking reveals remaining podcasts with a smooth `epGroupSlideIn` keyframe animation (staggered 80ms per group). `window._podcastPillsExpanded` state; `setEpisodePodcast()` auto-expands if user selects a hidden podcast (e.g. restored from localStorage). Took three iterations to correctly fix: v2.2 (pills capped but visiblePodcasts still showed all rows), v2.3g (wrong priority order), v2.3i (button correctly below rows, ordering MW-first then by count).

---

### Scan-tile hover lift (v2.3f)

`.sc-tile` (Library scan mode) gets `translateY(-3px)` + shadow deepening on hover. `.ep-drawer-scan-tile` already had this from v2.3. Both gated to `@media (hover:hover) and (pointer:fine)`.

---

### Mobile iOS crash fix for category pills (v2.3f)

`setCat()` previously called `render()` (Library + Episodes + Shorts grids, all inside a 100ms `setTimeout`). On iOS, rebuilding 3 large grids from a deferred callback triggered OOM on lower-end devices; AudioContext `.resume()` inside the same timeout also lost user-gesture context and could kill the page. Fix: `renderCatOnly()` added — rebuilds only library grid. `setCat()` now calls `renderCatOnly()`. `playPillSFX()` moved before `_swapContent()` to stay in the gesture frame.

---

### Custom editorial cursor (v2.3f → v2.3f revised)

First attempt: gold ring (`border-radius: 50%`). Replaced by editorial crosshair: two thin gold hairlines (`::before` horizontal arm, `::after` vertical arm), no circle — like a film viewfinder or luxury editorial magazine. Arms grow outward on hover over clickable elements, tighten on click. Single RAF loop with lerp (factor 0.18) on one `<div id="epBrainCanvas">` element. Desktop only (`hover:hover and pointer:fine`).

---

### Founder / About section (v2.1c → v2.3i, many iterations)

New `<section class="founder-section" id="founder">` placed below the newsletter section.

**Photo montage:** four absolute-positioned `.fpm-piece` elements (`.fpm-main`, `.fpm-notes`, `.fpm-notes2`, `.fpm-gym`) in a `.founder-photo-montage` container. Each has an organic asymmetric `border-radius`, individual rotation, a thin 1.5px gold-hairline border. Caption chips (`.fpm-tag`) are separate elements outside each `overflow:hidden` frame (earlier approach of printing text inside the frame was getting clipped by the border-radius). All four pieces clickable → lightbox (`openFpmLightbox()`). Desktop-only hover: each piece straightens/scales individually on its own `:hover`, not as a group. New asset paths: `/assets/founder-photo.jpg`, `/assets/gym-cast.jpg`, `/assets/notes-system.jpg`, `/assets/notes-system2.jpg`.

**Mobile layout:** montage hidden on mobile entirely. Two system screenshots shown inline in `.founder-mobile-notes` (between "noise in my head" paragraph and the emphasis line), gym photo in `.founder-mobile-gym` at section end. Caption chips re-appear as natural-flow elements (not absolute). `overflow-x: hidden` on `.founder-section` (fixed real layout overflow from the fixed-px montage leaking past the viewport).

**Photo lightbox:** `#fpmLightbox` overlay, `openFpmLightbox(src, caption)` / `closeFpmLightbox()`, Escape closes, click-outside closes.

**Copy:** "Why Epistemic Exists" / "The _sentence_ I kept losing." / opening paragraph + three ➣ arrow bullets (Readwise, podcast summary app, Notion dashboard) + "None of it stuck…" closer / "I realized, passive listening is just mental masturbation..." emphasis / "Along the way… expats, non-native English speakers, podcast lovers" / "So I built the tool I wished existed." / closing paragraph. Iterated 8+ times across session.

---

### Footer (v2.2 → v2.3f)

New `<footer class="site-footer">` at page bottom. Brand + tagline. "Browse by category" section added in v2.2, removed in v2.3f at request. About / Contact / Privacy / Terms links. Copyright year rendered from JS. Mobile: footer-links stack, font-sizes reduced. Tagline: `white-space: nowrap` on desktop (one line), `white-space: normal` on mobile. Footer email: `getepistemic.app@gmail.com`.

---

### Legal pages (v2.2)

`privacy.html` and `terms.html` — standalone on-brand styled pages with structural placeholder content. Both carry a prominent disclaimer: "structural starting point, not legal advice — have it reviewed." Privacy includes: data controller section, legal basis (GDPR contract/consent/legitimate interest), retention periods, international transfer note (SCCs), security section, children's privacy section, supervisory authority reference (Autoriteit Persoonsgegevens). Terms includes: acceptable use, IP/podcast-content note, termination, limitation of liability, governing law (Netherlands), severability. Both linked from footer.

---



Editorial + content + pipeline change. Active files: `concepts.json`, `collections.json`, `extraction-prompt-v1_7.txt`, `extract.html`, `extract-concepts.js`, `plain-style-guide.md`.

**What changed — content cleanup (v2.0c):**
- Deleted collections 513 ("UFO Roundtable: CIA Physicist Proves Aliens Exist!") and 514 ("World War 3 Is About To Begin, Let Me Explain!"), both Diary of a CEO — 42 concepts removed, ids 425–466. Removed entirely (no salvage) from both `concepts.json` and `collections.json`. 10 surviving concepts had dangling `related_ids` references into the deleted range cleaned. Library: 636 → 594 concepts.
- Collection 501 (relationships/dating-science, 30 concepts) reviewed term-by-term: 17 flagged for cut, 13 for keep/rewrite. **Decision deferred** — not executed this session; `concepts.json` as currently delivered still contains all 30. Revisit separately.

**What changed — plain field rule set (v2.0 → v2.2):**
- v2.0 rules (200-char/40-word ceiling, ban on specific real-world claims in plain) were drafted from audit data and baked into all generation surfaces, but **live-tested against real concepts and found to actively damage card quality** — the model defaulted to deleting actual podcast-specific content (names, examples, claims) and replacing it with generic filler to hit the tight ceiling.
- **v2.2 correction:** ceiling raised to 350 chars/~55 words (now the standard target, not a rare exception); specific-claims rule **reversed** — episode-sourced concepts must keep transcript-specific content, only `core` (evergreen) concepts avoid fabricated precision; new **trim-weakest-sentence method** replaces full-rewrite — over-length plains get fixed by cutting the single weakest/most redundant sentence, never by abstracting surviving sentences into something vaguer.
- All-fields non-repetition check (no scenario/image/fact repeated across hook/plain/analogy/prompt), repeat-back test as the quality gate, jargon strip list, acronym-expansion exception, bracketed-example rule, and bracketed-term rule all carried over from v2.0 unchanged.
- 94 of 594 concepts trimmed to the new ceiling using the corrected method — every other field on every concept left untouched. Full diff report delivered (`plain_trim_diff_report.json`).

**What changed — pipeline sync (all 4 surfaces now aligned to v2.2):**
- `extraction-prompt-v1_6.txt` → `v1_7.txt`: PLAIN FIELD RULES corrected, version history documents the v2.0 failure and v2.2 fix.
- `extract.html`: REGEN_SYSTEM_PROMPT's plain section corrected to match; "Shorten / tighten" quick-style button fixed (was pointing at the old 200/40 ceiling).
- `extract-concepts.js` (the live Automation 1 endpoint Make.com actually calls): **had no plain field rules at all** beyond the original placeholder schema comment — this was the first time this file received any plain-field editorial standard. Full PLAIN FIELD RULES v2.2 section added.
- `plain-style-guide.md`: v2.0 → v2.2, with a new "Why v2.0 was wrong" section documenting the live failure for future reference.

**Tooling built this session:**
- `plain-batch.js` / `plain-batch.html` — plain-only batch rewrite tool repurposed from `feynman-batch.js` architecture (batch-of-15, localStorage resume, diff preview). **First version (v2.0) produced a near-failure** — minor synonym-swap edits instead of genuine rewrites, and bled into doing analogy's job in several cases. Rebuilt as v2.1 (draft-fresh-first sequence, full anti-AI-slop ban list, embedded calibration examples) — still not adopted as the final method; the actual 94-concept trim this session was done manually in-chat using the trim-weakest-sentence approach, not via this tool. Tool is built and available but not the proven path for future large-scale plain edits — see build-journal for full reasoning.
- 5 plain quick-style buttons added to `extract.html`'s regen UI: Shorten/tighten, Simplify further, More concrete, Fix jargon, Cut the overlap.

**Process note:** this session ran almost entirely as live iteration in chat (test → review → correct → re-test) rather than a single locked rule set executed once. See build-journal for the full sequence of failures and corrections — they're load-bearing context for any future plain-field work.

---

Editorial-only change. No code touched. Active file: `concepts.json`.

**What changed:**
- New hook style guide created (Dan Koe lead voice + Hormozi/Naval/Perel/Sahil Bloom blend) — saved to `hook-style-guide.md`
- 149 concepts reviewed across 6 batches; 120 hooks rewritten, ~29 kept original where already strong
- Hard format rule: 8–12 words target, 14-word ceiling (a few approved exceptions up to 16 where both clauses earned it)
- Banned patterns enforced: "You're not X, you're Y", `-ing` openers, motivational-poster cadence, em-dashes, hook/plain first-sentence overlap
- ID 111 (Value Equation): original formula hook moved into `plain` field as a trailing sentence; hook field now carries the rewritten punchier version

**Process established for future batches:**
1. Score all hooks (word count + banned-pattern regex) → worst-first ranked list
2. Present 3 variations per concept with reasoning → person picks
3. Lock approved picks in a running reference doc with ID mapping
4. Write all approved changes to `concepts.json` in one batch, verify via spot-check before presenting

**⚠️ Process failure this session (see build-journal for full root cause):** an early batch of approved hooks was lost between review and file-write — person caught it by spot-checking the delivered file against their own answers. All 75 affected concepts were corrected in a follow-up pass once flagged. Full per-ID cross-reference now logged in `hook-approved-batch1.md` as the source of truth.

**Remaining work:** ~487 concepts still on original hooks. Style guide ready to bake into `feynman-batch.js` and `extract-concepts.js` prompts so new extractions match this standard automatically — not yet done.

---

## v1.99i–v1.99m — 2026-06-19 — spark.html: mobile card flip/scan/search bug-fix session

One session, five sub-versions, all bug fixes and mobile polish — no new features. Active file: `spark.html`.

---

### v1.99i — Mobile flip fix, scan-mode search fix

**Mobile card flip restored:**
- `@media (hover:none)` override was killing the open-state `rotateY` transform with `!important`, not just the idle tilt — flip was a visual no-op on all touch devices
- Scoped override to `:not(.open)` only

**Flip animation desync fixed (first pass):**
- `.card-front` `visibility:hidden` on `.open` now delayed to the rotation's edge-on point instead of switching instantly

**Scan-mode search fixed:**
- `_spReinjectScanTiles()` was rebuilding tiles from the full unfiltered `CONCEPTS` list after every search keystroke, discarding the filter `buildGrid()` had just applied
- Now accepts `matchIds`/`isVault` params and applies the same filter

---

### v1.99j — Close-flip fix (partial), mobile concept preview modal (new), desktop scan preview re-open fix, hero pills

**New: full-screen mobile concept preview modal**
- `_spOpenMobilePreview`/`spDismissMobilePreview` — shows term/hook/plain/analogy/prompt, reuses card-back field styling
- Replaces the desktop-only floating `.sp-preview-card` (hidden ≤1024px) for: Library scan tile taps, mobile search-result taps (previously opened the full CS panel directly)
- "Talk about this" inside the modal closes it and opens the real CS panel

**Desktop scan preview re-open bug fixed:**
- Clicking tile B while tile A's preview was open caused B to vanish ~260ms later — a stale `setTimeout` from A's dismiss fired after B had already reopened
- Both preview functions now cancel any pending hide-timeout before reopening

**Hero pills:**
- "On a date" added to row 1, visible by default on mobile (previously only "With a friend" + the `+` toggle showed)

---

### v1.99k — Mobile zoom regression fix, preview modal shrink + animation, search dropdown alignment, scroll-lock rewrite

**Mobile zoom-on-landing fixed (self-inflicted regression from v1.99j):**
- v1.99j's `flex-wrap:nowrap` fix for the hero pill row forced 3 pills + the `+` button wider than the viewport, which forced mobile browsers to auto-zoom-out on load
- Reverted to `flex-wrap:wrap`

**Mobile preview modal resized + new entrance:**
- ~20% smaller; entrance changed to a flip-settle (`rotateX(-8deg)` → flat), echoing the card-flip mechanic instead of a plain scale-in

**Search dropdown (mobile) repositioning:**
- Aligned to the search bar's actual `left`/`width` instead of a separate viewport-centered calc; re-measured right before each reveal to guard against on-screen-keyboard layout shifts
- Added `clip-path` "waterfall" reveal anchored to the bar

**Scroll-stuck-after-close bug fixed:**
- Replaced the mobile preview modal's `overflow:hidden` toggle with a `position:fixed` + saved-`scrollY` lock pattern (`_spLockBodyScroll`/`_spUnlockBodyScroll`) — the plain toggle is known to fail to restore scroll on iOS when paired with an inner scrolled element
- Scoped to this modal only; 7 other unrelated `body.style.overflow` call sites elsewhere in the file were left untouched

---

### v1.99l — Close-flip fix (definitive), search dropdown centering fix, light-mode preview contrast, taller/narrower mobile cards

**Close-flip "ghost close" — true root cause found:**
- `.card-back`'s `visibility:hidden` base rule had **no transition delay at all** — on close it vanished at frame zero while `.card-front` (fixed in v1.99i/j) didn't appear until the rotation's midpoint, leaving a window where neither face was visible
- Added matching delay to `.card-back`; rotation duration unified to 0.5s both directions (edge-on swap at 0.25s)

**Search dropdown centering — true root cause found:**
- v1.99k's fix used CSS `max-width` to clamp the dropdown, but `max-width` clips from the right while `left` stayed anchored to the bar's raw left edge — looked top-left-anchored once clamped
- Now clamps `width` directly in JS and recenters `left` around the search bar's own midpoint

**Mobile preview modal — light mode:**
- Border thickened to 2px with stronger category-color tint so the card reads as distinct from the blurred light backdrop (dark mode untouched)

**Mobile library cards:**
- 80vw/360px → 68vw/410px for a more portrait ratio (was reading as near-1:1 on larger phones)

---

### v1.99m — Drawer scan preview fix, light-mode prompt/CTA contrast, desktop column-aware preview, mobile podcast default, faster theme entrance

**Drawer scan-mode preview fixed on mobile:**
- Drawer scan tiles had their own separate click handler that called the desktop-only floating preview directly (never routed to the mobile modal) — same bug class as the Library scan tiles fixed in v1.99j, just a second untouched code path
- Now reuses the shared `_spScanTileClick` handler

**Light-mode prompt/CTA contrast:**
- Low-alpha gold tint that worked on dark backgrounds was nearly invisible on light ones
- Applied a gradient + left-accent-border treatment and solid-fill CTA button to both the mobile preview modal AND the existing library/drawer flip-card backs (same root cause, same fix) — dark mode untouched

**Desktop scan preview: left/right column-aware positioning:**
- Preview always tried opening to the right first regardless of which column the tile was in, so left-column tiles' previews landed on top of the right column's text
- Now detects column by comparing the tile's midpoint to its parent grid's midpoint; left column → preview left, right column → preview right

**Mobile podcast filter default:**
- `window._activePodcast` defaults to `'Modern Wisdom'` on mobile (was `'all'`); falls back to `'all'` if that podcast isn't present in the data

**Theme tiles — mobile entrance:**
- Default visible count: 9 → 3 (one row) on mobile only
- Tiles now reveal right after the 4th category pill animates in (was: after all 15) — removed ~1s perceived delay; entrance SFX reduced 8→4 pops on mobile to match

---

## v1.98–v1.99h — 2026-06-17 — spark.html: Library UX overhaul, drawer views, CS panel improvements, bug blitz

One long session, many sub-versions consolidated here. Active file: `spark.html`.

---

### v1.98 — Mobile scroll/flip, library sort redesign, drawer scan, stories UX

**Library sort row redesign:**
- Segmented pill group (`↻ Latest | ★ Picks | ◈ Mastered`) inside a connected control; active tab fills with accent gold
- Scan is now a standalone icon-only square button (`◫`/`⊞`) visually separated from the filter group
- Mastered filter shows animated progress bar (expand via `max-height`/`opacity` on `.pb-visible` class, ~280ms ease)

**Save (★) button restored to card backs:**
- `⊕ Save` / `✓ Saved` button on all card templates (library, drawer, filtered grid)
- `toggleMaster` updates in-place across all DOM instances by id-suffix pattern (`''`, `Ep`, `Th`, `Fl`, `All`)

**Mobile card flip crash fixed:**
- `toggleCard` debounce guard (300ms); rapid multi-taps can no longer corrupt state

**Library horizontal scroll restored on mobile:**
- `.nf-row` changed from `align-items: stretch` → `align-items: flex-start`; this was the root cause of the black GPU frame AND the scroll blockage
- `.concept-card` `touch-action: auto` replaces old `pan-y` which was blocking horizontal swipe

**Scan mode in episode + theme drawers:**
- `◫ Scan` view added alongside `⊟ Flip` and `⊞ All` — 3 icon buttons always visible
- Wrapped in `.ep-drawer-filter-row` HTML container so sort-row survives `innerHTML=''` clears on drawer re-open
- Scan: 2-column grid, category dividers
- All-cards: fresh render from `CONCEPTS` data (not DOM clones), matching library card design exactly

**CS Stories tab fixes:**
- Scroll fixed (`overflow: auto` on non-spark tabs)
- `×` delete per entry (removes from localStorage, re-renders)
- Copy + Share buttons at bottom of expanded story

**Scan + Editor's Picks bug:**
- `_spRenderFilteredGrid` now re-injects scan tiles after rebuilding DOM when scan mode is active

**Preview dismiss race:**
- Old dismiss listener removed **synchronously** at top of `_spScanPreview` (was inside double-rAF — too late)
- New listener attaches in rAF with 150ms timestamp guard as backup
- Mobile scan: shows preview card first instead of auto-firing CS

---

### v1.99 — Emoji buttons, card frame, light mode, mastered animation, drawer views

**Emoji icon button system:**
- All card action buttons replaced with unified `btn-icon` 34px square emoji buttons: `🔗` share · `★` save · `💬` chat · `🎧` listen
- Applies consistently across library, episode drawer, theme drawer, filtered grid
- `btn-master` star turns green with background when saved

**Card flip close glitch fixed:**
- Removed idle `rotate(-0.8deg)` tilt from `card-inner` (was causing `rotateY(180deg) → rotate(-0.8deg)` compound transition flash)
- Hover lift `translateY(-6px)` preserved

**Light mode card frame removed:**
- `[data-theme="light"] .concept-card` set to `background: transparent; border: transparent; box-shadow: none`

**Search scopes to active filter:**
- `_spShowResults` builds `_activePool` from Picks or Mastered set; both term and fuse matches filtered to active pool only

**Nav sign-up removed from default nav:**
- Sign Up button removed from nav bar; remains in hamburger menu

**`spSetSort` disables scan mode:**
- When Mastered/Picks filter is activated while scan mode is on, scan is cleared first so full-card grid renders correctly

---

### v1.99b — Drawer flip view restored, all-cards design, preview race (final)

**Preview dismiss — definitive fix:**
- `spDismissPreview` called synchronously before any async work in `_spScanPreview`
- Solves the "click tile B while A preview open → B closes immediately" bug that required scrolling to work around

**Drawer flip view (⊟) restored:**
- `ep-cat-column` 4-column centered grid was intact; CSS corruption from comment fragment cleaned

**Drawer scan (◫) centered:**
- `max-width: 760px; margin: 0 auto` on `.ep-drawer-scan-grid`

**Drawer all-cards (⊞) fixed:**
- Cards proper flip with own `card-inner`/`card-front`/`card-back` CSS; `align-items: start` fixes height mismatch

---

### v1.99c — Flip glitch, light mode frame (again), emoji buttons everywhere, all-cards on-brand

**Card flip close glitch (root cause):**
- `card-inner` idle `rotate(-0.8deg)` tilt caused compound transform on close; removed tilt, hover uses `translateY(-5px)` only

**Light mode card frame (root cause):**
- `[data-theme="light"] .concept-card` was overriding `background: transparent` with `#f0e9da`; now explicitly transparent

**Unsave bug:**
- `toggleMaster` now directly updates `e.currentTarget` button and adds `e.preventDefault()`

**Save SFX:**
- `playVaultSFX` rewritten to use `_getSfxCtx()` (was using stale outer-scope `ctx`/`notes` variables, silently erroring)
- Plays rising C5→E5→G5 triad

---

### v1.99d–v1.99e — Mobile nav, drawer icons, all-cards CSS, mastered+scan

**Mobile nav:**
- `max-width: calc(100vw - 160px)` on logo; Sign Up removed entirely from default nav

**Drawer view icons position:**
- `ep-drawer-filter-row` wrapper in HTML (sibling not child); sort-row always survives `innerHTML` clears
- Desktop: cat-filter + sort-row flex row; mobile: sort-row below

**All-cards view — identical to library:**
- Fresh render from `CONCEPTS` data, correct CSS classes, 280×370px cards
- `.ep-drawer-all-cards-wrap` back-face styles added (section labels, back-text, analogy, prompt)

**Mastered filter + scan mode:**
- `spSetSort` clears scan mode before rendering filtered grid

---

### v1.99f — Drawer sort-row persistence, unsave, all-cards size, save SFX, sign-up

**Drawer sort-row disappears on re-open (root cause + fix):**
- Previous approach appended sort-row into `ep-drawer-cat-filter` DOM — `innerHTML=''` on re-open destroyed it
- Fix: `ep-drawer-filter-row` wrapper div in HTML so sort-row is a permanent sibling, never wiped

**All-cards view card size:**
- `width: 280px; height: 370px` matching ep-cat-column exactly

---

### v1.99g — Black frame (attempt), tilt restored

**Card flip frame — shadow diagnosis:**
- `box-shadow` removed from `.card-front` at rest; added `visibility: hidden` on `.card-front` when `.open`
- Shadow only on hover
- Editors-pick: golden `border-color` on `card-front` kept; glow shadow ring removed

---

### v1.99h — Black frame eliminated (definitive), streak glow fixed

**Black rectangle behind tilted cards — true root cause:**
- `.nf-row` had `align-items: stretch` → card wrappers grew taller than defined 370px
- `card-inner` filled 100% of that stretched height; at `rotate(-0.8deg)` tilt, GPU layer corners extended beyond the rounded card-front face, showing page background as dark rectangle
- First two cards appeared correct by scroll-position coincidence (less visible at left edge)
- **Fix:** `align-items: flex-start` on `.nf-row`

**Static glow border on some cards — true root cause:**
- `.concept-card.card-streak` had `box-shadow` and `border-color` on the **wrapper** element, not the face
- Shadow painted in 2D plane outside the 3D context = visible glow rectangle behind tilted card
- **Fix:** moved streak glow to `.concept-card.card-streak .card-front`

**Tilt restored:**
- `rotate(-0.8deg)` idle tilt back on `card-inner`; hover straightens to `rotate(0deg) translateY(-6px)`

---

## v1.96–v1.97c — 2026-06-15 — spark.html + cs-generate.js: Reading Mode, Story Seeds, typewriter, scan fixes, perf

### v1.96 — Reading Mode (Scan toggle)
- `◫ Scan` / `⊞ Full` pill added to Library sort row (alongside `↻ Latest` · `★ Editor's Picks`)
- Scan mode: injects lightweight `.sc-tile` divs (term + hook, `72px` fixed height, category left stripe) into `.nf-row` via `_spReinjectScanTiles()` — cards hidden, tiles shown
- 2-column CSS Grid, `max-width: 1100px` (matches `.app-controls` width), responsive to 1-col on mobile
- Event delegation: single click listener on `#netflixRows` replaces per-tile listeners (600+ → 1)
- Tile click: first click shows `spPreviewCard` (plain + analogy, anchored right of tile); second click on same tile opens CS panel
- Scan mode persists across category changes — `buildGrid` re-injects tiles automatically
- Trending pill removed entirely; sort row now: `↻ Latest` · `★ Editor's Picks` · `◫ Scan`
- `_spSelectConcept(id)` always sets up CS shell fresh (removed `if (!_csConcept)` guard)

### v1.96a — UI fixes
- "Ideas worth saying out loud" eyebrow added below nav logo (DM Mono, muted, both themes)
- Progress bar hidden (`display:none`) — no longer functional without vault/mastered
- Result count line removed — duplicated category header count
- Animated search placeholders capitalised; 5 new terms added: Nocebo effect, Looksmaxing, Bikeshedding, Dopamine detox, Dunning-Kruger effect
- Placeholder crossfade replaced with typewriter — each phrase types char-by-char with ±25ms jitter, fades between phrases
- `spPreviewCard` outside-click dismiss: stored as `card._dismissFn`, removed by `spDismissPreview()`

### v1.96b–v1.96c — Scan fixes
- Category change while scan active now re-injects tiles (hooked into `buildGrid` completion)
- Hint dot `pulse` animation removed — was running `hintDotBreathe infinite` on every unvisited card simultaneously (perf kill); dot still renders, just static

### v1.97 — Story Mode wiring + typewriter everywhere + cs-generate.js upgrade

**cs-generate.js rewritten (v1.97):**
- Story system prompt: full Perel+Koe voice guide baked in (no em-dashes, no triads, no awakening moments, profanity allowed, "you" voice, specific nouns, `**bold**` for key questions, show-don't-tell, end small)
- Scene hints per scenario (`friend`, `dinner`, `date`, `work`, `family`, etc.) injected into story API call
- Conversation starter prompts tightened: direct, no therapy-speak, no em-dashes
- Model bumped: `claude-sonnet-4-5` → `claude-sonnet-4-6`

**`_csTypewriter()` utility (v1.97):**
- Types HTML content char-by-char into a container element
- Handles: `**bold**` → `<strong class="tw-bold">`, `[[LABEL:Term]]` → gold pill with tooltip (fade-in), `\n\n` → new `<p>`
- Break+label sequences: label appears inline at end of preceding paragraph (not on its own line)
- Blinking cursor during typing, cursor fades when done
- `el._twCancel()` cancels in-flight typewriter (called on Back / panel close)

**Locked story seeds (v1.97):**
- `SP_STORY_SEEDS` object: 4 pre-written stories (friend, dinner, date, work) with `**bold**` and `[[LABEL:Term]]` markers, concept IDs, eyebrow text
- `spScenarioPill()` checks for seed → `_csPlayLockedSeed()` → skips API entirely → typewriter fires immediately
- Unlocked scenarios (family, networking, podcast, solo) still use AI generation path
- `SP_STORY_SEEDS` declared as `var` (not `const`) — avoids TDZ crash when called before declaration line

**Typewriter on CS prompt:**
- `_applyAIToCtx`: prompt text now types char-by-char (avg ~16ms/char) after API responds — no more shimmer skeleton on the prompt field
- CS skeleton shimmer replaced with a blinking cursor line while API is in-flight

**Back button fixed:**
- `← Back` in story actions cancels typewriter, hides story panel, restores concept view — never auto-fires `_loadAI`
- If AI data in memory/session cache → restores silently; if not → shows Generate button
- `↩ Story` button in main actions row re-opens already-generated story without re-generating
- "Copy opener" hidden by default; shown only when opener exists

### v1.97a–v1.97c — Bug fixes
- **Scenario pill selector crash** — `querySelectorAll('.sp-pill[onclick*="\'"+scenario+"\'"]')` passed literal concatenation string, not interpolated. Fixed: template literal `` `.sp-pill[onclick*="'${scenario}'"]` `` + try/catch + direct `el.classList.add('active')`
- **Card dark frame behind tilt** — card-back `box-shadow` was bleeding through the `-0.8deg` gap. Removed shadow from default card-back state; added `visibility:hidden` on card-back, `visibility:visible` only on `.open`. Shadow restored only when open.
- **Card tilt moved to `.card-inner`** — was on `.card-front` only; back face edge was peeking through. Both faces now tilt/lift together.
- **Scan preview accumulation** — `_dismissFn` stored on card element; `spDismissPreview` removes it before re-adding. No more stacking outside-click listeners.
- **`_spSelectConcept` CS load** — removed `if (!_csConcept)` guard; always calls `_renderCSShell` + `_csLoadNewConcept` fresh.
- **Stories/History tab scroll** — `overscroll-behavior:contain` + `-webkit-overflow-scrolling:touch` added to both sections.
- **Typewriter speed** — `speed:14 + jitter:20` (~24ms/char, ~25s) → `speed:4 + jitter:6` (~7ms/char, ~6-8s for full story)
- **Bold visibility** — `.tw-bold` colour changed from `var(--text)` (invisible against body) to `var(--accent)` (gold)

---



**Light mode performance (v1.93)**
- Removed `feTurbulence` SVG noise from `[data-theme="light"] body` background-image — CPU-rendered SVG filter painting on every scroll tick; at `opacity:0.035` it was visually imperceptible anyway
- `body::after` editorial overlay: removed `background-attachment:fixed` — was forcing full-page repaint on every scroll frame; `position:fixed` element is already viewport-locked so the visual result is identical
- Replaced `filter: brightness(0.72) saturate(1.4)` on `.cat-card`, `.cat-card.active`, `.card-cat`, and quiz pills with `color-mix()` — eliminates per-element compositor layer promotion and stacking context creation on every card in the grid
- `[data-theme="light"] nav`: removed `backdrop-filter: blur(8px)` — nav bg is `rgba(245,240,232,0.97)` so the blur was invisible, but it created a backdrop filter stacking context that forced every child hover transition (emoji reveal, epic pill, CS panel buttons) to recomposite per frame

**Page load smoothness (v1.93)**
- `ep-preload` class added to `<html>` by inline script before first paint; removed after double-`rAF` post-`render()` with `0.22s opacity` fade-in — eliminates episodes/grid flash-before-hero on hard refresh
- Typewriter initial delay: `680ms → 200ms`; animation now begins visibly sooner on fresh session load

**Placeholder cycling (v1.93)**
- Replaced `setInterval` native placeholder swap (hard-cut) with a `<span class="sp-ph-overlay">` crossfade overlay (`0.35s opacity` transition); shows full phrase list including "Search an idea…" on page load; hides on focus, restores on blur

**Drawer performance (v1.94)**
- `_setEpisodeHeroBg`: replaced inline SVG with `feGaussianBlur stdDeviation="14"` with three pure CSS `radial-gradient` layers — same soft colour blob aesthetic, zero SVG filter cost
- Removed `overflow:hidden` from `.ep-drawer` — was forcing clip of all child content on every repaint during the slide-up animation; moved `border-radius:16px 16px 0 0` + `overflow:hidden` to `.ep-drawer-hero` (the only child that needs it for the bg image)
- `.ep-drawer`: added `will-change:transform`; open transition `0.4s → 0.35s`
- Backdrop: opacity `0.92 → 0.82`; transition `0.25s → 0.2s`

**Drawer category switch (v1.94)**
- Rewrote `filterDrawerCat` / `filterThemeDrawerCat`: instant swap via `display` toggle (no 160ms `setTimeout`); one `rAF` adds `.animating` class (18px `translateY` fade-in, `0.18s`)
- Both functions accept `silent` param; initial render call passes `silent=true` — no SFX or animation on drawer open
- CSS rewrite: `ep-cat-column` default `display:none`; `.visible` → `display:grid`; `.animating` → `drawerCatFadeIn` keyframe (was a complex `position:absolute`/`max-height:0` approach that caused layout recalcs)

**Close SFX (v1.94)**
- `_playCloseSFX()` added — descending `260→130Hz` sine, `0.14s`, softer than swap woosh; wired to both drawer X buttons

---

## v1.89–v1.92b — 2026-06-14 — spark.html: UI/UX overhaul, mobile fixes, light-mode redesign, engagement mechanics

Long session, multiple sub-versions consolidated here.

**CS Panel**
- Voice playback feature added then removed (browser SpeechSynthesis — quality too poor)
- "Connects to →" chip: replaces "Related concepts" button in CS panel; shows first `related_ids` entry (same-category fallback); click calls `_csSwapConcept()`. Related concepts button commented out (code preserved)
- `_csConnectsChipClick()` — new function
- `_spLoadConceptNoFire(id)` — loads concept into CS shell without firing `_loadAI`; used by mobile search dropdown tap

**Drawer UI**
- Parallax hero on both drawers: `_initDrawerParallax()` — `background-position-y` shifts at 35% of scroll speed via `rAF`-throttled passive scroll listener; desktop-only + `prefers-reduced-motion` guard; torn down on close
- Swipe-down-to-close on drawer hero (mobile): 60px threshold, passive touch listeners, MutationObserver attaches once on first open
- Category tab switch animation: slide-out-right (0.18s) → slide-in-left (0.32s) with woosh SFX; replaces old opacity fade

**Search bar — prefix commands (v1.90)**
- `_parseSearchPrefix(q)` parser handles: `source:` / `from:` (filter by source code), `saved:` / `stash:` (filter by `lll_cs_saved_v1`), `story:` (shows matches + Enter opens Story picker without auto-firing)
- Gold DM Mono hint label (`#searchPrefixHint`) appears below input while prefix is active
- Source aliases: `modern wisdom/cw/chris williamson → cw`, `hormozi/ah → ah`, `koe/dk → dk`, `core/foundational → core`

**Theme tile mobile**
- `themeClick()` detects `≤700px` and calls `openThemeDrawer()` directly — skips inline preview on mobile

**Mobile UX (v1.90–v1.91)**
- Scenario pills: 2 visible on mobile (`sp-pill-hide-mobile`/`sp-pill-show-mobile` classes); row2 `position:static` on mobile to avoid overlap with browse toggle; `+`/`−` DM Mono symbols replace text labels; `sp-hero overflow:visible` (was `hidden`, was clipping row2)
- Browse toggle: `margin-top: 1.5rem` mobile guard
- Category pills + themes filter pills: horizontal scroll on ≤600px (nowrap, scrollbar hidden, scroll-snap)
- Hamburger: outside-click closes via `_mobileNavOutside` capture listener
- Mobile nav: 💬 Spark, 📚 Library, 📌 Collection — emojis added
- Drawer X button: `z-index:15`, `position:sticky` on mobile (was clipped by `overflow:hidden`)
- Search dropdown: centered on mobile via `(vw − dw) / 2` JS calc; compact single-line items on ≤600px (hook + source pill hidden)
- `initDragScroll()` no-ops on touch devices (was intercepting native scroll)
- Card tilt (`rotate(-0.8deg)`) suppressed via `@media (hover:none)` — was breaking touch hit-testing
- `MutationObserver` on `netflixRows` removed — was causing mobile freeze on subtree class changes
- Concept grid: single column on ≤600px + `touch-action: pan-y` on grid and cards

**Mastered badge** — removed from all 4 card render locations (CSS rule kept but `display:none` was already default)

**Engagement mechanics (v1.92)**
- IntersectionObserver (`_initReadingProgress`): marks cards `.card-read` at 55% threshold; re-attaches on `_gridBuilt` event dispatched at end of `buildGrid()`; streak glow (`.card-streak`, faint gold box-shadow) applied inline from 3rd card seen
- Session toast (`_showSessionToast`): fires at 5th unique card **flip** (moved to `toggleCard` — was firing on scroll-past); gold DM Mono pill, slides up from bottom, 3.2s
- Typewriter on hero `<em>`: `localStorage` 2-hour cooldown (`ep_typed_v1`); character-by-character with ±25ms jitter; `aria-label` on the `<em>` for screen readers
- Sub-tagline (`#spSub`): hidden (`opacity:0; scale:0.96`) until typewriter finishes, then `0.6s` transition; instant on returning visits
- Animated placeholder cycle: 5 real concept terms rotate every 3s via `setInterval`; pauses on focus
- PICK badge: 3-cycle `pickBadgeBreathe` keyframe (box-shadow glow, then stops); `prefers-reduced-motion` guard
- Card hover lift (`translateY(-3px)`) — added then **removed** (added unwanted dark shadow)
- Reading progress left border (`::before scaleY`) — added then **removed** (not needed)

**Light mode redesign (v1.92)**
- Paper grain: inline SVG `feTurbulence` noise on `body` background
- `body::after`: fixed full-page layer with diagonal `EPISTEMIC` watermark (148px italic serif, −28°, `4.5%` opacity), left margin rule, right/bottom hairlines, corner crosshair ornaments, masthead text ("IDEAS WORTH SAYING OUT LOUD"), bottom-right logotype — all gold, pointer-events none

---



One long session, multiple sub-versions (v1.81a–d, v1.82–v1.88) consolidated here.

**By Episode / By Theme toggle**
- Replaced pill-style toggle with Playfair-italic underline tabs + animated
  gold sliding indicator (`.browse-toggle-underline`), repositions on resize.

**Themes grid — entrance & interaction**
- First entry to "By Theme" (or filter pill click): category pills stamp in
  (55ms stagger) with an 8-fast-pop SFX (once per trigger), then the theme
  grid stamps in (80ms stagger) with the original 3-pop SFX.
- Magnetic cursor effect (same as Library category pills) added to theme
  filter pills via new reusable `initMagneticPillsFor()`.
- **Theme card preview re-added**, redesigned from v1.79's version:
  - Grid restructured into per-row containers (`.themes-row`, 3-col) each
    followed by its own `.theme-preview-zone` — clicking a tile expands 3
    cards (editor's-picks-first, 280×370, matches Library size) directly
    under that row via a vertical gold connector line + glowing node
    (replaced an earlier triangle design). Only rows below the active one
    shift; tiles 2/3 of the active row never move.
  - New deeper/quieter SFX (`_playThemePreviewSFX`, sine 150→60Hz @ 0.022
    gain) on expand — distinct from grid/category pop sounds.
  - Every theme card gets an "Explore →" button (bottom-right, hover-reveal,
    always visible on touch) linking straight to the full drawer.

**Drawer redesign (episode + theme, shared `.ep-drawer` classes)**
- New hero zone (~155px, image full-bleed + bottom gradient scrim) replaces
  the old flat header — title enlarged to Playfair 1.7rem on the image,
  tagline/guest-names become an italic subtitle, concept count moved to a
  corner badge, category pills redesigned as underline tabs.
- Episode drawers get a **generative hero background**: 3 blurred radial
  blobs colored by the episode's top categories, seeded deterministically by
  episode id (`_setEpisodeHeroBg`/`_seedHash`) — no image assets, complements
  (doesn't match) the painterly AI theme images.
- Fixed: drag-handle moved inside the hero as an absolute overlay (was a
  separate flow element rendering a dark strip above the image on both
  themes); hero height +10%.
- Category tabs now 4-per-row, fixed 280×370 (matches Library/preview card
  size exactly) — was a flexible 3-col grid at 340px height. 2-up tablet
  breakpoint (≤1240px), single centered column on mobile (≤700px).
- Fixed light-mode category-tab clash: removed a leftover filled-background
  override from the pre-redesign pill style.
- Fixed perceived hover lag (~0.4s) on drawer cards: split the hover-lift
  transform transition (now 0.15s) from the open/flip transform (still 0.4s);
  card-front hover border/background now 0.12s.

**SFX rationalization**
- Drawer category tabs: dropped the loud pill-click sound, kept only the
  gentle `_playSwapSFX()` tick.
- Added `_playSwapSFX()` to CS modal state changes: scenario switch (main +
  picker cards), related-concept swap, Story Mode open/close.
- Consolidated `playBubblePopSFX()` into `_playThemeEntranceSFX(8, 55)` —
  same 8-pop shape, one implementation.

**Stories tab fixes**
- First saved-story pill now resolves correctly (`_csSaveStory` was passing
  `id:0` instead of the real concept id); legacy entries get a term-match
  fallback.
- Clicking a Stories-tab pill now toggles its popup closed on re-click.
- Fixed: clicking the term popup no longer closes the entire CS panel
  (outside-click handler now excludes `.cs-term-popup`).

**General UX polish**
- Illustrated empty/loading states (`_emptyStateHtml`) — gold SVG icon +
  sentence-case text, replaces plain uppercase mono labels (5 locations).
- New `.hover-lift` utility (translateY(-2px) + shadow), applied to episode
  cards and short-card.
- Global `:focus-visible` — gold 2px outline replaces default browser blue
  ring, larger offset for pills/cards/toggles.
- "Tap to explore" hint dot now pulses (opacity + scale + glow, 2s loop) on
  unopened cards only (`!openedToday.has(c.id)`), stops on first flip.
- Active Library category pill gets a small glowing dot before its name.

---

## v1.80 — 2026-06-12 — spark.html: Browse toggle + Themes grid with real images
 
- **"By Episode / By Theme" toggle** added above the browse area —
  pill-style, centered. Episodes shown by default; Themes hidden and
  lazily rendered on first switch.
- **Themes section restructured** from a pill row (v1.79) to a 3×3
  image-tile grid (`.theme-card`). Responsive: 3 cols → 2 (≤900px) →
  1 (≤540px).
- **Category filter pills** above the grid filter themes by
  `collections.json` `categories[]` overlap. "Show all themes ↓"
  appears only when a filtered set exceeds 9.
- **16 AI-generated theme images** uploaded to `/images/themes/
  theme-101.jpg` … `theme-116.jpg` (1024×1024, surreal/retro-poster
  style). Each `.theme-card` loads its image with an `onerror`
  fallback to emoji + gradient if missing.
- Preview zone (3-card flip preview + "Explore this theme →" drawer)
  unchanged from v1.79 — relocated, not rebuilt.
- `browseSwitch()` closes any open theme preview when returning to
  Episodes view.
- Delivered two image-prompt packs (`theme-image-prompts.md` —
  minimalist editorial; `theme-image-prompts-alt.md` — surreal/
  maximalist) for future regeneration or additional theme art.

---

## v1.79 — 2026-06-12 — spark.html: Themes row (Collections feature) + CS auto-fire fix
 
- **New Themes row** between scenario pills and episodes section —
  16 thematic collections (101–116, from `collections-row-spec.md`,
  using `curated_collection_ids` populated in v1.78). Pill-style
  chips with emoji + title, all 16 always visible (no pagination).
- **3-card flip preview** on click: editors_pick-biased random
  selection from matching concepts, reuses `.ep-cat-column` card
  styling/flip mechanics verbatim (no new card CSS).
- **Theme drawer** (`#themeDrawer`) — full concept grid grouped by
  category with filter pills, reuses `.ep-drawer` CSS classes
  verbatim. Isolated open-card state (`_currentOpenThemeDrawerCardId`)
  separate from episode drawer.
- **`collections.json`**: appended 16 thematic entries (IDs 101–116)
  with `symbol` (emoji), `title`, `tagline`, `categories[]`.
- **CS modal auto-fire disabled** (testing-phase fix): page load no
  longer calls `openCS()`/`_loadAI()`. `openCSFromNav()` always shows
  the "Generate starter" button instead of auto-generating — zero
  token cost while iterating.
- **Card term/hook centering** — `.card-term { margin-top: auto }` +
  `.card-hook { margin-bottom: auto }` centers the term+hook block
  between the meta row and flip-hint/bottom, applied consistently
  across `.nf-row` (Library), `.ep-cat-column` (episode + theme
  drawers), and theme preview cards.
- **Story-mode bug fixes:** `closeCS()` now calls
  `_csDismissTermPopups()` so Stories-tab floating term previews
  close when the CS modal closes; clamped popup `topPos` minimum
  (8px) fixes first-pill preview not appearing.
- **Scenario pills "More" no longer shifts hero** — `.sp-pills-row2`
  changed to `position: absolute`, overlays below row1 instead of
  growing `.sp-hero-col` height (was recentering hero copy + search
  bar on expand).
- **Spacing pass:** `.sp-hero` min-height 70vh→56vh, `.episodes-section`
  top padding 5rem→2.5rem (podcast row peeks in better).

---

## v1.78 — 2026-06-12 — Concept curation: thematic collections + new spec docs

- **`curated_collection_ids` field added to all 636 concepts** in
  `concepts.json` via one-time AI curation pass — semantic assignment to the
  16 themed collections (101–116: Self & Signal, Risk & Ruin, Crowds &
  Contrarians, Body of Evidence, Persuasion Lab, The Long Game, Attention
  Economics, Status Games, Making Things, The Relationship Stack, Hard
  Conversations, Unknown Unknowns, Money as a Mirror, The Credibility Gap,
  Systems & Chaos, Sovereign Mind)
- Strict matching prompt used (max 2 collections per concept, "defend it in
  one sentence" bar) — roughly half of concepts assigned 0, the rest 1–2
- Built two reusable browser-only tools (uploaded to repo root):
  - `curate-batch.html` + `api/curate-batch.js` — runs the curation in
    batches of 25, resumable via localStorage, retry-on-failure
  - `merge-collections.html` — dry-run + commit tool that merges a
    `curated_collection_ids` patch into `concepts.json` on GitHub
- Both tools are reusable for future re-curation runs (e.g. after new
  concepts are added)
- `extraction-prompt-v1_4.txt` already includes `curated_collection_ids`
  guidance for new concepts going forward — no further changes needed there
- **New project files added:** `collections-row-spec.md` (Collections/Themes
  row UI build spec — 16 collections, drawer, empty-state rules) and
  `feynman-rewrite-spec.md` (editorial quality-normalization pass spec for
  hook/plain/analogy/prompt fields across all 636 concepts)
- No site-facing UI changes this session — `spark.html` unchanged

---

## v1.77 — 2026-06-11 — spark.html: Story UX + Stories tab + state machine fixes

### v1.77a — Stories tab + story mode UX fixes

- **Stories tab:** 4th tab (`✦ Stories`) added to unified panel; reads `lll_cs_stories_v1`; each entry shows 3 clickable concept pills (category-coloured), Playfair Display story text in proper paragraphs (3-line clamp, expand on click), opener block, timestamp
- **Clickable concept pills in Stories tab:** clicking any term pill triggers the floating term reveal popup (same spring animation as `◈ Reveal the terms`) positioned left of panel
- **`◈ Reveal the terms` → half-width:** now `inline-flex; align-self: flex-start` — no longer stretches full container width
- **Term pill uniform width:** `min-width: 110px; text-align: center` on `.cs-story-label` — short/one-word terms no longer render as a narrow sliver
- **"A SHORT STORY" eyebrow colour:** changed from `var(--muted)` to `var(--teal)` (#5abfaf) — on-brand but visually distinct from gold
- **Opener block light mode:** `background: var(--surface2)` + `border: 1px solid var(--border)` replaces hardcoded `#0d0d0d` — no longer a black box in light mode
- **"Back to starter" moved to bottom actions row** — now sits alongside Copy story / Copy opener as first pill in `.cs-story-actions`
- **Header swap:** `#csHeadline` reads "A Short Story" while in story mode; restores to "Today's Conversation Starter" on close
- **Scenario-aware eyebrow:** eyebrow reads "A SHORT STORY — at a dinner party" etc. using `_spCtxLabels` map keyed to `_csCtx`; resets to "A SHORT STORY" for manual picker flow
- **Term popup overlap fix:** increased stagger to `cardH=140 + GAP=12`; viewport clamp per-card rather than shared
- **Nav search dropdown:** `max-height` reduced `360px → 320px` to prevent overflow onto episode peek

### v1.77b — Story / CS state machine bug fixes

- **"Back to starter" now correctly exits to concept+prompt view** — previously called `pickerWrap.style.display = ''` which showed the category grid; now calls `_csPickerShowMain()` which restores concept pill + prompt + actions
- **"Change topic" from story mode now dismisses story panel first** — `_csToggleTopicReveal` clears `csStoryPanel` `cs-visible` class + restores headline before opening picker
- **`↩ Story` button moved to `csActions` row** — visible after "Back to starter" if `_csStoryGenerated` is true; was previously in the picker area which disappears when story mode is active
- **`_csPickerShowMain` now restores `csActions` + `csRevealRow`** — these elements were only being shown via `_applyAIToCtx → _csShowPostPrompt`; now explicitly made `cs-visible` in `_csPickerShowMain` so nav controls always appear even before AI data arrives
- **`_csPickerShowMain` fallback shows generate button** — when `_csAIData` is null and no cache exists, shows the generate button rather than an empty box
- **`_csInjectCandidatesAndStory` hides `csActions`/`csRevealRow`** — these elements must not bleed through behind the story panel
- **Term popup two-pass positioning** — cards inserted off-screen, heights measured, then positioned top-down with guaranteed 14px gaps; no shared clamp that causes stacking on small viewports
- **Popup hover elevation** — `cs-term-popup.cs-term-visible:hover` smoothly elevates: `scale(1.02)`, `z-index: 4010`, stronger shadow — overlapped card rises above neighbour on hover

### v1.77c — Scenario pill story wiring + concurrent API bug fix

- **Scenario pills now launch story mode directly** — "On a date" / "At work" etc. pick 3 category-matched concepts and jump straight into story generation; previously just opened a default CS panel
- **Category maps per scenario:** `date → relationships/language/philosophy`, `work → business/thinking/power`, `dinner → psychology/thinking/philosophy/society`, etc.
- **`openCS()` instead of `openCSFromNav()`** — scenario pills now call `openCS()` directly; `openCSFromNav()` auto-fires `_loadAI` which was running concurrently with story generation and corrupting UI state when it resolved
- **`SP_CTX_MAP`** maps scenario pill names to valid `CS_OPENERS` context keys (`friend/partner/colleague/meeting`); previously the raw scenario name `'work'` was passed as `_csCtx` which CS_OPENERS didn't recognise, producing blank openers and API mismatches

---

## v1.76f–v1.76k — 2026-06-10 — spark.html: Story Mode (Phase D) + fixes

### v1.76f — Phase D: Story Mode added to CS Panel

- **Story Mode:** `★ See how these connect` button — triggers a short AI-generated story weaving the current concept's related concepts into one scene
- **Inline concept labels:** Story text includes gold `[[LABEL:Term]]` pill markers immediately after each concept is illustrated; hover shows tooltip with plain definition
- **Opener:** `Say this tonight →` gold block below story — one sentence the user can say out loud
- **`◈ Reveal the terms`** button: floating concept cards (same spring animation as search preview) pop out left of panel, stacked vertically with 70ms stagger
- **`lll_cs_stories_v1`** localStorage ring buffer (max 20) auto-saves every generated story (clean text, no label markers)
- **`cs-generate.js`:** new `mode: "story"` branch — accepts `{ mode, concepts, storyCtx }`, passes all related concepts to Claude (Option B: let Claude pick best weave), returns `{ story, opener }`; prompt instructs Claude to embed `[[LABEL:Term]]` markers; 150-word ceiling; scenario-aware scene
- **Copy buttons:** `↑ Copy story` / `↑ Copy opener` (separate actions)
- **Back to starter:** closes State 5, restores State 1 — no re-API call

### v1.76g — Story shimmer fix + back button + stats counter (added then removed)

- **Stats bar added then removed same session** — counter between hero and episodes added, then removed as unnecessary noise
- **Story shimmer root cause fixed:** `csStoryMiniCards` null ref crashed `_csOpenStoryMode` before fetch fired — replaced with safe `csStoryRevealBtn` reset
- **Back button restoring:** `_csCloseStoryMode` now uses `classList` instead of fighting inline styles
- **Search dropdown scroll fix:** `window.addEventListener('scroll', _spHideDropdown, { passive: true })` added to hero search init — dropdown was sticking on scroll

### v1.76h — Tooltip fix + term popups + paragraph breaks + counter removed

- **Tooltip black box fixed:** hardcoded `background: #1a1a1a` on light mode renders black; replaced with `var(--surface2)` + explicit light mode override (`background: #fff`)
- **Tooltip text inheritance fixed:** tooltip was inheriting `text-transform: lowercase` + `letter-spacing` from parent label — overridden explicitly
- **Mini-cards replaced with floating term popups:** `◈ Reveal the terms` button → `_csShowTermPopups()` creates fixed-position cards left of panel, staggered spring animation; click any card to dismiss; `_csDismissTermPopups()` auto-called on close/new concept
- **Paragraph breaks in story text:** `_csParseStoryLabels` now wraps story in `<p>` blocks (double-newline split, fallback: group every 2 sentences)

### v1.76i — Syntax error fix

- **Root cause:** Python string replacement wrote literal `\n` into a JS comment (`// If API returned \n\n breaks`) and into a regex literal (`/\n{2,}/`), breaking the entire script block — nothing rendered
- **Fix:** rewrote paragraph split using `indexOf('\n\n')` + `split('\n\n')` string methods; no escape sequence ambiguity
- **New rule:** always run `node --check` on extracted script block at end of every build session

### v1.76j — Story Mode UX redesign + scroll fix

- **Story button repositioned:** removed from post-generate state (ambiguous "connect what?"); now lives in Change Topic picker below the 3 candidates
- **Story now uses picker's 3 candidates** — `_csGetPickerCandidates()` reads `data-concept-id` from rendered candidate cards; works for any 3 concepts regardless of `related_ids`
- **After story generates:** candidate cards repurposed — generate buttons hidden, `↓ in the story` gold badge added, expand-to-read still works
- **5 rotating loading messages** (4s each): "Weaving ideas together…" / "Finding the thread between them…" / "Setting the scene…" / "Writing the story…" / "Almost there…"
- **Story button hidden on picker category reset** — button removed from view when user picks a different category

### v1.76k — Story button visibility final fix

- **Root cause:** `.cs-story-btn` base CSS has `display: none`; button was inside `#csTopicPickerWrap` which also has `display: none` (shown only with `.active` class) — parent's `display: none` hid button regardless of child classes
- **Fix:** moved `csPickerStoryBtn` outside `#csTopicPickerWrap` into normal document flow; `cs-visible` class with `display: inline-flex !important` now works correctly

---

## v1.76a–v1.76e — 2026-06-10 — spark.html new file: hero redesign, unified panel, CS Panel migration (Phases A → C3)

### v1.76a — Phase A: hero zone, nav changes, Zone 7 sort pills
- **New file:** `spark.html` branched from `v172.html` at v1.75b; `index.html` unchanged
- **Hero Zone 1:** tagline "Ideas die in *your earbuds.*" + sub-tagline; Fuse.js hero search bar (debounced, 12-result dropdown, term-first ranking); 4 scenario pills + "More ↓" expands 4 more; decorative card stack (later removed, v1.76a carry-forward)
- **Nav:** `Spark` + `Library` + `Collection` links; emoji hover reveal on all three (`💬 📚 🔖`); `I feel epic` preserved in nav-right exactly as v172
- **Zone 7:** heading `"Browse concepts"` → `"The Library"`; sort pills `Latest · Trending · Editor's Picks`
- **Browse Episodes header:** hidden (`display:none`); all drawer logic intact
- **Episode search:** moved into podcast filter pills row (right-aligned inline search); value+focus preserved across re-renders

### v1.76b — Carry-forward fixes
- **Hero centered:** card stack removed; `sp-hero` centered single column
- **Sub-tagline:** `white-space: nowrap` prevents "loud." wrapping to new line (mobile reverts to normal)
- **Scenario pill row 2:** `padding-top: 8px` on `.open` state fixes overlap with row 1 (margin-top clipped by `overflow:hidden`)
- **Hero search glow:** static layered gold `box-shadow` at rest; intensifies on focus; separate light/dark mode tuning

### v1.76c — Phase C1: CS Panel as fixed right sidebar
- **CS modal → right panel:** `cs-card` becomes `position:fixed` right sidebar (`min(520px,100vw)`, `translateX` slide-in); `cs-overlay` transparent scrim only
- **`openCS()` / `closeCS()`:** now drive `cs-panel-open` class on `body` + add outside-click + esc handlers
- **`_csOpenPanel()` / `_csClosePanel()`:** aliases added for entry-path wiring
- **Scroll lock scoped to mobile ≤899px** only; desktop body stays scrollable
- **Spark trigger hint:** `✦` fixed at right viewport edge; hides after first panel open; desktop only

### v1.76c (continued) — Carry-forward fixes
- **? bubble left-side:** moved `csHelpBtn` to left of `cs-headline`; bubble opens leftward via CSS
- **Date stamp:** moved below eyebrow row on own line with `padding-right` to clear ✕ button
- **SFX:** bubble pop: 8 pops × 55ms × 60ms tail; `_playCandidateSFX()` added — 3 pops on candidate card stamp-in
- **Surprise me loading:** coaching/divider/feedback force-hidden via `display:none` before `_loadAI` fires; only concept pill + shimmer visible during load
- **Episode search fix:** value + focus restored after `buildEpisodes()` re-renders the input

### v1.76c — Phase C2 (partial): Stash right-panel restoration
- **Stash reverted to right-sliding panel** (bottom drawer attempted and reversed in same session)
- `drawer-open` body class: scroll lock only (old section-hide rules removed)

### v1.76c — Phase C3: Unified right panel (Spark + Stash + History tabs)
- **`conv-panel` now houses all three tabs:** `💬 Spark · 🔖 Stash · 📖 History`
- **Tab switching:** opacity fade crossfade (220ms); no DOM re-mount
- **`openCS()` / `openConversations()`** both open `conv-overlay` and call `panelSwitchTab('spark'/'stash')`
- **`_convOpenCSById()`** (History "Start talking") stays in panel, switches to Spark tab — no panel close/reopen
- **`_mountCSInPanel()`:** moves `cs-card-inner-scroll` into `#panelSectionSpark` on first open; called post-concept-load
- **`cs-overlay` / `cs-card` shell:** hidden `display:none !important`; content lives in conv-panel

### v1.76d — Search dropdown redesign + scenario pill hover + More button
- **Dropdown:** left-aligned term+hook; pills pushed right via `flex:1` on term + `margin-left:auto`; `max-height: 360px` scrollable; 12 results cap; `position:fixed` JS-positioned via `getBoundingClientRect` (escapes `overflow:hidden` on hero)
- **Dropdown split click:** body (term+hook) → `_spPreviewCard(id)` floating preview card; "Talk about this →" button → `_csOpenPanel()` + concept load + AI fire
- **Floating preview card:** `position:fixed` JS-positioned left of search bar; back-face style (category · Playfair term · "What it means" plain · "Analogy" italic); spring pop animation; `z-index:5000`; hidden ≤1024px
- **Scenario pills hover:** gold border + subtle gold background tint (`rgba(232,213,163,0.08)`) on hover
- **More button:** dashed border, smaller text, clearly secondary; gold text on hover
- **Click-outside on Spark tab:** `openCS()` now adds `_convOutsideClickHandler` + `_convEscHandler`

### v1.76e — ? bubble stacking context fix + preview card polish + dropdown overflow
- **? bubble root cause fixed:** `conv-overlay` (`z-index:1100`) creates a stacking context — `position:fixed` children are trapped inside it regardless of their own z-index. Fix: `_wireCSEvents()` teleports `#csHelpBubble` to `<body>` (outside all stacking contexts). Show/hide via JS `mouseenter`/`mouseleave` + `.cs-help-bubble--visible` class. `z-index:99999`
- **Preview card back-face:** now shows plain + analogy sections with `sp-preview-section-label` headers; same visual language as library card-back; no prompt, no buttons except footer CTA
- **Dropdown overflow fixed:** `position:fixed` + `getBoundingClientRect` in `_spShowResults()` — escapes `overflow:hidden` on `.sp-hero`; scrolls within its own `max-height:360px` without pushing page content

---



### v1.75a — SVG position, action row divider, SFX, badge + loading messages
- **SVG hairline endpoint fixed:** `padding-top` on `.cs-scenario-branch-wrap` increased `48px → 68px` desktop / `36px → 52px` mobile; bezier endpoint `ty` changed from `H - 2` (container bottom) to `br.top - svgRect.top` (top edge of each button) — lines now arrive above button text rather than drawing through it
- **Action row divider:** `.cs-actions` gets `padding-top: 12px; border-top: 1px solid var(--border); margin-top: 4px`; reveal row margin increased — clean visual separation between pill row and action buttons
- **Bubble pop SFX on Change Topic open:** 5-then-6 sine oscillators, ~300ms total (v1.75a), extended to ~0.85s (v1.75b); bypasses `SFX_ENABLED` flag as it is UI feedback not ambient sound; called in `_csToggleTopicReveal` on open
- **Picker loading messages:** `_csPickerGenerate` loading message now picks from `_CS_LOAD_MSGS[ctx]` (same per-scenario pool as main modal) instead of hardcoded "Finding the right angle…"
- **Coral badge session-scoped:** `_csUpdateScenarioBadges()` rewritten — `has-prompt` only set if data exists in both `_csAIData` AND `sessionStorage` for that concept+ctx; prevents cross-session badge bleed from restored-but-not-generated-today data

### v1.75b — Hover delay, coaching restore, Surprise me, SFX length
- **Scenario button hover delay fixed:** `.btns-settled` CSS class (added 700ms after `.btns-visible`) resets `transition-delay: 0s !important` — hover color now responds instantly; delay was from staggered appear animation persisting permanently on the element
- **Coaching restore after Change Topic → back:** `_csPickerShowMain()` now clears inline `style.display` on all 6 elements that `_csPickerHideMain()` hides (`csCoaching`, `csDivider`, `csFeedbackRow`, `csGenerateRow`, `csConceptPill`, `csPromptBlock`) before calling `_applyAIToCtx` — previously coaching was stuck `display:none` via inline style; `cs-visible` class has no effect against inline `display:none`
- **Same fix applied to `_csSurprise()`:** clears inline `display:none` on all 6 elements at entry; static concept `prompt` field cleared before AI resolves; coaching now fully shows after API response
- **Same fix applied to `_csSwapConcept()`:** clears inline `display:none` at entry (Related → "Use this instead" path)
- **SFX extended:** bubble pop duration `~0.35s → ~0.85s`; 6 pops at 110ms spacing, 180ms tail per oscillator

---

## v1.74d–v1.74j — 2026-06-08 — CS modal Change Topic flow, auto-save, SVG branches (v172.html)

### v1.74d — Auto-save, swipe guard, viewport-centered card open, left-align pills, help text
- **Auto-save to Stash:** every successful `_applyAIToCtx` call auto-saves via `_csSaveConcept` — no manual save button needed
- **Save button retired:** `csSaveAllBtn` removed from DOM and all wiring; `_csUpdateSaveBtn` stubbed as no-op
- **Per-scenario ✕ remove in Stash:** `_convRemoveCtx(id, ctx)` deletes a single scenario's aiData from a Stash entry; ✕ button rendered per ctx block in `_convCtxBlock`
- **Swipe moved guard:** `MOVE_GUARD = 8px` — requires real horizontal drag before swipe registers; taps on prompt block no longer fire `_csSwipeLeft` / load new concept
- **Open card from Stash:** `_convOpenConcept` uses `getBoundingClientRect` + `window.scrollBy` with Stash panel width offset so card centers in visible viewport (not behind panel); triple-rAF chain ensures layout is complete before measuring
- **Reveal pill buttons left-aligned:** `.cs-reveal-row` and `.cs-actions` set to `flex-start`; Prev/Next group pushed right via `margin-left:auto`
- **Help text updated:** "no BS" → "in plain English"; "Save the ones worth keeping for later conversations" → "Stash saves the ones worth keeping for later" (both desktop bubble + mobile overlay)

### v1.74e — Scenario button sizing
- **Scenario buttons smaller:** `font-size: 0.54rem`, `padding: 2px 8px 3px`, `border-radius: 0 0 3px 3px` (bottom corners only) — visually subordinate to the "Change scenario" pill

### v1.74f — Topic picker UX fixes: accordion, colors, sync, loading, two-step reveal
- **Candidate card accordion:** replaced `grid-template-rows` with `max-height: 0→600px` — collapsed cards no longer leak plain text
- **Change scenario + Related hidden during picker:** pills hidden when picker opens; restored on close
- **Category pill colors:** each pill uses `CAT_COLOR` per category — border+text at 40% opacity at rest, full color on hover, solid background when active
- **Two-step picker open:** category pills animate in first; candidates only appear after user clicks a category
- **Loading message in candidate card:** "Finding the right angle…" shown inside output area during API fetch
- **Full prompt render in candidate card:** `_csPickerShowResult` now renders prompt text, openers (Try saying / Or try), coaching, and pitfall — matching main modal output
- **Stash ↔ CS modal sync fix:** `_csAIData[ctx]` updated on picker generate success; `_csUpdateScenarioBadges()` fires immediately; session storage written — main modal sees prompted state on restore

### v1.74g — Branch animation, stamp pills, state fixes, badge sync
- **Hairline SVG branch for Change scenario:** SVG draws from "Change scenario" button center outward, then drops to 4 buttons; drawn via `stroke-dashoffset` animation; stays open until re-clicked
- **Stamp animation for category pills:** `scale(0.6) opacity:0` → `scale(1.08)` overshoot → `scale(1)`, staggered 55ms apart (~1s total for 14 pills)
- **Same stamp animation for candidate cards:** 80ms stagger
- **No pre-selected category on picker open:** user must choose; `_csPickerLoad` guards null cat
- **Candidate cards collapsed by default:** no auto-expand of first card
- **Picker close re-renders State 1:** `_applyAIToCtx(_csCtx)` called on picker close — prompt + coaching fully restored (not just shown)
- **Back button in picker:** Prev/Next and `_csSwapConcept` call `_csClosePicker()` first
- **Feedback thumbs reset on every generate:** feedback row hidden at start of every `_applyAIToCtx`; 8s timer re-arms
- **Badge bleed fixed:** `_csLoadNewConcept` and `_csPickerCommit` clear all `has-prompt` badges + start fresh `_csAIData`
- **Stash live-refresh:** `_convRenderSaved()` called after picker generate if Stash panel is open on saved tab
- **Related → "Use this instead" shimmer fix:** prompt block display restored before `_csRestoreOrLoad` → shimmer renders in modal

### v1.74h — Curved branch SVG, coaching restore, scenario stays open
- **Curved bezier hairlines:** 4 `<path>` elements replace straight lines — all originate from button center-bottom, fan to 4 scenario buttons; stroke `var(--accent)` at 35% opacity, 0.7px
- **Scenario section stays open:** no longer collapses on ctx button click — only closes on "Change scenario" re-click
- **History → Start talking coaching fix:** `_convOpenCSById` no longer calls `_wireCSEvents()` — that was nuking state before 200ms restore could show coaching
- **Feedback row:** resets on every `_applyAIToCtx` — thumbs re-appear for every new prompt

### v1.74i — JS-measured SVG branch curves
- **Dynamic SVG paths:** `getBoundingClientRect` measures "Change scenario" pill center + each ctx button at open time; `viewBox` set to real pixel dimensions; cubic bezier paths computed at runtime; `getTotalLength()` drives draw animation per path — origin always exact center-bottom of pill regardless of screen width

### v1.74j — Branch button position fix, mobile polish
- **Branch wrap layout:** `padding-top: 48px` pushes buttons below SVG drawing area — curves land correctly at button centers
- **Button row constrained:** `width: 72%; margin: 0 auto` — aligned with Change scenario pill width
- **Smaller button font:** `0.5rem`, `padding: 1px 4px 2px` — 4 buttons fit within confined width
- **Mobile overrides:** `padding-top: 36px`, `80% width`, `0.46rem` font at `max-width: 600px`



- **Click-outside-to-close:** `_convOutsideClickHandler` on `document` (capture phase) — non-interactive clicks outside panel close Stash; clicks on `button, a, input, [onclick], [role="button"]` outside panel keep it open
- **No scroll lock while Stash open:** removed `body.classList.add('cotd-open')` from `openConversations` — page scrolls freely
- **Open card stays backgrounded:** `_convOpenConcept` no longer closes Stash; switches category + scrolls card to `block:'center'` + opens it while panel remains visible
- **Backdrop passthrough:** `conv-overlay` is `pointer-events:none`; `conv-panel` retains `pointer-events:auto`
- **Smoother panel slide:** `0.28s cubic-bezier(0.25,0.46,0.45,0.94)` (was `0.32s cubic-bezier(0.22,0.61,0.36,1)`)
- **Reveal row centered:** `justify-content:center` on `.cs-reveal-row` — Change topic · Change scenario · Related concepts now centered
- **CS↔Stash sync fixed:** `_csRestoreOrLoad` now loads ALL saved aiData ctxs (not just active ctx); scenario tabs in CS modal reflect Stash-generated prompts immediately
- **Stash→sessionStorage write:** `_convGenerateCtx` writes to `sessionStorage` on success — CS modal picks up Stash-generated prompts without re-fetching
- **`_csUpdateScenarioBadges()` on restore:** coral `has-prompt` state accurate immediately on CS modal open

## v1.74b — 2026-06-07 — Stash scenario tabs, per-scenario save, cursor/scroll fix (v172.html)

- **Stash loading messages:** `_convGenerateCtx` rotates `_CS_LOAD_MSGS[ctx]` every 2.2s while API is in flight; `window._CS_LOAD_MSGS` exposed for cross-function access
- **Prompted tabs coral border:** `.conv-ctx-tab.prompted` — `border-color: rgba(196,122,122,0.35)` at rest; `0.6` on hover; applied on render (existing data) and on generate success
- **CS actions centered:** `.cs-actions { justify-content:center }` + Prev/Next wrapper loses `margin-left:auto`
- **Category filter pills wrap:** desktop `flex-wrap:wrap`; mobile keeps `overflow-x:auto`
- **Per-scenario Stash button:** `_csUpdateSaveBtn` checks `savedEntry.aiData[_csCtx]` — green only if current scenario has stored prompt; called on every scenario switch
- **Cursor/pointer reliability (Phase 7):** removed `cursor:grab` from `.nf-row` CSS (set inline only on `mousedown`); `.nf-row .concept-card { cursor:pointer }` always wins
- **Drag state stuck fix:** `document` mouseup fallback (`_docUpHandler`) in `initDragScroll` clears `isDown` if mouseup fires outside the row
- **Open-card drag skip:** `mousedown` and `mousemove` skip drag when target is inside `.concept-card.open` or `.card-back`
- **Card-back scroll fixed:** `wheel` event on `.card-back` stops propagation to row if card-back is scrollable; `overscroll-behavior:contain` + `touch-action:pan-y` on all card-back elements

## v1.74 — 2026-06-07 — CS modal polish, Stash inline generate (v172.html)

- **Feedback row spacing:** `.cs-feedback-row` CSS selector was orphaned (missing entirely) — restored; `gap:14px`, `margin-bottom:1.4rem`; thumbs no longer overlap Copy & Share
- **Scenario section stays open:** removing scenario collapse on scenario-only pick; section collapses only when topic changes
- **Rename:** "Related" → "Related concepts"; help bubble step 02 rewritten in both desktop bubble and mobile overlay
- **`has-prompt` color:** teal replaced with coral (`rgba(196,122,122,0.6)` border); active+has-prompt = `rgba(196,122,122,0.18)` fill + coral border; active without has-prompt = gold fill
- **Drawer SFX + one-open-at-a-time:** `playCardFlipSFX(isNowOpen)` added to `toggleEpCard`; `_currentOpenEpCardId` pattern; dim softened `0.1→0.35` dark / `0.45` light; reset on drawer close
- **Stash: all 4 scenario tabs always visible:** un-prompted tabs dashed+grey+`＋` suffix (`ungenerated` class); `_convDetailHTML` always renders all 4
- **`_convGenerateCtx()`:** new function — inline API call from Stash; pulse loading, fade-in content, storage merge to `lll_cs_saved_v1`; no modal switch required
- **`conv-more-scen-btn` superseded** by the new tab design

---

## v1.73b — 2026-06-07 — CS modal wiring pass, Stash fixes, button states (v172.html)

- **Coaching collapse on generate:** `_showCSLoading(true)` now fades coaching opacity → 0, then hides + clears content in 200ms; happens on every new generate including scenario change and category change
- **Generate button redesigned:** large gold block → DM Mono ghost pill (`0.65rem`, centred, `border-radius:999px`); consistent with pill button language across the modal
- **Reveal row + Prev/Next always visible:** `_csHidePostPrompt()` split — now only hides coaching/divider/feedback; `csRevealRow` and `csActions` are never hidden once a concept exists. All concept-load paths (`_csLoadNewConcept`, `_csSwitchCat`, `_csSwapConcept`) explicitly show them
- **`_csRestoreOrLoad(concept)`:** new unified restore function for Prev/Next and history open; checks session cache → saved storage → fresh generate. Prev/Next no longer blindly re-generate on every press
- **`_csUpdateSaveBtn()`:** new helper; called on every concept load, `_applyAIToCtx`, and `_csRestoreOrLoad`; always reflects real saved state from `lll_cs_saved_v1`
- **aiData deep-merge in `_csSaveConcept`:** `Object.assign({}, old, new)` per-ctx — saves from scenario B no longer wipe scenario A's openers/pitfall
- **Browse → Chat → CS modal:** `_convOpenCS()` now shows reveal row, actions, and generate button after opening
- **History "Start talking":** `_convOpenCSById()` rewritten to use `_csRestoreOrLoad`; buttons always present; openers/pitfall now restored from saved entry
- **`♡ Stash` / `♥ Stash`:** button label unified everywhere (was `♡ Save` / `♥ Saved`)
- **"More scenarios ＋":** moved from action row into scenario tab row (right-aligned, `margin-left:auto`); ghost gold pill style
- **`has-prompt` scenario buttons:** teal border (`rgba(90,191,175,0.55)`) + teal text when a prompt exists for that scenario; resets to gold when active
- **Help bubble direction:** opens right/downward (was leftward); arrow tip moved to top-left corner
- **Help text:** removed "plain English"; new closing line: `Now go say something worth saying! ✦` (Playfair italic gold, both bubble + mobile overlay)
- **Mobile "I feel epic!":** hidden from nav via `@media (max-width:768px)`; added as first item in hamburger menu with divider below; gold accent colour
- **Source label:** `An Epic Idea To Discuss From [podcast]:` / `An Epic Idea To Discuss:` (was `From [podcast]` / `An epic idea to discuss`)
- **Scenario label lag fixed:** `csOpener` updates immediately on scenario button click, before API fires
- **Smooth coaching transition:** `cs-coaching` has `transition: opacity 0.2s`; `_applyAIToCtx` fades out → swaps content → fades in
- **Swipe guard:** `moved` flag requires `|dx| > 8px` before swipe triggers; taps no longer accidentally load new concept
- **Prev/Next symbol size:** wrapped in `<span>` with `font-size:1rem`; button border/size unchanged
- **Fixed orphaned `cs-feedback-row` CSS:** missing selector restored; `gap:14px`, `margin-bottom:1.4rem`; Copy & Share button no longer overlaps thumbs

## v1.73 — 2026-06-07 — CS modal + Stash initial fixes (v172.html)

- **Save coaching bug fixed:** aiData deep-merge; openers/pitfall now saved across multiple scenario saves for same concept
- **Stash always opens on Saved tab:** `openConversations()` resets `_convTab = 'saved'` on every open
- **`_csUpdateScenarioBadges()`:** marks scenario buttons with `has-prompt` class after each `_applyAIToCtx` call
- **Scenario label instant update:** `csOpener` set on scenario button click, not waiting for API

---

## v1.72c — 2026-06-06 — CS modal restructure, Stash fixes, nav badge, prev/next (v172.html)

- **Modal element order:** source label → concept pill → generate button → prompt → coaching → Change topic · Change scenario · Related (reveal pills) → each expands below → divider → feedback → actions
- **? help button:** replaces "How does this work?" text link; sits right of headline; desktop hover shows speech-bubble tooltip (3 steps, appears outside modal surface); mobile tap opens overlay
- **Prev ⤺ / Next ⤻:** in-session concept navigation stack in actions row, right-aligned; ⤺ disabled on first concept, ⤻ disabled on latest
- **Change topic flow:** picking a category auto-opens scenario section; picking a scenario fires generate; both collapse after. Two-step sequence, no premature API call
- **Related moved into reveal row:** alongside Change topic · Change scenario; expands below them; "↑ Use this instead" auto-generates for swapped concept + pushes to nav stack
- **Nav Stash button:** coral special class removed; matches all other nav buttons; badge is the color signal
- **Badge:** reads today-only saves from `lll_cs_saved_v1` array directly; DM Mono tabular-nums; gold → coral at 5+; no text overlap
- **Saved tab Today group:** shows `Today  N saved` count inline in the date divider
- **Stash tab bug fixed:** `openConversations()` now respects `_convTab` state — no longer always renders Saved when opening
- **Cross-concept prompt contamination fixed:** `_csLogHistory()` removed from `_renderCSShell()`; only `_csLogHistoryWithPrompt()` writes history, after a successful API response
- **`_csSwapConcept` (Related → Use this):** now calls `_loadAI()` directly + pushes to nav stack
- **`openCSFromNav` re-open behavior:** restores last state; only auto-fires on true first open (`_csAIData === null`); shows generate button if concept exists but no prompt
- **Shimmer skeleton:** restored (3 lines); loading messages slowed to 3.5s; `cs-skel-msg` font size increased
- **Generate button:** redesigned — gold accent border, DM Sans 600, full-width, ✦ icon; replaces dashed ghost style
- **Source label:** `From [podcast]:` above concept pill using `col.podcast` field; fallback `An epic idea to discuss`
- **Magnetic pills:** restored — `RADIUS = 80` and `STRENGTH = 0.18` constants were missing from the file entirely

## v1.72b — 2026-06-06 — CS modal UX pass, skeleton, badge, layout (v172.html)

- **Breathing glow skeleton:** replaced shimmer lines (reverted to shimmer in v1.72c — breathing block was invisible in light theme)
- **`cs-post-prompt` visibility system:** all secondary elements (coaching, divider, feedback, actions) hidden until prompt loads; fade via `cs-hidden`/`cs-visible` class swap
- **`_csHidePostPrompt` / `_csShowPostPrompt`:** centralized show/hide for all post-prompt elements
- **Easter egg font:** DM Sans 700, `var(--accent)` gold, `letter-spacing: -0.02em`
- **Stash "Start talking about it" button:** Playfair italic, gold tint background, full-width, → suffix
- **Stash history category pill:** `display: inline-flex; align-items: center; justify-content: center`
- **Modal entrance animation:** `translateY(18px) + scale(0.97) → 0`, `0.32s cubic-bezier(0.22, 1, 0.36, 1)`
- **Concept pill hook removed:** term only when collapsed

## v1.72 — 2026-06-06 — CS modal: auto-open, auto-generate, zero-click UX (v172.html)

- **Auto-open on page load:** modal opens immediately; API fires at same moment; skips if dismissed today (`lll_cs_v1` gate preserved)
- **Defaults:** psychology category + friend scenario — silently, no UI decision required
- **Brand-voice loading messages:** 5 positioning messages on auto-fire; scenario-specific messages on manual re-generates; 3.5s rotation
- **`✦ Surprise me` button:** random concept from any category; becomes `→ Give me another one` after first use
- **Auto-save every generated prompt to history:** with `promptText` field; deduplicates by concept+ctx per day
- **"Start talking about it":** restores saved `promptText` from history into CS modal; no new API call; only fresh-generates if no promptText stored
- **EGG_PROMPTS:** expanded to 90 unique prompts (80 approved + 10 originals)
- **`_csLogHistoryWithPrompt()`:** new function; replaces `_csLogHistory()` for post-AI logging; includes promptText, ctx, ts
- **`openCSFromNav` fixed:** re-opens restore last in-memory state; generate button appears if concept exists but `_csAIData` is null

---

## v1.70 + v1.71 — 2026-06-05 — Clarity & minimalism pass (v170index.html — test branch, index.html untouched)

> **File scope:** All changes in this session apply to `v170index.html` only. `index.html` remains at v1.69. `cs-generate.js` is shared and was updated.

### UI / Nav
- Nav collapsed to 3 items: **Spark | Browse | Stash** (were: Episodes, Shorts, Concepts, Vault, Today, Prompts, Saved)
- Shorts section force-hidden from page (`display:none!important; height:0; padding:0; margin:0`) — empty space eliminated
- Episodes section visible by default (removed `display:none` — previously relied on buildEpisodes() to un-hide, caused flash)
- Browse nav button scrolls to `episodesSection` (episodes + concept grid both visible below)
- Nav hover emojis: 💬 Spark, 📚 Browse, 🔖 Stash — span-based (not `::before`) for vertical alignment; `0.35s ease`, no bounce
- **"😎 I feel epic!"** hidden button inside `nav-right`; fades in on nav hover via `max-width` transition; does not affect grid layout
- Mobile menu reordered: ◎ Spark | ◈ Browse | ◆ Stash | ◉ Sign Up — "How it works" removed

### CS Modal restructure
- New order: heading → category → concept pill → scenario → generate → prompt block → coaching → divider → feedback → actions → related
- "Continue →" button removed
- Related concepts: now a `◈ Related` cs-btn style button in the actions row; toggles pills below; collapses on new concept load
- Per-scenario generation: one API call per scenario tab (~75% cost reduction vs all-4); auto-generates on tab switch after first generate
- `cs-generate.js` updated to single-ctx mode: POST body accepts `ctx` param, returns `{ ctx: {...} }` (400 tokens → 700); legacy all-4 mode preserved as fallback
- **Critical bug fixed:** duplicate `export default` in `cs-generate.js` caused Vercel parse failure → instant 500 on every request
- Generate button now resets to "✶ Try again" on both error paths (was stuck on "Generating…" forever)
- Loading messages now per-scenario (4 variants × 4 scenarios = 16 total), all with fitting emojis
- `initConversationStarter()` no longer calls `openCS()` on page load — modal only opens via Spark button

### Stash (formerly Saved)
- Panel renamed: Stash, 🔖 icon
- Saved concepts grouped by date under "Today / Yesterday / June 4th" dividers
- Scenario filter row hidden (all cards show all scenarios regardless)
- History tab: concept left + category + "Ready to talk about it?" action button; timestamp right-aligned
- "Ready to talk about it?" opens CS modal fully loaded with that concept + correct category active
- History deduplication: same concept logs only once per day (was logging every page load)
- `_convOpenConcept()` (Open card from Stash): sets category filter to concept's own category, calls `buildCats()` + `buildGrid()` directly — no `setCat('all')` which triggered full 580-card render
- Backdrop-filter blur removed from Stash panel overlay (was causing 500–1300ms pointer lag)
- Scenario filter row hidden from Saved tab (useless — all cards always show all scenarios)

### Nav badge (Stash counter)
- Badge on Stash button: gold (1–4 saved today), teal `#5abfaf` at 5+ (not red — positive signal)
- Badge resets daily (count only; concepts stay permanently); stored in `lll_badge_date_v1` + `lll_badge_count_v1`
- Badge hidden at 0, updates live on every save/unsave

### Cards + gamification
- Vault/master button hidden from all cards (logic + localStorage intact)
- Daily goal bar + streak counter hidden entirely (UI only — data preserved)
- Quiz pill added after category pills: inherits `.cat-card` + `.cat-name` font exactly; teal `#5abfaf` fill

### Easter egg
- 3 taps on `Epistemic.` logo → random prompt overlay (10 hardcoded prompts)
- Prompts with colon separator split into gold DM Mono lead-in + Playfair italic question on new line
- "😎 I feel epic!" nav button triggers same overlay
- Backdrop-filter removed from egg overlay (was causing 800ms lag)

### Hero copy
- CTA: "Say something worth saying →" — opens CS modal directly (was scroll to library)
- Sub-copy: "The people who always have something interesting to say aren't smarter. They just don't let good ideas die in their earbuds." (one flowing paragraph, 2-line wrap) + "Neither does Epistemic."

### Feedback
- 👍 / 👎 report-back: 8 warm rotating lines each (hardcoded); shown inline for 6s; no data stored
- `csFeedbackMsg` div added to CS modal for message display

### Mobile fixes
- P18: concept expand text `0.78rem`, episode action pills wrap — no internal scroll
- P19: eyebrow `padding-right: 2rem` prevents date overlapping ✕ button

---

## v1.69b — 2026-06-04 — Nav polish: dividers, darker Saved colour, emoji on hover, "Use this instead"

- **Nav dividers:** `nav-tools-divider` now flanks the Prompts+Saved cluster: `Today | Prompts Saved | Map | Quiz`
- **📚 emoji on Saved:** hidden at rest (`width:0; opacity:0`), slides in on hover — identical pattern to 💬 on Prompts; `inline-flex + align-items:center` keeps baseline locked
- **Saved colour:** `#a85e5e` — visibly darker coral sibling of Prompts (`#c47a7a`); signals connected feature without being identical
- **"↑ Use this instead"** on related concept accordions: swaps active CS concept, clears `_csAIData`, resets generate/save buttons, collapses pill expand, brief opacity flash confirms swap — user immediately ready to generate for the new concept

## v1.69 — 2026-06-04 — Conversations: storage infrastructure + full overlay

- **`lll_cs_history_v1`:** ring-buffer (cap 50) logs every CS concept view — concept ID, term, category, active scenario, ISO timestamp; written on every `_renderCSShell` call, fire-and-forget in try/catch
- **Shared storage helpers:** `_csSaveConcept()`, `_csUnsaveConcept()`, `_csIsSaved()` — single source of truth; swipe-right and Save All both route through these. Schema always `{ id, term, category, savedAt, aiData|null }`
- **Swipe-right upgraded** to full object schema (was saving bare ID array)
- **`💬 CHAT` button** on every concept card back face (browse grid + drawer); reads `_csIsSaved()` on render; toggles saved/unsaved in-place; fires `concept_saved_to_cs` Umami event; updates Conversations list if overlay is open
- **`btn-chat` CSS:** coral ghost button, `.saved` state with filled tint — scoped alongside `btn-master` / `btn-share`
- **Conversations overlay (`#convOverlay`):** full-viewport slide-in from right (`translateX` transition, 520px capped, 100vw on mobile); `cotd-open` scroll-lock reused
- **Saved tab:** search by term (live filter), category pills (auto-built from saved data), scenario filter (All/Partner/Friend/Colleague/Meeting); entries sorted newest-first
- **Entry expand:** inline grid-row accordion; shows all 4 scenario tabs with prompt / "Try saying" openers / "Watch out for" pitfall; `aiData:null` entries show "Generate starters →" which opens CS modal pre-loaded with that concept
- **Delete with undo:** 4-second undo toast, then permanent; also removes `.saved` class from card buttons in the DOM
- **Soft cap:** warning banner at 90 entries; non-blocking at 100
- **Device-local note:** one-line copy in the filter area
- **History tab:** last 50 CS views, reverse-chronological, read-only; shows term, category, scenario, timestamp
- **Empty states** for both tabs (on-brand, coral accent)
- **📚 Saved** in desktop nav + mobile nav
- **CS pill expand fix:** restored dropped rules (`> * { min-height:0 }` + `.cs-expand-inner { padding: 0 16px }`) that caused content to bleed through when collapsed

---

## v1.68d — 2026-06-04 — Conversation Starter: smooth expand, loading messages, episode meta, drawer back button

- **Smooth expand/collapse** on concept pill + related pills: CSS `grid-template-rows: 0fr→1fr` technique — no JS height measurement, minimal GPU cost. 0.35s on main pill, 0.32s on related
- **Expand SFX:** lightweight noise-burst swoosh (gain 0.07) — rises on open, settles on close
- **YouTube timestamp fix:** replaced manual `?t=NN` with `buildTimestampedUrl()` (correct `?t=NNs` format + 8s pre-roll buffer)
- **Episode meta redesigned:** action buttons (Watch + More from episode) on one row; episode title pill below as reference
- **Animated loading messages:** 4 rotating phrases during AI generation (2.8s cadence, fade transition) — keeps user engaged during 10s wait
- **"← Prompts" back button** in episode drawer — appears only when navigated from CS modal; closes drawer + re-opens CS without resetting state
- **Drawer category pills light mode fix:** `opacity: 0.75` baseline in light theme

## v1.68c — 2026-06-04 — Conversation Starter: concept pill, Playfair font, save all, coral nav, 2×2 mobile

- **Concept expandable pill** at top of modal: term + hook teaser; expands to full plain explanation + episode link + drawer entry
- **Prompt text** switched to Playfair Display (editorial serif, on-brand)
- **Section labels:** "Category" / "Scenario" in DM Mono caps before filter rows; divider line between concept pill and filters
- **Mobile 2×2 grid** for scenario buttons (Partner/Friend | Colleague/Meeting) below 480px
- **Opener labels:** "Try saying" / "Or try" (conversational, not product-y)
- **Feedback thumbs:** green outline on 👍, coral outline on 👎 before dismissal
- **Save All button:** stores concept + all 4 AI variations to `lll_cs_saved_v1` localStorage; fires `cs_saved` Umami event
- **Nav 💬 Prompts:** coral (#c47a7a); emoji hidden by default, bounces in on hover (`csEmojiPop`)

## v1.68b — 2026-06-04 — CSS layout fix + CS modal UX restructure

- **Critical fix:** orphaned `.newsletter { position: relative;` CSS rule from Python replacement broke entire browse section and newsletter layout
- Concept/category moved under headline; Generate button user-triggered; openers labelled "Idea 1/2" (later renamed); "Related concepts" label added

## v1.68 — 2026-06-04 — Conversation Starter modal (full feature)

- **Claude API generation** via `api/cs-generate.js` serverless function: 4 context-adapted prompts + 2 openers + 1 pitfall per concept; ~$0.001/user/open
- Responses cached in `sessionStorage` per concept — tab-switching is instant
- **Category filter pills** (scrollable); switching = new random concept + new API call
- **Context buttons** swap full AI-generated prompt (not just opener prefix)
- **Coaching layer:** "You could say" openers + "Watch out for" pitfall
- **Swipe left** (skip) / **right** (save to localStorage); visual tilt + overlays
- **Related concept accordion** pills with analogy + prompt expand
- **Report back 👍/👎** appears 2s after load; fires `prompt_feedback` Umami
- **💬 Prompts nav button** (desktop + mobile); bypasses dismissed-today check
- COTD modal disabled (commented out, fully preserved for reactivation)

## v1.67 — 2026-06-04 — Conversation Starter modal v1 + streak loss-aversion + Umami events

- COTD modal commented out; replaced by Conversation Starter (same daily trigger)
- Streak warning state: amber colour + label change when streak >2 and goal not met; session flag prevents re-trigger
- Umami: `concept_opened`, `goal_completed`, `prompt_shared`

---

## v1.66b — 2026-06-03 — Bug fixes: concepts loading + card blip SFX + map riser

- **Critical fix:** `initMagneticShortPills` was missing `const bar` declaration after mobile magnetic guard was added — caused `ReferenceError: bar is not defined` inside `render()` → caught by `loadConcepts()` catch block → showed false "Could not load concepts" error. Site was broken for all users.
- **Card blip fix:** Streak milestone fanfare (C→E→G) was firing on every card open once daily goal was already met. Added `_streakMilestonePlayed` session flag — now fires once per session maximum.
- **Map riser fix:** Replaced gesture-triggered `playMapRiserSFX()` with pre-scheduled suspended `AudioContext` that resumes on first user interaction — riser now plays from t=0 immediately on first touch.

---

## v1.66 — 2026-06-03 — Full SFX suite + mobile magnetic removal

- **Nav SFX** extended to Episodes, Shorts, Concepts, Vault (desktop + mobile)
- **Pill SFX** swapped from glass tap (900Hz) to soft tick (80→200Hz sweep)
- **Mobile magnetic effect** removed on all touch devices — eliminates 0.5–1s pill render lag on mobile (all 4 `initMagnetic*` functions now skip on touch)
- **Start Learning SFX** — sword-drawn slash: sub thud (60Hz) + noise burst + twin sine stabs (800Hz + 1100Hz)
- **Theme toggle SFX** — bright ascending chirp (light mode: 880→1320Hz) / descending sawtooth laser (dark mode: 580→55Hz)
- **COTD modal SFX** — filtered noise swell + 440Hz sustain on open
- **Streak milestone SFX** — C→E→G fanfare fires once when 5th concept opened today
- **Vault remove SFX** — descending A5→E5 at 65% volume, distinct from vault-add rising sound

---

## v1.65 — 2026-06-03 — Mastery sync fix + mobile nav reorder + pill/nav SFX

- **Mastery sync fix:** `loadMastered()` now coerces stored IDs to integers — map.html stored string IDs, index.html checked integers → concepts mastered on map didn't show as mastered on index
- **Mobile nav reorder:** Sign Up promoted to top, Map + Quiz moved to second group, How It Works at bottom. Three dividers added between groups.
- **Mobile Map/Quiz/Signup highlight styles** — purple tint (Map), teal tint (Quiz), gold pill (Signup) matching desktop counterparts. Added via CSS classes.
- **Pill SFX (glass tap → later changed to soft tick):** category pills, podcast pills, person pills, drawer category pills
- **Nav SFX (double tick, 200+300Hz):** Map, Quiz, Signup, Today — desktop and mobile

---

## v1.64b — 2026-06-02 — Map pill violet, card tint front-face only

- Nav map button recoloured: gold → violet (`var(--purple)`) on both dark and light mode; distinct from gold signup button and teal quiz pill
- Card category tint moved from `.concept-card` wrapper to `.card-front` only — tint no longer bleeds through during flip animation; back face unchanged (`var(--surface2)`)
- Tint strength: 11% via `color-mix(in srgb, var(--cat-color) 11%, var(--surface))`

## v1.64 — 2026-06-02 — Category card tint, SFX fix, podcast pills, map spacing

- Concept card fronts tinted with category color at 7% opacity via `hexToRgba()` helper — readable, doesn't fight text
- SFX AudioContext fix: shared `_sfxCtxPool` instance, `.resume()` on first mousedown/touchstart — fixes silent flip on return visits
- Hero card flip now plays whoosh SFX
- Podcast filter pills added above Browse Episodes; clicking a pill or podcast heading filters to that podcast; gallery grid (3-col desktop, 2-col mobile) when single podcast selected; `setEpisodePodcast()` function added
- Browse concepts grid now excludes `duplicate_of` entries from count and render
- Map: nav font → DM Mono uppercase; counter excludes duplicates; duplicate dots removed from constellation
- Map: orbit radius 0.44 → 0.52; alternating ±4% jitter per category node; innerR `80+length*1.8` → `90+length*2.0`
- Nav signup button: pulse animation killed; replaced with static `box-shadow: 0 0 10px rgba(232,213,163,0.35)` + static `::after` ring
- Newsletter section: 3-step `<ol>` with CSS counter circle icons replacing inline arrow text

## v1.63 — 2026-06-02 — Podcast pills, SFX, hero flip, card tint, dedup, map, signup glow, newsletter steps

(merged into v1.64 above — these were the same session's interim builds)

---

## v1.62 — 2026-06-02 — UX polish: daily category, SFX, light mode colours, Tally bg

- Browse section now shows one random category on load (day-deterministic, cycles all 14) instead of rendering all 580+ cards; full library still accessible via pills
- Card flip SFX: soft whoosh (low-pass filtered noise sweep, 180ms) via Web Audio API — no external files; opens bright (400→2200Hz), closes settling (800→300Hz); respects `prefers-reduced-motion`
- Light mode: category pills and `card-cat` labels darkened via CSS `filter: brightness(0.72) saturate(1.4)`; quiz pills (`quiz-cat-pill`, `quiz-review-cat`, `quiz-cat-chip`) fixed separately with `brightness(0.6)` — they use inline JS hex colours so CSS class selectors don't reach them
- Card back borders and analogy rules increased opacity via `color-mix` in light mode
- Tally iframe wrapped in `.tally-wrap` div; background fixed to `#1e1b18` on both themes — reads as seamless dark on dark mode, intentional dark card on light mode parchment
- Unsubscribe audit: `subscribe.js` confirmed clean; `{{ unsubscribe_link }}` is Brevo-side only

---

## v1.61 — 2026-06-02 — Brevo welcome sequence + email copy

- Built 2-email Brevo automation: Email 1 (immediate) + Email 2 (7-day delay)
- Email 1: Founding Member confirmation + 50% Pro lifetime discount + "reply with Epistemic" deliverability mechanic
- Email 2: Personal story (dinner fumble) → 3 concepts (Mental Masturbation / Minimum Viable Vision / Value Creator Over Entertainer)
- Subject lines: "Epic. You're a Founding Member." / "The concept that made me build this"
- Stripped all Brevo template chrome: no logo, no first-name merge tag, no banner — plain text style only
- Added unsubscribe footer manually with `{{ unsubscribe_link }}` variable
- Updated `subscribe.js` success message to prompt checking Promotions tab
- `[join here]` P.S. link → `https://www.epistemic.live/#signup` (anchor confirmed working)
- Identified `#signup` scroll-reset bug (race condition with concepts render) — fix deferred to next session

---

## v1.60 — 2026-06-01 — Founding Member survey (Tally embed)

- Replaced 4-field feedback popup with Tally.so founding member survey (11 questions)
- Survey triggers after newsletter signup — same `openFeedbackModal()` flow
- Tally form ID: `81MMOA` — responses sync to Google Sheets (`Epistemic — Founding Members`)
- Modal width increased: `max-width: 480px` → `960px`
- Modal height: `padding` updated to `28px 20px 20px`, added `max-height: 88vh; overflow-y: auto`
- Daily goal bar z-index bug fixed: missing `</div>` on feedbackSheet caused bar to be swallowed as a child of the modal; added closing tag + `body.feedback-open .daily-goal { display:none }` CSS rule removed in favour of z-index layering alone

---

v1.59a–d — 2026-06-01 — Founding Member newsletter redesign + nav overhaul

Newsletter section
- Label: "The Weekly Drop" → "FOUNDING MEMBERS"
- Heading: "5 concepts. Every Sunday." → "*Ideas* worth keeping." (italic accent)
- Sub: new 2-sentence copy — "Listening to podcasts is entertainment. Owning what you heard is power." + 3-step incentive line
- Button: "Subscribe" → "Free Founding Access"
- Trust line updated; removed "Founding members lock in their discount before launch" (redundant)

Nav — desktop
- Removed "Sign up" from nav island
- Added `nav-signup-btn` (accent pill, pulse ring, magnetic hover) to `nav-right` after theme toggle
- Removed "How it works" button from desktop nav entirely
- Nav pill label: "free" → "ideas"
- `nav-right` gap increased to 1.4rem to prevent pulse ring overlap with theme toggle

Nav — mobile
- `hiw-trigger` hidden on mobile via media query
- "How it works" moved into hamburger menu
- Mobile sign up entry updated to "◉ Sign Up 🎁 — Free Founding Access"

---

## v1.58 — 2026-06-01 - Migrate from Beehiiv to Brevo Newsletter

### Changed
- Migrated newsletter signup from Beehiiv to Brevo (`/api/subscribe.js`)
- Updated newsletter copy: added 6-month Pro trial incentive
- Updated trust line: "Free forever. No spam. Unsubscribe anytime."

### Added
- `/api/feedback.js` — post-signup feedback form, delivers to getepistemic.app@gmail.com via Brevo transactional email
- Feedback popup modal (bottom sheet) triggered on successful newsletter signup
- 4 feedback fields: discovery source, visit frequency, Pro wishlist, free version frustration

---

## v1.57 — 2026-05-31 — Quiz end screen: inline concept expand

### Quiz end screen accordion expand
- Added "↓ More / ↑ Less" toggle button to each concept row on the end screen
- Clicking expands an inline panel showing: plain definition, analogy, prompt
- Accordion behaviour — only one row open at a time
- CSS `max-height` transition only — zero JS layout cost, no fetch, data lives in `quizState.pool`
- Button order per row: `[↓ More]` · `[⊕ Vault]`
- Prompt field rendered in accent italic

### New CSS classes
`.quiz-end-concept-header` — flex row wrapper inside each concept row
`.quiz-end-expand-btn` — More/Less toggle button
`.quiz-end-expand-panel` — collapsible container, max-height animated
`.quiz-end-expand-inner` — padded inner content area
`.quiz-end-expand-field` — label + text pair per field
`.quiz-end-expand-label` — DM Mono uppercase field label
`.quiz-end-expand-text` — DM Sans body text for field value

### New JS
`window.qecExpand(id)` — accordion toggle; closes all other panels before opening

---

## v1.56d — 2026-05-31 — Light/dark mode + INP fix

**Feature:** Light/dark mode toggle — sun/moon pill button in nav-right (before "How it works").
- `[data-theme="light"]` on `<html>` via `localStorage` key `lll_theme` (default: dark)
- Flash-prevention inline `<script>` in `<head>` applies theme before CSS paints
- Full light token palette: warm parchment `#f5f2ed` bg, near-black `#1a1814` text, darkened accent/semantic colors for contrast
- Light-mode overrides for nav, mobile menu, drawer backdrop, quiz backdrop, COTD overlay, noise opacity, card shadows, goal bar
- Toggle button styled as existing nav pill (DM Mono, uppercase, pill border)
- `color-scheme: dark / light` on `html` declared for browser paint hint

**Performance fix:** Removed broad `transition-property` block that was applying background/color/border transitions to hundreds of DOM nodes simultaneously — was the sole cause of 860ms INP on theme switch. Theme switch is now instant. Individual component hover transitions unaffected.

**Scope exclusions:** `extract.html`, `upload.html`, `map.html` — internal/separate pages, not themed.

---

## v1.55a — 2026-05-31 — Bug fixes + UX polish (quiz, vault, share, nav, mobile)

**Fixes:**
- Critical SyntaxError fix: duplicate `let _r2hintRevealed` inside `renderRound2` silently killed the entire second script block — quiz, vault buttons, and COTD all broken as a result. One line removal resolved all three.
- COTD: added ↑ Share button wired to the same share modal/canvas flow.
- Share card: full content now rendered (term → hook → The Idea → The Picture → Use it today). Format changed to portrait 1080×1350. Removed duplicate `epistemic.live` text from middle of card.
- Quiz fill-in-blank: replaced auto-advance after 1.4s with a manual Continue button. Replaced random letter chips with a progressive Hint button (reveals one character per tap, max 3).
- Card grid: only one card open at a time — opening a new card auto-closes the previous one (`_currentOpenCardId` tracker).
- Nav: Map + Quiz separated from main links by a visual divider. Quiz pill styled in teal to distinguish from Map's gold.
- Mobile goal bar: `"0 of 5 concepts opened today"` text hidden on mobile; dots + streak now visible side by side in a single row.

---

## v1.55 — 2026-05-30 — Drawer close scroll glitch fix

**Symptom:** After the drawer slid down, the page visibly "threw" from the
top back to the original scroll position — smooth-scroll CSS animated the
scroll restoration.

**Fix:** Temporarily override `scroll-behavior` to `auto` before restoring
`scrollTop`, then re-enable after one rAF. One-liner inside `closeEpisodeDrawer`'s
400ms setTimeout.

**Result:** Open ~144ms · Close ~90ms · All pointer interactions <200ms.

---

## v1.54 — 2026-05-29 - Drawer performance overhaul

**Symptom:** Episode drawer felt sluggish on desktop (INP ~900ms) and unusable on mobile. CLS was 0.57.

**Fixes:**
- Deferred Fuse.js (`<script defer>`) and added `preconnect` for `fonts.gstatic.com`
- Removed `will-change: transform` from drawer cards and nav links (was forcing permanent GPU layers)
- Replaced CSS `:has()` selector with JS `.has-open` class toggle on `#epDrawerGrid`
- Switched `body.drawer-open` hidden sections from `visibility: hidden` → `display: none`
- Dropped `backdrop-filter: blur(3px)` from nav; bumped opacity 0.92 → 0.96
- Moved `#netflixRows` min-height reservation from JS to CSS (kills load-time CLS)
- Halved box-shadow blur radii on all concept cards
- Removed forced reflow (`void col.offsetWidth`) in `filterDrawerCat`
- Added `contain: layout paint` to `.ep-cat-column` and its concept cards
- Moved drawer markup out of `.app-controls` to top-level (was being hidden by parent's `display: none`)
- Split `openEpisodeDrawer` into instant slide-up + deferred content render (2× rAF)
- Split `closeEpisodeDrawer` into instant slide-down + 400ms deferred page-section reveal
- Stopped `toggleEpMaster` from calling `buildGrid()` — now updates cards in-place

**Result:**
- INP on drawer open: 896ms → ~150ms
- INP on drawer close: ~800ms → ~50ms
- CLS: 0.57 → expected ~0.1

## v1.54 — 2026-05-19 — Umami analytics + custom event tracking

**Shipped**
- Umami Cloud (free Hobby tier) installed via single script tag in `<head>`. Cookieless, no consent banner — fits brand. Page views + returning-visitor (D7 retention) tracking live.
- `track(n, d)` safe-wrapper helper added (try/catch, no-op if Umami blocked/unloaded).
- 5 custom events wired: `concept_mastered`, `quiz_started`, `cotd_opened`, `share_clicked`, `newsletter_signup` (last fires only inside `if(response.ok)`).
- Map tracking added: `map_opened` (index nav), `/map` page views + time-on-page (Umami script added to `map.html`), `map_node_click`. Umami script now in 2 files.

**Files touched**
- `index.html` only (1 script tag, 1 helper fn, 5 one-line event calls). No logic changed.

**Known gaps**
- Custom events visible in Umami Events panel; D7 retention is in Reports → Retention (not dashboard components).
- Self-exclusion via `localStorage.setItem('umami.disabled',1)` per-browser only. Phone not excluded (Web Inspector method too fiddly for one-off). IP filter is paid-only — acquired automatically at monetization.

---

## v1.53 — 2026-05-18 — Episode drawer card redesign (accordion → 3×3 grid)

**Shipped**
- Drawer concept cards reworked through several iterations, landing on: desktop = 3-column grid (≤9 cards, no scroll); mobile = single vertical column (unchanged feel). Only the active category renders; switching pills swooshes the new grid in (`epColSwoosh`, translateY).
- Cards are now uniform flip cards sized to grid cells (no deck overlap, no tilt, no height-morph). Click flips in place + scales to 1.03; every other card dims to 0.1 via `:has()`.
- Action buttons (Vault / Share / Listen) moved to TOP of the back face — applied to both drawer cards AND Browse-concepts (`buildGrid`), with shared `.card-actions-top` + `.card-actions-divider`.
- Fixed the long-standing top-padding bug: first card's term hidden under the sticky category header.

**Files touched**
- `index.html` only (CSS; no JS logic changes — `toggleEpCard`/`filterDrawerCat`/markup unchanged).

**Known gaps**
- Long concepts' flipped back face may scroll slightly inside a 1/3-width grid cell (`.card-back` has `overflow-y:auto`). Card height (340px) is a one-number tuning knob if it feels cramped.
- "Float-to-center" card animation (Option B) was repeatedly proposed and deliberately PARKED as lag-prone — own future session if ever wanted.

---

## v1.52 — 2026-05-18 — Build C: evergreen concept backfill (underrepresented categories)

**Shipped**
- 70 new evergreen concepts added directly to `concepts.json`, IDs 517–586. All `source: "core"`, `collection_id: null`, `duplicate_of: null`, full 11-field schema, `related_ids` cross-linked within and across batches.
- Per-batch: creativity +14 (517–530), science +8 / health +8 (531–546), language +14 / finance +11 (547–571), tech-ai +15 (572–586).
- Category counts: creativity 7→21, science 10→18, health 10→22, language 15→29, finance 18→29, tech-ai 19→34. Every category now ≥18. Library 514→584.

**Files touched**
- `concepts.json` only. No HTML/JS/pipeline touched — pure data append.

**Known gaps**
- Existing `science` and `tech-ai` categories still contain legacy speculative/fringe cards (warp bubbles, UAP, mind-controlled craft) that diverge from the quality-rules definition. New cards re-anchor toward "how knowledge is made" / "digital systems" but the old cards were not removed (out of scope this session).

---

## v1.51 — 2026-05-18 — Cross-episode duplicates + stat/progress alignment

**Shipped**
- `publish-batch.js`: cross-episode repeats no longer rejected. If a term already exists, the new concept publishes with `duplicate_of: <original_id>` (lowest existing id for that term). Same-term-twice within one batch still rejected. Every concept now carries a `duplicate_of` field (null for originals).
- `index.html` Build A: hero stat band reordered Concepts → Episodes → Categories; "5/day Daily Goal" removed; new `heroEpisodeCount` (counts collections.json entries with type episode|short); concept/nav counts now exclude `duplicate_of` cards.
- `index.html` Build A2: `updateProgress()` excludes `duplicate_of` so the browse progress bar matches the header count.

**Files touched**
- `publish-batch.js`: `termToOriginalId` map, removed hard duplicate reject, `duplicate_of` on every appended concept
- `index.html`: `hero-stats` markup, `updateHeaderCounts()`, `updateProgress()`

**Known gaps**
- `publish-concept.js` (legacy single publisher) still hard-rejects duplicates — intentionally left, not in production path
- Orphan-duplicate cleanup is manual by design (no auto-overwrite in pipeline)

---

## v1.50 — 2026-05-18 — Related IDs backfill complete (full library connected)

**Shipped**
- All ~462 legacy concepts now have `related_ids` — every concept on the map shows connections, not just the original 25
- `backfill-related-ids.html` extended with Mode 2: AI auto-suggest. Claude scans the full library and assigns 3 cross-category-preferred related IDs per concept, commits per-batch directly to GitHub
- Anthropic API key field added to the tool (saved in browser like other keys)
- Map drag fix: dragging/scrolling with a concept panel open no longer closes the panel (5px drag threshold distinguishes drag from click)

**Files touched**
- `backfill-related-ids.html`: Mode 2 (`runAI`, `askClaudeForRelatedIds`), per-batch commit, progress bar, inline-array JSON formatter
- `map.html`: `dragMoved` flag in mousedown/mousemove/click handlers

**Known gaps**
- Backfill tool retained but its one-time job is done; future concepts get related_ids via extract.html pipeline automatically

---

## v1.49 — 2026-05-17 — Concept Map v2: Relationship Layer

**Shipped**
- `related_ids` field added to concept schema — array of 3–5 integer IDs linking semantically related concepts across the library, prioritising cross-category connections
- Extraction pipeline updated to generate `related_ids` automatically: both `extract.html` (browser-direct) and `extract-concepts.js` (Make/Vercel) now fetch the live library and pass it to Claude as `EXISTING_LIBRARY` before extraction
- Bidirectional relationship index built at page load in `map.html` — forward and reverse links both work from a single `related_ids` field per concept
- Map panel: episode attribution pill added (podcast name + episode title, links to episode URL, colored dot per category)
- Map panel: "Related concepts" section added — clickable category-colored pills, navigates map to related node and opens its panel
- Map visual edges: selecting a concept draws faint dashed gold lines to all related nodes; lines fade out on deselect. No persistent hairball — selection-only.
- `publish-batch.js` updated to read "Related IDs" from Airtable (comma-separated string) and write as integer array to `concepts.json`
- Airtable: "Related IDs" text field added to Concepts table

**Files touched**
- `extract.html`: `EXTRACTION_PROMPT` schema + RELATED IDS rules section; library fetch + injection in both `runExtraction()` and `runShortExtraction()`; `buildAirtableFields()` writes Related IDs to Airtable
- `extract-concepts.js`: library fetch before Claude call; Related IDs field written to Airtable
- `publish-batch.js`: reads + parses Related IDs string from Airtable; writes `related_ids` array to `concepts.json`
- `map.html`: `COLLECTIONS` state + parallel fetch; bidirectional index; episode pill; related pills; `navigateToRelated()`; edge layer + `drawRelationshipEdges()` + `clearRelationshipEdges()`; `data-cx`/`data-cy` on concept node `<g>` elements

**Known gaps**
- Existing 422 concepts have no `related_ids` — backfill tool planned (separate session)
- `SHORT_EXTRACTION_PROMPT` in `extract.html` does not include `related_ids` — short clips will not generate links until updated

---

## v1.48 — 2026-05-17 — Concept Map page (constellation view)

**Shipped**
- New standalone page `map.html` at `/map` — radial constellation view of the full concept library. 14 category nodes arranged in a circle, concepts orbiting their category, connected by faint lines.
- Mastered concepts render as filled nodes; unmastered as hollow outlines. Reads/writes the same localStorage keys as the main site (`mastered_v1` + legacy `mastered`).
- Click a concept node → side panel slides in with full card (term, hook, plain, analogy, prompt) + Mark Mastered button. Click a category node or legend item → dims others, zooms to that constellation.
- Pan (drag/touch), zoom (wheel/pinch/buttons), search bar (highlights matches, dims rest), left-side category legend. Mobile: panel becomes bottom sheet, legend + zoom controls hidden.
- Relationship model is **category proximity only** (MVP) — no relationship data needed. Embedding-similarity edges deferred to a later phase.
- `vercel.json` added to repo root with `{ "cleanUrls": true }` — serves `map.html` at `/map`, keeps `index.html` at `/`.
- Highlighted "◈ Map" nav button (styled like `◈ Quiz`), placed first in both desktop and mobile nav. Duplicate plain Map links removed.

**Files touched**
- `map.html`: new file
- `vercel.json`: new file
- `index.html`: nav island + mobile nav (Map button + `.nav-map-btn` CSS)

---

## v1.47 — 2026-05-17 — Card redesign, UX fixes, share card redesign

**Shipped**
- Concept cards in browse rows converted to 3D flip cards — fixed height (370px desktop / 360px mobile), `rotateY(180deg)` on click, front shows term + hook + "tap to explore" hint, back shows definition/analogy/prompt/actions. Scoped to `.nf-row` only via CSS.
- Drawer cards unchanged — remain accordion expand. Scoped to `.ep-cat-column`.
- `toggleCard()` updated — no longer closes other cards on open. Each card flips independently.
- `toggleMaster()` rewritten — no longer calls `buildGrid()`. Updates card state in-place (class, button text, mastered badge). Vault click no longer resets scroll position.
- Action buttons: Listen `↗` emoji replaced with `▶` (avoids iOS blue Unicode arrow); Share button gets `↑` prefix for visual consistency with Vault's `⊕`.
- Share card redesigned: square 1080×1080 format (was landscape 1200×675). Front-face only — category pill, concept ID, large serif term, italic hook, footer with Epistemic. branding. Canvas element updated to match.
- Episode search empty state: section stays visible when search returns zero results; shows "No episodes match your search" message instead of hiding the entire section including the search bar.
- Shorts search bar moved to static HTML header (same row as "Browse shorts" title), removed from JS-rendered block. Consistent with Episodes pattern.
- Drawer category pill row: `padding-top: 1rem` added — pills no longer sit flush against the separator line.
- Shorts filter pill color fixed: `var(--text-muted)` (undefined token, renders white) replaced with inline styles + `.short-filter-pill.active` CSS rule.

---

## v1.46 — 2026-05-17 — Shorts section overhaul + search bar consistency

**Shipped**
- `getYouTubeId()` extended to handle `/shorts/` URLs — thumbnails now fetch correctly for all short collections.
- `renderShortsSection` replaced: all shorts render as uniform `episode-card` components (same as episodes), opening the existing episode drawer on click.
- Single horizontally scrollable row (sorted by `aired_date` desc) replaces the old creator-grouped multi-row layout.
- People filter pills above the row — "All" + one pill per creator. Clicking filters the row in place. Magnetic gravity effect applied matching nav + category pills.
- `filterShorts(person, searchText)` — combined person + text filter, updates pill active state and re-renders the card row without a full rebuild.
- Search bar in shorts section now matches episodes/concepts search bar visually: `search-wrap` div with magnifying glass SVG icon, DM Sans font, 8px border-radius, right-aligned via `margin-left:auto`.
- Filter bar constrained to `max-width:1100px; margin:0 auto; padding:0 2rem` — pills no longer bleed to screen edge.
- `initMagneticShortPills()` — same magnetic cursor pull as category pills and drawer pills.
- `collections.json` updated: collections 506–512 added (all `type: "short"`), covering Dan Koe, Mark Manson, and Alex Hormozi shorts with correct YouTube Shorts URLs.
- Collections 506–512 fix orphaned concepts 413–424 which were live but had no drawer or thumbnail.

**CSS added**
- `.shorts-filter-bar`, `.short-filter-pill` (+ `.active`/`:hover` states), `.shorts-search` — replaced with `search-wrap` pattern for consistency

**JS added/changed**
- `getYouTubeId()` — handles `/shorts/`, `watch?v=`, and `youtu.be/` formats
- `buildShorts()` — full rewrite; single row, filter bar, `window._shortCollections` stored for filter
- `filterShorts(person, searchText)` — new function
- `initMagneticShortPills()` — new function

**Files touched**
- `index.html`: CSS, `getYouTubeId`, `buildShorts`, `filterShorts`, `initMagneticShortPills`
- `collections.json`: IDs 506–512 added

---

## v1.45 — 2026-05-13 — Drawer category filter + UX polish

**Shipped**
- Category filter pill row inside episode drawer (above column grid). Pills are clickable, color-coded per category, with same magnetic pull effect as the main browse pills and nav links.
- Mobile (≤700px): pills act as tabs — one column visible at a time. Eliminates horizontal column scrolling on small screens.
- Desktop (>700px): all columns visible; selected column at full opacity, others dimmed to 0.65. Clicking a pill smoothly scrolls the selected column into the horizontal center of the drawer grid.
- Click-to-select on faded columns: tapping a card in a non-selected column auto-switches the filter to that column before opening the card.
- Hero stat counters now animate from 0 → real value over 1.2s with ease-out cubic on page load (concepts + categories). Replaces the previous stale-value flash.
- Stale hardcoded fallback numbers ("183", "12", "165") replaced with em-dash placeholders until `concepts.json` resolves.
- `history.scrollRestoration = 'manual'` added — page always loads at hero, never restores prior scroll position to mid-page sections.

**CSS added**
- `.ep-drawer-cat-filter` + `.ep-drawer-cat-pill` (+ `.active` state) — drawer filter row
- Mobile media query: `.ep-cat-column { display: none }` / `.visible { display: flex }` (tab behavior)
- Desktop media query: `.ep-cat-column.faded { opacity: 0.65 }` (dimmed non-selected)

**JS added**
- `filterDrawerCat(catKey)` — pill click handler; toggles active state, controls column visibility/fade, scrolls target column to center on desktop
- `initMagneticDrawerPills()` — magnetic cursor effect on filter pills
- `animateCount(el, target, duration)` — generic count-up animator with ease-out cubic
- `toggleEpCard()` enhanced: detects clicks on cards in faded columns and switches filter before opening

**Files touched**
- `index.html` only — all changes additive, no breaking modifications to existing functions

**Deferred** (unchanged from v1.44)
- YT Shorts lightbox embed
- Content labels / Netflix-style subcategories
- COTD share button + people pill
- Favicon fix on `extract.html` + `upload.html`
- Make.com JSON escaping for quoted words

---

## v1.44 — 2026-05-12 — Episode drawer redesign + air-date datestamp

**Shipped**
- Episode drawer category mix bar (3px rainbow stripe) removed — `display: none`.
- Drawer concept cards now grouped by category in vertical columns. One column per category, horizontally scrollable. Column header shows category name (color-accented) + concept count. Category pill removed from individual drawer cards (noise reduction); left color rule retained.
- Clickable category pill on drawer cards — clicking filters the main browse grid to that category and closes the drawer. Applied to `card-cat` span inside `openEpisodeDrawer`.
- Air-date datestamp on episode cards and drawer header. Displays as editorial typographic stamp (`│ MAY 2025`) using `::before` pseudo-element with category-accent color rule. Reads `col.aired_date` with fallback to `col.date` then `col.created_date`.
- `aired_date` field backfilled on collections 11–14 in `collections.json` with confirmed YouTube publish dates.
- Sort order confirmed: episodes sort by `aired_date` desc, falling back to `created_date`. Newest first within each podcast group.

**CSS added**
- `.ep-drawer-grid` changed from grid to horizontal flex, scrollable
- `.ep-cat-column`, `.ep-cat-column-header`, `.ep-cat-column-label`, `.ep-cat-column-count` — drawer column layout
- `.episode-datestamp` + `::before` pseudo-element — editorial date treatment

**Files touched**
- `index.html`: drawer grid CSS, `openEpisodeDrawer()` card render (category columns), `renderCard()` date logic, `openEpisodeDrawer()` drawer header date logic
- `collections.json`: `aired_date` added to IDs 11, 12, 13, 14

**Deferred**
- YT Shorts embed (lightbox with 9:16 iframe instead of external link)
- Content labels / Netflix-style subcategories (e.g. "Controversial", "Scientific") on Editor's Pick cards, filterable
- COTD share button + people pill
- Favicon fix on `extract.html` and `upload.html` (local files only, not in repo)
- Make.com JSON escaping for quoted words in transcripts (Airtable formula field approach)

---

## v1.43 — 2026-05-12 — Editor's Pick flag

**Shipped**
- New boolean `editors_pick` field flows end-to-end: extract.html / upload.html toggle → Airtable `Editor's Pick` checkbox → Make.com → `publish-batch.js` → `concepts.json` → live site badge.
- Visual treatment on the live site: gold `★ PICK` badge in the card meta row + 1px accent-gold border on picked cards. Applied across main concept grid, episode-drawer cards, and shorts cards. Mastered concepts can also be picks (badge survives the opacity:0.5 mastered state).
- `★ PICK` toggle in card header on both `extract.html` and `upload.html`. Click before sending to Airtable. State persists per-card in `conceptState[i].editorsPick` (extract) / `c._editorsPick` (upload). Inactive = muted pill; active = accent-gold pill.
- New Airtable column: `Editor's Pick` (Checkbox, yellow ★ icon) on the Concepts table. Defaults unchecked. Manual override path available for any Airtable PENDING row before approval.

**Files touched**
- `index.html`: `.editors-pick` + `.pick-badge` CSS; class + badge added to 3 card render paths (main grid, epcc, sc).
- `extract.html`: `.pick-toggle` CSS, `togglePick()` function, header markup with PICK span, `editorsPick: false` default in `conceptState[i]`, `_editorsPick` synced to extracted concept before `buildAirtableFields`, `"Editor's Pick"` written into Airtable POST body. Both `sendOne` and `sendAllToAirtable` sync the flag.
- `upload.html`: same pattern as extract.html. `c._editorsPick` lives directly on the concept; `togglePick` toggles + restyles the pill.
- `/api/publish-batch.js`: reads `editors_pick` from incoming concept (direct property access on `raw`, NOT via `readField` — see Bug below), writes it into the `newConcept` shape as `editors_pick: editorsPickRaw === true || === 'true' || === 1 || === '1'`.
- `/api/publish-concept.js`: same read + write addition for the legacy single-concept path. Will be retired ~2026-05-17 when the old Make scenario goes off.
- Make.com scenario `LLL — APPROVED → Batch Publish → Live`: Data structure `Publish Batch Concept` gained `editors_pick` (Boolean, default Empty). Array Aggregator gained `Editor's Pick` in its Aggregated fields. No mapping change in the JSON module — `Concepts` field still references `2. Array[]`.

**Bug encountered + fix (preserved for future-me)**
- Initial fix relied on the existing `readField()` helper in `publish-batch.js` to read the Airtable checkbox. `readField` only returns strings or stringified numbers — booleans fall through and return `''`. Result: every concept landed with `editors_pick: false` regardless of what Airtable sent.
- Fix: read `editors_pick` directly off `raw[...]` instead of through `readField`. The `??` chain `raw['editors_pick'] ?? raw["Editor's Pick"] ?? raw['Editors Pick']` preserves boolean values; the four-way `=== true || 'true' || 1 || '1'` coercion handles all reasonable representations.
- The Make.com aggregator passes Airtable field names through verbatim (`"Editor's Pick"`, not `editors_pick`). The data structure schema with snake_case is honored in the JSON module's *output formatting* only when keys match — but the aggregator's array contents use Airtable display names. Hence the defensive multi-key read on the server side.

**Known limitations / deferred**
- Existing PUBLISHED concepts cannot have their `editors_pick` flipped via Airtable — the Make pipeline only fires on Status changes, not field edits on already-published rows. To retroactively mark old concepts as picks, hand-edit `concepts.json` directly.
- No "Editor's Picks" filter on the live site yet. Deferred until 30+ picks exist and we have signal on whether users click them disproportionately.
- No "Editor's Picks" dedicated row/showcase. Same reason.

**Schema impact**
- `concepts.json` is now 11 fields (was 10): id, term, category, source, hook, plain, analogy, prompt, collection_id, timestamp, editors_pick.
- Old concepts without the field render as not-picked (falsy check `c.editors_pick === true` is false when undefined). No backfill needed.

---

## v1.35 — 2026-05-10 — Batch publish scenario live, single-commit per batch

**Shipped**
- New Make.com scenario `LLL — APPROVED → Batch Publish → Live` replaces the per-concept publish flow. 5 modules: Airtable Watch Records → Array Aggregator → JSON Create JSON → HTTP POST to `/api/publish-batch` → Iterator → Airtable Update Record.
- All APPROVED concepts in a run land on GitHub as ONE commit, ending the Vercel build coalescing issue that left the last 1–2 concepts of a batch missing from the deployed bundle.
- Per-concept success/failure flows back through the Iterator: successes flip Status to PUBLISHED, failures stay APPROVED with the error written to `Publish Error`.

**Patched**
- `/api/publish-batch.js` updated to accept Airtable-shaped objects directly (capitalized keys: `Term`, `Hook`, `Plain`, `Collection ID`, `Timestamp`, `ID`) in addition to lowercase. Required because Make.com's IML cannot reshape arrays of objects in HTTP body templates — the function does the field-name normalization server-side. Both shapes are accepted via a `readField()` helper that tries multiple key spellings per field.
- Function also returns per-concept results array so Make can branch downstream actions on individual outcomes.

**Files touched**
- `api/publish-batch.js`: full rewrite of body parsing — accepts mixed-case keys, validates each concept independently, dedupes within batch and against existing concepts.json, builds single GitHub commit with all valid concepts.
- Make.com: new scenario `LLL — APPROVED → Batch Publish → Live` (scenario ID 5663447). Polling = every 1 hour. Old scenario `LLL — Airtable APPROVED → GitHub → Live` left ON for one week as fallback, then to be retired.

**Known limitation**
- If two scenarios run on the same APPROVED concept (during the one-week overlap), the second run will hit a 409 duplicate-term and write the error to `Publish Error` while leaving Status = APPROVED. Cosmetic only — the concept is on the live site. Manual cleanup: flip the row to PUBLISHED and clear `Publish Error`.

---

## v1.43 — Mobile hero rework + desktop grid pin (2026-05-10)

### Mobile
- Hero rebuilt mobile-first: H1 left-aligned with explicit 3-line layout via `<span class="h1-line">` + `.h1-indent`. "Then what?" gets `margin-top: 0.6rem` to read as a separate echo.
- Section reorder on mobile via flex `order`: copy → card → stats → CTA above card. Stats demoted below card as proof points.
- Hero card now flips properly on mobile. Fixed by giving `.hero-card-wrap` an explicit height (450px / 480px on small phones) instead of `min-height + auto` — `position: absolute` faces need a measurable parent.
- `.hero-card-col` set to `align-self: stretch; width: 100%` on mobile so the card column has real width (was collapsing to padding-only).
- Back-face text brightened: "What it means" now uses `--text`, analogy uses `--muted2`. "Reflect & use it" untouched.
- Card height reduced ~20% (560 → 450, 600 → 480) for better scroll economy.

### Desktop
- Fixed regression where moving `.hero-stats` out of `.hero-copy` pushed the card down. Pinned all four hero children to explicit `grid-row` / `grid-column` cells in the `min-width: 901px` media query. `.hero-copy` and `.hero-stats` stack in col 1 (rows 1 & 2); divider and card span both rows.
- `.hero-copy` desktop `padding-bottom` reduced from `100px` to `2.5rem` — stats is now its own row, not nested.

### Critical incident
- Orphan duplicate `.hero-stats` block left between media queries with an unfinished `border-left: 1p` declaration broke the entire site (CSS parser fail-forward swallowed everything below). Fixed by deleting the orphan block. Lesson logged in build-journal.

---

## v1.42 — 2026-05-10 — Internal tools deployed privately

**Shipped**
- New private GitHub repo `pocsgeri1/epistemic-tools` containing `extract.html`, `upload.html`, and Arc favicon assets. Tools no longer local-only.
- DNS for `epistemic.live` migrated from Namecheap to Cloudflare (Vercel still hosts the public site; Cloudflare now owns DNS + edge CDN + DDoS protection).
- Tools deployed to Cloudflare Pages, gated behind Cloudflare Access (Zero Trust) with one-time-PIN email auth.
- Custom subdomain `tools.epistemic.live` configured. Bookmarkable on phone + laptop. Apple touch icon shows the Arc when added to home screen.

**Architecture**
- Public site: GitHub `listen-learn-live` (public) → Vercel → `epistemic.live`
- Private tools: GitHub `epistemic-tools` (private) → Cloudflare Pages + Access → `tools.epistemic.live`
- API keys: still stored in browser localStorage per device, never server-side.

**Deferred**
- Subscribe endpoint rate-limit + honeypot (separate hardening session).
- Confirm `PUBLISH_SECRET` is 32+ random chars in Vercel env vars.

---

## v1.41 — 2026-05-09 — Favicon shipped

**Shipped**
- Replaced default browser globe favicon with custom **E.** mark (italic E + trademark period, brand gold #e8d5a3 on dark #0d0d0d).
- Added 5 favicon files to repo root: `favicon.svg`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `favicon.ico`.
- Wired up in `index.html` `<head>` with full link-rel set + theme-color meta.
- **Arc favicon** added to `extract.html` and `upload.html` (local-only files containing API keys, not in the GitHub repo). Files placed alongside the HTML in the local working folder; relative paths used. Visually distinguishes internal tools from the public site at the tab level.

**Files touched**
- `index.html` — 7 lines added in `<head>` after `<title>`.
- 5 new asset files at repo root.

**Deferred**
- Matching OG share image and update to canvas share-card brand text in `index.html` (lines 4039 + 4044) — same mark, different surfaces, separate session.

---

## v1.40 — 2026-05-09 — Multi-slot Short extraction in extract.html

**Shipped**
- Short mode now supports multiple slots in one session. "Add another short"
  appends a new self-contained slot (Title, Creator, People, URL, Date, Transcript).
- Slots collapse to a title preview when not active. Remove button hidden when
  only one slot remains.
- Extract loops slots sequentially, progress bar shows per-slot status.
  One failed slot doesn't block the others.
- Send all creates one GitHub collection per unique slot URL (cached — no
  duplicate collections if two concepts share a slot). Each concept gets the
  correct Collection ID.
- clearAll resets slots back to one empty slot in Short mode.

**Files touched**: `extract.html` only.

---

## v1.39 — 2026-05-09 — Shorts mode in extract.html + Browse Shorts on site

**Shipped**
- New mode toggle in `extract.html`: Long-form / Short. Short mode hides Host
  and Duration fields, swaps in a leaner extraction prompt (1–3 concepts max),
  caps `max_tokens` at 3000, and writes `type: "short"` to the GitHub collection.
- Short collections get IDs ≥ 500 (enforced via `minFloor` in
  `createEpisodeCollectionViaGitHub`). Episode collections remain IDs ≥ 10.
- New `SHORT_EXTRACTION_PROMPT`: same field rules as long-form, explicitly
  instructs Claude to return 1–3 concepts only and never pad.
- New **Browse Shorts** section in `index.html`, between Episodes and Concepts.
  Grouped by creator (same podcast-group pattern as Episodes).
- Single-concept shorts render inline as a flippable concept card with a
  clickable thumbnail strip (links to YouTube). No drawer — the card IS the
  content.
- Multi-concept shorts (2–3) reuse the existing episode drawer with zero new
  drawer code.
- `buildShorts()`, `toggleShortCard()`, `toggleShortMaster()` added to
  `index.html`. Wired into `render()`.
- Shorts nav link added to desktop island and mobile menu.
- Short-card CSS added (`.short-card`, `.short-thumb`, `.short-thumb-link`,
  `.short-thumb-play`).

**Files touched**
- `extract.html`: mode toggle HTML + CSS, `setMode()`, `SHORT_EXTRACTION_PROMPT`,
  `validateEpisodeFields` update, `runExtraction` prompt/tokens switch,
  `createEpisodeCollectionViaGitHub` type + ID floor.
- `index.html`: `buildShorts()`, short-card CSS, nav links, `render()`.
- `architecture.md`: `type: "short"` documented under Layer 2.

**Known limitations / deferred**
- Shorts section is hidden when no short collections exist — no "coming soon"
  state. Intentional: section appears automatically once first short is published.
- No dedicated Shorts search input yet — shorts appear in the main concept
  search via Browse Concepts (they share the same concepts.json).
- Session 3 (Editor's Picks) unaffected.

---

## v1.38 — 2026-05-09 — `upload.html` rebuild: per-field edit/regen, optional attribution, key persistence

**Shipped**
- Dropped 3-variant extraction (House/Preserved/Koe) entirely. One concept per seed now.
  Style adjustments are made via per-field Regen + style note instead.
- Per-field Edit + Regen + Rollback UI imported from `extract.html`. Same LIFO history
  (max 3 versions per field), same confirm-before-overwrite-edits flow, same anti-mash
  debounce on the outer Regen button, same live cost pill (`regenSessionCount` /
  `regenSessionCost`).
- Style note placeholder rotates through 6 examples on each open ("punchier",
  "more Hormozi-style", "simpler English", "more Dan Koe", "more editorial",
  "less corporate"). Hint to the user that prompt-shaping is the workflow.
- API key persistence via `localStorage` key `lll_upload_config_v1`. Independent
  from `extract.html`'s storage. New "Remember keys on this device" checkbox +
  "Clear saved keys" button in the config panel.
- **Optional source / people.** When the note doesn't mention a person, Claude
  now omits both fields from the JSON, the UI renders no Source / People badge,
  and `buildPayload` skips both Airtable columns. Loose-idea concepts now ship
  with `collection_id: null` and no fake "core" attribution.
- Updated extraction prompt: removed all 3-variant logic, kept the analogy-opener
  and prompt-opener variation rules from the previous prompt.
- `buildPayload` rewritten: reads flat fields directly off the concept (no more
  variant-tab indirection). Source and People only included when present.
- Send-all button text is now dynamic: shows remaining count
  ("Send 5 concepts to Airtable" → "Send 2 concepts to Airtable" → "All sent ✓").

**Files touched**
- `upload.html` only. No pipeline / schema / Airtable / front-end changes.

**Known limitations / deferred**
- `upload.html` still doesn't capture timestamps or video URLs — that's deferred
  to Session 2 when Shorts mode lands in `extract.html`.
- No Episode Reference / Episode URL fields populated — these are loose ideas,
  not episode-linked. Intentional.

---

## v1.37 — 2026-05-09 — Rebrand to Epistemic.

**Shipped**
- Brand renamed from "Listen. Learn. Live." to **Epistemic.** across the live product.
- New domain `epistemic.live` purchased at Namecheap (1-yr promo €2.70, renews ~€29/yr — calendar reminder set for transfer to Cloudflare Registrar before renewal).
- Domain connected to Vercel via A record (`@` → `76.76.21.21`) and CNAME (`www` → `cname.vercel-dns.com`). SSL auto-provisioned. `epistemic.live` set as Primary domain; `listen-learn-live.vercel.app` now 301-redirects to it.
- Social handles claimed: `@getepistemic` on X, Instagram, YouTube. TikTok pending (sign-up glitch). LinkedIn Page deferred.
- Gmail created: `getepistemic.app@gmail.com` — central account for all social platform registrations.
- Trademark search complete: USPTO + EUIPO clean in software/education classes. Other-category Epistemic businesses noted for future watch.

**Files touched**
- `index.html`:
  - Line 6: `<title>` updated to `Epistemic. — Master the concepts that shape intelligent conversation`
  - Line 2901: nav logo updated to `<em>Epistemic.</em>` (period in accent color, italic)
  - Line 3896: share text rewritten — drops "Listen. Learn. Live." brand mention, swaps URL to `https://epistemic.live`
  - Line 4039: canvas share-card brand text → `Epistemic.`
  - Line 4044: canvas share-card URL → `epistemic.live`

**Beehiiv**
- Publication name changed to `Epistemic`.
- Web subdomain updated: `lll-newsletter.beehiiv.com` → `getepistemic.beehiiv.com`.
- Email subdomain updated: `lll-newsletter@mail.beehiiv.com` → `getepistemic@mail.beehiiv.com`.
- Welcome automation copy edited to reflect new brand — but **publishing the edit is paywalled** behind Beehiiv's paid tier (€49/mo). Edits sit in unpublished state. The live welcome email still references "Listen. Learn. Live." Acceptable for now: only 2 subscribers, no active acquisition. Revisit when sub count justifies the upgrade or when migrating to a different ESP.

**Rebrand sweep complete (2026-05-09)**
- Backend code files swept: `extract-concepts.js`, `publish-concept.js`, `extraction-prompt-v1_2.txt`, `extract.html`, `upload.html` — all in-code prompts, page titles, header eyebrows, code comments, and `User-Agent` strings now read `Epistemic`. The `'listen-learn-live'` repo-name constants in `extract-concepts.js` (line 417) and `publish-concept.js` (line 66) intentionally left as-is — actual GitHub repo name, not branding.
- Project docs swept: `lean-canvas.md`, `architecture.md`, `airtable-schema.md`, `quality-rules.md`, `design-tokens.md`, `build-journal.md` headers all renamed to Epistemic. `roadmap.md` and `changelog.md` already on the new brand.
- This Project's system prompt updated.
- localStorage keys (`lll_mastered_v1`, `lll_daily_goal_v1`, `lll_streak_v1`, `lll_cotd_dismissed_v1`, `lll_extract_config_v1`) intentionally left as-is — renaming would silently wipe every existing user's saved state.
- Historical references in `build-journal.md` and `changelog.md` narrative entries left as-is — those describe past states, not current.

**Still deferred (intentionally)**
- `LLL_Business_Snapshot.docx` — opens with a "Listen. / Learn. / Live." three-line manifesto that's structural, not a header. Not a find-and-replace job. Renamed to `LLL_Business_Snapshot_ARCHIVED.docx` and superseded; new snapshot to be drafted when needed for fundraising or partnerships.
- Beehiiv welcome automation: edited copy still unpublished (paywalled at €49/mo). Live welcome email still says "Listen. Learn. Live." Low impact — 2 subscribers, automation rarely fires. Republish on Beehiiv upgrade or ESP migration.
- GitHub repo rename (`listen-learn-live` → `epistemic`): deferred to Phase 2 cleanup. Repo name isn't user-facing; rename risk-adjusted not worth it now.
- Brand assets (wordmark/logo, favicon, OG share image, Beehiiv header). LinkedIn Page. TikTok handle.
- Tagline rewrite — current tagline "Master the concepts that shape intelligent conversation" carried over verbatim from old brand.

**Known issues**
- `index-netflix-test.html` was edited in early experimentation but is no longer the active file. Safe to ignore or delete in a future cleanup pass.

---

## v1.36 — 2026-05-08 — Drawer fix + perf pass

**Shipped**
- **Episode drawer no longer leaks page content behind it.** Previously, opening the drawer left ~12vh of the page visible at the top, with the nav and category rows poking through the backdrop blur as a "stuck stripe." Fixed by hiding all top-level page sections (`nav`, `.hero`, `.episodes-section`, `.app > .app-controls`, `#netflixRows`, `.newsletter`, `.divider`, `.daily-goal`) via `body.drawer-open { visibility: hidden }`, with the drawer + backdrop explicitly re-shown. `visibility: hidden` (not `display: none`) preserves layout so the page returns to its prior scroll position when the drawer closes.
- **Drawer height bumped 88vh → 92vh.** Now that the body is hidden, the 12vh dead zone served no purpose. More concept cards visible per viewport without scrolling.
- **Drawer card "stretch all cells" bug fixed.** CSS grid's default `align-items: stretch` was making every card in the same row grow to match the tallest open card's height — visually identical to the "all cards opened at once" symptom. One-line fix: `align-items: start` on `.ep-drawer-grid`.
- **Drawer card close-others.** `toggleEpCard` now closes any other open drawer card before opening the clicked one, mirroring the main-grid `toggleCard` behavior. Also gated the `openedToday.add()` call behind `!wasOpen` so closing a card no longer counts as a new "open."

**Lag-reduction pass (no aesthetic loss)**
- Removed `backdrop-filter: blur()` from drawer backdrop, HIW modal, COTD modal, Quiz backdrop, mobile nav menu, and all 30+ scroll-arrow buttons. Backdrop-blur over a 0.92+ opacity scrim is invisible to the eye but expensive on retina (GPU blurs ~4x more pixels at 5K than 1080p). Compensated by bumping background opacity 0.04–0.13 in each case.
- Nav backdrop-blur reduced 6px → 3px (kept because it visibly helps as content scrolls under the fixed nav). Background opacity bumped 0.88 → 0.92 to keep the contrast.
- Hero card box-shadow reduced from `0 24px 64px` → `0 12px 32px`. Visually almost identical at the card's actual size; significantly cheaper to paint.
- Removed `will-change` declarations from `.quiz-sheet`, `.cotd-overlay`, `.cotd-card`. These were forcing permanent GPU layers for elements that animate once on open.
- Drawer + quiz transitions tightened (0.4s → 0.25s for backdrop fade, 0.42s → 0.35s for quiz sheet slide).
- Replaced `transition: all` with explicit property lists on `.vault-pill`, `.hero-cta`, `.cotd-close`, `.cotd-btn`, `.cotd-footer a`, `.quiz-hint-letter`. Skipped `.cat-card`, `.btn-master`, `.btn-share`, `.btn-listen` — minor contributors, deferred to future session.

**Files touched**
- `index.html` only.

**Result**
- Site reported ~90% smooth on retina (was noticeably laggy before). Drawer open/close, quiz transitions, modal opens all snap.
- Remaining ~10% lag attributed to drag-scroll mousemove handler + full-grid innerHTML rewrite on every search keystroke. Both are deferred to a dedicated render-perf session — neither is a one-line fix.

**Known limitations / deferred**
- `transition: all 0.2s` instances still present on `.cat-card`, `.btn-master`, `.btn-share`, `.btn-listen`. Replace with explicit property lists if hover lag becomes noticeable on these elements.
- Drag-scroll on `.nf-row` and `.episodes-row` runs on every mousemove without throttling.
- `buildGrid()` rebuilds all 270+ cards on every category click and every debounced search keystroke. Row-level diff would be cleaner.

---

## v1.35 — 2026-05-08 — Per-field regenerate in `extract.html`

**Shipped**
- New `↻ Regen` button next to `✎ Edit` on every editable field (Term, Hook, Plain, Analogy, Prompt) in the extracted-concepts review UI. Clicking it expands an inline panel with an optional style-note textarea ("punchier", "more Hormozi-style", "less academic"), a Regenerate button, a Cancel button, and an inline cost hint (`~$0.004 per regen`).
- Regen sends the **full concept context** (term + all 5 fields + style note) to Claude Sonnet 4.5 with a tight editorial system prompt, and asks for the regenerated field as plain text only (no JSON). Concept stays internally consistent because Claude sees all the surrounding fields as context.
- Updates the field in place, marks it as edited (yellow `edited` badge), syncs the collapsed-card head if Term or Hook was regenerated.
- **Per-field history (max 3 versions).** Each regen pushes the prior value onto `conceptState[i].regenHistory[fieldKey]`. A `↶ Previous version` link appears below the regen panel whenever history exists; clicking it pops the most recent entry and restores it (LIFO). Manual edits replaced by a regen are also captured in history (after a confirm dialog).
- **Confirm dialog before overwriting manual edits.** If a field has the `edited` flag set and the user clicks Regenerate, a `confirm()` dialog warns that the manual edit will be replaced (but saved in history).
- **Live cost tracking with real token counts.** A session pill (`THIS SESSION: N regens · $0.0000`) appears in the results header on the first regen and accumulates from `data.usage.input_tokens` / `data.usage.output_tokens` returned by each API response. Sonnet 4.5 pricing: $3/M input, $15/M output. Cost displayed to 4 decimal places because typical per-regen cost is $0.003–$0.005.
- **500ms anti-mash debounce** on the outer Regen button to prevent rapid-fire button presses from racing into rate-limit territory. Inner Regenerate button stays disabled for the full duration of the API call.

**Files touched**
- `extract.html`: only file changed. CSS for `.regen-btn`, `.field-row-regen`, `.regen-panel`, `.session-regen-pill`, etc. New `REGEN_SYSTEM_PROMPT` constant. New functions: `startRegen`, `cancelRegen`, `runRegen`, `rollbackRegen`, `recordRegenUsage`, `pushRegenHistory`, `refreshRollbackButton`, `showRegenError`, `clearRegenError`, `resetSessionRegenCounter`. `conceptState[i]` extended with `regenHistory: {}` field.

**Known limitations**
- Rollback does NOT clear the `edited` badge, even if you roll all the way back to the original Claude extraction. Tracking the true pristine value would require a fourth slot in state per field. The badge essentially means "this card was touched" — still true after rollback.
- No prompt caching. If you regen many fields on the same concept rapidly, every call re-sends the full system prompt + concept context (~800 input tokens). Caching would cut costs ~10x for repeat-regens, but is out of scope for v1.35.
- Voice consistency across the 5 fields is not enforced beyond what Claude infers from seeing the other fields as context. If you regen `analogy` aggressively (e.g. "more visceral"), the `hook` may end up feeling tonally mismatched. Human review remains the consistency check.

**Schema / docs / docs touched outside `extract.html`:** none. No concept schema change, no Airtable schema change, no design-token additions, no quality-rules update.

---

## v1.34 — 2026-05-07 — Timestamps + air-date sort + Listen button

**Shipped**
- New `timestamp` field on concepts (integer seconds). Glasp-exported transcripts contain inline `(23:14)` markers; the extraction prompt now converts these to integer seconds and emits them as a 10th field on each concept. Schema bumped from 9 to 10 fields end-to-end.
- New `aired_date` field on episode collections (YYYY-MM-DD). Distinct from `created_date` — represents when the podcast actually aired, not when we processed it. Set via the new "Aired date" field in `extract.html`.
- Browse Episodes now sorts by `aired_date` descending (newest podcast episode first), falling back to `created_date` for collections that lack it.
- "↗ Listen" button on every concept card with both `episode_url` and `timestamp`. Deep-links to the source episode 8 seconds before the timestamp (so the user lands a moment of context before the concept is discussed). Renders on both the main grid card-back and the episode drawer card-back. Uses `buildTimestampedUrl()` helper — currently handles YouTube; structured to add Spotify/Apple branches later without refactor.

**Files touched**
- `extract.html`: new "Aired date" form input, `formatTimestamp()` helper, `timestamp` displayed on each extracted concept card (red "missing" indicator if absent), prompt updated with TIMESTAMP EXTRACTION block, GitHub commit + Airtable POST both pass through new fields.
- `extract-concepts.js`: matching prompt update, `airedDate` accepted in request body, `aired_date` written to collection, `Timestamp` written to Airtable per concept.
- `publish-concept.js`: `timestamp` accepted from Make.com body, normalized to non-negative integer or null, written into `concepts.json`.
- `index.html`: episode sort now keys on `aired_date`, `buildTimestampedUrl()` helper added, `.btn-listen` styles, Listen button rendered on both card-back templates.
- Make.com publish scenario: `timestamp` field added to HTTP POST body using `ifempty()` pattern matching `collection_id`.

**Airtable change**
- New `Timestamp` field added to Concepts table (Number, integer, no negatives).

**Known limitation**
- Existing 165 concepts have no `timestamp` so the Listen button won't render for them — only for new concepts going forward. Acceptable: those concepts also predate the Glasp-with-timestamps workflow, so there's no source data to backfill from anyway.

---

## v1.33 — 2026-05-06 — `extract.html` ships, source codes opened up

**Shipped**
- New `extract.html`: private browser-side tool for long-form transcripts. Bypasses Airtable's 100k Long-text cap. Calls Claude direct from the browser, commits a new episode collection to `collections.json` via GitHub REST API, then writes each parsed concept to Airtable as PENDING with `Collection ID` pre-filled. Supports inline editing per field with an "edited" indicator, skip-per-card, char/word counters, and localStorage-backed key persistence (1Password-friendly).
- `extract-concepts.js` updated: SOURCE ATTRIBUTION block rewritten to detect-and-extend (host-initial codes for unknown podcasts, e.g. `jr` Joe Rogan, `tf` Tim Ferriss, `ahu` Andrew Huberman to avoid collision with Alex Hormozi). The closed `VALID_SOURCES = [core, cw, ah, dk]` constant replaced by `normalizeSource()` accepting any 2–4 lowercase letter code.
- `publish-concept.js` updated: same open-ended source validation. Was rejecting any concept with a non-`cw/ah/dk/core` source code (`Invalid source "rh". Must be one of: ...`). Required for Make publish flow to handle new source codes coming from `extract.html`-extracted episodes.
- Airtable POST in both files now uses `typecast: true` so new Source Single-Select options (e.g. `jr`) auto-create on first use.

**Known issues**
- Live `concepts.json` may lag GitHub by 1–2 commits during high-frequency batch publishes. Vercel coalesces builds when commits arrive faster than ~30s apart, so the last 1–2 concepts of a batch can land on GitHub but miss the deployed bundle until a manual redeploy. See "Next build session" in `roadmap.md` for the planned fix (batch-commit refactor).
- Episode 13 ("A Blueprint for Mastering Every Conversation") published 27 concepts to GitHub but rendered 25 on the live site for ~hours after publish — confirmed Vercel build coalescing, resolved by manual redeploy.

---

## v1.32 — 2026-05-06 — Pipeline robustness: form-urlencoded body + transcript limit discovery

### Make.com HTTP module body type changed
- Body type switched from `Raw` (JSON application/json) to **Application/x-www-form-urlencoded**.
- All fields now sent as form key/value pairs instead of templated JSON body.
- Eliminates the need for the `Transcript JSON` formula field — raw `Transcript` field now mapped directly.
- Vercel function (`extract-concepts.js`) handles this transparently via the default body parser. No function code change required (verified `req.body` destructure works identically for both content types).
- Aligns with the fallback path documented in `build-journal.md` (2026-04-29): "if `JSON string` mode ever becomes too fragile, switch the HTTP module to `application/x-www-form-urlencoded`."

### Reason for the switch
- Long transcripts (>100k chars) caused the nested-`SUBSTITUTE` formula in `Transcript JSON` to silently lock the Airtable row into a stuck state, surfacing as "You are not permitted to perform this operation" on subsequent edits.
- Root cause: Airtable's Long text field has a hard ~100k character limit. Beyond that, formula computation timeout cascades into row-level write rejection.
- Form-urlencoded path bypasses both issues — no formula computation, transcript never gets escaped into JSON.

### `Transcript JSON` formula field deprecated
- Field hidden from all views but not yet deleted.
- Will remain in the schema for one week as fallback in case the new path reveals issues.
- Deletion scheduled for 2026-05-13 if no regressions surface.

### Discovered limit: Airtable Long text caps at ~100,000 chars
- A 3-hour podcast transcript ranges 100k–150k chars.
- Above 100k, Airtable client behavior is unpredictable: writes silently fail, formulas time out, or "not permitted" error appears.
- Confirmed via Grammarly word-counter: 128,391 chars with spaces / 103,662 without on the test transcript.
- This is a hard architectural constraint when episodes are submitted via Airtable Intake rows.

### Workaround for current session
- Manual transcript trimming (sponsor reads, outro, filler) before paste — drops typical 3-hour transcript to ~95-105k chars.
- This is a temporary workaround. Permanent fix planned: `extract.html` private browser tool that bypasses Airtable for transcript storage entirely. See `roadmap.md`.

### Make.com HTTP module body — current shape (key/value pairs)
| Key | Value |
|---|---|
| `intakeRecordId` | `{{1.id}}` |
| `episodeTitle` | `{{1.fields.\`Episode Title\`}}` |
| `host` | `{{1.fields.Host}}` |
| `episodeUrl` | `{{1.fields.URL}}` |
| `duration` | `{{1.fields.\`Duration (min)\`}}` |
| `transcript` | `{{1.fields.Transcript}}` |
| `people` | `{{1.fields.People}}` |
| `podcast` | `{{1.fields.Podcast}}` |

`X-Publish-Secret` header preserved as before.

---

## v1.31 — 2026-05-06 — Hero copy refresh + section banding + episodes by podcast

### Hero copy
- H1 changed: `You finish the podcast. / Then what?` → `You finished a 3,5 hour / podcast. / Then what?`
  - Three-line layout. Line 1 + 2 plain serif white, line 3 (`Then what?`) keeps the gold italic accent.
  - H1 size reduced from `clamp(2.8rem, 4.5vw, 5rem)` to `clamp(2.4rem, 3.7vw, 4.2rem)` so "You finished a 3,5 hour" fits on a single line at desktop widths.
  - Line-height bumped from `1.0` → `1.05` to prevent line crowding at the new size.
- Sub copy condensed: `Most ideas evaporate within 24 hours. Not because the content is bad. Because passive listening is a broken learning format. Epistemic fixes that.` → `Most ideas evaporate within 48 hours. Epistemic helps you internalize what you've actually heard.`
- Hero column alignment: `.hero` grid changed from `align-items: center` → `align-items: start`, so the H1 anchors to the top of the left column. The right card column re-centers explicitly via `align-self: center` on `.hero-card-col`.
- Eyebrow-to-H1 spacing: `.hero-eyebrow-outer { margin-bottom }` increased from `2rem` → `7rem` to drop the H1 down so its top edge aligns with the top of the showcase card.
- Hero bottom padding: `.hero { padding }` bottom value `0` → `5rem` to create breathing room before the new banded section starts.

### Nav
- Logo: `Epi<span>stemic.</span>` (gold "stemic" only) → `<em>Epistemic.</em>` (entire word italic gold). CSS updated: `.nav-logo` color now `var(--accent)`, `.nav-logo span` rule replaced with `.nav-logo em { font-style: italic; color: var(--accent) }`.
- Nav island link order changed: `Concepts · Episodes · Vault · Today · Sign up` → `Episodes · Concepts · Vault · Today · Sign up`. Mobile menu reordered to match.

### Section banding
- New design token `--band: #111111` added to `:root`. Sits between `--bg` (#0d0d0d) and `--surface` (#141414, used by episode cards) so the banded section is distinct from both the page background AND the cards inside it.
- `.episodes-section` background set to `var(--band)`, padding bumped from `2.5rem 0 0` to `5rem 0 5rem`.
- Hero ends in `--bg`, Browse Episodes is `--band`, Browse Concepts returns to `--bg`. Subtle tonal shift, no hard dividers.

### Browse Episodes redesign
- **Episodes grouped by podcast.** New top-level structure: one row per unique `podcast` field value in `collections.json`. Each row has its own DM Mono heading (`MODERN WISDOM   3 episodes`) and its own scrollable card row.
- Sort order: podcasts with most episodes first, alphabetical tiebreak.
- New CSS classes: `.episodes-podcast-group`, `.episodes-podcast-heading`.
- `buildEpisodes()` rewritten: bucket-by-podcast logic added, card rendering extracted into `renderCard()` helper to avoid duplication. Dead `mixBar` calculation removed (the variable was computed but never inserted into output — leftover from when the mix bar lived on episode card faces).
- Outer `.episodes-scroll-wrap` removed from the static HTML. Each podcast group now has its own scroll wrapper, fade overlays, and arrow buttons rendered by JS.

### Drag-to-scroll re-enabled
- `initDragScroll()` re-enabled (previously disabled with `return;` at top after v1.26 performance pass).
- Now binds to both `.nf-row` (category rows) and `.episodes-row` (podcast rows). 4px drag threshold prevents accidental card opens. Cursor changes to `grabbing` while dragging.
- Click-blocker uses capture phase to suppress card click after a drag without breaking native scroll on touch.

### Scroll arrow buttons
- 36px circular buttons added at left/right edges of every horizontal scroll row (both podcast rows and category rows).
- New CSS: `.scroll-arrow`, `.scroll-arrow.left`, `.scroll-arrow.right`, `.scroll-arrow.hidden`. Backdrop-blur background, accent border on hover.
- Hidden by default, fade in on row hover. Hidden entirely on touch devices via `@media (hover: none)`.
- Helper functions added: `scrollRow(button, direction)` (smooth scroll by 80% of visible width) and `updateArrowVisibility(row)` (toggles `.hidden` class based on scroll position; auto-hides both arrows if there's no overflow to scroll).
- Both `buildEpisodes()` and `buildGrid()` call `updateArrowVisibility()` on each row after render.

### Episode search
- New search input added to Browse Episodes section header, mirroring the Concepts search exactly. Reuses `.search-wrap` class — zero new CSS.
- Filter logic added at the top of `buildEpisodes()`: matches query (lowercased) against episode title + podcast name + all people names.
- Wired with the same 180ms debounce pattern as the Concepts search, separate timer variable (`_epSearchDebounce`).

### Text-selection fix
- `user-select: none` + `-webkit-user-select: none` added to `.nf-row` and `.episodes-row` to prevent text highlighting while drag-scrolling. Card-back text remains selectable (different element).

### Data layer
- `collections.json`:
  - Removed TEST entry (id 10, "TEST: People Pills Verification").
  - Added `podcast` field to all `type: "episode"` collections.
  - Existing entries updated: id 11 → `"podcast": "Dan Koe"`, id 12 → `"podcast": "Diary of a CEO"`.
  - Trimmed leading whitespace from titles on ids 11 and 12.

### Pipeline (extract-concepts.js)
- `req.body` destructure extended to include `podcast`.
- `createEpisodeCollection({ episodeTitle, people, episodeUrl, podcast })` — new param threaded through.
- New collections now write `podcast: podcast ? String(podcast).slice(0, 100) : 'Other'` — defaults to "Other" if the field is missing on the Intake row, so old transcripts keep working without breaking.

### Airtable
- New `Podcast` field added to Intake table (Single line text, form-level required).
- Make.com scenario `LLL — Intake NEW → Claude → Concepts PENDING`: HTTP module body extended

---

## v1.30.1 — 2026-05-06 — Doc audit: features already live

Cleanup pass — three features are live in `index.html` but were marked as "future" in `roadmap.md`. Realigning the docs:

- **Quiz mode** — accessible via nav `◈ QUIZ` button (right side of nav island). Functional. Keeping under "shipped" going forward.
- **Streak system** — daily streak tracked in localStorage, visible in the daily goal bar at bottom of page (e.g. `🔥 4 day streak`). Increments when daily goal of 5 concepts is hit.
- **Concept of the Day (COTD)** — modal that opens on first visit each calendar day. Accessible from nav `Today` link (uses `openCotdFromNav()` to bypass the dismissed-today flag).

No code changes in this version. `roadmap.md` updated to move these from "Proposed next features" to "Shipped."

---

## v1.30 — 2026-05-05 — Hero landing page redesign (index-netflix-test.html → index.html)

> ⚠️ All changes applied to `index-netflix-test.html`. File renamed to `index.html` this session — old `index.html` retired.

### What changed

**Hero section fully redesigned** — split two-column layout replacing the previous centered single-column hero.

- Hero is now full-width (`width: 100%`, no `max-width`) using `grid-template-columns: 1fr 1px 1fr`
- Left column: eyebrow, H1, sub text, stats bar, CTA — all contained in `.hero-copy`
- Right column: flippable showcase card — `.hero-card-col` with `.hero-card-wrap`
- Vertical divider (`div.hero-divider`) separates columns, disappears on mobile

**Eyebrow** ("THE INTELLIGENCE TOOLKIT"):
- Sits at top of left column, ~90px from nav
- Left flanking line bleeds to screen edge via `width: calc(3rem + 100vw); margin-left: calc(-3rem - 100vw)`
- Right side: short 32px dash

**H1 copy** updated to: "You finish the podcast. / Then what?"
- "Then what?" on second line, `text-align: right` for echo/reply visual effect
- Fixed malformed CSS — `.h1-indent` was previously nested inside `.hero h1 em {}` and never applied

**Sub text** updated: "Most ideas evaporate within 24 hours..." + "*Epistemic* fixes that."
- `font-size: 1.1rem`, left-aligned, `max-width: 480px`
- "Epistemic" renders in Playfair italic gold via `.hero-brand-name`

**Stats bar**: three stats (Concepts / Categories / Daily Goal)
- Each stat `flex: 1; text-align: center` — number and label share same center axis, no misalignment
- Dividers between stats via `.stat + .stat { border-left: 1px solid var(--border) }`
- Border lines aligned with left column text (no screen-edge bleed)

**Hero showcase card** — Mental Masturbation (hardcoded, Psychology / Modern Wisdom / Chris Williamson):
- 360×520px, `rotate(-1.5deg)` at rest, straightens + lifts on hover
- CSS 3D flip on click (`transform-style: preserve-3d`, `rotateY(180deg)`)
- Front: Psychology pill (top row) + source pills below on same line (`white-space: nowrap`) + large term + italic hook + "Tap to flip" hint
- Hook text: "Consuming self-improvement content is the most addictive form of doing nothing." — `font-size: 1.02rem`
- Back: three `.hc-back-section` wrapper divs as direct flex children → `justify-content: space-between` distributes sections evenly
- Back sections: What it means / Analogy (purple left bar) / Reflect & use it (gold box)

**Mobile** (`max-width: 900px`): grid collapses to single column, divider hidden, copy centered, card below

**File rename**: `index-netflix-test.html` → `index.html`. Old `index.html` retired.

No schema, data, or pipeline changes.

---

v1.29 — 2026-05-04 — Bulk concept upload tool (v1)

New private tool: `upload.html`
- Standalone HTML file, runs locally in the browser — no server, no deploy needed.
- Calls Claude API (claude-sonnet-4-5) and Airtable REST API directly from the browser.
- Paste raw notes (one idea per paragraph) → Claude extracts and fleshes out concepts → rows appear in Airtable PENDING queue → existing Make.com + publish pipeline takes over from there.
- No new Vercel functions, no new Make.com scenarios, no schema changes needed.

Extraction features:
- 3 variants per concept: House voice (editorial), Preserved (faithful to user's original wording), Koe (Dan Koe style — always, regardless of source).
- Term variants: 3 different options for coined/descriptive labels; fixed for established terms (Liquidity, Moral Hazard, etc.).
- Flexible source attribution: extracts full name from notes → auto-converts to initials (Ryan Holiday → "rh", Naval Ravikant → "nr", etc.). Unknown source → "core". 15 people pre-mapped.
- People field: full canonical name sent to Airtable `People` field alongside concept fields.
- Plain field: never opens by restating the term — starts mid-thought with the insight or mechanism.
- Graceful fallback: if `People` field doesn't exist in Airtable, retries without it automatically.

UI:
- Variant tab selector per card (House / Preserved / Koe). Active tab updates header term live.
- Koe hook renders in bronze (`--dk-accent`) to distinguish it visually.
- Send individual cards or "Send all" — both send the active variant on each card.
- Config panel with key visibility toggles, green dot validation.

Known limitations / fine-tuning needed in later sessions:
- Prompt quality for Koe voice will improve once style examples are added (planned).
- Source initials list is hardcoded in the prompt — add new people as library grows.
- No scores (Universality, Actionability, etc.) are generated — bulk upload bypasses scoring.
- No Episode Reference or Episode URL fields populated — these are standalone concepts, not episode-linked.

Files added: `upload.html` (private, not committed to GitHub with keys).
Files changed: none.
No pipeline changes. No schema changes.

---

v1.28 — 2026-05-03 — Fuzzy search + Browse Episodes peer heading

⚠️ All changes applied to index-netflix-test.html only.

Fuzzy search via Fuse.js
- Added Fuse.js 7.0.0 from jsDelivr CDN (~6KB gzipped). One <script> tag in <head>.
- Replaced substring filter in buildGrid() with Fuse-based fuzzyMatchIds().
- Indexed fields with weights: term (0.40), _people (0.20), hook (0.15), plain (0.15), analogy (0.10).
- Tuning after first round was too loose ("paradx" matched "separating"):
  threshold 0.35 → 0.25, minMatchCharLength 2 → 3, added distance: 60.
- Fallback path: if Fuse fails to load (CDN issue), fuzzyMatchIds() does substring search across the same 5 fields. Page never breaks.
- Index built once after concepts + collections load via buildFuseIndex(). Rebuilt only on data reload (which doesn't happen in current app).

People search
- Each concept enriched with a synthetic _people field at index-build time, joined from its collection's people[] array.
- Typing "Chris Williamson" or "Bartlett" surfaces all concepts from those episodes.
- Foundational-pack concepts (collection_id 1–6, no people) correctly excluded from people-name searches.

Browse Episodes peer heading
- Episodes section now uses an "Browse episodes" heading in Playfair Display, matching "Browse concepts" exactly. Replaces the small DM Mono "Episodes" label.
- New CSS classes .episodes-controls and .episodes-app-header mirror .app-controls / .app-header.
- Old .episodes-section-header / .episodes-section-title / .episodes-section-rule rules left in place (unused, harmless — kept for easy revert).
- Structural clarity, not a new feature: makes Episodes a peer section to Concepts, not a sub-element.

Files touched: index-netflix-test.html only.
No schema change. No data change. No publish-path change.

---

v1.27 — 2026-05-03 — Fixes & polish session

⚠️ All changes applied to index-netflix-test.html only.

Progress bar redesign

Removed "OVERALL" word from the label, kept "Progress"
Moved VAULT button inline next to the x / y counter (was in a separate row below)
Applied .cat-card magnetic-pull class to the VAULT button so it gets the same hover behavior as category pills
Added small CSS override (.progress-bar .vault-pill) to drop the fixed 140px width inherited from .vault-pill
Fixed initial counter HTML value from stale 0 / 183 to — / — (placeholder until concepts load)

Card button rename — "Mastered" → "VAULT"

Concept cards: Mark as Mastered / ✓ Mastered → ⊕ VAULT / ✓ VAULT
Episode drawer cards: same rename
COTD modal: ✓ Mark Internalized / ✓ Internalized → ⊕ VAULT / ✓ VAULT
Added playVaultSFX() — two-note rising chime (E5 → A5, 380ms) using Web Audio API, fires only when adding to vault, not on removal. Wired into toggleMaster, toggleEpMaster, and the COTD mark button.

Episode row reorder

Moved #episodesSection from inside .app-controls (between progress bar and category pills) to between hero CTA and the App section. DOM-only change, no logic touched.

Single-category dead space fix

buildGrid() now sets #netflixRows min-height dynamically: 1800px only when activeCat === 'all' and no search query active, 0 otherwise. Eliminates the ~30 rows of empty space below a single-category view.
Tradeoff: CLS may degrade slightly on initial all-cat load. Acceptable.

Counter bug — the long one
The progress counter persistently showed — / — after concepts loaded, despite the data being available and mastered being populated.
False leads chased:

updateProgress() running before CONCEPTS populated → added if (!CONCEPTS.length) return; guard. Didn't fix it.
Stale onclick handler accidentally toggling vault → removed onclick="toggleVault()" from #progressCount element. Good cleanup, didn't fix counter.
Suspected stray backtick from earlier edit corrupting the function → simplified by removing intermediate vaultEl variable. Didn't fix it.
Suspected concepts.json fetch failing silently → asked for DevTools network check. Network was fine, concepts.json loaded successfully.

The actual cause: there are TWO <script> blocks in the file. The first defines updateProgress() for the main progress bar. The second (quiz mode) ALSO defined updateProgress() for the quiz's internal progress bar. Both functions live on the global window object — the quiz's version overwrote the main one. When render() called updateProgress(), it was actually calling the quiz function, which writes to quizProgressFill / quizRoundNum / quizScoreNum. No error thrown because those DOM elements exist (just hidden inside the closed quiz overlay). The main counter never got updated.
Fix: renamed the quiz's updateProgress → updateQuizProgress in three places (definition, openQuiz(), renderRound()).
What to watch for in future sessions

Function name collisions across separate <script> blocks. Top-level function name() declarations are global. If two blocks define the same name, the later one wins silently.
When something "doesn't update" but no error is thrown, suspect a same-named function being called instead of the one you expect. console.log(updateProgress.toString()) in DevTools shows you which version is actually live.

---

## v1.26 — 2026-05-02 — Performance pass (index-netflix-test.html)

> ⚠️ All changes applied to `index-netflix-test.html` only.

### What changed

The site had become noticeably laggy after the Quiz + Streak + COTD design sessions. Scroll felt sticky on Retina, especially with DevTools closed. After a long debugging session, identified the cause and applied a set of performance fixes.

### Root cause
Three infinite CSS animations running simultaneously (`heroGlow`, `pulse`, `cotdPulse`) caused continuous GPU compositor work every frame, even when the animated elements were scrolled off-screen. On Retina at full viewport, this saturated the compositor.

### Fixes applied (CSS)
- **Removed `heroGlow` infinite animation** on `.hero::before`. Hero radial gradient is now static. Removed `will-change: transform, opacity` and the `@keyframes heroGlow` block.
- **Removed `pulse` infinite animation** on `.nav-dot`. The little gold dot in the nav pill is now solid. Removed `will-change: opacity` and the `@keyframes pulse` block.
- **Removed `cotdPulse` infinite animation** on `.cotd-eyebrow-dot`. The COTD modal indicator dot is now solid. Removed `will-change: opacity` and the `@keyframes cotdPulse` block.
- **Removed `backdrop-filter: blur(20px)` from `.daily-goal`**. Fixed bottom bar now uses solid `#0d0d0d`. The backdrop-filter on a 100%-width fixed element was forcing per-scroll-frame compositing of the whole page underneath it.
- **`fadeUp` keyframe now uses `transform: translateY()` instead of `margin-top`**. Margin animation forced layout reflow on every frame for every visible card; transform runs GPU-only.
- **Removed `scroll-snap-type` from `.nf-row`** (and `scroll-snap-align`/`scroll-snap-stop` from cards). Was doing scroll-position math during vertical page scroll.

### Fixes applied (JS)
- **`initMagneticCards` disabled** (`return;` at top of function). The mousemove handler on `#netflixRows` walked 165 cards via `e.target.closest()` and called `getBoundingClientRect()` on every pixel — measurable contributor to lag. Nav and pill magnetism kept (those are fine, only ~21 small elements).
- **`initDragScroll` disabled** (`return;` at top of function). Eliminated 55 event listeners (5 per row × 11 rows). Trackpad swipe and shift-scroll still work for horizontal navigation.
- **Search input debounced** to 180ms. Was rebuilding 165-card DOM on every keystroke.
- **Per-card `animation-delay` stagger removed** from `buildGrid` and `openEpisodeDrawer` card templates. Cards no longer animate in sequence — all fade in together, single GPU pass.

### Layout stability fixes (CLS)
- **`#netflixRows` has `min-height: 1800px`**. Prevents newsletter section from jumping down as concept rows render asynchronously. CLS dropped from 0.66 (poor) to ~0.12 (needs improvement, but acceptable).
- The `0.12` residual CLS is `#netflixRows` itself growing past the min-height once cards render. Could be tuned further by measuring exact rendered height, but visually no longer disruptive.

### Quiz fixes (carried over from earlier this session)
- `window.CONCEPTS = CONCEPTS` now set after fetch, so the separate quiz `<script>` block can read concept data
- Quiz pool is rebuilt fresh on every open (no stale-cache issue)

### What was kept
- Magnetic effect on `.nav-link` (6 elements, fine)
- Magnetic effect on `.cat-card` pills (15 elements, fine)
- All quiz mode functionality
- All COTD modal functionality
- All streak / daily goal functionality
- All vault, search, episode drawer functionality
- Card hover states (CSS `:hover` border + bottom glow)
- One-shot animations: `cotdSlideUp`, `quiz-shake`, `quiz-ripple-out`, `fadeUp`

### Diagnostic learning
The classic signature emerged: **site fast with DevTools open, laggy with DevTools closed**. This indicates GPU compositor pressure (DevTools open shrinks viewport → fewer pixels per frame). If you see this pattern again in the future, look for infinite CSS animations first.

### Files touched
- `index-netflix-test.html` only
- No changes to `concepts.json`, `collections.json`, or any other file

---

## v1.25 — 2026-05-02 — Quiz Mode (index-netflix-test.html)

> ⚠️ All changes applied to `index-netflix-test.html` only.

### Quiz mode — full 3-round game loop

**Nav button:**
- `◈ Quiz` button added to desktop nav island, separated by `.nav-divider`
- `border-radius: 999px` pill shape, matching existing nav aesthetic
- Hover: gold glow (`box-shadow: 0 0 12px rgba(232,213,163,0.18)`) + accent border
- Same magnetic force effect as nav links (existing `initMagneticNav` covers `.nav-link` — quiz button sits adjacent)
- Added to mobile menu as last item with `color: var(--accent)` to distinguish it

**Overlay shell:**
- Bottom-sheet entry: slides up from `translateY(100%)` with `cubic-bezier(0.32, 0.72, 0, 1)` spring
- Ripple effect on click: gold circle expands from button position, fades out in 550ms
- `height: 88vh` fixed — fills most of screen reliably across devices
- Backdrop: `rgba(13,13,13,0.92)` + `blur(4px)` — reduced from 16px for GPU performance
- `will-change: transform` on sheet, `will-change: opacity` on backdrop
- Gold progress bar (2px) tracks round completion across the top
- Header: Round N of 3 (DM Mono) + Score (Playfair Display gold) + ✕ close

**Round 1 — Hook Match (Multiple Choice):**
- Shows hook sentence + category chip (coloured). User picks correct term from 4 options.
- Options in 2×2 grid with A/B/C/D letter labels (DM Mono)
- Correct: green border + ascending two-tone (C→E) Web Audio tone + +10 pts
- Wrong: red shake animation + low tone + correct answer revealed
- Auto-advances after 1100ms

**Round 2 — Fill the Blank:**
- Shows `plain` definition with term replaced by `_____` in gold
- Playfair Display serif input field, gold caret
- 3 letter hints (first, middle, last letter of term) — tap to append to input
- Enter key submits. Correct: +15 pts (harder than MC = more reward)
- Wrong: red shake + "The answer was: X" revealed in feedback line
- Auto-advances after 1400ms

**Round 3 — Analogy Decode (Tap-to-Match):**
- 4 analogy cards (left, italic, `--surface2`) vs 4 term cards (right, serif, `--bg`)
- Tap analogy → highlights gold. Tap correct term → both lock green, +20 pts
- Wrong tap → both flash red 500ms, analogy stays selected for retry (no penalty)
- All 4 matched → 600ms pause → Round 3 interstitial

**Interstitials (between rounds):**
- `✦` icon + round title + random message + XP badge (e.g. `+40 PTS`) + Continue button
- Per-round scores stored on `quizState._r1score`, `_r2score`, `_r3score`

**End screen:**
- Rank tiers: DEEP THINKER (≥90%) / CONCEPT COLLECTOR (≥70%) / SHARP MIND (≥50%) / CURIOUS LEARNER (≥30%) / JUST WARMING UP
- 5-star row in gold/muted based on score percentage
- Large score number (Playfair, gold) + "out of 180 pts · X%"
- Score breakdown grid: Hook Match / Fill Blank / Analogy pts in 3 columns
- Major chord finish tone (C E G C ascending, Web Audio API)
- Play again (reshuffles pool) + Done buttons

**Scoring:**
- Max score: 180 pts (4×10 + 4×15 + 4×20)
- Pool: 12 concepts drawn randomly from full eligible set on each open
- Eligible = concepts with non-empty hook, plain, analogy, term

**Known issue at time of writing:**
- Quiz throws "Concepts still loading" alert if `window.CONCEPTS` is not yet populated when `openQuiz()` fires. Root cause: pool built at click time, not after load. Fix pending in next session — see build-journal.

---

## v1.24 — 2026-05-02 — Streak System + Share Card (index-netflix-test.html)

### Streak system
- Added `lll_streak_v1` localStorage key to STORAGE_KEYS
- Added `saveStreak()`, `loadStreak()`, `checkAndUpdateStreak()`, `updateStreakDisplay()`, `initStreakDisplay()` functions
- Streak increments when daily goal (5 concepts opened) is completed on consecutive calendar days
- Missed day resets streak to 0. Display shows 🔥 N day streak in the daily goal bar
- `initStreakDisplay()` called on page load; flame opacity 0.35 when streak is 0

### Daily goal bar redesign
- Restructured HTML into `.daily-goal-left` (label + dots) and `.daily-goal-right` (message + streak)
- `justify-content: space-between` keeps everything on one row at all screen sizes
- Removed `flex-wrap: wrap` mobile override — no longer needed

### Share card (canvas-rendered image)
- Replaced plain-text `shareCard()` with canvas-rendered portrait image (1080×1920 @ 2× pixel density)
- Shows: category pill, concept number, term, hook, What It Means, Analogy, Reflect & Use It, branded footer
- Share modal: overlay with Save Image (PNG download) + Share ↗ (Web Share API with image file) + Close
- Section labels rendered as full-width strips with category-colored left tick
- `CATEGORY_COLORS` map defined in JS (mirrors design-tokens.md)
- `wrapText()` and `roundRect()` canvas helpers added
- WhatsApp/native share includes hook + call-to-action message + site URL
- `nativeShare()` tries `canShare({files})` first, falls back to text-only share

---

## v1.24 — 2026-05-02 — Layout overhaul + card interactions (index-netflix-test.html)

> ⚠️ All changes in this version are applied to `index-netflix-test.html` only.
> `index.html` (live site) is unchanged.

**Performance fix:**
- Removed `body::before` noise overlay (SVG fractalNoise on a `position:fixed` element). Was forcing full-page repaint on every scroll event, causing severe lag across the entire browser. Single biggest performance win in the project so far.

**Layout — full-width category rows:**
- `.app` max-width constraint removed. Section now spans full viewport width.
- New `.app-controls` wrapper (max-width 1100px, centred) contains header, search, progress bar, vault pill, category pills, and results count.
- Category rows and episodes row now bleed edge-to-edge with left + right fade overlays.

**Category rows — auto-scroll removed:**
- Entire `startRowAutoScroll()` function and its `requestAnimationFrame` loop deleted (~55 lines).
- Replaced with mouse drag-to-scroll (`initDragScroll()`): click-hold and drag left/right on desktop; native touch swipe on mobile.
- Drag detection threshold of 4px prevents accidental card opens during scroll.
- `didDrag` flag + capture-phase click blocker prevents card toggling on drag release.

**Card interactions:**
- Cards no longer use CSS `transform: translateY` on hover (conflicted with JS magnetic effect).
- Entry animation changed from `transform: translateY(16px)` to `margin-top: 12px` so JS owns `transform` exclusively.
- Magnetic pull added to concept cards via `initMagneticCards()` — event delegation on `#netflixRows` container, runs once after load.
- `align-self: flex-start` added to `.nf-row .concept-card` so opening one card does not stretch siblings.
- Category-coloured glow line (1px, bottom edge) fades in on hover.
- Only one card can be open at a time — `toggleCard()` closes all other open cards before opening the clicked one.

---

## v1.23 — 2026-05-01 — Netflix UI Test Round 2 (index-netflix-test.html)
 
> ⚠️ All changes in this version are applied to `index-netflix-test.html` only.
> `index.html` (live site) is unchanged. These features will be promoted to
> `index.html` once the test is signed off.
 
This session was a comprehensive UI/UX overhaul structured in phases A–E.
The test file was created by copying `index.html` to `index-netflix-test.html`
on GitHub and iterating there. Live at:
`https://listen-learn-live.vercel.app/index-netflix-test.html`
 
### Phase A — Structural cleanup
 
**A1 — Page reorder**
- Removed Newsletter and How It Works sections from between the hero and app sections
- New page order: Nav → Hero → App (Browse + Episodes + Concepts) → Newsletter → Daily Goal Bar
- Added `id="signup"` to the newsletter section for nav anchor linking
- "How It Works" section removed from the page flow entirely (replaced by modal in A2)
**A2 — How It Works → lightweight modal**
- Added `<button class="hiw-trigger">` in the nav right cluster — small pill button labeled "How it works"
- Modal overlay (`#hiwOverlay`) uses `backdrop-filter: blur(6px)` and `opacity` transition
- Three-step grid inside the modal (01 Pick a Category / 02 Read the Clue Card / 03 Reflect & Use It)
- Closes via: ✕ button, clicking the backdrop, or Escape key
- Body scroll locks while modal is open
- JS functions added: `openHiw()`, `closeHiw()`, `closeHiwOnBackdrop(e)`
**A3 — Category grid → compact magnetic pill row**
- Replaced the 2-row card grid (~300px tall) with a wrapping centered pill row (~2 rows, ~80px)
- All 15 pills (All + 14 categories) visible without scrolling — no horizontal overflow
- Each pill: transparent background, 0.5px colored border, DM Mono label, category icon restored
- Active pill: subtle `rgba(255,255,255,0.06)` background fill
- **Magnetic hover effect added:** pills pull toward the cursor within an 80px radius at 35% strength, spring back on mouse leave using `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- `initMagneticPills()` runs after every `buildCats()` call
- Category icons (geometric symbols) restored next to each label; concept counts hidden
---
 
### Phase B — Navigation
 
**B1 — Floating nav island**
- Nav rebuilt as a 3-column CSS grid: logo left | floating island center | controls right
- Center island: frosted pill container (`var(--surface2)` + `border-hover` border) with 5 jump links: Concepts · Episodes · Vault · Today · Sign Up
- Nav shrinks from 76px → 62px height on scroll via `.scrolled` class toggled by scroll listener
- Right cluster: "How it works" pill button + concept count pill + mobile toggle `≡`
- **Magnetic effect on nav links** — same mechanic as category pills (25% strength)
- `initMagneticNav()` runs on `DOMContentLoaded`
- `scrollToSection(id)` — smooth scrolls to any section anchor
- Mobile (≤768px): island hides, `≡` button appears, tapping opens full-width dropdown menu with all 6 links
- `toggleMobileNav()` / `closeMobileNav()` manage the mobile menu state and body scroll lock
- Nav pill text shortened to "183 free" for compactness
**B1 — COTD fix**
- "Today" nav link originally called `openCotd()` which opened a blank modal (content never rendered)
- Root cause: `initConceptOfTheDay()` skips rendering if dismissed today; nav bypass went around it
- Fix: added `openCotdFromNav()` — always calls `pickTodaysConcept()` + `renderCotd()` before opening, bypassing the dismissed check. Closing via this path does NOT mark as dismissed.
---
 
### Phase C — Card & grid cleanup
 
**C1 — People pills: grid hidden, expanded shown**
- `.card-front .people-pills { display: none }` — pills no longer visible on closed cards
- `.card-back .people-pills { display: flex }` — pills appear in the expanded back view
- CSS-only change, no JS modification
**C3 — Mobile auto-scroll fix**
- Rewrote `startRowAutoScroll()` with delta-time normalization (`speed * delta / 16`) for consistent speed across all device refresh rates
- Added `row._autoScrollRAF` cancellation — prevents animation stacking when `buildGrid()` is called multiple times
- All touch listeners use `{ passive: true }` — required for iOS scroll performance
- Boundary checks use `<= 1` / `>= maxScroll - 1` to avoid floating-point never reaching exact boundary
- Odd rows now correctly start at `maxScroll` and scroll toward 0 (right-to-left)
---
 
### Phase D — Episodes redesign
 
**D1 — YouTube thumbnail pull**
- Added `getYouTubeId(url)` helper — parses both `youtube.com/watch?v=` and `youtu.be/` formats, handles `&t=` parameters cleanly
- Episode thumbnails now use `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg`
- `onerror` fallback: if `maxresdefault` 404s (older videos), auto-switches to `hqdefault.jpg`
- Episodes with no `episode_url` show a clean dark fallback card with the title in italic Playfair
- Thumbnail scales to 1.04x on card hover (subtle zoom, CSS transition)
- Removed: color bar initials thumbnail, category mix bar from episode card face
- Episode thumb height increased from 160px → 170px
---
 
### Phase E — Visual polish
 
**E1 — Hero & typography pass**
- Hero heading increased: `clamp(2.8rem, 7vw, 5.5rem)` → `clamp(3.2rem, 8.5vw, 7rem)` — fills more of the viewport
- Hero eyebrow: removed pill border, replaced with flanking editorial lines (CSS `::before`/`::after` pseudo-elements, 32px each)
- Stat numbers increased: `2rem` → `clamp(2.5rem, 4vw, 3.8rem)` — become display-size design elements
- Stats row gains `border-top` and `border-bottom` (1px `var(--border)`) with `padding: 2rem 0` — editorial moment
- Stat labels switched to DM Mono with wider letter-spacing
- Hero subtext line-height increased: `1.7` → `1.8`
- Hero CTA button: padding increased, gains warm glow `box-shadow` on hover
- App section top padding: `0` → `5rem` — breathing room between hero and browse section
- Subtle animated radial glow behind hero text (CSS `::before`, `@keyframes heroGlow`, 8s cycle) — barely visible, adds depth without visual noise
- Hero max-width increased: `900px` → `960px`

---

## v1.22 — 2026-04-30 — Episode drawer UI: Netflix-style bottom sheet (Test Round 1)

**What shipped:** Complete redesign of the episodes section. This is the first
test round of the Netflix-inspired episode browsing experience. The feature was
previously a horizontal filter row that filtered the concept grid in place.
It is now a full bottom-drawer experience.

### Episode cards (the row)
- Cards widened from 220px to 300px landscape format — album-cover feel
- Full-bleed thumbnail area (160px tall) with dominant category color as tinted
  background and italic Playfair initials for the episode's people
- Category mix bar moved to the bottom edge of the thumbnail — always visible,
  color-proportional to concept distribution in that episode
- Section header redesigned: "EPISODES" label in DM Mono + horizontal rule
  extending to the right edge (editorial divider style)
- Fade-out gradient mask on the right edge signals more cards are available
- Cards no longer show an active/selected state — click always opens the drawer

### Episode drawer (the overlay)
- Clicking any episode card opens a bottom sheet that slides up over 88vh of
  the screen with spring easing (`cubic-bezier(0.32, 0.72, 0, 1)`)
- Background page blurs (`backdrop-filter: blur(8px)`) and darkens to 70%
  opacity — page content remains visible but recedes
- Drawer header contains: episode title (Playfair, bold), people pills (DM Mono),
  concept count badge (accent-colored, bordered), and "↗ Listen" deep link if
  `episode_url` is present in `collections.json`
- Full-width category mix bar runs below the header as a 3px accent stripe
- Concept cards inside the drawer use the identical flip mechanic as the main
  grid — same HTML structure, same CSS classes, fully functional
- Mastering a concept inside the drawer updates both the drawer card and the
  main grid simultaneously (no page reload needed)
- Drawer closes via: ✕ button, clicking the blurred backdrop, or Esc key
- Body scroll locks while drawer is open (`overflow: hidden` on body)

### New JS functions added to index.html
- `openEpisodeDrawer(collectionId)` — renders and opens the drawer for a given episode
- `closeEpisodeDrawer()` — closes drawer, removes backdrop, restores scroll
- `toggleEpCard(id)` — flip handler for cards inside the drawer
- `toggleEpMaster(e, id)` — master toggle for drawer cards; syncs to main grid
- `buildEpisodes()` — renders the episode card row; auto-hides section if no
  episode collections exist

### Removed from previous episode implementation
- `setEpisode(collectionId)` — filter-based approach removed entirely
- `activeEpisode` state variable — no longer needed
- Episode filter logic removed from `filtered()` function
- `.ep-active` card state styling removed (drawer replaced selection model)

### Known limitations for Test Round 1
- Thumbnail is generated (initials + category color tint) — no real podcast
  artwork yet. Planned for a future round once scraping/storage is decided.
- "Most Concept-Dense" second row (episodes ranked by concept count) is deferred
  — needs more than 3 episodes to be meaningful as a sort dimension.
- No swipe-down gesture to close on mobile — only tap-backdrop and ✕ button.
  Swipe gesture deferred to Test Round 2.
- Episode cards inside the drawer do not show people pills (intentional — the
  drawer header already shows the episode people; repeating on every card is
  redundant noise).
- No episode summary / "90 seconds" blurb yet — depends on an extra extraction
  prompt field that hasn't been added to the pipeline.

---

## v1.21 — 2026-04-30 — Concept cards now load newest-first (highest ID shown first). Added `.reverse()` to `filtered()` in `index.html`.

- Added "Vault of Ideas" feature: mastered concepts filter accessible via YOUR VAULT pill below the progress bar
- Progress bar counter now shows "13 / 183" format; clicking it also toggles the Vault
- Vault pill styled right-aligned, monospace, accent-colored when active
- Renamed "mastered" framing to "Vault of Ideas" throughout UI

---

## v1.20 — 2026-04-29 — Embedded extraction prompt synced + first real episode shipped (D3)

Two related changes landed in one session: closed the silent
prompt-drift bug in `/api/extract-concepts.js`, then ran the first
real-episode end-to-end test. The pipeline now works end-to-end on
real podcast input.

**Code change — embedded prompt synced to v1.2:**
- The `EXTRACTION_PROMPT` constant in `/api/extract-concepts.js` had
  drifted from `extraction-prompt-v1_2.txt` and still listed only
  7 categories. Synced now.
- 14-category list now matches `quality-rules.md` and
  `extraction-prompt-v1_2.txt`.
- `CATEGORY ASSIGNMENT RULES` block expanded: language flagged as
  FLAGSHIP, tech-ai gets the 15-year-old analogy test.
- Added one explicit instruction to the model:
  `Do not output a "collection_id" field — it is assigned by the
  pipeline, not by you.` Prevents the model inventing collection IDs
  now that the field is widely referenced in surrounding text.
- Closed a silent bug where any concept Claude assigned to `identity`,
  `health`, `philosophy`, `society`, `creativity`, `science`, or
  `tech-ai` would be invented by the model but then rejected by
  `createConceptRow()`'s validator — silently lost.

**D3 — first real-episode end-to-end test passed:**
- Submitted a real transcript via the Intake form. Pipeline ran clean:
  Intake NEW → extract function fired → new collection appeared in
  `collections.json` (id ≥ 10, type=episode, people[] populated) →
  PENDING concepts written to Airtable with `Collection ID` pre-filled
  → approved one → published to live site with correct `collection_id`
  → people pills rendered.
- D2 cleanup done as part of D3: removed test collection (id 10) and
  reverted the one concept whose `collection_id` was manually pointed
  at it for D2 verification. `collections.json` and `concepts.json`
  now contain only real data.

**Hiccup en route — Make.com JSON-string mode broke on transcript text:**
- Make's HTTP module in `JSON string` body mode can't tolerate
  unescaped quotes / newlines / control chars in templated values —
  rendered an invalid body before sending. Free-tier Make doesn't
  expose `escape("json")` or `json()`.
- Fix landed: added a `Transcript JSON` formula field on the Intake
  table that pre-escapes backslash, double-quote, forward-slash,
  newline, carriage-return, tab, and null bytes. Map this field
  instead of raw `Transcript` in the HTTP body.
- A trailing-comma typo in the body template caused one extra failed
  run before the real fix landed. Worth knowing for next time.

No schema change. No frontend change. No publish-path change.
Pipeline now fully validated on real input.

---

## v1.19 — 2026-04-29 — D2: people pills on concept cards

Concept cards now render people pills below the category pill when the
concept's collection has a populated `people` array. Frontend-only change.

- `index.html`: fetch `collections.json` alongside `concepts.json`, build
  a `COLLECTIONS_BY_ID` lookup, render `.people-pills` row in card template
  conditional on `collection_id != null` && `collection.people.length >= 1`.
- New `.people-pill` CSS: mono, 0.6rem, uppercase, muted color, transparent
  bg with border. Visually distinct from category pill (no color fill).
- Graceful degradation: if `collections.json` fails to load, cards render
  without pills, no errors.
- 162 existing concepts (foundational packs 1–6, no `people` array) show
  no pills — cards unchanged.
- Verified with one test concept assigned to a test collection (id 10,
  type=episode, people=["Chris Williamson","Naval Ravikant"]). Test
  entry stays in `collections.json` until D3 produces a real episode
  collection, then gets removed.

---

## v1.18 — 2026-04-29
**D1 complete: episode-based collections auto-create during extract**

When a transcript is submitted via the Airtable Intake form, the extract
function now creates a new collection in `collections.json` BEFORE writing
concepts to Airtable. Each PENDING concept lands with its `Collection ID`
field pre-filled — no manual assignment needed for episode-based concepts.

- `/api/extract-concepts.js` extended with new `createEpisodeCollection()`
  helper. Reads `collections.json` from GitHub, computes next ID
  (`max(existing) + 1`, minimum 10 to avoid foundational packs 1–6),
  appends the new record, commits back to GitHub. Failure here aborts the
  whole job before any Airtable writes — no orphan concepts.
- Collection record shape for episode-based collections:
  `{ id, title, type: "episode", people[], episode_url, created_date }`.
  `people` is an array, parsed from the Airtable People field by splitting
  on comma. `created_date` is ISO date (YYYY-MM-DD).
- New `People` field added to the Airtable Intake table (Long text, required
  on the Submit Transcript form). Convention matches Episodes: host first,
  then guests, comma-separated. Example: `Chris Williamson, Naval Ravikant`.
- Make.com scenario `LLL — Intake NEW → Claude → Concepts PENDING`: HTTP
  module body now includes `"people": "{{People}}"`.
- Duplicate prevention: same `episode_url` already in `collections.json`
  causes a clean failure (Intake row → FAILED). No second collection
  created, no concepts written.
- Bundled correction: `VALID_CATEGORIES` whitelist in extract-concepts.js
  expanded from 7 to 14 to match the live site and the publish function
  (v1.17 fix). Without this, any concept Claude returned with category
  `identity`, `health`, `philosophy`, `society`, `creativity`, `science`,
  or `tech-ai` would have been rejected at the Airtable write step.
- **Known limitation:** the embedded `EXTRACTION_PROMPT` constant in
  extract-concepts.js still tells Claude to use one of the original 7
  categories. Claude isn't yet attempting the new 7. Held as a separate
  prompt-tuning session.

End-to-end real-podcast verification deferred to D3.

---

## v1.17 — 2026-04-28
**Group C complete: publish path is 9-field compliant**

- `/api/publish-concept.js` now accepts `collection_id` (integer or null) and writes it to concepts.json
- Make.com scenario maps Airtable Collection ID into the POST body
- Empty Collection ID in Airtable → `null` in JSON (handles Make free-tier null quirks via input normalization)
- Fixed stale category whitelist in publish function: added identity, health, philosophy, society, creativity, science, tech-ai (previously these would have been rejected at publish time with a 400)
- Schema gap between Airtable, Make, and the publish path is closed

---

## v1.16 — 2026-04-28

### Added two Airtable fields ahead of the C3 publish-path update (C1, C2)

Two new fields were added to the Airtable base. Both ship together
because they pair as the editorial inputs that the C3 publish
automation will eventually read. **No code, no Make.com, no Vercel
changes** in this session.

**C1 — `Collection ID` field on the Concepts table:**
- Type: Number, format Integer
- Required: No (blank-allowed)
- Purpose: lets the editorial reviewer assign a concept to a
  collection. 1–6 = foundational packs (per `collections.json`),
  10+ = episode-based collections.
- Existing PUBLISHED rows: left blank by design. The 163 records on
  the live site already have their `collection_id` set in
  `concepts.json` via v1.15. Airtable PUBLISHED rows are a reference
  snapshot, not the source of truth.

**C2 — `People` field on the Episodes table:**
- Type: Long text (rich text disabled)
- Required: convention-only at the field level (Airtable Long text
  doesn't expose a database-level required toggle). Will be enforced
  at the form level when the Episodes submission form is built.
- Purpose: captures host + guests for an episode-based collection.
  Will flow into the `people` array on the corresponding collection
  in `collections.json` once C3 wires the path through.
- **Population convention (locked in this session):**
  host first, then guests, comma-separated, full canonical names.
  Example: `Chris Williamson, Naval Ravikant, Tim Ferriss`.
  Solo episode: `Chris Williamson`.

**Why Long text and not Multi-select:** lower friction at MVP solo
scale. Aggregation use cases that justify Multi-select don't yet
exist. Migration to Multi-select later is cheap (Airtable parses
comma-separated values automatically on type change).

**⚠️ Schema gap is still open after this session.** The Make.com
publish automation and `/api/publish-concept.js` still write the
8-field shape (no `collection_id`). Closing the gap is C3, scheduled
separately. Until C3 ships, do not approve concepts expecting
`Collection ID` to flow to the live site — it won't.

No code changes. Two field additions only.

---

## v1.15 — 2026-04-28

### Backfilled collection_id on all 163 concepts (A4)

Every concept now belongs to one of the 6 foundational collections defined in collections.json. Mapping is by category, applied uniformly:

- thinking, psychology → 1 (Mental Models)
- finance → 2 (Money & Risk)
- power, relationships, society → 3 (Power & Influence)
- language → 4 (Language & Expression)
- identity, philosophy, health → 5 (Identity & Self)
- business → 6 (Business & Building)
- creativity (empty) → 6
- science (empty) → 1
- tech-ai (empty) → 6

Distribution across packs: 73 / 9 / 34 / 3 / 21 / 23.

Single-commit bulk edit. No schema changes, no concept count change, no UI change. Group A (cleanup) is now fully complete.

---

## v1.14 — 2026-04-28 — Duplicate concepts removed (IDs 55, 68)

Removed the two known duplicate concepts from `concepts.json`. This was
the last pending build task carried over from the 2026-04-26 sessions.

**Deleted:**
- ID 55 "Manufactured Consent" (category: power) — duplicate of ID 144
- ID 68 "Defensive Pessimism" (category: thinking) — duplicate of ID 150

**Kept:**
- ID 144 "Manufactured Consent" (category: society) — sharper hook, names
  Chomsky in the plain explanation, more concrete analogy, sits in the
  editorially correct category per v1.8 taxonomy
- ID 150 "Defensive Pessimism" (category: thinking) — punchier hook,
  better closing line in plain ("preparation transforms fear into a
  concrete plan"), more vivid pilot analogy

**Live state after this change:**
- 163 concepts total (was 165)
- IDs 1–165 with gaps at 55 and 68
- Next assigned ID is still 166 (`max(id) + 1` is unaffected by gaps)
- Category distribution unchanged in shape; `power` drops from 10 to 9,
  `thinking` drops from 50 to 49

**Verified on the live site:**
- Nav pill reads "163 concepts" (confirms v1.11 dynamic counts working)
- Hero "Concepts" stat reads 163; "Categories" stat unchanged at 11
- Searching "Manufactured Consent" returns exactly one card (ID 144)
- Searching "Defensive Pessimism" returns exactly one card (ID 150)
- No new console errors

No code changes. Data-only edit committed directly to `main` via the
GitHub web editor.

---

## v1.13 — 2026-04-28

**Removed dead `PROMPTS` object and `getPrompt()` helper from `index.html`.**

The block was a legacy placeholder from before each concept had its own
`prompt` field in `concepts.json`. Cards have rendered `c.prompt` directly
since the 2026-04-25 phantom prompt fix; the dead code was never deleted.
This commit removes both the `const PROMPTS = { ... }` object (~7 category
arrays of placeholder prompts) and the `const getPrompt = (cat) => { ... }`
helper that wrapped it. ~45 lines removed. No functional change — verified
on the live Vercel URL: cards still show their real per-concept prompts,
COTD modal unaffected, no new console errors.

Closes the cleanup task tracked in roadmap.md and noted in the
2026-04-25 build-journal entry.

---

## v1.12 — 2026-04-28 — Removed source filter UI from `index.html`

The source filter pill row (All Sources / Foundational / Modern Wisdom /
Alex Hormozi / Dan Koe) was removed from the live site, along with all
JavaScript and CSS that supported it. This change was originally intended
to ship in v1.7 but did not land at that time; it is now applied.

**Changes to `index.html`:**
- Removed `.source-filters` and `.src-btn` CSS rules.
- Removed `<div class="source-filters" id="srcFilters"></div>` from the
  app section markup.
- Removed the `SOURCES` array.
- Removed the `SRC_LABEL` object.
- Removed the `activeSrc` variable from the `let activeCat...` declaration.
- Removed the `buildSrc()` function.
- Removed the `setSrc()` function.
- Removed the `buildSrc();` call from `render()`.
- Removed the `ms` filter line and the `&& ms` term from `filtered()`.

**What was deliberately NOT changed:**
- The `source` field on every concept in `concepts.json` is preserved as
  legacy data.
- The Airtable Concepts table keeps its `Source` field.
- The agent pipeline (`/api/extract-concepts.js`,
  `extraction-prompt-v1_2.txt`, `/api/publish-concept.js`) all keep
  reading and writing `source`.
- Retiring the `source` field from the data path is a separate deferred
  task (C4) and is held until after C1+C2+C3.

No schema, data, or design-token changes. Cards still render their
existing category pill; no replacement UI was added.

---

## v1.11 — 2026-04-27 — Dynamic concept and category counts

Replaced hardcoded "160" / "8" across `index.html` with live counts pulled
from `CONCEPTS.length` and the set of active categories. From now on the
nav pill, hero stats, and progress bar fallback all update automatically
whenever `concepts.json` changes.

**Changes:**
- Nav pill `160 concepts` → dynamic `<span id="navConceptCount">`.
- Hero "160 / Concepts" stat → dynamic `<span id="heroConceptCount">`.
- Hero "8 / Categories" stat → dynamic `<span id="heroCategoryCount">`,
  counts categories with at least one concept (currently 11, not 14).
- How It Works step 01 copy rewritten to drop the stale 7-category
  enumeration and the hardcoded "160".
- Progress bar fallback text updated from `0 / 160` to `0 / 165` (the
  runtime count was already dynamic; only the pre-load fallback was stale).
- New `updateHeaderCounts()` function called at the end of `loadConcepts()`.

No schema, data, or design-token changes.

---

## v1.10 — 2026-04-27 — Documentation cleanup: realigned all docs to live state

After the 2026-04-26 sessions, several documentation entries described work
that was attempted but did not land on the live site (the project's local
copies of `index.html` and `concepts.json` were not synced before those
sessions ran, so changes were made against stale files). Today's pass
audits all docs against the live `index.html`, live `concepts.json`, and
live `collections.json`, and corrects the drift.

**Live state confirmed by this audit:**
- `concepts.json` has 165 records, IDs 1–165 contiguous, no gaps.
- IDs 55 and 68 ARE present and ARE duplicates of 144 and 150.
- All 165 records have a 9th `collection_id` field, all set to `null`.
- 11 categories are in active use; 3 (creativity, science, tech-ai) are empty.
- Source filter UI in `index.html` is live (was not removed despite v1.7 claim).
- Hardcoded "160" remains in nav pill, hero stats, How It Works copy, and
  progress bar fallback text in `index.html`.
- Cards already render a category pill (`card-cat`).

**Corrections applied:**
- v1.7 entry rewritten to describe what was attempted, why the changes did
  not reach the live site, and what is still pending.
- v1.8 projected category distribution replaced with the actual live
  distribution.
- "163 concepts" replaced with "165 concepts" across all docs.
- `airtable-schema.md` corrected to reflect the actual current Concepts and
  Episodes tables (no `Collection ID` field, no `People` field, JSON
  construction maps 8 fields).
- `extraction-prompt-v1_2.txt` header version, category JSON syntax error,
  and missing `collection_id` example field corrected.

**No code changes were made in this session.** Cleanup-of-docs only.

The intentional duplicate-removal of IDs 55 and 68 remains a pending build
task, scheduled separately.

---

## v1.9 — 2026-04-26 — Concept of the Day Added (B2)

- Added modal-style "Today's Concept" card that opens on page load.
- Day-deterministic random pick from full concept library.
- Dismissal persists for the calendar day via `lll_cotd_dismissed_v1`
  localStorage key.
- "Mark Internalized" CTA writes through to both the `mastered` set and
  the daily goal counter.
- "Use it today" line reuses the existing `prompt` field; dedicated
  schema field deferred to Phase 1.5.
- No tech stack changes. Pure HTML/CSS/Vanilla JS, single-file edit
  to `index.html`.

---

## v1.8 — 2026-04-26 — A2 re-categorisation applied + 14-category taxonomy

- Re-categorised concepts across the expanded taxonomy. Most of the A2
  decision sheet moves landed; final live distribution differs slightly
  from the projection because the merge of IDs 55 and 68 (planned in v1.7)
  did not actually land on the live file — see v1.10 cleanup notes.
- Expanded category system from 7 → 14: added `creativity`, `health`,
  `identity`, `philosophy`, `science`, `society`, `tech-ai`
- `creativity`, `science`, and `tech-ai` are present as filterable
  categories but currently empty — reserved for future episode content
- Card UI now renders a category pill via the `card-cat` span
  (coloured by category using design-token hexes)
- `concepts.json` updated; legacy `source` field remains on every concept

**Live category distribution after this session (verified 2026-04-27):**
thinking 50, psychology 24, business 23, society 15, power 10,
relationships 10, finance 9, philosophy 9, identity 9, language 3,
health 3. Total 165.

**Concept count:** the file contains 165 records, IDs 1–165 contiguous,
no gaps. IDs 55 and 68 ARE present and ARE duplicates of 144 and 150.
The duplicate-removal cleanup is a pending build task. Next assigned
ID is 166.

---

## v1.7 — 2026-04-26 — Architecture redesign session: partial landing

This entry covers an architecture session that attempted three coordinated
changes. Two landed on the live site; some pieces did not, because the
session ran against local copies of `index.html` and `concepts.json` that
were out of date relative to GitHub. The corrections were folded into the
v1.10 cleanup pass on 2026-04-27.

### A3 — `collections.json` introduced ✅ (landed)
- New file `collections.json` committed to GitHub repo root, alongside
  `concepts.json` and `index.html`.
- 6 foundational curated collections, IDs 1–6:
  - 1: Foundations: Mental Models (categories: thinking, psychology)
  - 2: Foundations: Money & Risk (categories: finance)
  - 3: Foundations: Power & Influence (categories: power, relationships)
  - 4: Foundations: Language & Expression (categories: language)
  - 5: Foundations: Identity & Self (categories: identity, philosophy)
  - 6: Foundations: Business & Building (categories: business)
- File is referenced by nothing yet — `index.html` does not read it.

### A1 — `collection_id` field added to every concept ✅ (landed)
- All 165 records in `concepts.json` now have `"collection_id": null` as
  their 9th field.
- Schema-only change, no values assigned. `null` means "not yet placed in
  a collection" — a future A4 will set values 1–6 for the foundational
  packs and episode IDs (10+) for episode-based collections.
- Field appears as the last property of each concept object.
- Site rendering unaffected: the rendering code does not read this field.

### B1 — 14 categories live ✅ (landed)
**Categories expanded from 7 to 14** (alphabetical, with "All" first):
- Existing 7 retained: business, finance, language, power, psychology,
  relationships, thinking
- New 7 added: creativity, health, identity, philosophy, science, society,
  tech-ai
- Each new category has its own colour code in CSS and JS
  (see design-tokens.md)
- Cards render a category pill via the `card-cat` span using `CAT_COLOR`.

### B1 attempted but DID NOT land — pending re-application
The following changes were drafted in the session but did not reach the
live `index.html`:
- Source filter row removal. The filter pills (All Sources / Foundational /
  Modern Wisdom / Alex Hormozi / Dan Koe) still render on the live site.
  `SOURCES`, `SRC_LABEL`, `buildSrc()`, `setSrc()`, `activeSrc`, and
  `.src-btn` CSS are all still present.
- Dynamic concept count. The nav pill still hardcodes "160 concepts." The
  hero stat still hardcodes "160" and "8 Categories." The How It Works
  step 1 copy still lists only 7 categories and "all 160." The progress
  bar fallback text still says "0 / 160 mastered." (Runtime progress
  count IS dynamic via `CONCEPTS.length`, but the static fallbacks are
  stale.)
- The duplicate merges of IDs 55 and 68. These IDs are still present in
  `concepts.json` and ARE duplicates of 144 and 150.

These items are noted here for the record. Re-application is a pending
build task, not a documentation task — held until each is wanted as a
focused single-task session.

### A2 — re-categorisation decision sheet → mostly applied
- Editorial review of all concepts complete.
- Most moves landed on the live `concepts.json`. See v1.8 entry below for
  the live distribution as of 2026-04-26.

### Console warnings (notes from session)
- Quirks Mode warning targeted with clean `<!DOCTYPE html>` at byte 0.
  Warning may persist if GitHub adds a UTF-8 BOM during web-editor paste.
  Mitigation note in build-journal.md.
- "CSP blocks eval" warning identified as third-party (browser extension
  injecting `lockdown-install.js`). Not from our code.

---

## v1.6 — 2026-04-26

- Added `collection_id` field to all 165 records in `concepts.json` (default value `null`)
- Schema-only change to support the new collections architecture (curated foundational packs + episode-based collections going forward)
- Site rendering unchanged — the field is set but not yet referenced by `index.html`
- `collections.json` already live on GitHub with 6 foundational curated packs (IDs 1–6)

---

## v1.5 — 2026-04-24
 
- Built Automation 1: the extraction half of the agentic pipeline — Airtable Intake form → Claude API → Concepts table as PENDING
- Added Vercel serverless function at `/api/extract-concepts` that accepts a transcript, calls Claude API with the full extraction prompt, parses the returned JSON array, and writes one PENDING row per concept to the Concepts table
- Function reuses the `X-Publish-Secret` auth pattern from `/api/publish-concept`
- Function updates the Intake row status (`DONE` / `FAILED`) and records concepts-created count + error messages for debugging
- Function configured with `maxDuration: 300` to accommodate long transcripts (Claude can take 30–90s on full episodes)
- Added Airtable `Intake` table with fields: Episode Title, Host, Episode URL, Duration, Transcript, Status (NEW/PROCESSING/DONE/FAILED), Concepts Created, Error Message, Created, Last Modified Time (scoped to Status only)
- Added public Airtable form "Submit Transcript" as the pipeline's front door — no infrastructure, free, handles transcripts of any size
- Stored `ANTHROPIC_API_KEY`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` as Vercel environment variables
- Make.com scenario `LLL — Intake NEW → Claude → Concepts PENDING` — 2 modules: Airtable Watch Records (by Created Time) → HTTP POST to function
- Scheduled polling set to every 1 hour (same reasoning as Automation 2: free-tier budget)
- HTTP module timeout extended to 300s to match function max duration
- Added `toTitleCase()` helper in `/api/extract-concepts.js` that normalizes all extracted terms to English Title Case before writing to Airtable (respects minor-word rules: "Skin in the Game", not "Skin In The Game")
- End-to-end tested: submitted a transcript via form → 21 PENDING concepts appeared in Airtable within ~90s → flipped one to APPROVED → Automation 2 pushed it live

## v1.4 — 2026-04-24

- Built Automation 2: the publish half of the agentic pipeline — Airtable `APPROVED` → GitHub `concepts.json` → live site in ~60s
- Added Vercel serverless function at `/api/publish-concept` that validates, fetches, appends, and commits concepts to GitHub
- Function auto-computes next sequential ID based on what's actually in `concepts.json` (not on Airtable state)
- Function includes duplicate-term protection to prevent accidental double-publishes
- Function enforces schema validation: rejects invalid categories, sources, or missing fields
- Stored `GITHUB_TOKEN` and `PUBLISH_SECRET` as Vercel environment variables
- Make.com scenario `LLL — Airtable APPROVED → GitHub → Live` — 2 modules: Airtable Watch Records → HTTP POST to function
- Scheduled polling set to every 1 hour (free-tier friendly, ~720 ops/month of the 1,000 quota)
- Added Airtable `Last Modified Time` field configured to track only `Status` changes (prevents false triggers)
- Added Airtable `Created` field (auto-populated `Created time` type)
- End-to-end tested: new concept in Airtable → flip to APPROVED → appears on live site within 1 hour poll + 60s deploy

---

## v1.3 — 2026-04-23

- Integrated Beehiiv newsletter (free Launch tier) with publication "Listen. Learn. Live."
- Added Vercel serverless function at `/api/subscribe` to forward signups to Beehiiv API securely
- Stored Beehiiv API key and Publication ID as Vercel environment variables (Production + Preview)
- Replaced default Beehiiv iframe with native inline pill-bar form matching brand tokens
- Added newsletter section between hero and "How It Works" with headline, sub, form, trust line
- Wired up JavaScript form handler with loading / success / error states
- Configured welcome email automation in Beehiiv (triggers on "Signed up" OR "Email submitted")
- End-to-end tested: signup via site → subscriber in Beehiiv → welcome email delivered

---

## v1.2 — 2026-04-22

- Daily goal dots now reflect saved progress on page load.
- Added working localStorage persistence for mastered concepts (survives tab close)
- Added date-aware localStorage for daily goal tracker (auto-resets at midnight)
- Wrapped storage in try/catch for safe private-browsing fallback
- Introduced versioned storage keys (`lll_mastered_v1`, `lll_daily_goal_v1`)
- Fixed stray `}` in concepts.json that was breaking the live site

---

## v1.1 — 2026-04-21

- Moved all 160 concepts from hardcoded HTML to `concepts.json`
- Site now fetches concepts dynamically from GitHub on page load
- Deployed to Vercel at listen-learn-live.vercel.app
- Added loading state and error state for failed JSON fetches

---

## v1.0 — 2026-04-20

- Initial MVP with 160 concepts across 7 categories
- Category filter (Finance, Psychology, Thinking, Power, Relationships, Language, Business)
- Source filter (Foundational, Modern Wisdom, Alex Hormozi, Dan Koe)
- Daily goal tracker (session-only, no persistence)
- Mastered toggle per concept (session-only, no persistence)
- Share button with Web Share API + clipboard fallback
- Dark editorial aesthetic: Playfair Display + DM Sans, custom accent tones
