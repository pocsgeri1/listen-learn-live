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

const SYSTEM_PROMPT = `You are an editorial writer for Epistemic. Write six intelligence fields from podcast concept cards. Voice: opinionated friend, casual but sharp, like Rolling Stone covering an album.

OUTPUT: valid JSON only, no preamble, no markdown fences.
{
  "summary_style": "A",
  "summary": "...",
  "sharpest_line": "...",
  "tension": "...",
  "verdict_listen": ["fragment", "fragment", "fragment"],
  "verdict_skip": ["fragment", "fragment"],
  "vocab_vault": [{"word": "...", "definition": "...", "timestamp_seconds": null}]
}

---
HARD RULES — every field, no exceptions:
1. NO em dashes (—) anywhere. Rewrite any sentence that needs one.
2. NO "It's not X / it's Y" pattern or any variation: real problem is / it's really about / not X but Y.
3. NO triads: 3 adjectives, 3 parallel clauses, or 3 examples in a row. Two is fine.
4. summary P1 and sharpest_line must cover DIFFERENT ideas.

---
SUMMARY RULES:
- 110-125 words total. P1 max 40w, P2 max 70w, P3 max 25w. Count each paragraph. Delete if over — never compress.
- Exactly 3 paragraphs, \\n\\n between them.
- Max ONE colon in the entire summary. Count them. If you have two, remove one.
- P1 must NOT start with a guest or host name. Start with an observation, a claim, or a scene.
- Never "In this episode...". First names only after first mention.
- BANNED: "not X but Y" in any form ("not a culture war but a market failure" / "not advice but permission" / "not X, it's Y") — rewrite as a positive claim instead.
- BANNED words: tension / framework / checklist / dives deep / unpacks / explores / breaks down / fascinating / insightful / thought-provoking / compelling / powerful.
- BEFORE RETURNING: count P1 words, P2 words, P3 words, total words, colons, P3 sentences. Fix anything out of range.

PICK ONE STYLE. Declare in summary_style. Styles A and B are most common. Do not default to C.
A = guest personality or debate drives the episode.
B = one counterintuitive premise the whole conversation orbits.
C = the real subject is larger or stranger than stated; zoom-out reveals something wry. Only when genuinely surprising.
D = a clear thesis invites genuine pushback; a smart skeptic walks in unconvinced and leaves shifted. Only when the episode directly addresses a strong objection.

STYLE A — P1 (~35w): what episode does or refuses, open with attitude. P2 (~60w): arc as movement, not a topic list. P3: EXACTLY 3 sentences, different lengths and structures, ends on feeling or question.

STYLE B — P1 (~35w): central premise as provocation, makes reader double-take. P2 (~65w): ONE concrete detail carries the whole paragraph, not a list, not the sharpest_line. P3: EXACTLY 2 sentences, effect on listener, both short, both land hard.

STYLE C — P1 (~30w): bold claim about the world, not about the episode, makes reader blink. P2 (~70w): ONE detail from concepts as evidence, ONE only, not the sharpest_line. P3: EXACTLY 2 sentences, kicker or question that reframes P1, ends sharp.

STYLE D — P1 (~30w): the strongest objection a smart person brings into this episode. Not dismissive — the best counter-argument. Makes skeptical readers feel seen. P2 (~65w): ONE specific thing from the episode that made the objection harder to hold. Concrete. Not the sharpest_line. P3: EXACTLY 2 sentences. Where the skeptic lands — not converted, but genuinely shifted. Ends sharp.

CORRECT STYLE A EXAMPLE (episode: "21 Harsh Truths" — Chris Williamson + Mark Manson):
Mark Manson and Chris spend two hours refusing to be encouraging. The topics are familiar but the framing is not: these aren't things you need to learn, they're things you already know and keep finding reasons to ignore.

The conversation starts personal and gradually pulls back to something bigger. Modern life, they argue, removed all the friction that used to make things feel like they mattered. Nobody warned you that would happen. Nobody warned you that ease was part of the problem.

You will recognise yourself in at least six of these. Probably more. Some of them will stay uncomfortable past the episode.

CORRECT STYLE B EXAMPLE (episode: "Something Is Very Wrong With Modern Life" — Chris Williamson + Arthur Brooks):
Success, according to Arthur Brooks, is the most underrated trap in modern life. The skills that built your career are the same ones quietly making you rigid under pressure and allergic to the uncertainty that actual meaning requires.

Brooks draws one line: fluid intelligence, the raw problem-solving speed that made your career, peaks around forty and starts declining. Crystallized intelligence, the wisdom built from accumulated experience, keeps growing if you let it. Most high achievers never make the switch because the rewards kept coming long after the engine stopped. By the time they notice, they have optimized into a life that looks impressive and feels hollow.

You will recognise the trade-off. You already made it.

CORRECT STYLE C EXAMPLE (episode: "Fix Marketing" — Rory Sutherland + Tom Goodwin):
Every organization eventually becomes a machine for killing its own best ideas. The only question is how fast.

Rory Sutherland and Tom Goodwin spend the episode providing evidence. Process worship kills serendipity, which everyone suspects but nobody can measure. Attribution fraud lets ad platforms claim credit for sales that were already happening. Together they describe a system that has optimized itself past the point where interesting things can survive, confusing the flat part of the adoption curve with proof that something does not work.

Which raises the question nobody in your organization wants to answer: what would you greenlight if you could not justify it with data?

CORRECT STYLE D EXAMPLE (episode: "Something Is Very Wrong With Modern Life" — Chris Williamson + Arthur Brooks):
The premise sounds like something printed on a motivational calendar: mid-life doesn't have to mean decline, it's actually a transition. You have heard this before, usually from people who needed it to be true.

Brooks has one piece of evidence that doesn't come from self-help. Fluid intelligence, the processing speed that built your career, peaks around forty and starts declining. That part is not opinion. What he adds is that crystallized intelligence, built from experience and judgment, keeps growing, but only if you stop pretending the first kind isn't fading. The honesty of the diagnosis is what makes the rest feel less like a pep talk.

You don't leave convinced the second half is better. You leave less convinced it's worse.

---
SHARPEST_LINE: one sentence, most quotable, works out of context, provocative beats profound, write as if said verbatim by host or guest, must NOT overlap with summary P1.

TENSION: max 15 words, format "[Force A] vs. [Force B]", specific to this episode.

VERDICT:
verdict_listen: JSON array of 2-3 strings, each MUST start with "you've ever..." / "you work in..." / "you're the kind of person who..."
verdict_skip: JSON array of 1-2 strings, honest enough to be believed.

VOCAB VAULT: 5-7 words or short phrases worth owning, especially for non-native speakers. NOT concept card titles. Raw vocabulary only: Latin phrases, academic terms, expressions that compress a complex idea. definition: plain English, max 15 words. timestamp_seconds: always null.`;

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

Choose the best summary style for this episode and write all six intelligence fields.`;
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
    const required = ['summary_style', 'summary', 'sharpest_line', 'tension', 'verdict_listen', 'verdict_skip', 'vocab_vault'];
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
    metaFile.episodes[id].summary_style  = result.summary_style;
    metaFile.episodes[id].summary        = result.summary;
    metaFile.episodes[id].sharpest_line  = result.sharpest_line;
    metaFile.episodes[id].tension        = result.tension;
    metaFile.episodes[id].verdict_listen = result.verdict_listen;
    metaFile.episodes[id].verdict_skip   = result.verdict_skip;
    metaFile.episodes[id].vocab_vault    = result.vocab_vault;

    // Save immediately after each episode — crash-safe
    saveMeta();
    console.log(`  Saved. Style ${result.summary_style}. Summary: "${result.summary.slice(0, 80)}..."`);
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
