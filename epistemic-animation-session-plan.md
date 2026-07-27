# Epistemic UI/Animation Session Plan
*Based on full codebase audit — index.html (~920KB), v2.15d*

---

## What's Already Good (Do Not Touch)

Before listing gaps, these patterns are solid and should be preserved:

- **Scroll reveal** — `.reveal-init` (opacity + translateY 12px, 0.5s, stagger 40ms/idx, max 8). Clean. `prefers-reduced-motion` handled.
- **Card flip mechanic** — `rotateY(180deg)`, `cubic-bezier(0.3,0.1,0.2,1)`, 0.4s. Smooth.
- **Episode drawer / sheets** — `translateY(100%)→0`, `cubic-bezier(0.32,0.72,0,1)`. Correct spring feel.
- **Vocab collapsibles** — `grid-template-rows: 0fr→1fr`. The right approach.
- **Session toast** — spring cubic (`0.34,1.56,0.64,1`), translateY entrance. Good.
- **`prefers-reduced-motion`** — checked in every JS animation function and most CSS blocks. Keep it.
- **Focus-visible** — gold `outline: 2px solid var(--accent)` globally. On-brand.
- **Nav shrink on scroll** — height 76→62px, 0.3s ease. Works.
- **Card hover lift** — `.concept-card:not(.open):hover .card-inner { transform: translateY(-4px) }`. Good pattern.

---

## Audit Findings — Gaps & Proposals

### Section 1 — Navigation

**Current state:**
- Nav links: `color 0.2s, background 0.2s` on hover. No translateY. No entrance.
- Active link: accent color only. No visual weight difference.
- Nav island (center pill): no entrance animation on page load.
- Quiz/Map/Signup buttons: color/border transitions. No lift.
- Nav shrinks on scroll (good), but the brand logo has no subtle animation.

**Gaps:**
- Nav has no entrance on first load — it just snaps in.
- Active nav link has very low contrast differentiation from hovered state.
- Nav buttons (Quiz, Map, Signup) have no `translateY(-1px)` hover lift.

**Proposals:**
1. **Nav fade-in on load** — `opacity: 0 → 1` over 300ms at page ready. Simple, subtle.
2. **Nav link hover lift** — add `transform: translateY(-1px)` to `.nav-link:hover`. 150ms ease.
3. **Signup CTA shimmer** — add `::after` shimmer sweep to `.nav-signup-btn` on hover (the gold button is the right target for shimmer).
4. **Active link bg pill** — add a solid `background: rgba(232,213,163,0.1)` to `.nav-link--active` to distinguish it from hover.

**Risk: Low** — nav is pure CSS additions, no JS logic touched.

---

### Section 2 — Hero / Landing

**Current state:**
- Entire hero appears via a single `opacity: 0.22s ease` preload guard removal. No per-element entrances.
- H1, subtitle, stats band, CTA button — all appear simultaneously.
- Hero card (right column) appears at the same time.
- Subtle radial glow (`rgba(232,213,163,0.05)`) in background — nearly invisible.
- Hero eyebrow line has no animation.

**Gaps:**
- No staggered entrance — everything pops in at once after the preload guard lifts.
- No visual hierarchy in what loads first (eyebrow → H1 → sub → stats → CTA).
- The hero CTA button has no shimmer or lift.
- Stats numbers are static — no count-up or entrance.

**Proposals:**
1. **Staggered fade-up cascade** on hero elements (eyebrow → H1 → sub → CTA → stats), using `finFadeUp` pattern: `opacity 0→1 + translateY(14px→0)`, 0.5s ease-out, staggered 80ms apart. Triggered after preload guard removes. Pure CSS classes added via JS on `DOMContentLoaded`.
2. **Hero card entrance** — slight `scale(0.97→1) + opacity(0→1)`, 0.5s, delayed 350ms (after text).
3. **CTA button shimmer** — `::after` shimmer sweep on hover for the primary hero CTA. Same pattern as reference library (translateX(-100%→220%) skewX(-15deg), 0.55s).
4. **CTA button hover lift** — `translateY(-1px)`, 150ms.

**Risk: Low-Medium** — Need to verify preload guard timing so stagger doesn't fight with it. Add hero entrances after `ep-preload` class removal.

---

### Section 3 — Episode Cards

**Current state:**
- `border-color 0.25s, transform 0.2s` transitions declared on `.episode-card`.
- `episode-card:hover` sets `border-color: var(--border-hover)`.
- Thumbnail image scales to 1.04 on hover.
- No `translateY` lift on the card itself.
- Scroll reveal is applied via `initScrollReveal('.episode-card', row)`. ✓

**Gaps:**
- The `transform: 0.2s` is declared but no `translateY` is set on hover — transition is wasted.
- No lift means cards don't signal interactivity clearly.

**Proposals:**
1. **Add `translateY(-2px)`** to `.episode-card:hover`. The transition is already declared.
2. **Replace `box-shadow` upgrade** on hover with `outline: 1px solid var(--border-hover)` change — or just leave the border-color change (already no repaint cost since it's `border-color`).

**Risk: Low** — Two-line CSS change.

---

### Section 4 — Concept Cards (Core Product)

**Current state:**
- Flip mechanic: solid (`rotateY(180deg)`, 0.4s).
- Hover lift on `card-inner`: `translateY(-4px)`. Good.
- Front face hover: `box-shadow` upgrade on hover (repaint cost — minor but present).
- Flip hint dot: `hintDotBreathe` keyframe (`scaleY(1→1.2)` + opacity) — already a breathe pattern.
- Card entrance: via `reveal-init` scroll reveal. ✓
- `.btn-icon:hover`: `scale(1.08)`. `:active`: `scale(0.94)`. Good micro-interaction.
- Master button save: no celebration micro-interaction.

**Gaps:**
- Front face hover uses `box-shadow` — replace with `outline` to eliminate the repaint.
- No "save" micro-interaction when starring a concept (toggleMaster). Should feel like a reward.
- Card entrance stagger uses `idx * 40ms` but is capped at 8 — fine for horizontal rows, but in Browse (column view) there can be many cards. The cap prevents over-delay.

**Proposals:**
1. **Replace card front hover `box-shadow` with `outline`** — `outline: 1px solid var(--border-hover)`. No repaint, same visual effect.
2. **Master button winPop** — on `toggleMaster` (save action only, not remove), briefly add a class that triggers `scale(0.82→1.03→1)`, 0.35s spring. Remove class after animation. Zero persistence cost.
3. **Keep card entrance stagger as-is** — it's already well-tuned.

**Risk: Low** — outline swap is CSS-only. winPop is a short JS animation on a single button.

---

### Section 5 — Search / Input Fields

**Current state:**
- `.sp-search-wrap` (hero search): `border-color 0.2s` on focus-within. No scale or glow.
- `.ep-search-inline` (episode search): `border-color 0.2s` on focus-within.
- No focus glow or scale.

**Gaps:**
- Focus state is minimal — border color change only. Could add a soft `outline` glow.

**Proposals:**
1. **Focus glow** — on `focus-within`, add `box-shadow: 0 0 0 2px rgba(232,213,163,0.12)` (already done on `.sp-search-wrap` in light mode — extend to dark mode too).
2. Transition: `box-shadow 0.2s ease` alongside existing border-color transition.

**Risk: Low** — pure CSS.

---

### Section 6 — Drawers / Panels

**Current state:**
- Episode drawer: `translateY(100%)→0`, `cubic-bezier(0.32,0.72,0,1)`, 0.32-0.35s. ✓
- Intel sheet: `translateY(100%)→0`, `cubic-bezier(0.4,0,0.2,1)`, good.
- Overlay backdrops: `opacity 0→1`. ✓
- Drawer category pill switching: `drawerCatFadeIn/Out` keyframes (`opacity + translateY(8px)`). ✓
- Vocab panel collapse: `grid-template-rows 0fr→1fr`. ✓
- Chevron rotation on collapsibles: need to verify — let me flag.

**Gaps:**
- Need to check if chevrons on vocab toggles rotate (the `ep-intel-vocab-toggle` button). If not, add `transform: rotate(0→180deg)`.
- Drawer close/dismiss direction: swipe down works, but the close button could have a brief `scale(0.94)` active press.

**Proposals:**
1. **Verify chevron rotation** on vocab panel toggle — add `transition: transform 180ms ease` + `rotate(180deg)` on open state if missing.
2. **Close button press** — `transform: scale(0.94)` on `:active` for `.ep-drawer-close`.

**Risk: Low** — CSS only.

---

### Section 7 — Modals / Overlays (Quiz)

**Current state:**
- Quiz overlay: `opacity 0→1` on `.quiz-backdrop`. Sheet slides up with `translateY`. 
- Quiz options hover: background color change only. No lift.
- Quiz submit/next/play-again buttons: `translateY(-1px)` on hover. ✓
- Wrong answer: `quiz-shake` animation (CSS keyframes). ✓
- Correct answer: border-color to green. No celebration beyond that.

**Gaps:**
- Quiz option hover has no lift — just background change. Options should feel pressable.
- Quiz interstitial (between rounds) has no entrance animation.
- Correct quiz option could have a brief `scale(1→1.02→1)` pop.

**Proposals:**
1. **Quiz option hover lift** — `translateY(-1px)` on `:hover:not(:disabled)`. Already has `transition` declared? Check.
2. **Correct option pop** — add a `@keyframes correctPop { 0%{transform:scale(1)} 40%{transform:scale(1.02)} 100%{transform:scale(1)} }` applied on `.quiz-option.correct`.
3. **Quiz sheet entrance** — verify it uses spring cubic (not just `ease`).

**Risk: Low** — CSS additions to existing quiz styles.

---

### Section 8 — Toast / Notifications

**Current state:**
- **Session toast** (`_showSessionToast`): `translateY(12px)→0`, spring cubic `(0.34,1.56,0.64,1)`. ✓ 
- **Undo toast** (conv panel): `translateY(60px)→0`, `ease`. Missing spring.

**Gaps:**
- Undo toast uses `ease` — should use spring cubic for consistency with session toast.
- Undo toast `translateY(60px)` travel is too far — feels slow. Should be `translateY(20px)`.

**Proposals:**
1. **Undo toast spring** — change `.conv-undo-toast` transition to `transform 0.28s cubic-bezier(0.34,1.4,0.64,1)`.
2. **Reduce travel** — `translateY(60px)→translateY(20px)` at rest.

**Risk: Low** — two CSS property changes.

---

### Section 9 — Streak Display

**Current state:**
- `.streak-display` shows count + label. No animation on the count.
- `.streak-label` is static text.

**Gaps:**
- No pulse or breathe on the streak when it's active/hot.
- The streak number doesn't animate when it increments.

**Proposals:**
1. **Streak pip breathe** — When streak count > 0, add a subtle `opacity 0.7→1→0.7` pulse on `#streakCount`, 2.5s infinite ease-in-out. Subtle, not distracting.
2. **Streak increment pop** — Brief `scale(1→1.15→1)` on `#streakCount` when it updates. JS: add class, remove after 400ms.

**Risk: Low** — CSS + tiny JS addition.

---

### Section 10 — Dark/Light Mode Transition

**Current state:**
- Theme toggle: `color 0.2s, border-color 0.2s, background 0.2s` on the button itself. ✓
- `body` has no color transition — theme switch is instant (jarring).
- The inline preload script correctly prevents FOUC by setting `data-theme` before paint.

**Gaps:**
- Theme toggle itself is smooth, but the page colors snap immediately on toggle — every surface, border, and text changes frame-perfect with no easing.

**Proposals:**
1. **Global theme transition** — Add to `body`:
   ```css
   body {
     transition: background-color 120ms ease-in-out, color 120ms ease-in-out;
   }
   ```
   And to `:root` or major surface selectors: `transition: background 120ms ease-in-out`.
2. **Caution**: Wrap in `@media (prefers-reduced-motion: no-preference)`. Also avoid transitioning `color` on too many elements — limit to `body`, `nav`, major surface containers.

**Risk: Medium** — Color transitions can cascade in unexpected ways. Test both directions (dark→light, light→dark) and verify no flash on initial page load (the preload script must still suppress this).

---

### Section 11 — Buttons (All Variants)

**Current state:**
- `.btn-icon` (card actions): `scale(1.08)` hover, `scale(0.94)` active. ✓
- `.quiz-submit-btn`, `.quiz-next-btn`, `.quiz-start-btn`: `translateY(-1px)` hover. ✓
- `.nav-signup-btn`: hover background change, no lift, no shimmer.
- `.vault-pill`, `.ep-drawer-listen`, etc.: color/border transitions. No lift.
- `hover-lift` class: `translateY(-2px)` — applied to some cards/panels.

**Gaps:**
- `.nav-signup-btn` (primary gold CTA in nav) has no shimmer or lift. It's the most visible button on the page.
- `.ep-drawer-listen` (Listen button in drawer) has no lift.
- Inconsistency: some buttons lift (`translateY(-1px)`), others don't.

**Proposals:**
1. **Nav signup shimmer** — `::after` pseudo-element shimmer sweep on hover. Only this one button (the primary CTA). Don't add to every button.
2. **`translateY(-1px)` standardization** — Add to `.vault-pill:hover`, `.ep-drawer-listen:hover` for consistency.
3. **Active press** — Add `transform: translateY(0) scale(0.97)` on `:active` to primary action buttons that currently only have hover states.

**Risk: Low** — CSS only.

---

### Section 12 — Success / Celebration Moments

**Current state:**
- Mastering a concept: `btn-icon.btn-master` gets `.mastered-active` class (border goes green, text goes green). No motion.
- `eggPop` keyframe exists (line 8114) — likely an easter egg. 
- No confetti, no sparkle, no winPop equivalent.

**Gaps:**
- The "save to vault" moment is the core reward action in Epistemic. It feels silent.

**Proposals:**
1. **Master button winPop** — `@keyframes masterPop { 0%{transform:scale(0.82)} 60%{transform:scale(1.1)} 100%{transform:scale(1)} }`, 0.35s `cubic-bezier(0.34,1.56,0.64,1)`. Applied on the button icon only. Fires on save, not on remove.
2. **No confetti** — Epistemic is a focused learning tool, not a game. winPop on the button is the right ceiling.

**Risk: Low** — Isolated keyframe + class-add/remove in existing `toggleMaster` function.

---

### Section 13 — Loading / Skeleton States

**Current state:**
- Episode section header: `@keyframes epEmptySpin` (spinner, `rotate(360deg)`, 1.1s linear infinite). ✓
- `ep-preload` guard handles initial paint. ✓
- No skeleton shimmer on cards.

**Gaps:**
- No skeleton loading state for concept cards while `buildGrid()` runs.
- The spinner exists but may be too rarely visible to warrant changes.

**Proposals:**
- Skip for now — skeleton states require more structural work and carry breaking risk. Not a priority for this session.

---

### Section 14 — Mobile-Specific

**Current state:**
- `@media (hover: none)` — scroll arrows hidden, scan tile hover disabled. ✓
- `@media (prefers-reduced-motion: reduce)` — reveal-init disabled. ✓
- Mobile nav dropdown: `display:none → flex` (no transition — just appears).
- Bottom sheets work correctly.
- Editorial hairlines hidden on mobile < 768px. ✓

**Gaps:**
- Mobile nav menu appears instantly with no transition. Could fade in.
- Touch targets for card action buttons (btn-icon) — should verify they're ≥44px.

**Proposals:**
1. **Mobile nav fade** — Add `opacity 0→1` + `translateY(-4px→0)`, 0.18s ease on `.nav-mobile-menu.open`. Low-risk, pure CSS.
2. **Touch target audit** — Check `.btn-icon` computed size (it's 32×32px, below 44px recommended). Consider adding `min-width/height: 44px` with visual size kept at 32px via padding adjustment.

**Risk: Low** — CSS only for nav. Touch target is a one-line padding change per element.

---

## Recommended Session Order

Run these in sequence, one at a time. Never combine two sections in a single code change.

| # | Section | Risk | Effort | Impact |
|---|---------|------|--------|--------|
| 1 | Concept card hover: outline swap | Low | 1 line | Medium |
| 2 | Episode card translateY(-2px) lift | Low | 1 line | Low |
| 3 | Undo toast spring cubic + reduced travel | Low | 2 lines | Low |
| 4 | Dark/light mode body transition | Medium | 3 lines | High |
| 5 | Hero staggered entrance cascade | Low-Med | ~20 lines | High |
| 6 | Nav signup shimmer (::after sweep) | Low | ~12 lines | Medium |
| 7 | Master button winPop micro-interaction | Low | ~10 lines | High |
| 8 | Nav link hover lift (translateY(-1px)) | Low | 1 line | Low |
| 9 | Quiz option hover lift | Low | 1 line | Low |
| 10 | Mobile nav menu fade-in | Low | 3 lines | Low |
| 11 | Streak pip breathe pulse | Low | ~8 lines | Medium |
| 12 | Chevron rotation audit + fix | Low | 2–4 lines | Low |
| 13 | Active press state standardization | Low | ~5 lines | Low |

**Skip for now:** Skeleton states (Section 13 above), confetti/sparkle (too game-y for Epistemic's character).

---

## Red Lines — Things to Never Do

- No `backdrop-filter` anywhere.
- No animating `box-shadow` on card hover → use `outline` instead.
- No entrance animations on body text paragraphs or labels.
- No continuous looping animations on concept content (only on UI chrome like streak pip).
- No changes to the flip mechanic, scroll-reveal logic, or drawer cubic-bezier curves — they're already good.
- Every CSS change must include `@media (prefers-reduced-motion: reduce)` fallback if it introduces motion.
- Never touch two sections simultaneously.
