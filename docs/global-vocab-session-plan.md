# Epistemic — Global Vocab Session Plan
# v1.0 — 2026-07-31
# Start a new Cowork session and paste this as context.
---

## Start command (paste this verbatim to open the session)

```
BEFORE YOU DO ANYTHING ELSE: read the following files in full, every single line.
- docs/cowork-default-instructions.md
- docs/engineering-standards.md
- docs/global-vocab-session-plan.md (this file — re-read it even if you think you know it)
- docs/vocab-categories.md (the 5 categories and their rules)

Session type: BUILD — Global Vocab feature in Lexi panel.
Model: claude-sonnet-4-6

Tell me which mode we are building (A or B), confirm the goal, list every file you will touch, and state your assumptions before writing a single line of code. Clean work only.
```

---

## What this is

Currently, 354+ vocabulary words exist but are only accessible per-episode inside episode drawers. Users can't browse or study words globally. This feature adds a "All Words" entry point inside the Lexi panel that shows the full vocabulary library, filterable by category.

**Two modes, two sessions:**
- **Session 1: Mode A** — Category Browse (practical, grid-based, immediately useful)
- **Session 2: Mode B** — Word Constellation (visual, dispersed, memorable)

---

## Data architecture

**Source:** `episode_meta.json` — already loaded into `EPISODE_META` at runtime. Each episode has a `vocab_vault` array of word objects.

**One-time aggregation function** (module-level, called lazily):
```javascript
function _buildGlobalVocabIndex() {
  // Walk all episodes in EPISODE_META
  // Collect all vocab_vault entries
  // Deduplicate by word string (case-insensitive, keep first occurrence)
  // Return sorted array: { word, definition, category, category_alt, colId }
  // Cache result in window._globalVocabCache
}
```

- Run once on first "All Words" open, cache result in `window._globalVocabCache`
- Re-run if `EPISODE_META` has reloaded (version check via array length)

---

## Entry point: Lexi panel button

Inside the Lexi panel, add an **"All Words"** button before the "Practice N words" button. Same visual language as the Practice button — same height, same font, slightly different treatment (outline vs filled, or muted vs accent).

Find the Practice button in JS (`_lexiBuildPracticeBtn` or wherever it renders) and insert the All Words button above it.

Clicking "All Words" → triggers `_openGlobalVocabView()`.

---

## Session 1 — Mode A: Category Browse

### What it looks like

A full-screen overlay (same z-index + backdrop pattern as the Practice mode overlay). Clean dark surface. Header row with title + close button. 5 category cards + "All" option.

**Step 1: Category selection screen**

```
┌─────────────────────────────────────────────────┐
│  All Words          354 total           ✕        │
│─────────────────────────────────────────────────│
│                                                  │
│  [ All · 354      ]  [ Small Talk · 82  ]        │
│  [ Smartypants·67 ]  [ Business · 71   ]         │
│  [ Science · 58   ]  [ Mind & People·76]         │
│                                                  │
│  Each card shows category name, count,           │
│  and 3 sample words as a preview                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

**Step 2: Word list screen (after selecting category)**

```
┌─────────────────────────────────────────────────┐
│  ← Smartypants          67 words         ✕       │
│─────────────────────────────────────────────────│
│  [All][Small Talk][Smartypants][Business]...     │
│  ─────────────────────────────────────────────  │
│  dialectic          definition text here...      │
│   + Add to Lexi                                  │
│  ─────────────────────────────────────────────  │
│  ontology           definition text here...      │
│   ✓ In Lexi                                      │
│  ...                                             │
└─────────────────────────────────────────────────┘
```

### State transitions (Mode A)

All animations use the same timing curve as the rest of the app: `cubic-bezier(0.32, 0.72, 0, 1)`.

1. **Lexi panel → "All Words" overlay open:**
   - Lexi panel fades out slightly (stays open underneath)
   - Overlay fades in + slides up from 20px below: `opacity 0→1, translateY(20px)→(0)`, 300ms

2. **Category card hover:**
   - Subtle scale: `transform: scale(1.02)`, border brightens to accent color, 180ms

3. **Category card click → word list:**
   - Category grid slides left + fades out: `translateX(-20px), opacity 0`, 200ms
   - Word list slides in from right: `translateX(20px)→(0), opacity 0→1`, 280ms, 120ms delay

4. **Category pill filter (within word list):**
   - Rows not in selected category: `opacity 0, translateY(-4px)`, 150ms stagger
   - Rows in selected category: `opacity 1, translateY(0)`, same stagger from 0

5. **Word list → back to category screen:**
   - Reverse of #3: word list slides right out, category grid slides in from left

6. **Add to Lexi click:**
   - Button changes: `+ Add to Lexi` → `✓ In Lexi`, accent colored
   - Same pop animation as existing `lexiFavPop` spring (reuse `@keyframes lexiFavPop`)

7. **Overlay close:**
   - Fade out + slide down 12px: `opacity 1→0, translateY(0)→(12px)`, 220ms

### HTML structure

```html
<div class="gv-overlay" id="gvOverlay" style="display:none">
  <div class="gv-panel">
    <div class="gv-header">
      <span class="gv-title">All Words</span>
      <span class="gv-count" id="gvCount"></span>
      <button class="gv-close" onclick="_closeGlobalVocabView()">✕</button>
    </div>
    <div class="gv-body" id="gvBody">
      <!-- JS renders either category grid or word list here -->
    </div>
  </div>
</div>
```

No new HTML files — append this to the bottom of `index.html` before closing `</body>`.

### CSS

- `.gv-overlay` — `position: fixed; inset: 0; z-index: 600; background: rgba(0,0,0,0.6)`
- `.gv-panel` — `position: absolute; top: 0; right: 0; width: 420px; height: 100%; background: var(--surface); display: flex; flex-direction: column`
- Mobile: `width: 100%`
- `.gv-cat-grid` — `display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 20px`
- `.gv-cat-card` — `border: 0.5px solid var(--border); border-radius: 8px; padding: 16px; cursor: pointer`
- `.gv-word-list` — `flex: 1; overflow-y: auto`
- `.gv-word-row` — `display: flex; flex-direction: column; padding: 12px 20px; border-bottom: 0.5px solid var(--border)`

### JS functions

```javascript
function _openGlobalVocabView()           // builds index, shows overlay, renders cat grid
function _closeGlobalVocabView()          // hides overlay with exit animation
function _gvRenderCatGrid(words)          // renders 6 category cards (All + 5 categories)
function _gvRenderWordList(words, cat)    // renders filtered word list for category
function _gvAnimateCatToList()            // handles cat grid → word list transition
function _gvAnimateListToCat()            // handles word list → cat grid transition
function _gvAddWordToLexi(word, def, cat, colId)  // adds word to Lexi, updates button state
```

---

## Session 2 — Mode B: Word Constellation

### Concept

A canvas-like full-screen view where all 354+ words appear as floating text in a roughly circular/dispersed arrangement. Each word is colored by its category. The layout is semi-random but stable (seeded by word ID). Hovering/tapping a word shows its definition in a floating card. A category filter at top dims non-selected categories.

### Layout algorithm

1. Assign each word a position using a seeded pseudo-random placement within an elliptical region centered in the panel
2. Font size: uniform at 0.75rem — clarity over hierarchy (too many words for size variation to be legible)
3. Words must not overlap — run a simple repulsion pass after initial placement, or use a fixed grid-jitter approach
4. On mobile: render a simplified 3-column staggered list instead (constellation is desktop-only)

### Interaction

- **Hover/tap word** → tooltip/card appears showing definition + category badge + "+ Add to Lexi" button
- **Category filter** → non-matching words dim to opacity 0.08 with 300ms transition; matching words stay at 0.9
- **"All"** filter → all words at opacity 0.9
- **Toggle between Mode A and Mode B** → a small `⊞ Grid / ◎ Map` toggle in the header row

### State transitions (Mode B)

1. **Mode A → Mode B toggle:**
   - Grid rows dissolve out (opacity 0) with per-word stagger, 15ms/word
   - Constellation words float in from center outward, opacity 0→0.9, radial stagger from center

2. **Mode B → Mode A toggle:** reverse

3. **Word hover:**
   - Word scales to 1.1, 150ms ease
   - Definition card appears with `opacity 0→1, scale(0.95)→(1)`, 180ms, spring curve

4. **Category filter select:**
   - Non-matching: `opacity 0.08`, 280ms
   - Matching: `opacity 0.9`, 280ms

### JS approach

- No `<canvas>` — use absolutely-positioned `<span>` elements inside a relative container
- Seeded random: use `word.id` as seed for deterministic placement
- Simple layout: calculate positions on first render, cache in `_gvConstellationLayout`

---

## Files to create/modify

| File | Change | Session |
|------|--------|---------|
| `index.html` | Add `.gv-overlay` HTML, CSS, JS | Both |

That's it — one file. No new pages, no new data files. All logic runs in the existing SPA.

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| 354 words in DOM is slow | LOW | DOM elements are lightweight spans/divs; no canvas needed |
| Word overlap in constellation | MEDIUM | Use grid-jitter (fixed cell + random offset within cell) instead of pure random |
| `episode_meta.json` not yet loaded when "All Words" clicked | LOW | `_loadEpisodeMeta()` returns a promise; show loading state then render |
| Duplicate words across episodes | MEDIUM | Deduplicate by normalized word string in `_buildGlobalVocabIndex()` |

---

## Key existing functions to understand before building

- `_loadEpisodeMeta()` — async, returns promise with `EPISODE_META`. Already cached after first load.
- `_lexiconGetSaved(word)` — checks if word is in Lexi (localStorage)
- `_lexiconSave(wordText, defText, category, colId)` — saves word to Lexi
- `_lexiUpdateBadge()` — refreshes Lexi badge count
- `openLexiPanel()` — the Lexi panel open function
- `LX_STORE_KEY` — localStorage key for Lexi data

Read these in `index.html` before writing anything.
