#!/usr/bin/env node
// tools/categorize-vocab.js
// Backfills `category` (and sets `category_alt: null`) on all existing vocab_vault
// entries in episode_meta.json that are missing a category.
//
// Source: episode_meta.json only — no concepts.json or collections.json needed
// Output: writes back to episode_meta.json after EACH episode — crash-safe
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... node tools/categorize-vocab.js
//
// Options:
//   --force     Re-categorize even if words already have a category
//   --id 11     Only process one specific episode id
//   --dry-run   Print prompts without calling API
//
// Resume safety: episodes where all words already have a category are skipped automatically.

'use strict';

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT      = path.join(__dirname, '..');
const META_PATH = path.join(ROOT, 'episode_meta.json');

const MODEL      = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1500;
const DELAY_MS   = 1500;
const TIMEOUT_MS = 45000;

const VALID_CATEGORIES = new Set([
  'Small Talk', 'Smartypants', 'Business', 'Science', 'Mind & People',
]);

// ── Args ─────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const FORCE   = args.includes('--force');
const DRY_RUN = args.includes('--dry-run');
const ONLY_ID = (() => { const i = args.indexOf('--id'); return i >= 0 ? args[i + 1] : null; })();

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY && !DRY_RUN) {
  console.error('ERROR: ANTHROPIC_API_KEY not set.');
  process.exit(1);
}

// ── Load data ─────────────────────────────────────────────────────────────────

const metaFile = JSON.parse(fs.readFileSync(META_PATH, 'utf8'));

// ── Prompt ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a vocabulary categorizer for Epistemic, a podcast learning app.

You will receive a list of words and expressions extracted from a podcast episode.
Assign each word exactly one category from the list below.

VALID CATEGORIES:
- "Small Talk" — casual, everyday language; used in social settings, bars, friendly chats; accessible to any non-native speaker
- "Smartypants" — academic, philosophical, or intellectual; humanities lecture register; signals serious reading
- "Business" — professional and organizational; lives in meetings, pitch decks, strategy docs, and business books
- "Science" — hard or applied sciences; biology, neuroscience, economics, statistics, tech; researcher register
- "Mind & People" — inner life, mental states, self-development, interpersonal dynamics, emotional intelligence; therapy or self-help register

DECISION RULES (apply in order):
1. Pick the category where a non-native English-speaking professional (25-40) would most likely FIRST encounter this word in real life.
2. Tie-break: pick the narrower register.
3. If genuinely no category fits, use null.

OUTPUT: valid JSON array only, no preamble, no markdown.
Each element: { "word": "...", "category": "..." }
Preserve the exact word string. category must be one of the 5 values above, or null.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function callClaude(words) {
  const userMessage = `Categorize these ${words.length} words:\n\n` +
    words.map((w, i) => `${i + 1}. ${w.word} — ${w.definition}`).join('\n');

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
        if (res.statusCode !== 200) return reject(new Error(`API ${res.statusCode}: ${data.slice(0, 300)}`));
        try {
          const parsed  = JSON.parse(data);
          const text    = parsed?.content?.[0]?.text || '';
          const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          resolve(JSON.parse(cleaned));
        } catch (e) {
          reject(new Error(`JSON parse failed: ${e.message}\nRaw: ${data.slice(0, 400)}`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Timed out')); });
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
  console.log(`\nEpistemic — Vocab Categorizer`);
  console.log(`Model: ${MODEL} | Force: ${FORCE} | Dry run: ${DRY_RUN} | Only ID: ${ONLY_ID ?? 'all'}\n`);

  const episodes = metaFile.episodes || {};
  let queue = [];

  for (const [id, entry] of Object.entries(episodes)) {
    if (ONLY_ID && id !== String(ONLY_ID)) continue;
    if (!Array.isArray(entry.vocab_vault) || entry.vocab_vault.length === 0) continue;

    const wordsNeedingCategory = FORCE
      ? entry.vocab_vault
      : entry.vocab_vault.filter(w => !w.category);

    if (wordsNeedingCategory.length > 0) {
      queue.push({ id, entry, words: wordsNeedingCategory });
    }
  }

  console.log(`Episodes to process: ${queue.length}`);
  if (queue.length === 0) {
    console.log('Nothing to do. Use --force to re-categorize existing entries.');
    return;
  }

  let done = 0, failed = 0;

  for (const { id, entry, words } of queue) {
    console.log(`\n[${done + failed + 1}/${queue.length}] Episode ${id} — ${words.length} words to categorize`);

    if (DRY_RUN) {
      console.log('  Words:', words.map(w => w.word).join(', '));
      done++;
      continue;
    }

    let result = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await callClaude(words);
        break;
      } catch (err) {
        console.error(`  Attempt ${attempt} failed: ${err.message}`);
        if (attempt < 2) { console.log('  Retrying in 5s...'); await sleep(5000); }
      }
    }

    if (!result || !Array.isArray(result)) {
      console.error(`  Skipping episode ${id} — both attempts failed.`);
      failed++;
      continue;
    }

    // Build lookup from result array
    const categoryMap = {};
    for (const item of result) {
      if (item.word) categoryMap[item.word] = item.category || null;
    }

    // Apply back to vocab_vault — only update words that were in the batch
    let updated = 0;
    entry.vocab_vault = entry.vocab_vault.map(w => {
      if (!(w.word in categoryMap)) return { ...w, category_alt: w.category_alt ?? null };
      const cat = categoryMap[w.word];
      const validCat = (cat && VALID_CATEGORIES.has(cat)) ? cat : null;
      if (cat && !VALID_CATEGORIES.has(cat)) {
        console.warn(`  WARN: Invalid category "${cat}" for "${w.word}" — set to null`);
      }
      updated++;
      return { ...w, category: validCat, category_alt: w.category_alt ?? null };
    });

    saveMeta();
    console.log(`  Saved. ${updated} words categorized.`);
    done++;

    if (done + failed < queue.length) await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${done} episodes categorized, ${failed} failed.`);
  if (failed > 0) console.log('Re-run to retry failed episodes.');
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
