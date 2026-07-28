# Lexi v2 — End-to-End Build Plan

**Version target:** v2.38  
**Status:** Spec — not yet built  
**Last updated:** 2026-07-28

---

## Decision log (answered before writing this)

| Question | Decision | Reason |
|---|---|---|
| Practice mode: overlay vs route | **Full-screen overlay** | Epistemic is a SPA with no router. An overlay feels like a "mode" you enter and exit, which matches the mental model. Zero routing complexity. |
| Lexi panel position (desktop) | **Left-side slide-in** | Spatially distinct from Spark/History (right). Left = personal/accumulative. Right = social/reactive. |
| Lexi panel on mobile | **Full-screen bottom sheet** | Left panel doesn't translate to mobile. Bottom sheet is the natural mobile equivalent of a side panel. |
| MASTERED words in practice | **Excluded by default, opt-in** | User explicitly requests review via "Review mastered" toggle. |
| Coaching layer | **Skip for now** | Add after practice mode proves retention value. |
| Voice input | **Web Speech API** | Native browser API, zero cost, works on Chrome Android + Safari iOS. Graceful degradation on unsupported browsers. |
| Feedback depth | **Rich 2–4 sentence analysis** | Parsed verdict (hit/almost/off) drives state update; full feedback text rendered below. |

---

## Mental model: three distinct modes

**Mode 1 — Discovery** (in episode drawer)  
You're scanning vocab words. You see a word you want. One tap saves it. The drawer stays in flow. No generation, no sentences, no layout shift. The word is gone from your hands — it lives in Lexi now.

**Mode 2 — Absorption** (in Lexi panel)  
Calm, unhurried. Your saved words grouped by episode. Expand any word to read the definition and two generated example sentences (API call happens here, lazily on first expand). No pressure, no timer.

**Mode 3 — Practice** (full-screen overlay)  
Intentional. You enter it on purpose. One word at a time. You write a sentence. Claude grades it in depth. You either nail it or learn something. Session ends with a summary.

These three modes never bleed into each other. That's the core architectural principle.

---

## Part 1 — Episode Drawer: Vocab Chip (Discovery mode)

### What changes

`buildVocabCell` is stripped down to its essential job: let the user bookmark a word with zero friction.

**Removed entirely from the chip:**
- `.lex-sentence-wrap` / `.lex-sentence-wrap-inner` (sentence accordion)
- Any API call on tap
- Save button, use button
- Skeleton loaders

**New tap behavior:**
- If UNSAVED → save to localStorage, trigger fly-up animation, badge on Lexi nav button increments, chip enters SAVED state
- If SAVED → unsave (toggle), badge decrements, chip returns to UNSAVED state
- No other states in the drawer

### Word chip visual states

| State | Shimmer | Word color | Badge |
|---|---|---|---|
| UNSAVED | ✓ active | var(--accent) | no change |
| SAVED | ✗ off | var(--accent), opacity 0.6 | +1 |

On SAVED: a thin checkmark (`✓`) appended after the word text in `DM Mono`, font-size 0.65rem, opacity 0.7. The shimmer `::after` pseudo-element gets `display:none` via `.lexicon-word--saved::after { display:none }`.

### Fly-up particle animation

When a word is saved:

1. Read the word span's `getBoundingClientRect()` — this is the particle's start position.
2. Read the Lexi nav button's `getBoundingClientRect()` — this is the target.
3. Create a `<span class="lexi-fly-particle">` appended to `document.body`, positioned `fixed` at the word's coordinates, text content = the word, styled identically to `.lexicon-word`.
4. On next frame: translate to the nav button's center + `scale(0.4)` + `opacity: 0`. Duration: 420ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
5. On transitionend: remove the particle element.
6. At 370ms (before particle arrives): badge number increments, nav button does a brief `scale(1.18)` pulse (120ms ease-out then back).

```css
@keyframes lexiBadgePulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.18); }
  100% { transform: scale(1); }
}
.lexi-fly-particle {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  font-family: 'Playfair Display', serif;
  color: var(--accent);
  font-size: 0.88rem;
  white-space: nowrap;
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
```

### Nav badge

```html
<a class="nav-link nav-lexicon-btn" onclick="openLexiPanel();playNavSFX()">
  <span class="nav-lexicon-emoji">Aa</span>Lexi
  <span class="nav-lexi-badge" id="navLexiBadge" style="display:none">0</span>
</a>
```

```css
.nav-lexi-badge {
  font-family: 'DM Mono', monospace;
  font-size: 0.55rem;
  background: var(--accent);
  color: var(--bg);
  border-radius: 999px;
  padding: 1px 5px;
  margin-left: 4px;
  vertical-align: middle;
  line-height: 1.6;
  min-width: 16px;
  text-align: center;
}
```

Badge updates via `_lexiUpdateBadge()` — reads `lll_lexicon_v1` length and sets textContent. Called on save, unsave, and panel open.

---

## Part 2 — Lexi Panel (Absorption mode)

### DOM structure

```html
<div id="lexiPanel" class="lexi-panel" aria-hidden="true">
  <div class="lexi-panel-backdrop" onclick="closeLexiPanel()"></div>
  <div class="lexi-panel-inner">
    
    <div class="lexi-panel-header">
      <div class="lexi-panel-title">✦ Lexi</div>
      <div class="lexi-panel-count" id="lexiPanelCount">12 words</div>
      <button class="lexi-panel-close" onclick="closeLexiPanel()">✕</button>
    </div>

    <div class="lexi-panel-actions">
      <button class="lexi-action-btn lexi-action-primary" id="lexiPracticeBtn" onclick="_lexiStartSession()">
        ▶ Practice <span id="lexiPracticeCount">5</span> words
      </button>
      <button class="lexi-action-btn lexi-action-ghost" id="lexiMasteredBtn" onclick="_lexiToggleMastered()" style="display:none">
        ○ Review mastered
      </button>
    </div>

    <div class="lexi-panel-list" id="lexiPanelList">
      <!-- Rendered by _lexiRenderPanel() -->
    </div>

  </div>
</div>
```

### CSS: position, open/close

**Desktop:**
```css
.lexi-panel {
  position: fixed;
  top: 0; left: 0;
  width: 360px;
  height: 100vh;
  z-index: 1200;
  display: flex;
  pointer-events: none;
}
.lexi-panel-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0);
  transition: background 300ms ease;
  pointer-events: none;
}
.lexi-panel-inner {
  position: relative;
  width: 360px;
  height: 100vh;
  background: var(--bg);
  border-right: 0.5px solid var(--border);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}
.lexi-panel.open {
  pointer-events: all;
}
.lexi-panel.open .lexi-panel-inner {
  transform: translateX(0);
}
.lexi-panel.open .lexi-panel-backdrop {
  background: rgba(0,0,0,0.3);
  pointer-events: all;
}
```

**Mobile (≤700px):**
```css
@media (max-width: 700px) {
  .lexi-panel-inner {
    width: 100vw;
    height: 100vh;
    transform: translateY(100%);
    border-right: none;
    border-top: 0.5px solid var(--border);
    border-radius: 14px 14px 0 0;
  }
  .lexi-panel.open .lexi-panel-inner {
    transform: translateY(0);
  }
  .lexi-panel-backdrop {
    position: fixed;
    inset: 0;
  }
}
```

### Panel header

```css
.lexi-panel-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 28px 24px 0;
}
.lexi-panel-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text);
}
.lexi-panel-count {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  flex: 1;
}
.lexi-panel-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px;
  transition: color 0.15s;
}
.lexi-panel-close:hover { color: var(--text); }
```

### Practice action button

```css
.lexi-panel-actions {
  padding: 20px 24px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.lexi-action-btn {
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-height: 36px;
}
.lexi-action-primary {
  background: var(--accent);
  color: var(--bg);
  border: 0.5px solid var(--accent);
}
.lexi-action-primary:hover { opacity: 0.85; }
.lexi-action-ghost {
  background: none;
  color: var(--text-muted);
  border: 0.5px solid var(--border);
}
.lexi-action-ghost:hover { color: var(--text); border-color: var(--text-muted); }
```

### Word list render

`_lexiRenderPanel()` reads `lll_lexicon_v1`, groups by `episodeTitle`, renders:

```
MODERN WISDOM · CHRIS WILLIAMSON                       [episode group label]

  ▸ liminal space                          · NEW ·    [word row, collapsed]
  ▸ epistemic humility                     · NEW ·

HUBERMAN LAB                                           [episode group label]

  ▾ neuroplasticity                   · PRACTICED ·   [word row, EXPANDED]
  
    The brain's ability to reorganize itself by forming
    new neural connections throughout life.
    
    "She used neuroplasticity to her advantage, treating
    every failure as a chance to rewire her approach."
    
    "The coach leveraged neuroplasticity principles, 
    repeating the drill until the motion felt automatic."
    
    [▶ Practice this word]                             [single-word practice entry]
    
  ▸ allostatic load                        · NEW ·
```

### Word row structure per entry

```html
<div class="lexi-word-row" data-word="..." data-state="new">
  <div class="lexi-word-row-top">
    <span class="lexi-chevron">▸</span>
    <span class="lexi-word-label">neuroplasticity</span>
    <span class="lexi-state-badge lexi-state-practiced">practiced</span>
    <button class="lexi-remove-x" aria-label="Remove">×</button>
  </div>
  <div class="lexi-word-body">         <!-- accordion: grid 0fr→1fr -->
    <div class="lexi-word-body-inner"> <!-- overflow:hidden -->
      <div class="lexi-word-def">...</div>
      <div class="lexi-word-sentences" id="lexiSents_{wordkey}">
        <!-- lazy: skeleton → sentences -->
      </div>
      <button class="lexi-practice-word-btn" onclick="_lexiStartSession('{word}')">
        ▶ Practice this word
      </button>
    </div>
  </div>
</div>
```

### State badges

```css
.lexi-state-badge {
  font-family: 'DM Mono', monospace;
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 999px;
  border: 0.5px solid;
}
.lexi-state-new     { color: var(--accent); border-color: rgba(232,213,163,0.35); }
.lexi-state-practiced { color: var(--text-muted); border-color: var(--border); }
.lexi-state-mastered  { color: var(--border); border-color: var(--border); opacity: 0.45; }
```

### Lazy sentence generation in panel

On first expand of a word row:
1. Check sessionStorage `lll_lexicon_session_<wordkey>` — show immediately if cached.
2. Check existing `entry.sentences` in localStorage — show immediately if present.
3. Otherwise: show 2 skeleton lines → API call `{ mode: 'lexicon', word, definition, context }` → render sentences → cache in sessionStorage.

### Remove a word

- Desktop: hover `.lexi-word-row-top` → `.lexi-remove-x` fades in (opacity 0→1, 150ms). Click → remove entry from localStorage, row fades out + collapses, badge decrements.
- Mobile: `.lexi-remove-x` always visible (opacity 0.4), at right side of row.

```css
.lexi-remove-x {
  background: none; border: none;
  color: var(--text-muted);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 6px;
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.15s;
}
.lexi-word-row-top:hover .lexi-remove-x { opacity: 0.6; }
.lexi-remove-x:hover { opacity: 1 !important; color: var(--red); }
@media (max-width: 700px) {
  .lexi-remove-x { opacity: 0.4; }
}
```

---

## Part 3 — Practice Overlay (Practice mode)

### DOM structure

```html
<div id="lexiPracticeOverlay" class="lexi-practice-overlay" aria-hidden="true">
  
  <div class="lexi-practice-header">
    <div class="lexi-practice-progress">
      <div class="lexi-practice-progress-bar" id="lexiProgressBar"></div>
    </div>
    <div class="lexi-practice-counter" id="lexiPracticeCounter">1 of 5</div>
    <button class="lexi-practice-end" onclick="_lexiEndSession()">✕ End</button>
  </div>

  <div class="lexi-practice-stage" id="lexiPracticeStage">
    <!-- Rendered per word by _lexiRenderCard() -->
  </div>

</div>
```

### Overlay CSS

```css
.lexi-practice-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  transition: opacity 250ms ease-out, transform 250ms ease-out;
}
.lexi-practice-overlay.open {
  opacity: 1;
  transform: scale(1);
  pointer-events: all;
}
.lexi-practice-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 28px 0;
  flex-shrink: 0;
}
.lexi-practice-progress {
  flex: 1;
  height: 2px;
  background: var(--border);
  border-radius: 1px;
  overflow: hidden;
}
.lexi-practice-progress-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 1px;
  width: 0%;
  transition: width 400ms ease;
}
.lexi-practice-counter {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  flex-shrink: 0;
}
.lexi-practice-end {
  background: none; border: none;
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-muted);
  cursor: pointer;
  letter-spacing: 0.06em;
  padding: 4px 8px;
  transition: color 0.15s;
}
.lexi-practice-end:hover { color: var(--text); }
.lexi-practice-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 28px 40px;
  overflow-y: auto;
}
```

### Per-word card: PROMPT state

```html
<div class="lexi-card lexi-card--prompt">
  
  <div class="lexi-card-word">epistemic humility</div>
  <div class="lexi-card-source">from Modern Wisdom</div>
  
  <button class="lexi-card-def-toggle" id="lexiDefToggle" onclick="_lexiToggleDef()">
    👁 See definition
  </button>
  <div class="lexi-card-def lexi-card-def--hidden" id="lexiCardDef">
    Acknowledging the limits of your own knowledge and remaining open to being wrong.
  </div>
  
  <div class="lexi-card-divider"></div>
  
  <label class="lexi-card-prompt-label">Write a sentence using this word</label>
  <div class="lexi-textarea-wrap">
    <textarea class="lexi-card-textarea" id="lexiTextarea" 
      placeholder="Type your sentence here…" rows="3" autocorrect="off"></textarea>
    <button class="lexi-mic-btn" id="lexiMicBtn" aria-label="Voice input" 
      onclick="_lexiToggleVoice()" style="display:none">🎤</button>
  </div>
  
  <div class="lexi-card-actions">
    <button class="lexi-submit-btn" onclick="_lexiSubmit()">Submit →</button>
    <button class="lexi-skip-btn" onclick="_lexiSkip()">Skip</button>
  </div>
  
</div>
```

### Per-word card: FEEDBACK state

```html
<div class="lexi-card lexi-card--feedback">
  
  <div class="lexi-card-word">epistemic humility</div>
  
  <div class="lexi-feedback-user-sentence">
    "I try to practice epistemic humility when reading the news."
  </div>
  
  <div class="lexi-feedback-verdict lexi-verdict--hit" id="lexiFeedbackVerdict">
    ✓ Hits the mark.
  </div>
  
  <div class="lexi-feedback-body" id="lexiFeedbackBody">
    <!-- Filled by API response -->
  </div>
  
  <button class="lexi-next-btn" onclick="_lexiNext()">Next →</button>
  
</div>
```

Verdict classes: `.lexi-verdict--hit` / `.lexi-verdict--almost` / `.lexi-verdict--off`

```css
.lexi-feedback-verdict {
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 20px 0 8px;
  opacity: 0;
  animation: lexiFadeIn 200ms ease forwards;
}
.lexi-verdict--hit   { color: #7aaf8a; }  /* var(--thinking) */
.lexi-verdict--almost { color: var(--accent); }
.lexi-verdict--off   { color: var(--red); }

.lexi-feedback-body {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--text-muted);
  opacity: 0;
  animation: lexiFadeIn 200ms 120ms ease forwards;
}
@keyframes lexiFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### Practice card CSS

```css
.lexi-card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.lexi-card-word {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1.1;
  margin-bottom: 6px;
}
.lexi-card-source {
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 20px;
}
.lexi-card-def-toggle {
  background: none; border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--text-muted);
  cursor: pointer;
  text-align: left;
  padding: 0;
  margin-bottom: 8px;
  transition: color 0.15s;
}
.lexi-card-def-toggle:hover { color: var(--text); }
.lexi-card-def {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 16px;
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
  transition: grid-template-rows 0.25s ease;
}
.lexi-card-def--hidden { grid-template-rows: 0fr; }
.lexi-card-def > span { overflow: hidden; }
.lexi-card-divider {
  width: 100%; height: 0.5px;
  background: var(--border);
  margin: 20px 0;
}
.lexi-card-prompt-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 12px;
  display: block;
}
.lexi-textarea-wrap { position: relative; }
.lexi-card-textarea {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 0.5px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 14px 44px 14px 14px;
  resize: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.lexi-card-textarea:focus {
  outline: none;
  border-color: rgba(232,213,163,0.4);
}
.lexi-mic-btn {
  position: absolute;
  right: 10px; bottom: 10px;
  background: none; border: none;
  font-size: 1rem;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.15s;
  padding: 4px;
}
.lexi-mic-btn:hover { opacity: 0.9; }
.lexi-mic-btn.recording {
  opacity: 1;
  animation: lexiMicPulse 1.2s ease-in-out infinite;
}
@keyframes lexiMicPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(212,113,90,0.4); border-radius: 50%; }
  50%      { box-shadow: 0 0 0 8px rgba(212,113,90,0); border-radius: 50%; }
}
.lexi-card-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
}
.lexi-submit-btn {
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.lexi-submit-btn:hover { opacity: 0.85; }
.lexi-submit-btn:disabled { opacity: 0.35; cursor: default; }
.lexi-skip-btn {
  background: none; border: none;
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s;
}
.lexi-skip-btn:hover { color: var(--text); }
.lexi-feedback-user-sentence {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-size: 1rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin-bottom: 4px;
}
.lexi-next-btn {
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: none;
  border: 0.5px solid var(--border);
  color: var(--text);
  border-radius: 999px;
  padding: 10px 22px;
  cursor: pointer;
  margin-top: 28px;
  transition: border-color 0.2s, color 0.2s;
}
.lexi-next-btn:hover { border-color: var(--accent); color: var(--accent); }
```

### Session end card

```html
<div class="lexi-card lexi-card--summary">
  <div class="lexi-summary-icon">✦</div>
  <div class="lexi-summary-title">Session complete.</div>
  <div class="lexi-summary-stats">
    <div class="lexi-summary-stat">
      <span class="lexi-summary-num" id="sumPracticed">0</span>
      <span class="lexi-summary-label">practiced</span>
    </div>
    <div class="lexi-summary-stat">
      <span class="lexi-summary-num lexi-num--green" id="sumHit">0</span>
      <span class="lexi-summary-label">hit the mark</span>
    </div>
    <div class="lexi-summary-stat">
      <span class="lexi-summary-num lexi-num--gold" id="sumMastered">0</span>
      <span class="lexi-summary-label">mastered</span>
    </div>
    <div class="lexi-summary-stat">
      <span class="lexi-summary-num" id="sumSkipped">0</span>
      <span class="lexi-summary-label">skipped</span>
    </div>
  </div>
  <div class="lexi-summary-actions">
    <button class="lexi-submit-btn" onclick="_lexiRestartSession()">▶ Practice again</button>
    <button class="lexi-skip-btn" onclick="_lexiEndSession()">← Back to Lexi</button>
  </div>
</div>
```

---

## Part 4 — API: `cs-generate.js` — new `lexi-practice` mode

### Request shape

```json
{
  "mode": "lexi-practice",
  "word": "epistemic humility",
  "definition": "Acknowledging the limits of your own knowledge...",
  "userSentence": "I try to practice epistemic humility when reading the news."
}
```

### System prompt

```
You are a precise, intelligent writing coach. A user is learning the word
"{{word}}" (defined as: "{{definition}}") and has written a sentence using it.

Your job: analyze their sentence with depth and specificity.

Rules:
- Begin with exactly one of these verdicts on its own line:
    ✓ Hits the mark.
    ⚑ Almost there.
    ✗ Off the mark.
- Then write 2–4 sentences of analysis:
  - If ✓: explain specifically WHY it works (word usage accuracy, sentence clarity,
    register, what makes it land). Don't just say "good job." Be specific.
    If anything could be even stronger, mention it briefly.
  - If ⚑: state what's slightly off (loose usage, unclear context, register mismatch,
    structural weakness). Give a concrete suggested rewrite in quotes.
  - If ✗: explain what's wrong with the word usage. Give a corrected example in quotes.
- Never use the word "great," "nice," or "good job." Be direct, intelligent,
  zero fluff.
- Do not explain the word — focus only on how they USED it in their sentence.
- Tone: like a smart editor, not a cheerleader.

Return valid JSON only:
{"verdict":"hit","feedback":"..."}
or
{"verdict":"almost","feedback":"..."}
or
{"verdict":"off","feedback":"..."}
```

### Model + token budget

```js
model: 'claude-haiku-4-5-20251001'
max_tokens: 220
```

### Branch in `cs-generate.js`

Add before the existing `mode === 'lexicon'` check:

```js
if (mode === 'lexi-practice') {
  const { word, definition, userSentence } = req.body;
  if (!word || !userSentence) return res.status(400).json({ error: 'missing fields' });
  
  const systemPrompt = `You are a precise, intelligent writing coach...`; // full prompt above
  
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 220,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Word: "${word}"\nDefinition: "${definition}"\nUser's sentence: "${userSentence}"` }]
  });
  
  let parsed;
  try {
    const raw = response.content[0].text.trim();
    parsed = JSON.parse(raw);
  } catch(e) {
    return res.status(502).json({ error: 'malformed response' });
  }
  
  if (!parsed.verdict || !parsed.feedback) return res.status(502).json({ error: 'malformed response' });
  return res.json(parsed);
}
```

---

## Part 5 — Voice Input (Web Speech API)

```js
var _lexiRecognizer = null;
var _lexiRecording  = false;

function _lexiToggleVoice() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  
  var textarea = document.getElementById('lexiTextarea');
  var micBtn   = document.getElementById('lexiMicBtn');
  
  if (_lexiRecording && _lexiRecognizer) {
    _lexiRecognizer.stop();
    return;
  }
  
  _lexiRecognizer = new SR();
  _lexiRecognizer.continuous     = false;
  _lexiRecognizer.interimResults = true;
  _lexiRecognizer.lang           = 'en-US';
  
  _lexiRecognizer.onstart = function() {
    _lexiRecording = true;
    if (micBtn) micBtn.classList.add('recording');
  };
  
  _lexiRecognizer.onresult = function(e) {
    var transcript = Array.from(e.results).map(function(r) {
      return r[0].transcript;
    }).join('');
    if (textarea) textarea.value = transcript;
  };
  
  _lexiRecognizer.onend = function() {
    _lexiRecording = false;
    if (micBtn) micBtn.classList.remove('recording');
    _lexiRecognizer = null;
  };
  
  _lexiRecognizer.onerror = function() {
    _lexiRecording = false;
    if (micBtn) micBtn.classList.remove('recording');
    _lexiRecognizer = null;
  };
  
  _lexiRecognizer.start();
}

// Show mic button only if supported
function _lexiInitVoice() {
  var micBtn = document.getElementById('lexiMicBtn');
  if (!micBtn) return;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) micBtn.style.display = 'block';
}
```

Call `_lexiInitVoice()` inside `_lexiRenderCard()` after DOM insertion.

---

## Part 6 — State Persistence

### localStorage schema update (v2)

Extend each entry in `lll_lexicon_v1` with practice fields:

```json
{
  "word": "epistemic humility",
  "definition": "...",
  "collectionId": 42,
  "episodeTitle": "Modern Wisdom",
  "sentences": [...],
  "savedAt": 1234567890,
  "practiceState": "new",
  "practiceCount": 0,
  "hitCount": 0,
  "lastPracticedAt": null
}
```

**`practiceState` values:** `"new"` | `"practiced"` | `"mastered"`

**Mastered rule:** `hitCount >= 2` on the third practice attempt → `practiceState = "mastered"`

**Migration:** on every `_lexiconLoadStore()` call, add `practiceState: 'new'` to any entry missing it (backwards compatible, one-time).

### Practice session state (in-memory only, not persisted)

```js
var _lexiSession = {
  queue:     [],   // array of entry objects, shuffled
  index:     0,    // current position
  results:   [],   // { word, verdict: 'hit'|'almost'|'off'|'skip' }
  singleWord: null // if entering from "Practice this word" button
};
```

---

## Part 7 — JavaScript: Full function list

### Panel functions
- `openLexiPanel()` — add `.open` to `#lexiPanel`, call `_lexiRenderPanel()`, `_lexiUpdateBadge()`
- `closeLexiPanel()` — remove `.open`
- `_lexiRenderPanel()` — read store, group by episode, render word rows
- `_lexiToggleWordRow(rowEl)` — expand/collapse accordion, trigger lazy sentence load
- `_lexiLoadSentences(wordEl, entry)` — lazy API call for sentences, render into `.lexi-word-sentences`
- `_lexiUpdateBadge()` — count unsaved (all entries) → update `#navLexiBadge`
- `_lexiToggleMastered()` — toggle "show mastered in practice" flag

### Chip functions (in `buildVocabCell`)
- `_lexiTapWord(wordText, defText, collectionId, rowEl)` — replaces old `_lexiconGenerate` as the tap handler; save/unsave toggle + fly animation
- `_lexiFlyParticle(fromEl)` — creates fly-up particle toward nav button
- `_lexiUpdateBadge()` — shared with panel

### Practice functions
- `_lexiStartSession(singleWord)` — build queue, open overlay, render first card
- `_lexiRenderCard()` — render PROMPT state for current word
- `_lexiToggleDef()` — show/hide definition in practice card
- `_lexiSubmit()` — validate textarea, call API, render FEEDBACK state
- `_lexiNext()` — advance index, update progress bar, render next card or summary
- `_lexiSkip()` — record skip, advance
- `_lexiEndSession()` — close overlay, open Lexi panel
- `_lexiRestartSession()` — rebuild queue, reset index
- `_lexiRenderSummary()` — count results, render summary card
- `_lexiSavePracticeResult(word, verdict)` — update `practiceState`, `practiceCount`, `hitCount`, `lastPracticedAt` in localStorage

### Voice
- `_lexiToggleVoice()` — start/stop SpeechRecognition
- `_lexiInitVoice()` — show mic button if supported

---

## Part 8 — Build sequence

Build in this order — each step is independently shippable:

1. **Drawer simplification** — strip generation from chip, tap = save + fly animation + badge. Remove sentence accordion from `buildVocabCell`. (Biggest visible change, safest to ship first.)

2. **Lexi panel DOM + CSS** — new `#lexiPanel` structure, open/close, desktop left + mobile bottom-sheet. Wire `openLexiPanel()` to existing nav button.

3. **Panel word list render** — `_lexiRenderPanel()`, grouping by episode, expand/collapse accordion, lazy sentence generation, state badges, remove ×.

4. **Practice state migration** — add `practiceState` to localStorage entries. Update `_lexiconLoadStore()` to migrate old entries. Update `_lexiRenderPanel()` to read state badges.

5. **Practice overlay DOM + CSS** — full-screen overlay structure. Open/close transitions.

6. **Practice session logic** — `_lexiStartSession`, `_lexiRenderCard`, `_lexiNext`, `_lexiSkip`, progress bar, summary card.

7. **`lexi-practice` API endpoint** — new branch in `cs-generate.js`. Test independently via curl before wiring to UI.

8. **Practice submit + feedback** — `_lexiSubmit()`, API call, verdict parse, feedback render with fade animations.

9. **Voice input** — `_lexiToggleVoice()`, mic button, recording pulse.

10. **State persistence** — `_lexiSavePracticeResult()`, mastered logic, badge updates.

11. **Animations polish** — fly particle, panel slide, feedback fade-in, badge pulse.

12. **Light mode + reduced motion** — all new surfaces.

13. **Docs update** — changelog, build-journal, architecture, design-tokens.

---

## Part 9 — Light mode overrides (key new surfaces)

```css
[data-theme="light"] .lexi-panel-inner {
  background: #faf8f3;
  border-right-color: rgba(0,0,0,0.1);
}
[data-theme="light"] .lexi-practice-overlay {
  background: #faf8f3;
}
[data-theme="light"] .lexi-card-textarea {
  background: rgba(0,0,0,0.03);
  border-color: rgba(0,0,0,0.12);
  color: #1a1a18;
}
[data-theme="light"] .lexi-state-new {
  color: rgba(184,134,11,0.9);
  border-color: rgba(184,134,11,0.3);
}
```

---

## Part 10 — Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .lexi-panel-inner,
  .lexi-practice-overlay,
  .lexi-fly-particle,
  .lexi-mic-btn,
  .lexi-feedback-verdict,
  .lexi-feedback-body { transition: none; animation: none; }
}
```

---

## Scope guards (do not build now)

- Coaching layer (post-practice "use in a meeting" extension)
- Spaced repetition scheduling (come back N days later)
- Swipe-to-remove gesture on mobile
- Export saved words as PDF/text
- Social share of mastered words
- `/lexi` route (full-page destination)

---

## Version note

This is v2.38. v2.37 was the UX cleanup pass (word-click, auto-save, collapsible panel). v2.38 is the full Lexi v2 rebuild based on the new architecture.
