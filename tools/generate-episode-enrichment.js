#!/usr/bin/env node
// tools/generate-episode-enrichment.js
// Adds a second layer of metadata to episode_meta.json: difficulty, tone, guest_field,
// key_quotes, core_claim, episode_type, actionability_score, evergreen, controversy_flag.
// Also auto-calculates guest_return and concept_density without an API call.
// episode_length_minutes is seeded as null — backfill manually.
//
// Source: episode_meta.json + concepts.json + collections.json
// Output: writes to episode_meta.json after EACH episode — safe to interrupt
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... node tools/generate-episode-enrichment.js
//
// Options:
//   --force          Re-generate even if enrichment already exists
//   --id 11          Only process one specific collection_id
//   --dry-run        Print prompts without calling API
//
// Resume safety: episodes with all fields already populated are skipped.
// Crashes mid-run? Re-run — it picks up from where it stopped.

'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT             = path.join(__dirname, '..');
const CONCEPTS_PATH    = path.join(ROOT, 'concepts.json');
const COLLECTIONS_PATH = path.join(ROOT, 'collections.json');
const META_PATH        = path.join(ROOT, 'episode_meta.json');

const MODEL      = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 800;
const DELAY_MS   = 1500;
const TIMEOUT_MS = 45000;

// Fields this script is responsible for (AI-generated)
const AI_FIELDS = ['difficulty_level','tone','guest_field','key_quotes','core_claim','episode_type','actionability_score','evergreen','controversy_flag'];
// Fields auto-calculated (no API call)
const CALC_FIELDS = ['guest_return','concept_density','episode_length_minutes'];

// ── Args ─────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const FORCE   = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const ONLY_ID = (() => { const i = args.indexOf('--id'); return i >= 0 ? parseInt(args[i + 1]) : null; })();

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY && !DRY_RUN) {
  console.error('ERROR: ANTHROPIC_API_KEY not set.');
  process.exit(1);
}

// ── Load data ─────────────────────────────────────────────────────────────────

const rawConcepts    = JSON.parse(fs.readFileSync(CONCEPTS_PATH, 'utf8'));
const rawCollections = JSON.parse(fs.readFileSync(COLLECTIONS_PATH, 'utf8'));
const metaFile       = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

const CONCEPTS    = rawConcepts.concepts || rawConcepts;
const COLLECTIONS = rawCollections.collections || rawCollections;

// Index concepts by collection_id
const conceptsByEpisode = {};
CONCEPTS.forEach(function(c) {
  if (c.collection_id == null) return;
  var key = String(c.collection_id);
  if (!conceptsByEpisode[key]) conceptsByEpisode[key] = [];
  conceptsByEpisode[key].push(c);
});

// Build guest_return lookup: person name -> true if appears in 2+ episodes
const guestEpisodeCounts = {};
COLLECTIONS.filter(function(c) { return c.type === 'episode' || c.type === 'short'; }).forEach(function(col) {
  (col.people || []).forEach(function(p) {
    guestEpisodeCounts[p] = (guestEpisodeCounts[p] || 0) + 1;
  });
});

// Only process episode-type collections
const episodeCollections = COLLECTIONS.filter(function(c) { return c.type === 'episode'; });

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an editorial analyst for Epistemic, a podcast learning platform.

Given an episode title, host/guest info, and its extracted concept cards, output a JSON object with these fields:

{
  "difficulty_level": 1 | 2 | 3,
  "tone": "challenging" | "warm" | "practical" | "philosophical" | "confrontational",
  "guest_field": "string — the guest's primary domain (e.g. neuroscience, finance, philosophy, marketing)",
  "key_quotes": ["quote 1", "quote 2", "quote 3"],
  "core_claim": "string — one sentence: the single most important thing this episode argues",
  "episode_type": "interview" | "solo" | "debate" | "panel",
  "actionability_score": 1 | 2 | 3,
  "evergreen": true | false,
  "controversy_flag": true | false
}

FIELD RULES:
- difficulty_level: 1 = accessible to anyone / 2 = requires some background knowledge / 3 = dense, specialist-heavy
- tone: pick the dominant tone. "confrontational" = directly challenges mainstream views. "challenging" = intellectually demanding. "warm" = personal, empathetic. "practical" = actionable, how-to. "philosophical" = ideas-driven, abstract.
- guest_field: single domain, 1-3 words. If host-only episode, use the host's domain.
- key_quotes: 2-3 short verbatim-ish memorable quotes from the episode, inferred from concept cards. Punchy, quotable, works out of context.
- core_claim: one sentence only. The thesis the whole episode orbits. Different from the summary — distilled to a single claim.
- episode_type: "solo" if only one person. "debate" if two people with clearly opposing views. "panel" if 3+. "interview" otherwise.
- actionability_score: 1 = pure ideas, nothing to do tomorrow / 2 = some takeaways / 3 = full of concrete steps and advice
- evergreen: true if this episode will be just as valuable in 5 years. false if tied to current events, trends, or news.
- controversy_flag: true if reasonable people would strongly disagree with the main argument.

OUTPUT: valid JSON only, no preamble, no markdown fences.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

function buildUserMessage(col, concepts) {
  var host = col.people && col.people.length > 0 ? col.people.join(' and ') : col.podcast || 'the host';
  var conceptLines = concepts.map(function(c) {
    return 'TERM: ' + c.term + '\nHOOK: ' + c.hook;
  }).join('\n\n');

  return 'EPISODE TITLE: ' + col.title + '\n' +
    'HOST / GUEST: ' + host + '\n' +
    'PODCAST: ' + (col.podcast || 'unknown') + '\n' +
    'CONCEPT COUNT: ' + concepts.length + '\n\n' +
    'CONCEPT CARDS FROM THIS EPISODE:\n' + conceptLines;
}

function callClaude(userMessage) {
  return new Promise(function(resolve, reject) {
    var body = JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    var options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: TIMEOUT_MS,
    };

    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        if (res.statusCode !== 200) return reject(new Error('API ' + res.statusCode + ': ' + data.slice(0, 300)));
        try {
          var parsed  = JSON.parse(data);
          var text    = (parsed && parsed.content && parsed.content[0] && parsed.content[0].text) || '';
          var cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          resolve(JSON.parse(cleaned));
        } catch (e) {
          reject(new Error('JSON parse failed: ' + e.message + '\nRaw: ' + data.slice(0, 400)));
        }
      });
    });

    req.on('timeout', function() { req.destroy(); reject(new Error('Timed out')); });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function saveMeta() {
  fs.writeFileSync(META_PATH, JSON.stringify(metaFile, null, 2), 'utf8');
}

// Validate + sanitize the AI result
var VALID_TONES = new Set(['challenging','warm','practical','philosophical','confrontational']);
var VALID_TYPES = new Set(['interview','solo','debate','panel']);

function sanitize(result) {
  return {
    difficulty_level:    [1,2,3].includes(result.difficulty_level) ? result.difficulty_level : null,
    tone:                (result.tone && VALID_TONES.has(result.tone)) ? result.tone : null,
    guest_field:         (typeof result.guest_field === 'string' && result.guest_field.length > 0) ? result.guest_field : null,
    key_quotes:          Array.isArray(result.key_quotes) ? result.key_quotes.slice(0, 3) : [],
    core_claim:          (typeof result.core_claim === 'string' && result.core_claim.length > 0) ? result.core_claim : null,
    episode_type:        (result.episode_type && VALID_TYPES.has(result.episode_type)) ? result.episode_type : null,
    actionability_score: [1,2,3].includes(result.actionability_score) ? result.actionability_score : null,
    evergreen:           typeof result.evergreen === 'boolean' ? result.evergreen : null,
    controversy_flag:    typeof result.controversy_flag === 'boolean' ? result.controversy_flag : null,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\nEpistemic — Episode Enrichment Generator');
  console.log('Model: ' + MODEL + ' | Force: ' + FORCE + ' | Dry run: ' + DRY_RUN + ' | Only ID: ' + (ONLY_ID || 'all') + '\n');

  // Filter to episodes that need processing
  var queue = episodeCollections.filter(function(col) {
    if (ONLY_ID && col.id !== ONLY_ID) return false;
    var entry = metaFile.episodes && metaFile.episodes[String(col.id)];
    if (!entry) return true;
    if (FORCE) return true;
    // Skip if all AI fields are already populated
    return AI_FIELDS.some(function(f) { return entry[f] == null; });
  }).filter(function(col) {
    var concepts = conceptsByEpisode[String(col.id)];
    return concepts && concepts.length >= 3;
  });

  console.log('Episodes to process: ' + queue.length);
  if (queue.length === 0) {
    console.log('Nothing to do. Use --force to re-generate existing entries.');
    return;
  }

  var done = 0, failed = 0;

  for (var i = 0; i < queue.length; i++) {
    var col = queue[i];
    var id  = String(col.id);
    var concepts = conceptsByEpisode[id] || [];
    console.log('\n[' + (done + failed + 1) + '/' + queue.length + '] ' + col.title + ' (id:' + id + ')');

    // ── Auto-calculate fields (no API call) ──────────────────────────────────
    var people = col.people || [];
    var guestReturn = people.length > 0 && people.some(function(p) { return (guestEpisodeCounts[p] || 0) > 1; });
    var conceptCount = concepts.length;

    // Ensure entry exists
    if (!metaFile.episodes[id]) {
      metaFile.episodes[id] = { collection_id: parseInt(id) };
    }
    var entry = metaFile.episodes[id];

    // Write calculated fields (always, even on dry run)
    entry.guest_return       = guestReturn;
    entry.concept_density    = conceptCount; // concepts per episode (episode_length_minutes backfilled separately)
    if (entry.episode_length_minutes == null) entry.episode_length_minutes = null; // placeholder

    if (DRY_RUN) {
      console.log('  [dry-run] guest_return=' + guestReturn + ' concept_density=' + conceptCount);
      done++;
      continue;
    }

    // ── AI-generated fields ──────────────────────────────────────────────────
    var userMessage = buildUserMessage(col, concepts);
    var result = null;

    for (var attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await callClaude(userMessage);
        break;
      } catch (err) {
        console.error('  Attempt ' + attempt + ' failed: ' + err.message);
        if (attempt < 2) { console.log('  Retrying in 5s...'); await sleep(5000); }
      }
    }

    if (!result) {
      console.error('  Skipping ' + col.title + ' — both attempts failed.');
      // Still save the auto-calculated fields
      saveMeta();
      failed++;
      continue;
    }

    var clean = sanitize(result);
    AI_FIELDS.forEach(function(f) { entry[f] = clean[f]; });

    saveMeta();
    console.log('  Saved. type=' + clean.episode_type + ' tone=' + clean.tone + ' difficulty=' + clean.difficulty_level + ' evergreen=' + clean.evergreen);
    done++;

    if (done + failed < queue.length) await sleep(DELAY_MS);
  }

  console.log('\nDone. ' + done + ' generated, ' + failed + ' failed.');
  if (failed > 0) console.log('Re-run to retry failed episodes (auto-calc fields were saved).');
}

main().catch(function(err) {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
