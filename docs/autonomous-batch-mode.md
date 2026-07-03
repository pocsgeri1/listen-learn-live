# Epistemic — Autonomous Batch Rewrite Mode
# Opt-in only — say "run autonomous batches" (optionally with a count, e.g.
# "run 3 batches autonomous"). Read concept-rewrite-prompt.md FIRST — this
# file only covers what's different in unattended mode: who approves each
# field, and when Gergely sees the work. Everything else (schema, field
# rules, 6-point self-check, rewrite-concepts.json/rewrite-candidates.json
# structure, commit format) is inherited unchanged from that file. Not read
# by default in an interactive session — only pull this file in when the
# opt-in phrase above is actually said.

## Preconditions — check before starting, don't assume
1. Cowork folder access is granted this session. If not connected, stop and ask.
2. `rewrite-candidates.json` has at least 10 unprocessed candidates (excluding ids in `approved`). If fewer, say so and ask whether to run a partial batch or regenerate first.
3. No batch is already `approved`-but-unpatched from a prior interrupted session. If one exists, resume/finish it before starting a new one.

## Field edit scope — flags are a starting hint, not a diagnostic ceiling
- `rewrite-candidates.json`'s `flags` per concept names which field(s) tripped a *mechanical* rule (word-count overflow, em-dash count, term/hook overlap). That's a scanner, not a full diagnosis — it can't judge a rhetorical-question plain, an over-long analogy padded with extra sentences, or a hook that overlaps plain in substance rather than exact wording.
- Diagnose all 5 fields against all 5 style guides on every concept, every time — same as the interactive workflow. Never limit the diagnosis pass to only the fields named in `flags`. (Tightened 2026-07-03: an interactive-mode run on a concept whose only scan flag was a term/hook overlap — later confirmed a false positive — separately caught a rhetorical-question-ban violation in plain and a 40-word analogy, neither of which was flagged. Under the old flag-scoped rule both would have shipped untouched.)
- A rewrite only happens where diagnosis independently confirms a field is broken — `flags` don't force a rewrite, and their absence doesn't block one.
- Borderline/likely-false-positive scan flags (e.g. "leverage" appearing as the concept's own subject, not unexplained jargon) get one explicit judgment call in diagnosis: confirm broken → rewrite, or confirm fine → mark `flag_dismissed` in the batch report with a one-line reason, leave the field untouched.

## Per-concept loop (runs unattended for all 10 in the batch)
1. Pull next unprocessed id from `rewrite-candidates.json`, skipping any id already in `approved` (regeneration excludes these, but re-check live in case the file predates the current in-flight batch).
2. Read live concept from `concepts.json`.
3. Diagnose all 5 fields against all 5 style guides (per Field edit scope above) — not just the fields named in `flags`.
4. Draft rewrites for every field diagnosis confirms is broken.
5. Run the 6-point self-check (concept-rewrite-prompt.md).
6. Run the cross-batch repetition check (below). If either check fails on any field, revise and re-run both. Cap at 3 correction attempts per field. If still failing after 3: don't force it through — mark that field `status: needs_human` in the batch report with the reason, keep the best draft, move on. Never silently skip logging it.
7. Log each field into `rewrite-concepts.json` `approved` the instant it clears both checks (or is marked `needs_human`) — same logging discipline as the interactive workflow, no batching the write until the end.
8. Move to the next candidate.

## Cross-batch repetition check (spans batches, not just one)
- Maintain `rewrite-style-log.json` (repo root) — rolling list of the last 50 approved concepts' analogy openers (first 3 words) and core images (the concrete object/scene named).
- Before finalizing an analogy, check it against this log, not just the current batch. Flag and revise on any repeat.
- Append newly approved analogies to the log as they're logged; trim to last 50 so the check stays cheap.

## End-of-batch: diff report, before patching anything
Write `rewrite-reports/batch-[N]-diff.md` (one file per batch, never overwritten). For each of the 10 concepts: id, term, table of changed fields (old value | new value), self-check result per field (pass or `needs_human` + reason), cross-batch check result for analogy. End of file: one-line summary — count clean, count `needs_human`, candidates remaining.

## Patch, don't push
1. Patch all 10 (including `needs_human` ones, with their best draft) into `concepts.json` by id, targeted field edits only.
2. Move batch ids into `rewrite-concepts.json` `history`, status `patched_locally` — not `committed`, not `pushed`, until verified true.
3. Clear `approved`, increment `batch`.
4. Re-run/flag-stale the candidate scan.
5. Stop and report to Gergely — same git constraint as everywhere else: Claude never runs `ep-commit.sh` or pushes. Batches accumulate as local file edits until Gergely commits.
6. If running multiple batches in one session, repeat the loop automatically — no need to ask between batches. Only stop for: candidates exhausted, requested batch count reached, or `needs_human` count >2 in a batch (worth a look before continuing).

## Candidate list refill
- `rewrite-candidates.json` is always a top-N (default 100) subset of `concepts.json`, never scanned live on every run (keeps batches cheap and deterministic).
- When unprocessed candidates drop below ~10: run `node tools/scan-rewrite-candidates.js`, which rescans all of `concepts.json`, excludes every id in `history` and `approved` automatically, writes a fresh top-100. Continue batching from the new list — no separate approval needed, it's mechanical and non-destructive.

## What's still manual, and why
- Field-by-field approval: skipped in this mode — that's the point.
- Git commit + push: still Gergely, every time — sandbox limitation, not a policy choice (see cowork-default-instructions.md).
- Anything that fails self-correction 3 times: flagged, not forced. Editorial judgment on content stays with Gergely.
