# Cowork Default Instructions — Epistemic
# v1.1 — live, 2026-07-03. Supersedes docs/master-session-prompt.md (now a
# pointer to this file). Canonical session-protocol doc — edit here only.
# v1.1 change: session-type branch moved before the doc-read step. Editorial
# sessions no longer read the 5 style guides or the build-tracking docs
# (changelog/roadmap/build-journal) by default — those were pure token cost
# with no effect on editorial output, since concept-rewrite-prompt.md's
# quick-reference is the actual working rule set and build docs track
# site features, not concept content. Kept ONE file rather than splitting
# into build/editorial variants — see "Why this exists" below; a split
# would recreate the exact drift problem this file was built to kill,
# since git-lock fixes, commit format, and communication style are
# identical for both session types.

## Why this exists

Three docs used to restate the same session-mechanics rules by hand:
master-session-prompt.md, build-journal.md's "Standing Rules," and
concept-rewrite-prompt.md's git notes. All three drifted out of sync at
least once — two of them (build-journal.md, concept-rewrite-prompt.md)
were found flatly contradicting master-session-prompt.md on the exact same
point (whether Cowork can commit directly) as of 2026-07-02, and got fixed
that session. This doc is the fix: one canonical session-protocol doc,
everything else points to it instead of copying it.

## Where each rule lives (so future edits touch the right file)

- **What the product is** (schema, stack, design tokens, business context)
  → Claude Project Instructions field (Claude.ai project settings). Static,
  auto-injected every session in this Project. Never needs pasting.
- **How Claude should work this session** (protocol, risk-gating, commit
  workflow, git lock fixes) → this file. Single copy.
- **Default performance rules for new UI/animation work** → Step 2a in this
  file. Single copy — don't duplicate into build-journal.md or elsewhere.
- **Lessons from past sessions** (bugs, gotchas, non-obvious fixes) →
  build-journal.md's `## Entries` section only. Its "Standing Rules" block
  is now just a two-line pointer back here — don't re-expand it.
- **Editorial rewrite workflow** (field rules, self-check, batch logging)
  → concept-rewrite-prompt.md. References this file for git mechanics
  instead of restating them.
- **What shipped, version by version** → changelog.md.
- **What's next / done** → roadmap.md.

## Invocation

Say: *"Use cowork-default-instructions.md."* That's sufficient — this file
lives in Project Knowledge (read-only, manual-sync snapshot) AND in the
live repo's `docs/`. Claude should read the live repo copy when a folder
is connected; the Project Knowledge copy is a fallback only, and may be
stale (see "Project Knowledge staleness" below).

## Step 0 — shared preconditions, every session, before touching anything

Cheap checks only. No doc content reads here — those are branch-specific,
see Step 1.

1. Confirm Cowork folder access is connected for `~/Documents/GitHub/`
   (covers both `listen-learn-live` and `epistemic-tools`). If not
   connected, stop and request it — don't proceed on Project Knowledge
   files as if they were live, and don't guess.
2. Tell Gergely (if not already done): quit GitHub Desktop (Cmd+Q, reopen
   only to push at the end), close any editor with the repo folder open.
3. Path mapping — two different path forms are needed depending on the
   tool, confirmed in practice 2026-07-02:
   - Read/Write/Edit/Grep/Glob use the real Mac path, e.g.
     `/Users/gergelypocs/Documents/GitHub/listen-learn-live/...`
   - The bash tool (`mcp__workspace__bash`) sees the same folder at
     `/sessions/[session-id]/mnt/GitHub/listen-learn-live/...` — get the
     exact prefix from the `request_cowork_directory` tool's response,
     it changes per session.
   - Never assume one path form works for both tool families.
4. `git pull origin main` (via bash, read-only op, safe) in
   `listen-learn-live` — prevents mid-session divergence from direct
   pushes made outside this session.

## Step 1 — session type (decide this BEFORE reading any content docs)

Ask, or infer from the first real request. This determines which docs get
read — don't read both branches' docs "just in case."

- **Build session** → feature/bug work on the live site.
  Read in parallel: `docs/changelog.md` (top 30 lines), `docs/roadmap.md`
  (Next Up section), `docs/build-journal.md` (Entries — latest one only).
  State in one line: files read + current version. Proceed to Step 2.

- **Editorial session** → concept rewrites. Read ONLY:
  - `docs/concept-rewrite-prompt.md` in full — its "Field rules — quick
    reference" section IS the working rule set, not a summary of one.
    Don't also read the 5 style guides (`term-style-guide.md`,
    `hook-style-guide.md`, `plain-style-guide.md`, `analogy-style-guide.md`,
    `prompt-style-guide.md`) by default — they're deep-reference docs for
    when a specific field's judgment call is genuinely ambiguous, or when
    Gergely is changing a rule, not a per-session read. Pulling all 5 every
    time was pure token cost with no observed effect on rewrite quality.
  - `rewrite-concepts.json` and `rewrite-candidates.json` (state files).
  - Do NOT read `changelog.md`, `roadmap.md`, or `build-journal.md` —
    those track site features and versions, not concept content, and
    contribute nothing to an editorial session.
  `docs/autonomous-batch-mode.md` is NOT part of this default read either —
  it's opt-in only, pulled the moment Gergely says "run autonomous
  batches," not before.
  State in one line: active batch # + approved-so-far count + unprocessed
  candidates remaining. Then hand off entirely to concept-rewrite-prompt.md
  (interactive default) or autonomous-batch-mode.md (if invoked) — both
  inherit Step 0 and Steps 4/6 from here rather than restating them. Skip
  Step 2/3/5 below, they're build-session-only.

## Step 2 — action plan (build sessions)

- Numbered phases, merged where sensible. Rate each LOW / MEDIUM / HIGH
  risk. Explicit approval required before touching code — for HIGH risk
  phases always; for LOW/MEDIUM, pick the most conservative valid
  approach and flag it rather than asking.
- Flag design/architecture risk before touching anything, not after.
- Match existing branding/patterns exactly unless told otherwise.
- Any new animation, hover effect, or bulk-render feature must default to
  the Performance Standing Rules below — don't wait for a future audit to
  catch it.

## Step 2a — performance standing rules (build sessions, every new feature)

Added v2.24, after a full site performance audit (CLS ~0.42, 288-350ms
drawer-open INP, laggy card-flips, laggy pill hovers) traced every issue
back to variations of the same handful of patterns. Default to these for
any new UI work unless there's a specific, stated reason not to:

- Animate `transform`/`opacity` only. Never animate `max-width`, `width`,
  `height`, `padding`, or `margin` — even a small change pushes sibling
  elements and shows up as CLS.
- Reserve space instead of animating it in. If something needs to
  appear/disappear, keep its box present at all times and fade
  opacity/scale — don't grow it from 0.
- Never read layout (`offsetWidth`, `offsetHeight`,
  `getBoundingClientRect`) inside a hot path — hover handlers, scroll
  handlers, anything that fires repeatedly. Measure once when the element
  is built, cache it, reuse on every subsequent trigger.
- Chunk large synchronous DOM builds. Anything rendering more than about
  one screen's worth of cards/rows in a single `innerHTML` assignment
  should build incrementally — one group per `requestAnimationFrame` —
  instead of blocking in one pass.
- Use `backdrop-filter` sparingly, and keep the blur radius small (≤3px)
  when used. It's one of the more expensive compositing operations,
  worse on Retina/high-DPI displays.
- Cap any continuous animation loop (canvas `requestAnimationFrame`,
  decorative background effects) to ~30fps via timestamp throttling —
  don't let ambient/decorative loops run at uncapped display refresh
  rate.
- Card-flip/expand-style transitions: 0.3-0.45s with a snappy easing
  curve. Slower reads as laggy even when it's technically smooth.

## Step 3 — execute

- Read the live file → targeted edits only → present the finished
  result. No full-file rewrites, ever. No find-and-replace blocks pasted
  into chat.
- Edit directly in the live git repo folders. Never in Project Knowledge
  (read-only) or the Cowork outputs scratchpad — those aren't the site.

## Step 4 — commit workflow (the one canonical version)

```
Title:  v[X.Y] - [short imperative description]
Body:   - one bullet per change, no prose
```
- Claude never runs git commands from this session. The Cowork sandbox
  cannot reliably release the repo's `index.lock` — this has been the
  root cause of every commit failure so far, and is a hard technical
  limit, not a caution.
- Claude edits files only (Read/Edit/Write). Gergely runs, from Mac
  Terminal: `cd ~/Documents/GitHub/listen-learn-live && ./ep-commit.sh
  "v2.XX - message"`, then clicks **Push origin** in GitHub Desktop.
- Git lock issues — causes and fixes:

| Cause | Fix |
|---|---|
| GitHub Desktop open during commit | Quit before session, reopen only to push |
| Editor has repo folder open | Close it before session |
| Stale sandbox lock from a prior failed session | Terminal: `rm -f ~/Documents/GitHub/listen-learn-live/.git/HEAD.lock ~/Documents/GitHub/listen-learn-live/.git/index.lock` |
| Diverged branch | `git pull origin main` at session start (Step 0.4) prevents this |

- `unable to unlink tmp_obj_*` in bash output = harmless sandbox
  artifact, not a failure signal.

## Step 5 — end of session (build sessions only)

Editorial sessions do NOT do this step — concept-rewrite-prompt.md and
autonomous-batch-mode.md have their own end-of-batch bookkeeping
(rewrite-concepts.json history, rewrite-reports diffs, rewrite-style-log.json)
and don't touch changelog/roadmap/build-journal or Claude Project Files.

- Update `changelog.md` (new entry at top), `roadmap.md` (move completed
  → Recently Completed, update Next Up), `build-journal.md` (new lesson
  at top of Entries only — never touch Standing Rules unless the
  protocol itself changed).
- Copy updated docs to Claude Project Files
  (`/Users/gergelypocs/Downloads/.../Epistemic./Claude Project Files/`)
  if that folder is connected this session.
- Tell Gergely: "Click Push origin in GitHub Desktop."

## Communication style — applies to every response, every session

- No preamble. Answer starts with the answer.
- Bullets and numbered phases only. No prose paragraphs.
- One idea per bullet, nested for depth.
- No restating what Gergely said. No summaries he didn't ask for.
- Plain language, no jargon — explain non-obvious steps like he's never
  done them before.
- Say what could go wrong or what he might be missing, unprompted.
- Tell him the cheapest way to solve each problem.

## Project Knowledge staleness — known limitation, not a bug

- Claude.ai Project Knowledge (docs/, files/) is a manual snapshot,
  re-synced only when Gergely does it in Claude.ai project settings.
  Claude cannot trigger this sync.
- Treat Project Knowledge as background/fallback context only. For
  anything being edited or acted on this session, always read the live
  repo file (once folder access is confirmed in Step 0), never assume
  Project Knowledge matches it.
- If Project Knowledge and the live repo visibly disagree on a rule
  (like the git-access contradiction found 2026-07-02), the live repo
  file is correct until told otherwise — Project Knowledge just hasn't
  been re-synced yet.
