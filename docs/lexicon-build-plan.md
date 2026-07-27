# Lexicon — Full E2E Build Plan
# Version: 1.0 — 2026-07-27
# Paste this entire document into a new Cowork session to begin the build.
# Do NOT start coding until all pre-build steps are complete.

---

## SESSION INVOCATION

Start by saying: **"Use cowork-default-instructions.md"**

Then read these files in parallel before touching anything:
1. `docs/cowork-default-instructions.md` (session protocol)
2. `docs/engineering-standards.md` (CSS/JS/animation/mobile rules — all of it)
3. `docs/architecture.md` (localStorage keys, state machines, data shapes)
4. `docs/design-tokens.md` (colors, fonts, spacing, component patterns)
5. `docs/changelog.md` — top 5 lines only (get current version number)
6. `docs/build-journal.md` — top entry only (latest lesson)
7. `episode_meta.json` — first 3 entries (confirm vocab_vault shape is `{ word, definition, timestamp_seconds }`)
8. `index.html` — grep for: `vocab`, `ep-drawer`, `conv-panel`, `lll_lexicon`, `browseSwitch` (understand existing vocab render + panel DOM before writing a single line)

State before touching code:
- Current version: vX.XX — next commit is vX.XX + 0.01
- Session type: BUILD
- Git rule: I will NOT run any git commands. Gergely runs `./ep-commit.sh` from Mac Terminal.

---

## WHAT WE'RE BUILDING

**Lexicon** — a vocabulary practice tool that sits inside the episode drawer's existing vocab section. When a user taps "→ Use it" on any vocab word, they get two short real-life sentences showing how to use that word naturally — one casual, one professional. Sentences save automatically to a persistent Lexicon panel accessible from the nav.

**Why this is not a duplicate of Spark or Corner:**
- Spark = conversation prompt around a *concept* (the idea)
- Lexicon = usage sentences around a *word* (the lexical unit)
- Corner = personalized framing for a *situation* (the context)
Lexicon is Step 1 of practice. Spark is Step 2. Corner is Step 3.

**Primary user:** non-native English professional who knows the word passively but has never said it out loud confidently.

---

## DATA — NO NEW SCHEMA REQUIRED

`episode_meta.json` already has `vocab_vault` per episode:
```json
{ "word": "preemptive", "definition": "Acting before a threat materializes", "timestamp_seconds": 1823 }
```

Extraction stores 20–25 words per new episode. 15 older episodes have only 5–7 (backfill with `tools/generate-episode-intel.js` separately — not part of this build).

The concept card fields (plain, hook) from `concepts.json` travel alongside the word as API context — fetched from the already-loaded `CONCEPTS` array in memory. Match by `collection_id` to get the episode's concepts, then use the first matching concept's `plain` field as context. If no concept match, use the episode title as fallback context.

---

## NEW localStorage KEY

**Key:** `lll_lexicon_v1`
**Type:** Array, max 100 entries, ring buffer (oldest dropped when cap hit)
**Entry shape:**
```js
{
  word: "preemptive",
  definition: "Acting before a threat materializes",
  collectionId: 42,
  episodeTitle: "Chris Williamson — The War on Men",
  sentences: [
    { label: "with a friend", text: "I texted her Sunday — just preemptive, before the week gets weird." },
    { label: "in a meeting", text: "I flagged it to Mike early, preemptive — didn't want it to land cold." }
  ],
  savedAt: 1722038400000
}
```

**Session cache key:** `lll_lexicon_session_{{word_lowercase_no_spaces}}`
Shape: `{ sentences: [{label, text}] }` — raw API response. Written on first API call. Read before firing API on any subsequent tap of the same word within the tab session. Cleared on tab close (sessionStorage, not localStorage).

Document both keys in `docs/architecture.md` at end of session.

---

## API CALL

**Endpoint:** reuse `cs-generate.js` pattern — new mode branch `mode: 'lexicon'`
**Model:** `claude-haiku-4-5-20251001` (NOT sonnet — this is a short generation, haiku is faster and cheaper)
**Max tokens:** 180
**Expected cost:** ~$0.00002 per call
**Payload:**
```js
{
  mode: 'lexicon',
  word: "preemptive",
  definition: "Acting before a threat materializes",
  context: concept.plain  // from CONCEPTS array, matched by collection_id; fallback: episode title
}
```

**System prompt — final version (do not deviate):**

```
You write like a Rolling Stones journalist who reads psychology.
Sharp. Specific. Never academic. Never therapeutic.

A non-native English speaker just heard this word in a podcast. They
understand it but have never confidently said it out loud. Give them
two short sentences they could say TODAY — one to a close friend or
partner, one at work or in a meeting.

Word: {{word}}
Definition: {{definition}}
Context from the concept it came from: {{context}}

OUTPUT RULES — non-negotiable:
1. Each sentence: 8–15 words. Count them before returning.
2. The word must appear inside the sentence, not as its subject or topic
3. Do not start either sentence with the vocab word
4. First or second person only: "I", "you", "we", "my", "your"
5. Name a specific setting: a kitchen, a Sunday, a Slack message, a 1:1, a dinner, a walk

VARIETY — the two sentences must feel and sound structurally different:
6. Different grammatical mood: one declarative, one interrogative or imperative
7. Different perspective: one about yourself doing it, one about noticing it in someone else — or one giving advice, one describing a moment
8. Different emotional register: one can be dry or wry, the other direct
9. If both sentences have the same rhythm or clause structure, rewrite one

ANTI-SLOP:
10. No em-dashes. No colons mid-sentence to introduce a clause.
11. No triads ("X, Y, and Z" three-part lists)
12. No "not X but Y" constructions
13. No: demonstrate, utilize, approach (as noun), implement, showcase, synergy, impactful
14. No therapy-speak: unpack, sit with, hold space, toxic, trauma response
15. No corporate-speak: circle back, bandwidth, alignment, move the needle
16. No sentence should make sense without the vocab word — do not pad around it
17. No awakening language: changed everything, realized, transformed, suddenly
18. The casual sentence must sound like an opinionated friend making a point — not explaining a concept
19. The work sentence must land a clear idea in one go — no hedging
20. Compound words or phrases (e.g. "loss aversion") must appear intact — never split across a clause break

EDGE CASES:
21. If the word is abstract (epistemic, abstraction, sovereignty), ground it in a human moment: a specific decision, a conversation, a feeling — not a theory
22. If the word has multiple meanings, use the one closest to {{definition}}
23. If the word is rarely used casually, the casual sentence can be slightly dry or witty rather than forced-informal
24. If the user provides a word with no definition (free-form search), infer the most common meaning and use it

Return only valid JSON. No explanation, no markdown:
{ "with a friend": "...", "in a meeting": "..." }
```

**cs-generate.js change:** add a new `else if (mode === 'lexicon')` branch. Returns `{ sentences: [{ label: "with a friend", text: "..." }, { label: "in a meeting", text: "..." }] }`. Parse from the JSON the model returns. Guard against malformed JSON with try/catch — return a generic error object if parse fails.

---

## STATE MACHINE (per word chip)

```
IDLE      — word chip shows word + "→ Use it" button. Definition visible below word.
LOADING   — "→ Use it" button replaced by shimmer skeleton (two lines, 80% + 65% width).
            Spinner not used — shimmer is more editorial.
REVEALED  — Shimmer clears. Definition still shown. Two sentence blocks fade in staggered.
            Save button appears 100ms after last sentence.
SAVED     — Save button becomes "✓ Saved" with accent color. Entry written to localStorage.
            State persists for the tab session (chip remembers it's saved).
ERROR     — "Couldn't generate — tap to retry" appears below word chip in muted text.
            Tapping retry re-enters LOADING state.
```

**Re-tap on REVEALED word:** toggles sentences off (collapses accordion). Does NOT re-call API.
**Re-tap on SAVED word:** re-opens sentences from localStorage. Zero API call.
**Multiple words open simultaneously:** allowed. Each chip manages its own state independently.
**Session cache hit:** if `lll_lexicon_session_{{word}}` exists in sessionStorage, skip API, go straight to REVEALED.

---

## ENTRY POINTS

### Entry Point 1 — Episode drawer vocab row (primary)

The existing vocab section renders word chips from `episode_meta.json` `vocab_vault`. Each chip currently shows word + definition. Changes:

1. Word chip layout becomes: **word** (Playfair 700, accent color) → **definition** (DM Sans 0.78rem, muted, below) → **"→ Use it" button** (DM Mono, 0.58rem, uppercase, right-aligned or below definition)
2. "→ Use it" button tap → LOADING → REVEALED
3. Sentences expand below the chip in a `max-height` accordion
4. Save button appears in REVEALED state

### Entry Point 2 — Free-form word search in Lexicon panel

A search bar at the top of the Lexicon panel. User types any word (not necessarily from vocab_vault). On submit (Enter or search icon tap):
- Checks localStorage first — if word already saved, show saved sentences
- If not saved — fires API call with no `definition` and no `context` (model infers from word alone, per edge case rule 24)
- LOADING → REVEALED → auto-save

This entry point has no episode attribution. `episodeTitle` is set to `null`, `collectionId` to `null`.

---

## LEXICON PANEL

Reuses `conv-panel` / `storiesOverlay` DOM pattern. Same slide-in mechanic as Spark/Corner.

**Two tabs:**
- `✦ Lexicon` — saved words, newest first, grouped by episode (or "Free search" group for null collectionId)
- `◈ Search` — free-form word search bar + results

**Nav entry:** new nav button. Appears always (not conditional on saves). Icon: `Aa` in DM Mono, or a small book glyph — decide in-session based on what fits the nav island. Follows same nav-button pattern as Spark/Corner.

**Panel header:** "Say it." in Playfair italic — matches the Epistemic voice. Subline: "Words from what you've heard." in DM Mono muted.

**Saved entry layout (per word):**
```
[word]            Playfair 700 1.2rem, accent color, with shimmer sweep on it (see SHIMMER EFFECT)
[episode chip]    DM Mono 0.58rem muted — "Modern Wisdom · S03E14" or "Free search" if null
─────────────────────────────────────────────────────────────
[definition]      DM Sans 0.82rem, muted2, italic — travels with the word always
─────────────────────────────────────────────────────────────
with a friend     DM Mono 0.58rem, muted, all-caps label
"sentence..."     Playfair italic 0.95rem, var(--text), gold left border 2px

in a meeting      DM Mono 0.58rem, muted, all-caps label
"sentence..."     Playfair italic 0.95rem, var(--text), gold left border 2px
─────────────────────────────────────────────────────────────
[× Remove]        DM Mono 0.58rem, muted, right-aligned — removes from localStorage
```

**Entry divider:** `1px solid var(--border)` between words.

**Empty state:** "Nothing saved yet. Open an episode and tap → Use it on any word." — DM Sans, centered, muted.

---

## SHIMMER EFFECT ON VOCAB WORDS

Vocab words (both in the drawer and in the Lexicon panel) get a distinctive constant shimmer — a light sweep across the text, not a glow.

**Implementation (GPU-composited, performance-safe):**
```css
.lexicon-word {
  position: relative;
  display: inline-block;
  color: var(--accent);
  font-family: 'Playfair Display', serif;
  font-weight: 700;
}
.lexicon-word::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(232, 213, 163, 0.35) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  animation: lexiconShimmer 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes lexiconShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lexicon-word::after { display: none; }
}
```

**Stagger:** apply `animation-delay: calc(var(--shimmer-index) * 0.6s)` per word chip so they don't sweep in sync. JS sets `--shimmer-index` as an inline CSS variable when rendering the word list.

**Performance note:** `background-position` animation on a `::after` pseudo-element is GPU-composited. Does not trigger paint or layout. Safe for 20+ simultaneous instances. No `will-change` needed — the animation itself promotes the layer.

**Resting underline:** the word also has `text-decoration: underline dotted var(--accent); text-underline-offset: 3px` as a baseline affordance so it looks interactive even when the shimmer isn't mid-sweep.

**Do NOT use:** `backdrop-filter`, `filter: brightness()`, `box-shadow` on the word. Shimmer is purely the `::after` sweep.

---

## ANIMATIONS (all engineering-standards.md compliant)

| Element | Animation | Spec |
|---|---|---|
| Vocab word chip (shimmer) | `lexiconShimmer` sweep | `4s ease-in-out infinite`, staggered, `::after` only |
| "→ Use it" button | Fade in on mount | `opacity 0→1, 0.15s ease` |
| Shimmer skeleton (LOADING) | Pulse | `opacity 0.4→0.8→0.4, 1.2s ease-in-out infinite` on `.lex-skeleton` spans |
| Sentence block reveal | Accordion | `max-height: 0→200px`, `opacity: 0→1`, `0.22s cubic-bezier(0.22,1,0.36,1)` |
| Sentence 1 vs Sentence 2 | Stagger | Sentence 2 delayed `80ms` |
| Save button entrance | Fade | `opacity: 0→1`, `100ms` after sentence 2 arrives |
| "✓ Saved" state | Color transition | `color` to `var(--accent)`, `0.15s ease` |
| Panel slide-in | Translate | Reuse existing `conv-panel` `translateX` pattern — do not invent a new one |
| Panel tab switch | Slide down + fade | Reuse existing `panelItemIn` keyframe |
| Ring buffer toast | Slide up from bottom | `translateY(100%→0)`, `0.25s ease`, auto-dismiss after 3s |

**All animations must have:**
```css
@media (prefers-reduced-motion: reduce) {
  /* disable or instant-switch every animation above */
}
```

**No `backdrop-filter`, no `box-shadow` on animating elements, no `filter`, no `will-change` on static rules.**

**`display:none` → animate rule (from engineering-standards.md):** set `display` in one step, add animation class in the next `requestAnimationFrame`. Never combine.

---

## MOBILE

- Drawer vocab row: word chips stack vertically on mobile (already the case). "→ Use it" button below definition. Full-width tap target (min 44px height).
- Sentences expand below chip in same vertical flow — no layout change needed.
- Lexicon panel on mobile: bottom sheet, 88vh, swipe-down to close. Reuse `_initDrawerSwipeClose` pattern from existing drawers.
- Panel search bar: `font-size: 16px` minimum on mobile to prevent iOS Safari auto-zoom.
- `padding-bottom: env(safe-area-inset-bottom)` on panel footer.
- Touch: `touch-action: pan-y` on the word list. No drag-scroll handlers — `'ontouchstart' in window` guard on any initDragScroll call.
- Card tilt: not applicable here (no flip cards).

---

## LIGHT MODE

Every new surface needs a `html[data-theme="light"]` override:

| Element | Dark | Light |
|---|---|---|
| Sentence block bg | `var(--surface2)` | `var(--surface2)` (inherits correctly) |
| Sentence block border | `var(--border)` | `var(--border)` |
| Word color | `var(--accent)` | `var(--accent)` (maps to `#b8860b` in light) |
| Shimmer sweep color | `rgba(232,213,163,0.35)` | `rgba(184,134,11,0.25)` |
| Panel bg | `var(--surface)` | `var(--surface)` |
| Save button active | `var(--accent)` | `var(--accent)` |

Use existing CSS variable tokens only. No new hex values. Check `design-tokens.md` before writing any color value.

---

## EDGE CASES

| Scenario | Handling |
|---|---|
| Word has no definition in vocab_vault | Show word only. API receives empty definition string — model infers from word + context |
| API returns malformed JSON | Catch parse error → ERROR state → "Couldn't generate — tap to retry" |
| API times out (>8s) | AbortController with 8s timeout → ERROR state |
| Same word tapped again (REVEALED) | Collapses accordion. No API call. |
| Same word tapped (SAVED) | Reopens from localStorage. No API call. |
| Word already in sessionStorage cache | Skip API entirely, go straight to REVEALED |
| localStorage at 100 entries | Drop oldest entry. Show toast: "Oldest word removed to make room." |
| Free-form word typed that doesn't exist | Model infers meaning — still generates sentences. No error state for this. |
| Compound word (e.g. "loss aversion") | Treated as single unit — appears intact in both sentences |
| Episode has no vocab_vault | Vocab section does not render. No Lexicon entry point. No error. |
| collectionId null (free search) | Entry saves with `episodeTitle: null`. Panel shows "Free search" as group label. |
| Concept.plain not found for word's episode | Fall back to episode title as context string |
| Word saved, episode later removed from episode_meta.json | Entry stays in localStorage with episode label — no broken reference, no error |
| User clears localStorage externally | Lexicon panel shows empty state. "Nothing saved yet." |
| 20+ simultaneous shimmer animations | Performance safe — `background-position` on `::after` is GPU-composited. No action needed. |
| Panel opened on mobile keyboard visible | Panel is `position:fixed`, not affected by viewport resize from keyboard |

---

## BUILD SEQUENCE

### Phase 1 — Word chip UI + API call [LOW RISK]

1. Grep for existing vocab render in `index.html` — understand exactly how `vocab_vault` words are currently rendered as chips
2. Modify the chip template: word (Playfair, accent, `.lexicon-word` class with shimmer) → definition (DM Sans, muted, italic) → "→ Use it" button
3. Add shimmer CSS (`lexiconShimmer` keyframe + `.lexicon-word::after`)
4. Wire `→ Use it` click → `_lexiconGenerate(word, definition, collectionId)` function
5. Implement state machine: IDLE → LOADING (shimmer skeleton) → REVEALED (sentence accordion) → SAVED / ERROR
6. Add `lexicon` mode branch to `cs-generate.js` (haiku model, system prompt above, JSON parse with try/catch)
7. Test with 3 different words across 2 episodes. Verify: sentences are distinct in structure, definition travels with the word, save writes correctly to localStorage.

**Commit: `v2.XX - Lexicon Phase 1: word chip + API + save`**

### Phase 2 — Lexicon panel [MEDIUM RISK]

1. Read existing `conv-panel` DOM carefully before touching it — understand tab structure
2. Add new panel tab (`✦ Lexicon`) following existing `panelSwitchTab` pattern
3. Add `◈ Search` tab with free-form input — wired to `_lexiconFreeSearch(word)`
4. Render saved entries from `lll_lexicon_v1` — grouped by episode, newest first
5. Add nav button for Lexicon — follow exact nav-button pattern used by Spark/Corner
6. Implement `× Remove` per entry — removes from localStorage, re-renders list
7. Empty state rendering
8. Ring buffer overflow toast

**Commit: `v2.XX - Lexicon Phase 2: panel + nav + search`**

### Phase 3 — Polish [LOW RISK]

1. Mobile QA: test at 390px. Check tap targets, panel height, iOS scroll behavior
2. Light mode QA: every new surface in light theme
3. `prefers-reduced-motion`: all animations disabled/instant
4. `node --check index.html` (or grep for syntax errors) before committing
5. Verify no new hex values — all colors use CSS variables
6. Verify no `backdrop-filter`, no `box-shadow` on animating elements
7. Test ring buffer: manually set localStorage to 99 entries, tap a new word — confirm oldest drops and toast appears
8. Test ERROR state: temporarily break the API URL, confirm retry works

**Commit: `v2.XX - Lexicon Phase 3: polish, mobile, light mode`**

---

## DOC UPDATES (mandatory at end of each phase commit)

| Doc | What to add |
|---|---|
| `docs/changelog.md` | New entry at top per commit |
| `docs/architecture.md` | `lll_lexicon_v1` and `lll_lexicon_session_*` localStorage keys |
| `docs/design-tokens.md` | `.lexicon-word` shimmer component pattern |
| `docs/build-journal.md` | Any new lessons/gotchas discovered |

---

## WHAT NOT TO BUILD (scope guard)

- No pronunciation audio
- No spaced repetition / re-surfacing algorithm
- No quiz mode on vocab words (separate feature if ever)
- No translation (English only)
- No user-editable sentences
- No sharing of individual sentences
- No social/public vocabulary lists
- Do not modify the concept card schema — Lexicon reads `plain` as context only, writes nothing back

---

## PRE-COMMIT CHECKLIST (engineering-standards.md)

- [ ] No hardcoded hex values in new CSS
- [ ] No curly quotes in JS blocks
- [ ] Light-mode rule exists for every new surface
- [ ] Mobile works at 390px
- [ ] `prefers-reduced-motion` override on every new animation
- [ ] `architecture.md` updated with new localStorage keys
- [ ] `design-tokens.md` updated with shimmer component spec
- [ ] No `backdrop-filter` introduced
- [ ] No `will-change` on static base rules
- [ ] `display:none` → animate uses two-frame pattern
- [ ] `node --check` or equivalent syntax check before final commit
- [ ] Gergely runs `./ep-commit.sh` — Claude does NOT run git commands
