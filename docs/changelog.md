# Changelog — Epistemic

**Purpose:** Human-readable log of feature changes by version. Build journal is for lessons/bugs; this file is for "what's different now."

**How to use:** Add new versions at the TOP (newest first). Bump the version number with each notable change. Ask Claude at the end of any build session: *"update the changelog with what we just built."*

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
