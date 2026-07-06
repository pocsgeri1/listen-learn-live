---
name: epistemic-session
description: >
  Activates the full Epistemic session protocol for build or editorial work on epistemic.live.
  Use this skill whenever Gergely says "epistemic mode", "session start", "cowork default",
  "use epistemic rules", or starts any Epistemic build/editorial session. Also trigger if the
  conversation is clearly about working on the Epistemic site or concept library. This skill
  defines how every session must run — communication style, risk-gating, git workflow, and
  session-type branching. Load it at the start of every session, not partway through.
---

# Epistemic Session Protocol

## Step 0 — preconditions (every session, before touching anything)

1. Confirm Cowork folder access is connected for `~/Documents/GitHub/` (covers both `listen-learn-live` and `epistemic-tools`). If not connected, stop and request it — never proceed on Project Knowledge files alone.
2. Tell Gergely: quit GitHub Desktop (Cmd+Q, reopen only to push at the end), close any editor with the repo folder open.
3. Path mapping — two forms needed depending on the tool:
   - Read/Write/Edit/Grep/Glob: `/Users/gergelypocs/Documents/GitHub/listen-learn-live/...`
   - bash tool: `/sessions/[session-id]/mnt/GitHub/listen-learn-live/...` — get the exact prefix from `request_cowork_directory` response; it changes per session.
   - Never assume one form works for both.
4. Run `git pull origin main` (via bash) in `listen-learn-live` — prevents mid-session divergence.

## Step 1 — session type (decide BEFORE reading any content docs)

Ask or infer from the first request. Don't read both branches' docs "just in case."

**Build session** — feature/bug work on the live site:
- Read in parallel: `docs/changelog.md` (top 30 lines), `docs/roadmap.md` (Next Up section), `docs/build-journal.md` (latest entry only).
- State in one line: files read + current version.
- Proceed to Step 2.

**Editorial session** — concept rewrites:
- Read ONLY: `docs/concept-rewrite-prompt.md` (in full) + `rewrite-concepts.json` + `rewrite-candidates.json`.
- Do NOT read changelog/roadmap/build-journal — those track site features, not concept content.
- `docs/autonomous-batch-mode.md` is opt-in only — pull it only when Gergely says "run autonomous batches."
- State in one line: active batch #, approved-so-far count, unprocessed candidates remaining.
- Hand off entirely to concept-rewrite-prompt.md workflow. Skip Steps 2/3/5 below (build-only).

## Step 2 — action plan (build sessions)

- Numbered phases, merged where sensible. Rate each LOW / MEDIUM / HIGH risk.
- Explicit approval required before touching code — HIGH risk always; LOW/MEDIUM pick most conservative approach and flag it.
- Flag design/architecture risk before touching anything, not after.
- Match existing branding/patterns exactly unless told otherwise.
- Any new animation, hover effect, or bulk-render feature must follow the Performance Rules below.

## Performance rules (every new UI feature — no exceptions)

- Animate `transform`/`opacity` only. Never animate `max-width`, `width`, `height`, `padding`, `margin`.
- Reserve space instead of animating it in — fade opacity/scale, don't grow from 0.
- Never read layout (`offsetWidth`, `offsetHeight`, `getBoundingClientRect`) inside hover/scroll handlers. Measure once on build, cache, reuse.
- Chunk large DOM builds — anything rendering more than ~one screen's worth in a single `innerHTML` should build incrementally via `requestAnimationFrame`.
- `backdrop-filter` sparingly; blur ≤3px when used; expensive on Retina.
- Cap continuous animation loops to ~30fps via timestamp throttling.
- Card transitions: 0.3–0.45s with snappy easing. Slower reads as laggy.

## Step 3 — execute (build sessions)

- Read the live file → targeted edits only → present the finished result.
- No full-file rewrites. No find-and-replace blocks pasted into chat.
- Edit directly in the live git repo folders. Never in Cowork outputs scratchpad.

## Step 4 — commit workflow

```
Title:  v[X.Y] - [short imperative description]
Body:   - one bullet per change, no prose
```

- Claude never runs git commands. Edit files only (Read/Edit/Write).
- Gergely runs from Mac Terminal: `cd ~/Documents/GitHub/listen-learn-live && ./ep-commit.sh "v2.XX - message"`, then clicks Push origin in GitHub Desktop.

Git lock fixes:

| Cause | Fix |
|---|---|
| GitHub Desktop open during commit | Quit before session |
| Editor has repo folder open | Close it |
| Stale sandbox lock | `rm -f ~/Documents/GitHub/listen-learn-live/.git/HEAD.lock ~/Documents/GitHub/listen-learn-live/.git/index.lock` |
| Diverged branch | `git pull origin main` at Step 0.4 |

`unable to unlink tmp_obj_*` = harmless sandbox artifact, not a failure.

## Step 5 — end of session (build sessions only)

- Update `changelog.md` (new entry at top), `roadmap.md` (move completed → Recently Completed, update Next Up), `build-journal.md` (new lesson at top of Entries — never touch Standing Rules unless the protocol changed).
- Tell Gergely: "Click Push origin in GitHub Desktop."

## Communication style — every response, every session

- No preamble. Answer starts with the answer.
- Bullets and numbered phases only. No prose paragraphs.
- One idea per bullet, nested for depth.
- No restating what Gergely said. No unsolicited summaries.
- Plain language — explain non-obvious steps like he's never done them before.
- State what could go wrong or what he might be missing, unprompted.
- Tell him the cheapest way to solve each problem.

## Stack reminders (never deviate without flagging)

- Frontend: HTML + CSS + Vanilla JS. No frameworks.
- Data: concepts.json on GitHub (never hardcode).
- Fonts: Playfair Display (headings), DM Sans (body), DM Mono (labels). Never Inter, Roboto, Arial.
- Colors: bg #0d0d0d, text #f0ede8, accent #e8d5a3.
- No gradients, no drop shadows, no heavy visual noise.
- Hosting: Vercel. Automation: Make.com. DB/CMS: Airtable.
