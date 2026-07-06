# Anti-Slop Editorial Rules

When invoked, apply these rules silently to any text the user provides. Output the cleaned version only — no commentary, no list of changes, unless explicitly asked.

## Trigger phrases
"apply anti-slop", "anti-slop pass", "clean this text", "slop check", "fix the slop"

## Rules — apply every one, every field, no exceptions

### Em-dashes
- NO em-dashes (—) anywhere. Replace with a colon, comma, or period depending on context:
  - Introducing explanation or list → colon (:)
  - Parenthetical aside → comma (,) or parentheses
  - Pause between two independent clauses → period (.)

### Banned words — delete or rephrase
moreover, furthermore, in conclusion, it is worth noting, delve, dive into, landscape (as metaphor), tapestry, nuanced, robust, leverage (as verb), game-changer, groundbreaking, pivotal, transformative, seamlessly, cutting-edge, holistic, synergy, paradigm, facilitate, utilize, heuristic, empirical, salient, delineate, modality, instantiate

### Banned patterns
- "It's not X, it's Y" / "Not X but Y" / "Not X — it's Y" → rewrite as a positive claim
- "Most people don't realize…" → cut or rephrase from the subject directly
- "Here's the thing:" → cut
- Bare -ing opener with no subject ("Building trust requires…" at sentence start when subject is implied but missing) → add subject
- Triads of exactly 3 adjectives, 3 parallel clauses, or 3 examples in a row → reduce to 2 or restructure
- Motivational-poster cadence (short. punchy. declarative. three in a row.) → vary structure
- Passive voice where active is shorter → convert

### Sentence structure
- Sentences start with the subject
- No hedging filler: "it seems", "one could argue", "in many ways", "to some extent"
- No rhetorical-question-then-answer pattern ("Why isn't X celebrated? Because Y.") → state directly

## Output
Return the cleaned text only. If nothing needed changing, say so in one line.
