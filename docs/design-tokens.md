# Design Tokens — Epistemic

**Last updated:** June 2026
**Purpose:** Every color, font, spacing value, and component pattern used in the product. Claude references this before writing any CSS to ensure visual consistency.

---

## Design philosophy

Dark, editorial, minimal. The aesthetic is a cross between Modern Wisdom's website and Dan Koe's newsletter. Premium, intentional, restrained. No gradients, no heavy shadows, no visual noise. Whitespace and typography do the heavy lifting.

**The guiding principle:** an ambitious adult should feel like this was designed for them — not for children, not for a fitness app, not for a casual game.

---

## Color System

### Core palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0d0d0d` | Main page background |
| `--surface` | `#141414` | Card backgrounds, elevated surfaces |
| `--surface2` | `#1c1c1c` | Secondary surfaces, hover states, pills |
| `--text` | `#f0ede8` | Primary text (warm off-white, not pure white) |
| `--muted` | `#6b6b6b` | Tertiary text, captions, timestamps |
| `--muted2` | `#9a9a9a` | Secondary text, descriptions |
| `--accent` | `#e8d5a3` | Gold accent — primary brand color |
| `--accent2` | `#c4a96b` | Darker gold for hover states |

### Light mode palette

Applied via `html[data-theme="light"]`. Activated by toggle; persisted to `localStorage` key `lll_theme`.

Updated v1.92 — warmer/darker values for a layered-paper feel.

| Token | Dark value | Light value |
|-------|-----------|-------------|
| `--bg` | `#0d0d0d` | `#f5f0e8` |
| `--surface` | `#141414` | `#eee8db` |
| `--surface2` | `#1c1c1c` | `#e4dccf` |
| `--border` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.08)` |
| `--border-hover` | `rgba(255,255,255,0.15)` | `rgba(0,0,0,0.18)` |
| `--text` | `#f0ede8` | `#1a1714` |
| `--muted` | `#6b6b6b` | `#7a7060` |
| `--muted2` | `#9a9a9a` | `#5a5040` |
| `--accent` | `#e8d5a3` | `#b8860b` |
| `--accent2` | `#c4a96b` | `#9a700a` |

Semantic colors (red, green, blue, purple, pink, teal) also darkened ~15% in light mode for contrast. Category colors unchanged — they hold on both themes.

Concept cards in light mode: `background: #f0e9da` (slightly warmer than `--surface`), `box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.05)` — cut-paper feel.

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `rgba(255,255,255,0.07)` | Default card border — almost invisible |
| `--border-hover` | `rgba(255,255,255,0.15)` | Border on hover or active state |

### Category colors

Each category has a dedicated accent color used in badges and the left-border stripe of expanded cards. 

15 total: All + 14 categories. Alphabetical with "All" first.

| Category       | Hex      | Notes                                           |
|---------------|----------|-------------------------------------------------|
| all            | #e8d5a3  | Site accent (warm cream)                        |
| business       | #e0a060  | Amber                                           |
| creativity     | #d4a574  | Warm ochre — softer than business amber         |
| finance        | #6b9fc4  | Steel blue                                      |
| health         | #8ab87a  | Muted leaf green — distinct from thinking green |
| identity       | #b89878  | Warm taupe — earthy, grounded                   |
| language       | #5abfaf  | Teal                                            |
| philosophy     | #9a8fb8  | Dusty violet — distinct from psychology lavender|
| power          | #d4715a  | Terracotta                                      |
| psychology     | #a08fd4  | Lavender                                        |
| relationships  | #c47a9f  | Rose                                            |
| science        | #6ab0c4  | Cool cyan — clinical/empirical                  |
| society        | #7090a8  | Slate blue-grey — institutional, civic          |
| tech-ai        | #b8a07a  | Bronze/sand — modern but not flashy             |
| thinking       | #7aaf8a  | Sage green                                      |

### CSS variable definitions
6 of the original colors are CSS custom properties on `:root`:
- `--blue` (finance), `--purple` (psychology), `--green` (thinking),
  `--red` (power), `--pink` (relationships), `--teal` (language)
- `--accent` (also used for "all")

The remaining 8 category colors (business, creativity, health, identity,
philosophy, science, society, tech-ai) live as inline hex codes in the
`CAT_COLOR` map in `index.html` and in the `.cat-card[data-cat="..."]`
CSS rules. (Note: `index.html` was formerly `spark.html` — promoted 2026-06-24.) If you find yourself referencing them in many places, promote
them to CSS variables.

### Layout token
- Category grid: `grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));`
- Was `minmax(140px, 1fr)` until 2026-04-26.

### Semantic colors

| Purpose | Hex | Usage |
|---------|-----|-------|
| Success/green | `#7aaf8a` | Mastered state, positive confirmations |
| Warning/amber | `#e0a060` | Caution, in-progress states |
| Error/red | `#d4715a` | Destructive actions, errors |
| Info/blue | `#6b9fc4` | Informational callouts |

---

## Typography

### Font families

| Token | Font | Load from |
|-------|------|-----------|
| `--font-serif` | `'Playfair Display', serif` | Google Fonts |
| `--font-sans` | `'DM Sans', sans-serif` | Google Fonts |
| `--font-mono` | `'DM Mono', monospace` | Google Fonts |

### Font weights available

- Playfair Display: 400 (regular), 700 (bold)
- DM Sans: 300 (light), 400 (regular), 500 (medium)
- DM Mono: 400 (regular), 500 (medium)

**Only use these weights. Do not add 600, 800, or 900.** Heavy weights look clumsy against the minimal aesthetic.

### Typographic scale

| Use case | Font | Size | Weight | Notes |
|----------|------|------|--------|-------|
| Hero headline | Serif | `clamp(2.8rem, 7vw, 5.5rem)` | 700 | Large editorial moment |
| Hero italic emphasis | Serif | same | 400 italic | Gold color |
| Section heading | Serif | `1.8rem` | 400 | Browse concepts header |
| Card term | Serif | `1.05rem` | 700 | Concept name on card |
| Body paragraph | Sans | `0.95rem` | 300 | Main explanatory text, line-height 1.7 |
| Card hook | Sans | `0.8rem` | 300 italic | Subtitle on card |
| Description text | Sans | `0.82rem` | 300 | Secondary body |
| Labels | Mono | `0.65rem` | 400 | All caps, letter-spacing 0.12em |
| Micro labels | Mono | `0.58rem` | 400 | All caps, letter-spacing 0.2em |
| Buttons | Sans | `0.72rem` | 500 | All caps, letter-spacing 0.08em |

### Typographic rules

- **Never use pure white (`#ffffff`).** Always use `--text` (#f0ede8) — the warm off-white is part of the brand.
- **Sentence case for most text.** Title Case feels dated.
- **ALL CAPS with letter-spacing** is used for small labels, buttons, and section dividers only.
- **Italic serif** is reserved for hero emphasis and card hooks — nowhere else.
- **No font-size below 11px.** Readability over density.

---

## Spacing System

Use consistent spacing values. Stick to this scale — don't introduce arbitrary pixel values.

| Token | Value | Use |
|-------|-------|-----|
| Micro | `4px` | Tight icon-to-text gaps |
| XS | `6px` | Badge internal padding |
| SM | `8px` | Card-to-card gaps in grids |
| MD | `12px` | Internal card spacing |
| LG | `16px` | Card padding, section internal spacing |
| XL | `24px` | Section-to-section gaps |
| 2XL | `40px` | Major section breaks |
| 3XL | `80px` | Hero-to-body, page-to-page breaks |

### Grid gutters

- Card grid: `10px` between cards
- Category filter grid: `8px`
- Daily dots: `6px`

### Container widths

- Hero content max-width: `900px`
- App section max-width: `1100px`
- Cards minmax: `repeat(auto-fill, minmax(300px, 1fr))`

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| Small | `6px` | Buttons, small interactive elements |
| Medium | `8px` | Form inputs, small cards |
| Large | `10px` | Concept cards, category cards |
| Pill | `999px` | Tags, filter buttons, progress bars |

**Never mix radius on a single component.** A card with rounded corners on top and square on bottom looks broken. Full border-radius only.

---

## Component Patterns

### Flip card pattern (`.nf-row .concept-card`)
- Parent needs explicit `height` in px — never `auto`. Current: 370px desktop, 360px mobile.
- `perspective` goes on the row container (`.nf-row`), not the card.
- Both faces use `position: absolute; inset: 0; backface-visibility: hidden`.
- Back face gets `transform: rotateY(180deg)` at rest; parent gets `transform: rotateY(180deg)` on `.open`.
- Scoped exclusively to `.nf-row .concept-card` — drawer cards use accordion pattern, scoped to `.ep-cat-column .concept-card`.

### Concept of the Day Modal

Overlay: fixed inset 0, rgba(13,13,13,0.85) — no backdrop-filter (0.85 alpha already fully obscures page content; blur is invisible work)
Card: var(--surface), 1px var(--border), border-radius 14px, max-width 640px
Card padding: 40px 44px 36px (desktop), 30px 24px 28px (mobile <600px)
Left accent stripe: 2px wide, full height, category color, opacity 0.7
Eyebrow: DM Mono 0.65rem, accent color, with pulsing dot (2s pulse)
Term: Playfair 700, clamp(2rem, 5vw, 2.8rem)
Hook: Playfair italic 400, 1.15rem, category accent color
Use it today block: rgba(232,213,163,0.04) bg, accent border at 12% opacity
Mark Internalized button: pill, var(--accent) bg
Mastered state: var(--green) bg
Try Another button: pill, transparent + var(--border)
Mobile: buttons stack vertically, padding reduced
Dismissal: localStorage key lll_cotd_dismissed_v1 (date stamped)

The category color is applied via the CSS custom property `--cotd-accent`,
which is set inline on `#cotdCard` by JS. If unset, falls back to
`var(--accent)`.

---

### Newsletter Form (Inline Pill Bar)

```
Container: flex row, gap 8px, max-width 460px, centered
Input: pill radius 999px, bg var(--bg), border 1px var(--border), padding 14px 22px
Input focus: border-color var(--accent)
Button: pill radius 999px, bg var(--accent), color #0d0d0d, uppercase 0.8rem weight 500
Button hover: bg #f0e0b0, translateY(-1px)
Mobile < 600px: stacks vertically, gap 10px
States: loading (disabled, "Sending..."), success (message in accent color), error (message in #d4715a)
```

### Concept Card

```
Background: var(--surface)
Border: 1px solid var(--border)
Border-radius: 10px
Padding: 18px 18px 18px 22px
Hover: border-color var(--border-hover)
Left accent: 2px stripe in category color, opacity 0 → 1 on hover/open
```

### Category Card (filter button)

```
Background: var(--surface)
Border: 1px solid var(--border)
Border-radius: 10px
Padding: 16px 14px
Top accent: 2px stripe in category color, opacity 0 → 1 on hover/active
Text align: center
```

### Button (standard)

```
Padding: 8px 14px
Border: 1px solid var(--border)
Border-radius: 6px
Font: DM Sans, 0.72rem, weight 500
Letter-spacing: 0.06em
Text-transform: uppercase
Hover: border-color changes to category color or accent
```

### Button (primary CTA — hero)

```
Background: var(--accent)
Color: #0d0d0d
Padding: 14px 32px
Border-radius: 999px (pill)
Font: DM Sans, 0.85rem, weight 500
Letter-spacing: 0.08em
Text-transform: uppercase
Hover: background #f0e0b0, translateY(-1px)
```

### Input (search, form fields)

```
Background: var(--surface)
Border: 1px solid var(--border)
Border-radius: 8px
Padding: 8px 14px
Font: DM Sans, 0.82rem
Focus: outline none, border-color var(--border-primary)
Placeholder color: var(--muted)
```

```
### People pill (`.people-pill`)

Used on concept cards to attribute episode-based concepts to their
host/guests. Visually distinct from category pill — no color fill,
muted text, transparent background.

- Container: `.people-pills` — flex, wrap, 4px gap, 8px bottom margin
- Font: DM Mono, 0.6rem, uppercase, 0.08em letter-spacing
- Padding: 2px 8px
- Radius: 999px
- Border: 1px solid `var(--border)`
- Background: transparent
- Color: `var(--muted2)`
- Renders only when `concept.collection_id` resolves to a collection
  with `people.length >= 1`. Foundational-pack concepts (curated
  collections, no people array) show no pill row.

```

### Concept Map page (`map.html`)

Standalone page at `/map`. Deviates intentionally from one global rule (see below).

- **Background:** NOT the global noise overlay. Uses a faint radial gold glow:
  `radial-gradient(ellipse at 50% 45%, rgba(232,213,163,0.025) 0%, transparent 55%)`
  on `body::before`, flat black elsewhere. Rationale: the noise SVG tiles
  visibly at full-viewport scale. This is the only sanctioned exception to
  "noise is the only texture."
- **Category nodes:** 14px circle, 1.5px category-color stroke, halo at 8%
  opacity (18% on hover). Label DM Mono 6.5px, count DM Mono 6px below.
- **Concept nodes:** 4px circle. Mastered = filled (category color, 0 stroke).
  Unmastered = transparent fill, 1.2px category-color stroke. Hover grows to
  6.5px and reveals a DM Mono 7px term label.
- **Concept panel:** right-side drawer 380px wide, slides in
  `translateX(100%)` → `0` at `0.28s cubic-bezier(0.4,0,0.2,1)`. 3px top
  accent bar in category color. Reuses panel-term (Playfair 700 1.6rem),
  panel-hook (Playfair italic, category color), section labels (DM Mono
  0.58rem). Mobile: bottom sheet, 70vh, slides up.
- **Nav button (`.nav-map-btn`):** like `.nav-quiz-btn` but with
  `rgba(232,213,163,0.3)` border and `rgba(232,213,163,0.06)` bg. First
  item in nav island. `◈` glyph prefix.

### Tag / Badge

```
Padding: 2px 8px
Border-radius: 999px (pill)
Font: Mono, 0.6rem
Letter-spacing: 0.1em
Text-transform: uppercase
Background: category color at 10% opacity
Color: category color at full saturation
```

### Editorial Crosshair Cursor (`#epCursor`, added v2.3f)

```
Element: single <div id="epCursor"> injected by JS, positioned fixed z-index 99999
Crosshair arms: CSS ::before (horizontal, 28px wide × 1px) and ::after (vertical, 1px × 28px)
Color: var(--accent)
Opacity: 0.7 at rest, 1.0 on hover
Hover state (.ep-cursor-hover): arms grow to 44px; outer glow via size only (no shadow)
Click state (.ep-cursor-down): arms shrink to 14px
RAF loop: simple lerp factor 0.18 for trailing effect
Desktop only: hidden via @media (hover:none), (pointer:coarse)
Never replaces the native cursor — purely decorative overlay
```

### Founder / About Section (`.founder-section`, added v2.1c)

```
Layout: CSS grid, two columns: [montage width] + 1fr
Montage: .founder-photo-montage — position:relative container, all four pieces absolute inside
  Pieces: .fpm-main (portrait), .fpm-notes (landscape), .fpm-notes2 (landscape), .fpm-gym (portrait)
  Each piece: overflow:hidden, border 1.5px rgba(232,213,163,0.4), organic border-radius (no two pieces share the same shape), box-shadow, individual transform:rotate()
  Caption chips (.fpm-tag): position:absolute on the CONTAINER (not inside a piece) — sits outside the piece's overflow:hidden so text can't be clipped by the border-radius curve
  Hover: each piece has its own :hover rule, not a group hover on the container
  Click: openFpmLightbox(src, caption) → #fpmLightbox overlay

Mobile (≤700px):
  Montage hidden (display:none)
  .founder-mobile-notes (two system screenshots, inline in text flow between paragraphs)
  .founder-mobile-gym (gym photo at section end)
  overflow-x:hidden on .founder-section (fixed real layout overflow from the fixed-px montage)
```

### Scroll-Reveal System (`initScrollReveal`, added v2.2)

```
CSS: .reveal-init { opacity:0; transform:translateY(12px); transition: opacity 0.5s, transform 0.5s cubic-bezier(0.22,1,0.36,1) }
     .reveal-init.reveal-in { opacity:1; transform:translateY(0) }
     @media (prefers-reduced-motion:reduce) { .reveal-init { opacity:1; transform:none; transition:none } }
JS: IntersectionObserver, threshold 0.12, rootMargin '0px 0px -40px 0px'
    Stagger: Math.min(siblingIdx, 8) × 40ms applied as inline transition-delay
    Skip elements already armed (.reveal-armed class) — re-renders safe
Called by: buildGrid() for .concept-card, buildEpisodes() for .episode-card
```

### Dark-Mode Editorial Hairlines (`body::before`, added v2.1)

```
Position: fixed inset:0, pointer-events:none, z-index:0
Content: SVG with margin rules, corner ornaments, masthead label
Colors: rgba(232,213,163, 0.06–0.30) (gold at various opacities)
NOT included: the diagonal EPISTEMIC watermark (present in light-mode ::after but intentionally absent here)
Hidden at: @media (max-width: 768px) { body::before { display: none } }
```


### Progress Bar

```
Height: 3px
Background: var(--border)
Border-radius: 999px
Fill: var(--accent)
Transition: width 0.5s ease
```

---

## Motion & Animation

### Timing

- Micro-interactions (hover, active): `0.15s` — snappy
- Card expand/collapse: `0.2s`
- Progress bar fills: `0.5s ease`
- Card fade-in on grid render: `0.35s ease both` with `animation-delay` staggered per card

### Patterns

**Card entry animation:**
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
animation: fadeUp 0.35s ease both;
animation-delay: calc(var(--index) * 0.03s); /* max capped at 20 */
```

**Streak dot pulse:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
animation: pulse 2s infinite;
```

### Restrictions

- **No bouncy animations.** No spring physics, no overshoot. The aesthetic is refined, not playful.
- **No parallax scrolling.** Distracting and dated.
- **Scroll-reveal is allowed via `IntersectionObserver` + CSS transitions.** Use the established `.reveal-init` / `.reveal-in` pattern (`opacity 0 → 1`, `translateY(12px) → 0`, `0.5s cubic-bezier`). Apply with `initScrollReveal(selector, container)`. Do NOT use scroll-triggered animations for anything more complex than this (no parallax, no multi-property transforms). Reduced-motion safe — `@media (prefers-reduced-motion: reduce)` sets `opacity:1; transform:none; transition:none` on `.reveal-init`.

---

## Performance constraints

These are not aesthetic rules but performance ceilings learned from v1.36 retina lag cleanup. Treat them as guardrails when adding new surfaces.

### Backdrop-filter

- **Do NOT use `backdrop-filter: blur()` on any interactive surface.** Removed from the fixed nav in v1.95 (nav bg is `rgba(245,240,232,0.97)` in light mode so the blur was invisible, but it created a stacking context forcing every child hover to recomposite per frame). No current usage in the product.
- Do NOT apply to modal overlays, drawer backdrops, or scrim layers.
- Cost on retina/5K is ~4× higher than 1080p. Do not reintroduce without explicit performance justification.

### `will-change`

- Apply only to elements about to animate within the next ~100ms (e.g. on `:hover`, on a transition trigger).
- Never declare statically in a base rule. `will-change: transform` permanently on `.some-card { ... }` forces a permanent GPU layer with memory + sync overhead.
- Acceptable static use: interaction targets like `.nav-link`, `.cat-card`, `.concept-card` where hover animation is imminent. Anything else, remove.

### Canvas animations

- **Always throttle `requestAnimationFrame` loops** to the minimum fps needed for the visual effect. Ambient/decorative animations rarely need more than 20fps. Use a `FRAME_INTERVAL = 1000/20` guard at the top of the draw function and skip if `time - lastDraw < FRAME_INTERVAL`.
- **Never create objects on the hot render path.** `createRadialGradient()`, `new Path2D()`, and similar constructor calls inside a `draw()` function called 60×/second generate 60 allocations per second and trigger GC pauses visible as jank. Pre-bake gradients and paths outside the loop.
- A canvas animation that triggers real page-wide slowness (not just "imperfect animation") almost always has one of these two root causes.

### Box-shadow

- Large blur radii (>32px) are expensive to paint, especially on hover/transform changes. Keep `box-shadow` blur ≤ 32px unless the shadow is the design's hero element.
- Hero card uses `0 12px 32px` (was 64px in v1.35; reduced for retina perf).

### CSS grid alignment gotcha

- CSS grid defaults to `align-items: stretch` — every cell in a row stretches to the tallest cell's height.
- When grid cells contain expandable content (like concept cards with toggleable backs), set `align-items: start` to prevent neighbor cells inflating.
- Used on `.ep-drawer-grid`. Apply this anywhere a grid contains items that grow on user interaction.

---

## Layout & Structure

### Page structure (top to bottom)

1. Fixed nav (padding: 1.25rem 2rem, border-bottom)
2. Hero section (full-width, two-column grid: left copy / 1px divider / right card, padding: 90px 0 0 0)
3. Divider (1px, var(--border))
4. How It Works (three-step grid)
5. Divider
6. App section (max-width 1100px) — Library (The *Library* header) + Episodes/Themes toggle + Browse section
7. Newsletter capture section
8. Founder / About section (`.founder-section`, below newsletter)
9. Footer (`.site-footer`, brand + tagline + links + copyright)
10. Daily goal bar (fixed to bottom)

### Responsive breakpoints

| Width | Behavior |
|-------|----------|
| > 900px | Full desktop layout, 3-column steps, multi-column card grid |
| 600–900px | Tablet — 2-column card grid, smaller hero |
| < 600px | Mobile — single column, stacked steps, full-width cards |

### Mobile-specific rules

- Daily goal bar wraps to multi-line on mobile (flex-wrap: wrap)
- App header stacks (flex-direction: column)
- Search bar becomes full-width
- Category grid still uses the desktop value `minmax(110px, 1fr)`. (Earlier docs
  mentioned a 130px mobile-specific override; this was never applied.
  The current 110px value works at mobile widths because it allows
  2–3 boxes per row on a phone, which is the intended layout.)

---

## Noise & Texture

### Dark mode
`body::before` SVG contains the editorial hairlines overlay: margin rules, corner ornaments ("VOL. I" issue stamp), gold hairlines. Hidden on mobile (≤768px). The top masthead label "IDEAS WORTH SAYING OUT LOUD" was removed in v2.4c — it duplicated the `.nav-eyebrow` text in the nav bar.

One subtle noise overlay on the page background creates depth and avoids flat-black harshness:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG fractal noise */
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
}
```

This is the **only** texture in dark mode. Cards stay flat. Backgrounds stay flat.

### Light mode (v1.92, updated v1.93 + v2.4c)
Light mode uses an editorial SVG overlay on `body::after`:

**Editorial SVG overlay (`body::after`):**
`position:fixed; inset:0; pointer-events:none; z-index:0` — a full-page decorative layer containing:
- Diagonal `EPISTEMIC` watermark (148px italic serif, rotated −28°, fill-opacity 0.045)
- Left margin rule at x=52 (stroke-opacity 0.18)
- Right hairline at x=1388, top rule at y=52, bottom at y=848 (stroke-opacity 0.07)
- Gold filled-circle crosshairs (r=3.5) at all 4 corners (opacity 0.13)
- "EPISTEMIC" logotype bottom-right (monospace, fill-opacity 0.28)

All elements use `#b8860b` (light mode `--accent`). `background-size: 100% 100%`.

**Removed elements (do not re-add):**
- ~~Paper grain `feTurbulence` noise on `body`~~ — removed v1.93. CPU SVG filter, visually imperceptible at 3.5% opacity, caused paint cost on every scroll tick.
- ~~`background-attachment: fixed` on `body::after`~~ — removed v1.93. `position:fixed` is already viewport-locked; `scroll` attachment forced full-page repaint on every scroll tick.
- ~~Masthead text "IDEAS WORTH SAYING OUT LOUD" top-left~~ — removed v2.4c. Duplicated the `.nav-eyebrow` text already visible in the nav bar.

**Important:** `z-index:0` not `z-index:-1` — `-1` goes behind `body` background-color and is invisible.

---

## What to NEVER do

- Gradients (especially purple-to-blue — the "AI slop" signature)
- Drop shadows or glows
- Emoji as decoration. Functional, single-character glyphs that signal
  meaning (e.g. `💬` next to a reflection prompt to flag "this is a
  question to think about") are acceptable. Decorative emoji strings,
  reaction emojis, or emojis in body copy are not.
- Rounded serif fonts (no Lora, Merriweather)
- Generic sans-serifs (Inter, Roboto, Arial)
- Skeuomorphic effects
- Pure black (`#000`) or pure white (`#fff`)
- More than 2 typefaces in a single screen
- More than 3 semantic colors in a single component
- Animations that exceed 600ms
- Undefined CSS tokens (e.g. `--text-muted`). Only use tokens defined in `:root`. Valid secondary text tokens: `--muted` (#6b6b6b) and `--muted2` (#9a9a9a).
- CSS `transition` on broad selector lists covering many DOM nodes (e.g. for theme switching). Variables propagate instantly — transitions on variable consumers cause catastrophic repaint cascades. Scope transitions to individual interactive elements only.

---

## When adding new design elements

Before adding any new visual element, ask:

1. Does it fit the editorial aesthetic?
2. Am I using existing tokens, or inventing new ones?
3. Does it work in all three responsive breakpoints?
4. Does it avoid every item in the "never do" list?

If all four pass — add it. Otherwise, revise.

---

## Design token updates

When these tokens change in the future, update this document before the code:

- New standalone page → document its background treatment and any sanctioned deviation from global rules
- New category color → add to category colors table
- New font weight → add to weights available (and justify why)
- New component pattern → add a full spec under Component Patterns
- New animation → document timing and purpose

**Stale design documentation is worse than none.** Keep it current.
