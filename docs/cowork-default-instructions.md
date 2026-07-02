# Cowork Default Instructions — Epistemic
# v1.0 — live, 2026-07-02. Supersedes docs/master-session-prompt.md (now a
# pointer to this file). Canonical session-protocol doc — edit here only.

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

## Step 0 — preconditions, every session, before touching anything

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
5. Read in parallel: `docs/changelog.md` (top 30 lines), `docs/roadmap.md`
   (Next Up section), `docs/build-journal.md` (Entries — latest one only).
   For an editorial session, also read, in full:
   - `docs/concept-rewrite-prompt.md` — the actual rules, not just a pointer
   - all 5 style guides it references (`term-style-guide.md`,
     `hook-style-guide.md`, `plain-style-guide.md`, `analogy-style-guide.md`,
     `prompt-style-guide.md`)
   - `rewrite-concepts.json` and `rewrite-candidates.json` (state files)
   Skipping the rules doc and style guides and reading only the two JSON
   state files is not enough to run an editorial session correctly — the
   JSON files are state, not rules.
6. State in one line: files read + current version + (if editorial)
   active batch number and unprocessed candidate count. No more than
   one line — don't restate what was read in prose.

## Step 1 — session type

Ask, or infer from the first real request:
- **Build session** → feature/bug work on the live site. Proceed to
  Step 2.
- **Editorial session** → concept rewrites. Hand off to
  concept-rewrite-prompt.md (interactive by default, or its autonomous
  batch mode if explicitly requested) — both inherit Steps 0, 5-7 from
  here rather than restating them.

## Step 2 — action plan (build sessions)

- Numbered phases, merged where sensible. Rate each LOW / MEDIUM / HIGH
  risk. Explicit approval required before touching code — for HIGH risk
  phases always; for LOW/MEDIUM, pick the most conservative valid
  approach and flag it rather than asking.
- Flag design/architecture risk before touching anything, not after.
- Match existing branding/patterns exactly unless told otherwise.

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

## Step 5 — end of session, automatic, no reminder needed

- Update `changelog.md` (new entry at top), `roadmap.md` (move completed
  → Recently Completed, update Next Up), `build-journal.md` (new lesson
  at top of Entries only — never touch Standing Rules unless the
  protocol itself changed).
- Copy updated docs to Claude Project Files
  (`/Users/gergelypocs/Downloads/.../Epistemic./Claude Project Files/`)
  if that folder is connected this session.
- Tell Gergely: "Click Push origin in GitHub Desktop" (build sessions) or
  the equivalent commit instruction (editorial sessions).

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
