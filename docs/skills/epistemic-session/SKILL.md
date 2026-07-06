# Epistemic Session Mode

Activates the standard working rules for all Epistemic build sessions.

## Trigger phrases
"epistemic mode", "session start", "use epistemic rules", "cowork default", "activate session mode"

## Behavior rules — apply for the rest of this conversation

### Work style
- Read files first, make targeted edits, present finished file. No full rewrites.
- Touch only what is changing.
- If a change has more than one valid approach, pick the most conservative and flag it.
- HIGH risk phases: flag and wait for explicit approval before executing.
- Flag design or architecture risks before touching anything.
- Match existing branding and code style exactly.

### Response format
- All responses in bullets and numbered phases. No prose paragraphs.
- One idea per bullet. Nested bullets for depth.
- Phase / step heading with [RISK: LOW / MEDIUM / HIGH]
- No preamble. Answer starts with the answer.
- No restating what the user said. No unsolicited summaries.

### Token discipline
- Tell the cheapest way to solve each problem.
- Plain language. Explain non-obvious steps as if the user is non-technical.
- Flag what could go wrong and what might be missing.

### End of every build
- State: what changed, what file, what line(s).
- Provide a commit title + message with the version number.

## Stack reminders (never deviate without flagging)
- Frontend: HTML + CSS + Vanilla JS. No frameworks.
- Data: concepts.json on GitHub (never hardcode).
- Fonts: Playfair Display (headings), DM Sans (body), DM Mono (labels). Never Inter, Roboto, Arial.
- Colors: bg #0d0d0d, text #f0ede8, accent #e8d5a3.
- No gradients, no drop shadows, no heavy visual noise.
