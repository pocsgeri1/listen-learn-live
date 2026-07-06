---
name: concept-rewrite-session
description: >
  Starts an Epistemic concept rewrite session — loads the rewrite queue, reads the working
  rule set, and begins processing concepts field by field with Gergely's approval. Use this
  skill whenever Gergely says "start rewrite session", "rewrite concepts", "editorial session",
  "next concept", "rewrite batch", or says an ID number and wants to work on concept fields.
  Also trigger if he says "open the rewrite queue" or "what's left to rewrite". This skill
  wraps the full concept-rewrite-prompt.md workflow so it can be invoked by name without
  pasting the prompt manually.
---

# Concept Rewrite Session

This skill loads the full editorial rewrite workflow. Do the following immediately on trigger:

## Session start — read these files before doing anything else

1. `rewrite-concepts.json` — running patch log (batch number, history, approved array).
2. `rewrite-candidates.json` — ranked candidate queue.
3. `docs/concept-rewrite-prompt.md` — this is the working rule set. Read it in full. The "Field rules — quick reference" section IS the operative rule set — do not also read the 5 style guides (hook-style-guide.md, term-style-guide.md, plain-style-guide.md, analogy-style-guide.md, prompt-style-guide.md) by default. Pull a specific guide only when a field judgment call is genuinely ambiguous.

State in one line: active batch #, approved-so-far count, unprocessed candidates remaining.

Then hand off entirely to the workflow in concept-rewrite-prompt.md. Everything below is a summary — concept-rewrite-prompt.md is the canonical source.

## Key rules (quick reference — concept-rewrite-prompt.md has the full version)

**Em-dash rule: zero "—" anywhere, every field, every time. Check last, separately.**

### Workflow per concept

1. Gergely gives an ID or says "next" (pull top unprocessed candidate, skip anything already in `approved`).
2. Read the live concept from `concepts.json`.
3. Diagnose ALL FIVE fields — including ones that pass unchanged. Propose rewrites only for broken fields. If term needs rewrite, offer 2–3 angle options.
4. Run `node tools/check-fields.js` (JSON array of `{id, term, hook, plain, analogy, prompt}` piped via stdin) before presenting — it reports word/char counts and flags hard violations. Do not hand-count.
5. Present as a table: Current | Flagged (issue or "Passes — no change") | Proposed (rewrite or "*(unchanged)*").
6. Gergely approves per field: 1 = keep live / 2 = take rewrite / 3 = own wording. Log each approved field immediately into `rewrite-concepts.json` approved array — never wait for whole concept to finish.
7. At 10 approved: patch all 10 into `concepts.json` by id (targeted edits only), move ids into history, clear approved, increment batch.
8. Claude never runs git — Gergely runs `./ep-commit.sh "editorial: rewrite batch [N] ([count] concepts) — [ids]"` and pushes via GitHub Desktop.

### Field ceilings (hard limits — not targets)

- Hook: 14 words max, one sentence
- Plain: 55 words / 350 chars max
- Analogy: 20 words max

### Self-check — run all 6 on every field you rewrote

1. Em-dash scan: zero "—"
2. Hook under 14 words, one sentence, one idea
3. Plain under 55 words, no metaphor, no "refers to/is when" opener
4. Analogy under 20 words, no "It's like" opener, no explanation after image
5. Anti-slop: no "not X you're Y", no "most people don't realize", no bare -ing opener, no triad of exactly three
6. Cross-field image check: list concrete objects/scenes in hook, plain, analogy side by side — same image in two fields = rewrite the later one

## Autonomous mode

Not part of this default workflow. If Gergely says "run autonomous batches", read `docs/autonomous-batch-mode.md` and switch to that mode.
