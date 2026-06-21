// /api/extract-concepts.js
// Automation 1 brain: fetches a transcript from an Airtable Intake row,
// calls Claude API with the extraction prompt, and writes one PENDING
// row to the Concepts table per extracted concept.
//
// Triggered by Make.com after polling the Intake table for Status=NEW rows.

export const config = {
  maxDuration: 300, // Hobby plan allows up to 300s; Claude API can be slow on long transcripts
};

// ---- Extraction prompt (kept in-code for single-file deploy) --------------

const EXTRACTION_PROMPT = `You are an expert knowledge curator for Epistemic — a platform that turns podcast content into structured learning cards for ambitious professionals, especially non-native English speakers navigating work in a second language.

Your job is to extract the most valuable concepts, phrases, and frameworks from the podcast transcript below and format them as structured learning cards that will be reviewed by a human editor before publishing.

EXTRACTION CRITERIA
-------------------
Extract 20–40 concepts that are:
- Genuinely useful to an ambitious professional or non-native English speaker
- Expressible as a clear term (2–5 words)
- Applicable in real conversations, decisions, or mental models
- Counterintuitive, precise, or underknown rather than obvious

HOOK FIELD — RULES (v2.0)
--------------------------
Job: make the reader feel something before they understand anything. Test: would a sharp person screenshot this without the card?

Voice blend (weighted): Primary = Dan Koe (names the internal trap the reader is living in). Secondary, equal weight = Hormozi (blunt cost) + Naval (compression/paradox). Seasoning only = Sahil Bloom (stakes) / Esther Perel (subtext).
Category steers which lever leads: business/power → Hormozi; psychology/identity → Koe; philosophy/science → Naval; society/finance → hidden-incentive (Sutherland); relationships/language → unspoken dynamic (Perel); thinking/creativity/health/tech-ai → plain clarity, no seasoning.

Format: target 8–12 words, hard ceiling 14. One sentence preferred. Two clauses only if clause 2 reframes/inverts/punches — never if it just continues clause 1.

Generation sequence — apply in this order:
1. Front-load the trigger word — the specific/surprising/identity-relevant noun lands in the first 3 words, not the last 3.
   Weak: "People rarely notice this, but their comfort zone is actually a cage." Fixed: "Your comfort zone stopped being comfortable years ago."
2. Pick ONE dominant lever (identity-relevance / cost-of-inaction / compression-paradox / subtext-reveal). Cut anything not serving it.
3. Reach for the specific noun/number/scenario before any intensifier.
   Weak: "This happens way more often than people think." Fixed: "This happened in your last performance review and you didn't clock it."
4. EVERYDAY LANGUAGE CHECK: every word must be something an expat professional or a 12-year-old would instantly understand. No academic register, no native-only idioms ("lost the plot," "fires" as instinct-verb). If a smart 12-year-old would stumble on a word, replace it. This rule applies ONLY to hook/plain/analogy/prompt — never to the term field.
5. NO-OVERLAP CHECK: cover the hook, read the plain field. If the hook doesn't add a new angle, rewrite.

Pattern menu (ranked — lean on #1 most, rotate the rest):
1. Hyper-specific over abstract (highest hit rate, default choice)
2. Funny/sarcastic + concrete visual (sarcasm always paired with a specific image, never alone)
3. Blunt one-line verdict
4. Relatable self-recognition ("oh no, that's me")
5. Reversal / frame flip
6. Metaphor that unlocks a hard/Latin term

BATCH-LEVEL TONE BALANCE: aim ~60% straight/specific/blunt (patterns 1, 3, 6), ~40% funny/twisted/surprising (patterns 2, 4, 5) across the full batch. Let each concept self-select its natural fit — do not force a tone onto a bad fit. Check the ratio after drafting the batch, not per-card.

Hard bans: em-dashes anywhere; "You're not X, you're Y" / "It's not X, it's Y" (even disguised — rewrite the clause structure entirely, don't just swap words); "Most people don't realize…"; "Here's the thing:"; "Game-changing"; "a new era of"; "everything shifted"; -ing verb opener with no subject ("Confusing busy with results."); motivational poster cadence ("Small things compound into big things."); triads of exactly three; academic register; sarcasm/negativity as the batch default (fine as rotation per the tone balance above, never dominant).

TERM FIELD — RULES (v2.0)
---------------------------
Job: the label someone says out loud in conversation. Must be sayable, memorable, worth knowing.

1. Concrete imagery beats abstract labels ("The Velvet Rope Effect" > "Exclusivity-Driven Value Perception").
2. Real, citable, exotic-sounding vocabulary is PRESERVED, not simplified (Hormesis, Dunning-Kruger). The everyday-language rule above applies to hook/plain/analogy/prompt — NEVER to term. Novelty is part of the value.
3. Named/coined terms are exempt from rewriting entirely (Dunning-Kruger, Motte and Bailey, Bikeshedding, etc.).
4. "X as/of/over/through Y" = default suspicion, not automatic ban. Test: remove the connector — do the two halves independently mean something? If yes, can stay (e.g. "Brands as Insurance"). If no, find something more specific.
5. "X vs Y" survives only if both nouns are independently teachable. Symbols (≠, >) can replace "vs" when cleaner.
6. NO OVERLAP WITH HOOK — check explicitly, side by side. Don't repeat 2+ content words from the hook or restate its angle. Exempt only when the term IS the established real name for the concept.
7. Specificity/mechanism beats category label ("Three Prices, One Decoy" > "Good, Better, Best").
8. Format: 2–5 words, Title Case, no punctuation except natural hyphens (never em-dashes), avoid leading "The" unless it's earning its place.
9. Accessibility check: would a fluent non-native professional be able to SAY this term out loud in a meeting without stumbling on pronunciation? Tests sayability/circulation, NOT intuitive obviousness — exotic real words can still pass.

PLAIN FIELD — RULES (v2.2)
---------------------------
Job: make the reader actually understand the mechanism — completely, simply, never boring. Not feel something (that's the hook's job). Not paint a vivid scenario (that's the analogy's job).

This product does two things, and plain must serve both: (1) extract what was actually said in the source transcript so a reader gets the highlights of a 2-3 hour conversation in seconds, and (2) translate it into everyday language. Specific names, numbers, and examples FROM THE TRANSCRIPT are the actual extraction value — they are not noise to abstract away.

Length: ceiling 350 characters / ~55 words. This is the standard target for every plain, not a rare exception. No fixed sentence count — 2-4 sentences is normal depending on how much specific transcript content is needed to land the mechanism. May run shorter if it already passes the repeat-back test below.

If a draft runs over 350 characters: TRIM, DO NOT ABSTRACT. Identify the single weakest sentence (the most redundant one, a second/third example when one already landed the point, a speculative claim layered on top of the core mechanism, or a parenthetical that just re-names something already named) and cut it WHOLE. Leave every surviving sentence exactly as drafted — never reword them into something vaguer, and never swap a specific real detail from the transcript for a generic placeholder just to save characters. If still over after one cut, repeat with the next-weakest sentence.

Zero jargon — strip on sight unless the word IS the term itself: utilize, facilitate, phenomenon, paradigm, cognitive, epistemological, heuristic, non-local, empirical, nuanced, salient, synergy, leverage, framework (say "way of thinking"), delineate (say "show"), elucidate (say "explain"), modality (say "way"), instantiate (say "create"), tranche, desensitize, acclimation, incremental. "Optimize" is fine. Also avoid hedging ("research suggests"), corporate filler ("in today's fast-paced world"), and motivational-poster energy ("game-changing", "a new era of").

Structure: start mid-thought, never "X is when..." or "X refers to...". EXCEPTION: if the term is an acronym or a named term, its literal expansion must still appear somewhere in the field, just not as the opening clause (e.g. BATNA must still spell out "Best Alternative To a Negotiated Agreement"). Concrete, specific wording beats abstract noun phrases — this is a word-choice rule, not metaphor-building (that's analogy's job). When listing or ordering multiple items, give each one a short bracketed example. No em-dashes, ever.

Specific real-world claims — KEEP them when the source supports it: names, numbers, dates, and examples that come from the actual transcript should be preserved in plain, not stripped for being "too specific." They are the point of extraction. Only cut a specific detail if it's the single weakest sentence under the trim rule above. Do not invent a fake-precise stat that isn't actually in the transcript.

ALL-FIELDS NON-REPETITION: no scenario, image, fact, or example in plain may repeat one already used in hook, analogy, or prompt on the same card. Before finalizing, check plain against the other three fields you're drafting for this concept — if it reaches for the same image or fact, find a different angle. This is a duplication check, not a specificity check: a sharp, specific detail from the transcript that appears nowhere else on the card should stay.

The repeat-back test (the real quality gate): would the reader, five minutes later, be able to explain the actual mechanism — not just recall a phrase or image? If they could only repeat back an image but not the logic it carried, the image was decorative, not load-bearing. Rewrite.

Hard bans: "It's not X, it's Y"; "While X might seem true, Y is actually..."; triads of exactly three; "Most people don't realize..."; "It's important to note..."; rhetorical-question-then-answer pattern ("Why isn't X celebrated? Because Y."); "It's X: by the time Y, Z" colon-explainer constructions; sentences all roughly the same length.

Bracketed Term Rule: when simplifying would lose a real, widely-used word worth knowing, preserve it via bracketed clarification rather than dumbing it down: "(some call this cognitive dissonance)".

DO NOT extract:
- Generic advice ("work hard", "be consistent", "find your passion")
- Concepts so well-known they add no value ("supply and demand", "teamwork")
- Passing references that weren't actually explained in the content
- Concepts that only apply to one specific profession or narrow situation
- Personal anecdotes without a transferable principle

FOR EACH EXTRACTED CONCEPT, RETURN THIS EXACT JSON STRUCTURE:
{
  "id": null,
  "term": "[follow TERM FIELD RULES v2.0 above — 2-5 words]",
  "category": "[exactly one of: finance | psychology | thinking | power | relationships | language | business | identity | health | philosophy | society | creativity | science | tech-ai]",
  "source": "[2-letter source code — see SOURCE ATTRIBUTION below]",
  "hook": "[follow HOOK FIELD RULES v2.0 above — 8-12 words target, 14 hard ceiling]",
  "plain": "[follow PLAIN FIELD RULES v2.2 above — ~350 char/55 word ceiling, keep transcript-specific content]",
  "analogy": "[one concrete real-world scenario, 1-2 sentences]",
  "prompt": "[one actionable reflection or conversation question]",
  "scores": {
    "universality": [integer 1-10],
    "actionability": [integer 1-10],
    "novelty": [integer 1-10],
    "conversation_value": [integer 1-10],
    "composite": [average of four above, one decimal place]
  },
  "episode_ref": "[episode title and timestamp if identifiable]",
  "timestamp": [integer seconds from start of episode where this concept is discussed, or null if no timestamp marker is present in the transcript]
}

Leave "id" as null — the human reviewer assigns sequential IDs on approval.
Do not output a "collection_id" field — it is assigned by the pipeline, not by you.

TIMESTAMP EXTRACTION
--------------------
Glasp-exported transcripts contain inline timestamps in formats like (23:14), [00:23:14], 23:14, or 1:23:45. When you identify the moment a concept is discussed, convert that timestamp to total seconds and emit it as the integer "timestamp" field. Examples: 23:14 → 1394, 1:23:45 → 5025, 0:42 → 42. If no timestamp marker is near the concept in the transcript, emit null.

SCORING RUBRIC
--------------
universality:        10 = applies to virtually everyone; 1 = narrow group
actionability:       10 = applicable within 24 hours; 1 = purely theoretical
novelty:             10 = counterintuitive, aha-moment; 1 = everyone knows this
conversation_value:  10 = using it would impress in a meeting; 1 = common vocabulary

QUALITY CHECKS — reject concepts that fail any of these:
- Hook must pass all rules in the HOOK FIELD section above (8-12 words target, front-loaded, one dominant lever, everyday language, no overlap with plain)
- Analogy must use a concrete real-world scenario, not "it's like a machine"
- Plain must pass all rules in the PLAIN FIELD section above (350-char ceiling via trim-not-abstract, transcript-specific content preserved, no jargon, repeat-back test, no overlap with hook/analogy/prompt)
- Composite score must be 6.0 or above to be included in output
- Prompt must pass all rules in the dedicated PROMPT FIELD section below

PROMPT FIELD — RULES AND EXAMPLES
---------------------------------
The "prompt" field is the most-failed field in this extraction. Treat it with more care than any other. A great prompt makes a card 10x more valuable; a generic prompt undermines the whole concept.

A great prompt does ALL of the following:

1. FORCES SPECIFICITY
   The user must surface a specific person, decision, moment, resource, or sentence — not "an area of your life" or "a situation."

2. CAPTURES THE CONCEPT'S DEFINING MECHANISM
   The prompt should be reverse-engineerable to the concept. If you stripped the concept name and showed someone only the prompt, they should be able to guess what concept it came from.

3. USES PERMISSION-GIVING OR DIAGNOSTIC LANGUAGE
   Lower the bar for action. "Smallest, ugliest version" beats "minimum viable approach." "What would the conversation actually sound like" beats "consider having the conversation."

4. ANSWERABLE IN UNDER 2 MINUTES
   No "write a 10-year plan" prompts. The user should be able to think through it during a coffee break.

5. NEVER USES THESE OPENERS
   - "Have you ever..."  (most overused; banned)
   - "Think about how this applies..."  (lazy; banned)
   - "Reflect on..."  (vague; banned)

6. AVOIDS TEMPLATE OVERUSE WITHIN THE BATCH
   No more than 3 prompts in any single extraction batch may begin with the same first 4 words. If you find yourself starting a prompt with "Where in your life..." for the 4th time — vary it.

ANTI-PATTERNS — NEVER PRODUCE PROMPTS LIKE THESE
------------------------------------------------
REJECT and rewrite if any prompt:
- Starts with "Where in your life are you [verb-ing]..." for the 4th+ time in a single batch
- Uses the structure "In your most important [X] — are you [A] or [B]?"
- Could fit 3+ different concepts (the "swappable prompt" failure)
- Restates the concept's definition rather than applying it
- Asks the user to "think about" something without forcing a concrete answer
- Ends with "...would serve you better?" or similar generic closing
- Borrows known thinking-tropes from elsewhere (e.g. "10 years on repeat," "if a friend asked you...") UNLESS the concept genuinely is about that trope

Examples of prompts to AVOID (real failures from prior batches):

  ✗ "Where in your life are you accepting treatment you wouldn't accept if you valued yourself more?"  (could fit Self-Worth, People-Pleasing, Codependency, Boundaries — too generic)

  ✗ "Where in your life are you stuck in the moderate middle — not safe enough to be protected, not bold enough to break through — when an extreme in either direction would serve you better?"  (template prompt that gestures at the concept instead of using it)

  ✗ "Think of a recent conflict. What emotion was driving the other person that you didn't fully acknowledge in the moment?"  (template "Think of a recent X — what Y you didn't fully acknowledge")

SELF-CHECK BEFORE RETURNING OUTPUT
----------------------------------
Before finalizing the JSON array, run these checks across all extracted prompts as a group:

1. OPENER VARIETY: Count first-4-word openings. If any phrase appears more than 3 times across the batch, rewrite the duplicates.

2. SEMANTIC OVERLAP: Read all prompts in sequence. If any two prompts could be swapped between concepts and still make sense — rewrite the weaker one. Prompts must be concept-specific, not generic.

3. STRUCTURAL CLONES: Watch for "In your most important X..." and "Where in your life are you Y..." appearing more than twice each. These are template tells.

4. CONCRETENESS PASS: Each prompt should reference at least one of: a specific person, a specific decision, a specific time window (this week, last year, in the next 48 hours), or a specific resource. If a prompt is fully abstract, rewrite it.

5. THE REVERSE TEST: For each prompt, ask: "If I removed the concept name, could a reader guess which concept this prompt came from?" If no — it's not concept-specific enough.

If any prompt fails the self-check, fix it before returning the array.

CATEGORY ASSIGNMENT RULES
-------------------------
finance:       money, investing, economics, wealth, risk capital
psychology:    mental patterns, biases, emotions, self-awareness — individual level
thinking:      reasoning, decision-making, frameworks, mental models
power:         influence, status, negotiation, control
relationships: connection, trust, conflict, interpersonal EQ
language:      FLAGSHIP — vocabulary, rhetoric, framing, speaking, writing, precise expression
business:      building, selling, scaling, strategy, offers
identity:      self-concept, ego, values, personal narrative, who you are
health:        physical performance, sleep, energy, body habits
philosophy:    meaning, ethics, stoicism, existential questions
society:       culture, systems, politics, group behaviour at scale
creativity:    ideas, originality, taste, making things, creative thinking
science:       evidence, empirical thinking, research literacy, how knowledge is made
tech-ai:       technology, AI, digital systems — MUST pass the 15-year-old analogy test.
               Analogy must be concrete and require zero technical background to follow.
               If a curious 15-year-old couldn't understand it, rewrite it.

When a concept could fit two categories, ask: where would someone most want to find this when searching the library?

SOURCE ATTRIBUTION
------------------
The episode metadata you receive includes a HOST and a PODCAST name. Use them to assign each concept a 2-letter source code.

KNOWN MAPPINGS (use these exactly when they apply):
  cw   = Chris Williamson / Modern Wisdom
  ah   = Alex Hormozi
  dk   = Dan Koe
  core = universal concept that predates any one modern voice (e.g. "opportunity cost", "loss aversion", "framing effect")

UNKNOWN HOSTS — generate a 2-letter code from the host's name:
  - Take the first letter of the host's first name, then the first letter of their last name, lowercased.
  - Joe Rogan        → "jr"
  - Tim Ferriss      → "tf"
  - Lex Fridman      → "lf"
  - Steven Bartlett  → "sb"
  - Naval Ravikant   → "nr"
  - Ryan Holiday     → "rh"
  - Andrew Huberman  → would be "ah" but that COLLIDES with Alex Hormozi → use "ahu" instead.

If the generated code collides with a known mapping above, append the next consonant from the last name (e.g. "ahu" for Andrew Huberman, "jrg" if "jr" were taken).

THE "core" RULE — applies regardless of who the host is:
  If the concept is universal and predates the modern podcast era — i.e. it would exist in a textbook or in classical thought without this episode — use "core" instead of the host code. When in doubt, use "core".

OUTPUT FORMAT
-------------
Return ONLY a valid JSON array. No preamble. No markdown code fences. No explanation text.
Sort the array by composite score, highest first.
If fewer than 20 concepts meet the threshold, return only those that genuinely qualify. Quantity is not the goal — editorial quality is.`;

// ---- Main handler ---------------------------------------------------------

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: same pattern as publish-concept.js
  const providedSecret = req.headers['x-publish-secret'];
  if (!providedSecret || providedSecret !== process.env.PUBLISH_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { intakeRecordId, episodeTitle, host, episodeUrl, duration, transcript, people, podcast, airedDate } = req.body || {};

  if (!intakeRecordId || !transcript) {
    return res.status(400).json({ error: 'Missing intakeRecordId or transcript' });
  }

  const minLen = 500;
  if (transcript.length < minLen) {
    await updateIntakeStatus(intakeRecordId, 'FAILED', 0, `Transcript too short (${transcript.length} chars, min ${minLen}).`);
    return res.status(400).json({ error: 'Transcript too short' });
  }

  try {
    // 1. Call Claude API
    // Fetch existing concepts to build the library reference for related_ids generation.
    // If this fails, we proceed without it — related_ids will be empty for this batch.
    let libraryRef = [];
    try {
      const libResp = await fetch(`https://raw.githubusercontent.com/pocsgeri1/listen-learn-live/main/concepts.json`);
      if (libResp.ok) {
        const libData = await libResp.json();
        if (Array.isArray(libData)) {
          libraryRef = libData.map(c => ({ id: c.id, term: c.term, category: c.category }));
        }
      }
    } catch (libErr) {
      console.warn('Could not fetch existing library for related_ids — proceeding without it.', libErr.message);
    }

    const episodeMeta = `${episodeTitle || 'Unknown'} | ${host || 'Unknown'} | ${episodeUrl || ''} | Duration: ${duration || 'n/a'} min`;
    const librarySection = libraryRef.length
      ? `EXISTING_LIBRARY:\n${JSON.stringify(libraryRef)}\n\n`
      : '';
    const userMessage = `EPISODE_METADATA:\n${episodeMeta}\n\n${librarySection}TRANSCRIPT:\n${transcript}`;

    const concepts = await callClaude(userMessage);

    if (!Array.isArray(concepts) || concepts.length === 0) {
      await updateIntakeStatus(intakeRecordId, 'FAILED', 0, 'Claude returned no valid concepts.');
      return res.status(200).json({ ok: false, reason: 'no_concepts' });
    }

    // 2. Create episode-based collection in collections.json BEFORE writing concepts.
    //    If this fails, we abort cleanly without writing any concept rows — no orphans.
    let newCollectionId;
    try {
      newCollectionId = await createEpisodeCollection({
        episodeTitle: episodeTitle || 'Untitled episode',
        people,
        episodeUrl,
        podcast,
        airedDate,
      });
    } catch (err) {
      await updateIntakeStatus(intakeRecordId, 'FAILED', 0, `Collection creation failed: ${String(err.message || err).slice(0, 500)}`);
      return res.status(500).json({ error: 'Collection creation failed', detail: err.message });
    }

    // 3. Write each concept to Airtable Concepts table as PENDING, with collection_id pre-filled.
    const episodeRefLabel = episodeTitle ? `${episodeTitle} (${host || 'unknown host'})` : 'Unknown episode';
    let successCount = 0;
    const failures = [];

    for (const c of concepts) {
      try {
        await createConceptRow(c, episodeRefLabel, episodeUrl, newCollectionId);
        successCount++;
      } catch (err) {
        failures.push({ term: c?.term, error: err.message });
      }
    }

    // 3. Update intake row
    if (successCount > 0) {
      await updateIntakeStatus(intakeRecordId, 'DONE', successCount, failures.length ? `Partial: ${failures.length} failed. ${JSON.stringify(failures).slice(0, 500)}` : '');
    } else {
      await updateIntakeStatus(intakeRecordId, 'FAILED', 0, `All ${concepts.length} writes failed. First error: ${failures[0]?.error || 'unknown'}`);
    }

    return res.status(200).json({ ok: true, created: successCount, attempted: concepts.length });
  } catch (err) {
    console.error('extract-concepts error:', err);
    await updateIntakeStatus(intakeRecordId, 'FAILED', 0, String(err.message || err).slice(0, 1000));
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}

// ---- Claude API call ------------------------------------------------------

async function callClaude(userMessage) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 16000,
      system: EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Claude API ${resp.status}: ${text.slice(0, 500)}`);
  }

  const data = await resp.json();
  const text = data?.content?.[0]?.text || '';

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Claude did not return valid JSON. First 300 chars: ${cleaned.slice(0, 300)}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Claude response was valid JSON but not an array.');
  }

  return parsed;
}

// ---- Airtable writes ------------------------------------------------------

const AT_BASE = process.env.AIRTABLE_BASE_ID;
const AT_KEY = process.env.AIRTABLE_API_KEY;
const CONCEPTS_TABLE = 'Concepts';
const INTAKE_TABLE = 'Intake';

const VALID_CATEGORIES = ['finance', 'psychology', 'thinking', 'power', 'relationships', 'language', 'business', 'identity', 'health', 'philosophy', 'society', 'creativity', 'science', 'tech-ai'];

// Source codes are now open-ended (see SOURCE ATTRIBUTION in the prompt above).
// Any 2-4 lowercase letter code passes through; Airtable typecast: true (in
// createConceptRow's POST body) auto-creates new Single Select options.
// Anything missing or malformed falls back to 'core'.
function normalizeSource(raw) {
  if (typeof raw !== 'string') return 'core';
  const s = raw.trim().toLowerCase();
  return /^[a-z]{2,4}$/.test(s) ? s : 'core';
}

async function createConceptRow(concept, episodeRefLabel, episodeUrl, collectionId) {
  const category = VALID_CATEGORIES.includes(concept.category) ? concept.category : null;
  const source = normalizeSource(concept.source);

  if (!category) throw new Error(`Invalid category: ${concept.category} (term: ${concept.term})`);
  if (!concept.term || !concept.hook || !concept.plain || !concept.analogy || !concept.prompt) {
    throw new Error(`Missing required fields (term: ${concept.term})`);
  }

   const fields = {
    'Status': 'PENDING',
    'Term': toTitleCase(concept.term),
    'Category': category,
    'Source': source,
    'Hook': concept.hook,
    'Plain': concept.plain,
    'Analogy': concept.analogy,
    'Prompt': concept.prompt,
    'Episode Reference': concept.episode_ref || episodeRefLabel,
    'Timestamp': (typeof concept.timestamp === 'number' && concept.timestamp >= 0) ? concept.timestamp : null,
  };

  if (episodeUrl) fields['Episode URL'] = episodeUrl;
  if (Number.isFinite(collectionId)) fields['Collection ID'] = collectionId;
  // Store related_ids as a comma-separated string (Airtable has no native int-array field).
  // publish-batch.js reads this back and stores it as a proper array in concepts.json.
  if (Array.isArray(concept.related_ids) && concept.related_ids.length > 0) {
    fields['Related IDs'] = concept.related_ids.join(', ');
  }

  const s = concept.scores || {};
  if (typeof s.universality === 'number') fields['Universality Score'] = s.universality;
  if (typeof s.actionability === 'number') fields['Actionability Score'] = s.actionability;
  if (typeof s.novelty === 'number') fields['Novelty Score'] = s.novelty;
  if (typeof s.conversation_value === 'number') fields['Conversation Value Score'] = s.conversation_value;

  const resp = await fetch(`https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(CONCEPTS_TABLE)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AT_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields, typecast: true }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Airtable create failed ${resp.status}: ${text.slice(0, 400)}`);
  }

  return resp.json();
}

async function updateIntakeStatus(recordId, status, conceptsCreated, errorMessage) {
  const fields = {
    'Status': status,
    'Concepts Created': conceptsCreated,
  };
  if (errorMessage) fields['Error Message'] = errorMessage;

  await fetch(`https://api.airtable.com/v0/${AT_BASE}/${encodeURIComponent(INTAKE_TABLE)}/${recordId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AT_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields, typecast: true }),
  });
}

function toTitleCase(str) {
  if (!str) return str;
  const minorWords = new Set([
    'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'so', 'yet',
    'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'is', 'if', 'vs'
  ]);
  const words = str.toLowerCase().trim().split(/\s+/);
  return words.map((word, i) => {
    if (i === 0 || i === words.length - 1) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    if (minorWords.has(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}
// ---- Collection creation (collections.json on GitHub) ----------------------
// Owner/repo hardcoded to match the convention in publish-concept.js.
// If we ever move both to env vars, do it in a dedicated infra session.

const COLLECTIONS_REPO_OWNER = 'pocsgeri1';
const COLLECTIONS_REPO_NAME = 'listen-learn-live';
const COLLECTIONS_BRANCH = 'main';
const COLLECTIONS_PATH = 'collections.json';

async function createEpisodeCollection({ episodeTitle, people, episodeUrl, podcast, airedDate }) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN env var missing');
  }

  const apiUrl = `https://api.github.com/repos/${COLLECTIONS_REPO_OWNER}/${COLLECTIONS_REPO_NAME}/contents/${COLLECTIONS_PATH}?ref=${COLLECTIONS_BRANCH}`;

  // 1. Fetch current collections.json from GitHub (with sha for the commit).
  const getResp = await fetch(apiUrl, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'Epistemic-Publisher',
    },
  });
  if (!getResp.ok) {
    const t = await getResp.text();
    throw new Error(`GitHub GET collections.json failed ${getResp.status}: ${t.slice(0, 300)}`);
  }
  const fileData = await getResp.json();
  const currentSha = fileData.sha;

  let collections;
  try {
    const decoded = Buffer.from(fileData.content, 'base64').toString('utf-8');
    collections = JSON.parse(decoded);
  } catch (err) {
    throw new Error(`collections.json is not valid JSON: ${err.message}`);
  }
  if (!Array.isArray(collections)) {
    throw new Error('collections.json root is not an array');
  }

  // 2. Compute next collection ID. Episode-based collections start at 10.
  const existingIds = collections.map(c => c.id).filter(n => Number.isFinite(n));
  const maxExisting = existingIds.length ? Math.max(...existingIds) : 0;
  const newId = Math.max(maxExisting + 1, 10);

  // 3. Parse people field (comma-separated, host first then guests).
  const peopleArray = (typeof people === 'string' && people.trim().length)
    ? people.split(',').map(p => p.trim()).filter(Boolean)
    : [];

  // 4. Duplicate prevention: same episode_url already in collections.json?
  if (episodeUrl) {
    const dup = collections.find(c => c.episode_url && c.episode_url === episodeUrl);
    if (dup) {
      throw new Error(`Duplicate episode: episode_url already exists as collection id ${dup.id}`);
    }
  }

  // 5. Build the new collection record.
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const newCollection = {
    id: newId,
    title: String(episodeTitle).slice(0, 200),
    type: 'episode',
    podcast: podcast ? String(podcast).slice(0, 100) : 'Other',
    people: peopleArray,
    episode_url: episodeUrl || '',
    aired_date: airedDate || null,
    created_date: today,
  };

  collections.push(newCollection);

  // 6. Commit back to GitHub. PUT with the sha.
  const newContent = Buffer.from(JSON.stringify(collections, null, 2) + '\n', 'utf-8').toString('base64');

  const putResp = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Epistemic-Publisher',
    },
    body: JSON.stringify({
      message: `chore: add episode collection ${newId} (${String(episodeTitle).slice(0, 60)})`,
      content: newContent,
      sha: currentSha,
      branch: COLLECTIONS_BRANCH,
    }),
  });

  if (!putResp.ok) {
    const t = await putResp.text();
    throw new Error(`GitHub PUT collections.json failed ${putResp.status}: ${t.slice(0, 300)}`);
  }

  return newId;
}
