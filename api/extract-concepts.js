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

const EXTRACTION_PROMPT = `You are an expert knowledge curator for Listen. Learn. Live. — a platform that turns podcast content into structured learning cards for ambitious professionals, especially non-native English speakers navigating work in a second language.

Your job is to extract the most valuable concepts, phrases, and frameworks from the podcast transcript below and format them as structured learning cards that will be reviewed by a human editor before publishing.

EXTRACTION CRITERIA
-------------------
Extract 20–40 concepts that are:
- Genuinely useful to an ambitious professional or non-native English speaker
- Expressible as a clear term (2–5 words)
- Applicable in real conversations, decisions, or mental models
- Counterintuitive, precise, or underknown rather than obvious

DO NOT extract:
- Generic advice ("work hard", "be consistent", "find your passion")
- Concepts so well-known they add no value ("supply and demand", "teamwork")
- Passing references that weren't actually explained in the content
- Concepts that only apply to one specific profession or narrow situation
- Personal anecdotes without a transferable principle

FOR EACH EXTRACTED CONCEPT, RETURN THIS EXACT JSON STRUCTURE:
{
  "id": null,
  "term": "[2-5 words, clear and memorable]",
  "category": "[exactly one of: finance | psychology | thinking | power | relationships | language | business]",
  "source": "[exactly one of: cw | ah | dk | core based on who said it]",
  "hook": "[one sentence, max 12 words, format: observation — implication]",
  "plain": "[2-3 sentences, zero jargon, plain English only]",
  "analogy": "[one concrete real-world scenario, 1-2 sentences]",
  "prompt": "[one actionable reflection or conversation question]",
  "scores": {
    "universality": [integer 1-10],
    "actionability": [integer 1-10],
    "novelty": [integer 1-10],
    "conversation_value": [integer 1-10],
    "composite": [average of four above, one decimal place]
  },
  "episode_ref": "[episode title and timestamp if identifiable]"
}

Leave "id" as null — the human reviewer assigns sequential IDs on approval.

SCORING RUBRIC
--------------
universality:        10 = applies to virtually everyone; 1 = narrow group
actionability:       10 = applicable within 24 hours; 1 = purely theoretical
novelty:             10 = counterintuitive, aha-moment; 1 = everyone knows this
conversation_value:  10 = using it would impress in a meeting; 1 = common vocabulary

QUALITY CHECKS — reject concepts that fail any of these:
- Hook must work as a standalone tweet and feel punchy
- Analogy must use a concrete real-world scenario, not "it's like a machine"
- Plain explanation must pass the "smart 25-year-old who never heard this term" test
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
finance:       money, investing, economics, wealth, risk capital
psychology:    mental patterns, biases, emotions, self-awareness
thinking:      reasoning, decision-making, frameworks, mental models
power:         influence, status, politics, social structures
relationships: connection, communication, trust, conflict
language:      smart phrases, rhetorical tools, precise vocabulary
business:      building, selling, scaling, strategy, offers

SOURCE ATTRIBUTION
cw   = Chris Williamson / Modern Wisdom
ah   = Alex Hormozi
dk   = Dan Koe
core = universal concept predating any one modern voice. When in doubt, use "core".

OUTPUT FORMAT
-------------
Return ONLY a valid JSON array. No preamble. No markdown code fences. No explanation text.
Sort the array by composite score, highest first.
If fewer than 20 concepts meet the threshold, return only those that genuinely qualify.`;

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

  const { intakeRecordId, episodeTitle, host, episodeUrl, duration, transcript, people } = req.body || {};

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
    const episodeMeta = `${episodeTitle || 'Unknown'} | ${host || 'Unknown'} | ${episodeUrl || ''} | Duration: ${duration || 'n/a'} min`;
    const userMessage = `EPISODE_METADATA:\n${episodeMeta}\n\nTRANSCRIPT:\n${transcript}`;

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
const VALID_SOURCES = ['core', 'cw', 'ah', 'dk'];

async function createConceptRow(concept, episodeRefLabel, episodeUrl, collectionId) {
  const category = VALID_CATEGORIES.includes(concept.category) ? concept.category : null;
  const source = VALID_SOURCES.includes(concept.source) ? concept.source : 'core';

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
  };

  if (episodeUrl) fields['Episode URL'] = episodeUrl;
  if (Number.isFinite(collectionId)) fields['Collection ID'] = collectionId;

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

async function createEpisodeCollection({ episodeTitle, people, episodeUrl }) {
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
      'User-Agent': 'LLL-Publisher',
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
    people: peopleArray,
    episode_url: episodeUrl || '',
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
      'User-Agent': 'LLL-Publisher',
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
