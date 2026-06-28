#!/usr/bin/env node
// tools/generate-episode-intel.js
// Generates episode intelligence fields (summary, sharpest_line, tension,
// verdict_listen, verdict_skip, vocab_vault) for all episodes in episode_meta.json
// that don't yet have a summary.
//
// Source: concepts.json + collections.json (no transcript needed)
// Output: writes to episode_meta.json after EACH episode — safe to interrupt
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... node tools/generate-episode-intel.js
//
// Options:
//   --force          Re-generate even if summary already exists
//   --id 505         Only process one specific collection_id
//   --dry-run        Print prompts without calling API
//
// Resume safety: already-populated entries are skipped automatically.
// If it crashes mid-run, re-run — it picks up from where it stopped.

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..');
const CONCEPTS_PATH  = path.join(ROOT, 'concepts.json');
const COLLECTIONS_PATH = path.join(ROOT, 'collections.json');
const META_PATH      = path.join(ROOT, 'episode_meta.json');

const MODEL          = 'claude-haiku-4-5-20251001'; // cheap + fast for structured generation
const MAX_TOKENS     = 2000;
const DELAY_MS       = 2000;   // 2s between API calls — well within rate limits
const TIMEOUT_MS     = 60000;  // 60s per call — generous for haiku

const API_KEY = process.env.ANTHROPIC_API_KEY;

// ── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const FORCE    = args.includes('--force');
const DRY_RUN  = args.includes('--dry-run');
const ONLY_ID  = (() => { const i = args.indexOf('--id'); return i >= 0 ? parseInt(args[i+1]) : null; })();

// ── Load data ─────────────────────────────────────────────────────────────────

if (!API_KEY && !DRY_RUN) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable not set.');
  console.error('Run as: ANTHROPIC_API_KEY=sk-ant-... node tools/generate-episode-intel.js');
  process.exit(1);
}

const rawConcepts    = JSON.parse(fs.readFileSync(CONCEPTS_PATH, 'utf8'));
const rawCollections = JSON.parse(fs.readFileSync(COLLECTIONS_PATH, 'utf8'));
const metaFile       = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

const CONCEPTS    = rawConcepts.concepts || rawConcepts;
const COLLECTIONS = rawCollections.collections || rawCollections;

// Index concepts by collection_id
const conceptsByEpisode = {};
CONCEPTS.forEach(c => {
  if (c.collection_id == null) return;
  const key = String(c.collection_id);
  if (!conceptsByEpisode[key]) conceptsByEpisode[key] = [];
  conceptsByEpisode[key].push(c);
});

// Only process episode-type collections (not curated themes)
const episodeCollections = COLLECTIONS.filter(c => c.type === 'episode');

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an editorial writer for Epistemic, a learning platform. Your job is to write five episode intelligence fields based on the concept cards extracted from a podcast episode. You are writing from the concepts, not a transcript — so use what the concepts reveal about the conversation's themes, arcs, and tensions.

VOICE: opinionated friend, not neutral reporter. You have a take.

OUTPUT: Return ONLY valid JSON with exactly these five keys. No preamble, no markdown fences.

{
  "summary": "...",
  "sharpest_line": "...",
  "tension": "...",
  "verdict_listen": "...",
  "verdict_skip": "...",
  "vocab_vault": [{"word": "...", "definition": "...", "timestamp_seconds": null}]
}

SUMMARY RULES (80-120 words, 3 paragraphs separated by \\n\\n):
- P1: The angle — most surprising or charged thing about this episode. Name host and guest naturally, vary how you open. Never "In this episode..." Never start with the host/guest name as the first word.
- P2: The arc — written as movement, not a topic list. Something starts, shifts, lands somewhere.
- P3: Three short declarative sentences. None the same length. None the same structure. Ends on a feeling or question, not a recap.
- BANNED: em dashes, "It's not X it's Y" constructions, triads of any kind, parallel P3 sentences, "dives deep / unpacks / explores / breaks down", fascinating / insightful / thought-provoking / compelling

SHARPEST_LINE RULES:
- One sentence. The most quotable thing from this episode based on the concepts.
- Must work out of context. Provocative beats profound. Specific beats general.
- Write it as if it were said verbatim by the host or guest.

TENSION RULES:
- Max 15 words. The central intellectual friction of this episode.
- Format: "[Force A] vs. [Force B]" or a short declarative naming the contradiction.
- Must be specific to this episode — not a generic theme.

VERDICT RULES:
- verdict_listen: 2-3 short fragments. Each starts with "you've ever..." / "you work in..." / "you're the kind of person who...". Should feel like recognition.
- verdict_skip: 1-2 short fragments. Honest enough to be believed.

VOCAB VAULT RULES:
- 5-7 words or short phrases that appear in the concept cards that are unusually precise or worth owning.
- Especially useful for non-native English speakers.
- definition: one sentence, plain English, max 15 words.
- timestamp_seconds: always null (no transcript available).
- Skip common words. Only vocabulary worth deliberately learning.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildUserMessage(col, concepts) {
  const host = col.people && col.people.length > 0 ? col.people.join(' and ') : col.podcast || 'the host';
  const conceptLines = concepts.map(c =>
    `TERM: ${c.term}\nHOOK: ${c.hook}\nPLAIN: ${c.plain}`
  ).join('\n\n');

  return `EPISODE TITLE: ${col.title}
HOST / GUEST: ${host}
PODCAST: ${col.podcast || 'unknown'}
AIRED: ${col.aired_date || col.created_date || 'unknown'}
CONCEPT COUNT: ${concepts.length}

CONCEPTS EXTRACTED FROM THIS EPISODE:
${conceptLines}

Write the five episode intelligence fields based on these concepts.`;
}

function callClaude(userMessage) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const options = {
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

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`API ${res.statusCode}: ${data.slice(0, 300)}`));
        }
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.content?.[0]?.text || '';
          // Strip markdown fences if present
          const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          const result = JSON.parse(cleaned);
          resolve(result);
        } catch (e) {
          reject(new Error(`JSON parse failed: ${e.message}\nRaw: ${data.slice(0, 500)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${TIMEOUT_MS}ms`));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function saveMeta() {
  fs.writeFileSync(META_PATH, JSON.stringify(metaFile, null, 2), 'utf8');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nEpistemic — Episode Intel Generator`);
  console.log(`Model: ${MODEL}`);
  console.log(`Force: ${FORCE} | Dry run: ${DRY_RUN} | Only ID: ${ONLY_ID ?? 'all'}\n`);

  // Filter to episodes that need processing
  let queue = episodeCollections.filter(col => {
    if (ONLY_ID && col.id !== ONLY_ID) return false;
    const entry = metaFile.episodes && metaFile.episodes[String(col.id)];
    if (!entry) return true; // not in meta yet
    if (FORCE) return true;  // re-generate everything
    return entry.summary === null; // skip if already done
  });

  // Only process episodes that have at least some concepts
  queue = queue.filter(col => {
    const concepts = conceptsByEpisode[String(col.id)];
    return concepts && concepts.length >= 3;
  });

  console.log(`Episodes to process: ${queue.length}`);
  if (queue.length === 0) {
    console.log('Nothing to do. Use --force to re-generate existing entries.');
    return;
  }

  let done = 0;
  let failed = 0;

  for (const col of queue) {
    const id = String(col.id);
    const concepts = conceptsByEpisode[id] || [];
    console.log(`\n[${done + failed + 1}/${queue.length}] ${col.title} (id:${id}, ${concepts.length} concepts)`);

    const userMessage = buildUserMessage(col, concepts);

    if (DRY_RUN) {
      console.log('--- PROMPT PREVIEW ---');
      console.log(userMessage.slice(0, 400) + '...');
      done++;
      continue;
    }

    // Retry up to 2 times on failure
    let result = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await callClaude(userMessage);
        break;
      } catch (err) {
        console.error(`  Attempt ${attempt} failed: ${err.message}`);
        if (attempt < 2) {
          console.log('  Retrying in 5s...');
          await sleep(5000);
        }
      }
    }

    if (!result) {
      console.error(`  Skipping ${col.title} — both attempts failed. Will retry on next run.`);
      failed++;
      continue;
    }

    // Validate required fields
    const required = ['summary', 'sharpest_line', 'tension', 'verdict_listen', 'verdict_skip', 'vocab_vault'];
    const missing = required.filter(k => result[k] === undefined);
    if (missing.length > 0) {
      console.error(`  Missing fields: ${missing.join(', ')} — skipping.`);
      failed++;
      continue;
    }

    // Write to meta — preserve existing DNA and other fields
    if (!metaFile.episodes[id]) {
      metaFile.episodes[id] = { collection_id: parseInt(id), dna: {} };
    }
    metaFile.episodes[id].summary        = result.summary;
    metaFile.episodes[id].sharpest_line  = result.sharpest_line;
    metaFile.episodes[id].tension        = result.tension;
    metaFile.episodes[id].verdict_listen = result.verdict_listen;
    metaFile.episodes[id].verdict_skip   = result.verdict_skip;
    metaFile.episodes[id].vocab_vault    = result.vocab_vault;

    // Save immediately after each episode — crash-safe
    saveMeta();
    console.log(`  Saved. Summary: "${result.summary.slice(0, 80)}..."`);
    done++;

    // Rate limit delay between calls
    if (done + failed < queue.length) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone. ${done} generated, ${failed} failed (re-run to retry failed ones).`);
  if (failed > 0) console.log('Re-run the script — failed episodes are still null and will be picked up automatically.');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
