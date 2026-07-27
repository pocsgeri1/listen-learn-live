# Epistemic — Build & Editorial Session Protocol
# v1.3 — 2026-07-27
# Invocation: "Use cowork-default-instructions.md." — unchanged.
# Project Knowledge copy may be stale — always read the live repo file when folder is connected.
---

## Where each rule lives

| What | Where |
|------|-------|
| Product identity, schema, stack, design tokens | Claude Project Instructions (auto-injected every session) |
| Session protocol | This file |
| CSS/JS/animation/mobile/pre-commit rules | `docs/engineering-standards.md` — read every build session |
| Colors, fonts, spacing, component specs | `docs/design-tokens.md` |
| Data schemas, localStorage keys, state machines | `docs/architecture.md` |
| Lessons/gotchas from past sessions | `docs/build-journal.md` Entries |
| Editorial rewrite workflow | `docs/concept-rewrite-prompt.md` |
| Version log | `docs/changelog.md` |
| What's next | `docs/roadmap.md` |

---

## Three rules that break everything if skipped

**A — Edit tool only. Never Python for string replacement.**
Widen `old_string` until unique if Edit can't match. Python only for: `node --check`, line numbers, byte-level fixes.

**B — Targeted edits only. No full-file rewrites.**
Read live file → targeted Edit calls → present result. Never paste full file content or find-and-replace blocks into chat.

**C — Docs before closing. Non-negotiable.**
See `⚠️ DOC UPDATES` below. Every build commit triggers it.

---

## Step 0 — preconditions (every session, before touching anything)

1. Confirm `~/Documents/GitHub/` folder access connected (covers `listen-learn-live` + `epistemic-tools`). If not — stop.
2. **[ACTION]** Quit GitHub Desktop. Close any editor with the repo open.
3. Path mapping:
   - Read/Write/Edit/Glob → `/Users/gergelypocs/Documents/GitHub/listen-learn-live/...`
   - bash → `/sessions/[id]/mnt/listen-learn-live/...` (get exact id from `request_cowork_directory`)
4. `git pull origin main` via bash before touching anything.

---

## Step 1 — session type (decide BEFORE reading any content docs)

**Build session** → feature/bug work on the live site.
Read in parallel: `docs/changelog.md` (top 30 lines) · `docs/roadmap.md` (Next Up) · `docs/build-journal.md` (latest entry only) · `docs/engineering-standards.md` (all).
State in one line: current version + what we're building. Proceed to Step 2.

**Editorial session** → concept rewrites.
Read ONLY: `docs/concept-rewrite-prompt.md` (full) + `rewrite-concepts.json` + `rewrite-candidates.json`.
Do NOT read changelog, roadmap, build-journal, or the 5 style guides — they add nothing to editorial output.
`docs/autonomous-batch-mode.md` is opt-in only — pull it when Gergely says "run autonomous batches," not before.
State in one line: batch # + approved count + candidates remaining. Skip Steps 2–4 below.

---

## Step 2 — action plan (build sessions)

- Numbered phases, rated LOW / MEDIUM / HIGH risk.
- HIGH risk: write `docs/session-plan.md` (template below), get explicit approval before touching any code.
- LOW/MEDIUM: pick most conservative valid approach, flag it — don't ask.
- Flag design/architecture risk before touching anything, not after.
- Match existing tokens/patterns exactly unless told otherwise.
- Any new animation, hover, or bulk-render feature must follow `docs/engineering-standards.md` performance rules.
- Mark anything needing Gergely's action: **[ACTION]**

**Session plan (HIGH-risk builds — write before code, delete after commit lands):**
```
## Goal — one sentence
## States — IDLE → LOADING → X → ERROR and what triggers each
## Dependencies — data read/written; panels/functions affected
## Phases — numbered, each rated [RISK]
## Rollback — what to do if a phase fails
```

---

## Step 3 — commit workflow

Commit format:
```
v[X.Y] — short imperative description
- one bullet per change, no prose
- root cause for every bug fix, not just "fixed X"
```

Claude edits files only (Read/Edit/Write). **[ACTION]** Gergely runs from Mac Terminal:
```bash
cd ~/Documents/GitHub/listen-learn-live && ./ep-commit.sh "v2.XX — message"
```
Then **Push origin** in GitHub Desktop. (~30s Vercel deploy → epistemic.live)

Git lock fixes (Mac Terminal only — Claude cannot run these):

| Cause | Fix |
|-------|-----|
| GitHub Desktop open | Quit before session, reopen only to push |
| Editor has repo open | Close before session |
| Stale sandbox lock | `rm -f ~/Documents/GitHub/listen-learn-live/.git/HEAD.lock ~/Documents/GitHub/listen-learn-live/.git/index.lock` |
| Diverged branch | `git pull origin main` at Step 0 prevents this |

`unable to unlink tmp_obj_*` in bash = harmless artifact, not a failure.

---

## ⚠️ DOC UPDATES — MANDATORY after every build commit. No exceptions.

Do not move to the next task or close the session without this. Editorial sessions skip it.

| Doc | Update when |
|-----|-------------|
| `changelog.md` | Every commit — new entry at top |
| `roadmap.md` | Any item completed or new issue found |
| `build-journal.md` | Any new recurring trap — add at top of Entries |
| `architecture.md` | Any localStorage key, schema, or state machine changed |
| `design-tokens.md` | Any new component pattern introduced |
| `engineering-standards.md` | Any new performance rule or gotcha discovered |

Changelog format:
```markdown
## vX.XX — YYYY-MM-DD · Area: title
### filename.ext
- **Change name:** what changed and why
- **Root cause (bugs):** what was wrong, not just what was fixed
```

**[ACTION]** After docs updated: Push origin in GitHub Desktop. Sync docs to Claude Project Files if that folder is connected this session.

---

## Communication style (every session)

- No preamble. Answer starts with the answer.
- Bullets and numbered phases only — no prose paragraphs in build responses.
- One idea per bullet. Nested for depth.
- No restating what Gergely said. No unsolicited summaries.
- Say what could go wrong and what might be missing, unprompted.
- Plain language. Non-obvious steps explained as if he's never done them.
- Cheapest solution first.
- **[ACTION]** for anything requiring his input.
- One feature area per session. Finish + commit + docs before switching.
