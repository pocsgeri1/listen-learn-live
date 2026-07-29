# Session Plan — v2.47 + v2.48
# Created: 2026-07-29
# Delete this file after both commits land.
---

## Goal
Surface vocab category pills + episode Profile tab in the drawer. Fix mobile nav. Move hero/episodes section up on mobile.

## States
- IDLE → drawer closed, bottom tab bar visible, nav stable
- DRAWER OPEN → intel pills visible, vocab sheet or Profile sheet may be open
- SHEET OPEN → bottom sheet slides up (mobile), body scroll locked
- FILTERED → vocab grid showing only words matching selected category pill
- ERROR → enrichment data missing → Profile pill shows data-empty, degrades gracefully

## Dependencies
- Reads: `episode_meta.json` (via `episodeMeta` / `metaFile.episodes`) — difficulty_level, tone, core_claim, episode_type, actionability_score, evergreen, controversy_flag, key_quotes already populated by generate-episode-enrichment.js
- Writes: no new localStorage keys
- DOM affected: `#mainNav`, `#mobileTabBar`, `.ep-intel-pill` row (inside episode drawer JS), vocab sheet content, hero section

## Phases

### v2.47 — Drawer changes

**Phase 1 — Vocab category pills [MEDIUM]**
- Add a scrollable pill row inside the vocab sheet (mobile) and vocab popover (desktop)
- Pills: All + 9 categories (Small Talk, Dinner Party, Smartypants, Corporate, People Skills, Head Space, Lab Coat, Deep Cuts, Zeitgeist)
- JS: filter vocab array on pill click, re-render word grid
- Animation: 120ms opacity fade on grid swap (not a full re-render flash)
- Scroll: `overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none`
- Active pill: accent border + accent text. Inactive: ghost/muted.
- If a category has 0 words for this episode → pill is dimmed (opacity 0.35), not removed
- Category_alt: if a word has category_alt, it shows in BOTH its primary and alt category filter views

**Phase 2 — Profile tab [HIGH]**
- Desktop: 4th ep-intel-pill button labeled "Profile" → popover (same pattern as DNA/Line)
- Mobile: only 2 pills shown: "Vocab" + "Profile". DNA, Line, Tension all move INSIDE the Profile sheet.
- Profile sheet/popover content layout:
  ```
  CORE CLAIM (Playfair italic, 1 sentence)
  ──────────────────────────────────────
  [Interview]  [Practical]  [●●○ Medium]   ← type / tone / difficulty
  [⚡⚡⚡]     [🌿]          [!]            ← actionability / evergreen / controversy
  ──────────────────────────────────────
  DNA (category bars — mobile only)
  SHARPEST LINE (mobile only)
  TENSION (mobile only)
  KEY QUOTES (if populated)
  ```
- Difficulty dots: ● green (1), ●● orange (2), ●●● red (3). Font: DM Mono. No new hex values — use existing green/orange/red vars or inline color values matched to design tokens.
- Evergreen: 🌿 leaf when true, nothing when false
- Controversy: ⚠ when true, nothing when false
- Actionability: ⚡ segments (1/2/3 filled)
- All fields null-safe: if enrichment not run yet, popover shows a single line "Run generate-episode-enrichment.js to populate." Profile pill gets data-empty if ALL enrichment fields are null.
- Episode card micro-badges (difficulty dots): DEFERRED to v2.49 — too much risk to touch card HTML in same commit as drawer.

### v2.48 — Mobile nav + hero

**Phase 3 — Mobile nav [MEDIUM]**
- Remove `mobTabHome` (Episodes / ◉) from bottom tab bar → 3 remaining tabs (Lexi, Speak, Apply)
- Theme toggle: check why hidden on mobile, fix visibility (add it to nav-right without hiding it at ≤768px)
- Epistemic logo: check why invisible on mobile, ensure nav-logo shows "Epistemic." in accent color at all widths
- Add signup icon button to nav-right (mobile): icon ✦, links to #signup. DM Mono, same size as theme toggle. Placed between theme-toggle and hamburger.
- Touch targets: all nav-right buttons ≥ 44×44px

**Phase 4 — Hero scroll [LOW]**
- Reduce hero bottom padding on mobile so browse-toggle-wrap (Episodes / Themes) peeks ~80px into viewport bottom on 390px screen
- Test: at 390×844px, Episodes/Themes header should be visible without scrolling

## Rollback
- If Phase 2 breaks drawer: revert makePill calls to pre-session version (DNA/Line/Vocab only). Profile data stays in episode_meta.json, just not shown.
- If Phase 3 breaks nav: revert mobile nav-right CSS and tab bar HTML only.
- Each phase is a contained change — later phases don't depend on earlier ones.

## Commit plan
- v2.47: Phases 1 + 2 (drawer only)
- v2.48: Phases 3 + 4 (mobile nav + hero)
