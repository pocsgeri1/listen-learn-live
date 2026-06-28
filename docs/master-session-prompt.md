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

### Session start — always do this first
- Connect to the git repo folder: `/Users/gergelypocs/Documents/GitHub/listen-learn-live/`
- Run `git pull origin main` before touching any file — prevents local/remote diverge and merge conflicts mid-session
- Read `docs/changelog.md` (top 30 lines) to confirm current version
- Read `docs/roadmap.md` (Next up section) to know what's queued
- Read `docs/build-journal.md` (Standing Rules + latest entry) for workflow rules and recent lessons
- State: files read + current version. One line. Then proceed.

### File editing rules
- Edit files directly in `/Users/gergelypocs/Documents/GitHub/listen-learn-live/` (the live git repo)
- Never edit in the knowledge source (read-only snapshot) or the outputs scratchpad
- Claude Project Files folder (`/Users/gergelypocs/Downloads/1.1. Personal Stuff /1.2 - LEVELUP G/Epistemic./Claude Project Files/`) is a secondary copy — sync to it at session end, not during

### Commit format (enforced every session)
```
Title:  v[X.Y] - [short imperative description, dash after version]
Body:   - bullet per change, one line each
        - no prose
```
- Example: `v2.9 - Corner: ding SFX, hero text restore, panel header layout`
- Always include version number first

### Git workflow (end of every session)
1. Stage only the files that changed: `git add [specific files]` — never `git add .`
2. Commit with proper message (see format above)
3. Tell Gergely: **"Click Push origin in GitHub Desktop"** — one button, done
4. Gergely clicks Push origin → Vercel auto-deploys

### Documentation updates (end of every build + doc session)
Update all files that need it — targeted edits only, never full rewrites:
- `docs/changelog.md` — new version entry at TOP
- `docs/roadmap.md` — move completed items to Recently Completed, add new Next Up items
- `docs/build-journal.md` — add lessons learned (Standing Rules block stays at top)
- Any other doc touched this session (architecture, design-tokens, etc.)

Then sync updated docs to Claude Project Files:
```bash
cp /path/to/repo/docs/changelog.md "/path/to/Claude Project Files/changelog.md"
cp /path/to/repo/docs/roadmap.md "/path/to/Claude Project Files/roadmap.md"
cp /path/to/repo/docs/build-journal.md "/path/to/Claude Project Files/build-journal.md"
# + any other updated docs
```

### Known git issues and fixes
- **Lock files** (`HEAD.lock`, `index.lock`, `maintenance.lock`): caused by bash sandbox and GitHub Desktop running simultaneously. Fix: user runs in Terminal: `rm -f ~/Documents/GitHub/listen-learn-live/.git/HEAD.lock ~/Documents/GitHub/listen-learn-live/.git/index.lock ~/Documents/GitHub/listen-learn-live/.git/objects/maintenance.lock`
- **Diverged branches / merge conflict**: happens when GitHub has commits not in local (e.g. Gergely pushed concepts.json directly). Fix: run `git pull origin main` at session start. If already in conflict state, resolve then `git commit -m "Merge: ..."`.
- **Cannot push from bash**: the sandbox has no GitHub credentials. Commits work. Push always done by Gergely in GitHub Desktop.
- **Warnings `unable to unlink tmp_obj_*`**: harmless, sandbox filesystem permission artifact. Commits go through fine despite warnings.

### Claude Project Files vs Claude.ai project knowledge
- **Mac folder** (`Downloads/.../Claude Project Files/`) — updated automatically by Claude at session end via bash copy. Always current after each session.
- **Claude.ai project knowledge** (what Claude reads at session start) — a snapshot, last synced manually. Re-sync it in Claude.ai project settings every few sessions (10 seconds). Claude cannot trigger this sync.
