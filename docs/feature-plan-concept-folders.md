# Feature Plan: Concept Folders + Second Brain Canvas
# Status: APPROVED FOR BUILD — Phase 1 starts at v3.48
# Updated: 2026-08-11 (Eden canvas analysis + Vocab scope added)

---

## Eden.so Analysis — What We Steal, What We Skip

From studying the Eden screenshots:

**Eden's architecture (observed):**
- Infinite spatial canvas (free-form drag, pan, zoom)
- Cards of multiple types on one canvas: text drafts, social post previews, YouTube embeds, article summaries
- **Bold section labels** as visual group containers (black bg, white text — our equivalent = Folders)
- Dashed arrows connecting cards to show flow/relationship
- Left sidebar: navigation + workspace folders (Content, Inspiration, Templates, Knowledge Base…)
- Separate scheduling + publishing workflow (NOT relevant for us)

**What we steal:**
- Spatial free-form canvas as the main surface (not a constellation — a workspace)
- Section groups as drag-to-create visual containers (= our Folders rendered on canvas)
- Multiple item types on one canvas (concept card, vocab chip, free note)
- Manual connection arrows that the user draws
- Auto-suggest connections from `related_ids` (our edge over Eden — we have this data)
- Clean dark aesthetic, minimal chrome, bottom toolbar

**What we skip:**
- Social scheduling / publishing pipeline
- Thread writing / content creation workflow
- Briefs system
- Anything requiring a backend (we stay localStorage-first)

**Our edge over Eden:**
Eden is for content creators building output. Ours is for learners building understanding. Our `related_ids` graph is pre-computed — Eden has no equivalent. Our concept cards are pre-structured (term/hook/plain/analogy/prompt) — Eden uses free-form text blocks. We win on depth per item; Eden wins on output workflow. Different product.

---

## What Changes from the Original Plan

**Original plan:** Folder list in Home drawer → "View Map" button → auto-constellation canvas (background feature)

**Updated plan:** The canvas IS the main surface. Folders live there. The constellation is a "Smart Layout" mode within the canvas, not a separate overlay. The drawer's Folders tab becomes the entry point to the canvas, not a list view.

The key reframe: **a Folder = a Canvas**. Each folder has its own canvas workspace. The canvas renders that folder's concepts + vocab + notes spatially. You can switch between canvases (folders). Multiple canvases can be merged into one view ("All" canvas).

---

## Vocab in Folders — Yes, Now, Data Model Only

**Include vocab in the folder schema now.** Don't build the canvas vocab UI yet — but future-proof the data model so we don't have to migrate later.

**Why it makes semantic sense:** A concept is a named mental model. A vocab word is a named idea. Both are "things you understood and want to remember." On a canvas they're the same thing at different resolution — a vocab word is a micro-concept.

**Connection between them:** A concept's `term` field IS often a vocab word. `related_ids` between concepts could eventually link to vocab words. On the canvas, a vocab word renders as a smaller node; a concept renders as a full card. The user sees the density difference visually.

**Deferred for later session:** vocab card UI on canvas, vocab-concept linking, visual treatment differences. **This session:** just add `vocabWords[]` to the folder schema.

---

## Part 1 — Related Concept Chip: Fix the Broken Click (UNCHANGED)

**Option A — In-place swap (CHOSEN)**
Click a related chip → card content morphs in-place. Scroll position unchanged. Library open. Breadcrumb "← [Original Term]" appears.

```
State: card expanded, related chip clicked
  → fade out card body content (0.18s, opacity only)
  → swap in new concept data (same DOM elements)
  → fade in new content (0.18s)
  → breadcrumb: "← [Original Term]" (DM Mono, muted, small)
  → breadcrumb click: reverse swap (no API call)
```

Breadcrumb stack: max 3 levels. New function: `_libSwapRelatedConcept(fromId, toId)`.

---

## Part 2 — Folder Data Model (Updated for Vocab)

**localStorage key:** `lll_folders_v1`

**Schema (v2 — includes vocab):**
```json
[
  {
    "id": "f_1720000000000",
    "name": "Mindset & Productivity",
    "icon": "🧠",
    "color": "#7aaf8a",
    "conceptIds": [42, 117, 203, 398],
    "vocabWords": ["cybernetics", "leverage", "antifragility"],
    "noteIds": [],
    "canvasLayout": null,
    "createdAt": 1720000000000,
    "updatedAt": 1720000001000,
    "pinned": false
  }
]
```

**New fields vs original:**
- `color` — one of 8 preset hex swatches (matches category palette for familiarity). Assigned at creation.
- `vocabWords` — array of word strings (raw strings, not objects — lookup the full entry from `lll_lexicon_v1`)
- `noteIds` — reserved for free-text canvas notes; empty array for now
- `canvasLayout` — JSON blob of `{ [itemKey]: { x, y, pinned } }` positions. `null` = use auto-layout. Stored inline in the folder object (not a separate key) to keep folder data self-contained.

**`docs/architecture.md` entry (add after Phase 2 build):**
```
lll_folders_v1 — Array of user-created folder objects. Each: { id, name, icon, color,
  conceptIds[], vocabWords[], noteIds[], canvasLayout, createdAt, updatedAt, pinned }.
  vocabWords are raw strings cross-referenced against lll_lexicon_v1.
  canvasLayout is { [itemKey]: { x, y, pinned } } or null.
```

---

## Part 3 — Folders Tab in Home Drawer

**Remains as planned.** The Folders tab is the entry point, not the main experience. It shows a list of your canvases (folders), and clicking one opens the canvas for that folder.

Tab order: `Concepts · Folders · Episodes · Vocab · Practice`

**Folder list row:**
```
[Color dot] [Emoji] Folder Name       [N concepts · N words] →
            3 concept preview chips
```

**Folder row click → opens the Canvas overlay for that folder.**
(No more inline expansion in the drawer — that was the old plan. Now it goes to canvas.)

**"New folder ＋" button** → creation flow (name + emoji + color swatch picker, ~30s to set up).

**"All canvas →" shortcut at top** → opens a merged canvas with ALL saved concepts across all folders.

---

## Part 4 — The Canvas (Main Feature, Eden-Inspired)

### What It Is

A per-folder infinite spatial workspace. Each folder has its own canvas. Items (concept cards, vocab chips, free notes) live at free positions on a zoomable, pannable plane. You arrange them however makes sense to you. Epistemic pre-suggests connections based on `related_ids`; you can draw your own.

This is a **second brain for ideas you've collected from podcasts**, not a graph visualization of the full library. It's personal, curated, spatial.

### Canvas Item Types

**1. Concept Card** (from `conceptIds[]`)
```
┌─────────────────────────────┐
│  [Category pill]            │
│  Term                       │  ← Playfair bold
│  Hook (italic, muted)       │
│  [+ Note] [Open ↗] [✕]     │
└─────────────────────────────┘
```
Width: ~220px. Draggable. Click "Open ↗" → opens in Home drawer. Click "✕" → removes from canvas (not from folder).

**2. Vocab Chip** (from `vocabWords[]`)
```
╭──────────────────╮
│  cybernetics  ↗  │
╰──────────────────╯
```
Small pill. Hover → shows definition tooltip (from `lll_lexicon_v1`). Click ↗ → opens vocab detail. Click × → removes from canvas.

**3. Free Note** (from `noteIds[]` — Phase 5)
```
┌─────────────────────────────┐
│  [Your text here…]          │
│                             │  ← textarea, DM Sans
└─────────────────────────────┘
```
Yellow-tinted (like a sticky note but on-brand — use `rgba(232,213,163,0.08)` border). Phase 5 build, schema reserved now.

**4. Section Label** (Eden-style group headers)
```
█ MENTAL MODELS
```
Bold DM Mono uppercase text, faint background zone behind it. User drags cards into the labeled zone. This is a canvas-native alternative to the structured folder system — visual grouping within a folder. Phase 5.

### Canvas Layout

**Default (auto-layout):** On first open, items are laid out in a loose grid — concepts left-to-right in rows of 3, vocab chips clustered in a smaller area below or to the side. `related_ids` connections draw gold dashed lines between connected concept cards.

**After any drag:** position is pinned and saved to `canvasLayout` inside the folder object. Auto-layout only runs once (when `canvasLayout === null`).

**Zoom/pan:** CSS `transform: scale() translate()` on a single `.canvas-world` div — NOT a canvas element. This is the critical architectural decision (see below).

### CSS Transform Canvas vs `<canvas>` Element

**We use DOM + CSS transforms, NOT `<canvas>`.** Here's why this matters:

Eden uses DOM-based cards (screenshots show clearly: cards are HTML elements, not canvas-drawn). This approach:
- Gives us text selection, real inputs, accessibility for free
- Lets each card be an actual HTML element (reusing `.ep-cat-column` card CSS)
- Allows hover states, tooltips, focus rings via CSS — no manual hit detection
- Zoom is `transform: scale(zoom) translate(panX, panY)` on a `.canvas-world` container
- Pan is just updating `translate` values on mouse/touch drag

The trade-off: DOM-based canvas doesn't handle 10,000 nodes. We'll never have that. A user's folder will have 5–50 items max. DOM is fine.

**The constellation auto-visualization** (force-directed graph for the full library) stays as a separate feature and CAN use `<canvas>`. But the personal workspace canvas uses DOM + CSS.

### Connections (Edges)

**`related_ids` auto-edges:** On canvas open, compute which concept cards have shared `related_ids`. Draw SVG lines between them (absolute-positioned `<svg>` layer behind the cards, `pointer-events: none`). Lines are dashed, gold at 20% opacity. Toggled on/off via a toolbar button ("Show connections" toggle).

**Why SVG not canvas for edges:** SVG `<line>` elements update position on card drag via JS (update x1/y1/x2/y2 attributes). No redraw loop needed. `requestAnimationFrame` only during active drag — idle state = no rendering cost.

**User-drawn edges:** Phase 6. The auto-edges from `related_ids` are enough for MVP.

### Canvas Toolbar (Bottom, Eden-Inspired)

```
[+] [cursor ▾] [→ connect] [✦ auto-layout] [🔍 search] [export ↓] [⚙]
```

- **+** → add item: opens search (reuses FUSE) to pick concept or vocab word
- **cursor** → select/drag mode (default)
- **→ connect** → Phase 6 (draw manual arrows)
- **✦ auto-layout** → re-runs auto-layout (resets all positions, clears `canvasLayout`)
- **🔍 search** → search within this folder's items
- **export ↓** → download canvas as PNG (html2canvas or manual canvas draw — see below)
- **⚙** → folder settings (rename, color, delete)

### Export as PNG

DOM-based canvas can't use `canvas.toDataURL()` directly. Two options:

**Option A (recommended for Phase 4):** `html2canvas` library (CDN, ~80KB) — renders the `.canvas-world` div to a canvas, then `toDataURL()`. Quality is good for flat content (no blend modes / `backdrop-filter` — which we don't use anyway).

**Option B (Phase 6):** Custom renderer that re-draws each item to an offscreen `<canvas>` based on position data. More control, no library dependency, higher effort.

Start with Option A.

### Canvas Performance Rules

- `.canvas-world` uses `will-change: transform` ONLY during active pan/zoom gesture, removed on `pointerup`
- Card drag: `will-change: transform` on the dragged card only, not all cards
- SVG edge lines: update only during drag (`requestAnimationFrame` guard)
- No `backdrop-filter` on any canvas element
- Mobile: `touch-action: none` on `.canvas-world` during pan; restore on toolbar interaction

### Mobile Canvas

Mobile gets a simplified experience:
- Pan: one-finger drag (same as desktop)
- Zoom: pinch
- Tap card: expands to show full term/hook/plain (same as mobile concept preview modal `_spOpenMobilePreview`)
- Long-press card: context menu (remove from folder, open, add to another folder)
- "Add item" = FAB (floating action button, bottom-right, same + button)
- No drag-to-reposition on mobile (too fiddly with touch targets) — Phase 6

### Canvas Entry / Exit

**Entry:** Folder row tap in Folders tab → canvas slides in as full-screen overlay (same `position:fixed` pattern as episode drawer). URL: `#canvas-f_1720000000000`

**Exit:** Back arrow top-left OR swipe-down (same `_initDrawerSwipeClose` pattern).

**Deep link:** `location.hash === '#canvas-{folderId}'` on load → open that canvas immediately after page init.

---

## Part 5 — Add-to-Folder Surface (Unchanged from Original Plan)

Three entry points:
1. Expanded concept card → "＋ Folder" button
2. Saved concept tile → right-click / long-press → context menu
3. Related concept chip → hover "+" → add to most-recently-used folder

Folder picker popover: `position: fixed` + `getBoundingClientRect` (avoids `overflow-y: auto` clipping). Toggle checkmarks. "Create new folder…" at bottom.

For vocab: same pattern on the Vocab tab — each saved word gets a "＋ Folder" action.

---

## Part 6 — Constellation View (Demoted to Secondary Feature)

The auto-constellation (`<canvas>` force-directed graph of the full library) still gets built, but as a separate view — not the main canvas experience.

**Entry:** "Library Map" button in the Home drawer header (not in Folders tab — it's about the full library, not a folder).

**What it shows:** ALL saved concepts as nodes, `related_ids` as edges, folder membership as color clusters. Read-only — no drag, no edit. It's a visualization, not a workspace.

**Builds on `map.html`** (already exists). This is a smaller lift than Phase 4 (the personal canvas) because it's display-only.

---

## Part 7 — Sharing (Unchanged)

`epistemic.live/?import=BASE64` → folder + concept IDs encoded. Works cross-user because concept IDs are global. Import banner → preview → confirm. No login required.

Export PNG: uses the canvas export (html2canvas).

---

## Revised Phased Build Plan

### Phase 1 — Fix the Flow (v3.48, ~2h, LOW risk)
- [ ] `_libSwapRelatedConcept(fromId, toId)` — in-place card swap on related chip click
- [ ] Breadcrumb `← [Term]` back nav (max 3 deep)

### Phase 2 — Folder Data Model + Drawer Tab (v3.49, ~3h, LOW–MEDIUM risk)
- [ ] `lll_folders_v1` schema (WITH `vocabWords[]`, `color`, `canvasLayout` fields — even though canvas isn't built yet)
- [ ] CRUD helpers: `_folderCreate`, `_folderAddConcept`, `_folderAddVocab`, `_folderRemoveConcept`, `_folderDelete`
- [ ] "Folders" tab in Home drawer
- [ ] Folder list render (rows with emoji, color dot, name, counts, 3 preview chips)
- [ ] "New folder ＋" creation flow (name + emoji + color swatch)
- [ ] Clicking a folder row → placeholder "Canvas coming soon" panel (correct structure, no canvas yet)
- [ ] "All canvas →" entry stub (same placeholder)
- [ ] Update `docs/architecture.md`

### Phase 3 — Add-to-Folder Surface (v3.50, ~3h, MEDIUM risk)
- [ ] "＋ Folder" button on expanded concept cards
- [ ] "＋ Folder" action on saved vocab words (Vocab tab)
- [ ] Folder picker popover (`position:fixed`, toggle checkmarks)
- [ ] Long-press / right-click context menu on saved tiles
- [ ] Mobile bottom drawer variant

### Phase 4 — Canvas Core (v3.51–3.53, ~10h, HIGH risk — write session-plan.md first)
- [ ] `.canvas-world` container with CSS transform zoom/pan
- [ ] Concept card items (reuse `.ep-cat-column` card CSS)
- [ ] Vocab chip items (small pill with hover tooltip)
- [ ] Auto-layout on first open (grid, respects `canvasLayout === null`)
- [ ] Drag-to-reposition (desktop) + position persistence to `canvasLayout`
- [ ] SVG edge layer for `related_ids` connections (togglable)
- [ ] Canvas toolbar (add, cursor, auto-layout, export, settings)
- [ ] Full-screen overlay entry/exit + URL hash deep link
- [ ] Mobile: pan/pinch zoom + tap-to-preview
- [ ] html2canvas PNG export
- [ ] "All canvas" merged view (all saved concepts across all folders)

### Phase 5 — Free Notes + Section Labels (v3.54, ~4h, MEDIUM risk)
- [ ] Free-text note items on canvas (textarea, `noteIds[]` in folder schema)
- [ ] Section label items (Eden-style bold group headers with background zone)
- [ ] `noteIds[]` persistence in `lll_folders_v1`

### Phase 6 — Constellation View (v3.55, ~5h, HIGH risk)
- [ ] Full-library `<canvas>` force-directed graph (builds on `map.html`)
- [ ] "Library Map" button in Home drawer header
- [ ] Read-only: hover tooltip, click to open, folder color clusters

### Phase 7 — Sharing (v3.56, ~2h, LOW risk)
- [ ] "Share ↗" → base64 URL generation
- [ ] `?import=` detection on load → import banner
- [ ] URL strip after import

---

## What Could Go Wrong (Updated)

**CSS transform canvas on iOS Safari.** `transform: scale() translate()` on a large `.canvas-world` div can cause paint thrashing on older iPhones if the world div has any elements with `position:fixed` children. Solution: nothing inside `.canvas-world` should be `position:fixed`. All fixed elements (toolbar, back button) are siblings of `.canvas-world`, not children.

**SVG edges don't update during card drag on mobile.**
On mobile we're not supporting card drag yet (Phase 6). But if we do: update SVG line coordinates in the `pointermove` handler, throttled to `requestAnimationFrame`.

**html2canvas and custom fonts (Playfair Display).**
html2canvas doesn't always render Google Fonts correctly if they haven't been fully loaded at capture time. Workaround: `document.fonts.ready` promise before triggering capture. Test this early.

**`canvasLayout` grows unbounded.**
If user constantly drags items, `canvasLayout` accumulates entries for concepts no longer in the folder. Prune on save: `Object.keys(layout).filter(key => validItemKeys.includes(key))`.

**Folder tab breaks `_HOME_TABS`.**
Add `'folders'` to `_HOME_TABS` array. Add `'folders' → _libRenderFolders()` to `_libRender`. Add `libPanel-folders` and `libTab-folders` element IDs. Don't forget.

---

## Design Decisions Locked In (Updated)

- **Canvas = DOM + CSS transforms.** Not `<canvas>`. Enables real HTML cards, hover states, accessibility.
- **Constellation = `<canvas>`.** Different feature, different renderer, different use case.
- **A Folder = A Canvas.** Not a list. The list in the Folders tab is just the index.
- **Vocab in data model now, UI later.** `vocabWords[]` in schema from Phase 2. Canvas treatment deferred.
- **No free notes until Phase 5.** Premature complexity.
- **No user-drawn connections until Phase 6.** `related_ids` auto-edges are enough.
- **No server sync.** localStorage throughout. Cloud sync = Pro tier, Phase 8+.

---

## Commit Checklist for Phase 1 (v3.48)

1. `git pull origin main` via bash before touching anything
2. Read `index.html` around the related chip click handler before any edit
3. Grep: `_libSwapRelatedConcept`, `relatedChip`, `.related-chip` — confirm no existing impl
4. Edit only — no full file rewrites
5. After build: update `docs/changelog.md` top entry `v3.48`
6. **[ACTION]** `cd ~/Documents/GitHub/listen-learn-live && ./ep-commit.sh "v3.48 — fix related chip in-place swap + breadcrumb back nav"`
7. **[ACTION]** Push origin in GitHub Desktop

---

*Plan v2 — updated 2026-08-11 after Eden.so analysis + vocab scope decision.*
*Next version: v3.48.*
