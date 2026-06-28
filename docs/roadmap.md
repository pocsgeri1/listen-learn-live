# Roadmap — Epistemic.

**Last updated:** June 2026
**Purpose:** Phased build plan so every decision and feature fits into the bigger picture. Claude references this to avoid building things that will conflict with future phases.

---

## Next up

- **Identity docs v1 fine-tuning** — `epistemic-identity-private.md` and `epistemic-identity-public.md` created (2026-06-28). Private: 1,500-word manifesto (taste as product philosophy, moat framing, belonging machine thesis). Public: ~400-word about/one-pager. Both v1 — need Gergely's corrections before finalising.
- **Founder section → expandable** — add "Read more ↓" arrow at bottom of founder section; expanded state reveals selected passages from identity docs + Moat framing. Design TBD.
- **"Is it worth my time?" feature + 5 transcript data ideas** — full spec session needed. Ideas in play: episode narrative summary (journalist tone, not bullet points), verdict block (listen if X / skip if Y), sharpest line, concept prerequisite map, episode DNA category bar, tension tracker, vocabulary vault. Explore more extreme / unexplored uses of transcript + episode data. Spec to include extraction prompt changes, data model (new field on episode object vs separate file), UI placement (episode drawer, behind button).
- **Corner pre-programmed scenarios** — quick-access pills below Corner search bar (pre-written situations → instant pre-programmed results, no API call). Content and mechanic to be designed separately.
- **Fluency Fingerprint (v2.9):** Pure localStorage. Track every Sparked/stashed concept. Derive: strongest category, blind spot, stash-vs-sparked ratio. Surface in Stash tab as 3–4 lines. Zero API cost.
- **Lightweight user ID system (v2.9):** UUID in localStorage → `lll_user_id`. Every Spark/stash action pings a lightweight endpoint that writes `{user_id, concept_id, action, ts}` to Airtable. Unlocks cross-device and Weekly Push email.
- **Weekly Concept Push (v3.0):** Brevo email via Make.com reading from Airtable. Personalised: concepts from stash not yet sparked + blind spot category pick.
- **Story Mode activation (v3.0+):** Panel B is built and hidden. Activate when an interactive mechanic (Practice Mode or Role-Play) is ready to make stories functional rather than passive reading.
- **RAG / knowledge-grounded responses (v3.0):** Embed all concept `plain` fields, store in Supabase pgvector, inject top-5 similar per API call. Prerequisite: library ≥1000 concepts.
- **OG image** — `/og-image.png` not yet in repo root. Add for `og:image` + `twitter:image` tags.
- **`duplicate_of` bug** — concepts with `duplicate_of` set are suppressed from library/search entirely. Correct behaviour: only affects drawer-level display. Separate session fix.
- **Collection 501 keep/cut decision** — 17 flagged for cut, 13 keep/rewrite. Deferred.
- **Plain rewrite — ~500 concepts not yet touched** against v2.2 rules.
- **Hook rewrite v2.0 — ~487 concepts remaining.**
- **Admin editorial picks tool** — `admin-picks.html` at `tools.epistemic.live`.
- **Legal pages review** — `privacy.html` and `terms.html` need professional review.
- **Extraction prompt v1.8** — approved but not yet executed in `extract-concepts.js` or `extract.html`.

## Recently completed

- v2.9 ✅ — 2026-06-28 — **index.html: Corner ding SFX, hero text restore, panel header layout.** `.gitignore` added. Cowork auto-commit workflow established.

- v2.6–v2.8f ✅ — 2026-06-27 — **index.html + cs-generate.js: Corner Mode, Story Mode (hidden), Sparring:**
  Panel B (Story Mode) built and hidden — code preserved, nav button + scenario pills `display:none`. Corner Mode: hero Explore/Corner toggle, two separate search bars (`spSearchWrap` Explore + `spCornerSearchWrap` Corner), Web Audio SFX (78Hz chord enter, 155Hz exit), 8 random taglines, constellation neural-network loading animation (hub + 3 rings, RAF canvas, no text overlap), Brief cards (all accordion, card 0 pre-expanded), 3 coaching blocks per card (Why/Frame/Watch out), fit score bars animate on open, auto-save to `lll_corner_saves_v1`, Situations history tab. Corner panel: `conv-panel-tab` design (identical to Spark), `🥊 Corner` + `🎪 Situations` tabs. Sparring: `⚡ Sparring` per card → `mode:'sparring'` API → anotherAngle/counterPerspective/oneLiner inline. cs-generate.js: `mode:'situation'` branch (Fuse pre-filter, wildcard concept, human-voice coaching) + `mode:'sparring'` branch. Headline animates as single block (no per-word stagger). Corner pill hover: vibration keyframe + 55Hz ping. Stray `-->` text node deleted. Spark Copy/New Concept buttons muted (no gold fill). Hero + section spacing improved. Two separate search inputs (no shared state — eliminates all placeholder bleed).

- v2.5–v2.5j ✅ — 2026-06-25 — **index.html + cs-generate.js: Spark panel rebuild, unified entry, coaching redesign:**
  Full scenario system killed. `openSparkPanel(id?)` single entry. Panel search bar (Fuse-powered, term-first ordering). Concept display: eyebrow + Playfair bold term, no expand pill. Desktop hover → side preview (fixed positioning bug: no scrollY offset). Casino roll "↺ New concept" with collapse animation. Typewriter fires only on fresh generate; smooth expand on restore (prompt 0.45s, coaching 500ms later). Coaching: block-by-block stagger animation, labels above border lines. Loading messages (10 rotating, fun). cs-generate.js: model `claude-sonnet-4-5` → `claude-sonnet-4-6` (root cause of all 500s). History: logs every concept viewed; layout fixed (term left, cat+date right). Stash: scenario tabs killed, universal prompt view, copy button. Tab animation: slide-down 0.45s. Stash hover-lift. Headlines: "Say something" normal + "epic." italic gold. Orphaned CSS block removed (was corrupting pitfall styling). See build-journal for 9 lessons.


  Full scenario system killed. `openSparkPanel(id?)` single entry. Panel search bar (Fuse-powered, term-first ordering). Concept display: eyebrow + Playfair bold term, no expand pill. Desktop hover → side preview (fixed positioning bug: no scrollY offset). Casino roll "↺ New concept" with collapse animation. Typewriter fires only on fresh generate; smooth expand on restore (prompt 0.45s, coaching 500ms later). Coaching: block-by-block stagger animation, labels above border lines. Loading messages (10 rotating, fun). cs-generate.js: model `claude-sonnet-4-5` → `claude-sonnet-4-6` (root cause of all 500s). History: logs every concept viewed; layout fixed (term left, cat+date right). Stash: scenario tabs killed, universal prompt view, copy button. Tab animation: slide-down 0.45s. Stash hover-lift. Headlines: "Say something" normal + "epic." italic gold. Orphaned CSS block removed (was corrupting pitfall styling). See build-journal for 9 lessons.

- v2.4–v2.4f ✅ — 2026-06-24 — **index.html: founder polish, view toggle, podcast pills, spark.html promotion:**

  Founder section scroll-reveal (`.founder-reveal` class + `initScrollReveal` post-render). Founder copy rewrite: new emphasis classes (`.founder-line-bold`, `.founder-italic-body`, `.founder-accent`), all three bold/italic lines now visually identical. Light-mode founder-label thicker border. Library view toggle: single `◫` replaced by `◫` / `⊞` pair in sort pills row (`spViewGrid`/`spViewScan`; `spSetScanMode()` drives both). Mobile hamburger double-divider fixed (`.nav-mobile-no-border` on two buttons). Mobile library `.nf-section-rule` hidden + spacing tightened. Editorial hairline top-label ("IDEAS WORTH SAYING OUT LOUD") removed from both SVG data URLs (was duplicating nav eyebrow). Podcast pills always-visible (all pills, episode rows still default to 3); "Show less podcasts ↑" button added. Founder images repositioned on desktop (+60px on main/notes2/gym + captions, container height +80px). **`spark.html` promoted to `index.html`**: old `index.html` archived as `index-legacy.html`; `vercel.json` updated with `/spark → /` 301 redirect; canonical + OG + Twitter meta tags added to `<head>`. See build-journal for 4 lessons.

- v2.1–v2.3i ✅ — 2026-06-21/23 — **spark.html UI overhaul + founder section + mobile fixes + podcast/library UX:**
  Browse toggle: final design is Playfair italic, 1.8rem, animated gold `::after` underline. `.app-title` bumped to 2rem to optically match. Dark-mode editorial hairlines added (`body::before` SVG, no EPISTEMIC word, hidden ≤768px). Brain canvas added, performance-fixed, then removed entirely. Scenario pill stuck-active bug properly fixed (both `closeCS` and `closeConversations`). Scroll-reveal added (`initScrollReveal()`, IntersectionObserver, staggered). Filter memory via localStorage (`lll_theme_filter`, `lll_podcast_filter`). Empty-state illustration system (`_emptyStateHTML()`). Global hero search extended to episodes and podcast hosts. Podcast pills show-more pattern (3 default, "Show all podcasts ↓" below rows, auto-expand on hidden-podcast select, smooth slide-in animation). Library scan-mode `.sc-tile` and drawer `.ep-drawer-scan-tile` both get desktop-only hover lift. iOS mobile crash fix (`setCat` → `renderCatOnly`, SFX in gesture frame). Custom editorial crosshair cursor (two thin gold hairlines, arms grow on hover). Founder/about section: 4-photo montage with individual hover, click-to-lightbox, caption chips outside the overflow:hidden frames. Mobile founder: separate responsive layout (`founder-mobile-notes` inline + `founder-mobile-gym` at section end, montage hidden). Footer simplified (category shortcuts removed). Legal pages (`privacy.html`, `terms.html`) as structural placeholders. See build-journal for 7 lessons from this session.

- v2.0b/v2.0c (plain field) ✅ — 2026-06-20/21 — **Plain field rewrite project: rule set correction, content cleanup, library trim, full pipeline sync:**
  Deleted 2 entire collections (513 UFO/disclosure, 514 geopolitics/war — 42 concepts, ids 425–466) for brand-fit reasons; library 636 → 594. Plain field rule set built (v2.0), live-tested, found to actively damage card quality (was deleting real podcast-specific content to hit an over-tight 200-char ceiling), corrected to v2.2 (350-char ceiling, specific-claims rule reversed for episode content, trim-weakest-sentence method replacing full-rewrite). 94 of 594 over-length plains trimmed using the corrected method. All 4 generation/regen surfaces synced to v2.2 — including `extract-concepts.js`, the live Automation 1 endpoint, which had never received any plain-field rules before this session. See build-journal for the full sequence of failures and corrections — genuinely load-bearing for any future editorial rule-set work.

- v2.0 (hooks) ✅ — 2026-06-19 — **Hook rewrite project, phase 1 (concepts.json):**
  Hook style guide locked (`hook-style-guide.md`) — Dan Koe lead voice, Hormozi/Naval/Perel/Sahil Bloom blend, 8–12 word target with 14-word ceiling, banned patterns (em-dashes, "you're not X you're Y", -ing openers, motivational cadence), no hook/plain overlap. 149 of 636 hooks reviewed across all 14 categories; 120 rewritten, 29 kept original. ~487 concepts remain. Process: worst-first scoring → 3-variation comparison → person picks → cumulative approval log → single batch write. **Mid-session save failure caught and fixed** — see build-journal for full root cause and process rule going forward.

- v1.99i–v1.99m ✅ — 2026-06-19 — **Mobile card flip/scan/search bug-fix session (spark.html):**
  Five sub-versions fixing mobile and desktop bugs surfaced after the v1.98–v1.99h UX overhaul. Mobile card flip restored (was a visual no-op under `@media (hover:none)`). "Ghost close" flip animation fixed for real — `.card-back` needed the same symmetric visibility-transition delay as `.card-front`, not just the front face. Scan-mode search fixed (tile re-injection was discarding the active filter). New full-screen mobile concept preview modal (term/hook/plain/analogy/prompt) replacing the desktop-only floating preview on small screens — wired into Library scan tiles, drawer scan tiles, and mobile search results. Desktop scan preview: fixed a stale-timeout re-open bug and a left/right column-awareness bug (left-column tiles now preview left, not over the right column). Search dropdown: fixed centering (JS-computed clamp + recenter, not competing CSS `max-width`) and added a mobile "waterfall" reveal animation. Scroll-lock rewritten for the new modal using the `position:fixed` + saved-scrollY pattern (iOS-safe). Light-mode contrast fix for prompt/CTA sections across all preview surfaces. Mobile: hero pill row regression caught and reverted same-session; theme tiles default to 3 (not 9) with faster entrance timing; podcast filter defaults to Modern Wisdom. See build-journal for the three "fixed in one path, not its sibling" misses this session.

- v1.98–v1.99h ✅ — 2026-06-17 — **Library UX overhaul, drawer 3-view, card frame bug blitz (spark.html):**
  Library sort redesigned: segmented `Latest | Picks | Mastered` control + standalone `◫` scan icon toggle. Mastered filter shows animated expand progress bar. Save (★) emoji button on all card backs; full emoji icon system (🔗 ★ 💬 🎧) unified across all templates. Drawer 3-view (⊟ flip / ◫ scan / ⊞ all) — sort-row in permanent `.ep-drawer-filter-row` HTML wrapper (survives `innerHTML` clears on re-open). All-cards view rebuilt from `CONCEPTS` data (not DOM clones), 280×370px, correct CSS. Scan scoped to active filter pool; `spSetSort` clears scan before rendering filtered grid. CS Stories tab: scroll fix, per-entry `×` delete, Copy + Share. Preview dismiss race resolved (synchronous listener removal). **Black GPU frame behind tilted cards eliminated** — root cause: `align-items:stretch` on `.nf-row` made card wrappers taller than 370px; GPU layer overflowed rounded card-front corners. **Glow border on some cards eliminated** — root cause: `.card-streak` `box-shadow` on wrapper element, not face. Sign Up removed from default nav. Search scoped to active filter pool.

- v1.96–v1.97c ✅ — 2026-06-15 — **Reading Mode, Story Seeds wired, typewriter, cs-generate upgrade (spark.html):**
  Scan mode (◫/⊞ toggle) collapses cards to term+hook tiles — 2-col grid, event delegation, preview on first click, CS on second. Story seeds 1–4 pre-written and wired (friend/dinner/date/work) — bypass API, fire typewriter directly. `_csTypewriter()` utility: handles `**bold**`, `[[LABEL:Term]]` inline pills, `\n\n` paragraphs. Typewriter on CS prompt text too (no more shimmer skeleton). cs-generate.js upgraded: full Perel+Koe voice guide in story prompt, scene hints per scenario, model → claude-sonnet-4-6. Nav eyebrow added. Progress bar hidden. Trending pill removed. Placeholder cycling → typewriter with jitter. Bold in story text → gold accent colour. Card-back `visibility:hidden` fixes dark frame bleed. Back button no longer triggers auto-generate. Stories/History tabs scroll independently.

- v1.93–v1.95 ✅ — 2026-06-15 — **Performance pass (spark.html):**
  Light-mode lag eliminated (`backdrop-filter` removed from nav, `feTurbulence`/`feGaussianBlur` SVG filters removed, `filter:brightness/saturate` replaced with `color-mix()`); `background-attachment:fixed` removed from `body::after`; `ep-preload` guard for smooth hero load on hard refresh; typewriter delay `680ms→200ms`; placeholder cycling replaced with CSS crossfade overlay; drawer `feGaussianBlur` hero bg replaced with CSS gradients; drawer `overflow:hidden` scoped to hero only; category switch made instant (single-`rAF` animation, no 160ms delay); drawer close SFX added.



- v1.89–v1.92b ✅ — 2026-06-14 — **UI/UX overhaul, mobile fixes, search upgrades, engagement mechanics, light-mode redesign (spark.html):**
  "Connects to →" chip in CS panel replacing Related concepts button;
  drawer hero parallax + swipe-down-to-close; drawer category slide animation;
  search prefix commands (`source:`, `saved:`, `story:`); mobile scenario pills
  (2 visible + expand); hamburger outside-tap close; category + theme filter pills
  horizontal scroll on mobile; sticky cat bar on mobile; search dropdown mobile compact;
  theme tile → drawer direct on mobile; mobile scroll freeze fixed (removed subtree
  MutationObserver, disabled drag scroll on touch, suppressed card tilt);
  typewriter on hero tagline (2hr cooldown); sub-tagline fade+zoom after typewriter;
  animated search placeholder cycling; session toast on 5th card flip;
  PICK badge 3-cycle breathe; streak glow from 3rd card seen in viewport;
  light-mode redesign (paper grain + editorial SVG watermark with diagonal
  EPISTEMIC, margin rules, corner ornaments, masthead text).

- v1.81–v1.88 ✅ — 2026-06-13 — **Theme browsing overhaul + drawer
  redesign + SFX pass (spark.html):** By Episode/By Theme toggle
  restyled as underline tabs; theme grid gets staggered stamp-in with
  layered SFX (8-pop pills, 3-pop grid); theme card preview-expand
  re-added (3 cards at Library size, vertical connector, deeper SFX,
  no row reflow via per-row grid containers); "Explore →" hover button
  on every theme card; episode + theme drawers redesigned with a hero
  zone (image/generative bg, enlarged title, italic subtitle, corner
  count badge, underline category tabs, 4-up 280x370 card grid
  matching Library size); episode drawers get generative per-episode
  hero backgrounds (`_setEpisodeHeroBg`, category-colored, seeded by
  id); fixed drawer hover lag, light-mode category-tab styling, Stories
  tab pill bugs, CS-panel-closes-on-popup-click bug; SFX
  rationalized/consolidated across drawer tabs and CS modal state
  changes; illustrated empty states, focus-visible outlines,
  hover-lift utility, pulsing hint dot, active-category dot. See
  changelog for full detail.
- v1.80 ✅ — 2026-06-12 — **Themes: pill row → 3×3 image grid +
  "By Episode / By Theme" toggle:** Themes section moved below
  Episodes, restructured from v1.79's pill row into a responsive 3×3
  `.theme-card` image grid with category filter pills and "Show all"
  overflow. 16 AI-generated images deployed to `/images/themes/`.
  Toggle defaults to Episodes; Themes grid renders lazily on first
  switch.
- v1.79 ✅ — 2026-06-12 — **Themes row (Collections feature) shipped +
  CS auto-fire disabled:** First version of the Collections/Themes
  row built per `collections-row-spec.md` — 16 thematic collections
  (101–116) as pill chips, 3-card flip preview, full drawer reusing
  episode drawer CSS. `collections.json` updated with 16 new entries
  (symbol/title/tagline/categories). CS modal no longer auto-opens or
  auto-generates on page load (cost control during testing). Fixed
  card term/hook centering across Library, episode drawer, and theme
  cards; fixed scenario-pills "More" layout shift; fixed Stories-tab
  term-preview popups not closing with the CS modal.


- v1.78 ✅ — 2026-06-12 — **Collection curation pass:** all 636 concepts in
  `concepts.json` now have `curated_collection_ids` assigned against the 16
  themed collections (101–116), via strict-matching AI pass (max 2 per
  concept, ~50% get zero). Two new reusable browser tools added to repo
  root: `curate-batch.html` (+`api/curate-batch.js`) for running curation
  batches (25 at a time, resumable), and `merge-collections.html` for
  dry-run/commit merging into `concepts.json` on GitHub. New spec docs:
  `collections-row-spec.md`, `feynman-rewrite-spec.md`.

- v1.77 ✅ — 2026-06-11 — **Stories tab + state machine overhaul (spark.html):** 4th panel tab `✦ Stories` renders `lll_cs_stories_v1` ring buffer with paragraph formatting, clickable concept term pills (trigger floating reveal popup), expand-on-click with opener block. Scenario pills now launch story mode directly (category-matched concept sets per scenario; `SP_CTX_MAP` maps to valid CS ctx keys; `openCS()` direct — no concurrent `_loadAI`). State machine fixed: "Back to starter" correctly exits to concept+prompt view, `_csPickerShowMain` restores `csActions`+`csRevealRow` with generate-button fallback, "Change topic" from story mode dismisses story panel first, `_csInjectCandidatesAndStory` hides actions/reveal row. Term popup: two-pass layout (measure then position) guarantees no overlap; hover elevation (`scale(1.02)`, `z-index:4010`) lets user lift overlapping card. `SP_CTX_MAP` wires scenario names to `CS_OPENERS` keys. Eyebrow reads "A SHORT STORY — at a dinner party" etc.
- v1.76f–v1.76k ✅ — 2026-06-10 — **Story Mode (Phase D):** `★ See how these connect` in Change Topic picker (appears after 3 candidates load) → AI story weaving those 3 concepts into one scene → inline gold `[[LABEL:Term]]` pills with hover tooltips (plain definition) → `Say this tonight →` opener block → `◈ Reveal the terms` floating popup cards (left of panel, staggered spring animation) → 5 rotating loading messages → `lll_cs_stories_v1` auto-save ring buffer (max 20). `cs-generate.js` new `mode: "story"` branch (scenario-aware, 150-word ceiling). Button placed outside `#csTopicPickerWrap` after parent `display:none` visibility bug resolved. Search dropdown closes on scroll. `node --check` now mandatory at end of every build session.
- v1.76a–v1.76e ✅ — 2026-06-10 — **spark.html** new page (Phases A→C3): hero zone (tagline + Fuse.js search + scenario pills), CS Panel migrated from full-viewport modal to right-sidebar, unified panel (Spark/Stash/History tabs in one right-sliding `conv-panel`), episode search fix, dropdown redesign (term-first, split-click preview card, pills right), scenario pill hover highlight, More button distinct, SFX tuning (8 pops/55ms/60ms; candidate stamp SFX), Surprise me loading fix, `?` bubble stacking context fix (teleport to body). Active dev file is now `spark.html`. `v172.html` / `index.html` unchanged.
- v1.75a–v1.75b ✅ — 2026-06-10 — CS modal bug fixes: SVG hairline endpoint corrected (lines arrive above buttons not through them), action row border-top divider, bubble pop SFX on Change Topic open, picker loading messages synced to per-scenario pool, coral badge session-scoped only, scenario button hover delay eliminated (btns-settled class), coaching restore fixed after Change Topic → back / Surprise me / Use this instead (root cause: inline display:none not cleared), SFX extended to ~0.85s
- v1.74d–v1.74j ✅ — 2026-06-08 — CS modal Change Topic flow, auto-save, SVG branches (v172.html): auto-save all prompts on generate (Save button retired), per-scenario ✕ remove in Stash, Change Topic picker (category pills → 3 candidate cards → full prompt+coaching in card), stamp animation for pills + cards, JS-measured SVG bezier branch for Change Scenario, badge bleed fix, coaching restore on picker close, History restore fix, Stash live-refresh on picker generate
- v1.74c ✅ — 2026-06-07 — Stash UX, CS↔Stash sync, cursor/scroll (v172.html): smart outside-click close, scroll passthrough, open-card keeps Stash open, per-scenario Stash button, CS modal loads all saved ctxs, Stash→sessionStorage write, reveal row centered, smoother panel slide
- v1.74b ✅ — 2026-06-07 — Stash inline generate refinements (v172.html): rotating loading messages per scenario, prompted tabs coral border, centered actions row, category pills wrap on desktop, cursor/drag/scroll reliability overhaul (initDragScroll rewrite)
- v1.74 ✅ — 2026-06-07 — CS modal polish + Stash inline scenario generate (v172.html): feedback row CSS fix, has-prompt coral, scenario section stays open, drawer SFX + one-open, all 4 Stash tabs visible, `_convGenerateCtx` inline API
- v1.73b ✅ — 2026-06-07 — CS modal wiring pass (v172.html): coaching collapse on generate, generate btn redesign, reveal row always visible, `_csRestoreOrLoad` unified restore for prev/next + history, save button state always accurate, aiData deep-merge, Browse→Chat buttons fixed, History restore fixed, More scenarios ＋ in tab row, teal has-prompt indicator, help bubble rightward, mobile epic in hamburger, source label copy, Stash label `♡ Stash`
- v1.73 ✅ — 2026-06-07 — CS modal initial fixes (v172.html): aiData deep-merge save, Stash always opens on Saved tab, scenario label instant update, smooth coaching transition, swipe guard, Prev/Next symbol larger, has-prompt scenario badges, feedback row CSS fix, source label copy, help text update
- v1.72c ✅ — 2026-06-06 — CS modal full overhaul (v172.html): auto-open + auto-generate on page load, zero-click UX, modal reordered, reveal pills (Change topic/scenario/Related), prev/next nav stack, ? help bubble, badge today-count, Stash tab bug fixed, cross-concept prompt contamination fixed
- v1.71 ✅ — 2026-06-05 — Clarity & minimalism pass (v170index.html): Spark/Browse/Stash nav, CS modal restructure, per-scenario generation, Stash date groups, streak/vault hidden, easter egg, hero copy, CS generate bug fixed
- v1.70 ✅ — 2026-06-05 — SFX off by default, nav badge counter, logo easter egg, hero copy rewrite, vault pill hidden (v170index.html test branch created)
- v1.69b ✅ — 2026-06-04 — Nav polish: dividers, Saved colour, emoji on hover, "Use this instead" on related concepts
- v1.69 ✅ — 2026-06-04 — Conversations overlay: storage infrastructure, Saved + History tabs, 💬 CHAT button on cards
- v1.68d ✅ — 2026-06-04 — CS: smooth expand SFX, loading messages, timestamp fix, episode meta redesign, drawer back button, drawer light mode fix
- v1.68c ✅ — 2026-06-04 — CS: concept pill, Playfair prompt font, Save All, coral nav, 2×2 mobile grid, "Try saying" labels
- v1.68b ✅ — 2026-06-04 — CSS layout fix (orphaned newsletter rule) + CS modal restructure
- v1.68 ✅ — 2026-06-04 — Conversation Starter modal: Claude API generation, category pills, swipe, coaching layer, accordion, feedback, nav entry
- v1.67 ✅ — 2026-06-04 — CS modal v1 + streak loss-aversion + Umami events (concept_opened, goal_completed, prompt_shared)
- v1.66b ✅ — 2026-06-03 — Critical bug fix: concepts loading broken by missing `const bar` in magnetic guard; card blip SFX repeat fixed; map riser timing fixed
- v1.66 ✅ — 2026-06-03 — Full SFX suite: nav/pill/start/theme/COTD/streak/vault-remove sounds; mobile magnetic removed (performance)
- v1.65 ✅ — 2026-06-03 — Mastery sync fix (int/string coercion); mobile nav reorder + dividers + highlight styles; pill + nav SFX
- v1.64b ✅ — 2026-06-02 — Map pill violet, card tint scoped to front face only
- v1.64 ✅ — 2026-06-02 — Category card tint, SFX reliability fix, podcast filter pills + gallery, dedup counters, map orbit/spacing, static signup glow, newsletter steps
- v1.63 ✅ — 2026-06-02 — (interim build, superseded by v1.64)
- v1.62 ✅ — 2026-06-02 - Daily category default, card whoosh SFX, light mode colour polish, Tally bg fix
- v1.61 ✅ — 2026-06-02 — Brevo welcome sequence — 2-email automation live; plain-text style, Founding Member framing, personal story email, deliverability mechanic
- v1.60 ✅ — 2026-06-01 — Founding Member survey — Tally embed replacing feedback popup; Google Sheets integration; modal width/height tuned
- v1.59a–d ✅ — 2026-06-01 — Founding Member newsletter redesign + nav overhaul
- v1.58 ✅ Retired Beehiiv and implemented Brevo for Newsletter + added embedded feedback form + server less feedback.js
- v1.57 ✅ Quiz end screen inline expand — "↓ More" accordion per concept row; plain + analogy + prompt on demand, zero fetch cost
- v1.56d ✅ Light/dark mode toggle SHIPPED (2026-05-31). Sun/moon pill in nav-right, `lll_theme` localStorage persistence, flash-prevention inline script, full warm-parchment light palette. INP fix: removed transition cascade that caused 860ms switch latency → now <80ms.
- v1.55a ✅ UX polish + critical bug fixes SHIPPED (2026-05-31). SyntaxError fix (quiz/vault/COTD all broken from duplicate `let`). Share card full content + COTD share button. Quiz fill-in-blank: Continue button + progressive Hint. One-card-open-at-a-time. Nav Map/Quiz separation + Quiz teal color. Mobile goal bar streak visibility fixed.
- v1.54 ✅ Umami analytics + 5 custom events SHIPPED (2026-05-19). Free Hobby tier, single script tag, `track()` helper, no logic change. Map feature now instrumented (open intent, page time, node clicks). Page views + D7 retention now measurable — unblocks every roadmap "watch the signals" gate. **Next: Phase 1 retention — quiz pool bug fix (deferred to post-2026-05-27 holiday), then streak revamp + COTD email.**
- v1.53 ✅ Episode drawer card redesign SHIPPED (2026-05-18). Accordion→flip→deck→single-col→final 3×3 grid (desktop) / vertical column (mobile). Action buttons moved to top of back face (drawer + Browse). Duplicate-header padding bug fixed. CSS-only, no JS logic change. **Next: Phase 1 retention — quiz mode + streak revamp (next session), then pause feature work for GTM strategy.**
- v1.52 ✅ Build C SHIPPED (2026-05-18). 70 evergreen concepts added in-chat (IDs 517–586), JSON-only, no deploy. All 14 categories now ≥18; underrepresentation problem closed. Build C workstream complete. **Next: Phase 1 retention mechanics — streak system, quiz pool bug fix, COTD email delivery (each its own session).**
- v1.51 ✅ Cross-episode duplicates SHIPPED (2026-05-18). `duplicate_of` marker in publish-batch; concept appears in its episode drawer instead of being dropped. Stat counter + progress bar de-duplicated and aligned. Build A/B of the dup+stats workstream complete. Model A/B (Opus) deferred indefinitely.
- v1.50 ✅ Backfill related_ids for all legacy concepts SHIPPED (v1.50, AI auto-suggest)
- v1.49 ✅ Concept Map v2 — relationship layer SHIPPED (2026-05-17). `related_ids` in schema, Claude generates links at extraction time, bidirectional index in map, panel shows episode pill + related concept pills, selection-only edges on map. Backfill tool for existing 422 concepts: pending (separate session).
- v1.48 ✅ Concept Map SHIPPED (2026-05-17). Standalone `/map` page, radial constellation, category-proximity model.
- v1.47 ✅ Card redesign (3D flip), vault in-place update, share card square format, episode search fix, shorts search bar in header, drawer pill padding, filter pill color fix (2026-05-17)
- v1.46 ✅ Shorts overhaul — episode-card format, people filter pills with magnetic effect, search bar consistency, `getYouTubeId` extended for `/shorts/` URLs, collections 506–512 added, orphaned concepts 413–424 fixed (2026-05-17)
- v1.45 ✅ Drawer category filter pills, mobile tab UX, hero counter animation (2026-05-13)
- v1.44 ✅ Episode drawer redesign — category columns, air-date datestamp, mix bar removed, clickable category pills (2026-05-12)
- v1.43 ✅ Editor's Pick shipped - **Editor's Pick flag** — gold-border + ★ PICK badge on standout concepts. Capture in extract.html / upload.html / Airtable; flows through Make.com batch publish into `editors_pick: boolean` on `concepts.json` (v1.43, 2026-05-12).
- v1.37 ✅ Rebrand to **Epistemic.** — domain `epistemic.live` live, social handles claimed, `index.html` updated, Beehiiv partial (automation activation paywalled, deferred) (2026-05-09)
- v1.36 ✅ Drawer leak fix + retina perf pass — body sections hidden under drawer, drawer 88vh→92vh, grid `align-items: start`, removed 8+ backdrop-filters and stale `will-change` declarations (2026-05-08)
- v1.33 ✅ Long-form transcript extractor — `extract.html`, browser-direct Claude pipeline, bypasses Airtable 100k cap (2026-05-06)
- v1.33 ✅ Open-ended source attribution — `extract-concepts.js` and `publish-concept.js` accept any 2–4 letter host code via `normalizeSource()` + Airtable `typecast: true` (2026-05-06)
- v1.33 ✅ 1Password-friendly localStorage for API keys in private browser tools (2026-05-06)
- v1.30 ✅ Hero redesign — two-column split layout, flippable showcase card, copy rewrite, file rename to index.html (2026-05-05)
- v1.29 ✅ Bulk concept upload tool v1 — `upload.html`, 3-variant extraction, flexible source/people (2026-05-04)
- v1.28 ✅ Fuzzy search (Fuse.js) + people search + Browse Episodes peer heading (2026-05-03)
- v1.24 ✅ Quiz mode (3-round game loop) — Hook Match, Fill Blank, Analogy Decode (2026-05-02)
- v1.23 ✅ Netflix UI Test Round 2 — comprehensive UI/UX overhaul on `index-netflix-test.html` (2026-05-01)
- v1.22 ✅ Episode drawer UI — Netflix-style bottom sheet, Test Round 1 (2026-04-30)
- v1.21 ✅ Reverse card order — newest concepts shown first (2026-04-30)
- v1.20 ✅ D1–D3 complete — first real episode through pipeline end-to-end (2026-04-29)
- v1.19 ✅ People pills on episode concept cards (2026-04-29)
- v1.18 ✅ Episode collections auto-create during extract (2026-04-29)
- v1.17 ✅ Group C complete — collection_id wired through publish path (2026-04-28)
- v1.16 ✅ Collection ID + People fields added to Airtable (2026-04-28)
- v1.12 ✅ Source filter UI removed from index.html (2026-04-28)
- v1.11 ✅ Dynamic concept + category counts in nav/hero/progress (2026-04-27)
- v1.10 ✅ Documentation cleanup pass (2026-04-27)

**Group A status: Complete** — all cleanup tasks shipped (A1, A2, A3, A4).
- A3 ✅ `collections.json` live on GitHub with 6 foundational packs (2026-04-26)
- A1 ✅ `collection_id: null` added to all 165 records in `concepts.json` (2026-04-26)
- B1 ✅ 14-category UI deployed in `index.html` (2026-04-26)
- A2 ✅ Re-categorisation mostly applied to live `concepts.json` (2026-04-26)
- B1.1 ✅ Category pill on concept cards (`card-cat` span) is live (2026-04-26)
- B2 ✅ Concept of the Day modal shipped (2026-04-26). Day-deterministic pick
  from the full library; dismissal persists per calendar day via localStorage
  key `lll_cotd_dismissed_v1`. "Use it today" reuses the `prompt` field;
  dedicated `useToday` schema field deferred to Phase 1.5.

Group D shipped end-to-end. Episode-based collections work on real input:
transcript in → collection created → PENDING concepts with Collection ID
pre-filled → APPROVED → published to live site with `collection_id` →
people pills render.

- [x] **D1 — Episode collections auto-create during extract** (v1.18, 2026-04-29)
- [x] **D2 — People pills on cards** (v1.19, 2026-04-29)
- [x] **D3 — End-to-end test with a real podcast** (v1.20, 2026-04-29)

---

### On the horizon / Next Build:

- **Phase E — Polish pass:** btns-settled pattern audit on all new staggered groups; full light mode QA on story panel (opener, eyebrow, reveal button); mobile QA pass (story mode on narrow viewports, term popup on mobile); INP check on concept grid interactions. Not gated on D7.
- **Remaining story UX (~80% there):** minor inconsistencies noted in 2026-06-11 session — start fresh session with screenshot + list.
- **spark.html → index.html promotion: DONE ✅ (v2.4f, 2026-06-24)** — spark.html renamed to index.html; old index.html archived as index-legacy.html; vercel.json redirect added; canonical/OG tags added.
- **Mobile tuning session:** Full spark.html review on mobile. Known: touch targets on scenario buttons, coaching block layout on small screens, Stash panel scroll on iOS, bubble pop SFX AudioContext unlock on iOS, term popups off-screen on mobile (desktop-only fix so far).
- **Trending IDs curation:** TRENDING_IDS array in spark.html is placeholder (6 IDs). Needs editorial curation before deploy.
- **Editor's Pick pass:** 103 picks out of 584 concepts. Run Python against concepts.json, grouped by category. Gergely reviews and selects more.
- **Phase C3 — Unified panel V2:** Add inline Spark button to Stash concept entries so user can go directly from Stash entry to Spark tab with that concept loaded. Scoped for later.
- **Phase 8 — Unified branch UI:** Extend the Change Scenario SVG branch pattern to Change Topic and Related Concepts — eliminates _csPickerHideMain/_csPickerShowMain entirely. Carry into separate session after mobile pass.
- **Scenario pill — curated concept sets:** Currently picks randomly from category pool. Next: curate specific concept IDs per scenario for higher-quality story output.
- **Scenario pill — CS mode option:** Currently goes straight to story. Consider a choice between conversation starter and short story after pill click. Needs UX design.
- **Daily digest mode:** One localStorage key for preferred ctx + COTD deterministic pick. Auto-open Spark to preferred context. Separate session.

### Deferred from v1.65–v1.66 session

- **Map ↔ index mastery sync** — `map.html` may still write string IDs; index coerces on read but cross-page sync not fully verified. Needs dedicated test + potential fix in `map.html`'s toggle write path.
- **Streak milestone SFX fires once on first post-goal card open** — fires correctly now (once per session) but ideally should only fire at the exact moment goal is achieved, not on the next card open when goal was already met yesterday. Low priority.
- **SFX audio file replacement** — replace all synthetic Web Audio SFX with chosen `.mp3` files from personal library. See instructions below.
- **Quiz voice SFX** — viral/recognisable reaction sounds for correct/wrong answers. Requires GitHub-hosted audio files. Discussed but deferred.

Upcoming / deferred - v1.61 + v1.64

- `#signup` anchor scroll reset bug — race condition with concepts.json render; fix: re-scroll to hash post-buildGrid
- Brevo domain authentication (SPF + DKIM for `epistemic.live`) — needed to exit Promotions tab long-term
- Stoic library — defer to Phase 2; implement as a `philosophy`-tagged collection ("Stoic Foundations"), 10–15 concepts from Marcus Aurelius, Epictetus, Ryan Holiday; surface via existing collections mechanic; dedicated filtered view or landing page in Phase 2
- map.html episode/shorts filter (in-map filtering instead of redirect) — deferred, complexity not worth it at current stage

---

### [WATCH] Concept grid virtualization — trigger at ~1,500 concepts

The main grid currently renders all concepts as DOM nodes upfront. At 584
concepts this is ~3,500 DOM nodes and works fine. The architecture will
hit a wall around 1,500-2,000 concepts — feel sluggish on Mac, broken on
mobile.

Fix when needed: virtualize the grid (only render the ~30 cards visible
on screen, swap them in/out as user scrolls). Each category row becomes a
horizontal virtual scroller. Estimated effort: 2-3 hours.

Not now. Track concept count in `concepts.json` — when it crosses 1,200,
schedule the work for the next sprint.

---

## Current status — Netflix test file
 
`index-netflix-test.html` has been renamed to `index.html` (v1.30, 2026-05-05).
The test file is now the live file. Old `index.html` retired.
 
### What's in the test file that is NOT in index.html
 
| Feature | Status in test file |
|---|---|
| Netflix category rows (horizontal scroll per category) | ✅ Live |
| Page reorder (hero → app → newsletter) | ✅ Live |
| How It Works as modal | ✅ Live |
| Category pills (compact, magnetic, with icons) | ✅ Live |
| Floating nav island with jump links | ✅ Live |
| Nav shrinks on scroll | ✅ Live |
| Mobile hamburger nav menu | ✅ Live |
| Magnetic hover on nav links | ✅ Live |
| COTD fix (nav "Today" button) | ✅ Live |
| People pills hidden on card front, shown on expand | ✅ Live |
| Auto-scroll fix (mobile, delta-time normalized) | ✅ Live |
| YouTube thumbnails on episode cards | ✅ Live |
| Hero typography pass (larger heading, editorial stats) | ✅ Live |
| Animated hero radial glow | ✅ Live |
 
---

### Batch-commit publish refactor — DONE ✅ (v1.35, 2026-05-10)

**Why it existed:** `publish-concept.js` committed one concept at a time. Make.com fired it 20–40 times per episode, and Vercel coalesced rapid commits into a single build that missed the last 1–2 commits of a batch. GitHub had the full data; the deployed `concepts.json` lagged.

**What shipped:**
- New 5-module Make scenario `LLL — APPROVED → Batch Publish → Live`.
- `/api/publish-batch.js` accepts an array of concepts, commits all of them in ONE GitHub commit, returns per-concept success/failure for downstream Iterator + Airtable update.
- `publish-batch.js` accepts both lowercase keys (e.g. `term`) and Airtable-cased keys (e.g. `Term`, `Collection ID`) so Make's array aggregator output can flow through unmodified.
- Old `publish-concept.js` retained as fallback for one-off publishes.

**Definition of done — all met:**
- Single episode batch lands on GitHub as one commit ✅
- Live site shows the full count within 60s, no manual redeploy ✅
- Failed concepts surface as `Publish Error` rows in Airtable, stay APPROVED ✅

**Cleanup remaining:**
- Old scenario `LLL — Airtable APPROVED → GitHub → Live` still ON as fallback. Retire after one week of clean batch operation (target: 2026-05-17).

---

## Next build session — Private browser-based transcript extractor - DONE ✅

### `extract.html` — bypass Airtable for transcripts (~1 hour build)

**Why it exists:** Airtable Long-text fields cap at ~100k characters. Podcast transcripts of 2+ hours regularly exceed this. The current Intake-form-based pipeline silently breaks above the cap, manifesting as a vague "You are not permitted" error.

**What it does:** A private browser-based HTML page (same pattern as `upload.html`) that takes the Intake form fields plus a transcript paste, calls the Anthropic API directly from the browser, parses the response, then writes:
1. A new collection to `collections.json` via a lightweight server endpoint (or directly via GitHub API + browser-stored token).
2. Concept rows directly to Airtable Concepts table as PENDING.

The transcript never gets stored in Airtable — it lives in browser memory only during the extraction call. Concepts table receives the parsed concepts (small payloads, well under any limit).

**Architecture options to evaluate in build session:**
- Option A: Browser calls Anthropic directly → calls a new `/api/extract-from-browser.js` Vercel endpoint that accepts pre-parsed concepts (skips Claude call) and handles the collection + Airtable write logic.
- Option B: Browser does everything — Anthropic call, collection creation via GitHub REST, Airtable writes via REST. No new Vercel function. Mirrors `upload.html` pattern most closely.

Option B is simpler. Trade-off: requires storing GitHub PAT in browser code (same security model as `upload.html` — fine for solo private tool, never commit with token).

**Reuses from existing codebase:**
- Extraction prompt (copy from `extract-concepts.js` constant)
- Collection creation logic (port from `extract-concepts.js`)
- Airtable concept-row write logic (port from `extract-concepts.js`)
- Form/UI patterns from `upload.html`

**Replaces (eventually):** The Airtable Intake form + Make.com extraction scenario, for any episode over ~90k chars. Short episodes can still flow through the Intake path if convenient.

---

## Shipped (live in production)

The following features were proposed earlier and have shipped to the live site. They are no longer "future" items:

- **Quiz mode** — flashcard-style review accessible via nav `◈ QUIZ` button.
- **Streak system** — consecutive-day tracking, visible in daily goal bar.
- **Concept of the Day** — modal opens on first daily visit; accessible via nav "Today" link.
- **Hero redesign with two-column layout** (v1.30, 2026-05-05).
- **Section banding** with `--band` token; Browse Episodes on distinct background (v1.31, 2026-05-06).
- **Episodes grouped by podcast** with per-podcast scrollable rows (v1.31).
- **Drag-to-scroll + arrow buttons** on all horizontal rows (v1.31).
- **Episode search bar** mirroring Concepts search (v1.31).
- **`podcast` field** added to episode collections + Intake pipeline (v1.31).

See `changelog.md` for full details.

---

## Next build session — Promotion to index.html - Partially DONE ✅
 
Before promoting, resolve these open items from the test file:
 
- [X] **E2 — Mobile audit** — go through every section on a real phone. Check spacing, card sizes, nav, pill wrapping, episode drawer
- [x] **C2 — Card front cleanup** — card front should show only: ID, Category, Term, Hook. Remove any remaining noise (currently looks clean but verify)
- [ ] **D2 — Episode mix bar in drawer header** — the category mix bar was removed from the episode card face but should still appear in the drawer header. Verify it renders correctly
- [X] **Auto-scroll on/off toggle** — some users may find continuous motion distracting. Consider a simple pause toggle or respecting `prefers-reduced-motion`
- [x] **Verify newsletter section renders at bottom** — after the reorder, confirm the Beehiiv form still submits correctly and the `id="signup"` anchor scrolls correctly from the nav
Once the above are confirmed, promotion is a single step: copy contents of `index-netflix-test.html` into `index.html` and commit.
 
---
 
## Proposed next features (post-promotion)
 
Ordered by impact vs. effort. These are ideas to build after the test file is promoted.
 
### High impact, low effort
- **Concept count badge on category pills** — show `· 27` next to each pill label so users can see which categories are richest before clicking. Already in the pill row, just needs re-enabling
- **Swipe-down to close episode drawer on mobile** — was flagged as missing in Test Round 1. Simple touch event
- **`prefers-reduced-motion` respect** — disable auto-scroll and hero glow animation for users who have motion sensitivity set in their OS
### High impact, medium effort
- **Concept of the Day — email delivery** — send today's concept via Beehiiv automation. Requires adding a Beehiiv automation that sends a daily email with the day's concept (deterministic pick = same concept for all subscribers on a given day)
### Medium impact, medium effort
- **Episode row: "Most concept-dense" sort** — second row showing episodes ranked by concept count. Currently deferred (only 2–3 episodes). Meaningful once there are 8+ episodes
- **Category landing view** — when a category pill is clicked, show a brief category description above the row ("Psychology: how your mind shapes your decisions and behaviour"). Adds editorial context
- **Collections drawer for curated packs** — same drawer mechanic as episodes but for the 6 foundational packs (IDs 1–6). Currently those collections exist in `collections.json` but have no UI entry point
### Lower priority
- **Search across episode titles** — partially shipped v1.28: people are now indexed (typing a host/guest name surfaces their concepts). Episode titles themselves are not yet indexed — add `title` from collections to the Fuse index when needed
- **Share card image** — generate a shareable image (OG card style) when a concept is shared. Requires a serverless function or canvas rendering
- **Pro tier gating** — freemium paywall logic. Defer until D7 retention target (>35%) is confirmed

---

### Render-perf session (deferred from v1.36)

- **Row-level grid diffing.** `buildGrid()` currently rewrites all 270+ card HTML via `innerHTML = html` on every category click and every debounced search keystroke. Migrate to row-level updates: re-render only rows whose visible card list actually changed. Should noticeably improve search-as-you-type feel.
- **Drag-scroll throttling.** `.nf-row` and `.episodes-row` mousemove handlers run unthrottled. Wrap in `requestAnimationFrame` to cap at 60fps.
- **Remaining `transition: all` cleanup.** `.cat-card`, `.btn-master`, `.btn-share`, `.btn-listen` still use `transition: all 0.2s`. Replace with explicit property lists if hover lag becomes perceptible.
- **Glow-on-hover audit.** The `::before` thin-line glow at the bottom of each concept card on hover requires a paint per mouseenter/leave. Aesthetic value is real but worth measuring against a baseline that drops it.

---

## Phase 1 — Retention mechanics (originally planned, now partially superseded by test file work)

- [x] Founding Member newsletter section redesign (copy, incentive, heading)
- [x] Nav signup CTA — accent pill with pulse + magnetic, desktop nav-right
- [ ] Tally.so form — 12-question founding member survey (next session)
- [ ] Brevo email automation — 2-email sequence (confirmation + 7-day follow-up)
- [ ] "Why / How / What" nav button — replaces "How it works" (strategy session needed)
- [x] Netflix-style browsing UI (delivered via test file, pending promotion)
- [ ] Streak system

---
- [x] Quiz mode — ⚠️ partially shipped. UI complete, pool loading bug pending fix (see build-journal 2026-05-02)
- [ ] Concept of the Day email delivery

## Phase 2 — Growth
 
- Email referral loop via Beehiiv
- SEO: static concept pages (`/concept/[id]`) for Google indexability
- Episode page at `/episodes` (once 8+ episodes exist)
- Open Graph image generation
## Phase 3 — Monetization
 
- Pro tier: €12/month
- Gated features TBD based on real usage signals
- Beehiiv paid newsletter tier integration
---
 
## Platform risk note
 
Spotify/Apple building a native version of this concept within 18 months remains the primary existential risk. The moat is editorial quality + non-native English speaker positioning. Speed of library growth and D7 retention are the metrics that matter most before any platform move happens.

---

**Goal:** when a transcript is submitted via the Airtable form, the
resulting concepts should publish to the site WITH a `collection_id` so
they appear under their podcast episode.

This requires three coordinated changes:

1. **C1 — add `Collection ID` field to the Airtable Concepts table.** ✅ Done, v1.16
2. **C2 — add `People` field to the Airtable Episodes table.** ✅ Done, v1.16
   Long text type (rich text disabled). Convention: host first, then
   guests, comma-separated.
3. **C3 — update Make.com publish automation + `/api/publish-concept.js`
   to map and write `collection_id`.** Still pending. The publish
   function currently writes 8 fields and omits `collection_id`.
   Update it to write the full 9-field schema. Episodes `People`
   field will also be wired into the `people` array on episode-based
   collections in this same session.

After C1+C2+C3 land:
- New concepts published via the pipeline will land in `concepts.json`
  with a real `collection_id` value (or `null` if unassigned).
- The 165 existing concepts will still have `collection_id: null` until
  a separate backfill task (A4) runs to assign them to foundational packs.


## Pending build tasks

These items came out of the 2026-04-26 sessions. Each is a small, focused
build task; none are blocking the C1+C2+C3 work above. Ordered by impact.

- [x] C3 — Wire collection_id through publish path (function + Make + verification) — v1.17
- [x] **A4 — Backfill collection_id on existing concepts** (Done, v1.15)
  Assigned collection_id 1–6 to all 163 concepts based on category, mapping to the foundational packs in collections.json.

## PAUSE — use the site, gather real signals
After the C1+C2+C3 session, before any further building, spend at least
one week using the live product. Real-world signals beat planned
features.

---

### Deferred until first real podcast episode
- [x] B3 — people pills on cards (Done, v1.19, 2026-04-29). Was deferred
      under that label; effectively shipped now via D2. Pills render
      from `collection.people` on episode concepts.
- C3 — update Make.com publish automation to map Collection ID instead of
       (and eventually instead of) Source - DONE
- C4 (new) — retire `source` field from agent pipeline + Airtable + extraction
       prompt once C1–C3 are stable - DONE

### Empty-category UI polish (deferred)
- creativity, science, and tech-ai will be visibly empty until podcast
  content fills them. Options when we revisit:
  (a) hide categories with 0 concepts
  (b) badge them as "coming soon"
  (c) show them empty as a roadmap signal to users
- No decision yet — park until after the pause week.

---

## Phase 0 — Foundation ✓ COMPLETE

**Status:** Done
**Timeline:** Completed April 2026

- [x] MVP HTML file with 160 concepts
- [x] Dark editorial aesthetic with Playfair + DM Sans
- [x] Category and source filtering
- [x] Daily goal tracker (client-side, localStorage)
- [x] GitHub repository created
- [x] Concepts moved to concepts.json, loaded via fetch
- [x] Vercel deployment working
- [x] Custom domain ready for connection
- [x] Removed dead `PROMPTS` object and `getPrompt()` helper from
  `index.html` (v1.13, 2026-04-28). Final cleanup of the 2026-04-25
  phantom prompt bug.
- [x] Removed duplicate concepts IDs 55 and 68 from `concepts.json`
  (v1.14, 2026-04-28). Concept count corrected from 165 to 163. Final
  cleanup of the 2026-04-26 duplicate-merge pending task.

**Lessons from this phase:**
- Variable naming consistency matters — `UNIQUE_CONCEPTS` vs `CONCEPTS` cost hours
- Always test fetch on the deployed URL, never by opening HTML locally
- Browser console is the fastest debugging tool — check it first every time

---

## Phase 1 — Make It Stick (in progress)

**Status:** In progress
**Timeline:** Weeks 1–4
**Goal:** Users come back daily. Without this, nothing else matters.

### Core retention features

- [x] **localStorage persistence** — mastered concepts save between sessions (2026-04-22)
- [x] **Concept of the Day** — modal on page load, day-deterministic pick (2026-04-26)
- [x] **Progress bar** — visible always on the App section
- [x] **Streak system** — daily 5-concept goal, breaks if missed, 🔥 counter in goal bar (2026-05-02)
- [x] Quiz mode — ⚠️ partially shipped. UI complete, pool loading bug pending fix (see build-journal 2026-05-02)
- [x] Vault of Ideas — mastered concept library, accessible via progress bar + YOUR VAULT pill (2026-04-30)

### Sharing & growth

- [x] **One-tap share cards** — canvas-rendered 1080×1920 portrait image, full concept content (2026-05-02)
- [x] **Share to copy** — PNG download fallback for desktop (2026-05-02)
- [x] **Native share API** — Web Share API with image file + CTA message (2026-05-02)

### Content infrastructure

- [x] **Category expansion** — 7 → 14 categories. language as flagship. tech-ai added with 15-year-old analogy rule. April 2026.
- [X] **Airtable setup** — full schema from airtable-schema.md
- [X] **Import existing concepts into Airtable** with Status = PUBLISHED (165 records as of 2026-04-27)
- [ ] **Define the editorial workflow** — how PENDING → APPROVED → PUBLISHED actually works day to day

- [x] **Episode drawer UI — Test Round 1** — Netflix-style bottom sheet with
  blur backdrop, concept cards, category mix bar, and deep-link to episode.
  Shipped v1.22 (2026-04-30). See changelog for full feature list and known
  limitations.

- [x] upload.html rebuild — per-field edit/regen, key persistence, optional attribution (v1.38)
- [x] Shorts mode in extract.html — mode toggle, SHORT_EXTRACTION_PROMPT, type:"short" collections (v1.39)
- [x] Browse Shorts section on site — inline single-concept cards, multi-concept drawer (v1.39)
- [x] Multi-slot Short extraction — batch process multiple YT Shorts in one session (v1.40)

### Episode drawer — deferred improvements (Test Round 2+)
- [ ] Swipe-down gesture to close drawer on mobile
- [ ] "Most Concept-Dense" second episode row (needs 5+ episodes to be useful)
- [ ] Real podcast thumbnail/artwork (scraping or manual upload — decision pending)
- [ ] "Episode in 90 seconds" summary blurb — requires new field in extraction
      prompt and Airtable Episodes table
- [ ] "The Big Idea" — one featured concept per episode, shown larger in the drawer
- [ ] Timestamp deep links on concept cards ("→ 23:14 in episode") — requires
      timestamp capture during extraction

- [ ] YT Shorts: lightbox embed — click thumbnail → modal with 9:16 iframe, lazy-loaded. Fallback to external link if embedding disabled.
- [ ] Content labels (Netflix subcategories) — `labels: []` field on concepts. Fixed set: "Controversial", "Scientific", "Hard-hitting", "Counterintuitive", "Practical", "Philosophical" (start with Editor's Picks only, expand later). Cards show label pills; browse grid gets second filter row.
- [ ] COTD share button + people pill — reuse existing `shareCard()` canvas mechanic; people pill reads from `collection.people` (conditional on `collection_id` not null).
- [ ] Make.com JSON escaping — Airtable formula field pre-escaping `"` → `\"` and newlines. Map formula field in Make instead of raw transcript field.
- [ ] Favicon on `extract.html` + `upload.html` — copy `<link rel="icon">` tags from `index.html` into local copies (not in repo).

### Email capture

- [x] **Beehiiv account** — free tier, publication created (2026-04-23)
- [x] **Embedded email form** — native inline form with serverless API proxy (2026-04-23)
- [x] **Welcome email** — single immediate welcome, fires on signup (2026-04-23)
- [ ] **Welcome sequence** — expand from single welcome to 3-email drip over first week

**Do NOT build in this phase:**
- Pro tier / payments (come back in Phase 3)
- User accounts / authentication (localStorage is enough for now)
- Podcast processing pipeline (Phase 2)
- Any original feature from the "outside the box" list (Phase 3+)

**Exit criteria to move to Phase 2:**
- 500 unique visitors
- D7 retention > 25% as an early signal (target is >35% per lean-canvas;
  >25% is the floor below which the daily habit is not forming)
- Email list > 100 subscribers
- 3 complete days of you using the product yourself without bugs

---

## Phase 2 — Build the Agent Pipeline

**Status:** Not started
**Timeline:** Weeks 5–8
**Goal:** One podcast URL → 30 concept cards on the site, with human approval.

### Agent pipeline

- [ ] **Claude API account** — credits loaded, key saved securely
- [~] **Extraction prompt** — first real run produced 21 concepts on test transcript; tuning quality thresholds across next 5 transcripts
- [ ] **Transcript fetcher** — yt-dlp on Render.com OR AssemblyAI integration
- [x] **Make.com Automation 1** — Transcript form → Claude API → Airtable PENDING rows *(live 2026-04-24)*
- [x] **Make.com Automation 2** — Airtable APPROVED → GitHub concepts.json → Vercel auto-deploy *(live 2026-04-24)*
- [x] **Notification system** — Slack or email when concepts are ready for review

### Review UX

- [ ] **Airtable review view** — PENDING sorted by Composite Score
- [ ] **Inline editing workflow** — reviewer edits hook/analogy/prompt directly
- [ ] **Episode metadata tracking** — Episodes table with quality metrics per episode

### Library growth

- [ ] **Process 20 Modern Wisdom episodes** — target: 300 new concepts
- [ ] **Process 10 Hormozi episodes** — target: 150 new concepts
- [ ] **Process 10 Dan Koe letters** — target: 100 new concepts
- [ ] **Target library size at end of phase:** 500–700 concepts

### Content distribution

- [ ] **Twitter / X strategy** — post 3 concept cards per week with episode attribution
- [ ] **LinkedIn posts** — longer format, connect concepts to professional scenarios
- [ ] **Outreach to podcasters** — tweet or DM hosts with their episode's concept deck

**Exit criteria to move to Phase 3:**
- Pipeline processes an episode in under 15 minutes
- 70%+ of extracted concepts approved without editing
- Library contains 500+ concepts
- Email list > 500 subscribers

---

## Phase 3 — Monetize & Deepen

**Status:** Not started
**Timeline:** Weeks 9–16
**Goal:** Convert free users to paying. Add original features that create moat.

### Monetization

- [ ] **Stripe account** — connected to domain
- [ ] **Pro tier launch** — €12/month, features below
- [ ] **Account system** — email + magic link authentication (no passwords)
- [ ] **User data migration** — localStorage → backend database for Pro users

### Pro features

- [ ] **Cross-device sync** — progress follows the user
- [ ] **Full quiz mode** — all categories, unlimited attempts
- [ ] **Spaced repetition** — concepts return based on forgetting curve
- [ ] **Personal library** — users can add their own concepts
- [ ] **Podcast processing credits** — 5 episodes/month included

### Original features (from brainstorm)

- [ ] **Situation Decoder** — user describes a problem, agent identifies active concepts. Biggest word-of-mouth feature.
- [ ] **Life Audit Mode** — 10 mastered concepts, 10 pointed self-honesty questions. Emotional anchor.
- [ ] **Concept in the Wild** — weekly story, user identifies concept. Serves as email content AND in-app feature.

### Growth infrastructure

- [ ] **SEO pages for individual concepts** — templated, one per concept (165+ today, will grow)
- [ ] **Referral program** — existing users get credits for bringing friends
- [ ] **Concept Collider** — pick any two concepts, see scenario where both are active

**Exit criteria to move to Phase 4:**
- 100 paying users (€1,200 MRR)
- Free → Pro conversion rate > 3%
- D30 retention of paying users > 60%
- Library contains 800+ concepts

---

## Phase 4 — Scale & Differentiate

**Status:** Not started
**Timeline:** Month 5+
**Goal:** 1,000 paying users. Editorial team. Start carving defensible territory.

### Product

- [ ] **Your Life, Annotated** — private timeline where users log real moments, product labels them with concepts
- [ ] **Devil's Advocate Mode** — argue against a concept you've mastered
- [ ] **Blind Spot Scanner** — based on usage, identify categories the user avoids
- [ ] **Wrapped** — monthly/annual personalized summary, shareable image
- [ ] **Conversation Simulator** — practice using a concept in AI dialogue before real high-stakes moments (major feature for non-native speakers — potentially a separate product)

### Team

- [ ] **Editorial assistant** — part-time, at €3k MRR threshold
- [ ] **Growth help** — contractor for Twitter / social / outreach at €5k MRR

### Distribution

- [ ] **Podcast creator partnerships** — Modern Wisdom link in show notes
- [ ] **Affiliate program** — creators earn revenue share from referrals
- [ ] **Book deal or content project** — aggregate library into a premium physical or digital asset

### Platform expansion

- [ ] **Mobile app** — wrap in Expo, enable push notifications
- [ ] **Chrome extension** — surface concepts while browsing (e.g., highlight a term on any article)

**Exit criteria to move to Phase 5:**
- 1,000 paying users (€12,000 MRR)
- 10,000+ email subscribers
- At least one podcast creator partnership live
- Product genuinely doesn't depend on founder for daily operation

---

## Phase 5 — Expansion

**Status:** Speculative
**Timeline:** Year 2+
**Goal:** Consider raising capital OR staying bootstrapped.

### Strategic decisions to make at this point

- **Raise a seed round** to accelerate B2B and international expansion?
- **Stay bootstrapped** and optimize for profit + lifestyle?
- **Sell** to a larger learning or media company?

Each path has tradeoffs. Revisit the Lean Canvas at that time with 12 months of real data.

### Features worth considering

- [ ] **B2B offering** — teams processing internal training content
- [ ] **Multi-language support** — Spanish, Portuguese, German (large ESL markets)
- [ ] **Audio output** — daily concept as a 2-minute podcast episode
- [ ] **API access** — third parties can query the concept library

---

## Principles that guide every phase

1. **Library quality before library size.** A 500-concept library of approved gems beats a 2,000-concept library full of noise.

2. **Retention before revenue.** If users don't come back, paid features are worthless.

3. **Build for your actual audience — ambitious non-native English professionals — before chasing adjacent segments.**

4. **The technology is commoditized; the editorial voice is not.** Protect the editorial standards above all else.

5. **No feature ships without a retention or growth hypothesis attached.** "It would be cool" is not a reason to build.

6. **Avoid raising capital until a genuine inflection point.** Diluting equity to prove basic product-market fit is expensive.

---

## What NOT to build (warning list)

These ideas will appear tempting — don't build them until the Lean Canvas explicitly calls for them:

- **Social feed / timeline of concepts.** Algorithmic feeds destroy the intentional, curated experience.
- **Gamified leaderboards visible by default.** Only opt-in leaderboards, ever. Ambitious adults don't want to be ranked publicly.
- **AI chatbot for concept questions.** Dilutes the product focus. Claude can answer anything — that's not the moat.
- **Multi-author marketplace where anyone can submit.** Quality control becomes impossible at scale. Curated + occasional guest contributors only.
- **Ads on the free tier.** Undermines premium positioning. Never.
- **Gamification with coins, gems, or currencies.** Wrong demographic. Stay editorial.

---

## Decision log — major pivots or shifts

*(Update this section whenever the roadmap changes significantly.)*

**April 2026:** Initial roadmap created. MVP complete. Phase 1 priority: retention mechanics before revenue.

**June 2026:** Clarity + minimalism pass (v1.71, v170index.html branch). Nav collapsed to Spark/Browse/Stash. CS modal restructured to logical flow. Per-scenario API generation (~75% cost reduction). Streak/vault UI hidden — target persona research confirmed gamification is a trust signal negative for ambitious professionals. D7 retention still the hard gate before any V2 features or index.html promotion of these changes.

**June 2026 (v1.72):** CS modal full UX overhaul in `v172.html`. Zero-click prompt generation on page load. Modal restructured to logical top-to-bottom flow: concept → prompt → coaching → reveal controls → actions. Prev/Next concept nav stack added. Stash history auto-saves every generated prompt. Badge reflects today's saves only. All changes isolated to `v172.html` — `index.html` remains at v1.69 stable reference until D7 retention data gates promotion.

**June 2026 (v1.98–v1.99h):** Library UX overhaul in `spark.html`. Emoji icon button system across all card templates. Drawer 3-view (flip/scan/all) with permanent HTML wrapper. Black GPU frame eliminated (root cause: `align-items:stretch` on `.nf-row`). Glow border on some cards eliminated (root cause: `box-shadow` on card wrapper not face). Preview dismiss race resolved. All-cards view rebuilt from data. D7 retention still the gate for V2.
