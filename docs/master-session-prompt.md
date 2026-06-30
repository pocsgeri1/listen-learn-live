# Master Session Prompt — Epistemic Cowork

## Original prompt (unchanged)

New build session. Read all relevant project files before doing anything. State which files you read and the current version. One line.

Action plan first — numbered phases, merged where possible. Rate each phase LOW / MEDIUM / HIGH risk. I approve before you touch any code. Then execute all approved changes in the background: read the live file, make targeted edits only, output the finished file. No find-and-replace blocks in chat. No full rewrites — ever.

Rules:
- Work in background: read file → targeted edits → present finished file
- No full file rewrites. Touch only what's changing.
- No preamble. Answer starts with the answer.
- All responses in bullets and numbered phases. No prose paragraphs.
- One idea per bullet. Nested bullets for depth. I'll ask follow-ups.
- If a change has more than one valid approach, pick the most conservative and flag it — don't ask me first.
- HIGH risk phases: flag and wait for explicit approval before executing.
- Flag design/architecture risks before touching anything.
- Match existing branding exactly.
- Give a detailed commit title + message with the version number at the end of every build.

Structure:
- Phase / step heading [RISK: LOW/MEDIUM/HIGH]
  - Key point
  - Key point

Token rules:
- No restating what I said. No summaries I didn't ask for.
- Tell me the cheapest way to solve each problem.
- Plain language. No jargon. Explain like I'm non-technical.
- Tell me what could go wrong and what I might be missing.

What's on my mind for v2.[the next number after the latest changelog / roadmap commit]:

---

## Agentic / Cowork automation rules (appended — do not change above)

---

### ⚠️ SESSION START CHECKLIST — do this before anything else

**Tell Gergely to do (before Claude touches any file):**
1. Quit GitHub Desktop (Cmd+Q) — reopen only to push at the end
2. Make sure no editor (VS Code, Xcode, etc.) has the repo folder open — these hold index.lock

**Claude does automatically:**
1. Connect to both repos:
   - `/Users/gergelypocs/Documents/GitHub/listen-learn-live/`
   - `/Users/gergelypocs/Documents/GitHub/epistemic-tools/`
2. Run `git pull origin main` in listen-learn-live (prevents mid-session diverge)
3. Read in parallel: `docs/changelog.md` (top 30 lines), `docs/roadmap.md` (Next Up section), `docs/build-journal.md` (Standing Rules + latest entry)
4. State: files read + current version. One line. Then present the action plan.

---

### File editing rules
- Edit files directly in the live git repo folders — never in the knowledge source (read-only) or outputs scratchpad
- Claude Project Files (`/Users/gergelypocs/Downloads/1.1. Personal Stuff /1.2 - LEVELUP G/Epistemic./Claude Project Files/`) — sync at session end only

---

### Commit rules
```
Title:  v[X.Y] - [short imperative description]
Body:   - one bullet per change, no prose
```
- Example: `v2.9 - Corner: ding SFX, hero text restore, panel header layout`
- Always combine add + commit in one bash call: `git add [files] && git commit -m "..."`  
  **Never run `git add` and `git commit` as separate bash calls** — a failed add leaves index.lock held by the sandbox and blocks all subsequent commits
- Stage only changed files — never `git add .`
- Commits work from bash. Push is always done by Gergely in GitHub Desktop (one click → Vercel auto-deploys)

---

### Git lock issues — known causes and fixes

| Cause | Fix |
|---|---|
| GitHub Desktop open during bash commit | Quit Desktop before session (Cmd+Q). Reopen only to push. |
| VS Code / Xcode / any editor has repo folder open | Close or remove the folder from the editor before session |
| Cowork sandbox held a previous index.lock | Run in Mac Terminal: `rm -f ~/Documents/GitHub/listen-learn-live/.git/HEAD.lock ~/Documents/GitHub/listen-learn-live/.git/index.lock` |
| `lsof` shows `com.apple.Virtualization.VirtualMachine` holding lock | Previous bash `git add` failed mid-op. Terminal rm is the only fix — sandbox cannot unlink its own locks |

- `unable to unlink tmp_obj_*` warnings in bash output = harmless, sandbox filesystem artifact. Commits succeed despite them.
- Diverged branch / merge conflict: caused by direct pushes to GitHub (e.g. concepts.json). `git pull origin main` at session start prevents it.

---

### Documentation — auto-update at end of every session

Claude does this automatically without being asked. Targeted edits only — never full rewrites.

**Files to update (as needed):**
- `docs/changelog.md` — new version entry at TOP, full detail
- `docs/roadmap.md` — move completed → Recently Completed; update Next Up
- `docs/build-journal.md` — append new lessons at TOP of Entries (Standing Rules block stays fixed at top)
- Any other doc touched this session (architecture.md, design-tokens.md, etc.)

**Then copy updated docs to Claude Project Files:**
```bash
REPO="/sessions/sweet-sharp-ptolemy/mnt/listen-learn-live"
CPF="/sessions/sweet-sharp-ptolemy/mnt/[Claude Project Files mount path]"
cp "$REPO/docs/changelog.md" "$CPF/changelog.md"
cp "$REPO/docs/roadmap.md" "$CPF/roadmap.md"
cp "$REPO/docs/build-journal.md" "$CPF/build-journal.md"
# + any other updated docs
```

**Claude.ai project knowledge** — a manual snapshot. Re-sync in Claude.ai project settings every few sessions (10 seconds). Claude cannot trigger this sync.

**After docs are committed, tell Gergely:** "Click Push origin in GitHub Desktop."
