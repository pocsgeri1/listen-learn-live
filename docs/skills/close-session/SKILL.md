---
name: close-session
description: >
  Closes an Epistemic build session — updates changelog, roadmap, and build-journal,
  generates a commit message, and tells Gergely exactly what to run. Use this skill
  whenever Gergely says "close session", "wrap up", "end session", "close this out",
  "write the changelog", or "what's the commit message". Also trigger at the natural end
  of a build session when the work is done and nothing else is pending. Editorial sessions
  have their own close flow in concept-rewrite-prompt.md — this skill is for build sessions only.
---

# Close Session

Runs end-of-session bookkeeping for a build session. Do this in order:

## Step 1 — confirm what shipped

List every change made this session (files touched, what changed, what version). If you're not sure, check your tool call history. State this clearly before writing anything — Gergely should confirm or correct it before the docs are updated.

## Step 2 — update changelog.md

Add a new entry at the very top of `docs/changelog.md`. Format:

```
## v[X.Y] — [YYYY-MM-DD]

- [change 1 — imperative, specific, one line]
- [change 2]
- [change 3]
```

Rules:
- One bullet per change, no prose
- Imperative voice: "Fix", "Add", "Remove", "Update"
- Reference file + what changed, not just the symptom ("Fix CORS header in generateIntel() fetch" not "Fix CORS error")
- No version numbers inside bullet text — the heading carries the version

## Step 3 — update roadmap.md

- Move completed items from "Next Up" → "Recently Completed" (with version number)
- If new issues or ideas emerged this session, add them to the appropriate roadmap section
- Do not touch items that weren't part of this session

## Step 4 — update build-journal.md

Add a new entry at the top of the `## Entries` section only. Never touch the "Standing Rules" block unless the protocol itself changed this session.

Entry format:
```
### v[X.Y] — [YYYY-MM-DD]
**What broke / what was non-obvious:**
- [lesson 1 — something future-Claude needs to know]
- [lesson 2]

**Root cause:**
[one sentence if applicable]
```

Write only lessons that aren't already captured in the journal. Skip anything obvious. The value is: what would have saved time if it had been written down before this session?

## Step 5 — generate commit message

```
v[X.Y] - [short imperative description of the main change]

- [bullet 1]
- [bullet 2]
- [bullet 3]
```

Keep the title under 60 characters. The body should match the changelog bullets.

## Step 6 — tell Gergely what to run

```
cd ~/Documents/GitHub/listen-learn-live && ./ep-commit.sh "v[X.Y] - [title]"
```

Then: "Click Push origin in GitHub Desktop."

If `epistemic-tools` also had changes this session, give him a second commit command for that repo separately.

## What NOT to do

- Do not run git commands
- Do not copy files to Claude Project Files unless Gergely explicitly asks
- Do not summarise the whole session in prose — the changelog and journal bullets are sufficient
- Do not update editorial docs (concept-rewrite-prompt.md, quality-rules.md, style guides) unless a rule actually changed this session
