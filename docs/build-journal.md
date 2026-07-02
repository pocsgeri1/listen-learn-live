# Build Journal — Epistemic

**Purpose:** A running log of lessons, gotchas, and non-obvious fixes from actual build sessions. When something goes wrong and gets solved, document it here. Future-you and future-Claude will thank present-you.

**How to use:** Append new entries at the TOP (newest first). Keep each entry short — what happened, what the fix was, what you learned. Don't write essays.

---

## Standing Rules — Cowork Workflow

### Before every session (Gergely does this)
1. Quit GitHub Desktop (Cmd+Q) — reopen only to push at the end
2. Close any editor (VS Code, Xcode, etc.) that has the repo folder open
3. If lock errors appeared last session: `rm -f ~/Documents/GitHub/listen-learn-live/.git/HEAD.lock ~/Documents/GitHub/listen-learn-live/.git/index.lock`

### Commit message format
```
Title:  v[X.Y] - [short imperative description]
Body:   - bullet 1
        - bullet 2
```
- Version number first, dash after version (not colon)
- Body: one change per line, no prose

### Git workflow (Cowork sessions)
- Claude edits files directly in `/Users/gergelypocs/Documents/GitHub/listen-learn-live/`
- **Always combine add + commit in one bash call:** `git add [files] && git commit -m "..."` — never two separate calls (failed add leaves index.lock held by sandbox)
- Gergely clicks **Push origin** in GitHub Desktop — one click, Vercel auto-deploys

### Documentation (auto, end of every session — no reminder needed)
Claude updates without being asked: changelog.md (new entry at TOP), roadmap.md (completed → Recently Completed), build-journal.md (new lessons at TOP of Entries). Then copies to Claude Project Files via bash.

---

## Entries

### 2026-07-01 — v2.16: episode intel pipeline audit, vocab expand UI, mobile zoom root cause

**Lesson 38 — "Summary/Vocab/Tension are generated at extraction time" was a wrong assumption worth checking before building on it.** Episode extraction (`api/extract-concepts.js`, the Make.com-triggered script) only ever produced concept-card fields. Summary/Vocab/Sharpest Line/Tension are generated later, by a completely separate tool (`tools/generate-episode-intel.js` / the Episode Intel panel in `extract.html`), off `concepts.json`, writing straight to `episode_meta.json` — never touching Airtable or Make.com at all. Worth a direct file read before assuming a pipeline is wired end-to-end just because the UI shows the data.

**Lesson 39 — DNA was NOT a "populate later" placeholder — it shipped in v2.11 and works today.** It's a simple % rollup of a concept's own categories, computed at build time from `concepts.json`. No dependency to design; it already exists.

**Lesson 40 — Two copies of the same LLM prompt drift if you only edit one.** `generate-episode-intel.js` and `extract.html` each carry an independent, hand-copied version of the intel-generation prompt (extract.html's is the browser-based manual tool; the .js is presumably the future automated path). Any prompt change — like raising the Vocab Vault word count — has to land in both or the two tools silently disagree. Worth a follow-up: extract one shared source of truth if this becomes a Node/GitHub Action pipeline.

**Lesson 41 — A "not visible on 2 of 3 cards" bug is almost never 3 separate bugs.** The Corner rate bar was invisible on cards 2 and 3 because the width-set code only ever targeted `#cornerCard0` by hardcoded ID on initial render — the accordion-expand fallback that should have caught the other cards queried the wrong DOM subtree (`detail.querySelector` when the bar actually lives in the sibling `summary` row) and silently no-op'd. Fix was to stop gating the bar animation on accordion state at all — the bar sits in the always-visible summary row, so it should animate for every card immediately on panel open, no expand required.

**Lesson 42 — "Seems unfixable" is often just an unidentified root cause, not an actually-hard problem.** The mobile hero search zoom-on-focus bug had been through prior fix attempts (see v1.99k/l entries below) that solved a *different* zoom bug (page zooming out on load from a `flex-wrap` overflow) — not this one. The actual cause (input font-size at 15.2px, under iOS Safari's 16px auto-zoom-on-focus threshold) had never been targeted directly. Grep the actual computed font-size before assuming a "we already tried to fix this" bug is structurally hard.

### 2026-07-01 — v2.15d: layering a desktop-only override on top of a universal fix

**Lesson 36 — A "fix on both breakpoints" instruction and a "desktop only, on top of that" instruction can target the same sentence without conflicting.** The impostor-syndrome line needed "almost" dropped and the second bracket italicized everywhere, then desktop needed further changes (convo swap, bold+italic brackets) layered on that same already-unified base. Handled by editing the shared wording in both `.fc-desktop-only`/`.fc-mobile-only` paragraphs identically first, then applying the extra desktop-only emphasis only to that paragraph — no separate fork was needed since the structure already existed from v2.15c.

**Lesson 37 — Reuse a working light-mode override's exact values instead of inventing new ones.** `.og-expand-label` already had a proven light-mode fix (`#7a6830` @ 0.72 opacity) for low-contrast accent-color text. Applying the identical values to `.og-story p.og-kicker` fixed the same contrast problem there with zero guesswork.

### 2026-07-01 — v2.15c: when copy needs to genuinely fork, don't fight one string

**Lesson 34 — Font-size shrinking to force a natural wrap point is fragile; a real per-breakpoint content fork is more robust.**
v2.15b tried to keep "masturbation" on row 1 on mobile by shrinking `fc-mast-line`'s font-size and hoping the narrower text naturally wrapped in the right place. It worked, but it's brittle — any future font, padding, or copy change could shift the wrap point again. v2.15c replaced it with two full `<p>` elements (`.fc-desktop-only` / `.fc-mobile-only`) with different text and an explicit `<br>` on mobile. More markup, but the line-break is guaranteed rather than hoped-for.

**Lesson 35 — Reusable "show this version at this breakpoint" utility classes are worth having early.**
By v2.15c, four separate lines needed different wording or structure on desktop vs mobile (not just different sizing). Built one small utility pair — `.fc-desktop-only` / `.fc-mobile-only`, plus `.founder-bullets li` / `.og-bullets li` variants for list items whose base display differs by context — instead of one-off inline styles per line. Compound selectors (e.g. `.og-bullets li.fc-mobile-only`) were needed to beat the specificity of the existing base rules.

### 2026-07-01 — v2.15b: unguarded mobile-only CSS rules leaking into desktop

**Lesson 32 — A `.state-class { display: none }` rule with no `@media` guard applies everywhere, even if the state was only ever meant to be reachable on mobile.**
`.ep-drawer.drawer-scan-active .ep-drawer-cat-filter { display: none !important; }` was written for the mobile single-cycle-button UX (v2.14 era) but had no `max-width` wrapper. Since `setDrawerView()` sets `drawer-scan-active` from any device when the scan view is selected, desktop users hit the same "hide the cat filter" behavior — and because cat-filter had `flex:1` and was the thing pushing the view-button group to the right edge of the row, removing it also visually left-aligned the buttons. Lesson: whenever a CSS rule exists specifically to support a mobile-only interaction pattern, wrap it in the media query at write-time — don't rely on "well, the JS that triggers this class only runs on mobile" as the guarantee, because view-toggle classes are usually shared across breakpoints.

**Lesson 33 — `pointer-events: none` on a dimmed element silently kills features wired to it, not just visually deprioritizes it.**
`.ep-drawer-body.drawer-all-mode .ep-drawer-cat-filter { pointer-events: none; opacity: 0.4; }` was presumably meant as "these don't do anything meaningful in All-cards view, so dim them" — but a later feature (scroll-to-category-section in the flattened grid) was wired to click events on those same pills, making it permanently unreachable in that view. When adding a "disabled-looking" state to an element, grep for existing click handlers on it first — dimming and disabling are two different decisions that shouldn't be bundled by default.

### 2026-07-01 — v2.15a: line-wrap via forced `<br>`, and the fullscreen map revert

**Lesson 30 — Don't trust `&nbsp;` alone to control where a line breaks.**
Gluing two words together with `&nbsp;` only stops *those two* from splitting — it doesn't control where the line breaks upstream of them. On a different viewport width the wrap point can land somewhere else in the sentence entirely, e.g. "masturbation" itself getting orphaned onto line 2. If a specific word must always end/start a line regardless of screen width, use a forced `<br>` at that exact point instead of relying on natural reflow + `&nbsp;`.

**Lesson 31 — Ship-fast CSS tricks (like the rotate-fullscreen map) still need real-device testing before they're "done."**
The v2.15 fullscreen-rotate map worked in theory (CSS-only, no orientation API) but "didn't work out well" in practice on the user's actual phone — reverted in v2.15a. Lesson: anything involving `position: fixed` + transform rotation + touch/drag interaction on mobile is high-risk for feeling broken (pan direction, scroll-lock edge cases, safe-area insets) and should be flagged as "needs on-device testing before we call it done," not shipped as final in the same session it's built.

### 2026-07-01 — v2.15: OG text rewrite, mobile column bug, fullscreen map rotate trick

**Lesson 27 — `columns: N` needs an explicit mobile override.**
`.og-story { columns: 2; column-gap: 3rem; }` had no `@media` breakpoint, so it silently squeezed into 2 narrow columns on phones too. CSS multi-column doesn't auto-collapse like flex/grid can with `flex-wrap` — always pair a `columns` rule with a `max-width` override that sets `columns: 1`.

**Lesson 28 — Fullscreen "rotate the phone" without the orientation API.**
To force a rotated fullscreen view that works regardless of the OS rotation lock: `position: fixed; inset: 0`, swap `width`/`height` to `100dvh`/`100dvw` (dimensions transposed), then `transform: translate(-50%,-50%) rotate(90deg)` from `top/left: 50%`. No JS orientation listener needed — pure CSS, works even if the device is locked to portrait. Caveat: existing drag-pan math (mouse/touch deltas) doesn't know about the rotation, so panning direction will likely feel inverted in the rotated view — pinch-zoom is unaffected since it's distance-based, not axis-based.

**Lesson 29 — `&nbsp;` glues two words across a manual line-break risk.**
To stop punctuation/a word pair from splitting awkwardly at a CSS reflow point (e.g. "masturbation... and" wrapping mid-ellipsis), move the ellipsis off the risky word and glue it to the next word with `&nbsp;` (`masturbation ...&nbsp;and`) instead of fighting it with `white-space: nowrap` on a whole sentence.

### 2026-07-01 — v2.14b–j: Intel pill popover debugging lessons

**Lesson 23 — `50% 50%` grid columns overflow when there's a gap.**
`grid-template-columns: 50% 50%` with `gap: 20px` = 100% + 20px → horizontal scroll appears. Always use `1fr 1fr` for equal columns — `1fr` divides available space *after* the gap is subtracted. Visually identical, no overflow.

**Lesson 24 — JS inline styles beat CSS rules; use `!important` to override.**
When JS sets `element.style.gridTemplateColumns = 'repeat(3, 1fr)'`, that inline style wins over any `.class { grid-template-columns: 1fr }` rule in the stylesheet, regardless of specificity. Fix: add `!important` to the CSS override. Applies anywhere JS writes to `.style` directly.

**Lesson 25 — "Expand left" right-anchor logic breaks when the popover is very wide.**
Added a branch: "if popover overflows right edge, anchor to right side instead." With a 1355px wide popover and a typical 1440px viewport, it almost always overflowed, so it almost always right-anchored — placing the box far left. Simple fix: always left-anchor from the pill's left edge, clamp so `left + popW ≤ viewport - 8`. No branching needed.

**Lesson 26 — Fixed height on a popover is fragile; prefer max-height only.**
Setting `height: calc(81vh - 76px)` forced the box to always be that tall regardless of content. If the inner content didn't fill it, the box looked broken; if it was too tall, nothing scrolled because `overflow-y: auto` at the outer level conflicted with `overflow: visible` from a subclass. Cleaner: just set `max-height` and let the box auto-size to content. Only use fixed height if you explicitly want a rigid frame.

---

### 2026-06-30 — v2.14: git lock root cause identified

**Lesson 22 — index.lock is held by the Cowork sandbox VM itself, not GitHub Desktop.**
`lsof` on a stuck index.lock showed `com.apple.Virtualization.VirtualMachine` (PID of the Cowork sandbox) as the holder. This happens when `git add` runs as a standalone bash call and fails or gets interrupted — the sandbox keeps the file open. GitHub Desktop being open makes it worse but is not the only cause. **Permanent fix: always run `git add [files] && git commit -m "..."` as a single combined bash call.** If it fails, nothing gets locked. If lock appears anyway, user must `rm -f` from Mac Terminal — sandbox cannot unlink its own locks.

---

### 2026-06-30 — v2.13b/c/d: OG layout bug cascade + bash escaping

**Lesson 18 — Bash heredocs escape `\!` even with single-quoted PYEOF delimiter in some shells.**
Every bash heredoc (`<< 'PYEOF'`) caused `\!` → `\\!` inside Python string literals, corrupting JS logic (`if(\!n)` → `if(\\!n)`), HTML comments (`<\!--` → `<\\!--`), and ultimately rendering JS as page text when a `<script>` block contained `\!`. Fix: use `Write` tool to write Python scripts to disk (bypasses bash entirely), then execute with `python3 /path/to/script.py`. Never inject JS or HTML with `\!` characters via a bash heredoc.

**Lesson 19 — `position: relative; width: calc(100% + Xpx); margin-left: calc(-Xpx)` clips when the parent has `overflow-x: hidden`.**
Attempted to escape the right grid column by expanding `og-map-wrap` leftward with negative margin. The `founder-section` already had `overflow-x: hidden`, so the left half was invisibly clipped. Looked like a half-dark rectangle. Fix: move the element to a higher DOM position (`grid-column: 1 / -1` on a direct grid child) rather than trying to visually escape with negative margins inside an overflow-hidden ancestor.

**Lesson 20 — Extra closing divs from failed intermediate edits silently break toggle sections.**
Three leftover tags (`</div><\!-- /og-story -->`, `</div><\!-- /og-col-story -->`, `<div class="og-col-map">`) prematurely closed `og-section-inner` and `og-section`, leaving the SVG map as a DOM sibling of `og-section` rather than a child. The map was always visible; the story text was hidden inside the collapsed toggle; zoom buttons hit `null` elements. Lesson: after any multi-step DOM surgery, verify div balance with a depth counter before committing.

**Lesson 21 — Quit GitHub Desktop before every bash session. No exceptions.**
GitHub Desktop holds `HEAD.lock` and `index.lock` as long as it is open. Any `git add` from the bash sandbox creates a conflicting lock that persists and blocks all subsequent commits. The sandbox cannot `unlink` the host filesystem lock (Operation Not Permitted). Correct permanent workflow: (1) Quit GitHub Desktop at session start. (2) Do all work. (3) Claude commits. (4) Open GitHub Desktop just to push origin. Saves 5+ Terminal interruptions per session.

---

### 2026-06-30 — v2.13: OG easter egg, inline SVG, cross-session git safety

**Lesson 15 — Never patch index.html from a cloned temp copy when live repo has uncommitted changes.**
This session initially cloned from GitHub into /tmp/repo and built the patch there, unaware the other Cowork session had uncommitted changes sitting in the live repo. The patch was based on the last committed state, not the working tree. Fix: always connect the live repo folder first, pull, then edit in place. Clones are read-only references, never edit targets.

**Lesson 16 — Inline SVG IDs are global, not scoped to the SVG element.**
Reusing gradient/marker IDs (cg, dg, arr, etc.) from a second inline SVG on the same page silently breaks both. Fix: namespace all defs IDs with a feature prefix (og-cg, og-dg, og-arr) and update every url(#...) reference within that SVG. Takes 2 minutes and prevents invisible render bugs.

**Lesson 17 — HEAD.lock always appears when GitHub Desktop is open alongside bash commits.**
Established pattern: GitHub Desktop holds HEAD.lock during any background operation. Never attempt workarounds. Correct flow: tell user to run `rm -f .git/HEAD.lock` in Terminal, wait for confirmation, then proceed.

---


### 2026-06-30 — v2.12: Episode Intel panel, Style D, git lock files

**Lesson 12 — Git lock files always require Terminal; never try bash workarounds.**
`index.lock`, `HEAD.lock`, and `objects/maintenance.lock` all appeared across this session — caused by GitHub Desktop running alongside bash sandbox commits. The only correct fix: give the user a single `rm -f` command for Terminal and wait. Bash sandbox `rm` clears the sandboxed mount copy, not the real Mac path. No shortcuts, no alternative git invocations.

**Lesson 13 — extract.html lives in a separate protected repo (epistemic-tools), not listen-learn-live.**
The file is Cloudflare-protected and cannot be fetched or pushed from the bash sandbox. Correct flow: user copies file to listen-learn-live in Finder → Claude edits there → user copies back to epistemic-tools and commits from GitHub Desktop. Never rebuild extract.html from scratch; always start from the live copy.

**Lesson 14 — Style D "The Skeptic" design principle: honest movement, not conversion.**
The style is distinct because P1 makes a skeptical reader feel seen (not dismissed), P2 uses ONE specific thing that actually cracked the objection (not a full argument), and P3 lands at genuine shift — not converted, not fully rejected. The power is in not overselling. P3 must always have exactly 2 sentences. If the episode can't produce a real crack in a real objection, use Style A or B instead.

---

### 2026-06-28 — v2.11: git disaster + standing rule

**Lesson 11 — NEVER use GIT_INDEX_FILE workaround. Ever.**
Using `GIT_INDEX_FILE=/tmp/...` to bypass index.lock creates a blank staging area. The commit goes through but contains only the files explicitly added to that temp index — everything else gets deleted from git tracking. The repo looks intact on disk but GitHub shows 74 files missing. Recovery requires a force push, which caused 30 minutes of pain. The only correct response to index.lock is: stop, tell the user to run `rm -f .git/index.lock` in Terminal, then commit normally. No shortcuts.

**Standing rule (enforced from now on):** If index.lock or HEAD.lock blocks a bash commit, Claude gives the user a single `rm -f` command for Terminal and waits. No workarounds. No alternative git invocations.

---

### 2026-06-28 — v2.11: Episode Intelligence Layer Phase 1 (DNA pill)

**Lesson 8 — Compute derived data at build time, not runtime.**
Category % DNA is computed from `concepts.json` via Node script at session start and stored in `episode_meta.json`. Zero runtime cost. The browser already had equivalent logic (the old `ep-drawer-mix` bar) but running server-side means consistent data across all surfaces and no repeated computation per drawer open.

**Lesson 9 — Floating popovers need `position:relative` on the pill row, not the drawer.**
`ep-intel-row` is `position:relative`; the popover is `position:absolute` relative to it. If scoped to the drawer, it would shift on scroll. Always anchor absolute overlays to their nearest scroll-independent ancestor.

**Lesson 10 — Use `window.matchMedia('(hover:none)')` to gate tap-toggle on mobile.**
True on touch-only devices, false on desktop (even touchscreens with a mouse). Correct way to distinguish hover behaviour from click behaviour without relying on `ontouchstart` checks.

---

### 2026-06-28 — index.html v2.9: Corner fixes + Cowork workflow

**Lesson 4 — CSS class removal alone doesn't guarantee transitions fire cleanly.**
Removing `corner-mode` from `body.classList` should trigger CSS transitions back to base state — but the browser may batch it with other DOM reads in the same frame, so the transition sees no state change. Fix: `void document.body.offsetHeight` immediately after `classList.remove()` forces a synchronous reflow, making the browser commit the new state before the transition engine runs. Without it, hero text stayed displaced after exiting Corner mode.

**Lesson 5 — `transition-delay` on entry doesn't auto-clear on exit.**
`sp-corner-tagline` had `transition-delay: 260ms` on the `body.corner-mode` selector. When exiting, removing the class should reverse the transition — but the delay was inherited from the previous enter state and trapped the fade-out. Fix: explicitly reset `el.style.transitionDelay = ''` in `exitCornerMode()` immediately after class removal.

**Lesson 6 — Bash git operations conflict with GitHub Desktop if both run against the same repo simultaneously.**
Running `git add` / `git commit` from the Cowork bash sandbox while GitHub Desktop has the repo open leaves `.git/HEAD.lock` and `.git/objects/maintenance.lock` behind. GitHub Desktop then refuses to fetch/pull with "lock file already exists." Fix going forward: always close or background GitHub Desktop before running git commands from bash. If locks appear, user deletes them via Terminal: `rm -f ~/Documents/GitHub/listen-learn-live/.git/*.lock` and similar.

**Lesson 7 — The Cowork bash sandbox cannot `git push` — no GitHub credentials available.**
The sandbox has no SSH key or stored credential for github.com. `git push` exits 128 with "could not read Username." Commits work fine (local). Push must be done by the user in GitHub Desktop (one click: "Push origin"). This is the permanent workflow — don't attempt to automate push from bash.

---

### 2026-06-28 — v2.10: Pipeline — extraction prompt v1.8/v1.8.1, cache fix, concept rewrites

**Lesson 1 — Prompt rules disappear silently during compression without a diff against a test batch.**
v1.7→v1.8 compressed each field to max 8 rules. Three analogy rules ("concrete/vivid/specific", "vary opener across batch", "famous people/objects/places encouraged") didn't survive. They weren't explicitly removed — they just didn't make the cut. Discovered only after live-testing 31 concepts. **Rule: when compressing a prompt, diff removed rules against a known-good test batch. Any rule whose absence would cause a failure must survive.**

**Lesson 2 — "It's like" ban is not enough. The model adds explanation sentences after varied openers too.**
A 4-sentence analogy starting with "A cruise ship circling…" passed the opener check but still ran 35 words with two appended explanation sentences. Root cause: no explicit rule against explanation sentences, no word ceiling. **Rule: put the ceiling as rule 1. Add an explicit "no explanation after the image" rule. Ceiling without no-explanation doesn't prevent bloat.**

**Lesson 3 — CDN cache doesn't reliably invalidate when a static file shrinks then grows.**
`fetch('./concepts.json')` worked fine when the file only grew. After deleting ~42 concepts then publishing 31 new ones, Vercel CDN served the old cached version on some edge nodes. Drawer showed 0 concepts. Fix: `?v=Date.now()`. **Rule: any static JSON used as a live data source that may shrink must be cache-busted.**

**Lesson 4 — Reviewing 31 concepts in one shot is unmanageable. Batch size 5 is the limit.**
First pass: all 31 rewrites generated at once. Issues missed. Fix: 5-concept batch workflow with PASS/REWRITE diagnosis per field, approval, running JSON log, final merge. **Rule: batch size 5 for editorial review. Running log file — not memory. Never merge speculatively.**

**Lesson 5 — Fixing an analogy opener means changing only the opener, not the content.**
Early rewrites replaced whole analogies — new content, new image. Correct fix: preserve the original image exactly, rewrite only the first 3 words. **Rule: if new opener conveys the same image as the old one, the fix is right. If the content changed, you went too far.**

---

### 2026-06-27 — index.html v2.6–v2.8f: Corner Mode, Story Mode (hidden), Sparring, cs-generate extensions

**What was built:** Panel B (Story Mode) fully built then deliberately hidden. Corner Mode built from scratch: hero mode toggle, two separate search bars, constellation loading animation, Corner panel with Results + Situations tabs, Brief cards with Sparring, auto-save history. cs-generate.js extended with `situation` + `sparring` modes.

---

**Lesson 1 — `will-change: transform, opacity` in the base (non-animated) state kills hero rendering.**
Applied `will-change` to `#netflixRows`, `#mainNav`, and `.browse-toggle-wrap` in base CSS rules (not inside `body.corner-mode`). This created persistent GPU compositor layers that caused the hero section to not paint correctly — hero was invisible, concept grid was empty, `ep-preload` guard appeared never removed. Root cause: persistent compositor layers interfere with normal paint order when `ep-preload` opacity transitions fire. **Rule: `will-change` must ONLY appear inside the state selector that actually triggers the animation (e.g. `body.corner-mode .element`), never on the base element rule.**

---

**Lesson 2 — An unescaped apostrophe inside a single-quoted JS string is invisible to `new Function()` but breaks the live browser parser.**
`'Almost — this one's worth getting right…'` — the `'s` terminated the string early. `new Function(allJs)` didn't catch it because of how it handles internal string parsing. The live browser threw `Uncaught SyntaxError: Unexpected identifier 's'` and crashed the entire script block, making the page blank. **Rule: when writing JS string arrays with `var foo = ['...']` syntax, grep for `[a-z]'s` patterns inside single-quoted strings before presenting the file. Use `\\'` or rewrite to avoid the apostrophe.**

---

**Lesson 3 — Sharing a single input element between two modes (Explore search + Corner input) always produces bleed: placeholder cycles, event listeners, and dropdown triggers fight each other.**
Multiple guard flags (`_cornerActive`) were added to the Explore event listeners, but the underlying problem was architectural. Every new patch created a new failure mode. **Rule: any time two features need different input behaviour from the same `<input>`, build two separate `<input>` elements and toggle visibility. `display:none` + `display:''` between modes is infinitely cleaner than gating shared event listeners.**

---

**Lesson 4 — Orphaned HTML comment close (`-->`) renders as visible text when not inside a comment opening.**
Line 7575 had a stray `-->` (remnant of a disabled COTD block). It was hidden under the nav bar at normal scroll position — only became visible when the nav faded out in Corner mode. **Rule: when disabling large HTML blocks with `<!-- ... -->`, always grep for stray `-->` that might be left outside the actual comment pair. They render as text nodes.**

---

**Lesson 5 — Inline onclick string escaping breaks when the userInput contains quotes, commas, or special characters.**
`_cornerSparkSituation(id, 'situation text here')` — if the situation string had an apostrophe, the inline `onclick` attribute broke. The button silently did nothing. Fix: store situation in a global variable (`_cornerSituationForCards`) at card-build time; `onclick` reads the global instead of injecting the string inline. **Rule: never inject user-entered text into inline `onclick` attribute strings. Always store it in a variable and reference that.**

---

**Lesson 6 — Animating `.sp-tagline` word-by-word via individual `<span>` transitions causes layout reflow on restore.**
Per-word `translateY(-44px)` exit animations interacted with the `<br>` tag between "in" and "your earbuds." — when word spans became `opacity:0` + translated, the remaining visible text reflowed into a different position, so on restore the headline landed in the wrong place. Fix: animate the entire `.sp-tagline` element as one block. **Rule: if a headline has a line break inside it, never animate its child text spans individually — the reflow from one span disappearing shifts the other line unpredictably. Animate the parent.**

---

**Lesson 7 — Two `.sp-corner-loading.visible` CSS rules and two `.stories-overlay` rules with conflicting `display` and `background` values silently fight each other — later rule wins, earlier is wasted.**
Multiple CSS additions across sub-versions produced duplicated rules. The later Panel B definition of `.stories-overlay` with `background: rgba(8,6,4,0.55)` overwrote the Corner Mode rule setting `background: rgba(8,6,4,0)` for the fade transition. **Rule: before adding a CSS rule for any selector, grep for existing definitions of that selector. Consolidate — never duplicate.**

---

**Lesson 8 — `_cornerBuildCards` function declaration was consumed by a `str_replace` that used the function's opening line as its anchor, causing `Uncaught SyntaxError: Illegal return statement`.**
The `str_replace` pattern ended at `function _cornerBuildCards(concepts, userInput) {` but the replacement started with helper functions, so the function declaration was never re-emitted. The `return` inside `_cornerBuildCards` body appeared at top level. **Rule: when inserting code BEFORE a function declaration using str_replace, always verify the function declaration itself is present in the output. Never use `function X() {` as the old string anchor without including it verbatim in the new string.**

---



**What was built:**
Complete rebuild of the Spark (CS) panel: unified `openSparkPanel()` entry, killed scenario picker system, panel search bar (Fuse-powered), casino roll new concept, typewriter prompt, block-by-block coaching animation, loading messages, History/Stash redesign, cs-generate model fix, multiple CSS animation bugs fixed.

---

**Lesson 1 — `FUNCTION_INVOCATION_FAILED` on Vercel with no detail = model name mismatch, not a code bug.**
All `cs-generate.js` calls returned 500 for 6+ sessions. The error `FUNCTION_INVOCATION_FAILED` masked the actual issue. Root cause: model string was `claude-sonnet-4-5` — deprecated/invalid. The Anthropic API rejected it, cs-generate caught the upstream error and re-threw a 500. All other API files in the project had been updated to `claude-sonnet-4-6` in a previous session; `cs-generate.js` was missed. **Rule: when ALL other API files are updated to a new model string, grep every `.js` file in the project for the old model name before closing the session.**

---

**Lesson 2 — Fuse instance variable name: `FUSE`, not `FUSE_INSTANCE`. Always grep before referencing.**
The panel search bar was coded to use `FUSE_INSTANCE` (assumed name). The actual variable is `FUSE`. Result: search showed "Loading…" indefinitely. **Rule: before referencing any global variable that wasn't written in the current session, grep the file for its actual declaration. Never assume the name.**

---

**Lesson 3 — `position:fixed` preview cards must NOT add `window.scrollY` to `getBoundingClientRect().top`.**
The hover preview card used `top = rect.top + window.scrollY`. For a `position:fixed` card, `rect.top` from `getBoundingClientRect()` is already viewport-relative. Adding `scrollY` offsets it by the full page scroll, pushing the card to the bottom of the page on any scrolled page. **Rule: `position:fixed` elements use viewport coordinates. `getBoundingClientRect()` returns viewport coordinates. Never add `scrollY` or `scrollX` when positioning a fixed element from a `getBoundingClientRect()` value.**

---

**Lesson 4 — DOM node clone is the cleanest way to remove all stale event listeners on a re-rendered element.**
The concept pill hover preview was wired once with a `_wired` flag on `dataset`. After each `_renderCSShell()` call the same DOM node was reused, listeners accumulated, and hover fired multiple times or with stale concept references. Fix: clone the pill node (`cloneNode(true)`), replace it in the DOM, then re-add listeners. DOM clones have no event listeners attached. **Rule: for interactive elements inside templates that re-render frequently, clone-and-replace is simpler and safer than tracking/removing individual listeners.**

---

**Lesson 5 — `_applyAIData()` was called before coaching HTML was built when restoring from cache, then `_csShowPostPrompt()` ran immediately and made the (empty) container visible.**
When `doTypewriter=false`, `_showCoaching()` called `_csShowPostPrompt()` with a `setTimeout(80ms)`. But the coaching elements had `opacity:0` by default and only became visible via `.visible` class from JS. The container was shown (class toggled) but individual items were never given `.visible` because `querySelectorAll` ran before `innerHTML` had been set. Fix: build HTML first, then call `_csShowPostPrompt()`, then in the same tick or next RAF add `.visible` to each item. **Rule: always set `innerHTML` before querying children of that element. `querySelectorAll` on a node whose `innerHTML` was just set in the same call frame may return stale results depending on execution order.**

---

**Lesson 6 — Stray orphaned CSS properties (no selector) between valid rules corrupt adjacent rule parsing.**
A copy-paste error left bare CSS property declarations with no selector between `.cs-opener-line {}` and `.cs-pitfall {}`. The browser parsed these as part of the preceding rule or discarded them, which corrupted `.cs-pitfall` — it lost its `font-style:italic` and font-size overrides. The visual result was a different font/size in the Watch out section vs. the opener lines, despite the CSS looking "right" in the source. **Rule: any time a CSS block looks right but renders wrong, check for unclosed braces or orphaned properties just before and after the rule. The browser's error recovery for malformed CSS is unpredictable.**

---

**Lesson 7 — `_csShowPostPrompt()` that only toggles CSS classes cannot un-hide elements with inline `display:none`.**
The casino roll collapse used `el.style.display = 'none'` (inline style, highest specificity). `_csShowPostPrompt()` only added/removed `cs-hidden`/`cs-visible` classes. On the next Spark or restore, the coaching container stayed hidden because the inline style overrode the class. Fix: `_csShowPostPrompt()` must also clear `el.style.display = ''` before toggling classes. **Rule: if any code path sets `el.style.display` directly (inline style), every corresponding show function must also clear `el.style.display` — not just toggle classes.**

---

**Lesson 8 — `openSparkPanel(id)` was setting `_csAIData = null` and then NOT calling `_csRestoreOrLoad()`, so history/stash "Spark" always showed empty panel.**
The function set `_csAIData = null` to force a clean state, then checked `!_csAIData` at the end to show the Generate button — which was always true. `_csRestoreOrLoad()` was never called. History "Spark" buttons always opened an empty shell. Fix: after `_renderCSShell()`, always call `_csRestoreOrLoad(concept)`, which checks session cache + stash and calls `_applyAIData(d, false)` if found. **Rule: any function that opens a concept in the Spark panel must call `_csRestoreOrLoad()` after rendering. This is the contract — don't bypass it.**

---

**Lesson 9 — The output file at `/mnt/user-data/outputs/index.html` is NOT the project file at `/mnt/project/index.html`. The project file is what gets deployed.**
Multiple sessions produced correct output files but the user continued deploying the old project file (which had v1.x code). The generate button appeared to never work because the deployed file had the old `_loadAI(concept, ctx, brandVoice)` signature. **Rule: always make clear to the user that `outputs/index.html` is the file to commit to GitHub — it is NOT automatically synced to `/mnt/project/`. Always present the output file and state explicitly which file needs to be pushed.**

---



**What was built:**
Founder section scroll-reveal, copy rewrite with new CSS emphasis classes, light-mode pill border, library ◫/⊞ view toggle pair, mobile hamburger double-divider fix, mobile library rule/spacing cleanup, editorial hairline top-label removal, podcast pills always-visible + "Show less", founder image desktop repositioning, spark.html promoted to index.html with canonical/OG meta tags.

---

**Lesson 1 — SVG baked into `background-image` data URLs cannot be easily targeted with CSS or JS — you must edit the raw URL string.**
The "IDEAS WORTH SAYING OUT LOUD" label was inside both `body::before` and `body::after` SVG data URLs. There's no DOM node to hide with `display:none` — the text is encoded into the SVG markup inside the CSS `background-image` value. Fix required editing the URL-encoded SVG string directly, removing the `%3Ctext...%3E` node. **Rule: any time you add text or shapes to a `background-image: url("data:image/svg+xml,...")` for editorial decoration, treat it as non-configurable. If you need to toggle it later, use a real `<svg>` element or a `::before`/`::after` with a separate controllable property — not a baked data URL.**

---

**Lesson 2 — Replacing a single toggle button with a pair requires updating every downstream reference: the function that reads the ID, the reset path, and any init that sets active state.**
The scan toggle refactor went from one `#spScanToggle` button to two (`#spViewGrid` / `#spViewScan`). Three separate code paths had to be updated: (1) `spSetScanMode()` which updated button state, (2) the scan-state reset path that cleared the old button's text and class, (3) the post-render init that set the default active button. Missing any one of them left one path desynchronised from the others. **Rule: before shipping any button ID rename, grep the full file for every reference to the old ID and confirm each reference is updated. Use grep output as your checklist — don't rely on memory.**

---

**Lesson 3 — `spark.html` → `index.html` promotion is a rename + redirect, not a merge. The old `index.html` was a completely different codebase.**
When the promotion was planned, it was assumed `index.html` might be an older version of spark. In reality, the repo had two divergent files: `spark.html` (v2.4, 19k+ lines, current product) and `index.html` (v172 legacy, ~10k lines, old UI). The correct move was rename + archive, not merge. The legacy file was archived as `index-legacy.html`. **Rule: before any "promote X to Y" operation, always read both files first. Never assume the target file is a subset or ancestor of the source — it may be a completely different product.**

---

**Lesson 4 — Canonical and OG meta tags were missing entirely from spark.html. Promotion to index.html is the last chance to catch this before the URL is permanent.**
`spark.html` had zero `<meta name="description">`, `<link rel="canonical">`, `og:*`, or `twitter:*` tags. This was fine while it was at `/spark` (not the primary URL), but becoming `epistemic.live/` makes these mandatory for SEO and social sharing. **Rule: add canonical + OG tags at the same time as any URL promotion. Check the `<head>` for meta tags at the start of any promotion session — don't assume they exist.**

---

**What was built:**
Browse toggle redesign, dark-mode editorial hairlines, brain canvas (added + removed), scenario pill bug fixed properly, scroll-reveal, filter memory, empty-state system, global search, podcast show-more, founder/about section with photo montage + lightbox, footer + legal pages, custom cursor, mobile crash fix, mobile founder layout, copy iterations.

---

**Lesson 1 — Canvas RAF loops at uncapped 60fps + per-frame gradient creation = real performance damage.**
The brain constellation canvas was added with `requestAnimationFrame(draw)` with no throttle and `createRadialGradient()` on every pulse every frame. On modern retina displays this was hitting the main thread hard enough to make the entire page feel sluggish. Lesson: any canvas animation that uses `rAF` should (a) throttle to the minimum needed fps for its visual effect (ambient ambient animations rarely need more than 20fps) and (b) never create new objects (`createGradient`, `new Path2D`) on the hot render path — pre-bake them. The canvas was removed entirely this session rather than fixed a third time.

**Rule: before shipping any canvas animation, check: (a) is rAF throttled to the minimum fps needed? (b) are any objects being created per-frame instead of pre-baked? If either answer is "no," fix it before shipping.**

---

**Lesson 2 — "Fixed in one close path, not the sibling" — happened again.**
closeCS() was patched (v2.1) to clear `.sp-pill.active`. The outside-click and Escape paths went through `closeConversations()`, a separate function. Bug persisted until v2.1c when the actual reported path was traced. This is the same "two near-identical code paths" pattern flagged in the v1.99 build-journal entry. It happened a fourth time. **Rule: any time a fix is applied to one close/dismiss/cleanup function, immediately grep for every other function that produces the same end state (panel closed, modal dismissed, overlay removed) and check whether they also need the same fix.**

---

**Lesson 3 — Absolute-positioned fixed-pixel layouts inside `transform: scale()` cause real layout overflow, not just visual overflow.**
The founder photo montage used fixed pixel positions (`top: 0; left: 230px`) for absolute-positioned pieces inside a 570px container. On mobile I used `transform: scale(0.58)` to shrink the whole thing. `transform: scale()` affects paint but NOT layout — the 570px container still occupies 570px in the document flow, so on a 375px phone it forces the page to be 570px wide. Fixed by hiding the montage on mobile entirely and replacing it with a separate responsive flow layout for mobile. **Rule: `transform: scale()` is not a responsive layout tool. It only affects how something is painted, not how much space it claims in layout. If a component has fixed px dimensions wider than the mobile viewport, you need a real layout change — not a scale wrapper.**

---

**Lesson 4 — Capping pill buttons doesn't cap the content rows below them.**
When podcast pills were limited to 3 visible, the `visiblePodcasts` variable (which controls which episode groups render) was still computed from the full `podcastNames` array. So the pills said "3 podcasts" but 4 rows rendered below them. These are two separate variables and must both be scoped to the same limit. **Rule: when adding a "show more" pattern to a pills row that controls a content section below it, always trace every downstream variable that determines which content shows — pill count and row count are often computed separately and both need the same gate.**

---

**Lesson 5 — Pure CSS animated underline (`::after width 0→100%`) is more reliable than any JS-measured arc keyframe swap.**
The browse toggle went through three animation implementations: (1) JS-measured arc via `getBoundingClientRect()` + CSS keyframes with `--swap-dx` custom property — visually broke when screen size differed from what was measured. (2) Scale+opacity CSS transition — safe but boring. (3) Gold `::after` underline that animates in — zero JS, zero measurement, can't misfire at any screen size, always looks intentional. **Rule: when a UI toggle just needs to communicate "this one is active," an animated border or underline is almost always the right answer — it requires no measurement and can't break. JS-measured positional animations are a last resort.**

---

**Lesson 6 — When the mobile layout of an absolute-positioned desktop component is "wrong," fix it with a separate mobile layout, not with transform:scale or attempts to override absolute positions.**
Multiple iteration rounds were spent trying to adjust `top`/`left` values and scale factors for the founder photo montage on mobile. Every adjustment broke the desktop layout or created different problems. The clean fix: `display: none` on `.founder-photo-montage` at ≤700px and a completely separate responsive layout (`.founder-mobile-notes`, `.founder-mobile-gym`) inside the text flow. **Rule: for components built with `position: absolute` all the way down, mobile responsiveness requires a separate layout, not overrides. Don't fight the absolute grid — bypass it entirely at the breakpoint.**

---

**Lesson 7 — `playPillSFX()` and any AudioContext call must run in the user gesture frame, not inside a `setTimeout` or `rAF` callback.**
On iOS Safari, `AudioContext.resume()` called inside a `setTimeout` callback (even a 100ms one) is treated as outside the user gesture and can fail or crash. `setCat()` was calling `render()` via `_swapContent()`, which deferred work into a `setTimeout`. Moving `playPillSFX()` before the `_swapContent()` call fixed the iOS audio failure and resolved the intermittent crash. **Rule: all AudioContext operations must be triggered synchronously within the user gesture handler. Never defer them with `setTimeout` or `rAF`.**

---



**What was built:**
- Full audit of `plain` field across 636 concepts (length distribution, worst offenders by era/source)
- `plain-style-guide.md` v2.0, then corrected to v2.2 after live testing
- `plain-batch.js`/`.html` batch rewrite tool (v2.0, then v2.1)
- Deleted 2 entire collections (513, 514 — 42 concepts) for brand-fit/content-quality reasons, not editorial-only
- Manually trimmed 94 over-length plains using a method discovered mid-session
- Synced 4 separate surfaces (extraction prompt, extract.html regen, extract-concepts.js, style guide) to the same final rule set

**Lesson 1 — a rule set is unproven until it's run on real data, not just approved on cherry-picked examples.**
The v2.0 plain rules (200-char ceiling, ban on specific real-world claims) were built from solid audit data and looked correct on the small hand-picked examples used to develop them. The first real batch run exposed a serious, systemic failure: the model defaulted to deleting actual podcast-specific content (a recognizable example like "the wrong pronoun") and replacing it with generic placeholder language ("a slow wifi connection") to satisfy the tight ceiling. This wasn't a prompt-wording bug — it was a structurally wrong rule that conflated two different jobs (extraction of real content vs. translation into plain language) and only optimized for one. **Rule: before locking any new editorial rule set into a pipeline, test it against a real batch — not just a few examples picked to validate the rule's own logic — and specifically check whether the output is doing the job's actual goal (here: accurate extraction), not just passing its own internal checks (here: length/jargon).**

**Lesson 2 — "draft fresh, don't patch" and "trim the weakest sentence, don't rewrite" are different methods for different failure modes, and picking the wrong one produces a different, equally real failure.**
First attempt at a batch rewrite tool (v2.0) used an evaluate-then-patch approach and produced near-zero real change — synonym swaps, punctuation moves, 98% "changed:true" but almost no actual improvement. Rebuilt as v2.1 with a "draft completely fresh, ignore the old text" instruction to force real rewrites. This fixed the synonym-swap problem but created a new one: fresh drafts, written without anchoring on the original's specific content, tended to abstract everything into generic, "boring" language and sometimes drifted into doing analogy's job (painting a scene) instead of plain's job (explaining a mechanism). The method that actually worked, found by testing on real worst-offenders mid-session: **trim-weakest-sentence** — find the single weakest/most redundant sentence in the existing draft and cut it whole, leaving every surviving sentence untouched. This preserves real content by construction (you can only delete, never invent or abstract) and is also a smaller, safer, more reviewable edit than a full redraft. **Rule: when a rewrite pass is producing either (a) no real change or (b) genuinely worse output despite passing the stated rules, the fix is usually the editing *method* (patch vs. fresh-draft vs. trim), not another round of rule-wording tweaks.**

**Lesson 3 — "no specific real-world claims" was the wrong instinct for a product that does extraction, not just synthesis.**
This product has two jobs: extract what was actually said in a podcast (so the specific content has to survive), and translate it into plain language (so jargon/length has to be controlled). A rule written to serve only the second job (no specific claims, keep it generic and timeless) actively destroyed the first job's value. **Rule: before writing a content-suppression rule (ban X from a field), check it against every distinct job that field/product is supposed to do — a rule that's correct for one job can be actively harmful for another job the same field also serves.**

**Lesson 4 — built tooling isn't automatically the adopted method, and that's fine to leave unresolved.**
`plain-batch.js`/`.html` was built, broken, rebuilt, and never actually used for the final 94-concept trim — that was done manually, in-chat, because the trim-weakest-sentence method needed human judgment per sentence (which one is "weakest" is a real editorial call, not yet a fully mechanizable rule) and the volume (94, not 594) was small enough that manual review was faster and safer than re-running and re-debugging the tool a third time. **Note for future-you: the tool exists and is current as of v2.1, but is unproven at scale — if reaching for it again, test on a small batch first rather than assuming the rule-set sync alone makes it reliable.**

**Lesson 5 — files referenced in docs aren't always the files actually in the live pipeline; check the real call path before assuming a sync is complete.**
Two earlier passes synced `extraction-prompt-v1_X.txt` and `extract.html`'s regen prompt to the plain rule set and were treated as "the pipeline is synced." Neither pass touched `extract-concepts.js` — the actual live Vercel endpoint Make.com calls for Automation 1 — which had no plain-field rules at all beyond a placeholder schema comment predating even v2.0. This was only caught because the person asked directly ("don't we need to update extract-concepts.js too?"). **Rule: when asked to "sync the pipeline" or "update all surfaces," explicitly enumerate every file that actually executes in production (not just files that look like prompts/docs) before declaring sync complete — grep for the live API route, not just the reference `.txt` file with a similar name.**

**Lesson 6 — project files can silently disappear from the readable file listing mid-session even after being uploaded; don't assume "not found" means "never existed."**
`collections.json` and `extract.html` both briefly returned "not found" via direct file access mid-session despite having been read/edited earlier in the same session (and, per the person, re-uploaded). `project_knowledge_search` sometimes still returned indexed content for a file that direct `view`/`bash` access couldn't find — the search index and the live file listing aren't perfectly synchronized in real time. **Rule: if a file expected to exist returns "not found," try `project_knowledge_search` as a secondary check before concluding it's missing, but don't treat search-index hits as proof the file is currently readable for editing — confirm with a direct file read before editing or claiming a file's current content as ground truth. When genuinely unable to access a file the person believes they uploaded, say so plainly and ask them to re-upload, rather than silently substituting an old in-memory copy and not flagging the gap.**

**Em-dash ban — reconfirmed, no exceptions, even in approved examples.**
Mid-session, a person-approved example draft contained an em-dash despite the standing ban (carried over from hook/term guides). Caught by cross-referencing the draft against the locked rule rather than assuming approval overrides a hard ban. **Rule: hard-banned punctuation/patterns apply even to examples the person explicitly likes — flag the conflict and ask, don't silently keep the violation or silently "fix" it without checking which one is actually correct.**

---

**What was built:**
- Series of mobile/desktop bug fixes across card flip animation, scan-mode search, scan-mode preview (Library + drawer), search dropdown positioning, scroll-lock, hero pills, theme tile entrance, podcast default
- New component: full-screen mobile concept preview modal (`_spOpenMobilePreview`), replacing the desktop-only floating preview on small screens

**Pattern across this session — fixed once, but only in one of two near-identical code paths, three separate times:**

1. **Scan-mode mobile preview** — Library scan tiles (`.sc-tile`) and drawer scan tiles (`.ep-drawer-scan-tile`) are two separate implementations with separate click handlers built at different times. Fixed the Library one in v1.99j (routed mobile taps to the new full-screen modal); the drawer one kept calling the desktop-only floating preview directly and wasn't caught until the person reported it explicitly in v1.99m.
2. **Card-front vs card-back flip timing** — the "ghost close" bug took two sessions (v1.99i, v1.99j) of fixing only `.card-front`'s visibility-transition delay before the actual root cause was found: `.card-back` had no delay at all, so it vanished at frame zero on close while the front face (now correctly delayed) hadn't appeared yet. Both faces needed the identical symmetric delay — fixing one face's timing without checking its mirror was the recurring mistake.
3. **Search dropdown positioning** — first attempt aligned `left`/`width` to the search bar but then used CSS `max-width` to clamp on overflow, which clips from the right while `left` stays anchored — looked correct in the simple case, broke (top-left-anchored) the moment clamping actually triggered. Second attempt computed the clamp in JS and recentered `left` around the bar's actual midpoint instead of fighting two competing CSS properties.

**Rule: whenever a component has two rendering/interaction paths that look similar (e.g. "the same feature, but inside a drawer" or "the same feature, but in light mode"), grep for ALL call sites of the broken pattern before declaring a fix complete — don't assume a sibling implementation was caught by the same patch.**

**Rule: a flip/toggle animation between two faces (or two states) needs the SAME symmetric timing logic checked on BOTH sides before calling it fixed. Fixing the visible direction's timing and assuming the reverse direction inherits it correctly is the easiest way to half-fix this class of bug.**

**Rule: when clamping a positioned element's size to fit a viewport, never mix a JS-computed `left`/anchor with a CSS `max-width` safety net — the two don't coordinate (`max-width` clips from one side, doesn't recenter). Compute the clamp and the resulting anchor position together, in the same place.**

**Self-inflicted regression caught immediately:**
- A v1.99j fix (`flex-wrap:nowrap` on the hero pill row, to fit 3 pills + a toggle button on one mobile line) forced the row wider than the viewport at realistic phone widths, which forced mobile browsers to auto-zoom-out on page load. Caught and reverted to `flex-wrap:wrap` in the very next session (v1.99k) once the person reported it.
- **Rule: `flex-wrap:nowrap` on any row with text-bearing children is only safe once the *actual* rendered width at the narrowest supported viewport has been calculated (character count × font size × count of items + gaps), not estimated. `wrap` is always the safe default for "make this fit on mobile" — shrink first, only force `nowrap` after confirming the math fits.**

**iOS scroll-lock pattern adopted:**
- Plain `document.body.style.overflow = 'hidden'` / `''` toggling is fragile on iOS Safari when paired with an inner `overflow-y:auto` scrollable element that was itself scrolled — can leave the page stuck unscrollable after close.
- Fixed for the new mobile preview modal using the standard `position:fixed` + saved-`scrollY` lock/restore pattern. Not retrofitted to the other ~7 places in `spark.html` that still use the plain toggle — those weren't reported as broken, and retrofitting unreported code is scope creep. **Flagging for future-you: if scroll-stuck bugs are reported elsewhere (CS panel, episode drawer, theme drawer), this is the fix pattern to reach for, not another `overflow:hidden` patch.**

---

### 2026-06-19 — Hook rewrite v2.0 — style guide built, 149 concepts reviewed, mid-session save failure

**What was built:**
- Hook style guide (`hook-style-guide.md`) — voice blend, format rules, banned patterns, 4 working formats, share test
- 6 review batches across all 14 categories, person picked from 2-3 variations per concept each time
- Running approval log (`hook-approved-batch1.md`) tracking every ID → final hook mapping

**Critical bug — lost approvals between review and file write:**
- **What happened:** Batches 1–5 (76 concepts) were reviewed, approved, and logged to a reference file across multiple conversation turns. When the final `concepts.json` write happened, only the most recent batch (Batch 6, ~39 concepts) was actually applied. The other 75 approved hooks silently reverted to their original text in the delivered file — no error, no warning, file looked complete and was presented as done.
- **Root cause:** the write script only read updates from the in-memory object built in that turn's bash call, not from the cumulative approval log on disk. Each new batch's write call defined its own `updates` object from scratch instead of reading and merging the full running log.
- **How it was caught:** the person spot-checked 3 specific IDs against their own notes after the file was delivered and presented as final. Not caught by any verification step on my end — I did spot-check after writing, but checked IDs from the batch I'd just run, not a sample across all prior batches.
- **Fix:** rebuilt a full cross-reference (every ID + every answer the person gave, verbatim, in order) and diffed it line-by-line against the live file. 75 mismatches found and corrected in one final pass.
- **Rule: when approvals accumulate across multiple turns/batches in a long editorial session, the write step must always read the FULL cumulative approval log from disk, never just the current turn's local object. Verification after writing must sample across ALL batches in the session, not just the most recent one.**
- **Rule: for any multi-session approval workflow (editorial review, batch-based content changes), maintain ONE running source-of-truth file with ID → final-value mapping, append-only, and always re-read it in full before any write-to-production step.**

**Style decisions locked this session (see hook-style-guide.md for full guide):**
- Voice: Dan Koe lead, Hormozi/Naval/Perel/Sahil Bloom secondary
- 8–12 words target, 14-word hard ceiling with rare earned exceptions
- Two-clause hooks only when the second clause reframes or inverts — not when it just continues
- Hyper-specific imagery beats abstraction every time (confirmed by ~40+ explicit approvals: "cold water, heavy weights, hard conversations" over "small dose of stress")
- Sarcastic/funny + specific visual scores highest for shareability — explicit person feedback mid-session to mix tone, not just blunt/harsh
- Metaphor-unlocks-hard-term pattern works well for Latin/scientific concepts (Hormesis, Epigenetic Aging, Nocebo Effect)

---

### 2026-06-17 — v1.98–v1.99h — Library UX overhaul, drawer 3-view, card frame bug blitz

**What was built:**
- Library sort row redesigned: segmented pill group (`Latest | Picks | Mastered`) + standalone `◫` scan icon toggle
- Mastered progress bar animated expand/collapse via `max-height`/`opacity` on `.pb-visible` class (~280ms)
- Save (★) emoji button restored to all card backs; `toggleMaster` updates all DOM instances by id-suffix
- Mobile card flip crash fixed: `toggleCard` 300ms debounce guard
- Drawer 3-view mode (⊟ flip / ◫ scan / ⊞ all) — view icons in `.ep-drawer-filter-row` permanent HTML wrapper
- All-cards view rebuilt from `CONCEPTS` data (not DOM clones); correct 280×370px; matching CSS classes
- Scan + Picks/Mastered filter scoped correctly; `spSetSort` clears scan mode before rendering filtered grid
- CS Stories tab: scroll fixed, `×` delete per entry, Copy + Share buttons on expanded story
- Preview dismiss race resolved definitively
- Emoji icon system: 🔗 ★ 💬 🎧 unified as `btn-icon` 34px squares across all card templates
- Black GPU frame behind tilted cards eliminated
- Streak/editors-pick glow frame eliminated
- Sign Up removed from default nav (remains in hamburger)
- Search result pool scoped to active Picks/Mastered filter

**Key bugs and root causes:**

1. **Black rectangle behind tilted library cards — inconsistent (first 1–2 cards fine, rest broken)**
   - **False leads:** `box-shadow` on `card-front`, `overflow:hidden` on wrapper, `card-inner` background, `rotate(-0.8deg)` tilt, editors-pick glow
   - **True root cause:** `.nf-row { align-items: stretch }`. Card wrapper elements grew taller than defined 370px to fill the row's cross-axis. `card-inner` filled 100% of that stretched height. At `rotate(-0.8deg)`, the GPU compositing layer extended beyond the rounded card-front face corners, exposing the page's dark background as a rectangular frame. First 1–2 cards appeared clean purely by scroll-position geometry.
   - **Fix:** `align-items: flex-start` on `.nf-row`.
   - **Rule: on horizontal scroll rows with 3D-transformed children, always `flex-start` not `stretch`. `stretch` + `preserve-3d` = GPU layer overflow artefact.**

2. **Glow border / frame on some cards (streak + editors-pick)**
   - **Root cause:** `.concept-card.card-streak` had `box-shadow` and `border-color` on the **wrapper** element. Box-shadows on elements with `preserve-3d` children paint in the parent's 2D stacking plane — flat rectangles behind the 3D faces regardless of `backface-visibility`.
   - **Fix:** Moved streak glow to `.concept-card.card-streak .card-front`. Editors-pick glow ring similarly moved to `.card-front`.
   - **Rule: in a 3D flip card, ALL `box-shadow`, `border`, and `background` decoration must live on `.card-front`/`.card-back` face elements — never on the card wrapper or `card-inner`.**

3. **Drawer view icons disappear on second drawer open**
   - **Root cause:** Sort-row DOM node was appended inside `ep-drawer-cat-filter` by JS. On every drawer re-open, `epDrawerCatFilter.innerHTML = ''` destroys the node permanently.
   - **Fix:** `.ep-drawer-filter-row` wrapper div in static HTML — sort-row is a permanent sibling of cat-filter, never wiped.
   - **Rule: never inject permanent UI into a container whose `innerHTML` another function clears. Use a shared parent wrapper.**

4. **Preview dismiss: clicking tile B while tile A is open closes B immediately**
   - **Root cause:** `spDismissPreview()` was called inside the double-rAF (async). Tile B's click was still propagating and reached the newly registered dismiss listener within the 150–200ms guard window.
   - **Fix:** Remove old dismiss listener **synchronously** at the very top of `_spScanPreview()`, before any async work.
   - **Rule: when replacing an event listener triggered by the same click that opens a new one, always remove the old one synchronously — never inside rAF or setTimeout.**

5. **`playVaultSFX` silently erroring, breaking save SFX**
   - **Root cause:** Referenced outer-scope `ctx` and `notes` variables that didn't exist at call time. `try/catch` swallowed the `ReferenceError`. `playVaultRemoveSFX` already used `_getSfxCtx()` correctly — inconsistency.
   - **Fix:** Rewrote `playVaultSFX` to use `_getSfxCtx()` with local `vaultNotes`. Plays rising C5→E5→G5 triad.
   - **Rule: all SFX functions must use `_getSfxCtx()`. Never reference outer-scope `ctx`/`notes`.**

6. **All-cards view (⊞) using DOM clones — wrong fonts and dimensions**
   - **Root cause:** Cloning `.concept-card` from `ep-cat-column` brought source CSS context. Outside `.ep-cat-column`, `.ep-cat-column .back-section-label` etc. no longer applied. Height was 300px not 370px.
   - **Fix:** Rebuild from `CONCEPTS` data using library card HTML template. Full `.ep-drawer-all-cards-wrap` back-face CSS added. 280×370px.
   - **Rule: don't clone cards for alternate views — rebuild from data. Clones carry their original CSS scope.**

**Lessons:**
- **`align-items:stretch` + `preserve-3d` = GPU frame artefact.** Always `flex-start` on rows with 3D-transformed card children.
- **`box-shadow`/`border` on 3D card wrapper paints flat behind the flip.** Decoration on face elements only.
- **`innerHTML=''` destroys appended nodes.** Never inject permanent UI into a container another function clears.
- **Event listener removal must be synchronous.** rAF removal is too late if the triggering click is still propagating.
- **All SFX functions must use `_getSfxCtx()`.** Bare `ctx`/`notes` references silently fail.
- **DOM clones carry their original CSS scope.** Rebuild alternate views from data, not clones.
- **"Inconsistent" visual bugs → look for per-element state, not uniform CSS rules.** Stretch height varied by row; GPU overflow visible at different scroll positions.
- **Debugging 3D compositing artefacts: disable `transform:rotate()` first.** Frame disappears = layer overflow. Then find what makes the layer taller than the face.

---

### 2026-06-15 — v1.96–v1.97c — Reading Mode, Story Seeds, typewriter, scan fixes

**1. `const` in the same script block below a call site = TDZ crash at runtime, not parse time.**
`SP_STORY_SEEDS` was declared as `const` at line 11729. `spScenarioPill()` is at line 10234. Because `const` is not hoisted, any call to `spScenarioPill` before line 11729 executed threw `ReferenceError: Cannot access 'SP_STORY_SEEDS' before initialization`. The error was silent in the console until the button was clicked. Fix: change `const` → `var`. `var` is hoisted as `undefined`; by the time the user clicks the pill, the assignment has executed. **Rule: for shared data objects in large single-file apps, use `var` not `const`/`let` if there's any chance they're referenced from functions declared earlier in the same block.**

**2. querySelectorAll attribute selector with dynamic value must use template literal, not string concatenation.**
`document.querySelectorAll('.sp-pill[onclick*="\'"+scenario+"\'"]')` — the concatenation `"\'"+scenario+"\'"` is evaluated as a literal string in the selector, not as the variable value. The selector string passed to `querySelectorAll` is fixed at parse time. Fix: `` document.querySelectorAll(`.sp-pill[onclick*="'${scenario}'"]`) ``. Wrap in try/catch in case the scenario value contains characters that break the CSS selector syntax. **Rule: dynamic CSS selectors always need template literals. String concatenation inside the selector string is a common mistake that produces no error, just no results.**

**3. Card-back `box-shadow` bleeds through parent tilt gap even with `backface-visibility:hidden`.**
Moving card tilt from `.card-front` to `.card-inner` (so both faces tilt together) still showed a dark frame at the bottom edge. Root cause: `.card-back` had `box-shadow: 0 4px 12px rgba(0,0,0,0.45)`. At `-0.8deg` rotation, the shadow painted behind the front face's lower edge. Fix: `visibility:hidden` on card-back by default (suppresses all painting including shadow), `visibility:visible` only on `.open`. **Rule: for 3D flip cards, set `visibility:hidden` on the non-visible face to prevent any paint from bleeding through the tilt gap. `backface-visibility:hidden` only hides the face itself, not its box-shadow.**

**4. Event delegation vs per-element listeners: 600+ listeners causes scroll lag on scan mode.**
When scan mode injected ~600 tiles each with their own `addEventListener('click')`, toggling scan became slow and hovering over the grid added compositor pressure. Fix: single delegated `click` listener on `#netflixRows` using `e.target.closest('.sc-tile')`. Store it on `grid._scanDelegate` so it can be removed on scan exit. **Rule: for dynamically rendered lists of 50+ items, always use event delegation. Per-item listeners add memory and GC pressure, especially when the list rebuilds frequently.**

**5. Hundreds of simultaneous `animation: X infinite` on different elements = scroll compositor hell.**
`.card-flip-hint-dot.pulse` was assigned `animation: hintDotBreathe 2s ease-in-out infinite` and rendered on every unvisited card (potentially 500+). Each infinite animation creates a compositor obligation per frame. Fix: removed the animation; dot renders as a static accent colour. **Rule: `infinite` CSS animations on more than ~10 simultaneous elements degrade scroll performance. Prefer static styles or IntersectionObserver-triggered one-shot animations.**

**6. Typewriter implementation: `break` before `label` creates an empty paragraph.**
Story text format: `paragraph\n\n[[LABEL:Term]]\n\nparagraph`. The tokenizer emits: `chars` → `break` → `label` → `break` → `chars`. The first `break` creates a new `<p>`, then the label appears in that empty `<p>` alone, producing a label on its own line between paragraphs. Fix: in the `break` handler, peek at `tokens[i]` — if the next token is `label`, skip creating a new paragraph. In the `label` handler, consume the following `break` and create the new paragraph after the label. **Rule: when tokenising markup for streaming renders, always handle adjacent-token interactions (break+label, bold+end) as pairs, not independently.**

**7. `overflow:hidden` on `.conv-panel` clips child `overflow-y:auto` scroll containers.**
Stories and History tabs had `overflow-y:auto` on their section divs but scrolling propagated to the page. The parent `conv-panel` had `overflow:hidden` which clips all descendant scroll. Fix: add `overscroll-behavior:contain` and `-webkit-overflow-scrolling:touch` on the individual section elements — this tells the browser each section manages its own scroll chain. **Rule: `overflow:hidden` on a parent does not prevent child scroll containers from working, but it can interfere with `overscroll-behavior`. Always add `overscroll-behavior:contain` on child scroll areas inside `overflow:hidden` parents.**

**8. Typewriter speed calibration: 14ms base + 20ms jitter = ~24ms avg = 25s for 1000 chars.**
A 200-word story is ~1100 chars including spaces, punctuation, and markup. At 24ms avg = ~26s. Target was 5-7s. Fix: `speed:4 + jitter:6` = avg ~7ms/char = ~8s for 1100 chars. Closer to 6-7s for the actual readable text portion. **Rule: for typewriter effects on full paragraphs, calibrate against actual character count of the content. 200 words ≈ 1100 chars; at 6ms avg = 6.6s target achieved.**

---

### 2026-06-15 — v1.93–v1.95 — Performance pass: light mode, drawer, animations


**What was fixed:** Light mode lag (INP 288–320ms, presentation delay 198–284ms), drawer open lag, category switch delay (~1s), jumpy hero load on hard refresh, laggy nav hover in light mode.

**Root causes and lessons:**

1. **`backdrop-filter` on a parent creates a stacking context that taxes ALL child transitions.** `[data-theme="light"] nav` had `backdrop-filter: blur(8px)`. The nav bg was `rgba(245,240,232,0.97)` — 97% opaque, so the blur was invisible. But it forced every hover transition inside the nav (emoji reveal, epic pill expand, CS panel buttons) to recomposite the blur per frame. This is why light mode nav hover was slow while dark mode was instant — dark mode has no `backdrop-filter` on nav. **Rule:** never add `backdrop-filter` to a container with active child transitions unless the blur is visually essential. Even an invisible blur creates a compositor bottleneck.

2. **`background-attachment: fixed` forces full-page repaint on every scroll tick.** The `body::after` editorial hairlines overlay used `background-attachment: fixed`. Since the element itself is `position:fixed`, the visual result with `background-attachment: scroll` is identical — the bg just doesn't move relative to the element, which also doesn't move. **Rule:** `position:fixed` elements don't need `background-attachment:fixed`. It's a scroll-repaint trap with no visual payoff on fixed elements.

3. **Inline SVG with `feTurbulence` or `feGaussianBlur` in `background-image` is CPU-rendered, not GPU.** Two separate SVG filters were causing light-mode paint cost: (a) `feTurbulence` noise on `body` background-image, (b) `feGaussianBlur stdDeviation="14"` in the episode drawer hero bg. Both rendered on every paint frame. Fix for (a): remove (at 3.5% opacity it was imperceptible). Fix for (b): replace with CSS `radial-gradient` layers — same soft blob visual, zero filter cost. **Rule:** SVG filters in `background-image` are never GPU-composited. For blobs/glows/noise, use CSS gradients + `opacity` instead.

4. **CSS `filter: brightness/saturate` on hundreds of elements creates a compositor layer per element.** Was applied to `.cat-card`, `.card-cat`, and quiz pills in light mode. With a full concept grid, this meant hundreds of promoted layers. Fix: `color-mix()` on the same CSS variable — zero layer promotion. **Rule:** `filter:` (not `backdrop-filter:`) also promotes elements to compositor layers. On large lists, replace with `color-mix()`, `opacity`, or hardcoded values.

5. **`display:none` ↔ `display:grid` toggle kills CSS keyframe animations.** `ep-cat-column` was hidden via `display:none`, then set to `display:grid` and a CSS animation class was added simultaneously. The browser skips animations on elements transitioning from `display:none` in the same frame. The `style.animation='none'; rAF(() => style.animation='')` trick partially worked but caused the previous `position:absolute`/`max-height:0` layout hack. Fix: keep `display:none` as default, add `.visible` class for `display:grid`, then add `.animating` in a **separate** `rAF` — two distinct frames. **Rule:** for `display:none` → animate: set display in one frame, add animation class in the next `rAF`. These must be two separate operations.

6. **`overflow:hidden` on a large fixed-position drawer forces compositor clip on every repaint.** `.ep-drawer` had `overflow:hidden` to clip the hero bg image at the rounded corners. But `overflow:hidden` on a `position:fixed` full-viewport element means the browser clips all child content on every repaint frame. Fix: move `overflow:hidden` + `border-radius` to `.ep-drawer-hero` (the only child that needs the clip). The drawer body itself gets no overflow clip — nothing bleeds past the hero. **Rule:** `overflow:hidden` on large compositor targets is expensive. Scope it to the smallest element that actually needs clipping.

7. **`ep-preload` body guard prevents hero/episodes load-order flash.** On hard refresh, `buildEpisodes()` renders synchronously while the hero section has a CSS fade-in animation — so episodes appear before the hero finishes painting. Fix: add `html.ep-preload` via inline script (before first paint), hide hero + episodes sections to `opacity:0`, remove after double-`rAF` post-`render()` with `0.22s` fade-in. **Rule:** for elements with load-order paint races, use a body/html class set in the inline script block (before any CSS is applied) to blank everything, then remove it after the first real render.

8. **Native `placeholder` attribute changes are hard-cuts with no transition.** Cycling placeholder text via `_phInput.placeholder = newText` produces a jarring instant swap. Fix: hide native placeholder (`_phInput.placeholder = ''`), show a `<span>` overlay in the same visual position, toggle `opacity` on it. **Rule:** for animated placeholder cycling, always use a sibling overlay element — native placeholder is not animatable.

---

### 2026-06-14 — v1.89–v1.92b — Mobile overhaul, search prefixes, engagement mechanics, light-mode

**Key bugs / lessons:**

1. **Inline `style` overrides CSS class every time.** `spPillsRow2` had `style="max-height:0;overflow:hidden;"` in HTML; adding `.open` in CSS had zero effect. Fix: remove inline style, let CSS class fully control it. **Lesson:** never set initial state via inline style if a CSS class will need to override it later — CSS class specificity cannot beat inline style without `!important`.

2. **`position:absolute` expand-row inside `overflow:hidden` parent = invisible.** Desktop `sp-pills-row2` (absolute) was clipped by `.sp-hero { overflow:hidden }`. Fix: `overflow:visible` on `.sp-hero`. **Lesson:** `overflow:hidden` clips ALL descendants in the stacking context, including absolute children, unless they escape via a higher ancestor.

3. **`MutationObserver` on a large subtree with frequent class changes = mobile freeze.** Watching `#netflixRows` with `{ subtree:true, attributes:true }` fires on every card class mutation (hundreds of cards). Fix: removed the observer; apply streak glow inline inside the IntersectionObserver callback instead. **Lesson:** never use `MutationObserver` with `subtree:true` on large dynamic lists — it fires thousands of callbacks. Prefer an event-driven counter inside the existing observer.

4. **Card `rotate(-0.8deg)` tilt breaks touch hit-testing on mobile.** A rotated bounding box doesn't match the visible card boundary, so browser touch dispatch misses the card's visual area. Fix: `@media (hover:none) { transform: none !important }`. **Lesson:** any non-zero rotation on a tappable element on mobile requires testing touch targets carefully — even 0.8° is enough to cause missed taps near edges.

5. **`initDragScroll()` mouse drag handler intercepts touch scroll.** The `mousedown`/`mousemove` drag scroll was competing with native touch scroll, causing jank and missed scrolls on mobile. Fix: early return on `'ontouchstart' in window || navigator.maxTouchPoints > 0`. **Lesson:** mouse drag scroll handlers should always bail on touch devices — native momentum scroll is better than any JS replacement.

6. **IntersectionObserver at 55% threshold fires while scrolling past cards in horizontal rows.** Cards in `.nf-row` (horizontal scroll) were being marked `card-read` just by scrolling past — they were ≥55% in the viewport even though the user was swiping horizontally. The threshold is viewport-relative, not row-relative. Fix: moved the "concepts explored" count to `toggleCard` (flip event) instead — unambiguous user intent. **Lesson:** IntersectionObserver is great for vertical scroll tracking but unreliable for horizontal carousels where partial horizontal visibility can equal full viewport intersection.

7. **`body::after` fixed SVG watermark needs `z-index:0` — not `z-index:-1`.** `z-index:-1` causes the layer to go behind the `background-color` of `<body>` itself, making it invisible. `z-index:0` with `pointer-events:none` keeps it above the background but below all content. **Lesson:** for decorative overlays meant to be visible but non-interactive, `z-index:0` + `pointer-events:none` is the correct pattern; `z-index:-1` goes below background.

8. **SVG `<text>` elements inside `url(data:image/svg+xml,...)` must percent-encode special chars but NOT double-encode.** Apostrophes, slashes, and hash chars in SVG inline data URIs need `%27`, `%2F`, `%23` — but if the whole URL is already inside CSS `url("")`, only encode what would break the URL parser. Test in both Chrome and Safari. **Lesson:** for inline SVG data URIs in CSS, encode `#` → `%23`, `'` → `%27`, and `<`/`>` → `%3C`/`%3E`; leave spaces as `%20`; avoid double-encoding.

9. **SpeechSynthesis voices vary wildly by OS/browser — no safe "good" default.** Built, tested, removed. Even named OS voices (Daniel, Karen) sound robotic on some devices and natural on others. The picker UX was fine but the audio quality was inconsistent enough to feel like AI slop. **Lesson:** browser TTS is fine for accessibility but not for a product experience where voice quality is part of the brand impression. If this is ever revisited, use ElevenLabs or similar with a pre-rendered audio file per opener.

10. **`sessionStorage` one-shot for animations = plays once then never again in same tab.** The typewriter effect used `sessionStorage` and never replayed even on hard refresh (same tab = same session). Fix: `localStorage` with a 2-hour timestamp cooldown — plays on every new session + after 2 hours. **Lesson:** for "plays once per visit but still plays on fresh loads" patterns, use `localStorage` timestamp diff, not `sessionStorage` existence check.

---

### 2026-06-13 — v1.81–v1.88 — Theme browsing overhaul, drawer redesign, SFX pass

**What was built:** see changelog v1.81–v1.88 entry for full feature list
(theme preview redesign, drawer hero redesign, generative episode bg, SFX
rationalization, multiple UX polish items).

**Key bugs / lessons:**

1. **Outside-click handlers must exclude `document.body`-appended floating
   elements.** `.cs-term-popup` is appended to `<body>`, not `#convPanel`,
   so the panel's outside-click-to-close handler treated clicks on it as
   "outside" and closed the whole panel. **Fix:** explicitly
   `e.target.closest('.cs-term-popup')` early-return in the handler. **Lesson:**
   any floating/teleported element (popups, tooltips appended to body) needs
   an explicit exception in ancestor outside-click handlers — `.contains()`
   checks don't see it.

2. **CSS Grid auto-placement reflows ALL items when inserting a
   `grid-column: 1/-1` element mid-sequence.** Inserting a full-width
   "preview zone" as a DOM sibling between grid items 1 and 2 pushed items
   2+3 (and everything after) into new rows — even though they were already
   placed. **Fix:** restructure into per-row containers (`.themes-row`, each
   its own 3-col grid) with a preview-zone slot *after* each row container,
   outside any shared grid. **Lesson:** never mix a full-width expand/collapse
   element into the same grid as the items it relates to — give it its own
   row-level container.

3. **A single long `transition` on a transform property covers ALL transform
   changes, including ones that should feel instant.** `.ep-cat-column
   .concept-card { transition: transform 0.4s }` was meant for the open/flip
   animation but also applied to the hover-lift (`translateY(-4px)`), making
   every hover feel ~0.4s sluggish. **Fix:** split into `:not(.open)` (0.15s,
   hover) and `.open` (0.4s, flip) variants. **Lesson:** when a transform
   serves two purposes (a quick micro-interaction AND a bigger state change),
   give them separate transition rules gated by a state class — don't share
   one duration.

4. **A drag-handle (or any decorative element) placed in normal flow BEFORE
   a full-bleed hero image creates a visible gap/strip above the image.**
   The `.ep-drawer-handle` rendered on `var(--surface)` above
   `.ep-drawer-hero`, creating a dark bar that clipped the top of the hero
   image. **Fix:** move it inside the hero as an `position:absolute` overlay.
   **Lesson:** any "frame" element (handles, badges, close buttons) that
   should sit "on top of" a hero image must be a child/overlay of that hero,
   not a preceding sibling — preceding siblings in flow always eat space
   above the image.

5. **SFX fatigue is real — reuse cadence/shape but vary pitch/timbre per
   context.** Multiple click handlers calling the same pop-SFX back-to-back
   (category pill → theme tile → preview cards) felt repetitive. **Fix:**
   kept the "N pops, ~80ms apart" cadence as the site's signature rhythm, but
   gave each context its own pitch range/oscillator type (sine vs lower sine,
   8 vs 3 pops, different base frequencies). **Lesson:** for a cohesive-but-
   non-repetitive SFX palette, vary pitch/timbre/count, not the underlying
   rhythm — the rhythm is the "brand," the pitch is the "instance."

6. **`_csSaveStory` must receive the real concept object, not a partial
   `{id: 0, ...}` stub** — `conceptIds[0] = 0` broke `CONCEPTS.find()` for
   the first pill of every saved story. **Fix:** pass `pickerConcepts[0]`
   directly; added a term-match fallback for legacy saved entries (can't
   retroactively fix user's localStorage).

---

### 2026-06-12 — v1.79 + v1.80 — Themes feature (Collections row → grid) + image deploy

**What was built:**
- v1.79: Themes pill row (16 thematic collections, 101–116) between
  scenario pills and episodes, 3-card flip preview + full drawer
  (reusing `.ep-cat-column`/`.ep-drawer` CSS verbatim)
- v1.79: Disabled CS modal auto-open/auto-generate on page load —
  testing-phase cost control
- v1.79: Fixed term+hook vertical centering across all card contexts
  (Library, episode drawer, theme preview/drawer) via
  `margin-top:auto` on `.card-term` + `margin-bottom:auto` on
  `.card-hook`
- v1.80: Rebuilt Themes as "By Episode / By Theme" toggle + 3×3 image
  grid with category filter pills; generated and deployed 16 AI theme
  images to `/images/themes/`

**Key bugs / challenges:**

1. **Flexbox centering between two fixed-position siblings**
   - Goal: center `card-term` + `card-hook` as a group between
     `card-meta` (top) and `card-flip-hint`/bottom (which may or may
     not be in flex flow depending on context).
   - **Fix:** `card-term { margin-top: auto }` + `card-hook {
     margin-bottom: auto }`. The two auto-margins on opposite ends of
     the pair push them into the center of remaining space, regardless
     of whether a third flex item exists below.
   - **Gotcha:** Don't add `margin-top:auto` to the element AFTER the
     pair (e.g. flip-hint) — multiple auto-margins on the same axis
     split space unpredictably across all of them, not just the
     intended pair.

2. **CSS containment (`contain: layout paint`) clips hover-lift
   animations**
   - Preview cards wrapped in `.ep-cat-column` inherited `contain:
     layout paint` from that class, which clipped the `translateY(-4px)`
     hover-lift at the container's top edge.
   - **Fix:** `.theme-preview-col { contain: none !important; overflow:
     visible !important }` and removed `contain`/`overflow:hidden`
     from `#themePreviewZone.open`.
   - **Lesson:** Any time a hover/open animation moves an element
     outside its box (translate, scale), check ancestors for `contain`,
     `overflow: hidden`, AND `max-height` transitions with `overflow:
     hidden` — all three independently clip.

3. **Scenario pills "More" recentering the hero**
   - `.sp-pills-row2.open` (max-height expand) increased
     `.sp-hero-col`'s content height. Since `.sp-hero` is `align-items:
     center` with `min-height: 70vh`, the whole flex column (including
     hero copy + search bar above the pills) shifted position when row2
     opened/closed.
   - **Fix:** `.sp-pills-row2` → `position: absolute; top: 100%` —
     removes it from the flow entirely, overlays below row1 without
     affecting parent height.
   - **Lesson:** Any expand/collapse inside a vertically-centered flex
     container will shift ALL siblings, not just push content below it.
     `position: absolute` is the simplest fix when the expanding element
     doesn't need to reserve space.

4. **GitHub web-upload "slash trick" for creating nested folders failed**
   - Attempted to create `images/themes/` by naming a single uploaded
     file `images/themes/theme-101.jpg` (relying on GitHub interpreting
     slashes as path separators during drag-upload). Instead it created
     a literal file named `images:themes:theme-101.jpg` inside a folder
     called `themes` at repo root — GitHub replaced `/` with `:` in the
     filename rather than splitting into directories.
   - **Fix:** Use "Add file → Create new file", type the full path
     `images/themes/.gitkeep` in the filename field — THIS correctly
     creates nested folders. Then upload real files into the now-existing
     folder normally.
   - **Lesson:** The "type a path with slashes" trick only works in the
     "Create new file" filename field, NOT in the drag-and-drop multi-file
     uploader.

5. **Deployed image 404s despite correct repo path + correct Vercel
   config + correct deployment**
   - File was correctly at `images/themes/theme-101.jpg` in `main`,
     deployment was live/Production, `vercel.json` had no
     output-directory override (Framework: Other). Direct URL to the
     image on both apex (`epistemic.live`) and `www` worked in
     incognito. But the LIVE PAGE's own `<img>` request to the identical
     URL still 404'd.
   - **Root cause:** A stale **service worker** was intercepting `<img>`
     fetches and serving a cached 404 response from before the images
     existed — top-level navigations bypassed it, but resource requests
     made by the already-loaded page did not.
   - **Fix:** DevTools → Application tab → Service Workers → Unregister,
     then Application → Storage → "Clear site data", then hard refresh.
   - **Lesson:** When a direct URL works but the SAME URL 404s when
     requested BY the page itself, suspect a service worker before
     suspecting CDN/edge cache. CDN purge ("All content" /
     "CDN+ISR+Image") does NOT clear a browser-side service worker
     cache — these are two completely separate cache layers and both
     may need clearing.

**Lessons:**
- Image uploads to Claude cost effectively zero tokens when handled via
  bash (move/rename only) — vision/analysis is what costs tokens, not
  file transfer. Useful to know for future asset-heavy sessions.
- When debugging "works directly but not from the page," always check
  service workers — this is now a standard checkpoint before blaming
  CDN/edge cache.

---

### 2026-06-12 — Collection curation pass + reusable tooling

**What was built:**
- AI-curated `curated_collection_ids` for all 636 concepts against the 16
  themed collections (101–116)
- Two reusable browser-based tools added to repo root: `curate-batch.html`
  (+ `api/curate-batch.js`) for running curation batches, and
  `merge-collections.html` for dry-run/commit merging a patch into
  `concepts.json`
- Two new spec docs written for next sessions: `collections-row-spec.md`
  (UI build) and `feynman-rewrite-spec.md` (editorial quality pass)

**Failed approaches (don't repeat these):**
1. **Embedding all concepts in a single HTML artifact + calling Anthropic
   API directly from the browser** — fails with CORS ("Failed to fetch").
   `api.anthropic.com` does not allow direct browser calls from arbitrary
   origins.
2. **HTML page fetching `concepts.json` live from `epistemic.live`** — also
   fails CORS; the site doesn't set permissive cross-origin headers for its
   own JSON.
3. **Large batches (100–150 concepts) via a Vercel serverless function on
   the Hobby plan** — hits the hard **10-second function timeout**
   (`maxDuration` is ignored on Hobby). Confirmed via Vercel function logs.

**Final working solution:**
- Serverless function (`api/curate-batch.js`) on the existing
  `ANTHROPIC_API_KEY` env var, same pattern as `cs-generate.js`
- **Batches of 25 concepts**, each well under 10s
- Robust JSON cleanup server-side: strip markdown fences, fix trailing
  commas, extract the array even if the model adds stray text around it
- Client-side localStorage resume + retry-on-failure (3 attempts) + pause
- Merge step is a separate browser-only tool that does dry-run preview
  before any GitHub commit

**Lessons:**
- **Vercel Hobby plan = 10s hard function timeout, full stop.** `maxDuration`
  in the function config only takes effect on Pro. Any future serverless
  tool must keep individual calls well under 10s — batch small.
- **Claude's JSON output sometimes has trailing commas** (`...], ]` /
  `...}, }`) — always sanitize with a regex (`,(\s*[\]}])` → `$1`) before
  `JSON.parse` on any structured-output endpoint.
- **CORS blocks both directions** for browser-based AI tooling: can't call
  Anthropic directly from a static page, and can't fetch your own site's
  JSON cross-origin either. Serverless functions on your own domain are the
  only reliable bridge.
- **One-time admin/curation tools should still be built reusable** — same
  20-30 minutes of effort, but saves a full rebuild next time the same job
  needs doing (e.g. re-curating after new concepts are added).
- **For large one-time JSON edits, build a tiny dedicated merge tool with a
  mandatory dry-run step** rather than editing `concepts.json` by hand or
  asking Claude to hold the full file in context — keeps diffs auditable
  and avoids burning context budget on mechanical merges.

---

### 2026-06-10 — v1.76a–v1.76e — spark.html new page build session

**What was built:**
- `spark.html` branched from `v172.html` at v1.75b (Phases A → C3 + polish)
- New hero zone: tagline, Fuse.js search bar, scenario pills, floating preview card
- CS Panel migrated from full-viewport modal to right-sidebar inside unified `conv-panel`
- Unified panel: Spark / Stash / History tabs in one right-sliding panel
- Nav: Spark restored, Library + Collection with emoji hover reveal
- Dropdown redesign: term-first ranking, split click (preview vs CS), pills right-aligned
- Scenario pill hover highlight; More button distinct (dashed)
- SFX: 8 pops × 55ms × 60ms tail; candidate stamp 3-pop SFX
- Episode search: value/focus preserved across re-renders

**Key bugs encountered and fixed:**

1. **`position:fixed` children trapped inside stacking context ancestor**
   - `conv-overlay` has `z-index: 1100` — this creates a stacking context. Any `position:fixed` descendant is painted within that context, capped at the ancestor's z-order regardless of its own z-index. The `?` help bubble was `position:fixed; z-index:1200` but still rendered behind the panel left border.
   - **Fix:** Teleport `#csHelpBubble` to `<body>` using `document.body.appendChild(bubble)` inside `_wireCSEvents()`. Once it's a direct child of `<body>` (outside all stacking contexts), `z-index:99999` works as expected. Show/hide via JS `mouseenter`/`mouseleave` adding `.cs-help-bubble--visible` class.
   - **Lesson:** `position:fixed` does NOT escape a stacking context created by an ancestor with `z-index` + `position`. To truly float above everything, the element must be a direct or near-direct child of `<body>`. Teleport it there via JS. This applies to any tooltip, dropdown, or popover inside a modal or panel.

2. **`overflow:hidden` on a parent clips `position:absolute` dropdowns**
   - `.sp-hero` had `overflow:hidden`. The search dropdown was `position:absolute` relative to the search wrap inside the hero. The hero clipped it visually after a certain scroll depth, and when the hero had content below it the dropdown pushed the page content down.
   - **Fix:** Make dropdown `position:fixed`, JS-positioned via `getBoundingClientRect` on the search wrap in `_spShowResults()`. Now completely independent of any ancestor overflow.
   - **Lesson:** Any dropdown that needs to escape an `overflow:hidden` parent must use `position:fixed` + JS coordinates, NOT `position:absolute`. The parent's overflow will always clip absolute children.

3. **`buildEpisodes()` re-renders `row.innerHTML` on every `oninput`, destroying input focus**
   - The episode search input had `oninput="buildEpisodes()"`. `buildEpisodes()` rebuilds the entire pills+search row HTML, replacing the input with a new DOM node. The new node has no focus and no value. Typing a single character works; the second character goes nowhere.
   - **Fix:** Before `row.innerHTML = ...`, capture `prevVal = searchInput.value` and `prevFocused = document.activeElement === searchInput`. After the re-render, restore `newSearch.value = prevVal` and call `newSearch.focus()` if previously focused.
   - **Lesson:** Any input whose `oninput` causes the entire container to re-render via `innerHTML` will lose focus and value. Either (a) move the input outside the re-rendered zone, or (b) capture + restore value+focus after each re-render.

4. **`conv-overlay` stacking context also traps `position:fixed` preview card (potential)**
   - Discovered when implementing the floating preview card: if it's a child of any element with a CSS stacking context, `position:fixed` coordinates are relative to that context's viewport, not the real viewport.
   - **Fix (preventive):** `#spPreviewCard` was placed inside `.sp-hero`, which does NOT have a stacking context (no `z-index` set). Kept it there. If it ever needs to escape, same teleport-to-body pattern applies.
   - **Lesson:** Before placing any `position:fixed` floating UI, verify the ancestor chain has no stacking context. Check for: `z-index` + `position: relative/absolute/fixed`, `transform`, `filter`, `opacity < 1`, `isolation: isolate`.

5. **`max-height` transition on `overflow:hidden` container clips `padding-top` gap**
   - Scenario pill row 2 (`spPillsRow2`) used `margin-top` on the `.open` state but had `overflow:hidden`. Margins are outside the content box — a collapsed `overflow:hidden` element clips margin but not padding. Adding `margin-top:8px` had no visual effect; pills still overlapped row 1.
   - **Fix:** Changed `margin-top` to `padding-top: 8px` on the `.open` state. Padding is inside the content box and renders within `overflow:hidden`.
   - **Lesson:** Inside `overflow:hidden` elements, use `padding` not `margin` for internal spacing that should be visible during `max-height` transitions.

6. **Duplicate CSS blocks for the same element caused silent rule conflicts**
   - `cs-help-bubble` had two CSS blocks in the file: one at ~line 2420 (correct, `position:fixed`) and one at ~line 2913 (stale, `position:absolute`). The later one overwrote the earlier with `position:absolute`, undoing the fix. No browser warning; silent override.
   - **Fix:** Remove the stale block. Check with `grep -n '\.cs-help-bubble {'` before assuming a rule is active.
   - **Lesson:** Always grep for duplicate rule blocks when a CSS fix appears to do nothing. Later rules in the cascade silently override earlier ones. Single source of truth for each component's CSS.



**What was built:**
- SVG hairline endpoint fix (lines no longer overlap buttons)
- Action row border-top divider
- Bubble pop SFX on Change Topic open (bypasses SFX_ENABLED)
- Picker loading messages synced to per-scenario pool
- Coral badge scoped to session only (no cross-session bleed)
- Scenario button hover delay eliminated
- Coaching restore fixed after Change Topic → back (and Surprise me, and Use this instead)
- SFX extended to ~0.85s

**Key bugs encountered and fixed:**

1. **`transition-delay` from appear animation persisted on hover**
   - `.btns-visible .cs-ctx-btn:nth-child(n)` sets `transition-delay: 0.38–0.50s` for the staggered appear animation. CSS does not distinguish between animation delay and interaction delay — ALL transitions on the element inherit this delay, including hover color. Result: hovering a scenario button waited up to 500ms before turning yellow.
   - **Fix:** New `.btns-settled` class added via `setTimeout(700ms)` after `.btns-visible` — sets `transition-delay: 0s !important`. Class is removed on section close so re-open animates fresh.
   - **Lesson:** `transition-delay` on nth-child stagger rules is permanent on the element unless explicitly cleared. Always zero it after the animation window closes.

2. **`_csPickerHideMain` sets inline `display:none` — `_csPickerShowMain` only cleared 3 of 6 elements**
   - `_csPickerHideMain` sets `el.style.display = 'none'` on 6 elements: pill, block, coaching, divider, feedback, genRow. `_csPickerShowMain` only cleared `style.display` on pill, src, block. The other 3 (coaching, divider, feedback) kept their inline `display:none`. Then `_applyAIToCtx` populated the coaching text and `_csShowPostPrompt` added `cs-visible` — but inline `style.display:none` always beats any CSS class, so coaching never appeared. This bug affected: Change Topic → back, Surprise me (if picker had been opened first), and Use this instead.
   - **Fix:** `_csPickerShowMain()` now clears `style.display` on all 6 elements before calling `_applyAIToCtx`. Same inline-display clear added at entry of `_csSurprise()` and `_csSwapConcept()` as defensive reset.
   - **Lesson:** When using inline `style.display = 'none'` to hide elements, you MUST clear `style.display = ''` before trying to show them again via CSS classes. CSS class visibility rules (`opacity`, `display` via class) cannot override an inline style. If hide uses inline style, show must also explicitly clear it.

3. **SVG endpoint `ty = H - 2` put lines at container bottom, not at buttons**
   - The wrap height grew with `padding-top: 48px` but `H - 2` = bottom of the SVG = bottom of the wrap = below the button row. Buttons were at the bottom of normal flow but SVG lines ended at the very bottom of the container (which was lower still after the padding increase).
   - **Fix:** Changed `ty` to `br.top - svgRect.top` — measures the actual top edge of each button relative to the SVG coordinate space.
   - **Lesson:** For "lines should arrive at buttons" SVG layouts, always measure the button's actual rect position relative to the SVG; don't try to infer it from container height.



**What was built:**
- Auto-save all prompts to Stash on generate; Save button retired; per-scenario ✕ remove
- Change Topic picker: category pills → 3 candidate cards → generate inside card → full prompt+coaching in card
- Stamp animation for category pills and candidate cards; SVG hairline branch for Change Scenario
- Stash ↔ CS modal full sync; badge bleed fix; coaching restore on picker close; History tab restore fix
- JS-measured SVG bezier curves originating from Change Scenario button center

**Key bugs encountered and fixed:**

1. **`getBoundingClientRect` returns 0,0 after `buildGrid()` sets innerHTML**
   - `setTimeout(80ms)` was not enough — layout hadn't happened yet when `getBoundingClientRect` ran. Card coordinates were wrong so `scrollBy` went to wrong place; `toggleCard` fired on an off-screen card.
   - **Fix:** Triple-rAF chain — two frames let innerHTML paint + layout, third rAF reads accurate rect; then `scrollIntoView({behavior:'instant'})` snaps the row scroll, then `window.scrollBy` with panel offset centers it.
   - **Lesson:** After setting `innerHTML`, always use at least two `requestAnimationFrame` before measuring positions. `setTimeout` is unreliable for layout timing.

2. **`grid-template-rows: 0fr` accordion breaks inside `display:none` containers**
   - Candidate cards were inside `#csTopicPickerWrap { display:none }`. When the wrap switched to `display:block`, `grid-template-rows: 0fr` computed incorrectly — `min-height:0` on the inner element didn't work until after a full layout pass. Collapsed cards leaked their content.
   - **Fix:** Replace `grid-template-rows` accordion with `max-height: 0 → 600px` — more robust in this context.
   - **Lesson:** `grid-template-rows: 0fr` accordion requires the element to be in a laid-out context. When the parent starts as `display:none`, the grid calculation fails on first show. Use `max-height` transition instead for safety.

3. **`_csPickerCommit` preserved previous concept's `_csAIData` causing badge bleed**
   - When committing a picker concept, `if (!_csAIData) _csAIData = {}` preserved old scenarios from the previous concept. Switching to a new concept immediately showed coral `has-prompt` badges for scenarios that were never generated for the new concept.
   - **Fix:** Always `_csAIData = {}` (fresh object) in `_csPickerCommit` and `_csLoadNewConcept`. Immediately clear all `has-prompt` badge classes before `_csUpdateScenarioBadges()` re-applies correct ones.
   - **Lesson:** Any function that commits a new concept must zero `_csAIData` completely. Merging preserves contamination from the previous concept.

4. **`_convOpenCSById` (History → Start talking) called `_wireCSEvents()` before restore**
   - `_wireCSEvents()` calls `_csHidePostPrompt()` synchronously — this nuked the coaching/prompt display state. Then `_csRestoreOrLoad` fired `_applyAIToCtx` at 200ms. But some intermediate call re-hid coaching, leaving only the prompt text visible without the coaching block.
   - **Fix:** Remove `_wireCSEvents()` from `_convOpenCSById`. It should only be called once on page init — it's an event-wiring function, not a reset function.
   - **Lesson:** `_wireCSEvents()` is a one-time init function. Never call it on subsequent modal opens — it re-hides everything and re-wires already-wired events (potential double-listener bug).

5. **JS-measured SVG: `svgRect.width === 0` when section just opened**
   - First `requestAnimationFrame` fired before the `cs-reveal-section.open` grid expansion finished. SVG had zero dimensions. `viewBox` was set to `0 0 0 0`, all paths had zero length.
   - **Fix:** Double-rAF inside the section-open handler — first frame triggers the CSS grid expansion, second frame reads real dimensions.
   - **Lesson:** CSS `grid-template-rows: 0fr → 1fr` transitions don't resolve immediately on the same frame as the class add. Always double-rAF before measuring elements inside accordion-type reveals.

6. **Scenario buttons appeared above SVG curves (layout order wrong)**
   - SVG was `position:absolute` filling the wrap, but the button row was normal-flow at the top — curves drew downward past the buttons. Buttons appeared at top, curves drew into the empty space below.
   - **Fix:** Add `padding-top: 48px` to the wrap — pushes the button row to the bottom. SVG fills the full height above them. Curves now correctly land at button positions.
   - **Lesson:** When overlaying an SVG on top of a button row and measuring button positions for path endpoints, the buttons must be visually at the BOTTOM of the container. Use `padding-top` to reserve curve-drawing space above.

7. **Static `stroke-dasharray` can't animate paths of varying length correctly**
   - Hardcoded `stroke-dasharray: 120` on all 4 paths meant curves of different lengths drew at different apparent speeds — outer curves (longer) finished much slower than inner ones.
   - **Fix:** `getTotalLength()` per path after `setAttribute('d', ...)`, then set `strokeDasharray = len` and `strokeDashoffset = len` individually.
   - **Lesson:** For `stroke-dashoffset` draw animations, always use `getTotalLength()` per path. Hardcoded values produce inconsistent timing across paths of different lengths.



**What was built:**
- Feedback row CSS selector fix; has-prompt color coral; scenario section stays open on scenario switch
- All 4 Stash scenario tabs always visible; inline generate from Stash with rotating loading messages
- Drawer SFX + one-open-at-a-time; dim level softened; cursor/pointer/scroll reliability overhaul
- Per-scenario Stash button state; CS↔Stash full sync; smart outside-click close; scroll passthrough

**Key bugs encountered and fixed:**

1. **`.cs-feedback-row` CSS selector was entirely missing**
   - Declarations for `display:flex; gap:10px` were floating loose after an `!important` line — no selector wrapping them, so the rule never applied. Thumbs overlapped Copy & Share.
   - **Fix:** Wrap with `.cs-feedback-row {` selector
   - **Lesson:** When a CSS rule silently does nothing, check for a missing selector — stray declarations after `!important` blocks are invisible to the eye

2. **`cursor:grab` on `.nf-row` parent silently overrides child `cursor:pointer`**
   - Parent CSS `cursor:grab` always wins over child `cursor:pointer` unless the child sets it via inline style or higher-specificity rule. The `.nf-row:active { cursor:grabbing }` only applied on direct click of the row, not on card hover.
   - **Fix:** Remove `cursor:grab` from CSS entirely. Set `row.style.cursor = 'grabbing'` inline in `mousedown` handler only. Add `.nf-row .concept-card { cursor:pointer }` to guarantee it wins.
   - **Lesson:** Never put `cursor:grab` on a scroll-row parent if children need `cursor:pointer`. CSS cursor on parent always cascades down unless child explicitly overrides with same or higher specificity.

3. **`isDown` drag state leaked when mouseup fired outside the row**
   - If user dragged fast and released outside the `.nf-row` bounds, `mouseleave` fired but `mouseup` didn't (it fires on the element where button was released). `isDown` stayed `true`, row cursor stuck as `grabbing`, subsequent hover over cards showed wrong cursor.
   - **Fix:** Add `document.addEventListener('mouseup', docUpHandler, { passive:true })` inside `initDragScroll` per-row. Clears `isDown` regardless of where mouseup fires.
   - **Lesson:** Always add a document-level mouseup fallback for any drag state. Never rely solely on element-level mouseup.

4. **Card-back scroll competed with row drag scroll**
   - `mousemove` on the row called `e.preventDefault()` when `isDown`, blocking vertical scroll inside `.card-back`. Even without dragging, `user-select:none` on the row could interfere.
   - **Fix:** Skip drag init in `mousedown` if target is inside `.concept-card.open` or `.card-back`. Add `wheel` event listener on row that calls `e.stopPropagation()` if target is a scrollable card-back. Add `overscroll-behavior:contain` + `touch-action:pan-y` to card-back CSS.
   - **Lesson:** Nested scrollable elements inside drag-scroll rows need three defences: (1) mousedown guard, (2) wheel stopPropagation, (3) CSS overscroll-behavior.

5. **Stash-generated prompts not visible in CS modal**
   - `_convGenerateCtx` wrote to `lll_cs_saved_v1` (localStorage) but not `sessionStorage`. CS modal's `_csRestoreOrLoad` checked session cache first — found nothing — then checked saved storage, but only for the current `_csCtx`. If Stash generated "partner" and CS opened on "friend", the restore found no data for "friend" and fired a fresh generate, silently overwriting the "partner" prompt.
   - **Fix (two parts):** (1) `_convGenerateCtx` now also writes to `sessionStorage` keyed as `CS_SESSION_KEY + id + '_' + ctx`. (2) `_csRestoreOrLoad` now loads ALL ctxs from both session cache and saved storage (merged), not just the active ctx. Then decides: active ctx has data → restore; active ctx missing → show generate button (no blind fresh generate). `_csUpdateScenarioBadges()` called after restore.
   - **Lesson:** When two surfaces (CS modal + Stash) write to the same storage key, they must share the same cache key format. sessionStorage is the CS modal's hot cache — any external writer must also populate it or the modal won't see the data.

6. **`body.cotd-open` (scroll lock) applied to Stash blocked page scroll**
   - `openConversations` was reusing the COTD scroll-lock class. The intent was to prevent background scroll while the panel was open, but this conflicted with the new design goal (scroll passthrough).
   - **Fix:** Remove `classList.add('cotd-open')` from `openConversations`. Replace overlay click-to-close with a `document` click handler (`_convOutsideClickHandler`) that closes only on non-interactive elements outside the panel.
   - **Lesson:** Don't reuse scroll-lock classes from unrelated modals. Each overlay has different scroll requirements — make the decision explicit.

---

### 2026-06-07 — v1.73 / v1.73b — CS modal wiring pass (v172.html)

**What was built:**
- Full wiring pass on CS modal ↔ Stash connection
- Coaching collapse on generate, generate button redesign, reveal row always visible
- Unified `_csRestoreOrLoad` for prev/next and history restore
- Save button state always accurate, aiData deep-merge across scenarios
- Mobile epic button moved to hamburger, help bubble direction fixed

**Key bugs encountered and fixed:**

1. **aiData save wiped previous scenario's openers/pitfall**
   - `_csSaveConcept()` replaced entire `aiData` object on update — scenario A's saved openers were lost when scenario B saved
   - **Fix:** `Object.assign({}, existingAiData, newAiData)` — deep-merge per-ctx, not full replace
   - **Lesson:** When saving a keyed object where each key is independently valuable, always merge, never replace

2. **Prev/Next blindly re-generated on every press**
   - `_csPrev()` and `_csNext()` always called `_loadAI()` regardless of whether that concept had already been generated in this session
   - Made the experience feel broken — navigating back would regenerate a different prompt
   - **Fix:** `_csRestoreOrLoad()` — checks `sessionStorage` per-ctx first, then `lll_cs_saved_v1`, only calls `_loadAI()` if nothing cached
   - **Lesson:** Prev/Next navigation should never re-generate. Cache is the source of truth during a session. Use `sessionStorage` keyed by `conceptId_ctx`

3. **`_csHidePostPrompt` was hiding too much**
   - It hid `csRevealRow` and `csActions` (contains Prev/Next + all reveal pills), causing them to disappear whenever a new concept loaded without a prompt
   - Users were stuck — no way to navigate or change scenario
   - **Fix:** Split into two: `_csHidePostPrompt()` only hides coaching/divider/feedback; `_csHideAll()` exists for modal-open init. All concept-load paths explicitly show `csRevealRow` + `csActions`
   - **Lesson:** There are two distinct "hide" states — "no prompt yet" (controls still needed) and "modal first load" (nothing shown). Don't conflate them with one function

4. **Save button forgot saved state on concept re-open**
   - `_renderCSShell()` always reset save button to `♡ Save` regardless of whether concept was already in `lll_cs_saved_v1`
   - **Fix:** `_csUpdateSaveBtn()` reads actual saved state; called from `_renderCSShell`, `_applyAIToCtx`, and `_csRestoreOrLoad`
   - **Lesson:** Any UI element reflecting localStorage state must re-read on every concept render, not assume default

5. **`_convOpenCSById` produced blank coaching on restore**
   - Built a stub `{ prompt, openers: [], pitfall: '' }` from history entry — never loaded real openers/pitfall even though they existed in `lll_cs_saved_v1`
   - **Fix:** Replaced with `_csRestoreOrLoad()` which checks saved storage first
   - **Lesson:** History and Saved are two separate stores. History has prompt text only. Saved has the full `aiData` with openers/pitfall. Always check Saved first when restoring full coaching context

6. **Orphaned CSS declarations (stray `cs-feedback-row` block)**
   - CSS rule had lost its selector — property declarations existed with `}` but no `.cs-feedback-row {` opener
   - Caused no JS error; `gap` and `margin-bottom` on the feedback row simply never applied
   - **Lesson:** After any large multi-edit session, scan CSS for orphaned declarations (lines with just `property: value;` not inside a named rule). `grep -n "^\s\{1,4\}[a-z-]\+:" file.html | head` catches most

7. **`_convOpenCS` (Browse → Chat) missing buttons after opening**
   - Function called `_renderCSShell()` then `openCS()` but never showed `csRevealRow`, `csActions`, or generate button
   - User arrived in CS modal with a concept but nothing to interact with
   - **Fix:** Explicitly show those elements + generate button before `openCS()`
   - **Lesson:** Every CS entry path (nav, Browse→Chat, Stash→More scenarios, History→Start talking) must explicitly set the correct UI state. Don't rely on prior state

**Architecture note — `_csRestoreOrLoad` pattern:**
The three-tier fallback (session cache → saved storage → generate) should be the canonical pattern for any future function that opens CS modal with an existing concept. Do not call `_loadAI()` directly unless you've exhausted both caches.

---

### 2026-06-06 — v1.72 / v1.72b / v1.72c — CS modal full UX overhaul (v172.html)

**What was built:**
- Auto-open CS modal on page load with immediate API fire
- Zero-click UX: default psychology + friend, no decisions required
- Full modal restructure: element order, reveal pills, Related moved, prev/next nav stack
- Badge redesign, Stash tab bug fix, cross-concept prompt contamination fix

**Key bugs encountered and fixed:**

1. **`RADIUS` and `STRENGTH` constants missing — magnetic pills silently broken**
   - `initMagneticPills()` references both constants but they were never declared in the file
   - No JS error — `undefined * number = NaN`, transforms simply never applied
   - **Fix:** `const RADIUS = 80; const STRENGTH = 0.18;` added immediately before the function
   - **Lesson:** When a visual effect silently stops working with no error, check for undefined constants before diagnosing logic

2. **Breathing skeleton invisible in light theme**
   - `var(--surface2)` on a light background is nearly white — breathing opacity animation had nothing to show
   - Reverted to shimmer lines which use a gradient with enough contrast in both themes
   - **Lesson:** Test skeleton loaders in both light and dark themes before shipping. Color token values differ enough to kill the effect

3. **Cross-concept prompt contamination in History tab**
   - `_csLogHistory()` (old, no promptText) was called from `_renderCSShell()` on every shell render
   - `_csLogHistoryWithPrompt()` (new) also wrote to the same store, same key structure
   - The old call ran first and set the dedup flag (`alreadyToday = true`), so the new call sometimes updated stale entries or wrote under a wrong index
   - Result: History entry for concept A got promptText from concept B
   - **Fix:** Removed `_csLogHistory()` call from `_renderCSShell()` entirely. Only `_csLogHistoryWithPrompt()` writes history, and only after a successful API response
   - **Lesson:** Two functions writing to the same localStorage key with overlapping dedup logic will corrupt each other. One writer, one place

4. **Stash always opened on Saved tab regardless of last active tab**
   - `openConversations()` unconditionally called `_convRenderSaved()` and `_convBuildCatFilters()` on every open
   - `_convTab` state variable was updated by `convSwitchTab()` but ignored on re-open
   - **Fix:** `openConversations()` now reads `_convTab` and branches to the correct render function; also syncs tab button classes
   - **Lesson:** Any panel that has tab state must re-read that state on open, not assume the default

5. **Nav badge counting daily increments instead of actual saved items**
   - `refreshNavBadge()` read from `lll_badge_count_v1` (a daily increment counter), not the actual `lll_cs_saved_v1` array
   - `_csSaveConcept()` called both `refreshNavBadge()` and `_incrementNavBadge()` — the badge could show numbers higher than actual saved items, and persisted values from previous days
   - **Fix:** `refreshNavBadge()` now reads `lll_cs_saved_v1` directly, filters by `savedAt` date = today, counts that
   - The `_NAV_BADGE_DATE_KEY` and `_NAV_BADGE_COUNT_KEY` localStorage keys are now unused (kept in code, not written)
   - **Lesson:** Don't maintain a separate counter when the source of truth (the array) is already in localStorage. Count the array

6. **`cs-reveal-row` dual CSS class conflict: `.visible` vs `.cs-visible`**
   - The row had `class="cs-post-prompt cs-hidden"` in HTML (managed by `_csShowPostPrompt`)
   - But various JS functions also toggled a separate `.visible` CSS class (`cs-reveal-row.visible { display: flex }`)
   - Both systems attempted to control display — whichever ran last won, causing intermittent invisibility
   - **Fix:** Removed `.visible` CSS rule; removed all `.classList.add('visible')` calls; unified to `cs-hidden`/`cs-visible` system only
   - **Lesson:** Never have two parallel CSS systems controlling the same element's display state. Pick one

7. **`_csSwapConcept` (Related → Use this instead) left state stale**
   - Old implementation manually reset various DOM elements and showed the generate button
   - It didn't call `_csHidePostPrompt()`, didn't push to nav stack, didn't update `_csCat`
   - **Fix:** Rewrote to match `_csLoadNewConcept` pattern: set state → render shell → push stack → hide post-prompt → call `_loadAI()`
   - **Lesson:** Any path that changes the active concept must go through the same state-reset + stack-push sequence

---

### 2026-06-05 — v1.70 + v1.71 clarity pass + CS generate fix (v170index.html)

**What was built:**
- Full clarity + minimalism pass: nav renamed Spark/Browse/Stash, CS modal restructured, per-scenario API generation, Stash date grouping, streak/vault hidden, quiz pill, easter egg, hero copy rewrite
- All changes in `v170index.html` — `index.html` kept at v1.69 as stable reference

**Key bugs encountered and fixed:**

1. **Duplicate `export default` in `cs-generate.js` — fatal**
   - When the file was rewritten, the old function body was not removed — it was appended after the new one
   - A JS module with two default exports cannot be parsed at all; Vercel returns 500 before the function receives any request
   - Symptom: generate button dies in under 1 second every time
   - **Fix:** Stripped everything from the second `export default` onwards using Python slice on byte offset
   - **Lesson:** When rewriting a serverless function, always `grep -c "export default"` the output file before shipping. Should always be exactly 1.

2. **Stray `}` brace in `_csFeedbackDone` broke all JS below it**
   - A stray closing brace left a dangling `}` that closed an imaginary outer function scope
   - Everything after it — `openCS`, `render`, `buildGrid` — was unreachable; cards never loaded, nav buttons silently failed
   - Stash still worked only because `openConversations` was defined earlier in the file, before the break point
   - **Fix:** Removed the extra `}`
   - **Lesson:** After any large JS edit, always run `node --check` on extracted script blocks before shipping. This catches brace mismatches in seconds.

3. **`initConversationStarter()` auto-opened CS modal on every page load**
   - The function called `openCS()` unconditionally — modal fired immediately, blocking card load and making nav buttons appear broken
   - **Fix:** Removed `openCS()` call from `initConversationStarter()`. Modal now only opens via Spark button.

4. **`backdrop-filter: blur()` caused 500–1300ms pointer lag on Stash panel and 800ms lag on easter egg overlay**
   - GPU compositing on every pointer event when backdrop-filter is active
   - **Fix:** Remove `backdrop-filter` from both overlays; replace with solid `rgba` background
   - **Lesson:** Never use `backdrop-filter: blur()` on interactive overlays. The GPU cost is disproportionate. Solid semi-transparent backgrounds are visually nearly identical.

5. **Nav "I feel epic!" button broke nav grid layout**
   - Placed as a sibling element between `nav-island` and `nav-right` — nav uses `grid-template-columns: 1fr auto 1fr` (exactly 3 children), so a 4th child overflowed to a new row
   - **Fix:** Moved inside `nav-right`; uses `max-width: 0 → 160px` transition on nav hover to slide in without affecting layout

6. **Nav emoji misalignment (Spark/Browse vs Stash)**
   - Spark and Browse used `::before` pseudo-elements for emojis; Stash used an inline `<span>`
   - `::before` elements don't share baseline with adjacent text nodes in the same inline flow — they sit lower
   - **Fix:** Replaced `::before` with `<span class="nav-spark-emoji">` / `<span class="nav-browse-emoji">` — same pattern as Stash. All three use `vertical-align: middle; line-height: 1`

7. **`setCat('all')` from Stash open-card caused full 580-card render**
   - `_convOpenConcept()` called `setCat('all')` to ensure the card was visible, which triggered `render()` → rebuilt entire grid
   - **Fix:** Set `activeCat` directly to the concept's category, call `buildCats()` + `buildGrid()` only — renders ~20–40 cards instead of 580

8. **`max_tokens: 400` truncated Claude response in cs-generate single-ctx mode**
   - JSON was cut mid-stream → `JSON.parse` threw → server returned 502 → generate button stuck
   - **Fix:** Raised to 700. Single-ctx response needs ~250–350 content tokens + formatting overhead

**Lessons:**

- **Always `node --check` extracted JS after any edit session.** Catches brace mismatches, duplicate declarations, stray tokens instantly.
- **`grep -c "export default"` on every serverless function file before deploy.** Should always be 1. Never 0, never 2.
- **Never use `backdrop-filter: blur()` on interactive overlays.** GPU compositing cost is real and perceptible (~800ms+). Use solid `rgba` backgrounds instead.
- **`::before` pseudo-elements don't align with inline text the same way `<span>` does.** For inline emoji that must align with nav text, always use a `<span>` with `vertical-align: middle`.
- **`setCat('all')` triggers a full grid rebuild.** When targeting a specific card, set `activeCat` directly and call `buildGrid()` — don't go through `setCat()`.
- **`initConversationStarter()` should never call `openCS()`.** The modal init and the modal open are separate concerns. Init prepares state; open shows the UI. Coupling them auto-fires the overlay on every page load.
- **When a nav button fails silently, the cause is often a JS syntax error earlier in the file** — not a missing function or wrong onclick. Run `node --check` first before inspecting onclick handlers.
- **Duplicate `export default` in a JS module is a parse-time fatal.** The runtime never reaches the function. Symptom: consistent instant 500 with no Vercel log entries for the function body.

---

### 2026-06-04 — Conversation Starter session (v1.67–v1.68d)

**Python CSS block replacement left orphaned unclosed rule → entire layout broken**
The Python `str_replace` that rewrote the CS CSS block ended with `  .newsletter {\n    position: relative;\n` as a partial match boundary. This wrote an unclosed `.newsletter {` rule before the real one. Browser CSS parser treated everything below as inside that malformed block — browse section and newsletter rendered as unstyled chaos. Looked like a layout regression. Was a one-character CSS parse break.
**Lesson: when using Python to replace large CSS blocks, print and inspect 150 chars past the replacement boundary before saving. Never end a replacement string mid-rule.**

**Manual YouTube `?t=NN` broke timestamp links — use `buildTimestampedUrl()` always**
In v1.68c, I built the timestamp URL manually as `base + '?t=' + seconds`. YouTube requires `?t=NNs` (with trailing `s`). Also skipped the 8s pre-roll buffer. The existing `buildTimestampedUrl()` function already handles both correctly.
**Lesson: never reconstruct YouTube deep links manually. Always call `buildTimestampedUrl(episodeUrl, timestamp)` — it handles format, pre-roll, and edge cases.**

**CSS `display:none → display:block` cannot be transitioned — use grid-template-rows trick**
Trying to animate accordion height with `max-height` causes layout jank on variable-height content. `display:none` elements can't be transitioned at all.
**Correct pattern for smooth height-auto expand:**
```css
.expand {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 0.35s ease;
}
.expand > * { min-height: 0; }          /* required */
.expand.open { grid-template-rows: 1fr; }
/* For padding animation, use an inner wrapper: */
.expand .inner { padding: 0 16px; transition: padding 0.35s ease; }
.expand.open .inner { padding: 14px 16px; }
```
Zero JS, no height measurement, minimal GPU cost. Works for all accordion-style elements.

**`closeCS(false)` vs `closeCS(true)` — preserve state for back-navigation**
When user navigates from CS modal to episode drawer via "More from this episode", calling `closeCS(true)` marks the modal as dismissed for the day — user can't return. Use `closeCS(false)` and set a `_csFromDrawer = true` flag instead. `openCSFromNav()` always bypasses the dismissed check, so the back button (`← Prompts`) correctly re-opens the modal with full state intact.

**sessionStorage caching for expensive API calls within a session**
The Claude API call costs ~10s. Cache the response keyed by concept ID in `sessionStorage` — switching context tabs (Partner/Friend/etc) is then instant. Key pattern: `'lll_cs_ai_' + concept.id`. Always check cache before firing the fetch. On concept/category change, clear `_csAIData = null` but don't clear sessionStorage (user may return to same concept).

**AI generation must be user-triggered, not automatic**
Auto-generating on modal open = API call on every page load for every user. Even at low DAU this compounds. User-triggered generate button = API calls only from engaged users who explicitly want the feature. Also gives users a sense of control and discovery rather than passive delivery.

**Animated loading messages improve perceived wait time significantly**
The API call takes 8–12s. Static skeleton = user assumes it's broken after ~4s. Rotating contextual messages (2.8s cadence, 0.4s fade) with personality ("Setting the mood for you and your partner…") reframe the wait as part of the experience. Keep messages short, warm, slightly funny — never technical.

---

### 2026-06-03 — SFX session (v1.65–v1.66b)

**`const bar` dropped when adding mobile magnetic guard → site-wide concepts failure**
When adding `if ('ontouchstart' in window...) return;` to `initMagneticShortPills`, the `const bar = document.querySelector(...)` line directly below was accidentally deleted. On desktop (where the touch guard doesn't fire), `bar` was undefined → `ReferenceError` inside `render()` → caught by `loadConcepts()` catch block → showed "Could not load concepts — open via Vercel URL". Looked like a network/deploy issue. Was a one-word JS error. **Lesson: when adding an early-return guard at the top of a function, always re-read the next 3 lines to make sure no variable declarations were consumed.**

**Streak milestone SFX firing on every card open**
`updateDailyGoal()` is called every time a card opens. The `if (n === 5)` check fires every time once the goal is already met. Added `_streakMilestonePlayed` boolean session flag — reset on page load, set to `true` after first fire. Always gate "fire once" SFX with a session flag, not just a value equality check.

**Map riser not playing — AudioContext pre-scheduling pattern**
`AudioContext` created inside a gesture callback means audio plays from t=0 *after* the gesture — which disconnects it from the visual loading moment. Correct pattern: create the `AudioContext` (suspended) and schedule all nodes at script load time using absolute times from `0`. Then `.resume()` on first gesture — audio plays from the exact start of the timeline. Works because suspended contexts hold their scheduled nodes.

**`initMagneticShortPills` mobile guard pattern for reference:**
```js
function initMagneticShortPills() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  const bar = document.querySelector('.shorts-filter-bar'); // ← MUST come after guard, not before
  if (!bar) return;
  ...
}
```

**Map.html mastery sync still not resolved**
`map.html` stores mastered IDs as strings (`String(c.id)`), `index.html` checks integers. `loadMastered()` in index now coerces on read (Phase 1 of v1.65) but the reverse direction (mastering on map → showing on index) depends on whether map writes integers. Not fully verified. Flag for dedicated fix session.

**Diagnosing "concepts not loading" — checklist for next time**
1. Check `concepts.json` directly in browser tab (is it accessible?)
2. Check Network tab for `concepts.json` status code
3. Check GitHub line ~5762 for `playStreakMilestoneSFX` guard
4. Check `initMagneticShortPills` has `const bar` declaration
5. Only then suspect deploy/routing issues

---

### 2026-06-02 — UX polish session (v1.63–v1.64b)

**AudioContext suspended on return visits**
Browser autoplay policy suspends AudioContext after the user navigates away and returns. Creating a new `new AudioContext()` on every SFX call doesn't fix this — the new context is also suspended. Fix: one shared `_sfxCtxPool` instance, call `.resume()` inside the getter, and pre-warm it on first `mousedown`/`touchstart`. This is the standing pattern for all future Web Audio work.

**`color-mix()` with nested CSS vars is unreliable for backgrounds**
`color-mix(in srgb, var(--cat-color) 6%, var(--surface))` failed silently in some browsers when both operands are CSS variables. Fix: compute the tint in JS with `hexToRgba(hex, alpha)` and set it as a literal `rgba(...)` in the inline style. Always resolve to concrete values before passing to `color-mix` if one operand is a CSS var pointing to another var.

**Card tint placement: wrapper vs face**
Setting `background` on the `.concept-card` wrapper (the 3D flip container) causes the tint to show through the gap between faces during the flip animation, and also appears behind the back face. Correct placement is on `.card-front` only — the wrapper stays transparent. Same principle applies to any property that would bleed through `backface-visibility: hidden`.

**`color-mix` on `.card-front` with `--cat-color` works fine**
Once the tint moved to `.card-front` (which is a concrete painted element, not the 3D wrapper), `color-mix(in srgb, var(--cat-color) 11%, var(--surface))` resolved correctly. The issue was the wrapper, not `color-mix` itself.

**Make.com / JSON reminder (standing rule)**
No new lessons — existing rule holds: always use JSON > Create JSON module for structured bodies. Never drop array pills directly into HTTP module body.

---

2026-06-02 — Tally embed: CSS can't style inside iframes; free tier has no transparency

- Tally free tier does not support transparent background in embeds — the `transparentBackground=1` URL param and CSS on the outer wrapper both fail to affect the iframe's internal document
- Only lever available: set Tally's Background colour field to match (or intentionally contrast with) the site bg, then wrap the iframe in a div with matching background padding
- Final solution: `#1e1b18` wrapper bg on both themes — seamless on dark, reads as intentional dark card on light parchment. Don't fight the iframe; make the contrast deliberate.
- Lesson: when iframe colours don't update after changing Tally settings, try hard refresh (`Cmd+Shift+R`) and incognito. Free tier may only apply custom colours to the standalone Tally URL, not the embed.

2026-06-02 — Quiz category pills not reached by CSS filter

- Quiz pills use inline `style="color:${CAT_COLORS[cat]}"` set in JS — CSS class selectors like `.quiz-cat-pill { filter: ... }` do work, but only because the filter applies to the element itself, not the inline colour. Confirmed fix: target `.quiz-cat-pill`, `.quiz-review-cat`, `.quiz-cat-chip` directly in the `[data-theme="light"]` block.
- Lesson: when inline styles are set by JS, CSS filters on the element still work — but `color` and `border-color` overrides in CSS will lose to the inline style unless you use `!important`. Prefer filter for hue/brightness shifts on JS-coloured elements.

2026-06-02 — Daily category default: deterministic by date

- Used `Math.floor(Date.now() / 86400000) % 14` to pick a daily category — same result for all visitors on the same UTC day, cycles all 14 categories, no backend needed.
- Lesson: for "random but consistent" daily features, integer day-index mod array length is the simplest pattern. No localStorage, no cookies.

---

2026-06-02 — Brevo email: promotions tab, unsubscribe footer, deliverability

- Emails from Brevo shared IPs land in Gmail Promotions by default — unavoidable without domain authentication
- Fix: verify `epistemic.live` domain in Brevo (SPF + DKIM) and send From `hello@epistemic.live` not a Gmail address. This is the single biggest deliverability upgrade available.
- The "reply with Epistemic" mechanic in Email 1 trains Gmail to move future emails to Primary — it's functional, not just clever
- Unsubscribe footer: Brevo auto-adds List-Unsubscribe header (Gmail blue button) but does NOT add a visible in-body footer unless your template includes one. Add it manually as plain text; hyperlink to `{{ unsubscribe_link }}` — Brevo replaces at send time. This is legally required (GDPR/CAN-SPAM).
- `{{ unsubscribe_link }}` is found in Brevo editor via the { } Personalization button, or paste directly into the link URL field — Brevo accepts it raw.
- Do NOT enable contact re-entry on the automation — re-subscribers would receive "Founding Member" framing out of context.
- `#signup` anchor scroll works on load, but JS render of concepts.json causes layout shift that resets scroll position. Fix: re-scroll to hash after `buildGrid()` completes. Deferred.

---

2026-06-01 — Tally embed: unclosed div swallowed DOM siblings

When pasting an iframe embed inside a modal `<div>`, always close the parent `</div>`
before the closing comment. An unclosed `feedbackSheet` div caused the browser to treat
the share modal, daily goal bar, and all subsequent HTML as children of the sheet —
making them disappear when the sheet was hidden. No JS error is thrown; the symptom is
elements vanishing from the page entirely. Lesson: after any modal HTML edit, immediately
verify the closing `</div>` is present before committing.

2026-06-01 — `body.feedback-open` class not removed on close

The original `closeFeedbackModal(e)` function and its `window.closeFeedbackModal` override
both existed simultaneously. The original didn't remove the `feedback-open` body class,
so the daily goal bar stayed hidden after the modal closed. Rule: when overriding a function
with `window.X`, either delete the original or make sure both versions are identical in
side effects. Better: just use one function, not two.

---

2026-06-01 — Pulse ring spacing

If a CSS `::after` pulse animation sits inside a flex container with tight gap,
the ring visually bleeds into adjacent elements even though it doesn't affect layout
(it's `position: absolute` / `inset`). Fix: increase parent `gap` until the ring
has clear air at its largest scale point. For `signup-pulse` scaling to 1.55×,
`1.4rem` gap on `.nav-right` was the safe minimum.

2026-06-01 — Incentive copy strategy

"6 months free Pro" is weak when Pro doesn't exist yet — no substance behind the promise.
Founding Member framing (identity + lifetime discount) converts better at pre-launch
because it's permanently true regardless of when Pro ships. Price lock is the most
tangible alternative if identity angle feels soft.

---

## 2026-06-01 — Beehiiv → Brevo migration + feedback popup

- Brevo free plan includes automations (welcome sequences) capped at 2,000 contacts/month entering workflows — irrelevant at current stage
- Brevo uses `api-key` header (not `Authorization: Bearer`) — easy to get wrong
- Brevo returns 201 on new contact, 204 on update (when updateEnabled: true) — handle both as success
- Feedback serverless function uses Brevo transactional email (`/v3/smtp/email`) — counts against 300/day free limit
- Gmail sender works fine in Brevo — just needs manual verification via Senders & IP → Senders
- Feedback submit is silent-fail by design: user sees ✓ regardless of email delivery outcome

---

## Session — 2026-05-31 — Quiz UX overhaul (v1.57)

### What shipped
- v1.57a: Category selector pre-quiz screen (All / Pick modes); 14 pill multi-select; live pool count
- v1.57b: Round 1 wrong answers from full CONCEPTS pool (not session pool); FIB 80% fuzzy match; plain-giveaway filter
- v1.57c: Round 1 review screen after R1 (replaces interstitial); end screen 12-concept vault list
- v1.57d: Inline accordion expand on end screen concept rows

### Lessons learned

**FIB eligibility is a two-layer problem.**
Layer 1: is the term a real/coined concept? (word count, punctuation, sentence patterns)
Layer 2: does the plain text give away the answer? (normTerm appears in normPlain)
Both layers must run. Layer 2 alone would miss invented phrases. Layer 1 alone would miss terms whose definitions repeat the term verbatim (e.g. "Leverage — using leverage means...").

**For fuzzy string matching in quiz answers, a simple sequential character scan beats Levenshtein for this use case.**
Levenshtein is expensive and overkill. The `similarity()` function (count matching chars in order / longer.length) handles hyphens, dropped articles, and minor typos at ≥80% threshold reliably. Edge case: very short terms (1-2 words) can false-positive — acceptable tradeoff given hint system.

**CSS `max-height` accordion needs a generous ceiling, not `auto`.**
`max-height: auto` is not animatable. Set a real ceiling (400px used here) that comfortably exceeds realistic content height. If a concept's expanded content ever exceeds 400px the panel just stops — no breakage, content is still accessible by scrolling the quiz body.

**quizState data is available at end screen render — no fetch needed.**
`quizState.pool` holds full concept objects (all fields). The end screen accordion reads directly from this — no separate lookup, no API call. This is worth remembering for any future quiz features that need concept data.

**Round 1 distractor pool should always draw from `window.CONCEPTS`, not `quizState.pool`.**
The session pool is 12 cards. Drawing distractors from it means the same 11 concepts repeat as wrong answers every question — trivially easy after round 1. Full library gives ~570 candidates to shuffle from.

---

## 2026-05-31 — Light/dark mode INP: broad CSS transition cascade is catastrophic

**What happened:** Added `transition-property: background, border-color, color` on a selector list of ~18 classes (`body, nav, .daily-goal, .concept-card, .card-front, .card-back, ...`). Every theme switch triggered simultaneous CSS transitions on hundreds of DOM nodes. Browser had to repaint every matched surface at 60fps for 250ms. Result: 860ms INP.

**Fix:** Delete the block entirely. CSS variables propagate to all consumers instantly — there is nothing to animate. The toggle button already has its own scoped transition.

**Rule:** Never add `transition` to broad selector lists for the purpose of animating a CSS variable change. Variables cascade instantly; what you're actually doing is scheduling hundreds of repaints per frame. One matched class with 300 DOM nodes = 300 paint calls per frame × 15 frames = 4500 paint operations per switch.

**Rule:** If INP is in the 500–900ms range and the input handler is trivial (just sets an attribute), the culprit is almost always a CSS transition cascade, not JS execution time. Check the "Processing duration" breakdown in DevTools — if it's >300ms with a simple handler, look at what CSS transitions fire immediately after.

---

## 2026-05-31 — Light mode design: warm parchment not pure white

**Decision:** Light bg is `#f5f2ed` (warm parchment), not `#ffffff`. Matches the editorial aesthetic — pure white reads clinical and kills the Playfair Display warmth. Accent gold darkened to `#b8860b` for contrast compliance on light bg (original `#e8d5a3` is invisible on parchment).

**Rule:** When implementing light mode on a warm dark-themed site, darken the accent color significantly. The dark-mode accent is optimised for contrast against near-black; it will fail WCAG on light bg.

---

## 2026-05-31 — Duplicate `let` declaration kills entire script block

**What happened:** Added `let _r2hintRevealed = []` twice inside `renderRound2()` — once at the function scope and once inside the helper block. JavaScript throws a SyntaxError for duplicate `let` in the same scope. This silently killed every function in the second `<script>` block: quiz wouldn't open, vault buttons did nothing, COTD mark button was dead.

**Rule:** When adding a variable inside a closure that already declares the same name, use assignment (`_r2hintRevealed = []`) not re-declaration (`let _r2hintRevealed = []`). Always grep for the variable name before adding a new `let`/`const`.

**Rule:** A SyntaxError in a `<script>` block kills ALL code in that block. If multiple unrelated features break simultaneously, suspect a parse error, not logic bugs in each feature.

---

## 2026-05-31 — Background edits vs. find-and-replace in chat

- Background edits (Claude writes to file directly) use ~50% fewer tokens — no need to echo OLD and NEW blocks in the chat.
- Precision is the same: `str_replace` errors if the string isn't unique or not found.
- **Tradeoff:** You don't see the diff before deploying. Use background edits for routine changes; revert to explicit find-and-replace for high-risk changes (publish pipeline, schema, Make.com automation).

---

## 2026-05-30 — Drawer close scroll glitch

**`html { scroll-behavior: smooth }` breaks scroll restoration.**
When `closeEpisodeDrawer` removes `body.drawer-open` at 400ms, the page
sections come back at scrollTop=0 (display:none collapsed the document
height). The subsequent `scrollTo(0, savedY)` then smooth-scrolls visibly
from top to the saved position — exactly the "throws from top" glitch.

Fix: set `document.documentElement.style.scrollBehavior = 'auto'` before
the scroll restore, then restore it one rAF later.

**Rule:** Any scroll restoration after a `display:none` toggle must
explicitly bypass smooth-scroll. The CSS declaration is global; JS scroll
calls inherit it unless overridden inline.

---

## 2026-05-29 — Drawer performance improvement + lessons

### The principle: animations and DOM work must NEVER block each other

When a CSS transition runs at the same time as a synchronous JS block that
mutates 600+ DOM nodes, the browser delays the animation until JS finishes.
The user sees a frozen UI for the duration of the JS. The fix pattern:

1. Mutate ONLY the animating element synchronously (just toggle a class)
2. Defer all heavy DOM work to `requestAnimationFrame` (open) or `setTimeout`
   matching the CSS transition duration (close)
3. The user sees the animation start instantly; the heavy work happens
   either before they look at the new content (open) or after they've
   already moved on (close)

This is THE pattern for any future modal, drawer, sheet, or overlay. Apply
it preemptively — don't wait for slowness to fix it.

### Specific gotchas worth remembering

**`will-change: transform` is a footgun.** It forces a permanent GPU
compositor layer. Useful on the SINGLE element about to animate, removed
right after. Used wrong (e.g. on every card in a list) it consumes GPU
memory permanently and makes things slower, not faster. Default to NOT
using it.

**The CSS `:has()` selector is expensive on iOS Safari.** A rule like
`#grid:has(.card.open) .card:not(.open) { opacity: 0.1 }` looks elegant
but the browser has to re-evaluate it against every card whenever any card
changes. Replace with a JS class toggle on the parent — 10× cheaper, same
visual result.

**`visibility: hidden` ≠ `display: none` for performance.** `visibility:
hidden` keeps the element in the layout tree and the GPU still composites
it. `display: none` removes it entirely. When hiding heavy sections behind
an overlay, use `display: none`. Caveat: scroll position can be lost on
restore — save `window.scrollY` before, restore after.

**Overlays/drawers MUST live at the top level of `<body>`.** Never nest
them inside content sections. If the parent gets `display: none`, the
overlay disappears too — even with `position: fixed`. position:fixed only
affects layout positioning, not whether the element renders. The episode
drawer broke this rule for months before we hit the bug.

**Forced synchronous layout (`void el.offsetWidth`) is a tax.** It blocks
the main thread mid-interaction. The pattern of "reset animation by
forcing reflow" should be replaced with `requestAnimationFrame(() => {
el.style.animation = ''; })` — same effect, no blocking.

**`backdrop-filter: blur()` is one of the most expensive paint
operations.** A 3px blur on a 92% opaque background is essentially
invisible but costs a full-screen GPU pass on every scroll frame. Always
ask: would bumping opacity 4 percentage points let me drop the blur
entirely? Usually yes.

**Fonts need TWO `preconnect` hints when using Google Fonts.** One for
`fonts.googleapis.com` (the CSS) and one for `fonts.gstatic.com` (the
actual font files). Missing the second one costs 200-500ms on mobile
first paint.

**`<script>` tags without `defer` block first paint.** Always `defer`
unless the script must run during parse. Fuse.js was render-blocking
because of one missing attribute.

### Console warnings: ignore unless from YOUR origin

`MaxListenersExceededWarning`, `ObjectMultiplex orphaned data`, and
similar errors traced to `contentscript.js` are from browser extensions
(ad blockers, MetaMask, etc.) — not the site. Verify by opening in
Incognito with extensions disabled. The warnings won't appear.

### Standing rule: chunk a click handler's work into "instant" vs "deferred"

If a click handler does more than ~50ms of work, split it. The pattern:
- **Phase 1 (instant):** Toggle the class that starts the visual change.
  Touch only the element being animated.
- **Phase 2 (next frame, via rAF):** Run any DOM mutations the user
  expects to see "inside" the new view.
- **Phase 3 (after transition, via setTimeout matching CSS duration):**
  Clean up offscreen state (remove sections from layout, restore scroll,
  empty stale content).

### CSS animations re-trigger when elements come back from display:none

If an element has `animation: foo 0.3s` applied via CSS, and you toggle
its ancestor from `display: none` → visible, the animation re-runs from
scratch every time. This caused a "flash" of all 584 concept cards when
the drawer closed. The fix is one of:
- Remove the animation entirely (we did this — visually minor cost)
- Apply the animation via a class added only on initial mount, then
  removed once animation completes
- Use `animation-iteration-count: 1` + `animation-fill-mode: both` AND
  ensure the element isn't display-toggled (only the parent is)

### The drawer animation pattern, refined

Both open AND close must keep `display: none` toggles OUTSIDE the
animation window. Specifically:
- **Open:** slide drawer up first, hide page sections AFTER slide ends
- **Close:** slide drawer down FIRST (sections stay display:none behind it),
  reveal page sections AFTER slide completes (400ms setTimeout)

The user never sees the layout shift in either direction, because the
drawer covers it. The animation runs against a stable layout tree.

INP is dominated by Phase 1. Keep it tiny.

---

### 2026-05-19 — Analytics tool selection + Umami setup

**What was built:**
- Umami Cloud analytics + 5 custom events in `index.html` (one commit).

**Lessons learned:**
- **Verify free-tier limits BEFORE recommending a tool.** Initially recommended Vercel Web Analytics ("free + in-stack"); research then revealed custom events are Pro-only AND Hobby is non-commercial. Two wasted decision cycles. Always web-search exact tier limits first.
- **Free analytics tiers are commonly non-commercial** (Vercel, GoatCounter, Umami Hobby). Not blocking pre-revenue, but flag it: paid plan is inevitable at monetization, so don't over-invest in free-tier-only workarounds.
- **Umami signup email lands in spam** — recurring known issue (GitHub #2298). Tell future users to check spam first, don't troubleshoot for 15min.
- **`localStorage.setItem` returns `undefined` — that is success, not an error.** Pre-empt this confusion.
- Self-exclusion = `localStorage.setItem('umami.disabled',1)`, per-browser, official. No free IP filter on Hobby.
- Don't tool-shop endlessly under friction. After 3 tools hit snags, the right move was: identify the ONE metric that matters (D7 retention), pick least-friction path, defer the rest.
- `map.html` is a SEPARATE page with its own `<head>` and JS — needed its own Umami script + own `track()` helper. Multi-page sites = script must be added per file. Website-id now lives in 2 places (index.html L16, map.html L590) — update both if it changes.

**Status:** Analytics live. Next session (post-2026-05-27): quiz pool bug fix.

---

### 2026-05-18 — Episode drawer card redesign

**What was built:**
- Drawer cards: accordion → flip → overlapping deck → single-column → final 3×3 grid (desktop) / vertical column (mobile). CSS-only.

**Lessons:**
1. **The padding bug was a duplicate-selector bug, not a padding value bug.** `index.html` had grown TWO consecutive `.ep-cat-column-header` blocks; the later one (no `position`, `margin-bottom:4px`) silently overrode every "fix" via equal-specificity later-wins. ~4 prior attempts failed because they edited the wrong block. **Lesson: when a CSS fix has no visible effect, grep for duplicate selectors before changing values again.**
2. **A third stale `.ep-cat-column` rule (`flex:0 0 300px; display:flex`) survived the grid rewrite** and collapsed every grid cell to ~120px (one-word-per-line wrapping). Same root cause family: old rules left behind during iterative redesigns keep winning. After any layout paradigm switch, search for ALL rules on the changed selector, not just the one being edited.
3. **Grid header needs `grid-column: 1 / -1`** or the sticky category header is treated as a grid item and steals a 1fr cell, rendering beside the cards.
4. **Stale RAW pastes.** Several rounds the user's pasted index.html was 2–3 commits behind; find/replace blocks then didn't match. Lesson: when the user pastes RAW, treat THAT as truth and re-derive finds from it; flag explicitly when proposing edits against an assumed (not pasted) state.

**Architecture note for future-me:**
- The `:has()` dim-others pattern is in production and acceptable (browser support fine). The expensive FLIP "float card to screen center" idea stays parked — only revisit in a dedicated session, not bundled with other work.

---

### 2026-05-18 — Build C: evergreen concept backfill (in-chat, no pipeline)

**What was built:**
- 70 evergreen concepts (IDs 517–586) appended to concepts.json across 4 ranked batches, pure data, no code deploy.

**Lessons:**
1. **Stale snapshot in the brief.** Project instructions / old chat said creativity ~7, finance ~14 etc. Live counts had moved (finance was 18, not 14). Always run the per-category count from concepts.json at the start of a content session — don't trust numbers carried over from a previous chat or the system prompt.
2. **`science` and `tech-ai` had drifted off-definition.** Both categories were dominated by speculative/fringe cards, not the quality-rules definition ("how knowledge is made" / "digital systems"). Evergreen backfill doubled as a quiet re-anchor. Flag for a future session: a cleanup/recategorisation pass on the legacy fringe cards may be worth proposing.
3. **Prompt-style must match concept type.** The rubric's prompt examples are all behavioural ("where in YOUR life…"). Forcing that frame onto structural/infrastructure concepts (latency/bandwidth, single point of failure, technical debt) produces exactly the "lazy prompt" the rules reject. Fix: use lens-style prompts for structural concepts ("where do people confuse X with Y") and reserve personal prompts for behavioural ones. Rubric explicitly permits "useful as a lens" (actionability 8) — both styles are compliant; pick by concept type.
4. **Paste mechanic that works for non-technical commit:** block starts with a leading `,`, pasted after the last `}` before the closing `]`. Zero risk of breaking the JSON if the user pastes verbatim. Reused successfully 4× this session.

**Gotcha for future-Claude:**
- New IDs continued from max existing ID (516 → start at 517), NOT from len(concepts) or last-array-index. Two deletion gaps exist below 516; never reuse them. Always `max(id)+1`.

---

### 2026-05-18 — Cross-episode duplicates, stat alignment, Make related_ids leak

**What was built:**
- `duplicate_of` field in publish-batch.js (cross-episode repeats publish tagged, not rejected)
- Stat band reorder + Episodes count; concept/progress counts exclude duplicates

**Key bugs / challenges:**
1. `related_ids` arrived correct in Airtable but published as `[]`.
   - **Root cause:** NOT the code. The chain is Airtable → Array aggregator → JSON module → HTTP. The new `Related IDs` column was never ticked in the **Array aggregator's "Aggregated fields"** list, so it was stripped before the JSON module — value was *absent*, not empty, so publish-batch fell back to `[]`.
   - **Fix:** Tick `Related IDs` in the Array aggregator. (Adding it to the data structure alone is insufficient — schema slot ≠ value mapping.)
   - **Gotcha:** Make silently omits unmapped/empty fields from output. "Field missing from sent body" = mapping gap, not code bug. Every new schema field needs THREE places updated in Make: Airtable read, Array aggregator fields, JSON module mapping.
2. "related_ids rendering broken into rows" reported as a regression.
   - **Reality:** False alarm. That was the GitHub source view of concepts.json (JSON arrays always render one element per line). Render code lives in `map.html` only (`.panel-related-pills`, flex-wrap) — not in index.html, and not regressed. index.html has zero "related" references.

**Lessons:**
- When a pipeline value goes missing, check the data path module-by-module before suspecting code. Verify the HTTP module's *sent body* in run History first — it isolates code-vs-pipeline instantly.
- Schema definition and value mapping are separate layers in Make. Fixing one without the other produces a present-but-empty (or absent) field.
- Distinguish "broken on the site" from "looks odd in the GitHub raw JSON view" before treating it as a regression.

**Architecture note for future me:**
- The Make field-by-field mapping is the recurring fragility: every schema addition risks a silent drop at 3 separate modules. The robust long-term fix is routing high-value publishes through the `extract.html` direct-publish path (array → API intact, no Make, no per-field mapping). Not urgent; revisit when schema churn or a dropped-field incident recurs.
- concepts.json hand-append is fine to ~1–2k concepts. Past that, split by category or move to a lightweight store. Hand-editing the 8.6k-line file is error-prone — prefer tool/script-generated full-file replacement over manual surgery.
- Destructive ops (overwrite/delete) deliberately kept OUT of the unattended pipeline. Duplicates accumulate safely with a marker; merges stay human-triggered.

---

## 2026-05-18 — Backfill tool: 5 gotchas, all browser-API quirks

**Lesson 1 — file:// origin blocks API calls.** Tools run from a local file
get CORS-blocked on GET-with-custom-header. Fix: always serve internal tools
from tools.epistemic.live (commit to repo), never open via file://.

**Lesson 2 — Airtable PATs can silently break.** A token with correct scopes
+ base access still 403'd. No diagnosis worked; creating a fresh PAT fixed it
instantly. If Airtable 403s and everything looks right, just regenerate.

**Lesson 3 — Claude API from browser needs a special header.**
`anthropic-dangerous-direct-browser-access: true` unlocks browser→API. Without
it: "Failed to fetch". extract.html already had this; backfill tool didn't.

**Lesson 4 — batch jobs must commit per-batch, not at the end.** All-or-nothing
commit means any mid-run crash loses all work. Always: commit after each batch,
capture the returned SHA (`sha = saved.content.sha`), use it for the next PUT.
Also: declare `let { sha }` not `const` — the SHA changes every commit.

**Lesson 5 — Anthropic rate limit is 30k input tokens/min.** Sending the full
library (~25k tokens) as context per batch means ~1 batch/min max. 800ms delay
fails on batch 3. Use 65s sleep between batches. Trade-off accepted: ~10min run
for better connection quality (kept full `plain` context).

**Formatting note:** JSON.stringify(x, null, 2) spreads arrays vertically.
Regex post-process to collapse `related_ids` onto one line keeps the file readable.

---

### 2026-05-17 — Concept Map v2: Relationship Layer

**`extract.html` calls Claude directly — changes to `extract-concepts.js` do NOT affect it**
- The two files share the same extraction logic but are completely independent codebases. Any prompt change, schema change, or field addition must be applied to BOTH files separately. Easy to forget. Always grep both files when changing the extraction pipeline.

**`related_ids` was generated but never written to Airtable — silent failure**
- Claude returned `related_ids` correctly in its JSON. The library injection worked. But `buildAirtableFields()` in `extract.html` simply didn't include the field. No error, no warning — the data was just dropped. Lesson: when adding a new field to the extraction schema, trace the full path: Claude output → `buildAirtableFields()` → Airtable POST → `publish-batch.js` read → `concepts.json` write. Check every step explicitly.

**`publish-batch.js` only handled array type for `related_ids`, not string**
- Airtable stores the field as a plain text string (`"12, 47, 203"`). `publish-batch.js` checked `Array.isArray()` and fell through to `[]` on strings — silently dropping all IDs. Fix: add a string branch that splits on comma and parses each value. Lesson: when a field crosses a system boundary (Airtable text field → JS array), always handle both the expected type AND the wire format.

**Bidirectional index from one-directional data**
- Only new concepts write `related_ids` (forward links). Old concepts don't know they're linked. Solution: build a `RELATED_INDEX` at page load that processes all forward links and creates reverse entries simultaneously. One pass, `O(n)`, handles both directions without any schema change to existing concepts.

**`data-cx` / `data-cy` must be set on the `<g>` element, not read from the `<circle>`**
- `navigateToRelated()` needs the position of a node to pan the map. The `<circle>` has `cx`/`cy` SVG attributes but these aren't accessible as `dataset`. The `<g>` wrapper had no position data at all. Fix: add `g.dataset.cx = cn.x` and `g.dataset.cy = cn.y` when building concept nodes. Always store layout coordinates on the interactive element, not just the visual child.

**Edge layer z-order: must be re-appended after orbit lines, before concept nodes**
- Creating the `<g>` edge layer immediately after root and appending it there puts it behind orbit lines. SVG renders in DOM order. Fix: create the layer after root, but call `root.appendChild(edgeLayer)` again just before the concept nodes loop — this moves it to the correct z-position without restructuring the build function.

**extract.html opened locally (file://) shows nothing in the Network tab**
- Browser security blocks network requests from `file://` origins, so DevTools Network tab is empty. This made it impossible to inspect whether the library fetch was working. Diagnosis required reading the code directly. Lesson: always test internal tools via `tools.epistemic.live`, not from local filesystem — the hosted version shows real network traffic.

**Make.com "Create JSON" module has its own field schema — adding a field to Airtable + publish-batch.js isn't enough**
- `related_ids` was generated by Claude, written to Airtable, and read correctly by publish-batch.js — but still arrived empty in concepts.json. The break was the Make.com scenario: the "Create JSON" module (module 3) builds the HTTP body from an explicit data structure that listed every field except `related_ids`. Fix: edit that module's data structure, add a `related_ids` text field, and map it to the Airtable module's "Related IDs" output. Lesson: when adding any new field to the extraction→publish pipeline, the Make.com JSON module's data structure is a fourth place that must be updated, alongside the extraction prompt, Airtable, and publish-batch.js.

---

### 2026-05-17 — Concept Map page (constellation view)

**What was built:**
- `map.html` — standalone radial constellation page, pure SVG + Vanilla JS, no libraries
- `vercel.json` — clean URLs so `/map` resolves
- Highlighted nav button in `index.html`

**Key bugs / challenges:**
1. `/map` returned a Vercel 404 even though `map.html` was committed correctly to repo root
   - Cause: Vercel does not serve `file.html` at `/file` unless clean URLs are enabled
   - **Fix:** Added `vercel.json` with `{ "cleanUrls": true }`
   - **Gotcha:** Before adding it, the file IS reachable at `/map.html` — use that to confirm the file itself works before assuming a code bug. Saved a debugging detour.
2. Full-viewport noise texture looked heavily pixelated
   - Cause: the global `body::before` SVG fractal-noise overlay is tuned for card-sized surfaces; stretched across a full screen it visibly tiles
   - **Fix:** On `map.html` only, replaced the noise with a faint radial gold glow. Conscious, page-scoped deviation from the "noise is the only texture" design rule.
3. Duplicate nav links — Map appeared twice on both desktop and mobile after iterative edits
   - **Fix:** Kept the highlighted variant, deleted the plain one, moved Map to first position

**Lessons:**
- Vercel routing: a committed `.html` file 404ing at its clean path is almost always a missing `cleanUrls` setting, not a deploy or code problem. Test `/file.html` directly first to isolate routing from rendering.
- The global noise overlay does not scale to full-page backgrounds. Any future full-viewport page should use a flat or radial-glow background, not the card noise SVG.
- New top-level pages need a `vercel.json` consideration up front — bake it into the plan for any future standalone page (`/quiz`, etc.).
- Iterative nav edits across multiple turns accumulate duplicates. When adding a nav item, paste back the whole nav block once at the end to dedupe.

---

### 2026-05-17 — Card redesign + UX polish session

**CSS class definitions can silently disappear between edits — always verify in the live file**
- `.short-filter-pill` had its CSS block removed during a prior session but the JS still generated elements with that class. No error — browser just rendered unstyled white buttons. Lesson: after any session that restructures CSS, grep the live file for every class name used in JS template literals and confirm the definition exists.

**`var(--text-muted)` is not a valid design system token — it's `var(--muted2)`**
- The token `--text-muted` was used in `.short-filter-pill` but never defined in `:root`. Browsers silently ignore undefined tokens and fall back to `inherit` or initial — which on buttons is black/white. Always use `--muted` (dark) or `--muted2` (#9a9a9a) for secondary text. Never invent new tokens mid-code.

**Inline styles as a CSS resilience fallback**
- When a CSS class is unreliable (risks being lost in future edits), inlining critical styles directly on the element guarantees they survive. Used this for shorts filter pills. Trade-off: harder to update globally. Only use for small, stable components.

**`buildGrid()` inside `toggleMaster()` causes scroll-position reset**
- Calling `buildGrid()` on every vault action destroys and recreates the entire DOM, resetting scroll position. Fix: update only the affected card in-place using `getElementById` + `classList.toggle` + direct property writes. Never call `buildGrid()` for single-card state changes.

**3D flip cards require fixed height on the parent — `auto` height breaks `position: absolute` faces**
- Both `.card-front` and `.card-back` use `position: absolute; inset: 0` to overlap. If the parent `.concept-card` has `height: auto`, the faces collapse to 0px. Always set an explicit pixel height on the card wrapper when using the flip pattern.

**`perspective` on the row container, not per-card**
- Setting `perspective` on `.nf-row` rather than each `.concept-card` means all cards share one perspective point — they feel like they exist in the same space. Per-card perspective makes each card flip in its own isolated bubble. Row-level perspective is correct for a horizontal card tray.

**Share card canvas: `width`/`height` attributes vs CSS sizing**
- Canvas `width` and `height` HTML attributes set the internal drawing resolution. CSS `width`/`height` sets display size. Always set both. If you only set CSS, the canvas draws at 300×150 (default) and scales up blurry. Square 1080×1080 is the correct share format — landscape was awkward for mobile sharing and crammed content.

**Episode search hiding itself: never hide the section container when filtering returns zero**
- `section.style.display = 'none'` on zero results hides the search bar too, trapping the user with no way to clear the query without a page refresh. Correct pattern: keep section visible, render a "no results" message inside the results container only.

---

### 2026-05-17 — Shorts section overhaul

**`getYouTubeId()` must handle `/shorts/` paths or thumbnails silently fail**
- YouTube Shorts URLs use `/shorts/{id}` not `?v={id}`. The old function returned `null` for every short, so all thumbnails showed the fallback div. Fix: add a `/shorts/([a-zA-Z0-9_-]{11})` match first, before the existing `?v=` and `youtu.be/` patterns. Safe for regular episodes — they don't have `/shorts/` in their URLs.

**Orphaned concepts fix: always check collections.json before debugging the pipeline**
- Concepts 413–424 were live on site but had no drawer or thumbnail. Root cause: their `collection_id` values (506–512) didn't exist in `collections.json`. The pipeline, concepts.json, and Airtable were all correct — only the collections file was missing entries. Lesson: when concepts appear detached, check `COLLECTIONS_BY_ID[c.collection_id]` existence before assuming a code bug.

**Filter bar alignment: always wrap in the constrained-width container**
- Injecting raw HTML into `#shortsRow` (which is full-bleed) means any content without its own `max-width` wrapper bleeds to screen edges. Every row-level UI element (filter bar, search) needs `max-width:1100px; margin:0 auto; padding:0 2rem` wrapping div before the `episodes-scroll-wrap`.

**Duplicate `renderShortCard` nested inside old grouping code caused silent breakage**
- During editing, the new `renderShortCard` was pasted inside the old `// Group by creator` block, creating a nested duplicate. Browser parsed the outer function's closing brace as ending `buildShorts` prematurely. Symptom: shorts section rendered nothing, no console error. Lesson: after replacing a block that contains a nested function definition, search for the function name and confirm it appears exactly once.

**`search-wrap` pattern is the right approach for all search bars on the site**
- The shorts search input was originally a bare `<input class="shorts-search">` with custom CSS. This looked different from episodes and concepts. Switching to the shared `search-wrap` div + SVG icon pattern eliminates the divergence. Any future search bar should reuse `search-wrap` — don't add new search CSS.

---

### 2026-05-13 — Drawer category filter + UX polish

**Hardcoded fallback values cause flash-of-stale-content**
- The hero stats had `183` and `12` literally typed in the HTML as a "smart default" before JS overwrites them. On every page load users saw the old values for ~200ms, then a jarring jump to current numbers.
- Lesson: when a value is set dynamically by JS, the HTML placeholder should be a neutral sentinel (`—`, blank, or spinner) — never a stale real value. Real values rot; placeholders don't.

**`history.scrollRestoration = 'manual'` is the right fix for "page loads scrolled mid-way"**
- Don't try to scroll-to-top in JS after load; the browser fights you because it restored scroll *before* your script ran. The one-liner above tells the browser to never restore scroll. Add it as early as possible in `<head>`, inline in a script tag.

**Block-scope traps in JS template literals**
- The filter pill block needs access to `sortedCatKeys` and `catGroups`, both declared inside the `else` block. Code that uses them must live inside the same `else` — putting it after the closing `}` of the else throws a silent ReferenceError that kills the whole function (the drawer in this case). When debugging "function doesn't run at all", check the console for ReferenceError first.

**Duplicate function declarations are silent killers**
- During the rapid iteration on `filterDrawerCat` and `initMagneticDrawerPills`, three near-identical copies of each ended up pasted into the file. Browser parses it as one big syntax error → entire `<script>` block fails → nothing on the page works. After every paste session, search for `function functionName` and confirm it appears exactly once.

**Mobile tab behavior is cleaner than horizontal column scroll**
- Originally the drawer grid scrolled horizontally on mobile so users could swipe between category columns. Reality: on a 380px viewport the columns were uncomfortably narrow, and discovery was poor — users didn't realize there were more columns. Switching to pill-as-tab (one column at a time, pills act as filter) drastically improved mobile UX with no extra code complexity.

**Count-up animations work best with ease-out, not linear**
- Ease-out cubic (`1 - Math.pow(1 - progress, 3)`) makes the number feel like it's "arriving" — fast burst, smooth settle. Linear feels mechanical. 1200ms is the sweet spot for numbers under ~500; longer values need more time, shorter ones look frantic.

---

### 2026-05-12 — Episode drawer redesign + air-date datestamp

**`col.date` doesn't exist — always use `aired_date || created_date`**
- All date display and sort logic must use `col.aired_date || col.date || col.created_date`. `col.date` is never populated — it was an assumption. `aired_date` is the correct field for the episode publish date; `created_date` is the processing date.
- Lesson: when a field shows nothing, check the actual JSON before assuming the code is broken. `console.log(col)` in the browser would have caught this in 30 seconds.

**Drawer column layout — `align-items: flex-start` on the grid is required**
- Without it, all columns stretch to the height of the tallest column. Cards in shorter columns appear to have invisible space below them. Set on `.ep-drawer-grid`.

**Category sort in drawer — most concepts first, not alphabetical**
- `Object.keys(catGroups).sort((a,b) => catGroups[b].length - catGroups[a].length)` gives the dominant category the leftmost column. More useful than alphabetical for scanning.

---

### 2026-05-12 — Editor's Pick flag, end-to-end

**Session scope:** Add a single boolean `editors_pick` field flowing from capture (extract.html / upload.html / Airtable) through Make.com to `concepts.json`, with visual treatment on the live site. Single-boolean approach chosen over a `tags` array — YAGNI until a second flag exists.

**Bug: `readField` silently drops booleans**
- `publish-batch.js` has a `readField(obj, ...keys)` helper that returns trimmed strings or stringified numbers, but skips any other type. When the defensive `editors_pick` read passed `true` through `readField`, it returned `''`. The four-way coercion (`=== true || 'true' || 1 || '1'`) then resolved to false on every row.
- Symptom: every concept landed in `concepts.json` with `editors_pick: false` even though Airtable showed the checkbox ticked AND the Make.com JSON output string clearly contained `"Editor's Pick": true`.
- Root cause: I wrote the new code without reading the helper it relied on. Defensive code is only as good as its inputs — a multi-clause coercion looks thorough but operates on the wrong value if the source is silently filtered upstream.
- Fix: bypass `readField` entirely for boolean fields. Use `raw['editors_pick'] ?? raw["Editor's Pick"] ?? raw['Editors Pick']` to read the value with its original type preserved, then coerce.
- Lesson: **`readField` is string/number only.** Any future boolean or array field must read directly off `raw[...]`. If you're tempted to extend `readField` to handle booleans, consider that downstream `if (v) return v` style checks will then treat `false` as "missing" and continue the loop — making it worse, not better. Better: small specialized readers per type (`readField`, `readIntOrNull`, `readTimestampOrNull`, and now implicitly `readBoolean` inline).

**Bug: Make.com aggregator field-name passthrough**
- Adding `editors_pick` to the `Publish Batch Concept` data structure was necessary but not sufficient. The Array Aggregator's "Aggregated fields" toggle list controls *which* Airtable fields appear in the output, but the field NAMES in the output are Airtable's display names (`"Editor's Pick"`), not the data structure's snake_case names (`editors_pick`).
- This meant the JSON body sent to `/api/publish-batch` had `"Editor's Pick": true` as the key, not `"editors_pick": true`. The server-side multi-key read handles it now, but it's a Make.com gotcha worth remembering.
- Lesson: **Make.com aggregators pass Airtable field names through verbatim.** When adding new pipeline fields, always plan for both casings on the receiving server. Don't assume the data structure schema enforces key renaming — it doesn't, not in this configuration.

**Bug: `togglePick` pasted inside `sendOne` (extract.html)**
- During the manual edit, `togglePick(i)` ended up nested inside `async function sendOne(i)`. Function-scoped definitions are only callable from within the parent function — meaning every PICK button click threw `togglePick is not defined`.
- Compounded by `sendOne` then referencing an undefined variable `collectionId` (should have been `activeCollectionId`).
- Lesson: **after multi-file paste-and-edit sessions, scan for orphan function definitions inside async function bodies.** A nested function definition is a code smell in vanilla JS unless you specifically need a closure.

**Bug: `sentStatus is not defined` runtime error after extraction**
- I instructed the user to replace a `concepts.forEach` block in `extract.html` Edit 3 that initialized both `conceptState[i]` and `sentStatus[i]`. My replacement removed the `sentStatus[i] = 'pending'` line. Result: extraction succeeded, parsing succeeded, then rendering blew up because `sentStatus` was used elsewhere but never populated.
- Compounded because `sentStatus` was used but never declared as a top-level variable — it was implicitly an undeclared global being assigned-to.
- Fix: declare `let sentStatus = {};` at the top of the state section, AND initialize it in the same `forEach` as `conceptState`.
- Lesson: **before deleting any line in a user's file, search for the variable's other usages.** If a variable is implicitly global (used without declaration), declare it explicitly while you're touching the file. Implicit globals are time bombs.

**Decisions made this session:**
- Single boolean `editors_pick` over a `tags: []` array. Migrating later is a 30-min script if needed.
- Toggle lives in the card header on extract/upload, always visible. Not inside the expandable body — the decision is fast and shouldn't require a click to access.
- Gold border + gold `★ PICK` pill in the card-meta row on the live site. Reuses the existing accent color (`#e8d5a3`) and pill pattern. No new visual language.
- Picked cards stay at full visual prominence even when mastered (mastered opacity:0.5 applies to the card; the PICK pill keeps its full accent color).
- Editor's Picks filter / dedicated row on the live site: **deferred**. Build the flag, accumulate ~30+ picks, then decide based on real usage signals.

**Costs this session:**
- ~$0.40 in wasted Claude API calls during debugging cycles (extraction re-runs after each bug).
- ~90 minutes wall time, of which ~30 was debugging the `readField` boolean issue. Time well spent — the lesson generalizes.

---

### 2026-05-10 — Batch publish scenario: the Make.com IML object-array trap

**What was built:**
- 5-module Make scenario replacing the 2-module per-concept publish flow.
- Patched `publish-batch.js` to accept Airtable-shaped object keys (capital-case, with spaces).

**The hours-long debugging journey, condensed:**

1. **First attempt: cloned the existing scenario.** Stale module ID references left ghost pointers Make refused to clear. Abandoned. Lesson re-confirmed: never clone, always rebuild.

2. **Second attempt: hand-templated `{{#each 2.array}} ... {{/each}}` in HTTP body.** Renders as literal text. **Make.com's HTTP module does NOT support Handlebars syntax in body fields.** `#each`, `#unless`, and similar are Vercel/Express conventions, not Make features. Make has IML, and IML has no array-iteration template syntax for body strings.

3. **Third attempt: drop `{{2.array}}` directly into a JSON-string body.** Make serializes the array but with unquoted property names — output looks like `[{Term: "...", Hook: "..."}]`, which fails Make's pre-flight JSON validator.

4. **Fourth attempt: wrap in `toString(2.array)`.** Outputs `[object][object]` literally. `toString()` doesn't recursively serialize objects.

5. **Fifth attempt — the working one: JSON > Create JSON module with a Data Structure.** This is the documented Make pattern for emitting valid JSON containing arrays of objects. The Create JSON module reads the aggregator output and renders properly-stringified JSON, which the HTTP module then sends as raw text.

**Why this matters:** any future Make scenario that needs to send an array of objects in an HTTP body MUST use the Create JSON module. Don't try to template it. The HTTP body field is fundamentally string-only — IML can interpolate scalar values into it, but cannot serialize complex types.

**Other gotchas hit:**

- **Aggregator field config:** if "Aggregated fields" isn't an explicit ticked list of individual fields, Make outputs whole record blobs. Symptom: pill picker shows only `Array[]` and `__IMTAGGLENGTH__` under the aggregator's output, with no per-field subkeys. Fix: open the aggregator, tick each field individually under Aggregated fields. Save. Re-open downstream modules — subfields now appear in the pill picker.

- **Quote-wrapped if() literals:** the Status field's `if(success; "PUBLISHED"; "APPROVED")` had quotes around the literals — Make wraps function-output strings in quotes again at insertion, producing `"\"PUBLISHED\""`. Airtable rejected this as an unknown select option. Fix: type the literal values without quotes inside `if()` slots — Make handles the string typing.

- **Re-running over already-published records:** if Module 5 fails on the first run (Airtable update bug), the records stay APPROVED. Next Run once picks them up again, sends them to publish-batch, which correctly returns `409 already exists`. Module 5 then writes the error to `Publish Error` and leaves Status = APPROVED. Looks like the scenario is broken — it's not. The duplicate guard is doing its job. Manual cleanup needed for those rows.

**Architectural note:** the publish function's pattern of accepting both lowercase and Airtable-cased keys is now the convention for any Vercel function consumed by Make.com. Reshaping in the function is more reliable than reshaping in IML — moves the brittleness from a no-code surface into deterministic code. Same principle as `extract-concepts.js`'s `toTitleCase()` enforcement (2026-04-25): prompts shape, code guarantees.

**Lesson added to the rules:** when Make.com needs to send structured data, use Create JSON. When the data needs reshaping, do it server-side. Never template arrays in HTTP body fields.

---

## v1.43 — Mobile hero session lessons

### CSS grid auto-placement bites when you add a 4th child
`.hero` has `grid-template-columns: 1fr 1px 1fr` (3 tracks). Adding a 4th direct child without explicit `grid-row` / `grid-column` makes the browser invent an implicit row and shuffle items in ways that look like layout bugs. Rule: any child of `.hero` needs explicit grid placement in the desktop media query. Re-flagged because the next time we add a 5th child, this will break again.

### Flipping cards need measurable parent height
`.hero-card-inner` is `width: 100%; height: 100%` and the faces are `position: absolute; inset: 0`. If the wrap is `min-height + auto`, `100%` of `auto` resolves to `auto`, faces collapse, front renders as a vertical sliver of one-word-per-line text. Always use a fixed `height` on `.hero-card-wrap` per breakpoint.

### `align-self: center` on a flex column item shrinks it to content width
`.hero-card-col` had `align-self: center` on mobile. Combined with no explicit `width`, the column collapsed to its padding box (~36px), and the card inside (`width: 100%` of parent) collapsed with it. Fix: `align-self: stretch; width: 100%; box-sizing: border-box`. Children that need to be visually centered should rely on the column's internal `justify-content: center`, not on `align-self`.

### Unfinished CSS declarations are silent killers
An orphaned `.hero-stats` block left over from an earlier edit ended in `border-left: 1p` (no unit, no semicolon, no closing brace). CSS parsers fail-forward — every rule below it was discarded. Symptom looked like the entire stylesheet was missing. When the site looks catastrophically broken after a CSS edit, search for unterminated declarations before assuming bigger issues.

### Hero showcase card is still hardcoded HTML
Re-flagging: the "Mental Masturbation" card is hand-written HTML in `index.html`, not pulled from `concepts.json`. Future task — wire it to the deterministic concept-of-the-day pick or rotate weekly.

### Mobile breakpoint is 900px (includes iPad portrait)
Intentional, but worth knowing. Anything tested only on phones may surface differently on iPad portrait (768–900px range).

---

### 2026-05-09 — Multi-slot shorts + slot collection caching

- Per-slot `_slot` metadata tag on each concept is the cleanest way to carry
  episode context through the extraction→send pipeline without changing the
  concept schema.
- Cache collections by episode URL (`shortCollectionCache`) before the send
  loop — not inside it. Calling GitHub PUT per-concept would create duplicates.
- `:has()` CSS selector used to hide the transcript section in Short mode.
  Works in all modern browsers but will silently fail in older ones — acceptable
  for a private tool.
- `slotCounter` is append-only (never resets on remove) so slot IDs stay unique
  within a session even after removals.

---

## 2026-05-09 — Rebrand to Epistemic. (v1.37)

**The motivation:** "Listen. Learn. Live." was a working title, not a brand. Three words, three periods, awkward to say, awkward to type, and it forced the visual identity into a rhythm that carried no meaning. "Epistemic" is one word, signals the actual subject matter (knowledge, how we know things), and lets the design breathe. Rebranding pre-launch is cheap; rebranding post-launch is expensive. Did it now.

**Why `.live` over `.com` / `.app`:** `.com` and `.app` were either premium-priced or parked at squatter prices. `.live` was €2.70 first year, fits the editorial-content TLD pattern (Twitch, news sites, podcasts), and quietly echoes the "Live" from the old name without anchoring to it. Trade-off accepted: `.live` carries slightly less universal trust than `.com`, but for a non-checkout-flow product that's a paper cut, not a wound.

**The Namecheap dark patterns:** Caught two upsells at checkout — PremiumDNS auto-added with auto-renew toggled on, and Stellar Web Hosting silently bundled as a "free trial" that converts to €5/mo. Both rejected. Lesson: when buying anything from a registrar, screenshot the cart at the final step before clicking pay. Compare line items to subtotal. If anything's there that you didn't add, remove it. The €2.70 charge was the only thing that hit the card, but the auto-renew toggles for unwanted services persisted in the dashboard and had to be cleaned up post-purchase.

**The Beehiiv surprise:** Publication name and subdomain renames go through fine on the free tier. Editing an existing welcome automation does not — Beehiiv lets you change the draft but paywalls the "Publish changes" button at €49/mo. Discovered mid-rebrand. The unpublished edit sits in limbo: the live welcome email still says "Listen. Learn. Live." even though every other surface is rebranded. Decision: skip the upgrade. Two subscribers, automation rarely fires, the cost-benefit doesn't justify €49/mo. Lesson: with most ESPs, rebrand the static fields first (publication name, subdomain, footer), accept that automation drafts will go stale, and either upgrade once volume justifies it or migrate to a cheaper ESP (Buttondown, Loops, Resend) when the time comes. The rebrand doesn't have to be 100% complete on day one to ship the new brand.

**Defensive registrations declined:** `epistemic.com` parked at premium pricing. `.app` and `.io` similarly inflated or taken. Refused to spend €100+/yr defending a name that doesn't yet have revenue. The defense that actually matters — trademark check — was free and came back clean for software/education. Squatter risk on other TLDs is low for an uncommon adjective like "epistemic"; the squatters target proper-noun brands.

**One-shot batched commit:** Rebrand changes to `index.html` were 4 separate find/replaces (title, share text, canvas brand text, canvas URL). Did them in one commit instead of four. Lesson: when changes are functionally one decision (rebrand), batch them. Reviewing four commits to verify a brand swap is wasted attention; one commit with a clear message is the better artifact.

**The rename-vs-redirect call:** Considered renaming the GitHub repo `listen-learn-live` → `epistemic`. Deferred. GitHub auto-301-redirects old repo URLs forever, but every collaborator and integration (Vercel, Make.com webhooks pointing at the repo if any) would need re-checking. The name of the repo doesn't appear anywhere user-facing; risk-adjusted, it's a Phase 2 cleanup. Vercel auto-tracks the repo regardless of name, so no deploy risk.

---

## 2026-05-09 — Rebrand sweep: what stays, what changes (v1.37 cont.)

**The three categories of brand strings.** Doing the sweep made the categorization explicit. (1) User-facing brand mentions — page titles, headers, in-prompt sentences sent to Claude, share-card copy. These all change. (2) Internal identifiers that look like branding but aren't — GitHub repo name, localStorage keys, Airtable Base ID. These stay; renaming them would either break the pipeline (repo name) or silently wipe user state (localStorage). (3) Historical references in build-journal and changelog narrative entries describing past states. These stay too — they're records, not current truth. The sweep was fast because the categories were clear. Recommended approach for any future rebrand: classify before editing.

**localStorage keys are a one-way door.** Every existing user's mastered concepts, streak, daily-goal progress, and dismissed-COTD-today flag live in `lll_*` keys. Renaming the keys would orphan all that state — users would open the site after the rebrand and see their progress gone. Cost-benefit is obvious: invisible identifier vs. user-trust impact on every existing user. Lesson: the LLL prefix is now permanent infrastructure. Don't touch.

**The find-and-replace gotcha.** Caught two strings that looked like brand mentions but weren't safe to replace: the `User-Agent: 'LLL-Publisher'` headers in the GitHub API calls (changed those — they're cosmetic to GitHub's logs, not load-bearing) and the help text on the GitHub-token field in `extract.html` ("...on listen-learn-live (fine-grained)..."). The help text mentioned the actual repo name, but reading it as user copy made it sound like branding. Rewrote it to "...on the repo (fine-grained)..." — the literal repo name lives in the `GITHUB_REPO` constant and doesn't need to be repeated in UI hints. Lesson: when a literal infra string surfaces in user-facing copy, generalize the copy and let the constant carry the literal.

**The business-snapshot doc was the only real "no" of the sweep.** Every other file was a header rename or a find-and-replace. The snapshot's opening manifesto is "Listen." / "Learn." / "Live." on three separate lines as a brand structure, with a tagline built around the three verbs. That's not a brand mention — that's the document's rhetorical bones. Decision: archive (rename to `_ARCHIVED.docx`), don't rewrite. New snapshot goes on the to-do list for next time it's actually needed (fundraising, partnership outreach). Lesson: rebrands are 95% mechanical and 5% creative-rewrite. Don't conflate the two — knock out the mechanical pass first, schedule the creative work separately.

---

---

## 2026-05-08 — Drawer leak + retina perf cleanup (v1.36)

### The "stuck band" behind the drawer wasn't a band
- Symptom: opening the episode drawer left a visible horizontal "band" of dimmer content above it. I wasted two iterations assuming it was a `--band` background tone (removed in this session as Step 1) and then assuming it was the nav showing through.
- It was neither. The drawer is `height: 88vh`, leaving 12vh of page visible above it. The 0.92-opacity backdrop wasn't strong enough to fully cover the rendered nav + content in that strip — and bumping opacity wouldn't have looked clean either.
- Fix: hide all top-level page sections with `body.drawer-open { visibility: hidden }`, then explicitly mark the drawer + backdrop visible. `visibility: hidden` (not `display: none`) preserves layout so closing the drawer returns the user to their prior scroll position with no jump.
- Lesson: when a backdrop "isn't covering" something, the answer is often to remove the something rather than make the backdrop more opaque. Don't tune opacity past 0.9 — at that point you should be hiding what's behind, not painting over it harder.

### CSS grid stretch ≠ multiple-cards-open
- Symptom: opening one concept card inside the drawer made every neighboring card in the same row appear to "open" — empty card-back-shaped space below their content.
- I assumed it was the same close-others bug as the main grid and patched `toggleEpCard` to close other drawer cards first. That was *also* a bug worth fixing — but it didn't fix the visual symptom because that wasn't what was happening.
- Real cause: CSS grid's default `align-items: stretch` makes every cell in a row grow to match the tallest cell. When card #273 opens to ~1300px, cards #276/#275/#274/#272 in the same grid row stretch with it — they're not "open," they're just inflated.
- Fix: one line, `align-items: start` on `.ep-drawer-grid`. Each card sizes to its own content; opening one no longer affects neighbors.
- Lesson: when a visual symptom matches a known JS bug, verify the JS is actually executing the broken behavior before assuming the fix applies. Two different mechanisms can produce visually similar symptoms.
- The main grid (`.nf-row`) doesn't have this issue because it's flexbox with horizontal scroll, not CSS grid. Different layout primitive, different default alignment behavior.

### Backdrop-filter is the #1 retina lag offender
- The site had 8+ `backdrop-filter: blur()` declarations across nav, drawer, all modals, mobile nav, and every scroll arrow (×30+ instances).
- On a retina/5K display, backdrop-blur is ~4× more expensive than at 1080p because the GPU has to blur 4× more pixels every frame.
- Most of those blurs were doing zero visible work — they sat behind 0.92+ opacity scrims that already fully obscured the page. Removed them and bumped opacity 0.04–0.13 to compensate. Visual diff: imperceptible. Perf diff: site went from ~50% to ~90% smooth on a 16" retina.
- Kept nav blur at a reduced 3px (was 6px). The nav blur is the one that *visibly* helps as content scrolls under it.
- Lesson: audit `backdrop-filter` first whenever lag is reported on retina/5K. Most uses are decorative and removable. The visible benefit only kicks in when there's actual transparent content showing through (like the nav over scrolling page).

### `will-change` is not a free perf hint
- Found `will-change: transform` and `will-change: opacity` on `.quiz-sheet`, `.cotd-overlay`, `.cotd-card`, `.nav-link`, `.cat-card`. The latter two are legitimate (interaction targets where animation is imminent on hover). The first three were declared statically on elements that animate once on open — forcing permanent GPU layers for no benefit.
- Removed the static ones. Left the interaction-target ones alone.
- Lesson: `will-change` should be applied just before the animation starts and removed after. Declared in a stylesheet permanently, it's pure cost.

### `transition: all` audit
- 15+ instances across the codebase. `transition: all` forces the browser to monitor every property for changes, including layout-affe

---

## 2026-05-07 — Timestamps, air-date sort, Listen button (v1.34)

**The motivation:** Glasp embeds timestamps in exported transcripts. Those markers were sitting in the transcript text doing nothing — the extractor didn't capture them, the schema didn't store them, the site didn't use them. One extraction run is enough source material to deep-link every concept back to the moment it was discussed; not capturing it was leaving the highest-leverage UX feature on the floor.

**Why two fields landed in one session:** `timestamp` (concepts) and `aired_date` (collections) live in different files and serve different purposes, but the migration paperwork is identical: extraction prompt + extract.html + extract-concepts.js + publish-concept.js + Airtable + Make.com + 4 docs. Doing them as one v1.34 instead of v1.34 then v1.35 = one Vercel deploy, one Make.com edit, one Airtable schema change. Two unrelated fields, one migration cost.

**The 8-second pre-roll buffer:** Concepts get discussed mid-sentence. Linking exactly to the timestamp drops the listener into "...and that's why it works." Linking 8 seconds early lands them in the setup. Codified in `buildTimestampedUrl()` as `Math.max(0, timestampSeconds - 8)` — clamped at zero so concepts within the first 8 seconds of an episode don't go negative.

**Forward-compatible URL building:** `buildTimestampedUrl()` currently only branches on YouTube hostnames. Spotify and Apple Podcasts use different timestamp parameter formats (`?t=` for YT, `#t=` for Apple, etc.). Building the helper as a router from day one — even though only one branch is implemented — means adding Spotify later is a 5-line change, not a refactor of every concept-card render path. Cost of forward-compatibility: zero. Cost of skipping it: a future me grepping every `&t=` hardcode.

**The Make.com fragile link:** The pipeline ships in 6 files but breaks if one Make.com mapping is missing — `timestamp` has to be added to the publish HTTP module body, otherwise every concept goes live with `timestamp: null` silently. No error, no log, just missing data. Documented inline in the build flow ("flag this so you don't wonder why timestamps are missing later") but it's worth keeping the broader lesson: any field that crosses the Airtable→Make→Vercel boundary needs to be checked at all three points, not just the two endpoints. Make.com is the silent middleman that fails without complaining.

**The Airtable fallback for empty timestamps:** `ifempty({{Timestamp}}; "null"; {{Timestamp}})` sends the literal string `"null"` when the field is empty. The publish function's `parseInt` handles strings → returns NaN → falls through to null. Same trick `collection_id` has used since v1.17. Reused on purpose — every new field that flows through Make can use this exact pattern without thinking about it.

---

## 2026-05-06 — Long-form extractor + open source codes

**The bottleneck:** Airtable's Long-text fields silently truncate around 100k chars. 2-hour podcast transcripts (~120k chars) hit this and broke the Intake-form pipeline without a clear error.

**The fix:** Built `extract.html` as a pure-browser tool that bypasses Airtable for the transcript step entirely. Browser → Claude API → GitHub commit (collections.json) → Airtable POST per concept (PENDING). No new Vercel function, same security model as `upload.html`. Will retire the Intake form path once `extract.html` is proven on a few episodes.

**The bug that almost shipped silently:** the existing `extract-concepts.js` and `publish-concept.js` both had hardcoded `VALID_SOURCES = ['core','cw','ah','dk']`. New episodes from non-Williamson/Hormozi/Koe hosts would either silently fall back to `core` (in extract) or 400 the publish call (in publish). First non-cw episode (Jefferson Fisher, source `cw` for the host but extracted with mixed sources) hit this on commit #18 of the run with `Invalid source "rh"` from `publish-concept.js`. Fixed by replacing closed lists with `normalizeSource()` regex (any 2-4 lowercase letters) + `typecast: true` on the Airtable POST so new Single Select options auto-create.

**Lesson:** any constant that hardcodes a fixed list of "valid" values is a future bug. When the live system inevitably needs a new value, it fails silently (drops data) or loudly (rejects the row). Replace with shape-validation + `typecast: true` wherever a downstream system can absorb new values gracefully.

**Vercel build coalescing:** publishing 27 concepts in 7 minutes caused Vercel to skip the last 1–2 commits' builds. GitHub had all 27, deployed bundle had 25, drawer showed 25. Manual redeploy resolved it but this needs a structural fix — see roadmap.

**Source-code generation rule (now baked into the prompt):** first letter of host's first name + first letter of last name, lowercased. Collisions append next consonant. "core" overrides any host code when the concept is universal/predates podcasting.

---

## 2026-05-06 — Hero copy + section banding + episodes by podcast (v1.31)

### Section banding without colliding with existing tones
- Page already used `--bg` (#0d0d0d) and `--surface` (#141414, used by episode cards).
- A naive "lighter band" approach (using `--surface`) would have made the band the same tone as the cards inside it — flat visual.
- Solution: introduce a third token `--band: #111111` — sits between bg and surface. Cards still pop, band reads as distinct, no hard dividers needed.
- Lesson: when adding a new tone to a dark theme, walk the existing palette and check what every nearby surface uses before picking a value.

### Hero alignment trap
- Original `.hero` used `align-items: center` to vertically center BOTH columns (H1 left, card right).
- Adding bottom padding to push the band away worked, but moving the H1 to top-anchor (so it could align with the card top) by switching to `align-items: start` ALSO dropped the card to the top — undesired.
- Fix: keep `.hero` at `align-items: start`, override per-column with `align-self: center` on `.hero-card-col` only. Grid alignment can be set globally and overridden per-cell.

### Drag-scroll text-selection bug
- Re-enabling `initDragScroll()` (was disabled in v1.26 perf pass) brought back a regression: dragging highlights text on the closest card.
- The 4px click-blocker prevents card opens but doesn't prevent text selection during the drag itself.
- Fix: `user-select: none` on `.nf-row` and `.episodes-row`. Text inside opened card backs is on a different element, so it remains selectable.
- Lesson: any draggable horizontal scroller needs user-select disabled on the scroll container itself.

### Dead code in buildEpisodes
- The pre-existing `buildEpisodes` had a `mixBar` variable being computed (`catCounts` aggregated, percentages calculated, HTML strings built) — but the result was never inserted into the card markup. The mix bar moved to the drawer header in v1.22 but the calculation was never removed from the card-render path.
- Removed in this session. ~10 lines, no behavior change. Just less code.
- Lesson: when a UI element migrates between components, grep for its computation and prune. Dead code is a comprehension tax on every future read.

### Podcast field — backfill before pipeline
- Adding `podcast` to `collections.json` for the 2 existing episodes BEFORE updating `extract-concepts.js` was the right order: site rendered correctly the moment new render code shipped, no waiting on the next transcript to populate the data.
- Default value `'Other'` in the function ensures old data flows through without crashing if anyone re-runs an older Intake row.

### Airtable Long-text 100k char limit (and the hours we lost finding it)
- "You are not permitted to perform this operation" is Airtable's error for at least three different conditions: actual permission denial, formula computation timeout on long input, AND silent Long-text length overflow. The error message is identically vague for all three.
- Diagnostic ladder that finally cracked it: (1) test short value in same field — works. (2) test long value in fresh row — fails. (3) disable formula field — works briefly, then fails after auto-recompute. (4) check character count externally — 128k chars, 28k over the field's hidden 100k cap.
- Lesson: when an Airtable error message is vague, **count characters first**. It's a 30-second test that eliminates one of the most common causes.
- Lesson: "Long text" in Airtable is not unlimited. The 100k cap is per-field-per-record, undocumented in the field-creation UI, and discovered only by users who hit it.

### Form-urlencoded as a permanent upgrade, not just a fallback
- The build journal flagged form-urlencoded as a backup plan in 2026-04-29. Six days later we needed it.
- Decision today: don't revert to JSON-string mode. Form-urlencoded is more robust for any payload with arbitrary user text, escapes are handled by HTTP standard rather than Airtable formula computation, and the Vercel function code doesn't care.
- Lesson: when a documented fallback path becomes useful, promote it to the default rather than treating it as an exception.

### The "trial expires soon" red herring
- During diagnosis I briefly suspected the Airtable trial was the cause of the permission error.
- It wasn't — the trial winding down doesn't revoke write permissions, just downgrades feature availability after the cutoff.
- Lesson: when "Trial: Expires Soon" is displayed prominently in the UI during a permission error, that visual proximity creates a false correlation. Always test the actual feature gate (try a small write, see if it works) before assuming the trial is the cause.

---

## 2026-05-05 — Hero redesign session

### Hero two-column layout
- Full-width hero (`width: 100%`) with `grid-template-columns: 1fr 1px 1fr` — no `max-width` wrapper. This is what allows the eyebrow line and stats border to bleed properly. Any `max-width` on the section itself kills the bleed.
- Eyebrow left-bleed trick: `::before` pseudo with `width: calc(3rem + 100vw); margin-left: calc(-3rem - 100vw)`. The `3rem` matches the column's left padding exactly — if the padding changes, update both values.
- `.h1-indent` was silently broken — it was nested inside `.hero h1 em {}` as a rule-within-a-rule. Browsers silently ignore this. Always check for malformed CSS when a class has no visible effect.
- `text-align: right` on `.h1-indent` (with `display: block`) gives the "echo/reply" indent without needing a fixed `padding-left` value that would break at different viewport widths.

### Stats bar alignment
- Root cause of misaligned numbers/labels: `text-align: left` on `.stat` combined with varying number widths. Fix: `text-align: center` + `flex: 1`. Each stat takes equal space, number and label always share the same center axis.
- Dividers between stats: `.stat + .stat { border-left }` — cleaner than adding explicit divider elements.

### Card back spacing
- `justify-content: space-between` on a flex column only distributes *direct children*. Previous markup had loose label + text elements — not grouped — so space-between had nothing to push apart. Fix: wrap each section in a `.hc-back-section` div. Three direct children = three evenly spaced sections.
- Card back uses `justify-content: space-between` via `.hero-card-back` class added alongside `.hero-card-face`.

### Source pills on card front
- Two pills side by side ("Modern Wisdom" + "Chris Williamson") were wrapping to two lines inside `.hc-meta` flex row because the row also contained the category pill. Fix: separate rows — category pill on `.hc-top-row`, source pills on `.hc-source-row` below it, with `white-space: nowrap` on each pill.

### File rename
- `index-netflix-test.html` renamed to `index.html`. Old `index.html` deleted from GitHub. Vercel picks up `index.html` automatically — no config change needed. Desktop backup kept until deploy confirmed.

### Gotchas
- The hero showcase card (Mental Masturbation) is hardcoded HTML — not pulled from `concepts.json`. This is intentional (it's a marketing card, not a browsable concept). **TODO**: when this concept is formally approved and published with an ID, update the hero card to load dynamically by ID.
- Hook copy: "Consuming self-improvement..." — the word "Consuming" was added in session. Airtable record should be updated to match if/when this concept is published.

---

2026-05-04 — Bulk upload tool: lessons from v1 build

What was built:
- `upload.html` — private browser-based tool that calls Claude API + Airtable REST directly.
- 3-variant extraction per concept (House / Preserved / Koe voice).
- Flexible source attribution via initials map in prompt.
- People field wired through to Airtable.

Key lessons:

Model name mismatch: first build used `claude-sonnet-4-20250514` — API rejected it immediately. Always check the current model string against what's live in the API. For this project use `claude-sonnet-4-5` until further notice.

Browser-direct API calls need a special header: Anthropic requires `'anthropic-dangerous-direct-browser-access': 'true'` on all requests made from a browser context (not a server). Missing this header = blocked request, no useful error message. Always include it in browser-based API tools.

Airtable rejects unknown field names hard: if you POST a field that doesn't exist in the table, Airtable returns `UNKNOWN_FIELD_NAME` error and rejects the entire record — not just that field. Fix: strip unknown fields before posting, or handle the error and retry. The upload tool does this automatically for `People`.

Prompt structure matters for shared vs per-variant fields: first prompt attempt generated plain/analogy/prompt three times (once per variant), wasting tokens and making Claude inconsistent. Moving shared fields outside the variants array reduced output size by ~40% and made the prose more consistent.

Plain field opening line problem: Claude defaulted to "The [Term] is..." as the first sentence of every plain field. Explicit instruction ("do NOT open with the term name followed by 'is' or 'means'") fixed it. Worth adding this instruction to any extraction prompt.

Term variants need a guard for fixed terms: without the "established term" check, Claude would generate 3 variants for "Liquidity" and "Moral Hazard" — unnecessary and confusing. The guard ("decide if the term is fixed/established before choosing whether to vary it") resolved this cleanly.

Outstanding fine-tuning for later sessions:
- Koe voice prompt is functional but not yet calibrated with real Dan Koe examples.
- Source initials map is hardcoded — needs updating as new authors are added.
- Consider adding score fields (Universality, Actionability, etc.) to the bulk upload prompt in a future pass.

---

2026-05-03 — Fuzzy search tuning: the "paradx matches separating" problem

What was built:
- Fuse.js fuzzy search across term / hook / plain / analogy / people fields.
- Browse Episodes peer heading (cosmetic, no logic).

Key lesson — Fuse.js threshold needs tuning per query length:

First round used threshold: 0.35, minMatchCharLength: 2, no distance limit. Looked fine on basic tests ("mimtic" → mimetic ✓, "Chris" → all his concepts ✓). Failed on real use: typing "paradx" returned 7 concepts, only one of which had "paradox" in the term. The rest were noise — "separating" matched because 4 chars overlap with "paradx" within Fuse's 0.35 distance budget.

Why this happens: Fuse's threshold is a ratio of allowed character distance vs query length. At 0.35 with a 6-char query, Fuse will accept matches that are ~2 edits away. Across 5 indexed fields per concept, plenty of unrelated words sit within 2 edits of any short query.

Fix: threshold 0.35 → 0.25, minMatchCharLength 2 → 3, added distance: 60.
- Threshold drop kills loose overlaps but still catches single-char typos.
- minMatchCharLength: 3 ignores 1–2 char fragments that cause incidental hits.
- distance: 60 forces matched characters to cluster, not span the whole field.

What to remember:
- Never ship Fuse.js with default settings. Always test typos AND noise. A fuzzy search that catches typos but also catches everything else is worse than substring matching.
- Test queries should include: a correct spelling, a typo of that word, AND a query that should match NOTHING. The third one is what catches over-matching.
- If results feel too generous: drop threshold first, then raise minMatchCharLength, then add distance limit. Each one trims a different failure mode.

Outstanding: none. Search behaves correctly on the test cases.

---

2026-05-03 — Progress bar polish session + the silent function shadow
What was built:

Progress bar: removed "Overall", inline VAULT button, magnetic hover
Card button rename: "Mastered" → "⊕ VAULT" / "✓ VAULT" everywhere (cards, episode drawer, COTD)
Vault SFX: two-note Web Audio chime on add-to-vault
Episode row repositioned (hero → episodes → app)
Single-category dead space fixed via dynamic min-height on #netflixRows

Key bug — counter showing — / — permanently:
Root cause: two <script> blocks both declared function updateProgress() at top level. The quiz's version (declared later in the file) silently overwrote the progress bar's version on the global object. render() was calling the quiz function, writing to hidden quiz DOM elements. No console error because those elements exist.
Fix: renamed quiz's updateProgress → updateQuizProgress (three call sites: definition, openQuiz, renderRound).
Lessons:

Top-level function foo() declarations across separate <script> blocks share the global namespace. Last declaration wins. Always namespace functions inside discrete feature blocks, or wrap them in IIFEs.
If something "doesn't update" with no console error, suspect function shadowing before suspecting fetch/DOM. Run console.log(yourFunc.toString()) in DevTools — it shows you which definition is actually live.
The classic debug trap: data is loaded, DOM exists, function runs, nothing happens. That's the signature of a different function with the same name running instead.
Don't chain speculative fixes. Three rounds of guarding against null/undefined/missing data went nowhere because the function being called wasn't the buggy one. Should have asked for updateProgress.toString() in DevTools at round one.

Outstanding issue (not blocking):

CLS regressed from 0.12 to 0.47 after making min-height: 1800px conditional on activeCat === 'all'. Acceptable for now — the dead-space UX win matters more than CLS on this page. Revisit when SEO becomes a priority.

---

## 2026-05-02 — Performance debugging session (the long one)

**What happened:**
After Quiz + Streak + COTD redesign sessions, `index-netflix-test.html` became progressively laggy. Took ~10 rounds of guess-and-fix before identifying the actual cause. Documenting the false leads and the real fix so we don't repeat the loop.

**The real cause: three infinite CSS animations.**
- `heroGlow` on `.hero::before` — animated `transform` + `opacity` on a 600×400px radial gradient, every 8s, infinite
- `pulse` on `.nav-dot` — opacity flicker every 2s, infinite, on a fixed nav element
- `cotdPulse` on `.cotd-eyebrow-dot` — same pattern, opacity flicker every 2s, infinite

On a Retina display these three running simultaneously caused continuous compositor work across the full viewport every frame, even when the elements were off-screen. Killing all three made the site instantly snappy.

**The diagnostic clue we missed for too long:**
*Site is fast when DevTools is open, laggy when DevTools is closed.* This is the signature of GPU/compositor pressure on Retina — DevTools opening shrinks the viewport, halving the pixels per frame. If you ever see this pattern again, **skip straight to looking for infinite CSS animations**, don't waste time on JS event handlers.

**False leads we chased (don't repeat):**
1. **Magnetic mousemove handlers** — initial suspicion, partly real. `initMagneticCards` on `#netflixRows` called `getBoundingClientRect()` on every pixel and was a contributor, but disabling it didn't fix the lag. Disabled and left disabled — small win, not the root cause.
2. **Drag-to-scroll on `.nf-row`** — 11 listeners × mousemove sounded expensive. Disabled it. Helped slightly. Not the cause.
3. **`backdrop-filter: blur(20px)` on `.daily-goal`** — fixed bottom bar with backdrop blur is a classic perf trap, replaced with solid background. Real fix, but didn't solve the main lag.
4. **`fadeUp` keyframes using `margin-top` instead of `transform`** — real bug, fixed (margin-top forces layout, transform is GPU). Helped CLS, not the lag.
5. **Per-card `animation-delay` stagger** — removed. Marginal win.
6. **`min-height: 1800px` on `#netflixRows`** — fixed CLS from 0.66 → 0.12. Real win for layout stability, not the scroll lag.

**Lessons:**
- **Infinite CSS animations are GPU-expensive even when off-screen.** The browser doesn't "pause" them when scrolled past — they composite every frame. For decorative pulse/glow effects, prefer static. If you must animate, don't run more than one infinite animation at a time on a Retina viewport.
- **`will-change` is not free.** It promotes elements to their own compositor layer permanently. Combined with infinite animations, this multiplies per-frame cost. Default to no `will-change`; add only when measurable benefit.
- **The DevTools open/closed test is a free diagnostic.** If lag disappears when DevTools opens, it's compositor pressure → look for animations, blurs, transforms, large fixed-position layers.
- **CLS and lag are separate problems.** The Performance panel's Layout Shifts tab tells you about jumps during load; it doesn't surface ongoing scroll lag. Don't conflate them.
- **When the conversation has lost the thread, ask for a Performance flame chart.** Should have done this in round 3, not round 10. A 5-second scroll recording shows exactly what the GPU is doing.
- **Don't chain speculative fixes.** If two rounds of "this should fix it" don't work, stop, ask for diagnostic data, change approach.

**Performance fixes that DID stick (keep all of these):**
- Removed `heroGlow`, `pulse`, `cotdPulse` infinite animations and their `will-change` declarations
- Removed `backdrop-filter: blur(20px)` from `.daily-goal`, replaced with solid `#0d0d0d`
- `fadeUp` animation now uses `transform: translateY()` not `margin-top`
- Removed per-card `animation-delay` stagger from `buildGrid` and `openEpisodeDrawer` card templates
- `#netflixRows` has `min-height: 1800px` to prevent newsletter section CLS
- `initDragScroll` short-circuited with `return;` (trackpad/swipe still works)
- `initMagneticCards` short-circuited with `return;` (nav + pill magnetism kept, those are fine)
- Search input debounced 180ms before triggering `buildGrid`
- `window.CONCEPTS = CONCEPTS` exposed after fetch so the quiz script (separate `<script>` block) can read it

---

## 2026-05-02 — Quiz Mode build session

**What was built:**
- Full 3-round quiz mode on `index-netflix-test.html`
- Nav button (desktop + mobile), overlay shell, Round 1 MC, Round 2 Fill Blank, Round 3 Tap-to-Match, interstitials, end screen

**Key bugs encountered:**

1. **Quiz didn't open at all after Steps 3–6 were pasted in**
   - Root cause: `renderRound2`'s `else {` branch (wrong answer) was never closed. The function ran straight into `renderRound3` without a `}`. JS syntax error halted all quiz script execution silently.
   - Fix: Close the `else` branch, add the `setTimeout` advance, close `r2Submit`, close `renderRound2`.
   - Lesson: When pasting multi-step code across sessions, always check that every function's opening `{` has a matching `}` before saving. One unclosed brace kills everything after it.

2. **Stray `<script>` tag doubled at top of quiz block**
   - Root cause: copied the replacement block including the opening `<script>` tag, but the previous tag was still there.
   - Fix: Delete the duplicate opening tag. One `<script>`, one `</script>`.
   - Lesson: When replacing an entire `<script>` block, select from `<script>` to `</script>` inclusive, then paste. Don't paste into the middle.

3. **Quiz showed "Concepts still loading" on every open**
   - Root cause: `getQuizPool()` reads `window.CONCEPTS` at click time but the variable name in the main script is `CONCEPTS` (module-scoped `let`), not explicitly `window.CONCEPTS`. The quiz script is a separate `<script>` block so it can't see the outer `let CONCEPTS` — it sees `undefined`.
   - Fix pending: expose CONCEPTS explicitly (`window.CONCEPTS = data` after fetch), or move quiz pool build into a `loadConcepts().then()` callback.
   - Lesson: Variables declared with `let` at the top level of a `<script>` block are NOT on `window`. Only `var` declarations or explicit `window.X = ...` assignments are globally accessible across script blocks.

4. **Rounds skipped instantly (interstitial fired without questions showing)**
   - Root cause: Same as bug 3 — pool was empty because `window.CONCEPTS` returned undefined. `pool.slice(0,4)` on an empty array = empty array. `qi >= concepts.length` is immediately true (0 >= 0), so the interstitial fired at once.
   - Fix: same as bug 3.

5. **Quiz sheet only filled bottom half of screen**
   - Root cause: `max-height: 92vh` on `.quiz-sheet` — if content is short (e.g. the empty placeholder), the sheet collapses to content height.
   - Fix: Changed to `height: 88vh` (fixed, not max). Sheet always fills 88% regardless of content.

**Performance findings:**
- `backdrop-filter: blur(24px)` on the fixed nav composites the entire page on every scroll frame. Reducing to `blur(6px)` noticeably improves scroll smoothness.
- `backdrop-filter: blur(16px)` on the quiz backdrop and `blur(12px)` on the COTD overlay have the same cost while open. Reduced both to `blur(4px)` + increased background opacity to compensate visually.
- `heroGlow`, `cotdPulse`, `pulse` (nav dot) — all infinite CSS animations. Adding `will-change: opacity` or `will-change: transform, opacity` promotes them to their own compositor layer and stops them triggering main-thread repaints.
- Site still has residual lag. Most likely remaining cause: the `initMagneticCards` mousemove listener fires on every pixel of mouse movement across the entire `#netflixRows` container. This is a hot path. Next session: throttle with `requestAnimationFrame` or add a `16ms` debounce.

**Lessons:**
- `let` declared in one `<script>` block is invisible to another `<script>` block. Use `window.X = value` to share state across blocks, or consolidate into one block.
- Quiz pool must be built after concepts load, not on click. The pattern: `loadConcepts().then(() => { window.CONCEPTS = CONCEPTS; })`.
- `height: 88vh` (fixed) is more reliable than `max-height: 92vh` for bottom-sheet overlays where content size varies.
- Always test a quiz or game mode with DevTools console open — silent JS errors are the most common cause of "nothing happens" bugs.

---

## 2026-05-02 — Streak + Share Card session

### Streak system
- Streak logic sits entirely in localStorage. Pattern: `{ count: N, lastDate: "YYYY-MM-DD" }`.
- `checkAndUpdateStreak()` is called inside `updateDailyGoal()` only when `n >= 5`. Do not call it elsewhere — double-counting risk.
- `initStreakDisplay()` on load checks if lastDate is today or yesterday before showing count. Anything older = broken streak = display 0.
- Daily goal threshold is intentionally 5 concepts *opened* (not mastered) — low friction by design. **Revisit this once you have real usage data.** Candidate upgrade: require 5 opened + 1 mastered. Don't change it speculatively.

### Canvas share card
- Canvas renders at 1080×1920. CSS `width: 100%` on the element handles display scaling — this is what gives sharpness. Never reduce canvas pixel dimensions to "save size".
- Google Fonts are not available inside canvas. Georgia (serif) substitutes for Playfair Display. `monospace` substitutes for DM Mono. Visually consistent, not pixel-identical.
- `roundRect()` is a manual path helper — Canvas API has a native `roundRect()` in modern browsers but Safari support was inconsistent at time of writing. Keep the manual version.
- Analogy section gets a left quote bar: `ctx.fillRect(PAD, y-8, 4, estimatedHeight)`. Height estimation is imperfect for very long analogies — acceptable at current content length.
- `nativeShare()` attempts file share first (`canShare({files})`). If that fails, falls back to text + URL only. Both paths include the full CTA message.
- The share modal has `max-height: 90vh; overflow-y: auto` — needed on small phones where the portrait canvas preview is tall.

### Gotchas
- `textAlign` must be reset to `'left'` after every `'right'` alignment in canvas — forgetting this breaks all subsequent text positioning.
- Canvas `fillRect` for section label backgrounds must be drawn *before* text, not after — painter's model.

---

### 2026-05-02 — Performance fix, full-width layout, card interactions

**What was built:**
- Removed noise overlay (performance fix)
- Full-width category rows with `.app-controls` centred wrapper
- Drag-to-scroll replacing auto-scroll RAF loop
- Magnetic lift effect on concept cards
- One-card-at-a-time expand behaviour
- Entry animation decoupled from `transform` so JS magnetic owns it

---

**Bug: Entire computer lagging — browser repaint storm**
- Root cause: `body::before` with `position: fixed` + SVG `feTurbulence` fractalNoise filter. Forces browser to repaint the entire viewport on every scroll tick. On Retina displays this is millions of pixels per frame.
- Fix: Delete the entire `body::before` block (~9 lines).
- Lesson: `position: fixed` elements with filter effects are repaint traps. Never put a texture/noise layer on a fixed full-screen pseudo-element.

---

**Bug: Cards not opening after drag-scroll was added**
- Root cause 1: `pointer-events: none` on `.nf-row.dragging *` permanently blocked all child clicks, including on the card-front, even after the dragging class was removed.
- Root cause 2: `setTimeout` delay on removing the `dragging` class meant clicks fired while class was still present.
- Fix: Removed `pointer-events: none` from CSS entirely. Used a `didDrag` boolean flag + capture-phase `click` listener on the row to block accidental opens only when actual drag movement (>4px) occurred.
- Lesson: `pointer-events: none` on a parent with a delay is a trap. Use a flag instead.

---

**Bug: All cards' borders lit up when one card was opened**
- Root cause: Visual — flex row stretches all siblings to the height of the tallest card (the open one). Cards appeared to expand together.
- Fix: `align-self: flex-start` on `.nf-row .concept-card`. Each card sizes itself independently; the row no longer dictates height.
- Lesson: `align-items: stretch` (flex default) causes siblings to match the tallest child. Always add `align-self: flex-start` to flex children that should size to their own content.

---

**Bug: Magnetic hover effect not working on cards**
- Root cause 1: CSS `animation: fadeUp` used `transform: translateY(16px)` on entry. The animation ran on every `buildGrid()` call (category switch, vault toggle), overwriting the JS magnetic transform for 350ms and making the effect appear broken.
- Root cause 2: Event delegation `mouseleave` with `capture: true` fired on every child element transition, not just card boundary crossings — causing constant transform resets while hovering inside a card.
- Fix 1: Changed `fadeUp` keyframes to use `margin-top: 12px → 0` instead of `transform`, so JS owns `transform` exclusively.
- Fix 2: Replaced capture-phase `mouseleave` delegation with an `activeCard` tracking variable inside `mousemove` — detects card boundary crossings without needing a separate leave listener.
- Lesson: Never share `transform` between CSS animations and JS. Pick one owner. If JS needs `transform`, remove it from all CSS keyframes that touch the same elements.

---

**Lessons:**
- Performance diagnosis first — always open DevTools Rendering → Paint Flashing before assuming JS is the culprit. The noise overlay was the root cause; everything else was compounding it.
- Event delegation is powerful but mouseleave/mouseenter in capture phase fires on every descendant boundary, not just the delegated element. Track the active element manually instead.
- `transform` has one owner. CSS animations and JS magnetic effects cannot both write to it without fighting.
- The `didDrag` pattern (flag + capture click blocker) is the correct solution for drag-vs-click disambiguation on scroll containers. Store it as a reusable pattern.

### 2026-05-01 — Netflix UI Test Round 2 (index-netflix-test.html)
 
**Session scope:**
Full UI/UX overhaul on a separate test file. No changes to `index.html`.
Test file: `index-netflix-test.html` on GitHub root.
Live at: `https://listen-learn-live.vercel.app/index-netflix-test.html`
 
---
 
**Bug: Test file gave 404 on first visit**
- URL used: `listen-learn-live.vercel.app/index-netflix-test` (no extension)
- Fix: Vercel serves static `.html` files when the full filename including `.html` is in the URL
- Lesson: always include `.html` in the Vercel URL for non-root files
---
 
**Bug: "FAILED TO LOAD CONCEPTS" on test file despite concepts loading**
- Root cause: `loadConcepts()` referenced `document.getElementById('conceptsGrid')` which no longer existed (replaced with `#netflixRows` in the HTML). The null check triggered the error display.
- Fix: updated all `conceptsGrid` references in `loadConcepts()` and `buildGrid()` to point to `netflixRows`
- Lesson: when renaming a DOM element ID, grep the JS for every reference — there are always more than one
---
 
**Bug: Netflix rows rendered but cards were blank**
- Root cause: `buildGrid()` (pasted from instructions) called `renderCard(c, i)` which didn't exist as a standalone function in the codebase — cards were rendered inline in the original `buildGrid()`
- Fix: replaced `renderCard()` call with inline card HTML template directly inside `buildGrid()`
- Lesson: when replacing a function that calls a helper, verify the helper actually exists before committing
---
 
**Bug: Auto-scroll broken on mobile (rows scroll wrong direction or not at all)**
- Root cause: `requestAnimationFrame` fires at variable rates on mobile; fixed `speed` value without delta-time compensation caused inconsistent speed. iOS also silently clamps out-of-bounds `scrollLeft` assignments
- Fix: normalized movement to `speed * (delta / 16)` per frame; added `row._autoScrollRAF` to cancel previous animations; all touch listeners use `{ passive: true }`
- Lesson: any scroll animation that uses `requestAnimationFrame` needs delta-time normalization to be device-agnostic
---
 
**Bug: "Today" nav link opened blank COTD modal, impossible to close**
- Root cause: `openCotd()` opens the overlay but doesn't render content. `initConceptOfTheDay()` skips rendering if the user already dismissed the COTD today. Nav bypass went around `initConceptOfTheDay()` entirely, opening an empty shell
- Fix: added `openCotdFromNav()` — always calls `pickTodaysConcept()` + `renderCotd()` before opening; re-wires button handlers in case `initConceptOfTheDay()` never ran; closes without marking dismissed
- Lesson: any UI element that opens a modal by calling just the "open" function (not the "init" function) will break if the modal has a lazy-render pattern. Always check whether the modal content is guaranteed to be populated before the open call
---
 
**Architectural decisions made this session:**
 
- **Test file strategy is correct.** Making changes in a separate `.html` file and testing on the same Vercel deploy (different URL) is the right pattern for risky UI changes. Promotes to `index.html` only when signed off.
- **Category pills: wrap > scroll.** Horizontal scrolling pills were unusable without a mouse scroll wheel. Wrapping to two centered rows solves discoverability for all devices without needing scroll arrows or indicators.
- **Magnetic hover is CSS + JS only, no library needed.** The effect is ~25 lines of vanilla JS per element type. No GSAP, no dependency.
- **YouTube thumbnail pull requires zero API keys.** `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg` is public. Always try `maxresdefault` first with an `onerror` fallback to `hqdefault`.

---

### 2026-04-30 — Episode drawer: Netflix-style bottom sheet (v1.22, Test Round 1)

**What was built:**
- Replaced the episode filter row with a full bottom-drawer overlay experience.
  Cards slide up over 88vh, page blurs behind, concept cards inside are fully
  interactive (flip, master — syncs to main grid in real time).

**Bugs hit during this session:**

- **Partial function replacement left orphaned code outside any function.**
  The old `buildEpisodes()` was not fully deleted when the new version was
  pasted. The tail of the old function (the `row.innerHTML = ...` map block)
  survived as floating top-level code. Browser threw `Uncaught SyntaxError:
  Illegal return statement` because the `return` inside the map callback was
  now at script root level. Fix: delete lines 2185–2218 (the orphaned tail).
  Lesson: when replacing a long function via copy-paste in GitHub's web editor,
  always verify the closing `}` of the old version is gone — bracket-match in
  your editor before committing.

- **Second bug: `col is not defined` after the first fix.**
  After deleting the orphaned tail, a second floating block remained — local
  variables (`epConcepts`, `catCounts`, `sortedCats`, `isActive`, etc.) from
  the old function body that referenced `col`, which no longer existed in
  scope. Same root cause — the replacement wasn't clean. Fix: delete the
  remaining lines (2185–2218 in the second pass).
  Lesson: after any partial-replace debugging session, upload the raw HTML file
  and have Claude read the exact line range before making further edits. This
  is faster than describing what you see on screen.

**Architectural decision made:**
- Episode browsing is a drawer, not a route. A separate `/episodes` page is
  deferred to Phase 2 once there are enough episodes to justify their own URL
  and SEO surface. The drawer is the right call at 2–3 episodes.

**What to watch for during Test Round 1:**
- Do users discover the episode cards organically, or do they need a label?
  ("Episodes" in DM Mono may be too subtle — watch scroll depth.)
- Does the blur/darken feel premium or disorienting on mobile?
- Do users try to swipe down to close? If yes, swipe gesture becomes Test Round 2 priority.
- Are people pills inside the drawer header sufficient, or do users want them
  on individual concept cards too?

---

### 2026-04-30 — Added "Vault of Ideas" feature: mastered concepts filter accessible via YOUR VAULT pill below the progress bar
- Progress bar counter now shows "13 / 183" format; clicking it also toggles the Vault
- Vault pill styled right-aligned, monospace, accent-colored when active
- Renamed "mastered" framing to "Vault of Ideas" throughout UI

---

### 2026-04-29 — D3 passed: first real episode through the pipeline

**What was built/tested:**
- Synced the embedded `EXTRACTION_PROMPT` in `/api/extract-concepts.js`
  to v1.2 (14 categories, full assignment rules, explicit "don't emit
  collection_id" instruction).
- Ran the first real podcast transcript through the live pipeline.
  Collection auto-created, concepts landed PENDING with `Collection ID`
  pre-filled, one was approved and published, people pills rendered
  on the live card. End-to-end green.

**Lessons:**

- **The `.txt` prompt file is documentation; the function string is
  the source of truth.** Same lesson as 2026-04-23. The 14-category UI
  shipped in v1.10 but the embedded prompt never got updated — concepts
  Claude assigned to the 7 newer categories were silently dropped by
  the validator with no useful log line. Add a sanity-check step to
  every prompt edit going forward: grep the deployed raw
  `extract-concepts.js` for the new content before declaring done.

- **Free-tier Make.com cannot send free-form text in `JSON string`
  body mode.** The escape functions that solve this on paid tiers
  (`escape("json")`, `json()`) aren't exposed. The viable fix is to
  pre-escape upstream — Airtable formula field with nested
  `SUBSTITUTE(...)` calls covering: `\` → `\\`, `"` → `\"`, `/` →
  `\/`, `\n` → `\\n`, `\r` → `\\r`, `\t` → `\\t`, null bytes → "".
  Map the formula field, not the raw text field. Worked on a real
  transcript (~57k chars) once the formula was complete.

- **Position number in Make's JSON parse error tells you where, not
  why.** First run failed at position 1235 (early in transcript —
  caught by basic substitutes). Second run at 57691 (deep in
  transcript — caught by extended substitutes). Third run failed
  because of a trailing comma in the body template, not the
  transcript at all. Lesson: when the position number changes
  drastically between runs, the previous fix worked and you're
  debugging a new bug. When it stays the same, your fix didn't land.

- **Trailing commas in JSON body templates are silently lethal.**
  Make's `JSON string` validator rejects trailing commas with the
  same generic "Expected ',' or '}'" error as unescaped quotes. Worth
  eyeballing the body template for one extra second after every edit.

- **Form-urlencoded mode would have been a cleaner alternative.** Did
  not need to switch in the end, but logging it: if `JSON string`
  mode ever becomes too fragile, switch the HTTP module to
  `application/x-www-form-urlencoded`. Vercel's body parser handles
  both transparently — no function change needed. Hold this for a
  future session if the pre-escape approach starts showing edge cases.

- **Silent-loss bugs are the worst kind.** No 500 error, no failed
  Make run — just fewer concepts than expected, with no obvious
  cause. Future improvement worth holding: log a line in
  `createConceptRow` when category validation fails, so we can see
  it in Vercel logs instead of hunting it down via missing-row
  arithmetic.

**Next:** PAUSE per roadmap. Use the live product for at least a
week before building anything else.

---

### 2026-04-29 — D2 shipped: people pills on cards

**What was built:**
- `index.html` fetches `collections.json` after `concepts.json`,
  builds `COLLECTIONS_BY_ID` lookup keyed by collection id.
- Card template gained a conditional `.people-pills` row between
  `.card-meta` and `.card-term`. Renders only when collection has
  `people.length >= 1`.
- New `.people-pill` CSS: muted, transparent, mono — deliberately
  different visual treatment from `.card-cat` so the two pills aren't
  confused at a glance.

**Test setup before any real episodes exist:**
- D3 hasn't run, so `collections.json` had no episode-type entries.
- Added a temporary test collection (id 10, type=episode,
  people=["Chris Williamson","Naval Ravikant"]) and pointed one
  existing concept's `collection_id` to 10.
- Verified pills render on that one card and nowhere else.
- Test entry + the reassigned concept stay in place until D3 produces
  a real episode collection. Cleanup is part of D3.

**Design decision: pills before the term, not after.**
- Considered placing pills below `.card-hook` (after the term).
  Rejected — by the time the eye reaches the hook, the attribution
  matters less. Putting pills next to the category pill keeps all
  metadata in one band at the top of the card.
- Trade-off: adds one more row of vertical space on episode cards.
  Acceptable — foundational-pack cards are unaffected.

**Lessons:**
- **Test entries are fine when isolated.** Adding a fake collection +
  reassigning one concept's `collection_id` was the cheapest way to
  verify the render path before D3 produces real data. The cleanup
  cost is two reverts during D3 — small price for catching CSS bugs
  on a real card today rather than under time pressure tomorrow.
- **The `.people-pills` row is conditionally rendered, not
  conditionally styled.** Empty wrapper divs cause subtle layout
  shifts even when their children are missing. Returning `''` from
  the IIFE keeps the DOM clean for the 162 unaffected cards.

---

### 2026-04-29 — D1 shipped: episode collections auto-create

**What was built:**
- `/api/extract-concepts.js` extended with `createEpisodeCollection()`
  helper. Creates a new collection in `collections.json` on GitHub,
  computes next id (`max + 1`, minimum 10), commits, returns the new id.
  Each PENDING concept written to Airtable gets that id pre-filled in the
  Collection ID field.
- New `People` field on the Intake table (Long text). Form-level required.
- Make.com Intake → Extract scenario body extended with `"people": "{{People}}"`.

**Architecture decision: single function (Path A) over two functions (Path B).**
- The collection and the concepts share a fate. Splitting them would
  introduce a new failure mode (collection created, then extract crashes,
  then collections.json has a garbage entry forever).
- The extract function already owns all the state needed for the
  collection write. Splitting would have meant routing the same payload
  to two functions in Make.com — extra ops, more wiring, no benefit.
- Trade-off accepted: function is ~330 lines instead of ~250. Still
  comfortably one-glance-readable.

**GitHub owner/repo: hardcoded, matched publish-concept.js.**
- Considered moving both functions to `GITHUB_OWNER`/`GITHUB_REPO` env
  vars. Decided against in this session — D1 was supposed to touch one
  file, not two. Refactor lives as a future infra cleanup.
- Both functions now use the literals `'pocsgeri1'` and `'listen-learn-live'`.
  If the repo is ever renamed, two places to edit.

**Bundled correction: `VALID_CATEGORIES` was stuck on 7.**
- Spotted while reading the live function. The publish function had been
  fixed in v1.17; the extract function was missed. Same bug class — any
  concept with a v1.7 category (identity, health, etc.) was being
  rejected at the Airtable write step.
- Bundled the fix into D1 because we were already editing the file.

**Did NOT touch the embedded `EXTRACTION_PROMPT` constant.**
- The prompt still tells Claude to use one of 7 categories. Claude is
  self-limiting to the old set. The `VALID_CATEGORIES` fix only stops
  the function from rejecting at the write step — it doesn't change what
  Claude returns.
- Held as a separate prompt-tuning session. Not blocking D2 or D3.

**Sequencing inside the function (matters):**
1. Call Claude API for concepts (don't waste a GitHub commit if Claude fails)
2. Create collection (commit to collections.json)
3. Loop and write concepts to Airtable (each gets Collection ID pre-filled)
4. Update Intake row to DONE/FAILED

If step 2 fails, no concepts are written — Intake row goes to FAILED with
the GitHub error. Clean rollback. If step 3 partially fails, Intake row
goes to DONE with a partial-failure note; the collection stays valid
because the concepts that did write reference it correctly.

**Operational notes:**
- Both Make scenarios were OFF before edits, ON after Vercel went green.
  Verified the deploy completed before re-enabling.
- Vercel build emits a benign ESM→CommonJS warning on every build. Not
  related to D1 — pre-existing since v1.4. Held as a future cleanup
  (would require adding `"type": "module"` to package.json and confirming
  nothing else breaks).
- 4 deployment recommendations on the Vercel dashboard noted but not
  acted on. Held until a dedicated infra session — none looked urgent.

**Lessons:**
- **Read the live function before designing.** The pasted file revealed
  two stale items (7-category whitelist, prompt) that the architecture
  brief didn't mention. One got fixed; one was scoped out. Without
  reading the file first, the design would have assumed both were
  already aligned.
- **Match the existing convention even when you don't love it.** The
  hardcoded owner/repo strings in publish-concept.js aren't beautiful,
  but introducing a new env-var pattern for one function while the other
  uses literals would have left the codebase in two conventions. One
  ugly convention is better than two pretty-but-divergent ones.
- **The prerequisite hidden in plain sight.** D1's brief said "create a
  collection with people from the Episodes table." Reading the code
  showed the Episodes table isn't actually in the intake flow — the
  Intake table is. The People field had to be added to Intake, not
  taken from Episodes. Easy miss if you trust the brief without
  verifying against the live system.

---

## v1.17 — Collection ID through publish path

Wired `collection_id` through the full Airtable → Make → publish function → concepts.json path. Took longer than expected. Burned ~5 Make credits on debugging before the actual problem became clear.

**Make.com's Airtable trigger caches schema.** When v1.16 added the Collection ID field to Airtable, the Make trigger didn't see it. The field didn't appear in the field picker because the trigger module's schema cache was stale from when it was first configured. Fix: re-select the Table dropdown in the trigger module to force a schema refresh. Lesson: any Airtable schema change requires re-saving the Make trigger module before new fields become mappable. Build this into the workflow for future schema additions.

**Make's templating fights JSON null.** Tried four approaches before landing on a working one:
- Bare token `{{Collection ID}}` — renders as nothing when empty, breaks JSON with "Unexpected token '}'".
- `ifempty(...; "null")` — output didn't render at all on the first attempt; root cause was actually the stale trigger schema, not the function.
- Pink `null` keyword pill from Make's keyword panel — renders as nothing when used as a function output. Looks like the right answer; isn't.
- `ifempty(\`Collection ID\`; "null"; \`Collection ID\`)` — sends the literal string `"null"` when empty. The publish function's `parseInt` returns NaN on `"null"` and falls through to JSON null. Inelegant but stable. **This is the production solution.**

The InvalidConfigurationError "Unexpected token '}'" from Make is the signature of an empty token rendering as nothing — a Make-side problem, not a Vercel-side problem. The HTTP module's Input log shows the rendered body before sending, which is how the empty `collection_id:` was diagnosed. Always check the Input log before assuming the function is wrong.

**Stale category whitelist found and fixed.** While reading the live raw `/api/publish-concept.js` before editing, noticed `allowedCategories` only listed 7 of the 14 valid categories. Any APPROVED concept in identity/health/philosophy/society/creativity/science/tech-ai would have been rejected at publish time with HTTP 400, even though the concept was valid by every other measure. Bundled the fix into the v1.17 commit. Worth scanning Make execution history for past 400s on these categories — they may explain ghost-failed publishes from earlier sessions.

**Project files had drifted from deployed code.** The `/api/publish-concept.js` in the project copy was less stale than what was deployed but still didn't match production exactly. Rule going forward: always pull the live raw file from GitHub before editing live infrastructure. Project files are reference, not source of truth.

**Concept ID in Airtable is decorative.** The `Concept ID` field in Airtable is NOT sent to the publish function and NOT used to determine the published id — the function generates `id` server-side via `max(existing id) + 1`. Old documentation showed Make sending `"id": {{Concept ID}}` in the body; this was always wrong (silently dropped by the function). Fixed in airtable-schema.md as part of v1.17.

**Verification:** Two real test rows (Test Concept Alpha with Collection ID = 1, Test Concept Beta with Collection ID blank) both published successfully end-to-end. Test concepts deleted from concepts.json after verification. Live count back to 165, next published concept gets id 166.

**Open task carried out of v1.17:** several APPROVED rows from before C3 was working failed to publish (mix of empty collection_id rendering bugs and missing Source values from test rows). They sit APPROVED in Airtable but aren't in concepts.json. Need a separate cleanup pass to either re-trigger them via status flip or fix the data and republish manually. Not blocking; just untidy.

---

## 2026-04-28 — A4: collection_id backfill, editorial mapping decisions

Bulk-assigned all 163 concepts to one of 6 foundational collections in a single commit. The 14 categories don't map 1:1 to 6 packs, so the editorial calls below are recorded for future-me.

### The clean fits (no judgment required)

Five packs already declared their categories in collections.json, so these were mechanical:

- Pack 1 (Mental Models) declared: thinking, psychology
- Pack 2 (Money & Risk) declared: finance
- Pack 3 (Power & Influence) declared: power, relationships
- Pack 4 (Language & Expression) declared: language
- Pack 5 (Identity & Self) declared: identity, philosophy
- Pack 6 (Business & Building) declared: business

### The judgment calls (where future-me will wonder why)

**society → pack 3 (Power & Influence), not its own home.**
Considered: pack 5 (Identity & Self), since concepts like tribalism and status anxiety shape who you are. Rejected because the *mechanism* in society concepts is almost always influence and group dynamics — tribalism, polarization, manufactured consent, status games, regulatory capture all describe how power flows through groups. Pack 3 is the right machinery.

**health → pack 5 (Identity & Self), not pack 1 (Mental Models).**
Considered: pack 1, since neuroplasticity is arguably a thinking-about-the-brain concept. Rejected because the 3 current health concepts (chronotype, neuroplasticity, the body keeps the score) read as "understanding yourself as a body" — closer to identity than to mental models. If health expands later into more cognition-focused concepts, this is worth revisiting.

**philosophy → pack 5, not split across pack 1 and pack 5.**
Considered: splitting concept-by-concept, since several philosophy concepts (skin in the game, second-order thinking, epistemic humility, defensive pessimism, negative visualization) are arguably thinking tools. Rejected because splitting a category across packs forces individual-concept assignment instead of a clean category rule, which raises risk on a 163-record bulk edit. Kept the category-level rule. If pack 1 starts feeling thin on philosophical foundations or pack 5 feels overloaded with thinking tools, revisit and reassign individual concepts then.

**Empty categories (creativity, science, tech-ai) — best-guess routing.**
- creativity → pack 6: best home for makers/builders.
- science → pack 1: scientific concepts function as thinking frameworks for this audience.
- tech-ai → pack 6: tech/AI concepts will most likely surface in business/building contexts here.

These routes will be tested as soon as content lands in those categories. If the gut feel is wrong, easier to fix early when there are 3 concepts than later when there are 30.

### Distribution sanity check

Pack 1: 73 | Pack 2: 9 | Pack 3: 34 | Pack 4: 3 | Pack 5: 21 | Pack 6: 23

Pack 1 is heavy because thinking + psychology together are 73 of 163 concepts (45%). Pack 4 (language only, 3 concepts) is thin. This is a feature of where the library currently is, not the mapping — language concepts are underrepresented in the source material. Worth noting when planning Phase 2 content priorities.

### Lessons / gotchas

- CSS grid on a single pill fights alignment badly. For a lone right-aligned element with fixed width, `display:flex + justify-content:flex-end + width:140px` is cleaner than trying to match the cat-grid columns.
- collections.json already declared category arrays for 5 of the 6 packs. Honored those declarations rather than re-deciding from scratch — saved time and prevented drift between collections.json and the actual data.
- Bulk edits to every record are higher-risk than single-concept changes. The "one downloadable file → one commit" delivery method (vs scripts or 163 find-and-replace edits) was the right call for a non-developer workflow.
- Group A (the cleanup phase) is now done. The next risk surface shifts from data hygiene to feature build (Phase 1 retention mechanics).

---

### 2026-04-28 — Duplicate concept removal (IDs 55, 68)

**What was done:**
- Deleted ID 55 "Manufactured Consent" (category: power) from `concepts.json`
- Deleted ID 68 "Defensive Pessimism" (category: thinking) from `concepts.json`
- Single commit directly to `main` via GitHub web editor
- Vercel auto-redeployed; live site now shows 163 concepts

**Why this direction (kept 144 and 150, deleted 55 and 68):**

For "Manufactured Consent" — ID 144 won on every field. Sharper hook
(8 words vs 13). Names Chomsky directly in the plain explanation, which
the v1.8 → v1.9 editorial pass had standardised on for attributed
concepts. More concrete analogy (specific candidate + news outlets vs
abstract referendum with both options written by the same group). More
pointed prompt (asks about a specific opinion you hold and who benefits,
vs a vague "where in your life"). And ID 144 was already in the
editorially correct category — `society`, where the v1.8 taxonomy
expansion placed framing/media-power concepts. ID 55 was still on the
old `power` category from before the expansion.

For "Defensive Pessimism" — closer call, both were good. ID 150 won on
hook (imperative voice, 10 words), the closing line in plain
("preparation transforms fear into a concrete plan"), and a more vivid
analogy (pilot running emergency procedures). ID 68's presentation-prep
analogy was arguably more relatable to the target user, but that was
the only field where it edged ahead.

Bonus consistency argument applied: keeping the higher-ID record of
each pair means both deletions follow the same rule. Easier to remember
later — "we kept the later, sharper versions."

**Operational notes:**
- ID space now has gaps at 55 and 68. IDs 1–165 with two missing.
  Confirmed `max(id) + 1` = 166 still produces the correct next ID for
  new concepts (the publish automation is based on max ID, not array
  length, so no automation change needed).
- Category counts after deletion: `power` 10 → 9, `thinking` 50 → 49.
  All other categories unchanged. Total 163.
- Nav pill correctly read "163 concepts" on first hard-refresh after
  Vercel deploy. This is the first real-world confirmation that v1.11's
  dynamic count system works end-to-end on a data change.

**Lesson reinforced (from 2026-04-27):**
- Logged this same-day, not retroactively. The 2026-04-27 lesson was
  "any concept merge / deletion / ID change gets a same-day journal
  entry." Followed it. The reasoning for *why* 144 and 150 were kept
  over 55 and 68 is now in this file rather than reconstructible only
  from comparing field text six months from now.
- The duplicate-removal task that had been pending since 2026-04-26 took
  one focused single-task session to land. Confirms the operating rule
  from earlier sessions: held tasks should be scheduled as their own
  session, not bundled with other work.

---

### 2026-04-28 — Phantom prompt dead code removed (v1.13)

**What was built:**
- Deleted the `const PROMPTS = { ... }` object and the `const getPrompt = (cat) => { ... }` helper from `index.html`.
- One commit, one verification pass on the live Vercel URL. Cards still
  render their real per-concept prompts (from `concepts.json`), COTD
  modal unaffected, no new console errors, mobile width verified.

**Closes:**
The 2026-04-25 phantom prompt bug, finally. The 04-25 fix swapped
`getPrompt(c.category)` for `c.prompt` so cards stopped pulling from
the placeholder pool — but the pool itself stayed in the file. ~45
lines of dead code lingered for three days. Now gone.

**Process notes:**
- Synced live `index.html` from GitHub raw view at start of session.
  Did not work from the project file. The 2026-04-26 sessions taught
  this lesson; the 2026-04-28 source-filter session reinforced it;
  this session followed it without thinking about it. Discipline is
  becoming default.
- Pre-deletion grep for `PROMPTS` and `getPrompt` confirmed zero
  external references before the cut. Worth doing every time — the
  whole point of "dead" code is that nothing should break when it
  goes, and the only way to know that is to check.

**Lesson reinforced:**
- A bug fix and the cleanup that follows it are two different commits.
  Both need to ship. The 04-25 fix made the symptom disappear; only
  the 04-28 cleanup made the cause disappear. Track the cleanup as
  a real task, not a "while I'm in here" intention — those evaporate.

---

### 2026-04-28 — Source filter UI removed from index.html (v1.12)

**What was built:**
- Removed all 9 pieces of the source filter UI from `index.html`: the
  CSS block, the markup div, the `SOURCES` array, the `SRC_LABEL`
  object, the `activeSrc` variable, the `buildSrc()` and `setSrc()`
  functions, the `buildSrc();` call inside `render()`, and the `ms`
  filter line inside `filtered()`.
- One commit, one verification pass on the live Vercel URL, no console
  errors, all other features (category filter, search, mastered state,
  daily goal, COTD modal) verified still working.

**Process notes:**
- Synced the live `index.html` from GitHub raw view at the start of the
  session. This is the discipline the 2026-04-26 sessions lacked.
- Followed the micro-step protocol (locate → verify → replace → commit →
  verify live → document). Worked cleanly. No drift, no rework.

**Lesson reinforced:**
- Single-task sessions with explicit verification gates are how this
  kind of cleanup gets done without regressions. The temptation to
  bundle "while we're in here, let's also delete the dead `PROMPTS`
  object" was real — and correctly resisted. That's a separate session.

---

### 2026-04-27 — Documentation cleanup pass

**Context:** the 2026-04-26 sessions ran against locally-cached copies of
`index.html` and `concepts.json` that were not synced with GitHub. Several
changes were drafted against stale files and never reached the live site.
The docs from those sessions described the work as done — they describe
the intent, not the live state.

**What was actually live as of 2026-04-27:**
- `concepts.json` has **165 records, IDs 1–165 contiguous, no gaps**.
- IDs 55 and 68 ARE duplicates of 144 and 150 (confirmed by matching terms).
- Source filter UI is fully alive in `index.html`.
- Hardcoded "160" remains in nav, hero, How It Works copy, and progress
  bar fallback.
- `getPrompt()` and `PROMPTS` object dead code is still in `index.html`.

**What I corrected in the docs (no code changes this session):**
- changelog.md v1.7 rewritten as honest "what landed vs. what didn't"
- changelog.md v1.8 distribution replaced with live distribution
- changelog.md v1.10 entry added documenting this cleanup
- architecture.md concept count fixed to 165
- architecture.md publish-path baseline section added
- roadmap.md "immediate next session" pointer added (C1+C2+C3)
- roadmap.md Phase 1 status fixed
- airtable-schema.md Concepts and Episodes tables corrected to current state
- extraction-prompt-v1_2.txt header version + JSON syntax error fixed
- "163 concepts" replaced with "165 concepts" across all docs
- lean-canvas.md "Live site with 160 concepts" updated to 165

**Lessons (for future me):**
- **Sync project files BEFORE every session that will touch them.** The
  Claude project knowledge is a snapshot; if the live GitHub files are
  newer, Claude is running blind.
- **When a session claims work was "done," verify on the live URL before
  documenting it as complete.** Hard-refresh the Vercel deployment, not
  the Claude preview.
- **One coordinated change at a time, validated end-to-end.** The
  multi-change session that produced this drift moved too fast to
  catch the sync gap.
- **Annotating old entries is more honest than rewriting them.** The
  v1.7 changelog rewrite preserves the history of what was attempted
  and why it didn't land — which is more useful than pretending the
  intent was the outcome.
- **A documentation audit takes 1–2 hours and pays for itself within
  the next session.** Build this in as a quarterly habit.

---

### 2026-04-26 — Concept of the Day modal shipped (B2)

**What was built:**
A modal that overlays the page on first visit each day with one concept,
chosen deterministically by date so all visitors see the same concept on
the same day. Dismissed via X, Esc, click-outside, or "Continue to library"
link. Persists dismissal in localStorage until next calendar day.

**Decisions made:**
- Reused the existing `prompt` field as the "Use it today" line rather
  than adding a new `useToday` schema field. The dedicated field is a
  better long-term solution but blocks the MVP on content generation
  for 163 concepts. Revisit in Phase 1.5.
- Day-deterministic over per-user random. Creates a shared ritual ("did
  you see today's?") and removes any need for accounts. The seed is
  `YYYYMMDD % pool.length`.
- Mark Internalized counts toward both `mastered` and `openedToday`.
  The reasoning: someone who reads the modal at 8am should get credit
  for it in their daily streak. Otherwise the modal feels disconnected
  from the rest of the product.
- "Try Another" button does NOT count as dismissal. User is still inside
  the today moment.

**Watch out for:**
- The `loadConcepts()` call now returns a promise chain. Anything else
  that needs concepts loaded must hook into `.then()` after it, not run
  in parallel.
- Storage key `lll_cotd_dismissed_v1` is a NEW key. If we ever bump it
  to v2, every user gets one "free" re-show of the modal regardless of
  prior dismissal. Plan migrations accordingly.
- The category color on the modal is set via inline `style` on
  `#cotdCard` (CSS custom property `--cotd-accent`). If we ever style
  the card via stylesheet only, this inline override needs to stay or
  the colour will fall back to the default gold accent.

**Deferred for next session(s):**
- Generate dedicated `useToday` content for all 163 concepts (Phase 1.5).
- Add small share button on the card (defer until first signs of
  organic word-of-mouth — premature share UI is clutter).
- Consider whether to show the modal at all on mobile during the first
  session (or wait until visit 2). Hypothesis: first-time mobile users
  may bounce from a popup before the site loads. Watch the analytics.

### 2026-04-26 — Architecture migration session: A3 + A1 + B1 + A2 decision sheet

**Context:** Executing the architecture redesign from the prior brainstorm
chat — collections model, 14 categories, source attribution moved off the
concept onto the collection. One step per file. Validated each step before
moving on.

**Outcomes:**
- ✅ A3: `collections.json` confirmed on GitHub with 6 foundational packs
- ✅ A1: All 163 concepts now have `"collection_id": null` (committed)
- ✅ B1: 14-category UI live; source filter UI gone; dynamic counts wired up
- 📋 A2: Decision sheet produced (below); application deferred to next session

**Tooling lessons:**

1. **Browser regex find-and-replace is fragile for multi-line patterns.**
   First attempt at A1 in vscode.dev failed with "Lone quantifier brackets" —
   the regex got mangled by copy-paste from chat. Switched to script-based
   approach: paste full file → Python parses JSON properly → emits validated
   output → paste back. ~10x faster, zero risk of malformed output.
   **Going forward: any change touching all-of-N records goes through a script.**

2. **JSON validation is non-negotiable before commit.**
   The script approach validates by `json.loads()` round-trip. The manual
   approach should validate at jsonformatter.curiousconcept.com. Skipping this
   step is how the live site goes down.

3. **Claude's preview pane != Vercel.**
   Mid-session, Claude's HTML preview showed "Failed to load concepts.json
   404". This was confusing for a moment — file looked broken. It wasn't.
   The preview can't reach `/concepts.json` because that file is on GitHub,
   not in Claude's sandbox. The error message I built into `loadConcepts()`
   ("open it through your Vercel URL instead") was doing exactly its job.
   **Lesson: only ever validate visual changes by hard-refreshing the
   actual Vercel URL, not the Claude preview.**

4. **GitHub web editor can introduce a UTF-8 BOM during paste.**
   This is what was causing the Quirks Mode warning even though the local
   file had a clean `<!DOCTYPE html>` at byte 0. Confirmed with a hex dump.
   Workaround if it returns: edit the file again on GitHub, click immediately
   to the left of `<!DOCTYPE` in the editor, press backspace once to delete
   the invisible BOM character, save.

5. **Documenting operational events at the time saves debugging later.**
   Spent ~5 minutes mid-session resolving the 163-vs-165 mystery. The cause
   (two duplicate-pair merges during APPROVED-flow testing) was never logged.
   It now is — but as a retroactive entry, which is worse than logging when
   it happened. Going forward: any concept merge / deletion / ID change
   gets a same-day journal entry.

**The 163-vs-165 mystery, resolved:**
- *Original resolution from this session:* IDs go from 1 to 165, IDs 55
  and 68 missing because of duplicate merges, total 163.
- *Actual current state on the live `concepts.json` (verified 2026-04-27):*
  IDs 1–165 contiguous, no gaps, IDs 55 and 68 still present as
  duplicates of 144 and 150. The merge described in this session was
  attempted but did not reach the live file (see 2026-04-27 cleanup
  entry above).
- *Live total concepts:* 165 records.
- *Next-up ID for new concepts:* 166 (`max(id) + 1` works regardless of
  whether duplicates are eventually removed).
- *Pending:* the ID 55 / ID 68 duplicate removal is a held build task.

**Decisions made this session that will affect future work:**

- **Source field is now legacy.** Existing 163 concepts keep their `source`
  value as historical data. UI ignores it. Airtable + Make.com still write
  it on new concepts (must remain a valid value: core / cw / ah / dk).
  Group C (workflow layer) will eventually retire it from the write path.

- **Categories are alphabetical, "All" first.** Not thematic. Reason: scales
  better as categories are added or removed; no manual row management on
  desktop, no rethinking when the layout changes.

- **CSS grid uses `minmax(110px, 1fr)`.** Was 140px. Smaller minimum lets
  15 boxes wrap to two clean rows on standard desktop without an orphan
  row of 1. Watch out: on very wide viewports (>1500px) you'll get all
  15 in one long row. That's fine and intentional.

- **Empty categories (creativity, science, tech-ai) are visible but empty.**
  Decision deferred: whether to hide them, badge them as "coming soon", or
  let them sit empty as a roadmap signal. Park this until after Phase 1
  retention work; revisit when category counts have settled.

- **Category pill on cards: identified as needed but not built yet.** When
  the source pill was removed, cards lost a quick-glance "what kind of
  concept is this" signal. The accent stripe carries colour but only on
  interaction. B1.1 (next session) adds a small category pill in the slot
  the source pill used to occupy.

---

### A2 decision sheet — re-categorisation of all 163 concepts

**Application status:** PENDING. Apply via script in next session.

**Decision principles used:**
1. Tech-AI is strict — only true technology/computation/AI concepts. Not
   "things that happen on the internet."
2. Identity vs Psychology — psychology = how the mind works in general;
   identity = how you specifically construct and maintain self-concept.
3. Philosophy vs Thinking — thinking = mental tools/frameworks for solving
   problems; philosophy = bigger questions about meaning, ethics, existence.
4. Society vs Power — power = dynamics between specific actors; society =
   collective/structural forces affecting groups.
5. Health — anything related to physical/biological health, body, sleep,
   nervous system. Underused now but reserved for future content.
6. Language is flagship — but strict: rhetorical and communication-mechanism
   concepts only, not "any term with a definition."
7. Creativity stays empty — no current concept fits cleanly. Reserved.
8. Science stays empty — same reasoning.

**Moves (concept ID, term, current category → new category):**

FROM finance:
- 52  Diminishing Returns      → thinking
- 65  Externalities            → society

FROM psychology:
- 38  Tribalism                       → society
- 67  Groupthink                      → society
- 81  Parental Attribution Error      → identity
- 82  Atlas Complex                   → identity
- 85  Toxic Stoicism                  → identity
- 88  Civilizational Anxiety          → society
- 92  Status Anxiety                  → society
- 104 Radical Acceptance              → philosophy
- 105 Identity-Based Habits           → identity
- 106 Neuroplasticity                 → health
- 109 The Body Keeps the Score        → health
- 146 Ingroup Favoritism              → society
- 147 Ego vs Self-Esteem              → identity
- 161 Limbic Capitalism               → society

FROM thinking:
- 89  Meaning vs Happiness                              → philosophy
- 97  Intentional Living                                → philosophy
- 124 The Discipline Paradox                            → identity
- 127 Self-Actualize → Self-Monetize → Self-Transcend   → philosophy
- 131 Sovereign Individual                              → philosophy
- 148 Chronotype                                        → health
- 154 Negative Visualization                            → philosophy

FROM power:
- 60  Meritocracy (myth of)    → society
- 70  Regulatory Capture       → society
- 94  The Status Game          → society
- 102 Attention Economy        → society
- 144 Manufactured Consent     → society
- 158 Overton Window           → society

FROM relationships:
- 95  Male Loneliness Epidemic → society

FROM language:
- 22  Non-Zero Impact           → thinking
- 26  Skin in the Game          → philosophy
- 32  Agency                    → philosophy
- 43  Polarization              → society
- 47  Entropy                   → thinking
- 62  Paradigm Shift            → thinking
- 66  Epistemic Humility        → philosophy
- 71  Narrative Identity        → identity
- 76  Abstraction               → thinking
- 77  Tipping Point             → thinking
- 86  Modern Bravery            → identity
- 87  Performative Authenticity → identity

All other concepts stay in their current category.

**Final category counts after A2 applied (projected at session time):**

| Category       | Before | After | Change |
|---------------|--------|-------|--------|
| business       | 23     | 23    | —      |
| creativity     | 0      | 0     | —      |
| finance        | 11     | 9     | -2     |
| health         | 0      | 4     | +4     |
| identity       | 0      | 11    | +11    |
| language       | 3 (was 15) | 3 | -12   |
| philosophy     | 0      | 9     | +9     |
| power          | 15     | 9     | -6     |
| psychology     | 38     | 25    | -13    |
| relationships  | 11     | 10    | -1     |
| science        | 0      | 0     | —      |
| society        | 0      | 16    | +16    |
| tech-ai        | 0      | 0     | —      |
| thinking       | 50     | 44    | -6     |
| **total**      | 163    | 163   | —      |

**Live distribution as of 2026-04-27 (verified post-cleanup):**

| Category | Count |
|---|---|
| business | 23 |
| creativity | 0 |
| finance | 9 |
| health | 3 |
| identity | 9 |
| language | 3 |
| philosophy | 9 |
| power | 10 |
| psychology | 24 |
| relationships | 10 |
| science | 0 |
| society | 15 |
| tech-ai | 0 |
| thinking | 50 |
| **total** | **165** |

The live count is 2 higher than the projection (165 vs. 163) because the
two duplicate IDs (55 and 68) were never removed. Several individual
category counts also drift by 1–2 from the projection — close enough that
the A2 moves clearly applied, but not identical.

### 2026-04-26 — Schema migration: collection_id added; documenting the duplicate merge

**What was built:**
- Added `"collection_id": null` to every concept in `concepts.json` via regex find-and-replace in vscode.dev
- 163 concepts updated, validated against jsonformatter, committed to GitHub
- Site rendering unaffected — code does not yet read this field

**Documenting an earlier undocumented event:**
- During earlier APPROVED-flow testing, two duplicate concept pairs were merged
- Result: ID space goes up to 165 but actual concept count is 163
- The next-ID-up-from-max logic in /api/publish-concept will assign 166 to the next new concept (correct behaviour — based on max ID, not array length)

**Lessons:**
- Schema additions are safer than schema changes. Adding a field with `null` default = zero risk to live render. Renaming or removing is where things break.
- Always validate JSON before commit. Always.
- Document operational events (merges, deletions, reassignments) in the journal *as they happen*, not weeks later. The 163-vs-165 discrepancy was a 5-minute mystery this session that should have been a 5-second answer.

### 2026-04-25 — Phantom prompt bug

Cards on the live site weren't showing the prompts from concepts.json. They were pulling random prompts from a hardcoded PROMPTS object in index.html (3 per category, ~21 total) via a getPrompt() helper. Likely a placeholder from before concepts.json had a prompt field per concept that never got removed. Fixed by replacing getPrompt(c.category) with c.prompt — the cards now render the real prompts.

**Note (added 2026-04-27):** the dead `PROMPTS` object and `getPrompt()` helper themselves are STILL in `index.html` (lines ~1393–1434). The bug fix worked because cards no longer call them, but the dead code was never deleted. Held as a pending cleanup task; see roadmap.md.

Lesson: When data fields and rendering helpers both exist for the same purpose, one is almost certainly stale. Audit render code against schema after every schema change.
Process lesson: Project files in Claude don't auto-sync with GitHub. Re-upload index.html and concepts.json before any session involving code review, or line numbers and assumptions will drift.

### 2026-04-24 — Automation 1 live: transcript form → Claude API → Airtable PENDING
 
**What was built:**
- Airtable `Intake` table + public form view "Submit Transcript" as the pipeline entry point
- Vercel serverless function `/api/extract-concepts.js` that:
  - Authenticates with the shared `X-Publish-Secret` header
  - Validates transcript length (min 500 chars)
  - Calls Claude API (`claude-sonnet-4-5`) with the full extraction prompt as the system message and transcript as user message
  - Parses the returned JSON array (with markdown-fence stripping as a safety net)
  - Normalizes `term` field to English Title Case via a `toTitleCase()` helper before writing
  - Writes one Airtable Concept row per extracted concept with Status=PENDING and all scoring fields mapped
  - Updates the Intake row on completion with DONE/FAILED status, concepts-created count, and error details
- Make.com scenario `LLL — Intake NEW → Claude → Concepts PENDING` — Airtable Watch Records → HTTP POST
- 3 new Vercel env vars: `ANTHROPIC_API_KEY`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`
**Key decisions made:**
 
1. **Airtable form as the submission front door, not a custom web form**
   - A public Airtable form is free, zero-infrastructure, and handles huge transcripts natively.
   - Zero code to maintain, and the submitter (just me for now) already has Airtable open anyway.
   - When Phase 3 brings a "submit an episode URL" public feature, that's a different UI problem — this one is operator-facing.
2. **Kept the Option D path — manual paste, no yt-dlp / AssemblyAI yet**
   - Goal of this build session was to validate the extraction half. Transcript acquisition is decoupled.
   - youtubetotranscript.com + paste works fine for now; the server-based fetcher is the next phase.
3. **Function writes directly to Airtable Concepts table instead of returning JSON to Make.com**
   - Alternative was: function returns array, Make.com iterates and creates rows via Airtable module.
   - That would have been 1 + 30 Make ops per episode. Writing from inside the function = 1 op total.
   - At free-tier's 1000 ops/month budget, this is the difference between 30 episodes/month vs ~960.
4. **Reused `PUBLISH_SECRET` across both functions instead of creating a separate `EXTRACT_SECRET`**
   - Both functions are internal, both are called only by Make.com, both serve the same pipeline.
   - One secret to rotate, one less env var to track.
5. **Title Case normalization in code, not in the prompt**
   - Claude returned terms in inconsistent case ("inner citadel", "thin slice jealousy") vs the existing library's Title Case style.
   - Two options: (a) add a capitalization instruction to the extraction prompt, (b) post-process in code.
   - Chose (b) because Claude is stochastic — prompt instructions are followed most of the time, not always. A `toTitleCase()` function in the serverless layer runs deterministically on every term regardless of what the model returns.
   - **Architectural note:** When formatting must be exact, enforce it in code after the model response. Prompts shape, code guarantees.
6. **Turned automations OFF after build session complete**
   - Still iterating on the extraction prompt. No point in burning Make ops or Claude credits on hourly polls when there's nothing new to process.
   - Flip back ON once the prompt is stable.
**Key bugs encountered and fixed:**
 
1. **ReqBin smoke test (Phase 5) failed with "Cannot process your request"**
   - Likely cause: unescaped quotes / newlines in the pasted transcript breaking the JSON body before it left the browser.
   - **Fix:** Skipped ReqBin entirely. Went straight to Make.com test, since Make's field-pill system auto-escapes the transcript content.
   - **Gotcha:** ReqBin (or any manual JSON-paste tool) is the wrong tool for testing anything that includes user-pasted prose. Let the real automation do the escaping.
2. **Extracted terms came back in lowercase ("inner citadel", "thin slice jealousy") instead of matching the existing library's Title Case style**
   - The original extraction prompt didn't specify capitalization, so Claude produced model-default lowercase.
   - **Fix:** Added a `toTitleCase()` helper at the bottom of `/api/extract-concepts.js` with English minor-word rules (a, an, the, and, but, or, nor, for, so, yet, at, by, in, of, on, to, up, as, is, if, vs) — applied to `concept.term` before the Airtable write.
   - **Gotcha when editing the file:** First attempt pasted `toTitleCase` inside the body of `updateIntakeStatus`, between `headers` and `body` of the fetch call. Broke both functions. Lesson: when adding a helper function, always place it at the top level of the file — not nested inside another function's body.
3. **Misconception about where the extraction prompt lives**
   - I thought `extraction-prompt.txt` in the project was the live prompt. It isn't — it's documentation. The real prompt is the `EXTRACTION_PROMPT` constant inside `/api/extract-concepts.js`.
   - **Rule going forward:** When tuning the prompt, edit the constant in the `.js` file and commit. Update the `.txt` as documentation afterward so they stay in sync.
**Lessons:**
 
- **The "write to destination from inside the function" pattern keeps Make.com ops cheap.** Each Make module call = 1 op. Moving the loop into the function turns N ops into 1.
- **Airtable forms are the cheapest submission UI that exists.** For any operator-facing workflow, use them before reaching for a custom webpage.
- **Specify formatting in the extraction prompt AND enforce it in code.** Prompts shape, code guarantees. If the style must be exact, don't rely on the model alone.
- **Smoke-test tools like ReqBin are flakier than the real pipeline.** If ReqBin fails on messy input, skip it. Make.com with field pills is a better test bed for anything with pasted text.
- **Top-level function vs nested function is a real gotcha when editing JavaScript in the GitHub web UI.** Always confirm the function you're pasting sits between two other top-level `async function` or `function` declarations — not inside a `{ ... }` body.
- **The `.txt` version of a prompt is documentation, not the source of truth.** The source of truth is whatever string the function actually sends to the API. Treat them like code vs comments.
- **Turn scenarios OFF during iteration.** Free-tier budgets are small; don't burn them on polls when nothing is queued.
- **Match the existing library's style before bulk-publishing.** Easier to audit the first 20 concepts than to clean up 500 later.

### 2026-06-11 — v1.77 — Stories tab, story UX fixes, state machine overhaul

**What was built:**
- Stories tab (4th panel tab) with formatted paragraphs, clickable term pills, expand on click
- Scenario pills wired to launch story mode directly with category-matched concept sets
- Full state machine audit and fix: "Back to starter", "Change topic from story mode", concurrent API call bug, blank box after story exit, missing actions/nav buttons

**Key bugs encountered and fixed:**

1. **"Back to starter" showed category grid instead of concept + prompt**
   - `_csCloseStoryMode` was calling `pickerWrap.style.display = ''` which restored the picker (candidates + category grid), not the main concept view
   - **Fix:** close picker entirely (`pickerWrap.classList.remove('active')`), call `_csPickerShowMain()`
   - **Gotcha:** `_csPickerShowMain` itself had to be fixed — see bug #3 below

2. **No buttons visible after "Back to starter" (no Copy, no Surprise, no nav)**
   - `csActions` and `csRevealRow` are hidden via `cs-hidden` CSS class at modal init, only shown via `_applyAIToCtx → _csShowPostPrompt`
   - `_csPickerShowMain` only cleared inline `display:none` on 6 picker-hidden elements — did not restore `csActions`/`csRevealRow`
   - **Fix:** `_csPickerShowMain` now explicitly adds `cs-visible` to both; shows the generate button as a fallback when `_csAIData` is null
   - **Rule: any function that "restores" the CS view must also handle csActions + csRevealRow — picker hide and class-based hide are two separate systems**

3. **`_csPickerShowMain` had no fallback for null `_csAIData`**
   - After scenario pill → story mode → "Back to starter", `_csAIData` is null (story mode never generates CS data)
   - `_csPickerShowMain` fell through all three cache checks without showing anything — empty white box
   - **Fix:** final else branch now shows the generate button explicitly (doesn't auto-fire `_loadAI` — avoids surprise API calls)

4. **Concurrent API calls from scenario pills corrupting CS view**
   - `spScenarioPill` called `_csOpenPanel()` → `openCSFromNav()` → `_loadAI(primary, ctx, true)` immediately
   - 350ms later: story mode started a second API call
   - When CS `_loadAI` resolved (~2–4s), it called `_applyAIToCtx` which tried to render into a UI locked in story mode — then story's response came back and fought it
   - **Fix:** scenario pills now call `openCS()` directly (opens panel, no auto AI fire)
   - **Rule: `openCSFromNav()` always fires `_loadAI` if `_csAIData` is null — never call it when you want to open the panel without generating a CS**

5. **`_csCtx` set to raw scenario name ('work', 'dinner') — not a valid CS context key**
   - `CS_OPENERS` only knows `friend / partner / colleague / meeting`
   - Passing `'work'` produced blank opener text and the API received an unrecognised context key
   - **Fix:** `SP_CTX_MAP` maps each scenario pill to the nearest valid CS context key
   - **Rule: always check CS_OPENERS before assigning _csCtx from any new entry path**

6. **"Change topic" from story mode left two UIs overlapping**
   - `_csToggleTopicReveal` opened the picker without dismissing the story panel — both visible simultaneously
   - **Fix:** dismiss story panel + restore headline at top of picker open branch

7. **Term popup overlap: shared clamp caused stacking on small viewports**
   - All 3 cards used `Math.min(rawTop, window.innerHeight - cardH - 10)` — with a short viewport all 3 clamped to the same position
   - **Fix:** two-pass positioning — insert off-screen, measure actual heights, compute positions top-down with guaranteed 14px gaps
   - **Rule: never use a shared clamp for stacked floating elements — each element needs its own independent bottom boundary**

8. **`_csInjectCandidatesAndStory` didn't hide csActions/csRevealRow**
   - These bled through visually behind the story panel
   - **Fix:** explicitly `display:none` both at story inject; `_csCloseStoryMode` clears them on return

**Lessons:**

- **CS visibility has two independent systems: inline `style.display` (from `_csPickerHideMain`) and CSS classes (`cs-hidden/cs-visible`) from `_csHideAll`/`_csShowPostPrompt`.** Any restore function must handle both. Forgetting one means elements stay hidden with no visible error.
- **`openCSFromNav()` always fires `_loadAI` — this is a dangerous assumption for entry paths that manage their own AI calls.** Use `openCS()` directly when you want panel-open-only behaviour.
- **Every new CS entry path must explicitly set `_csCtx` to a valid `CS_OPENERS` key.** Passing an arbitrary string produces silent failures (blank text, API mismatch).
- **Two-pass positioning for floating stacked elements is non-negotiable.** Estimating heights from a constant is always wrong for variable-length text. Measure after layout; position after measurement.
- **Hover elevation (`scale + z-index`) is the right fix for cards that can partially overlap.** It gives the user control without requiring pixel-perfect no-overlap layout (which breaks on small screens).
- **Story mode and CS mode share all the same DOM elements.** They cannot run concurrently — any function that opens the panel must make a deliberate choice between "story entry" and "CS entry". Document that choice at every call site.

---

### 2026-06-10 — Story Mode (Phase D): lessons from a multi-bug session

**What was built:**
- Story Mode for the CS Panel: AI-generated story from 3 picker candidates, inline gold label pills with tooltips, rotating loading messages, floating term popup cards, `lll_cs_stories_v1` auto-save
- Story flow: Change Topic → pick category → 3 candidates stamp in → `★ See how these connect` appears → story generates, replaces picker view

**Key bugs encountered and fixed:**

1. **`csStoryMiniCards` null reference killed the fetch before it fired**
   - Element was renamed to `csStoryRevealBtn` in HTML but old `document.getElementById('csStoryMiniCards').innerHTML = ''` remained in `_csOpenStoryMode` — crashed before fetch
   - **Fix:** replace with safe reset of `csStoryRevealBtn.classList`
   - **Gotcha:** no error in UI — story panel showed shimmer indefinitely; looked like an API timeout

2. **Python string replacement baked literal `\n` into JS**
   - `// If API returned \n\n breaks` became a two-line comment; second line parsed as a statement
   - `/\n{2,}/` regex had a real newline inside the literal, producing an unterminated regex
   - Both killed the entire script block — nothing rendered, no obvious error
   - **Fix:** rewrote paragraph split using `indexOf('\n\n')` and `split('\n\n')` — no escape sequences in the source
   - **Rule: always run `node --check` on extracted main script block before presenting files**

3. **Story button hidden by parent `display: none` — 3 separate attempts to fix**
   - Attempt 1: `style.display = ''` — parent's CSS class rule re-applied immediately
   - Attempt 2: `classList.add('cs-visible')` with `display: inline-flex` — still hidden
   - Attempt 3: `display: inline-flex !important` on `.cs-visible` — still hidden
   - **Root cause found on attempt 4:** button was INSIDE `#csTopicPickerWrap { display: none }` — a parent's `display: none` makes all children invisible regardless of their own `display` value. This is CSS fundamentals but easy to miss in deep component trees.
   - **Fix:** moved button HTML OUTSIDE `csTopicPickerWrap` into normal flow
   - **Lesson: before debugging a child element's visibility, always check every ancestor for `display: none`**

4. **Story button placement was architecturally wrong before it was visually wrong**
   - Initially placed as a post-generate button ("See how WHAT connects?" — only related concepts existed, not selected by user intentionally)
   - The right moment is after user has explicitly chosen 3 candidates — they've curated the set, the story connects their picks
   - **Lesson: build placement at the same time as the feature, not after testing**

5. **Tooltip black box on light mode**
   - `background: #1a1a1a` hardcoded — renders as solid black on light (parchment) theme
   - **Fix:** use `var(--surface2)` + explicit `[data-theme='light']` override
   - **Rule: never hardcode `#1a1a1a` or `#0d0d0d` in interactive components — always use design tokens**

6. **Tooltip text inherited `text-transform: lowercase` from parent label**
   - The `.cs-story-label` has `text-transform: lowercase` — all child elements inherit it
   - Tooltip text appeared as lowercase garbled mess even though the HTML was correct
   - **Fix:** explicitly set `text-transform: none; letter-spacing: normal` on `.cs-story-tooltip`
   - **Rule: any tooltip inside a styled parent MUST reset inherited text properties explicitly**

7. **`[[LABEL:Term]]` prompt instruction was malformed**
   - Original instruction used pipe-joined example: `[[LABEL:Term1|Term2|Term3]]` — Claude read this as one multi-term label, produced inconsistent markers, JSON parse failed
   - **Fix:** plain example with actual format: `"She smiled.[[LABEL:Sunk Cost Fallacy]] He didn't notice."`
   - **Lesson: for format-sensitive instructions, show Claude exactly one worked example. Describing the format abstractly produces variance.**

8. **`inline style` always beats class rule — had to re-learn this three times**
   - `style="display:none"` on an element → `classList.add('cs-visible')` → element stays hidden
   - CSS specificity: inline > ID > class > element. `!important` in a class rule beats inline only with `!important`
   - **Rule: never use inline `style=` for visibility on elements that JS will show/hide via classes. Use a base CSS class instead.**

**Lessons:**

- **Check every ancestor's `display` before debugging a child element's visibility.** One hidden ancestor overrides everything.
- **`node --check` is mandatory before presenting any spark.html build.** A broken JS syntax silently kills all rendering with no on-screen error.
- **Python f-strings and JS template literals don't mix safely.** When Python writes JS strings, `\n` in Python becomes a literal newline in the output file. Use string methods (`indexOf`, `split`) instead of regex with escape sequences when Python is writing the JS.
- **Story button placement is UX, not CSS.** The correct moment to show a story CTA is after the user has intentionally selected the ingredients — not passively after generation.
- **Auto-save stories on generate; don't ask the user.** The story is ephemeral — if it disappears, it's gone. The Stories tab in Stash (Phase E) will surface them.
- **Floating popup cards work well for term reveal** — same spring animation as the search preview card creates a familiar feel without building a new pattern.


---

### 2026-04-24 — Automation 2 live: Airtable → GitHub → site publishing pipeline
 
**What was built:**
- Serverless function `/api/publish-concept.js` on Vercel acting as the brain of the publish pipeline
- Function validates required fields, category, and source values against the schema
- Function fetches current `concepts.json`, computes `max(id)+1`, appends the new concept, commits back to GitHub
- Function protected by `X-Publish-Secret` header check against `PUBLISH_SECRET` env var
- Function rejects duplicate terms (case-insensitive) with a 409 to prevent accidental double-publish
- Make.com scenario reduced to 2 modules: Airtable Watch Records → HTTP POST
- Airtable `Last Modified Time` field reconfigured to only track `Status` changes (not all fields)
- Airtable `Created` field added as a true `Created time` type (not a plain date)
**Key decisions made:**
 
1. **Went with serverless-on-Vercel over grinding workarounds in Make.com**
   - Make.com's free tier doesn't expose `parseJSON` or `base64decode` as functions — JSON manipulation was a dead end.
   - Options were: upgrade Make Core (€9/mo), fragile regex workarounds, or a Vercel function.
   - The Vercel function is free, deterministic, easy to debug, and uses the same pattern as `/api/subscribe`.
   - **Architectural note:** This keeps Make.com focused on what it's good at (triggers, HTTP) and puts data logic where it belongs (in code).
2. **Chose Option D for transcripts (manual paste for first 10 episodes) over Option A (Render server)**
   - Render/yt-dlp deployment is the scariest step for a non-developer.
   - Paste-and-run for the first 5–10 episodes validates the extraction half without server infrastructure.
   - If the extraction prompt is bad, better to find out before building a server to produce bad output.
3. **Polling interval = 1 hour, not 15 minutes**
   - Make free tier = 1,000 ops/month. 15-min polling = 2,880 ops = over budget in 10 days.
   - 1-hour polling = 720 ops/month + manual "Run once" for urgent pushes.
   - Publishing isn't latency-sensitive for an editorial pipeline.
4. **`Concept ID` field in Airtable stays manual/empty for now**
   - The function computes the real ID from `concepts.json` on GitHub (the source of truth).
   - Could later extend the function to write the ID back to Airtable; nice-to-have, not blocking.
**Key bugs encountered and fixed:**
 
1. **Airtable "Last Modified Time" field was a plain Date, not an auto-tracking field**
   - Make.com's `Watch Records` trigger requires a Last-Modified-Time or Created-Time field to exist in the schema.
   - The imported Airtable base had a column named `Last Modified Time` but it was configured as field type `Date` — which doesn't auto-update.
   - **Fix:** Change field type to `Last modified time` (under Date and time section), then scope tracking to only the `Status` field.
   - **Gotcha:** Scoping to "All editable fields" would fire the trigger on every edit (notes, score tweaks), causing duplicate publishes. Scoping to just `Status` is the safe default.
2. **Make.com module ID numbers don't reset after deletions**
   - Added and deleted several modules during iteration; ended up with `module 5 references non-existing module 2`.
   - **Fix:** Never hardcode module IDs (`2.data.content`) — always use the visual mapping panel to insert field pills. Make manages the references automatically.
3. **`parseJSON` and `base64decode` aren't in the Make.com function picker (on free tier)**
   - The function picker tabs are organized as: star, AI, general, math (x¹), **string (A)**, date, array, **general/variables ({ })**.
   - `parseJSON` isn't under `{ }` — that tab is for Scenario/Team variables only.
   - `base64decode` isn't surfaced at all; only `base64` (encode) is available in the A tab.
   - **Fix:** Abandoned the "do everything in Make" approach. Moved JSON logic to the Vercel function.
4. **First ReqBin test accidentally exposed `PUBLISH_SECRET` in a screenshot**
   - Rotated the secret immediately: generated a new UUID, updated Vercel env var, redeployed, updated Make keychain.
   - **Lesson added to the "rules I actually internalized" list.**
5. **Make's `Run once` is a one-shot trigger check, not a listener**
   - First end-to-end test: clicked Run once, then flipped APPROVED in Airtable → nothing happened.
   - `Run once` snapshots the state at click time and checks for changes since the last known state. Changes made *after* Run once starts are missed.
   - **Fix:** Flip the Airtable status **first**, then click Run once. Or turn the scenario ON and let it poll naturally.
6. **GitHub's API returns file contents as base64; the raw URL returns plain text but without `sha`**
   - Tried fetching from `raw.githubusercontent.com` to skip base64 — worked, but no `sha` returned, and commits require it.
   - **Fix:** Function uses the API endpoint (not raw) and decodes base64 server-side with `Buffer.from(..., 'base64')` in Node — trivial in JavaScript, impossible in Make.
**Lessons:**
 
- **Use the visual mapping panel in Make.com, never type module references manually.** Module IDs are fragile; pills are stable.
- **Airtable has multiple field types that look similar but behave very differently.** "Last modified time" vs "Date" vs "Created time" are three different things. Always verify by editing the field and checking type.
- **Before committing to a no-code path, check what functions are actually available.** A 10-minute check against the function picker would have saved an hour of chasing dead ends.
- **Serverless functions on Vercel are the right tool for data manipulation, even in a "no-code" workflow.** Make.com handles the wiring; Vercel functions handle the logic. They're complementary.
- **HTTPS headers with secrets are safe. Screenshots with secrets are not.** The transport channel matters more than the surface.
- **"Run once" ≠ "start listening".** Know the difference before testing.
- **Build the publish half before the extract half.** If publishing works but extraction is broken, you haven't lost anything. Reverse order = you might publish garbage.
- **Duplicate detection in the publishing function is a cheap safety net.** Cost: ~5 lines of code. Benefit: prevents silent data corruption during any retry scenario.
- **Every new serverless function needs a redeploy after adding env vars.** Vercel does not hot-reload them.

### 2026-04-23 — Beehiiv email capture live with native form + serverless API

**What was built:**
- Beehiiv Launch (free) publication created, branded as "Listen. Learn. Live."
- Welcome email automation configured with dual triggers (Signed up OR Email submitted)
- Serverless function `/api/subscribe.js` on Vercel acting as secure proxy to Beehiiv API
- API key and Publication ID stored as Vercel environment variables (never exposed to client)
- Replaced Beehiiv's white-box iframe with native inline form in brand colors
- Form has full UX: placeholder, focus state, loading state, success message, error handling

**Key decisions made:**

1. **Chose Beehiiv over ConvertKit/Kit**
   - ConvertKit's free tier has higher subscriber cap (10k vs 2.5k) but no automations — kills the welcome-email use case.
   - Beehiiv's welcome email, referral program, and custom subdomain are all on free tier.
   - **Trade-off:** Will need to upgrade (~$39/mo) when approaching 2,500 subs. Budget in 4-6 months out.

2. **Went with API-based native form instead of iframe embed**
   - Iframe worked but looked foreign against the dark editorial aesthetic — white box, Beehiiv typography, couldn't style the internals.
   - Native form via serverless function took 30 min extra but the result belongs on the site.
   - **Architectural note:** This is the same pattern used by The Generalist, Stratechery, etc. — not an exotic choice.

3. **Kept "Listen. Learn. Live." branding during integration despite planned rename**
   - Confirmed all Beehiiv settings are 30-second edits (publication name, subdomain, from-name, reply-to).
   - Subscribers carry over automatically through a rebrand.
   - Only one thing to avoid pre-rename: confirming the "Update Web URL" modal in Domains (changes email sender username).

**Key bugs encountered and fixed:**

1. **First embed attempt showed empty white box**
   - Pasted only the `src="..."` fragment of the iframe, not the full `<iframe>` tag.
   - **Fix:** Copy the entire iframe element, including opening and closing tags, plus the companion `<script>` tag in `<head>`.
   - **Gotcha:** Beehiiv's default iframe height is 315px — our initial CSS had `min-height: 80px` which would have clipped the form even if the iframe was correct.

2. **"Sensitive environment variables cannot be created in Development" warning on Vercel**
   - Not a blocker. Production + Preview environments are all that matter for deployed sites.
   - Development is only for running Vercel locally via CLI, which isn't part of the current workflow.

**Lessons:**

- **Embeds always look like embeds.** If the aesthetic is part of the product (as it is here), the extra 30 min for a native form is always worth it.
- **Serverless functions on Vercel are genuinely free and simple.** A single file in `/api/` folder becomes a live endpoint. No server setup, no config files.
- **API keys NEVER go in client-side code.** Anyone viewing page source could steal them. Environment variables on the server are the only correct approach.
- **Always redeploy after adding env vars.** Vercel doesn't auto-reload them — the deployment has to restart to pick up new values.
- **Beehiiv requires Stripe Identity Verification before issuing an API key.** 5-minute process, one-time, unavoidable.
- **Test signups with Gmail's `+alias` trick** (`yourname+test1@gmail.com`) so you can sign up multiple times without needing multiple accounts.
- **First emails from new Beehiiv publications often land in spam.** Warm up the domain by sending the first few newsletters consistently.

### 2026-04-22 — localStorage persistence actually working + JSON corruption fix

**What was built:**
- Added real localStorage save/load for mastered concepts (persists across sessions)
- Added date-aware localStorage for daily goal (auto-resets at midnight by checking the stored date vs today)
- Wrapped all storage calls in try/catch so private-browsing users don't crash
- Added version suffix to storage keys (`_v1`) for safe future schema changes

**Correction from previous entry:** The 2026-04-21 note said localStorage was working — it wasn't. The in-memory Sets were never persisted. Now they are.

**Key bugs encountered and fixed:**

1. **concepts.json got corrupted during GitHub editing**
   - A stray `}` appeared at the end of the file, causing the entire site to fail loading with a JSON parse error.
   - **Fix:** Removed the extra closing brace. Validated with jsonformatter.curiousconcept.com before committing.
   - **Gotcha:** jsonlint.com was down that day. Good to have backup validators bookmarked.

2. **Three variable declarations got deleted when pasting storage helpers**
   - When replacing the block around `let activeCat`, `let mastered`, `let openedToday`, the paste accidentally removed all three instead of just replacing them.
   - Result: `ReferenceError: activeCat is not defined` on render.
   - **Fix:** Added the three `let` declarations back above the STORAGE HELPERS block.

**Lessons:**

- **Always test persistence by closing the entire tab, not refreshing.** Refresh keeps a surprising amount of state in memory in some cases.
- **Use a version suffix on localStorage keys (`_v1`) from day one.** Schema changes later become painless.
- **GitHub is the backup, not local files.** Revert via commit history, not by keeping backup copies around.
- **When editing in GitHub, always confirm the filename at the top of the edit page.** Two tabs open = easy to paste code into the wrong file.
- **Validate concepts.json after every manual edit.** One stray character breaks the entire site. Use jsonformatter.curiousconcept.com or vscode.dev.
- **Check the browser console first when cards disappear.** The error message points you at the real problem in 30 seconds.

---

### 2026-04-21 — Step 1 complete, site live with dynamic JSON loading

**What was built:**
- GitHub repository created
- `concepts.json` uploaded with all 160 concepts
- `index.html` modified to fetch from concepts.json instead of hardcoded data
- Connected to Vercel, live at listen-learn-live.vercel.app

**Key bugs encountered and fixed:**

1. **Wrong variable name for deduplicated concepts**
   - The render function was calling `UNIQUE_CONCEPTS.filter(...)` but `UNIQUE_CONCEPTS` was created once at page load, before the async fetch completed, so it was always empty.
   - **Fix:** Find-and-replace `UNIQUE_CONCEPTS` with `CONCEPTS` everywhere.
   - **Gotcha:** The replacement also hit the line `const UNIQUE_CONCEPTS = ...` and turned it into `const CONCEPTS = ...`, creating a duplicate declaration conflict with the `let CONCEPTS = []` we added. Had to delete that line entirely.

2. **404 on concepts.json despite file being in repo**
   - Not actually a 404 — we were testing an expired Vercel deployment URL. The deployment URL changes with every commit; the permanent project URL is the one to use.
   - **Fix:** Always use the main project URL (listen-learn-live.vercel.app), never the deployment-specific URLs that show in Vercel logs.

3. **Field name mismatches**
   - Original widget used shorthand (`c.cat`, `c.src`, `searchVal`) but concepts.json uses full names (`category`, `source`). Render function never got updated.
   - **Fix:** Find-and-replace all shorthand field references to match the JSON schema.

**Lessons:**

- When in doubt, use the browser console to inspect state. `console.log(CONCEPTS.length)` answers more questions faster than reading code.
- `console.log(functionName.toString())` prints the actual code of a live function in the browser — invaluable for debugging.
- Troubleshoot in a separate Claude conversation from the one where you're building. The context switching in a single thread eats focus.
- The fetch in a browser only works from a served URL, not from opening the file locally. Always test on Vercel.
- `const` declarations are global and can conflict. Use `let` for variables that need to be reassigned (like `CONCEPTS` being filled by async fetch).

---

## Entries template for future sessions

When adding a new entry, use this structure:

```
### YYYY-MM-DD — Brief title of what was accomplished

**What was built:**
- [Bullet points of completed work]

**Key bugs / challenges:**
1. [What went wrong]
   - **Fix:** [What solved it]
   - **Gotcha:** [Anything sneaky to watch for next time]

**Lessons:**
- [Takeaways in a sentence each]
```
