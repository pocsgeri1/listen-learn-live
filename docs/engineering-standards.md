# Epistemic — Engineering Standards
# v1.0 — 2026-07-27
# What this file IS: checklists + rules not documented elsewhere + gotchas learned from real bugs.
# What this file is NOT: a copy of design-tokens.md, architecture.md, or quality-rules.md.
# Read alongside cowork-default-instructions.md on every BUILD session.
---

## Stack (hard constraints)

- Vanilla HTML/CSS/JS only. No frameworks. One file: `index.html` owns all CSS and JS.
- Fonts: Playfair Display · DM Sans · DM Mono only. No other typefaces, ever.
- Model in `cs-generate.js`: always `claude-sonnet-4-6`. Never revert to `claude-sonnet-4-5` (deprecated — causes 500 errors).
- Design tokens, component specs, typographic scale → `docs/design-tokens.md`. Check it before writing any CSS.
- Data schemas, localStorage keys, state machines → `docs/architecture.md`. Check it before touching data.

---

## Pre-build checklist (before touching any code)

1. **State anatomy** — enumerate all states, what triggers each transition, what DOM/data changes at each step.
2. **Dependency map** — which data structures are read/written; which other panels/functions are affected.
3. **Risk rating** — LOW / MEDIUM / HIGH. HIGH = write `session-plan.md` first, get approval before executing.
4. **Mobile layout** — design at 390px mentally before first line of CSS.
5. **Token check** — no new hex values; uses existing tokens from design-tokens.md.
6. **Pattern check** — does an existing component cover this? Only deviate if necessary and flag it.

---

## Pre-commit checklist

1. No hardcoded hex values in new CSS.
2. No curly quotes in JS blocks — `grep -c '\u2018\|\u2019\|\u201c\|\u201d' index.html` → 0.
3. Light-mode rule exists for every new surface (`html[data-theme="light"]`).
4. Mobile works at 390px (mental or DevTools check).
5. `@media (prefers-reduced-motion: reduce)` override added for every new animation.
6. `docs/architecture.md` updated if a new localStorage key was added.
7. `docs/design-tokens.md` updated if a new component pattern was introduced.

---

## Performance guardrails (learned from real regressions — treat as hard rules)

- **No `backdrop-filter: blur()`** on any container with child transitions — creates a compositor stacking context that forces every child hover to recomposite per frame.
- **No `background-attachment: fixed`** on large surfaces — forces full-page repaint on scroll.
- **No SVG filters (`feTurbulence`, `feGaussianBlur`) in `background-image`** — CPU-rendered. Use CSS gradients instead.
- **No `filter: brightness/saturate` on large lists** — compositor layer per element. Use `color-mix()` instead.
- **No broad `transition` cascade** on many DOM nodes — even `transition: background, color` on 18 selectors = hundreds of repaints on theme switch.
- **`display:none` → animate = two frames.** Set `display` in one `rAF`, add animation class in the next. Never combine.
- **Canvas loops:** throttle to 20fps max via `FRAME_INTERVAL = 1000/20` guard. Never create objects (`new Path2D()`, `createRadialGradient()`) inside the draw loop — pre-bake outside.
- **`will-change`:** apply on hover/before animation only. Never set permanently on static base rules.

---

## JS non-negotiables

- Null-check every `getElementById` / `querySelector` before use — assume DOM elements may not exist.
- No `innerHTML` with user-supplied strings — use `textContent` or build nodes programmatically.
- Debounce `resize` / `scroll` handlers (≥16ms).
- Any `setInterval` / `rAF` loop needs cleanup: `clearInterval` / `cancelAnimationFrame` on `beforeunload`.

---

## Non-obvious gotchas (caused real bugs)

**Two separate visibility systems in the Spark panel — they don't interact:**
- Inline `style.display` — set by picker/topic hide flow
- CSS classes `cs-hidden` / `cs-visible` — set by post-prompt reveal flow
- Any restore function must handle BOTH independently. CSS classes cannot override inline styles.
- Elements hidden by `_csPickerHideMain()`: `csConceptPill`, `csPromptBlock`, `csCoaching`, `csDivider`, `csFeedbackRow`, `csGenerateRow` — all 6 must be cleared on restore.

**Body scroll lock — use the correct pattern:**
- ✅ `_spLockBodyScroll()` / `_spUnlockBodyScroll()` — saves scrollY, pins body with `position:fixed; top:-scrollY`.
- ❌ `document.body.style.overflow = 'hidden'` — causes iOS Safari scroll-stuck bug when paired with inner `overflow-y:auto` elements.

**`display:none` → animate:**
- Set `display` (remove `display:none`) in one step. Add animation class in the next `requestAnimationFrame`. Never in the same synchronous block.

**Search dropdowns must be `position:fixed` + `getBoundingClientRect`** — not `position:absolute`. Parent containers use `overflow:hidden` which clips absolute dropdowns.

**Base `nav {}` rule applies to ALL `<nav>` elements** — `#mainNav` and `.mobile-tab-bar` are both `<nav>` tags. If `nav { top: 0; height: 52px; transform: translateZ(0) }` is in the base rule, those values apply to `.mobile-tab-bar` too. Always scope nav-specific rules to `#mainNav {}`. Never put `transform`, `top`, or `height` in the base `nav {}` block without explicit overrides on every other `<nav>` in the document.

**CSS `transform` on iOS breaks sibling `position:fixed` elements** — applying `transform: translateZ(0)` to a `position:fixed` element creates a new containing block that can disrupt `fixed` positioning of sibling elements on iOS Safari. Scope GPU compositing hints to the specific element ID (`#mainNav`), never to the element type (`nav`).

**Keyboard shortcuts — browser/extension conflicts** — `Cmd+Shift+L` is consumed by password managers (1Password, LastPass) before JS sees it. `Cmd+Shift+F` by browser find. Use `Cmd+Alt+<key>` (`metaKey + altKey`) for app shortcuts — not used by Chrome, macOS, or common extensions. Always add `capture: true` on the event listener so it fires even if a focused element called `stopPropagation`.

**CSS grid with expandable cards:** set `align-items: start` — default `stretch` inflates neighbour cells when a card expands.

---

## Mobile rules

- Design both desktop AND mobile simultaneously. No "fix mobile later."
- All touch targets: minimum 44×44px.
- Touch devices: `initDragScroll()` must bail immediately on `'ontouchstart' in window`. Use `touch-action: pan-y` on grids.
- Bottom 84px: always add `padding-bottom: env(safe-area-inset-bottom)` — iPhone home indicator.
- Card tilt (`rotate(-0.8deg)`): suppress via `@media (hover:none)` — breaks touch hit-testing.
- Theme tiles at ≤700px: `themeClick()` → open drawer directly, skip inline preview.

---

## Never do (condensed — full list in design-tokens.md)

- Gradients · drop shadows · `backdrop-filter` · pure `#000` / `#fff`
- New font or font weight without justification
- New localStorage key without documenting it in `docs/architecture.md`
- New drawer / modal / card pattern without checking if existing one covers it
- Run `git` commands from the Claude session (Claude edits files only)
- Cite a fixed concept count in docs or code — always use `max(id)` pattern
