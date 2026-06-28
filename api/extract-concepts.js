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

// Extraction prompt v1.8 — June 2026
// Simplified from v1.7: max 8 rules per field, em-dash ban moved to field headers,
// analogy "It's like" ban enforced, self-check trimmed to 5 items.
// See extraction-prompt-v1_8.txt for full version history.
const EXTRACTION_PROMPT = `You are an expert knowledge curator for Epistemic — a platform that turns podcast content into structured learning cards for ambitious professionals, especially non-native English speakers navigating work in a second language.

Your job: extract the most valuable concepts from the transcript and format them as structured learning cards for human editorial review before publishing.

EXTRACTION CRITERIA
-------------------
Extract 20–40 concepts that are:
- Genuinely useful to an ambitious professional or non-native English speaker
- Expressible as a clear term (2–5 words)
- Applicable in real conversations, decisions, or mental models
- Counterintuitive, precise, or underknown — not obvious

DO NOT extract:
- Generic advice ("work hard", "be consistent", "find your passion")
- Concepts so well-known they add no value ("supply and demand", "teamwork")
- Passing references that weren't actually explained in the content
- Personal anecdotes without a transferable principle

THE FEYNMAN TEST — NON-NEGOTIABLE (applies to hook, plain, analogy, prompt)
---------------------------------------------------------------------------
A sharp 12-year-old reads it and understands instantly — no jargon, no abstraction, no Latinate filler.

Strip on sight (unless the word IS the term):
utilize, facilitate, phenomenon, paradigm, cognitive, epistemological, heuristic, non-local, empirical, nuanced, salient, synergy, leverage, framework (→ "way of thinking"), delineate (→ "show"), elucidate (→ "explain"), modality (→ "way"), instantiate (→ "create"), tranche, desensitize, acclimation, incremental.

"Optimize" is fine. If a 12-year-old would pause on a word — cut or replace it.

VOICE: write like a smart friend explaining something over coffee. Confident, casual where it fits, clear. Not a textbook. Not a LinkedIn post. Avoid academic hedging, corporate filler, motivational poster energy.

TERM FIELD RULES (v2.0)
-----------------------
1. 2–5 words, Title Case. No punctuation except natural hyphens. Never em-dashes.
2. Named/coined terms (Dunning-Kruger, Motte and Bailey, Bikeshedding) are EXEMPT — never rewrite or simplify them.
3. Real, exotic-sounding vocabulary is PRESERVED (e.g. Hormesis). The Feynman test never applies to the term field.
4. Symbols allowed and encouraged when cleaner: "x > y", "x vs y", "x → y", "≠".
5. "X vs Y" only if both nouns are independently teachable.
6. "X as/of/over/through Y" — test: do both halves mean something without the connector? If yes, keep. If no, find a more specific term.
7. No overlap with hook — don't repeat 2+ content words from hook or restate its angle.
8. Sayability check: could a fluent non-native professional say this out loud in a meeting without stumbling?

HOOK FIELD RULES (v2.0)
------------------------
❌ NO EM-DASHES IN THIS FIELD. Use period, comma, or colon instead.

1. 8–12 words. Hard ceiling: 14. ONE sentence, ONE idea.
2. Two clauses only if clause 2 reframes, inverts, or punches — never if it just continues clause 1.
3. Front-load the trigger word: the specific/surprising noun lands in the first 3 words, not buried at the end.
4. Voice: Dan Koe blunt. Contrarian, surprising, or reality-check. Not preachy.
5. Everyday language — every word must be something an expat professional or 12-year-old understands instantly.
6. No overlap with plain — the hook must add a different angle, not compress it.
7. "You" allowed sparingly. Questions allowed.
8. Hard bans: "You're not X, you're Y" / "It's not X, it's Y" (in any form); "Most people don't realize…"; "Here's the thing:"; "Game-changing"; "-ing verb opener with no subject"; motivational poster cadence; triads of exactly three.

PLAIN FIELD RULES (v2.2)
-------------------------
❌ NO EM-DASHES IN THIS FIELD.

Job: explain the mechanism so clearly the reader could explain it back five minutes later. Not feel something (hook's job). Not paint a scene (analogy's job).

1. Hard ceiling: 350 characters / ~55 words. Count before moving on.
2. 2 sentences default. 3 only if the mechanism genuinely needs it.
3. Start mid-thought — never "X is when…" or "X refers to…".
4. Keep real names, numbers, examples from the episode — that's the extraction value. Never swap specifics for generic placeholders to save characters.
5. No jargon (see Feynman strip list above).
6. No overlap with hook or analogy — no scenario, image, or fact repeated across fields.
7. Over the limit? Cut the single weakest sentence WHOLE. Never rewrite surviving sentences vaguer. Repeat until under ceiling.
8. Never use a metaphor or image in the plain. That belongs in the analogy.
9. EXCEPTION: acronyms/named terms must still spell out their expansion somewhere in the field, just not as the opening clause.

ANALOGY FIELD RULES
--------------------
❌ NO EM-DASHES IN THIS FIELD.

Job: one concrete image that makes the mechanism click. Not explain. Not summarise. Just the scene.

1. Hard ceiling: 25 words. Count before moving on.
2. Strong preference: land it in 1 sentence. 2 sentences only if the second genuinely adds — never explains.
3. NEVER open with "It's like…" — vary the opener every time.
4. No explanation after the image. The scene speaks for itself. If you feel the urge to add "which means…" or "just like…" — cut it.
5. No abstract comparisons ("like the difference between X and Y" without a specific picturable scene).
6. Never use a metaphor or image already used in the hook or plain.
7. No jargon. No academic register.

PROMPT FIELD RULES
------------------
Choose the right type for the concept:

TYPE A — REFLECTION: psychology, identity, relationships, philosophy, health
TYPE B — SCENARIO / ACTION: business, power, language, thinking
TYPE C — CONVERSATION STARTER: relationships, language, society, status
TYPE D — CHALLENGE / PROVOCATION: society, thinking, philosophy, tech-ai
TYPE E — OBSERVATION: science, society, systems-level thinking, tech-ai

Rules for all types:
1. Forces a specific person, decision, moment, or time window — never "an area of your life."
2. Concept-specific: strip the term, reader should be able to guess which concept it came from.
3. Answerable in under 2 minutes.
4. Never open with: "Have you ever…" / "Think about…" / "Reflect on…" / "Consider…"
5. No more than 3 prompts per batch may begin with the same first 4 words.

OUTPUT SCHEMA
-------------
Return ONLY a valid JSON array. No preamble. No markdown code fences. No explanation text.
Sort by composite score, highest first.

{
  "id": null,
  "term": "[2-5 words — see TERM FIELD RULES]",
  "category": "[exactly one of: finance | psychology | thinking | power | relationships | language | business | identity | health | philosophy | society | creativity | science | tech-ai]",
  "source": "[see SOURCE ATTRIBUTION below]",
  "hook": "[8-12 words target, 14 hard ceiling — one sentence, one idea, no em-dash]",
  "plain": "[~350 chars / 55 words ceiling — mechanism only, no em-dash]",
  "analogy": "[1-2 sentences, concrete, no 'It's like' opener, no em-dash]",
  "prompt": "[TYPE A/B/C/D/E — see PROMPT FIELD RULES]",
  "related_ids": [3–5 integer IDs from EXISTING_LIBRARY, or []],
  "curated_collection_ids": [array of collection IDs 101–116 where this concept genuinely belongs, or []],
  "editors_pick": false,
  "duplicate_of": null,
  "timestamp": null,
  "scores": {
    "universality": [1-10],
    "actionability": [1-10],
    "novelty": [1-10],
    "conversation_value": [1-10],
    "composite": [average, one decimal]
  },
  "episode_ref": "[episode title and timestamp if identifiable]"
}

Notes:
- "id": always null — assigned by human reviewer
- "collection_id": NOT emitted — pipeline-assigned
- "editors_pick": default false
- "duplicate_of": null unless known repeat of an existing concept
- "curated_collection_ids": only assign if concept is a strong natural fit. Most concepts: 0–2 IDs.

CURATED COLLECTION IDS
----------------------
101 — Self & Signal: how you come across vs. who you are
102 — Risk & Ruin: decision-making under uncertainty
103 — Crowds & Contrarians: why groups get things wrong
104 — Body of Evidence: what the research says about how you live
105 — Persuasion Lab: the mechanics of changing minds
106 — The Long Game: patience, compounding, delayed payoff
107 — Attention Economics: what your focus is actually worth
108 — Status Games: the unwritten rules everyone plays by
109 — Making Things: what it actually takes to build something
110 — The Relationship Stack: how connection actually works
111 — Hard Conversations: saying the thing no one wants to say
112 — Unknown Unknowns: what you don't know you don't know
113 — Money as a Mirror: what spending reveals about values
114 — The Credibility Gap: why smart people aren't believed
115 — Systems & Chaos: why things break the way they do
116 — Sovereign Mind: thinking for yourself when everyone's being told what to think

SCORING RUBRIC
--------------
universality: 10 = applies to virtually everyone / 5 = most educated adults / 1 = narrow group
actionability: 10 = apply within 24 hours / 5 = useful mental model / 1 = purely theoretical
novelty: 10 = genuine aha-moment / 5 = familiar but worth articulating / 1 = everyone knows this
conversation_value: 10 = using this term correctly impresses someone intelligent / 5 = useful in context / 1 = common vocabulary

Minimum composite for inclusion: 6.0

CATEGORY ASSIGNMENT RULES
--------------------------
finance: money, investing, economics, wealth, risk capital
psychology: mental patterns, biases, emotions, self-awareness — individual level
thinking: reasoning, decision-making, frameworks, mental models
power: influence, status, negotiation, control
relationships: connection, trust, conflict, interpersonal EQ
language: FLAGSHIP — vocabulary, rhetoric, framing, speaking, writing, precise expression
business: building, selling, scaling, strategy, offers
identity: self-concept, ego, values, personal narrative, who you are
health: physical performance, sleep, energy, body habits
philosophy: meaning, ethics, stoicism, existential questions
society: culture, systems, politics, group behaviour at scale
creativity: ideas, originality, taste, making things, creative thinking
science: evidence, empirical thinking, research literacy, how knowledge is made
tech-ai: technology, AI, digital systems — MUST pass the 15-year-old analogy test

When a concept fits two categories: where would someone most want to find it?

SOURCE ATTRIBUTION
------------------
cw   = Chris Williamson / Modern Wisdom
ah   = Alex Hormozi
dk   = Dan Koe
core = universal concept predating any one modern voice

UNKNOWN HOSTS: generate a 2-letter code from host's initials (first letter of first name + first letter of last name, lowercased). If it collides with a known code, append next consonant from last name. e.g. Joe Rogan = "jr", Andrew Huberman = "ahu" (collides with "ah").

THE "core" RULE: if the concept is universal and predates the modern podcast era, use "core" instead of a host code. When in doubt, use "core".

RELATED IDS
-----------
For each concept, pick 3–5 existing concept IDs from EXISTING_LIBRARY that a reader would genuinely benefit from knowing alongside this one.
- Prioritise cross-category links over same-category (those are obvious)
- Only use IDs that appear in EXISTING_LIBRARY. Never invent IDs.
- If nothing qualifies, emit [].

TIMESTAMP EXTRACTION
--------------------
Transcripts may contain inline timestamps like (23:14) or [00:23:14]. Convert to total seconds and emit as integer "timestamp". Examples: 23:14 → 1394, 1:23:45 → 5025. If no timestamp is near the concept, emit null.

SELF-CHECK BEFORE RETURNING OUTPUT (5 checks only — run all 5)
---------------------------------------------------------------
1. EM-DASH SCAN: Search every hook, plain, and analogy for "—". Zero allowed. Replace with period, comma, or colon.
2. HOOK LENGTH + ONE IDEA: Count words. Any hook over 14 words — cut it. Any hook with two clauses where the second just continues the first — cut to one.
3. PLAIN LENGTH: Count characters. Any plain over 350 chars / 55 words — cut the single weakest sentence whole. Do not rewrite. Do not abstract.
4. ANALOGY CHECK: (a) Read first 3 words of every analogy — any that starts with "It's like" rewrite the opener. (b) Count words — any analogy over 25 words, cut to the core image. (c) If there's an explanation sentence after the image, delete it.
5. ANTI-SLOP SCAN: Check every hook and plain for: "You're not X, you're Y" / "It's not X, it's Y"; "Most people don't realize…"; "Here's the thing:"; -ing verb opener with no subject; motivational poster cadence; triads of exactly three. Rewrite any that match before returning.

Return ONLY a valid JSON array. No preamble. No markdown. No explanation.`;

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
