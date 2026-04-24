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
- Prompt must be specific and actionable today
- Composite score must be 6.0 or above to be included in output

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

  const { intakeRecordId, episodeTitle, host, episodeUrl, duration, transcript } = req.body || {};

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

    // 2. Write each concept to Airtable Concepts table as PENDING
    const episodeRefLabel = episodeTitle ? `${episodeTitle} (${host || 'unknown host'})` : 'Unknown episode';
    let successCount = 0;
    const failures = [];

    for (const c of concepts) {
      try {
        await createConceptRow(c, episodeRefLabel, episodeUrl);
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

const VALID_CATEGORIES = ['finance', 'psychology', 'thinking', 'power', 'relationships', 'language', 'business'];
const VALID_SOURCES = ['core', 'cw', 'ah', 'dk'];

async function createConceptRow(concept, episodeRefLabel, episodeUrl) {
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
