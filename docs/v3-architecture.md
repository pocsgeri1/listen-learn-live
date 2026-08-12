# Epistemic V3 — Information Architecture & Build Plan

**Status:** APPROVED FOR BUILD (pending 3 flagged decisions in §16)
**Written:** 2026-08-11 · Strategy session (Opus 5)
**Current live version:** v3.57a · **First V3 commit:** v3.58 (docs only) · **First V3 code commit:** v3.59
**Supersedes:** `docs/feature-plan-concept-folders.md` (Phases 1–7 all shipped; that doc is now historical)
**Reads with:** `engineering-standards.md` · `design-tokens.md` · `architecture.md` · `ai-voice.md`

---

## 0. Session preconditions — confirmed

1. **Current version:** `v3.57a` (top of `changelog.md`). Next commit is `v3.58`.
2. **Session type:** BUILD (planning phase — documents only, no `index.html` edits).
3. **Git rule:** I will NOT run any git commands. Gergely runs `./ep-commit.sh` from Mac Terminal.

### Corrections to the session brief (verified against the live repo)

The brief contained four factual errors. The build plan below uses the verified values.

| Brief said | Reality (verified in `index.html`) |
|---|---|
| `lll_saved_v1` holds saved concept IDs | **Does not exist.** Saved concepts live in `lll_mastered_ts_v1` — a `{ [conceptId]: timestampMs }` object, 21 call sites |
| `lll_user_id` — UUID for analytics | **Not implemented.** Zero occurrences in `index.html`. It is a roadmap item only |
| `~41,000 lines` | **Correct — 41,052 lines / 1.58 MB.** Verified with `wc`. Still the core scaling problem — see §14.6 |
| Home drawer has 5 tabs incl. Folders | Correct — `_HOME_TABS = ['episodes','concepts','folders','vocab','practice']` |
| `folder.vocabWords[]` = array of strings | **Objects since v3.56:** `{ word, definition, category, colId }`. `architecture.md` still documents the old string shape — fixed in this session |

Two more live-repo findings that matter:

- **Model-string conflict.** `engineering-standards.md` states the model in `cs-generate.js` must always be `claude-sonnet-4-6`. Eight call sites across `api/` currently use `claude-sonnet-4-5` (`cs-generate.js` ×4, plus `plain-batch.js`, `curate-batch.js`, `feynman-batch.js`, `extract-concepts.js`), and two use `claude-haiku-4-5-20251001`. One of these two sources is wrong. **[ACTION — Gergely]** decide which, before any new AI surface ships. V3 adds two more AI endpoints; propagating a broken model string five more times is how you get a silent 500 storm.
- **The rail sits at z-index 1150, and 1200 is NOT free.** `.lexi-panel`, `.egg-overlay` and `.stories-overlay` all use 1200. The free band beneath the legacy overlay stack (1300 / 1400 / 1500 / 1501 / 1800+) is 1102–1199, so the rail takes **1150**. It therefore sits above page content and *below* every legacy overlay — which is exactly what makes phase 2 safe: the rail ships while every existing modal still covers it correctly. Do not raise it without auditing all ~40 z-index values in the file.

---

## 1. The strategic frame — what V3 is actually for

Everything below follows from three claims. If you disagree with these, disagree here, not with the surface design.

**Claim 1 — The moat is moving from the library to the user's layer on top of it.**
Today the moat is editorial taste: 600+ hand-curated concepts a model can't fake. That was true in 2025. By 2027 a competent LLM pipeline plus a good prompt closes 70% of that gap. What it cannot copy is *your user's accumulated personal layer* — their boards, their captures, their voice profile, their drafts, their mastery history, their `related_ids` traversal path. V3's job is to make that layer thick enough that leaving costs something real. **Every V3 feature is judged on: does this add to the personal layer?**

**Claim 2 — The product is missing its final stage.**
The stated arc is discover → understand → retain → apply. Today the product does discover (Library, episodes), understand (concept detail, analogy), and gestures at retain (Lexi practice, quiz). *Apply* is almost absent — Corner is the only surface, and it produces a conversation opener you read once and close. Gergely's own thesis in `epistemic-identity-private.md` is that the product sells *fluency and confidence in the discourse*. You do not get fluent by reading. You get fluent by producing. **The Write pillar (§7) is not a bolt-on. It is the missing half of the product.**

**Claim 3 — Navigation is not the problem. Statelessness is.**
The current product has eight surfaces that all open as full-screen modals over a marketing page. Nothing is addressable, nothing persists, nothing composes with anything else. You cannot have a concept open *and* a board open. You cannot deep-link to "my words, filtered to psychology." A left sidebar is not the fix — it is the visible symptom of the fix. **The real change is: surfaces become routes, and routes become state.**

### The North Star loop (the one thing V3 must make work)

```
Today → open 1 concept → write 1 line about it → streak +1
```

Three taps, under 60 seconds, every weekday. Everything else in V3 — boards, canvas, compose, chat — is *depth for people already in the loop*. If a feature does not either (a) start this loop, (b) shorten it, or (c) reward completing it, it is Phase 8+ work. This is the D7 lever. Ship it in Phase 6 and measure nothing else until it works.

---

## 2. THE core architectural decision — two shells, one file

Before any sidebar discussion: `index.html` is currently **both the public marketing site and the app**. Hero, How It Works, founder section, newsletter capture, footer — a long editorial scroll page — with app surfaces layered on top as modals. This is why every surface is a modal: there was nowhere else to put them.

A persistent left sidebar cannot be bolted onto a marketing scroll page. Trying is how you get a sidebar that half-covers the hero and looks broken on the founder section.

### Decision: two shells, switched by a body attribute

```
body[data-shell="site"]   →  marketing page. Scrolls. No rail. UNCHANGED from v3.57a.
body[data-shell="app"]    →  app shell. Fixed rail + routed panes. No page scroll.
```

**Shell selection:**

| Entry | Shell | Why |
|---|---|---|
| `epistemic.live/` (first visit, no localStorage) | `site` | SEO, conversion, the founder story. Do not break this |
| `epistemic.live/` (returning — any `lll_*` key present) | `app`, route `#/today` | Returning users want the product, not the pitch |
| `epistemic.live/#/…` (any hash route) | `app` | Deep links, shares, board links |
| `/concepts/[id]-[slug].html` (static SEO pages) | n/a — separate files | Untouched. Their CTA links to `/#/c/{id}` |
| `/category/[name]`, `/map` | n/a — separate files | Untouched |

**Escape hatches:** nav "Open Epistemic →" button enters the app from the site shell. Rail footer "About Epistemic" returns to the site shell. Both are `history.pushState` — no reload.

### Why this is the right call

- **Zero regression risk on the money page.** The marketing scroll, the SEO, the OG cards, the founder section, the newsletter — none of it is touched by V3. That is 100% of current organic acquisition, protected.
- **The app shell is new DOM.** New CSS namespace (`.app-*`), new z-index band, no fighting 41k lines of existing selectors. Legacy overlays keep working *inside* the app shell during the migration because they sit at z-index 1300+ and the rail sits at 1150.
- **It makes the phased migration possible.** Phase 0 ships a rail that just launches the existing modals. Each later phase converts exactly one modal into a pane. No big bang, no phase that leaves the product broken.
- **It gives "returning user" a meaning without auth.** Presence of localStorage is a good-enough identity signal for shell selection.

### What this costs

One new global: a router. ~150 lines. That is the entire cost. Accept it.

---

## 3. Navigation model

### 3.1 The five destinations

```
┌──────────────────┐
│  Epistemic.      │   ← wordmark, click = site shell
│                  │
│  ⌕  Search  ⌘K   │   ← universal search (Phase 8)
│                  │
│  ◐  Today        │   ← #/today      the daily ritual + discovery rails
│  ◱  Library      │   ← #/library    concepts · words · episodes
│  ⬡  Boards       │   ← #/boards     canvases
│  ✎  Write        │   ← #/write      capture · compose · practice
│  ✦  Chat         │   ← #/chat       grounded AI
│                  │
│  ── your stuff ──│   ← rail section label
│  🧠 Mindset  12  │   ← up to 5 pinned boards, live counts
│  💼 Negotiation 7│
│  ＋ New board    │
│                  │
│  ⋯                │
│  ☽ Dark          │
│  About Epistemic │
└──────────────────┘
```

Five destinations, not six. The rationale for each cut is in §4 (Discover) and §5 (Vocab).

**The pinned-boards section is the highest-value part of the rail** and the part most likely to get cut for time. Do not cut it. It is the only place in the product where the user sees *their own words in the navigation*. That is what makes an app feel like yours rather than someone else's website. Eden gets this exactly right.

### 3.2 Route table (authoritative — implement exactly this)

| Route | Surface | Notes |
|---|---|---|
| `#/today` | Today | Default app route |
| `#/library` | Library, concepts lens | |
| `#/library/words` | Library, words lens | Replaces the Read panel |
| `#/library/words/map` | Word Map view | Replaces the Read panel's map |
| `#/library/episodes` | Library, episodes lens | Replaces nav "Listen" |
| `#/library?cat=psychology&pick=1&q=…` | Library with filters | Filters are query params, shareable |
| `#/c/{id}` | Concept detail (Spark) | Opens *over* whatever pane is active. Back closes it |
| `#/w/{word}` | Word detail sheet | Same overlay pattern |
| `#/boards` | Board index | |
| `#/board/{folderId}` | Canvas | Replaces `#canvas-{id}` — **keep the old hash working as a redirect** |
| `#/write` | Write, capture mode | |
| `#/write/compose` | Write, compose mode | |
| `#/write/compose/{draftId}` | Editing a specific draft | |
| `#/write/practice` | Practice session | Replaces Lexi practice overlay |
| `#/chat` | Chat | |
| `#/chat/{threadId}` | A thread | |
| `?import=BASE64` | Board import banner | **Unchanged.** Existing share links must not break |

**Router rules:**
- Single `hashchange` listener + one `_routeGo(path, opts)` function. No framework, no history library.
- `_routeGo` writes `lll_route_v1` on every change (for resume-on-return).
- Unknown route → `#/today`, no error.
- The concept detail (`#/c/{id}`) is a *modal route*: it stacks on the current pane and `history.back()` returns to it. Everything else is a *pane route*: it replaces the pane.
- Legacy hashes `#home` and `#canvas-{id}` are permanently aliased. Never remove — they are in the wild, in shared links and in Google's index.

### 3.3 Desktop rail spec

```css
:root {
  --rail-w: 236px;
  --rail-w-collapsed: 64px;
}
body[data-shell="app"] .app-rail {
  position: fixed; left: 0; top: 0; bottom: 0;
  width: var(--rail-w);
  z-index: 1150;
  background: var(--bg);
  border-right: 0.5px solid var(--border);
  display: flex; flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}
body[data-shell="app"] .app-main {
  margin-left: var(--rail-w);
  height: 100vh; height: 100dvh;
  overflow: hidden;                 /* panes own their own scroll */
}
body[data-shell="app"][data-rail="collapsed"] .app-rail { width: var(--rail-w-collapsed); }
body[data-shell="app"][data-rail="collapsed"] .app-main { margin-left: var(--rail-w-collapsed); }
```

- **No animation on rail collapse width.** Animating `width` on a `position:fixed` element with `margin-left` on a sibling = two layout passes per frame across the whole app. Snap it. Fade the labels (`opacity 0.12s`) so it still reads as intentional. This is a direct application of the performance guardrails in `engineering-standards.md`.
- Collapse state persists to `lll_ui_v1.railCollapsed`.
- `--rail-w` is a real token — add it to `design-tokens.md`.
- Rail items: DM Sans 0.82rem weight 400, glyph in DM Mono, 40px row height (touch-safe), active state = `background: var(--surface)` + 2px left accent bar in `var(--accent)`. No pill, no fill, no glow. Editorial.

### 3.4 Mobile (≤700px) — the canvas problem, solved

The brief asks: *how do we keep the mobile rail from stealing screen real estate from the canvas?*

**Answer: three modes, driven by one body attribute.**

| `body[data-nav]` | What renders | When |
|---|---|---|
| `tabs` | Bottom tab bar, 5 items = the 5 destinations. Reuses the existing `.mobile-tab-bar` DOM and CSS wholesale | Default on all pane routes |
| `drawer` | Rail slides in from left as an overlay (280px, backdrop, `_spLockBodyScroll()`) | On "More" tap — holds pinned boards, theme, about |
| `immersive` | Everything hidden except one 48×48 floating back chevron, bottom-left, `env(safe-area-inset-bottom)` padded | On `#/board/{id}` and `#/write/practice` |

Immersive mode is entered automatically by the router on those two routes and exited on leave. Nothing to tap by accident, canvas gets the full viewport, and one obvious way out. Do not build a gesture for this — a hidden gesture on a canvas that already uses one-finger pan and two-finger pinch is a bug factory.

**Reusing `.mobile-tab-bar` is deliberate.** It already handles the iOS fixed-positioning traps documented in `build-journal.md` (base `nav {}` rule leakage, `transform` breaking sibling `position:fixed`, the 52px height gap). Rewriting it means rediscovering all three bugs.

### 3.5 What happens to Listen / Read / Write / Speak

These were never destinations. They were four verbs bolted to a marketing nav because there was no app to put them in.

| Old | V3 |
|---|---|
| **Listen** 🎧 | → `#/library/episodes`. It was a scroll-to-anchor, not a mode |
| **Read** 📚 | → `#/library/words`. Full retire of `#gvOverlay` chrome, render functions reused (§10.2) |
| **Write** ✍️ | → `#/write`. Keeps the name, gains an actual product (§7) |
| **Speak** 💬 | → **not a destination.** It is an *action on a concept*. Lives in the concept detail action bar as "Corner ⟶". This is the single biggest IA correction in V3 |

"Speak" being a top-level nav item is the clearest evidence that the current IA maps to *features you built* rather than *things a user wants to do*. Corner is a brilliant feature and a terrible destination — nobody wakes up wanting to "Speak." They want to prepare for a specific conversation, which starts from a concept or a situation. Both entry points are preserved: from a concept card, and from the Today rail ("Got something coming up? →").

The verbs survive as **language, not navigation**. They are the right words for the product story on the marketing shell. Keep them there.

---

## 4. Discover — the decision

**The brief asks whether Discover is (A) personalized, (B) editorial, or (C) the public library. My answer: it is all three, which is exactly why it does not get its own nav slot.**

Define it properly first:

> **Discover = the answer to "what should I learn next?", rendered without a recommendation engine.**

That question has a different correct answer depending on who is asking:
- Anonymous visitor → editorial. Best of the library, newest episodes, Concept of the Day.
- User with < 10 saved concepts → editorial, plus category on-ramps.
- User with ≥ 10 saved → personalized rails, computable from data already on disk.

Three audiences, one question, one algorithm with three parameterizations. That is a *section*, not a destination.

### Where it goes

**Discover is the lower two-thirds of Today.** Today = ritual block (above the fold) + discovery rails (below). One surface, one scroll, one mental model: *this is where I start.*

### Why not a separate destination

1. **Two editorial surfaces with the same content look broken.** Without a backend or daily editorial output, Today and Discover would render from the same 600 concepts with the same ranking. Users would learn one of them is redundant and stop clicking it. A dead nav item devalues the whole rail.
2. **Discover-for-anonymous is the marketing shell's job now.** That was the strongest argument for (C), and the two-shell decision in §2 already absorbs it. The site shell *is* the public library front door.
3. **Five destinations is the ceiling for a bottom tab bar.** Six means a "More" tab, and whatever goes behind More dies. Boards, Write and Chat all have higher strategic value than a second editorial page.

### The rails (all computable from localStorage + concepts.json, zero backend)

Ranked by value. Ship the first three in Phase 6; the rest are cheap follow-ons.

| Rail | Algorithm | Needs |
|---|---|---|
| **Because you saved *X*** | One hop out on `related_ids` from the 5 most recently saved concepts. Exclude anything already saved. Rank by how many saved concepts point at it (co-citation count) | ≥3 saved |
| **Your blind spot: *category*** | Category with the lowest saved-count among the 14, weighted by that category's library size. Show 4 editor's picks from it | ≥10 saved |
| **Finish the episode** | Episodes (`collection_id`) where the user has saved ≥1 but <50% of the concepts. Show the unsaved remainder | ≥1 saved with a `collection_id` |
| **Editor's picks you haven't seen** | `editors_pick === true`, minus saved, minus viewed (`lll_seen_v1`), shuffled with a date seed | none — works for anonymous |
| **New this week** | Concepts whose `collection_id` maps to a collection with `created_date` within 14 days | none |
| **Words from concepts you know** | Vocab from `episode_meta.json` for episodes where the user saved ≥2 concepts | ≥2 saved |
| **Revisit** | Saved ≥21 days ago, never opened since, no capture attached. This is a spaced-repetition rail wearing a discovery costume | ≥5 saved, ≥21 days tenure |

**The co-citation ranking in rail 1 is the whole competitive argument.** Eden cannot build it — they have no pre-computed graph. Spotify cannot build it — they have no concept objects. It is 20 lines of JS over data already in the browser. Make it the first rail, always, and give it a real editorial label ("Because you saved *Antifragility*") rather than a generic "Recommended."

**Fallback ladder for cold start:** if a rail's minimum is not met, it is not rendered at all — never rendered empty, never rendered with a "save more concepts to unlock" nag. Today for a brand-new user shows: Concept of the Day, Editor's picks, New this week, and a 3-category on-ramp. That is a complete, dignified page.

---

## 5. Vocab — the decision

**The brief offers (A) tab in Library, (B) inside concept detail, (C) first-class on Boards. My answer: A and C, explicitly not B, plus one addition the brief did not list.**

### The principle

> A vocab word and a concept are the same kind of object at different resolution. A concept is a named mental model. A word is a named idea. Both are things you understood and want to own.

`feature-plan-concept-folders.md` already reached this conclusion for the canvas. V3 applies it to the whole product: **one index, three lenses.**

### Where vocab lives

**A — Library › Words lens (primary home).** Library gets a segmented lens switch: `Concepts · Words · Episodes`. Same chrome, same search box, same filter row, same grid, same detail-open behaviour. Different unit. Words lens filters: category (the 5 vocab registers), podcast, episode, and a `Saved only` toggle that replaces the entire Lexi panel. View toggle: `List · Map` — the Map is the existing Word Map canvas, re-parented.

**C — Boards, first-class.** Already shipped in v3.54/3.56 as the 💬 Vocab canvas element. No change needed, just promotion in the docs and the toolbar.

**NOT B — do not put vocab inside the concept detail.** Vocab is extracted per *episode*, not per *concept* (`episode_meta.json.vocab_vault` is keyed by `collection_id`). Showing episode vocab on a concept card implies a relationship that does not exist in the data. It would be a lie rendered in the UI, and users notice. The correct link is concept → *its episode* → that episode's words, which is one honest tap via the existing episode drawer.

**The addition the brief missed — D: Write › Practice.** The Lexi practice session (write a sentence using the word, AI grades it) is not a browse surface, it is a *production* surface. It belongs with the other production surfaces, not filed under browsing. This is what finally makes Practice discoverable — the brief correctly identifies that burying it in a pull tab killed it.

### Net effect

Vocab goes from **two dedicated surfaces nobody finds** (pull tab + full-screen overlay) to **three places where it is already relevant** (Library lens, Board item, Practice session). Same features, one third of the navigation cost.

---

## 6. Surface-by-surface IA

### 6.1 Today — `#/today`

**Purpose:** start the loop. Not a dashboard. Dashboards report; this one asks for one small action.

**Above the fold (the ritual block) — max 3 elements:**
1. **Concept of the Day** — full card. Term, hook, plain, analogy. Two actions: `Save` and `Write one line ✎`. The second is the North Star loop. Make it the visually primary button.
2. **Streak strip** — 7 dots, current streak number, one line of copy. A day counts if the user saved a concept, wrote a capture, or completed a practice item. Not "opened the app" — that trains the wrong habit.
3. **Resume** — one row: "Back to *Negotiation* board" / "Finish your draft: *Why status games…*", whichever is more recent. Hidden if nothing to resume.

**Below the fold:** the Discover rails from §4, in order, each a horizontal scroll row of concept tiles. Max 6 rails rendered; lazy-mount the ones below the viewport with `IntersectionObserver`.

**COTD selection without a backend:** keep the existing deterministic rule — `YYYYMMDD % pool.length` — with one change. The pool becomes `editors_pick === true` AND not in `lll_mastered_ts_v1` AND not in `lll_seen_v1`. If that pool empties, fall back to all editor's picks, then all concepts. Same concept all day, rolls at local midnight, no personalization drift, one line of code. `lll_cotd_dismissed_v1` stays exactly as is.

**Data read:** `concepts.json`, `collections.json`, `lll_mastered_ts_v1`, `lll_streak_v1`, `lll_route_v1`, `lll_captures_v1`, `lll_drafts_v1`, `lll_folders_v1`, `lll_seen_v1`.
**Data written:** `lll_streak_v1`, `lll_seen_v1`.

### 6.2 Library — `#/library[/words|/episodes]`

**Purpose:** the exhaustive, filterable, searchable index of everything Epistemic knows. Where you go when you know what you are looking for. Discover is where you go when you do not.

**Shared chrome across all three lenses:** header with lens switch (segmented control, existing pattern), search input, filter row, view toggle, result count. The filter row's contents change per lens; the chrome does not move. This consistency is what makes three lenses feel like one surface instead of three pages.

| Lens | Unit | Filters | Views | Detail opens |
|---|---|---|---|---|
| Concepts | `concept.id` | 14 categories · Editor's pick · Saved · Has note · In a board · Podcast | Tile · Scan · Map | `#/c/{id}` |
| Words | word string | 5 vocab registers · Saved · Podcast · Episode | List · Map | `#/w/{word}` sheet |
| Episodes | `collection_id` | Podcast · Favourited · Recent · Has intel | List | Episode drawer (existing) |

**Absorbs:** Home drawer Concepts tab, Home drawer Vocab tab, Home drawer Episodes tab, the entire Read panel, the entire Lexi panel browse function.

**Performance:** the Concepts lens renders 600+ tiles. Chunk via `requestAnimationFrame`, 40 tiles per frame, per the existing `_renderDrawerContent` pattern. At ~1,500 concepts switch to windowing — this trigger is already flagged in `roadmap.md` and V3 does not change the threshold.

**Filters are URL state.** `#/library?cat=power&saved=1&q=status`. This makes every filtered view shareable and back-button-correct, and it kills the entire class of "filter state persisted in a module variable across open/close cycles" bugs documented in `build-journal.md`.

### 6.3 Concept detail (Spark) — `#/c/{id}`

**Purpose:** the deepest surface in the product. Keep the depth, cut the chrome.

**Presentation change:** on desktop it becomes a **right-side pane, 480px, pushing nothing** — it overlays `.app-main` with a scrim over the pane only, not the rail. Rail stays visible and interactive. On mobile it is a full-screen sheet, unchanged from today. Entry: 160ms `opacity 0→1` + `translateX(12px→0)`. No scale, no bounce.

**Why a pane and not a modal:** because the next thing a user does after reading a concept is *look at another concept* (related chips) or *put it somewhere* (board). Both are lateral moves. A modal makes every lateral move a close-and-reopen. A pane makes them free.

**Action bar — cut from 7 to 4 primary + overflow:**

| Primary | Overflow (⋯) |
|---|---|
| ✎ **Write** — opens Write with this concept pre-loaded. New. The most important button on the surface | ↗ Share |
| ⬡ **Board** — existing folder picker | ♪ Listen (TTS) |
| ✦ **Save** | ⟶ Corner |
| ⋯ Overflow | 💬 Chat about this |

Note is not a button any more — it is an always-visible one-line input at the bottom of the pane ("Add a thought…"), which writes a capture. Removing the click removes the biggest friction point in the North Star loop.

**Related concepts get promoted, not demoted.** The in-place swap + breadcrumb from v3.48 is the best interaction in the product. In V3 the related strip is always visible (not behind a "Related — explore" toggle), rendered as 3–5 chips with category dots, and the breadcrumb stack goes to 5 deep instead of 3. This is the `related_ids` moat made physical — make the user feel the graph.

### 6.4 Boards — `#/boards`, `#/board/{id}`

**Purpose:** the personal layer made spatial. This is the highest-retention surface in the product and it is currently three taps deep inside a drawer tab. Promote it.

**Board index (`#/boards`):** grid of board cards. Each card: color bar, emoji, name, `N concepts · N words · N notes`, a 3-tile visual preview of the actual canvas (not chips — a tiny scaled-down render of `canvasLayout`), last-opened date. Sort: pinned, then last-opened. Actions per card: open, edit, duplicate, share, delete. Plus `＋ New board` and `⬡ All concepts` (the merged canvas of everything saved).

**Canvas (`#/board/{id}`):** everything shipped in v3.51–3.57, unchanged, plus:
- Opens as a **route**, not an overlay. `body[data-nav="immersive"]` on mobile.
- **Viewport persistence** — save `{x, y, zoom}` to `folder.viewport` on pan/zoom end (debounced 400ms). Reopening a board where you left it is the single cheapest "this app remembers me" signal available.
- **Captures and drafts as canvas items** — a Write capture can be placed on a board. Closes the loop between the two pillars.
- **User-drawn connections** — `folder.connections[]`, was Phase 6 of the old folder plan, now V3 Phase 7.

**The `?import=` share flow is untouched.** Existing shared links must keep working forever.

### 6.5 Write — `#/write` — see §7 (new pillar, full spec)

### 6.6 Chat — `#/chat` — see §8

---

## 7. Write — the new pillar

This is the largest net-new addition in V3 and the one that carries the most brand risk. Read §7.6 before building anything.

### 7.1 The tension, stated honestly

The brief says two things that pull against each other:

1. *"We should NOT adopt Eden's social scheduling / publishing pipeline — wrong product."*
2. *"The world is all about social media and posting, so we need a way to integrate writing logic and social media context."*

Both are right. The resolution is a line, and the line is this:

> **We build a tool that proves you own an idea. It happens to produce artifacts you can post. We never touch the posting.**

Concretely: no OAuth, no scheduling, no queue, no calendar, no analytics, no "post to LinkedIn" button, ever. The output of Write is text on your screen with a Copy button. The moment we own the distribution step we become a content-marketing tool competing with Buffer, Typefully and Eden — a category where we have no advantage and where the incentive gradient runs straight toward volume and slop.

### 7.2 Why this is pedagogically correct, not just a growth hack

Three well-established effects, all of which the current product leaves on the table:

- **The generation effect.** Information you produce is retained substantially better than information you read. Every current Epistemic surface is consumption.
- **Retrieval practice.** Explaining a concept from memory beats re-reading it, by a wide margin, for durable retention. This is the Feynman technique and it is the single highest-leverage study behaviour known.
- **Social stakes.** Writing for a real audience raises the bar you hold yourself to. For the target user — the ambitious non-native English professional — *being able to write a sharp post in English about an idea* is not a side quest. It is literally the product promise from `epistemic-identity-private.md`: fluency, ownership, the confidence to lead a conversation rather than follow it.

So Write is not "Epistemic adds a content tool." It is **Epistemic finally shipping the `apply` stage**, in the format the target user actually needs to apply things in.

### 7.3 Three modes, one surface

```
#/write            →  Capture   (fast, zero-friction, no AI)
#/write/compose    →  Compose   (AI-assisted draft, grounded in concepts)
#/write/practice   →  Practice  (retrieval practice, AI-graded)
```

A segmented control at the top of the pane, same pattern as the Library lens switch. One surface, three modes, because they share one substrate: *your own words about concepts.*

---

#### Mode A — Capture

The point is speed. One textarea, always focused, `⌘Enter` saves. That is the whole UI.

**Object created:** a **capture** (§9.4). Every capture optionally links to concepts, words, episodes and boards. Links are made three ways: (a) typing `@` opens an inline concept/word picker, (b) opening Write from a concept pre-links it, (c) a link chip row under the textarea.

**Entry points — all of them pre-link:**
- Rail → Write (unlinked, blank)
- Concept detail → ✎ Write (pre-linked to that concept)
- Concept detail → the always-visible "Add a thought…" input (writes a capture without leaving the pane — **this is the North Star loop and must be the fastest path in the product**)
- Canvas → 📝 Note (existing behaviour, now writes a real capture object instead of a canvas-local blob)
- Word detail sheet → ✎

**Capture list:** reverse-chronological, grouped by day, each row showing the text preview + link chips. Filters: linked to a concept / unlinked / by board / by tag. Search.

**This mode ships with no AI at all.** It is the foundation the other two stand on and it is valuable alone.

---

#### Mode B — Compose

Four steps, always the same, no branching:

```
1. SOURCE     pick 1–3 concepts, or a board, or a capture, or any mix
2. FORMAT     pick one of six
3. DRAFT      one API call → one draft (never a list of variations)
4. EDIT       full editor, provenance footer, copy button
```

**The six formats.** Chosen so that four are about thinking and two are about posting. That ratio is deliberate and is the guardrail against becoming a slop machine.

| Format | Length | Audience | Notes |
|---|---|---|---|
| **Note to self** | 80–150w | private | Journal entry. Default format. First in the list |
| **Explain it simply** | 100–180w | private | Write it as you would to a smart friend who has not heard the term. The Feynman output |
| **Talking point** | 60–100w | one person | For a specific meeting/dinner. Feeds directly off Corner's data model |
| **Email / newsletter paragraph** | 120–200w | small known audience | |
| **LinkedIn post** | 150–220w | public | One idea. No hashtag walls. No "Here's what I learned 👇" |
| **X thread** | 5–7 posts | public | Hard cap at 7. No thread hooks, no "a thread 🧵" |

**Provenance is mandatory and visible.** Every draft carries a footer block showing which concepts it was built from and which episodes they came from:

```
Built from 3 concepts · Modern Wisdom, Diary of a CEO
[✓] Include attribution line when copying
```

Attribution defaults **on**. It is simultaneously an editorial-integrity rule, a defence against "Epistemic makes plagiarism easy," and the only zero-cost organic distribution loop the product has (§14.10).

**Anti-slop rules, enforced in the endpoint, not just the UI:**
1. One draft per click. No "generate 5 variations." Variation shopping is the behaviour that turns writing tools into slop factories.
2. Compose **requires** at least one source object. There is no "write me a post about productivity" path. If you have not saved anything, you cannot compose. This is a feature.
3. Regenerate is capped at 3 per draft, then the button says "Edit it yourself" and means it.
4. No emoji in output unless the user's voice profile explicitly includes them. No em-dashes. Both are in the house voice (§7.4).
5. The word "unlock," "leverage" (as a verb), "game-changer," "In today's fast-paced world," and "Here's the thing:" are banned strings, checked client-side post-generation. If present, one silent retry, then ship it and log it.

---

#### Mode C — Practice

Absorbs everything from the retired Lexi practice overlay, plus one new exercise type.

| Exercise | Prompt | Graded against | API mode |
|---|---|---|---|
| **Use the word** (existing) | Write a sentence using *cybernetics* | Correct usage, register, naturalness | `lexi-practice` (exists) |
| **Explain the concept** (new) | Explain *Antifragility* in your own words, as if to a friend | The concept's `plain` + `analogy` fields | `feynman-grade` (new) |
| **Recall** (new, no AI) | Term shown, hook hidden → self-rate | self-assessment | none |

Session shape unchanged from the existing Lexi practice: queue, one item at a time, progress bar, verdict colours from `--green`/`--accent`/`--red`. Selection is spaced-repetition-lite: sort by `lastPracticedAt` ascending, weight items with a failed grade 3×.

**"Explain the concept" is the highest-value new exercise in V3.** It is retrieval practice on the actual unit of the product, it produces text that can be promoted into a capture with one tap, and its grading output ("you got the mechanism but missed the asymmetry") is exactly the kind of feedback the target user cannot get anywhere else.

---

### 7.4 The AI voice system — three layers

This is what the brief asked for when it said *"we need to create an AI voice and brand prompt somehow."* Here is the architecture. The full prompt text lives in **`docs/ai-voice.md`** (written this session) and is mirrored as a single exported constant in `api/compose.js`. One source of truth, two locations, kept in sync by a note at the top of both.

```
┌─ Layer 1 ── HOUSE VOICE ──────────────────────────────┐
│  Static. Same for every user, every call.             │
│  Derived from: quality-rules.md, hook-style-guide.md, │
│  plain-style-guide.md, analogy-style-guide.md,        │
│  epistemic-identity-private.md                        │
│  ~400 tokens. Non-negotiable floor on quality.        │
└───────────────────────────────────────────────────────┘
┌─ Layer 2 ── USER VOICE PROFILE ───────────────────────┐
│  Per-user. localStorage: lll_voice_v1.                │
│  ~120 tokens of style directives + explicit dials.    │
│  Built three ways (below). Optional — house voice     │
│  alone produces good output.                          │
└───────────────────────────────────────────────────────┘
┌─ Layer 3 ── GROUNDING ────────────────────────────────┐
│  Per-call. The full text of the 1–3 source concepts   │
│  (term/hook/plain/analogy/prompt ≈ 120 tokens each),  │
│  plus linked captures, plus relevant saved vocab.      │
│  ~600 tokens. This is RAG-lite with zero infra.       │
└───────────────────────────────────────────────────────┘
```

**Total per call: ~1,200 tokens in, 400 out.** Cheap. No embeddings, no vector store, no backend. The corpus per call is tiny *because the user selected it* — that is the whole trick, and it is only available to us because our content is pre-chunked into concept objects. A general note-taking app cannot do this without embeddings.

#### Layer 2 — how the user voice profile gets built

Three mechanisms, in order of leverage. Mirror the pattern used well elsewhere: **draft first, then offer to learn.** Never gate the first draft behind a setup wizard.

**(a) Dials — 60 seconds, set once, optional.** Five controls, all with sane defaults so skipping costs nothing:

| Dial | Options | Default |
|---|---|---|
| Register | Formal · Neutral · Casual | Neutral |
| Stance | Observational · Personal ("I…") | Personal |
| Edge | Warm · Direct · Sharp | Direct |
| Sentence length | Short · Mixed · Flowing | Mixed |
| Humour | Off · Dry · On | Dry |

Plus one field that is more valuable than all five combined for this specific audience:

> **First language:** _(dropdown)_ — "Avoid idioms and constructions that would not survive translation into my first language. Flag anything I would be unlikely to say naturally."

That single line is the non-native-speaker positioning made functional instead of decorative. No competitor will build it because no competitor is built by someone who needs it.

**(b) Learn from samples — one API call, highest leverage.** The user pastes 2–3 things they have written (a LinkedIn post, a Slack message, an email). One `voice-extract` call returns ≤120 words of concrete style directives — sentence rhythm, characteristic openings, vocabulary level, punctuation habits, what they never do. Stored in `lll_voice_v1.fingerprint` (§9.4). This is the version that makes people say "it sounds like me."

**(c) Learn from edits — opt-in, one line.** After the user edits a draft and saves, if the edit distance exceeds ~30%, a single unobtrusive line appears: *"That's quite different from what I wrote. Update your voice profile?"* One tap → one `voice-update` call → merged fingerprint. Never automatic, never silent — a writing tool that changes its own behaviour without telling you is a tool people stop trusting.

**Where it surfaces:** `#/write` → "Your voice" row in the mode bar. Also read by Chat (§8) so responses sound consistent, and by the Practice grader so feedback matches the user's register.

#### The house voice — summary (full text in `docs/ai-voice.md`)

Derived directly from the editorial rules that already govern the concept library, so the AI output and the curated content sound like the same product:

- Short sentences. Concrete over abstract. One idea per paragraph.
- No em-dashes. No semicolons. No rhetorical questions as openers.
- Illuminate, do not declare. Epistemic humility — "here is how I think about it," not "here are the five steps."
- Never these: unlock, leverage (verb), game-changer, deep dive, at the end of the day, In today's fast-paced world, Here's the thing, needle-mover, 10x, hot take.
- No emoji unless the user's profile says otherwise. No hashtag blocks. No engagement-bait openers.
- The reader is a smart 25-year-old who has never heard the term. Never condescend, never assume.
- Analogies are concrete real-world scenarios, never abstract illustrations.
- If the concept is uncertain, say so. The product's name is *Epistemic*.

### 7.5 `api/compose.js` — the contract

New endpoint. **Do not add these modes to `cs-generate.js`** — it already carries four modes plus a legacy path in one 461-line file and is the highest-risk file in the repo to touch.

```
POST /api/compose
{
  mode: "draft" | "voice-extract" | "voice-update" | "feynman-grade" | "caption",
  format: "note" | "explain" | "talking-point" | "email" | "linkedin" | "thread",
  concepts: [ { id, term, category, hook, plain, analogy, prompt } ],   // max 3
  captures: [ { text } ],                                              // max 5
  words:    [ { word, definition } ],                                  // max 8
  voice:    { register, stance, edge, length, humour, firstLanguage, fingerprint },
  userText: "…",        // for voice-extract, voice-update, feynman-grade
  boardName: "…"        // for caption
}
```

Response shapes:
- `draft` → `{ body, title, wordCount, sourceIds }`
- `voice-extract` / `voice-update` → `{ fingerprint }` (≤120 words)
- `feynman-grade` → `{ verdict: "got-it"|"close"|"missed", gotRight[], missed[], oneLineFix }`
- `caption` → `{ caption }`

**Hard limits, enforced server-side:** `max_tokens: 700` for draft, 250 for the others. Reject >3 concepts, >5 captures, >8 words. Reject `userText` over 4,000 chars. Per-IP rate limit (see §14.4 — this is a real risk, not a nice-to-have).

### 7.6 The brand risk, and the rule that contains it

The failure mode is specific and worth naming so it can be watched for: **Epistemic becomes a machine for generating mediocre LinkedIn posts about concepts the user has not actually understood.** If that happens, the editorial moat described in `epistemic-identity-private.md` is dead, because the product's public output becomes indistinguishable from every other AI content tool — and that output is what new users will see first.

The containment rule:

> **Compose is a rewriting tool, not a writing tool.**

Every public format (LinkedIn, thread) requires a user-written seed of at least ~40 words — a capture, a practice answer, or text typed into the compose box. The AI's job is to sharpen *your* thinking into *your* format, in *your* voice. It never writes from concepts alone.

The two private formats (Note to self, Explain it simply) have no seed requirement, because those are thinking tools and friction there kills the loop.

This one asymmetry is the entire difference between a learning product and a slop product, and it is four lines of validation code.

---

## 8. Chat — `#/chat`

**Ships in V3, last (Phase 8), scoped hard. Do not build it earlier.** It is the surface most likely to eat a month and least likely to move D7.

**What it is:** a conversation grounded in the user's own library. Not a general assistant. The system prompt says so explicitly and the model declines out-of-scope requests by redirecting to the library.

**Minimum viable grounding, localStorage only:**

```
Context selector (required, top of the thread):
  ◉ This board          → all concepts + captures on one board
  ◉ My saved concepts   → most recent 8 from lll_mastered_ts_v1
  ◉ Pick concepts       → manual, max 8
  ◉ This draft          → a draft + its sources
```

Serialize the selection (8 concepts ≈ 1,000 tokens) + linked captures + voice profile + last 6 turns. Send. That is genuinely "AI that knows your library," and it is honest about it — the UI shows exactly which objects are in context, as removable chips. **Showing the context chips is the feature.** It is the difference between "AI that knows my stuff" and "AI that claims to know my stuff."

**Hard caps:** 8 concepts, 20 turns per thread, 1 stored thread per board + 5 free threads. Threads in `lll_chat_v1`, pruned oldest-first at 20 total.

**Three starter prompts, always visible, because a blank chat box gets zero engagement:**
- "What connects these?" (needs ≥2 concepts in context)
- "Quiz me on this board."
- "Where am I wrong about this?"

**Real RAG is explicitly deferred.** `roadmap.md` already gates pgvector embeddings at ≥1,000 concepts. Nothing in V3 changes that. When it lands, only Layer 3 grounding changes — the surface, the context chips and the storage stay identical. Design it now so that swap is a one-function change.


---

## 9. V3 data model

### 9.1 The atomic unit rule

Everything in Epistemic references back to a `concept.id` (integer). This is already true of the library; V3 makes it true of the user layer.

```
concept.id (integer, from concepts.json)
   ├── mastery        lll_mastered_ts_v1[id] = timestampMs
   ├── notes          cc_note_{id}, cc_note_meta_{id}
   ├── board members  folder.conceptIds[]
   ├── captures       capture.conceptIds[]
   ├── drafts         draft.sourceIds[]
   ├── chat context   thread.contextIds[]
   ├── tags           lll_tags_v1.map[id] = ['tagId', ...]
   └── graph          concept.related_ids[] (pre-computed, read-only)
```

Two secondary units exist and must never be promoted to primary:

- **`word`** (lowercased string) — keyed inside `episode_meta.json.vocab_vault[]` per `collection_id`. A word is always *episode-scoped*, never concept-scoped. See §5.
- **`collection_id`** (integer) — the episode. Owns vocab, owns ordering, does not own user state.

If a future feature needs an ID that is neither a concept, a word, nor a collection, that is a signal the feature does not belong in Epistemic.

### 9.2 Existing keys — what changes

| Key | Today | V3 change |
|---|---|---|
| `lll_mastered_ts_v1` | `{[id]: ms}` | **unchanged.** 21 call sites. Do not touch. |
| `lll_lexicon_v1` | saved words + practice state | **unchanged shape**, new read surface (`#/library/words`, Write→Practice) |
| `lll_folders_v1` | folder array | **extended** — see 9.3 |
| `cc_note_{id}` / `cc_note_meta_{id}` | per-concept note | **unchanged.** Notes stay per-concept and stay separate from captures. |
| `lll_theme` | `'light' \| 'dark'` | unchanged |
| `lll_recent_eps_v1`, `lll_fav_episodes_v1` | episode lists | unchanged; feed `#/library/episodes` |
| `lll_stats_snapshot_v1`, `lll_quiz_stats_v1` | stats | unchanged; feed Today |
| `lll_theme_filter`, `lll_podcast_filter` | filter memory | **deprecated in place** — V3 filters live in the URL query (§6.2). Keep reading them once for migration, then stop writing. |
| `ep_unlocked`, `ep_used_*`, `ep_email`, `ep_typed_v1` | email gate | unchanged, **extended** to cover Compose and Chat |
| `lll_cs_saved_v1`, `lll_cs_history_v1` | Corner state | unchanged |
| `lll_cotd_dismissed_v1` | COTD dismissal | unchanged; Today reads it |
| `lll_mastered_v1`, `lll_streak_v1`, `lll_streak_warn_*`, `lll_toured_v1`, `lll_daily_goal_v1`, `lll_badge_date_v1`, `lll_badge_count_v1`, `lll_stories_v1`, `lll_cs_v1`, `lll_cs_stories_v1`, `lll_cs_ai_*`, `lll_cs_session_*`, `lll_lexicon_session_*`, `lll_corner_saves_v1`, `lll_corner_sparring_v1` | streak, tour, goal, badge, story and Corner/session state | **unchanged and untouched by V3.** Listed here so no future session assumes they are unused and prunes them. **`lll_mastered_v1` needs one look before phase 2** — it is a legacy sibling of `lll_mastered_ts_v1`; confirm which is authoritative and whether a one-way merge is needed |
| `lll_saved_v1` | — | **does not exist.** Referenced in the V3 brief; there is no such key. Never write it. |
| `lll_user_id` | — | **not implemented** (0 occurrences). V3 creates it — see 9.4. |

### 9.3 Board schema (evolved `lll_folders_v1`)

Additive only. Every new field is optional and must default safely when absent, because existing users have folders written by v3.49–v3.57.

```js
{
  // --- existing, unchanged ---
  id, name, icon, color, emoji,
  conceptIds: [],          // integer concept IDs
  vocabWords: [],          // OBJECTS since v3.56: {word, definition, category, colId}
  noteIds: [],
  canvasLayout: {},        // { [conceptId]: {x, y} } — pruned to members on save
  canvasItems: [],         // freeform: note | label | vocab | ytclip | link
  createdAt, updatedAt, pinned,

  // --- NEW in V3 ---
  viewport:    { x: 0, y: 0, z: 1 },   // last pan/zoom, restored on open (§6.4)
  connections: [],                      // [{ from, to, kind, label }] user-drawn arrows
  captureIds:  [],                      // capture IDs pinned to this board
  draftIds:    [],                      // draft IDs authored from this board
  coverIds:    [],                      // up to 4 concept IDs for the index card preview
  tagIds:      [],                      // user tags applied at board level
  chatThreadId: null,                   // the one persisted thread for this board (§8)
  schema: 3                             // migration marker; absent === 2
}
```

`connections[].kind` is one of `plain | causes | contrasts | supports`. Rendered as the existing SVG arrow layer with four stroke styles. `from`/`to` are canvas item refs of the form `c:{conceptId}`, `x:{canvasItemId}`, `p:{captureId}` — a single namespaced string so the arrow layer never has to branch on type.

**Migration:** on first V3 boot, for each folder where `schema` is absent, set `schema = 3` and fill the six new fields with defaults. No data is read from or written to the old fields differently. This runs once, is idempotent, and is ~15 lines.

### 9.4 New keys

```js
// lll_user_id — string UUID, created once, never cleared by app code.
// Roadmap item, now actually needed: rate-limit identity for /api/*,
// and the anchor for portable identity (§14.1).
"a3f1c2e8-..."

// lll_captures_v1 — the Write inbox. Newest first.
[{
  id: 'cap_1723400000_x7',
  text: '',                  // user's raw words, plain text, no markdown parsing
  conceptIds: [],            // pre-linked at entry point, or via @ picker
  words: [],                 // vocab words referenced
  boardId: null,             // if captured from a board
  source: 'concept' | 'board' | 'today' | 'practice' | 'quick',
  createdAt: 0,
  usedInDrafts: []           // draft IDs — so a capture shows "used" state
}]

// lll_drafts_v1 — Compose output + provenance. Newest first.
[{
  id: 'dr_1723400000_k2',
  format: 'note'|'simple'|'talking'|'email'|'linkedin'|'thread',
  seed: '',                  // the user-written seed (required for public formats)
  sourceIds: [],             // concept IDs quoted/used — MANDATORY, drives provenance line
  captureIds: [],
  body: '',                  // current text (user-edited)
  aiBody: '',                // last AI output, kept to compute edit distance (§7.4)
  attribution: true,         // default on; toggling off is a deliberate act
  boardId: null,
  status: 'draft'|'final',
  createdAt: 0, updatedAt: 0
}]

// lll_voice_v1 — the user voice profile. One object, never an array.
// Dial values are the exact strings from the §7.4 table, not numbers — they are
// pasted straight into the prompt, so numbers would need a lookup table in two
// places and would drift.
{
  dials: {
    register: 'neutral',     // formal | neutral | casual
    stance:   'personal',    // observational | personal
    edge:     'direct',      // warm | direct | sharp
    length:   'mixed',       // short | mixed | flowing
    humour:   'dry'          // off | dry | on
  },
  firstLanguage: '',         // ISO code or ''. Drives the non-native calibration (§7.4)
  samples: [],               // up to 3 user-pasted samples, max 1200 chars each
  fingerprint: '',           // <= 120 words, AI-extracted style directives
  fingerprintAt: 0,
  learnFromEdits: false,     // opt-in
  editSignals: []            // last 10 {before, after} pairs, only if opt-in
}

// lll_tags_v1 — the only user-defined taxonomy. See 9.5.
{
  tags: [{ id:'t_1', label:'client work', color:'#e8d5a3', createdAt:0 }],
  map:  { '412': ['t_1','t_3'] }     // conceptId -> tagIds
}

// lll_chat_v1 — threads. Max 20, pruned oldest-first.
[{ id, title, contextIds:[], contextKind:'board'|'saved'|'manual'|'draft',
   boardId:null, turns:[{role,content,ts}], createdAt, updatedAt }]

// lll_route_v1 — last route, for "resume where you left off"
"#/board/f_17233"

// lll_onboard_v1 — see §14.2
{ done:false, categories:[], goal:'', seededBoardId:null, completedAt:0 }

// lll_storage_v1 — size monitor state (§14.5)
{ lastCheck:0, lastBytes:0, warnedAt:0 }
```

**Key naming rule:** every new key is `lll_{noun}_v1`. The `_v1` suffix is not decoration — it is the escape hatch that lets a future breaking change ship as `_v2` alongside, with a read-both/write-new migration, instead of a destructive rewrite. `ep_*` is reserved for gate state and is not extended beyond that.

### 9.5 Taxonomy — four axes that must not be conflated

This is the question the brief asks and the one most likely to be got wrong. There are four independent classification systems and each needs to stay in its own lane.

| Axis | Owner | Cardinality | Mutable by user | Stored |
|---|---|---|---|---|
| **Category** | editorial | exactly 1 of 14 | no | `concept.category` in `concepts.json` |
| **Source / episode** | editorial | 1 `collection_id` + 1 legacy `source` | no | `concepts.json` / `collections.json` |
| **Mastery** | user behaviour | 1 state | implicitly | `lll_mastered_ts_v1` |
| **Tag** | user intent | 0..n | yes | `lll_tags_v1.map` |

Rules:

1. **Categories are a lens, not a folder.** 14, fixed, colour-coded. The user can never create, rename or delete one. Any UI that lets a user "add a category" is a bug.
2. **Tags are the only user taxonomy.** Free text, max 24 chars, max 30 tags total, colour picked from the existing category palette (no new colours — that keeps the visual system closed). Tags apply to concepts and boards. **Tags never apply to words** — words are episode-scoped and a per-word taxonomy is the beginning of a second product.
3. **Mastery is derived, never chosen.** A concept is `saved` if a key exists in `lll_mastered_ts_v1`. V3 adds two *derived* states with no new storage: `fresh` (saved < 7 days ago) and `stale` (saved > 30 days ago and never appeared in a practice/quiz since). Stale drives the "Revisit" rail (§4). Deriving rather than storing means no write path can corrupt it.
4. **Boards are not a taxonomy.** A board is a workspace. A concept can be on five boards. Do not let board membership feed recommendations — it is intent about *making*, not about *knowing*.

The four axes intersect in exactly one place: Library filters (§6.2), which AND across axes and OR within an axis. That is the whole query language and it is enough.

### 9.6 Storage budget

localStorage is ~5 MB per origin. Current worst-case usage is modest; V3 adds four writers that grow without bound if unmanaged.

| Store | Bound | Enforcement |
|---|---|---|
| `lll_captures_v1` | 500 items | prune oldest unused (no `usedInDrafts`) |
| `lll_drafts_v1` | 100 items | prune oldest `status:'draft'` |
| `lll_chat_v1` | 20 threads / 20 turns | prune oldest thread |
| `folder.canvasItems` | 200 per board | hard stop with a toast |
| `lll_voice_v1.samples` | 3 × 1200 chars | input maxlength |

Plus a **size monitor** (§14.5): on app boot, sum `JSON.stringify` lengths of all `lll_*` keys, store in `lll_storage_v1`. Above 3.5 MB, surface a non-blocking banner offering export. Above 4.5 MB, block new canvas item creation with a clear message. Silent `QuotaExceededError` on a user's board is the single worst failure mode in a no-backend product.

### 9.7 Migration ledger

Every migration is a numbered, idempotent function that runs once on app boot in order, guarded by `lll_migrations_v1: [1,2,3]`.

| # | Ships in | Does |
|---|---|---|
| 1 | v3.59 | create `lll_user_id` if absent |
| 2 | v3.59 | folder `schema: 2 → 3` (fill six new fields) |
| 3 | v3.60 | read `lll_theme_filter` / `lll_podcast_filter` once into the initial Library URL query, then stop writing them |
| 4 | v3.62 | no-op for data; Lexi panel retirement is UI-only (§10) |
| 5 | v3.63 | seed `lll_captures_v1` from existing `cc_note_*` keys **as copies**, not moves — notes stay where they are |

Migration 5 is the one to be careful with. A note and a capture are different objects: a note is *about a concept*, a capture is *a thought that may cite concepts*. Copying gives the Write inbox a non-empty day one without destroying anything. Set `capture.source = 'concept'` and `conceptIds = [thatId]` so provenance is intact.

---

## 10. Surface state machines

Written in the same style as the existing CS modal state machine in `architecture.md`, because that documentation pattern already works and a second style would fragment it.

### 10.1 App shell / router

```
States: BOOT → SITE | APP
  BOOT      read localStorage for any lll_* key + parse location.hash
  → SITE    no keys AND no app hash        body[data-shell="site"]
  → APP     any key OR app hash            body[data-shell="app"]

APP sub-state = current route (single source of truth).
  _routeGo(path, {replace}) is the ONLY way to change route.
  It: (a) validates, (b) pushState/replaceState, (c) writes lll_route_v1,
      (d) sets body[data-nav], (e) calls the pane's enter(),
      (f) calls the outgoing pane's exit().

  Unknown route            → #/today, replace (never leaves a dead entry in history)
  #/c/{id} from any route  → MODAL sub-state; the underlying pane stays mounted
  Back from #/c/{id}       → returns to the underlying route, scroll position intact
  #home                    → alias, replace → #/today
  #canvas-{id}             → alias, replace → #/board/{id}
  ?import=BASE64           → unchanged legacy path, runs before routing
```

Persist on close (tab close / refresh): `lll_route_v1`. On next boot, if the hash is empty and `lll_route_v1` exists, restore it — **except** for `#/write/compose/{id}` and `#/chat/{id}`, which return to their index. Resuming into a half-written AI draft is disorienting; resuming into a board is delightful.

### 10.2 Library

```
States: IDLE → LOADING → READY → (FILTERED) → EMPTY
Lens:   concepts | words | episodes   (URL segment, not internal state)

IDLE      pane mounted, nothing rendered
LOADING   concepts.json in flight (only on first-ever Library entry)
READY     chunked render running, 40 tiles per rAF frame
FILTERED  READY + at least one active filter; filter chips visible
EMPTY     zero results; shows the active filters as removable chips
          + a single "Clear all" — never a bare "No results"

Transitions
  filter change   → URL query replace (no history entry) → re-render
  lens change     → URL segment push  (history entry)    → full re-render
  tile click      → push #/c/{id}, Library stays mounted in READY
  scroll          → position stored per (lens + query) in memory only
```

Persists on close: nothing to localStorage. Filters live in the URL, which means a filtered view is shareable and back-button-correct — that is the whole reason for moving them out of `lll_theme_filter`.

### 10.3 Concept detail (Spark)

```
States: CLOSED → OPEN → (WRITING | RELATED | CORNER) → CLOSED
Route:  #/c/{id}

OPEN       right pane 480px (desktop) / full sheet (mobile)
           note input always visible, inline, autosaves on blur + 800ms debounce
WRITING    ✎ Write clicked → capture composer expands in place
           ⌘Enter commits to lll_captures_v1 with conceptIds:[id], collapses back to OPEN
RELATED    related chip clicked → IN-PLACE SWAP (existing v3.48 behaviour, keep it)
           breadcrumb depth raised 3 → 5; route replaces to #/c/{newId}
CORNER     Corner AI expands below the action bar; gate check first

Close      Esc, backdrop (mobile), X, or back → history.back()
Persist    note (always), capture (on commit), nothing else
Scroll     _spLockBodyScroll() on enter, _spUnlockBodyScroll() on exit. Ref-counted:
           WRITING and CORNER must NOT lock again — they are sub-states, not surfaces.
```

The double-lock bug is the specific thing to watch. Three sub-states each calling lock and only one calling unlock is exactly how the iOS scroll-stuck bug gets reintroduced.

### 10.4 Board canvas

```
States: CLOSED → LOADING → IDLE → (PANNING | DRAGGING | CONNECTING | EDITING | PICKING)
Route:  #/board/{id}, body[data-nav="immersive"]

LOADING    hydrate concepts, restore folder.viewport, render items
IDLE       ready; toolbar visible
PANNING    pointerdown on background (1 finger mobile) / space-drag desktop
DRAGGING   pointerdown on a card; writes canvasLayout on pointerup
CONNECTING NEW — arrow tool armed; first click = from, second = to, Esc cancels
EDITING    a note/label item in text edit; blur commits
PICKING    "Add" → concept/vocab/capture picker sheet over the canvas

Persist    canvasLayout + canvasItems + connections on every mutation (debounced 400ms)
           viewport on pan/zoom end (debounced 800ms) — NOT on every frame
Exit       back chevron → history.back() → #/boards; viewport already saved
```

Viewport persistence is debounced separately and more slowly than layout because it fires continuously during pan. Writing viewport on every pointermove would be the single heaviest write in the app.

### 10.5 Write

```
Capture:  IDLE → TYPING → LINKING → COMMITTED
  TYPING     text present
  LINKING    '@' typed → concept picker inline, arrow keys + Enter
  COMMITTED  ⌘Enter → push to lll_captures_v1 → clear box → toast with Undo (6s)
  Undo       pops the capture back into the box; no destructive path without it

Compose:  PICK_SOURCE → PICK_FORMAT → SEED → GENERATING → EDITING → (FINAL)
  PICK_SOURCE  captures + concepts chosen; sourceIds populated
  PICK_FORMAT  six formats (§7.3)
  SEED         REQUIRED for linkedin|thread (>= ~40 words). Blocked with an
               explanatory message, never a silent disabled button.
  GENERATING   POST /api/compose; abortable; timeout 25s → EDITING with error row
  EDITING      user edits body; edit distance vs aiBody computed on exit
  FINAL        "Mark final" → status:'final'; copy-to-clipboard available throughout
  Never       a post/share-to-network action. There is no distribution state.

Practice: IDLE → PROMPTED → ANSWERING → GRADING → FEEDBACK → (next | exit)
  Reuses the existing lexi-practice loop wholesale; adds feynman-grade as a
  third exercise type. Session state in memory; results into lll_lexicon_v1.
```

### 10.6 Chat

```
States: NO_CONTEXT → PICKING → READY → SENDING → READY | ERROR
  NO_CONTEXT  fresh thread; composer disabled; context selector is the only affordance
  PICKING     board / saved / manual / draft
  READY       context chips rendered and removable; three starters visible
  SENDING     POST /api/chat; streaming not required in V3 — a typing row is fine
  ERROR       inline retry row; the turn is NOT written to storage on failure

Persist  thread on every completed turn, capped at 20 turns
Exit     back → #/chat index; thread kept
```

Removing the last context chip returns the thread to `NO_CONTEXT` and disables the composer. That is deliberate: an ungrounded chat box is a worse ChatGPT and must be unreachable by design, not by instruction.

---

## 11. Retire / merge / restructure ledger

Nothing is deleted in v3.58. This is the map of where every existing thing lands. Read the **Fate** column as the commitment.

| # | Today | Fate | Lands in | Ships |
|---|---|---|---|---|
| 1 | Nav bar mode buttons (Listen/Read/Write/Speak) | **restructured** | left rail on desktop, tab bar on mobile; "Speak" stops being a destination | v3.59 |
| 2 | Home drawer — Episodes tab | **moved** | `#/library/episodes` | v3.60 |
| 3 | Home drawer — Concepts tab | **moved** | `#/library` (the default lens) | v3.60 |
| 4 | Home drawer — Vocab tab | **merged** | `#/library/words` | v3.60 |
| 5 | Home drawer — Folders tab | **promoted** | `#/boards`, first-class | v3.61 |
| 6 | Home drawer — Practice tab | **moved** | `#/write/practice` | v3.63 |
| 7 | Home drawer shell (`#libDrawer`, `#libBackdrop`) | **retired** | nothing; the rail replaces the drawer metaphor entirely | v3.61 |
| 8 | Read panel (`#gvOverlay`) | **dissolved** | word list → `#/library/words`; Word Map → `#/library/words/map`; lane popover + tooltip actions kept verbatim | v3.60 |
| 9 | Lexi panel (left pull tab) | **retired** | saved words → `#/library/words` (filter: In my lexicon); practice → `#/write/practice`; accordion row detail → `#/w/{word}` | v3.62 |
| 10 | Lexi practice overlay (`#lexiPracticeOverlay`) | **kept, re-homed** | `#/write/practice`; same overlay, entered from a rail destination instead of a pull tab | v3.63 |
| 11 | Speak/Spark panel | **kept, elevated** | `#/c/{id}` right pane; action bar 7 → 4 + overflow; ✎ Write promoted | v3.62 |
| 12 | Corner | **kept, demoted in the action bar** | sub-state of `#/c/{id}`; unchanged logic and gate | v3.62 |
| 13 | Canvas (`#canvasOverlay`) | **kept, promoted** | `#/board/{id}`; gains viewport persistence, connections, captures | v3.61 |
| 14 | Board share (base64 `?import=`) | **unchanged** | do not touch; it is the only distribution loop that exists | — |
| 15 | Story mode | **kept, unchanged** | sub-state of `#/c/{id}` | v3.62 |
| 16 | Marketing scroll page (hero, how-it-works, founder, newsletter, footer) | **preserved, isolated** | `body[data-shell="site"]` | v3.59 |
| 17 | `lll_theme_filter` / `lll_podcast_filter` | **deprecated in place** | URL query params | v3.60 |

### 11.1 What a Lexi user sees on the day the panel disappears

This is the migration question in the brief and it deserves a literal answer, because the data is untouched and only the door moves.

1. `lll_lexicon_v1` is **not modified**. Zero risk of word loss.
2. On the first boot after v3.62, if `lll_lexicon_v1` is non-empty, the rail's **Library** item shows a one-time dot, and `#/library/words` opens pre-filtered to *In my lexicon* with a single dismissible row: *"Your saved words moved here. Practice is now under Write."* One sentence, one link to `#/write/practice`, dismissed forever via `lll_onboard_v1`.
3. The old pull tab is removed from the DOM in the same commit. It is not hidden with `display:none` — a dead pull tab that still has listeners is a future bug. Its functions are deleted with it, after `grep` confirms no other caller.
4. `#/w/{word}` is a real route from v3.60 onward, so any word can be linked to directly. That is strictly more capability than the accordion had.

### 11.2 What vocabulary browsing looks like in V3

`#/library/words` is the Library shell with the Words lens active. Same chrome, same filter bar, same tile/scan toggle. Filters: category (14), episode, *In my lexicon*, *Practised / Not practised*. The Word Map moves to `#/library/words/map` as a view toggle in the same lens — it stays a `<canvas>` force-directed graph, unchanged code, new parent. The word cloud tooltip and lane popover keep their **Add to Lexi** and **Add to Folder** buttons verbatim; only their mount point changes.

The net effect: vocabulary stops being a separate mode and becomes a lens on the same library, which is what it always was conceptually.

---

## 12. Eden — adopt / skip / invert

The instruction was a principled argument per pattern, not a feature list. Column three is the argument.

| Eden pattern | Verdict | Why |
|---|---|---|
| Left sidebar as navigation spine | **Adopt** | Not because Eden does it, but because Epistemic now has five destinations with URLs and a drawer cannot represent "where you are." The rail is a state display as much as navigation. |
| Spaces → Boards hierarchy | **Skip (for now)** | Two levels of grouping over a 600-item library with a median user holding maybe 3 boards is empty scaffolding. Ship pinned boards in the rail instead; add Spaces only when a real user has >12 boards. Premature hierarchy is the most common way small products feel bureaucratic. |
| Universal search (⌘K) | **Adopt, cheap** | Concepts + words + boards + captures are all in memory already. ~120 lines. Highest perceived-quality-per-line item in the entire plan. Phase 10. |
| AI grounded in your library | **Adopt, inverted** | Eden grounds AI to help you *publish*. We ground it to help you *understand*. Same mechanism, opposite success metric: Eden wins when you post more, we win when you can explain more. This is why Compose requires a seed and Chat requires context chips. |
| Auto-suggest related content | **Adopt aggressively** | We have `related_ids` pre-computed; Eden has to infer relatedness at runtime. This is the single asset we should exploit hardest — hence related chips always visible (§6.3), the "Because you saved X" rail (§4), and "What connects these?" as a Chat starter. |
| Single atomic unit | **Adopt** | Ours is `concept.id` and it is far stronger than Eden's raw save, because ours arrives pre-structured (term/hook/plain/analogy/prompt) and pre-linked. §9.1. |
| Canvas as a primary workspace | **Adopt, and go further** | Eden's canvas holds saves. Ours will hold concepts, words, captures, drafts and user-drawn typed connections. A board becomes an argument, not a moodboard. |
| Social scheduling / publishing pipeline | **Skip, permanently** | Wrong product and an active threat to the moat (§7.6). We produce artifacts; we never touch distribution. No OAuth, no scheduling, no post button. Clipboard only. |
| Universal web clipper | **Skip** | It converts a curated library into an inbox and kills the editorial moat, which is the only defensible thing we own. |
| Multi-media ingest (TikTok/IG) | **Skip** | Wrong audience, wrong content density, and the transcript pipeline is tuned for long-form. |
| Templates / repeatable formats | **Invert** | Eden has post templates. We have the six Compose formats (§7.3), of which two are private thinking tools. Same mechanism, weighted toward learning rather than output volume. |
| Team / collaboration | **Skip in V3** | Requires auth, requires a backend, and the single-player loop is not yet proven. Shared boards via the existing `?import=` URL cover 90% of the value at 0% of the cost. |
| Chrome extension | **Skip** | Same argument as the clipper, plus a second codebase. |

Two Eden patterns are worth naming as *anti-adoptions* because they will be tempting: an activity feed (turns a learning tool into a dopamine surface with nothing to distribute) and streak-count vanity metrics beyond a single number (the roadmap already targets D7 retention; a wall of counters will optimise the wrong behaviour).

---

## 13. Phased build order

Every phase is independently shippable, ships as its own version, and does not break the phase before it. During phases 2–6 the old surfaces continue to work — the rail launches them unchanged before it replaces them. That is the whole trick that makes this migration safe in a single file.

| Phase | Version | Ships | Retires | Risk |
|---|---|---|---|---|
| 1 | **v3.58** | This document + `ai-voice.md` + doc updates. No code. | — | none |
| 2 | **v3.59** | Two shells (§2), router (§3), left rail desktop + mobile nav modes, migrations 1–2. Rail items open the **existing** drawer/overlays unchanged. | — | **highest** — shell split touches global CSS |
| 3 | **v3.60** | Library unified: concepts + words + episodes lenses, URL filters, `#/c/{id}` and `#/w/{word}` routes | Read panel (`#gvOverlay`), Home drawer Episodes/Concepts/Vocab tabs | medium |
| 4 | **v3.61** | Boards index, viewport persistence, connections, board covers | Home drawer entirely | medium |
| 5 | **v3.62** | Spark as a right pane, action bar 7→4, inline note, related always visible | Lexi pull tab | medium |
| 6 | **v3.63** | Write → Capture inbox, `@` picker, Practice re-homed, migration 5 | Home drawer Practice tab | low |
| 7 | **v3.64** | Write → Compose, `api/compose.js`, voice dials, provenance, seed rule | — | medium (new API surface) |
| 8 | **v3.65** | Today: ritual block + Discover rails (§4) | — | low |
| 9 | **v3.66** | Chat + `api/chat.js`, context chips | — | medium |
| 10 | **v3.67** | ⌘K search, tags, keyboard nav, PWA manifest, storage monitor | — | low |
| 11 | **v3.68** | Onboarding (§14.2), export/import identity (§14.1) | — | low |

**The smallest thing that is meaningfully V3: phases 2 + 3 (v3.59 + v3.60).** At that point the product has a persistent spine, real URLs, a unified library, and one fewer full-screen overlay. Everything after that is additive. If the plan has to stop somewhere, it should stop after a phase boundary, never inside one.

**Phase 2 is the one that can go wrong.** It is the only phase that edits global CSS and the only one where a mistake is visible on the marketing page, which is the acquisition surface. Mitigations: scope every new rule under `body[data-shell="app"]`, change zero existing selectors, ship the rail behind `?v3=1` for one commit before flipping the default, and verify the site shell at 375/390px and both themes before flipping.

Ordering rationale worth stating: Compose (phase 7) deliberately lands **after** Capture (phase 6), because Compose without a stock of captures has nothing to rewrite and would immediately degrade into a concept-to-post generator — the exact failure mode §7.6 exists to prevent. And Today (phase 8) lands late because a Discover surface built before boards, captures and words exist would have nothing to recommend from.

---

## 14. What you are not thinking about

Ordered by expected damage if ignored. Several of these matter more than any surface in §6.

### 14.1 Every user is one browser-clear away from losing everything

This is the biggest unaddressed risk in the product and V3 makes it worse, because V3 asks users to invest real work — boards, captures, drafts — into a store that Safari deletes after 7 days of inactivity under ITP, that a "clear browsing data" click destroys, and that does not survive switching from phone to laptop.

Right now the cost of that is a few saved concepts. After V3 it is someone's second brain.

**The fix, in ascending cost:**

1. **Export / import (phase 11, ~150 lines, no backend).** One button: dumps every `lll_*` key to a downloadable `epistemic-backup-YYYY-MM-DD.json`. One button to restore. Prompted automatically when storage crosses 1 MB or 10 boards. This is not optional — it is the seatbelt.
2. **Portable identity via passphrase (still no accounts).** User sets a passphrase; the blob is encrypted client-side with WebCrypto and POSTed to one serverless route backed by a KV store, keyed by `lll_user_id`. Restore on another device with ID + passphrase. Roughly one API route, one KV binding, no auth system, no password reset (deliberately — lose the passphrase, lose the sync, keep the local copy).
3. **Real accounts.** Deferred. Everything above buys 80% of the value without the 100% of the complexity.

If only one item from §14 gets built, build item 1, and build it in phase 2, not phase 11.

### 14.2 There is no onboarding, and V3 makes the first 60 seconds worse

Today a first-time visitor lands on a marketing scroll and can wander. In V3 a returning user lands on a rail with five destinations and a library of 600 concepts. That is a paralysis machine.

**Ship a 90-second first-run, once, stored in `lll_onboard_v1`:**

1. *"What are you here to get better at?"* — pick 3 of 14 categories. Tiles, not a dropdown.
2. *"What do you want to do with it?"* — one of: speak more confidently / write better / think more clearly. This single answer sets the default Compose format and the Today ritual emphasis.
3. Auto-create a first board named from the goal, pre-seeded with 6 concepts from the chosen categories (editor's picks first), pre-arranged on the canvas.
4. Drop the user into that board.

Step 3 is the important one. It solves the empty-second-brain problem: the user's first experience of Boards is a board that already looks like something, not a blank canvas with an "Add" button. Cost is low — the seeding logic is a filter and the existing canvas layout code.

### 14.3 Concept quality debt becomes a public-embarrassment risk

The roadmap carries roughly 500 outstanding `plain` rewrites and 487 `hook` rewrites. Today that debt is invisible: a weak card is one card among 600. The moment Compose quotes a concept verbatim into text a user posts under their own name, a weak `plain` becomes *their* embarrassment, and the failure is attributed to them, publicly.

**Mitigation:** add an optional `qa: true` flag to the concept schema (absent = not yet reviewed). Compose's `sourceIds` picker only offers `qa`-flagged concepts for the two public formats. Private formats and every other surface are unaffected. This turns an editorial backlog into a shipping gate that degrades gracefully instead of a landmine, and it gives the rewrite work a concrete finish line: *"how many concepts can be posted?"*

This is a `concepts.json` schema addition and must go through the existing Airtable → `publish-batch` pipeline, so flag it early.

### 14.4 Zero-auth API routes + two new AI surfaces = a cost and abuse problem

`/api/*` currently has no authentication and the soft email gate is client-side only — trivially bypassed. Today the exposure is bounded because Corner is a single low-volume call. V3 adds Compose and Chat, which are high-volume by design.

**Minimum before phase 7 ships:**
- Per-IP rate limit at the edge (Vercel middleware or a KV counter): e.g. 20 AI calls/hour, 60/day.
- `lll_user_id` sent as a header and rate-limited alongside IP — not security, but it separates honest heavy users from a script.
- Server-side input caps: reject bodies over ~8 KB, reject `sourceIds.length > 8`, reject `turns.length > 20`. Never trust the client for token budget.
- Max tokens set per mode server-side (already the pattern in `cs-generate.js`).
- A hard monthly spend alert on the Anthropic account. Non-negotiable for a pre-revenue product with a public endpoint.

### 14.5 The 5 MB wall, and the silent failure behind it

Covered as budget in §9.6; the point here is the failure *mode*. `localStorage.setItem` throws `QuotaExceededError`, and if that throw is unhandled inside a canvas autosave, the user drags a card, sees it move, and loses it on reload with no error shown. That is the kind of bug that ends a product's word of mouth.

Every write path in V3 must go through one `_lsSet(key, value)` helper that try/catches, and on failure surfaces a blocking modal offering export. One helper, used everywhere, ~20 lines. Add it in phase 2 so every later phase inherits it.

### 14.6 Performance: the 1.58 MB single file

`index.html` is 41,052 lines and 1.58 MB uncompressed. Every V3 phase adds to it. This is a real mobile-first problem — that payload is parsed before anything renders, on every visit, on 4G.

Three things that help without violating the vanilla constraint:
- Defer the marketing shell's non-critical CSS behind the `data-shell` attribute so app users don't pay for hero animations.
- Lazy-load the Word Map canvas code and html2canvas (already lazy) and, in V3, the Compose and Chat panes — as `<template>` content hydrated on first route entry, not as separate files.
- Split CSS and JS into `app.css` + `app.js` referenced by plain `<link>` / `<script src>`. Still vanilla, still no bundler, no npm, no build step. This contradicts the stated "single `index.html`" constraint and therefore needs an explicit decision — see §17.

### 14.7 SEO cannibalisation

The app shell and the static concept pages both live at the same origin. If the router starts claiming paths that the static pages own, or if `body[data-shell="app"]` hides content crawlers currently index, organic acquisition breaks silently and the recovery window is weeks. Rules: the router only ever owns hash routes (`#/...`), never path routes; `vercel.json` `cleanUrls` behaviour is untouched; the site shell renders in full HTML with no JS gating; and every phase's checklist includes viewing a static concept page with JS disabled.

### 14.8 Cheap wins with disproportionate perceived quality

- **⌘K universal search** across concepts, words, boards, captures. ~120 lines against in-memory data. Makes a 600-item library feel small.
- **Keyboard navigation** in the concept detail: `j`/`k` between related, `Esc` to close, `⌘Enter` to capture. Costs almost nothing, signals craft.
- **PWA manifest + service worker.** Unusually high value here precisely *because* all data is local — an installed icon, offline library access, and a real app feel, for a manifest and ~40 lines of caching. Phase 10.
- **Optimistic UI on every save.** Never a spinner for a localStorage write.
- **A single number on Today**, not a dashboard. §6.1.

### 14.9 Decide the free/Pro line now, not later

Target is freemium → €12/month Pro. Retrofitting a gate through eight surfaces is painful; designing the seams now is free. The natural line after V3:

**Free:** unlimited library, unlimited words, 3 boards, 50 captures, 10 AI generations/month, local-only data.
**Pro:** unlimited boards and captures, unlimited AI, voice profile with learn-from-edits, cloud sync + multi-device (§14.1 item 2), export to PDF/Notion.

The gate lands on *volume and continuity*, never on the library itself — the library is the acquisition asset and must stay fully open. Build every counter (`boards.length`, `captures.length`, monthly AI calls) from phase 2 onward even though nothing is gated yet. Counters are cheap; retrofitting them is not.

### 14.10 The only distribution loop worth building

Shared boards already exist via base64 `?import=`. Extend that, and nothing else:
- A shared board URL renders read-only for a non-user, with a *"Make this yours"* CTA that copies it into their localStorage.
- Every concept on a shared board carries a small attribution line to epistemic.live.
- Drafts get the same treatment: a shared draft shows its provenance — the concepts behind it — which is exactly the thing no other writing tool can show.

Zero marginal cost, no backend, and it is on-brand: what spreads is *someone's thinking*, with its sources visible. That is the product's argument made in public.

---

## 15. Design language for V3

No new colours, no new fonts, no new radii. V3 is a change of *grammar*, not of vocabulary. Everything below composes from tokens already in `design-tokens.md`.

### 15.1 The one conceptual shift: from overlay to place

v2/v3 is modal-overlay-heavy. Every surface arrives on top of another surface, backdrop-first, and leaving means dismissing. That grammar says *"this is temporary."* V3's grammar says *"this is where you are."*

| | v3.57 (overlay) | V3 (place) |
|---|---|---|
| Arrival | scale + fade from centre, backdrop darkens | slide/settle into a region that was already reserved |
| Departure | dismiss (Esc, backdrop) | navigate (back, or another rail item) |
| Depth cue | backdrop opacity | a 1px border and a background one step lighter |
| Mental model | "a thing opened over my work" | "I moved" |

Practical consequence: **backdrops mostly disappear on desktop.** The concept detail is a right pane, not a modal. Boards are a route. Only three things keep a true backdrop in V3 — the mobile concept sheet, the picker sheets, and the export/quota modal — because those genuinely are temporary.

### 15.2 New component patterns (add these to `design-tokens.md` when built)

**Rail item** — the only genuinely new atom.
```
height 40px · radius 8px · padding 0 12px · gap 10px
icon 18px (1.5px stroke, currentColor) · label DM Sans 14px/500
idle    color: color-mix(in srgb, var(--text) 62%, transparent)
hover   background: color-mix(in srgb, var(--text) 6%, transparent)
active  background: color-mix(in srgb, var(--accent) 12%, transparent)
        color: var(--accent)
        + 2px left bar, radius 999px, inset 8px vertical
transition: background .15s ease, color .15s ease   /* never width, never transform */
```
The active state is the rail's whole job. It must be readable at a glance, in both themes, and it must never animate — a moving indicator turns navigation into a 200ms wait.

**Pane** — a routed region.
```
background: var(--bg)
border-left: 1px solid color-mix(in srgb, var(--text) 10%, transparent)
enter: opacity 0 -> 1 over .18s + translateY(4px) -> 0
exit:  opacity 1 -> 0 over .12s, no transform
```
Exit is faster than enter and drops the transform. Slow exits are the most common reason an interface feels sluggish, and nobody has ever complained that a closing panel closed too fast.

**Context chip** (Chat context, Compose sources, active filters) — one component, three uses.
```
height 26px · radius 999px · padding 0 8px 0 10px · DM Mono 11px uppercase
background: color-mix(in srgb, var(--cat-color, var(--text)) 12%, transparent)
× button 16px, appears at 100% opacity always on touch, on hover on desktop
```
Making filters, sources and chat context the *same* component is the cheapest coherence win in V3: the user learns "these small pills are the things currently in play" exactly once.

**Provenance line** (under every Compose output, §7.3) — DM Mono 11px, `--text` at 45%, category dot + term, comma-separated, terms clickable to `#/c/{id}`. This is the single most brand-defining new element in V3: it is the visible proof that the output came from somewhere.

**Empty state** — three lines maximum: what this is, one action, nothing else. No illustrations, no mascots. Applies to Boards index, Capture inbox, Chat, and every filtered-to-zero Library view.

### 15.3 Animation grammar

| Motion | Duration | Easing | Used for |
|---|---|---|---|
| micro (hover, chip, toggle) | .15s | ease | existing token, unchanged |
| pane enter | .18s | cubic-bezier(.2,.8,.3,1) | routed panes |
| pane exit | .12s | ease-out | routed panes |
| sheet (mobile) | .24s | cubic-bezier(.2,.8,.3,1) | bottom sheets, concept sheet |
| expand in place | .2s | ease | `grid-template-rows: 0fr → 1fr`, unchanged |
| canvas | none | — | pan/zoom are direct manipulation, never transitioned |

Rules that carry over and must not be broken: nothing over 600ms; no `backdrop-filter` on any container with animating children; no `filter` on list containers; `will-change` only on hover or immediately before an animation; every animation needs a `prefers-reduced-motion: reduce` override; `display:none → animate` requires two `requestAnimationFrame` frames.

**The rail never animates its width.** Collapse is an instant class swap. A 200ms reflow of the entire app region on every collapse is both a jank source and, on a canvas surface, a resize storm.

### 15.4 Density and layout

```
--rail-w: 236px            --rail-w-collapsed: 64px
--pane-detail-w: 480px     --pane-max: 1120px
Breakpoints: >=1024 rail persistent · 768-1023 rail collapsed by default
             <768 rail becomes drawer + bottom tab bar
```
Content is capped at `--pane-max` and centred; the library grid is the only surface allowed to use full width, because a 600-tile grid genuinely benefits from it. Existing spacing scale (4/6/8/12/16/24/40/80) and radii (6/8/10/999) are used as-is; V3 introduces no new values in either scale.

### 15.5 Light theme

Every new surface ships with its `html[data-theme="light"]` rules in the same commit. The rail, panes, chips and provenance line are all defined in `color-mix` against `--text` / `--accent` / `--bg` above, which means they theme automatically — that is the reason for expressing them that way rather than in literal hex. The pre-commit check stands: zero hardcoded hex values in new CSS, verified before every commit.

---

## 16. Risks and roadblocks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Phase 2 shell split breaks the marketing page | medium | **severe** (kills acquisition) | scope every rule under `body[data-shell="app"]`; change zero existing selectors; ship behind `?v3=1` for one commit; verify both themes at 375/390px and with JS disabled |
| 2 | `QuotaExceededError` silently eats a user's board | medium | severe | `_lsSet()` helper with try/catch in phase 2; size monitor; export prompt (§14.5) |
| 3 | Compose produces generic slop and damages the brand | medium | severe | seed requirement for public formats; banned-strings list; mandatory provenance; `qa` gate (§14.3) |
| 4 | Uncapped AI cost / abuse on public `/api/*` | medium | high | rate limits + server-side caps + spend alert before phase 7 (§14.4) |
| 5 | Two scroll-lock owners reintroduce the iOS stuck-scroll bug | high | medium | sub-states must never call `_spLockBodyScroll()`; audit ref counts at each phase boundary |
| 6 | Single-file size makes mobile first paint worse each phase | high | medium | lazy pane hydration via `<template>`; possible CSS/JS split (§17.1) |
| 7 | Router and existing deep links (`#home`, `#canvas-{id}`, `?import=`) collide | medium | high | permanent aliases in the router; `?import=` handled before routing; regression-test both every phase |
| 8 | Scope creep — Chat becomes a month | high | medium | it ships last and is capped hard (§8); if phase 9 exceeds its budget, cut it to V4 without touching anything else |
| 9 | Feature parity gaps during phases 3–5 (something in the old drawer has no new home) | medium | medium | §11 is the checklist; nothing is deleted until its replacement has shipped and been used |
| 10 | Model-string inconsistency causes 500s on new endpoints | medium | medium | resolve §17.2 before writing `api/compose.js` |
| 11 | Platform risk: Spotify/Apple ship this natively | low-medium | severe | unchanged strategic answer — the moat is editorial taste plus the user's personal layer, neither of which a platform will build for non-native speakers |
| 12 | Building V3 stalls the concept pipeline for weeks | high | medium | phases are 1–3 days each by design; editorial work (the ~500 rewrites) continues in parallel because it touches different files entirely |

Risk 12 is the quiet one. An architecture project that freezes content production for a month is a net loss for a product whose moat is content. Keep publishing during V3.

---

## 17. Open decisions — **[ACTION — Gergely]**

Three things need a call before the relevant phase starts. Everything else in this document is decided.

### 17.1 Split `app.css` / `app.js` out of `index.html`?

The stated constraint is a single `index.html` with all CSS and JS inline. V3 adds roughly 6,000–9,000 lines to a file already at 41,052. Splitting into `app.css` + `app.js`, referenced by plain `<link>` and `<script src>`, keeps everything vanilla — no bundler, no npm, no build step, no framework — and makes the file editable again while letting the browser cache the app layer separately from the HTML.

Recommendation: **yes, but only for new V3 code.** Legacy stays inline and untouched. New rail/router/pane/Write/Chat code goes into the new files from phase 2. This is a one-way door, so it needs an explicit yes before phase 2 starts. If the answer is no, the plan still works — it just gets progressively harder to edit.

### 17.2 `claude-sonnet-4-6` vs `claude-sonnet-4-5`

`engineering-standards.md` states `cs-generate.js` must always use `claude-sonnet-4-6` and must never revert to `claude-sonnet-4-5` because it is deprecated and causes 500 errors. The live repo has six call sites on `claude-sonnet-4-5` and two on `claude-haiku-4-5-20251001`. One of these is wrong, and V3 adds two more endpoints that will inherit whichever is chosen.

Needed: confirm the correct current string, update all call sites in one commit, and fix whichever document is stale. Do this before phase 7.

### 17.3 Does Chat ship in V3?

This plan says yes, last, hard-capped (§8, phase 9). The alternative is deferring it to V4 and ending V3 at phase 8 (Today + Discover), which is a clean, coherent product on its own. Chat is the highest-effort, lowest-certainty item in the plan; the Write pillar is the differentiated one. If time is constrained, cut Chat, not Compose.

No answer needed now — but the decision should be made at the phase 8 boundary, deliberately, rather than by drift.

---

## 18. Version and commit

- **This document ships as v3.58** — documentation only, zero code changes.
- Files added: `docs/v3-architecture.md`, `docs/ai-voice.md`.
- Files updated: `docs/changelog.md`, `docs/roadmap.md`, `docs/architecture.md`.
- Next code version: **v3.59** (phase 2 — app shell, router, rail).
