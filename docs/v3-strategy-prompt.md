# Epistemic V3 — Opus 5 Strategy Session Prompt

> Copy everything below the horizontal rule and paste it as your first message in a new Opus 5 chat.

---

Use cowork-default-instructions.md AND engineering-standards.md
Verify that you've read the latest doc updates, and what version number comes next. Don't forget to document everything (version number + title + description) once we commit changes.

---

## Who you are and what this session is

You are acting as the lead product architect for Epistemic — a podcast-to-concept-card learning platform currently live at epistemic.live. You have been brought in to design V3: a fundamental rethink of the product's information architecture, navigation system, and surface hierarchy, inspired by Eden.so but adapted for Epistemic's distinct purpose and constraints.

This is a pure **strategy and architecture session**. No code will be written here. The output of this session should be a complete, coherent V3 build plan: data model, navigation system, surface-by-surface purpose, state machine logic, feature decisions, and phased execution order. It must be specific enough that a Sonnet 4.6 build session can execute it without re-asking strategic questions.

Do not hedge. Do not ask 10 clarifying questions. Make reasoned assumptions, state them clearly, and build the full system. Push back on bad ideas. Propose better ones.

---

## The current product — what exists at v3.57a

**Stack:** Single `index.html` file (~41,000 lines). Vanilla HTML/CSS/JS only. No framework. Hosted on Vercel. Data from `concepts.json` (loaded at runtime). All user state in `localStorage`. No backend, no auth, no database.

**Font system:** Playfair Display (headings), DM Sans (body), DM Mono (labels/mono). Never Inter, Roboto, Arial.

**Color system:** Dark theme `#0d0d0d` bg, `#f0ede8` text, `#e8d5a3` accent. Light theme (`[data-theme="light"]`) has full parallel rules. `color-mix(in srgb, ...)` for tints.

**Concept library:** ~600+ curated cards across 14 categories (finance, psychology, thinking, power, relationships, language, business, identity, health, philosophy, society, creativity, science, tech-ai). Schema: `{ id, term, category, source, hook, plain, analogy, prompt, collection_id, related_ids[], editors_pick, timestamp, duplicate_of }`. Sourced from Modern Wisdom, Diary of a CEO, Dan Koe. The `related_ids[]` graph is pre-computed and is a structural competitive advantage.

**Current navigation surfaces (what exists):**

1. **Nav bar** — Logo, Listen/Read/Write/Speak mode buttons, Home, theme toggle. Mode buttons each open overlapping surface panels.

2. **Home drawer** (`#libDrawer`, `#libBackdrop`) — Slides in from left on "Home" click. Has 5 tabs:
   - **Episodes** — favorited + recent episodes
   - **Concepts** — full library grid with filters by category, editor's pick, source. Tile + scan view modes. Right-click → folder picker. Long-press (mobile) → folder picker.
   - **Vocab** — saved lexicon words (Lexi). Practice cards view.
   - **Folders** — user-created folders. Each folder holds concept IDs + vocab words. Canvas button per folder opens the infinite canvas.
   - **Practice** — spaced repetition Lexi session

3. **Read panel** (`#gvOverlay`) — Full-screen vocab overlay. Opens when "Read" is clicked. Shows all vocab words organized by category/podcast. Words can be added to Lexi. Has a Word Map (force-directed canvas of vocab words by category). Word Cloud tooltip + lane popover both have "Add to Lexi" and "Add to Folder" buttons.

4. **Speak/Spark panel** (`#spBackdrop`, concept drawer) — Opens when a concept card is clicked. Full detail view: term, hook, plain, analogy, prompt. Action bar: Share, Listen (TTS), Master (save), Note, Related, Chat, Folder. "Corner" AI conversation starter. Story mode.

5. **Lexi panel** (`#lexiPanelInner`) — Left-side pull tab. Saved vocab words. Collapsible accordion rows with practice state, definitions, AI-generated example sentences. Lexi practice session (writing + AI grading).

6. **Canvas** (`#canvasOverlay`) — Full-screen infinite spatial workspace per folder. Pan/zoom/drag concept cards. Freeform elements: 📝 Note, 🏷 Label, 💬 Vocab, ▶ YT Clip, 🔗 Link. SVG arrows between cards. Bottom toolbar. Share board (base64 URL). PNG export. Deep link via URL hash `#canvas-{folderId}`. Mobile pinch-to-zoom.

7. **Corner** — AI-powered conversation starter. Takes a concept, generates 3 real-life situations to use it. Soft email gate after first free use.

8. **Write panel** (`#lexiPracticeOverlay`) — Full-screen practice mode. Vocab sentence writing + AI grading.

**localStorage keys in use:**
- `lll_folders_v1` — `[{ id, name, icon, color, emoji, conceptIds[], vocabWords[], noteIds[], canvasLayout, canvasItems, createdAt, updatedAt, pinned }]`
- `lll_lexicon_v1` — saved vocab words with practice state + grading history
- `lll_saved_v1` — saved/mastered concept IDs
- `lll_theme` — 'light' | 'dark'
- `ep_unlocked`, `ep_used_*` — email gate state
- `lll_user_id` — UUID for future analytics

---

## What the user wants to retire and why

**Retire: Lexi panel (left pull tab)**
Currently a separate left-side panel for saved vocab. It duplicates function with the Vocab tab in Home drawer. The pull-tab pattern adds navigation complexity. The practice session inside it should move somewhere more discoverable.

**Retire: Read panel (top vocab overlay)**
Currently opened by the "Read" nav button. A full-screen overlay just for browsing all vocabulary words. The Word Map and Word Cloud are interesting features, but the surface is awkward — a full-screen modal overlay for what is essentially a browse/discovery view. The features should be absorbed into the V3 navigation structure more elegantly.

**Keep and elevate: Speak/Spark panel**
The concept detail view (opening a card) is core UX. Analogy, prompt, Corner AI, related concepts, note-taking — this surface is Epistemic's most distinctive interaction. Keep the depth, simplify the action bar, maybe redesign the entry animation.

**Keep and evolve: Canvas**
The infinite spatial canvas per folder is the "wow" feature. It should become a first-class surface in V3, not a secondary feature buried inside folders.

---

## The V3 vision — Eden-inspired, but inverted

Eden.so is a content creator tool: capture → organize → publish. Epistemic is a learner tool: discover → understand → retain → apply. Same canvas-style spatial interface, opposite direction of information flow.

**What Eden does that Epistemic should adopt:**
- **Left sidebar** as the primary navigation spine (not a hamburger drawer or modal). Persistent on desktop, collapsible on mobile.
- **Spaces → Boards** hierarchy: a top-level grouping (Space = topic area) above individual canvases (Boards). In Epistemic: Folder = Board.
- **Universal search** across everything: concepts, vocab, boards, notes.
- **AI that knows your library**: a Chat surface where the AI is grounded in the user's saved concepts, boards, and vocab — not generic GPT.
- **Auto-suggest related content** when you open a concept (we already have `related_ids` — surface this more aggressively).
- **Everything connects to a single atomic unit**: in Eden, the raw save. In Epistemic, the concept ID.

**What Eden does that Epistemic should NOT adopt:**
- Social scheduling / publishing pipeline (wrong product)
- Universal web clipper (kills editorial quality moat)
- Multi-media ingest (TikTok, Instagram — wrong audience)

**Our structural advantage over Eden:** The `related_ids` graph is pre-computed. Eden has no equivalent. Our concept cards are pre-structured (term/hook/plain/analogy/prompt) — Eden uses free-form text. We win on depth per item.

---

## V3 proposed navigation — needs your architectural validation and design

The hypothesis is a **left sidebar** (persistent on desktop, slide-in on mobile) replacing the current nav bar mode buttons. Five destinations:

1. **Home** — Today's concept of the day, streak, recently viewed, quick search bar. An editorial entry point, not a feed of saves. Daily energy, not a dashboard.

2. **Library** — The concept grid. All 600+ concepts. Filter by category, source, editor's pick. Search. Clicking a concept opens the Speak/Spark detail view. This absorbs the current Home drawer's "Concepts" tab.

3. **Discover** — This is the most strategically important decision: should this be (A) personal recommendations based on mastery/gaps, (B) the editorial "what's worth learning next" curated surface, or (C) the public-facing concept library for non-registered visitors? Define what Discover means for Epistemic and why.

4. **Boards** — All user canvases. Grid of folder/boards with emoji, name, concept count. Each board opens the full canvas. This is the renamed Folders. The spatial canvas is the main feature, boards are the entry point.

5. **Chat** — AI-powered conversation grounded in the user's saved library. "What do I know about persuasion?" / "Help me connect these three concepts." Without backend: limited to in-session context + localStorage data. With backend (future): full RAG over saved concepts + boards + vocab.

**Vocab question**: Where does vocabulary live in V3? Options: (A) as a tab within Library, (B) as part of each concept's detail view (since vocab comes from episodes, and episodes contain concepts), (C) as a first-class item on Boards (which already works via the Vocab canvas element). Decide and defend.

---

## What this session must produce

1. **V3 information architecture document** — Every surface, its purpose, what data it shows, how it connects to other surfaces. Nothing ambiguous.

2. **V3 navigation model** — Left sidebar structure. Mobile behavior. What replaces the current "Listen/Read/Write/Speak" mode buttons (if anything). How Home, Library, Discover, Boards, Chat map to user mental models.

3. **V3 data model** — What changes in localStorage. New keys needed. New schema fields on the folder object. Taxonomy system: how categories, user tags, episode tags, and mastery state coexist. The concept as the atomic unit — how everything references back to `concept.id`.

4. **Surface state machines** — For each major surface: what states exist, what triggers transitions, what persists on close. The Speak/Spark detail view. The Board canvas. The Chat surface. The Library grid.

5. **Retire/migrate plan** — Exactly what happens to Lexi panel and Read panel. Where their features go. What users who have saved lexicon words will see. What vocabulary browse looks like in V3.

6. **Eden features — adopt vs. skip vs. invert** — For each Eden pattern observed: decision + reasoning. Not a list of features to copy — a principled argument for why each fits or doesn't fit Epistemic's user and mission.

7. **Phased build order** — V3 is too big to ship at once. What ships first? What's the smallest version of V3 that is meaningfully different from v3.57a? Each phase must be shippable and not break the previous phase.

8. **Design language for V3** — Does the sidebar require new component patterns? New animation grammar? What does the transition from modal-overlay-heavy v2/v3 to sidebar-native V3 look like? All within the existing font/color system.

---

## Constraints you must never violate

- Single `index.html` — no build system, no npm, no bundler. All CSS and JS inline.
- Vanilla JS only — no React, Vue, or any framework unless explicitly approved after this strategy session.
- No curly quotes (`'` `"`) in JavaScript strings — use straight quotes only. This is a known production bug vector.
- `position:fixed` + `getBoundingClientRect()` for all dropdowns and popovers — never `position:absolute` inside an `overflow:hidden` parent.
- `_spLockBodyScroll()` / `_spUnlockBodyScroll()` reference-counted pattern for all scroll locks — never `document.body.style.overflow` directly.
- All new surfaces must have full `[data-theme="light"]` rules.
- Mobile-first — every feature must work on a 375px viewport.
- Performance — no synchronous renders blocking the main thread. Chunked rendering via `requestAnimationFrame` for any list > ~20 items.

---

## Starting questions if you need direction

You don't have to answer these in order — they're prompts to ensure you don't skip anything:

- What is the left sidebar's exact DOM structure, animation behavior (desktop vs mobile), and z-index layer?
- How does the current `lll_folders_v1` schema need to evolve for V3 Boards?
- What is the minimum taxonomy system that doesn't require a backend? (User tags in localStorage?)
- Should the "concept of the day" live in Home, and how is it selected without a backend?
- Does Chat ship in V3 or V4? If V3, what's the minimal viable grounding mechanism using only localStorage?
- Is Discover editorial or personalized? How is it rendered without a recommendation engine?
- How do we handle the mobile left sidebar without it stealing screen real estate from the canvas?
- What is the migration path for ~1,000 hypothetical users who have saved words in Lexi when we retire that panel?

---

Begin. Take as much space as you need. Think step by step. This plan should be the kind of document a new engineer could pick up and implement without asking any strategic questions.
