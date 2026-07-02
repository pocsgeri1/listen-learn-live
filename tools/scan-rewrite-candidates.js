#!/usr/bin/env node
// tools/scan-rewrite-candidates.js
//
// Scans concepts.json for editorial rewrite candidates and writes
// rewrite-candidates.json, ranked worst-first. Mirrors the mechanical
// portion of the self-check rules in docs/concept-rewrite-prompt.md
// (word-count ceilings, em-dash ban, banned openers/patterns, jargon list).
// This catches the objective, rule-based violations only — it does not
// (and can't reliably) judge subjective quality, so a concept with zero
// flags here can still be a legitimate human rewrite candidate, and a
// flagged field is a candidate for review, not an automatic rewrite.
//
// Always excludes:
//   - every id in rewrite-concepts.json's `history` (already patched)
//   - every id in rewrite-concepts.json's `approved` (mid-batch, not yet
//     patched — regenerating this file mid-batch must never re-surface
//     concepts currently being worked on)
//
// Usage:
//   node tools/scan-rewrite-candidates.js
//   node tools/scan-rewrite-candidates.js --limit 150   # default 100

const fs = require('fs');
const path = require('path');

const CONCEPTS_PATH = path.join(__dirname, '..', 'concepts.json');
const REWRITE_STATE_PATH = path.join(__dirname, '..', 'rewrite-concepts.json');
const OUT_PATH = path.join(__dirname, '..', 'rewrite-candidates.json');

const limitArgIdx = process.argv.indexOf('--limit');
const LIMIT = limitArgIdx !== -1 ? parseInt(process.argv[limitArgIdx + 1], 10) : 100;

const HOOK_CEILING = 14;
const PLAIN_CEILING = 55;
const ANALOGY_CEILING = 25;

const JARGON = ['utilize', 'facilitate', 'paradigm', 'cognitive', 'heuristic',
  'leverage', 'framework', 'delineate', 'modality', 'nuanced', 'salient',
  'empirical', 'epistemological', 'acclimation', 'incremental', 'tranche'];

const ANALOGY_BANNED_OPENERS = ["it's like", 'think of it as', 'imagine', 'picture'];
const ANALOGY_TAIL_PHRASES = ['which means', 'just like', 'in the same way', 'this is why'];
const HOOK_BANNED = ["you're not", "it's not", "most people don't realize", "here's the thing"];

function wordCount(s) {
  return s ? s.trim().split(/\s+/).filter(Boolean).length : 0;
}

function stopwordStrip(s) {
  const stop = new Set(['the', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'and',
    'or', 'your', 'you', 'is', 'are', 'it', 'its', 'that', 'this', 'with',
    'when', 'not']);
  return new Set(
    (s || '').split(/\s+/)
      .map(w => w.replace(/[.,'"]/g, '').toLowerCase())
      .filter(w => w && !stop.has(w))
  );
}

function scanConcept(c) {
  const flags = [];
  const hook = c.hook || '';
  const plain = c.plain || '';
  const analogy = c.analogy || '';
  const term = c.term || '';

  const fullText = [hook, plain, analogy, c.prompt || ''].join(' ');
  const emDash = (fullText.match(/—/g) || []).length;
  if (emDash) flags.push(`em-dash x${emDash}`);

  const hw = wordCount(hook);
  const pw = wordCount(plain);
  const aw = wordCount(analogy);

  if (hw > HOOK_CEILING) flags.push(`hook ${hw}w`);
  if (pw > PLAIN_CEILING) flags.push(`plain ${pw}w`);
  if (aw > ANALOGY_CEILING) flags.push(`analogy ${aw}w`);

  const hl = hook.toLowerCase();
  for (const b of HOOK_BANNED) {
    if (hl.includes(b)) flags.push(`hook banned pattern: '${b}'`);
  }

  const al = analogy.toLowerCase().trim();
  for (const o of ANALOGY_BANNED_OPENERS) {
    if (al.startsWith(o)) flags.push(`analogy banned opener: '${o}'`);
  }
  for (const t of ANALOGY_TAIL_PHRASES) {
    if (al.includes(t)) flags.push(`analogy explanation tail: '${t}'`);
  }

  const pl = plain.toLowerCase().trim();
  if (/^[a-z\s]+ is when\b/.test(pl) || /^[a-z\s]+ refers to\b/.test(pl)) {
    flags.push("plain opener: 'X is when/refers to'");
  }
  const foundJargon = JARGON.filter(j => new RegExp(`\\b${j}\\b`).test(pl));
  if (foundJargon.length) flags.push(`plain jargon: ${foundJargon.join(', ')}`);

  const overlap = [...stopwordStrip(term)].filter(w => stopwordStrip(hook).has(w));
  if (overlap.length >= 2) flags.push(`term/hook overlap: ${overlap.join(', ')}`);

  // length_score: rough proxy for "how far over the ceilings, combined" —
  // used only for sort order, not as a pass/fail signal on its own.
  const lengthScore = Math.max(0, hw - HOOK_CEILING) +
    Math.max(0, pw - PLAIN_CEILING) * 0.4 +
    Math.max(0, aw - ANALOGY_CEILING) * 0.6;

  return { flags, hw, pw, aw, emDash, lengthScore };
}

function main() {
  const concepts = JSON.parse(fs.readFileSync(CONCEPTS_PATH, 'utf8'));
  const state = fs.existsSync(REWRITE_STATE_PATH)
    ? JSON.parse(fs.readFileSync(REWRITE_STATE_PATH, 'utf8'))
    : { history: [], approved: [] };

  const doneIds = new Set(
    (state.history || []).flatMap(batch => batch.ids || [])
  );
  const inFlightIds = new Set((state.approved || []).map(a => a.id));
  const excludeIds = new Set([...doneIds, ...inFlightIds]);

  const candidates = [];
  for (const c of concepts) {
    if (excludeIds.has(c.id)) continue;
    const { flags, hw, pw, aw, emDash, lengthScore } = scanConcept(c);
    if (!flags.length) continue;
    candidates.push({
      id: c.id,
      term: c.term,
      length_score: Math.round(lengthScore * 10) / 10,
      em_dash: emDash,
      hw, pw, aw,
      flags,
    });
  }

  candidates.sort((a, b) => (b.length_score - a.length_score) || (b.em_dash - a.em_dash));
  const top = candidates.slice(0, LIMIT);

  const out = {
    generated_from: `concepts.json (${concepts.length} total concepts, scanned ${new Date().toISOString().slice(0, 10)})`,
    excludes_done_ids: [...doneIds].sort((a, b) => a - b),
    excludes_in_flight_ids: [...inFlightIds].sort((a, b) => a - b),
    sort: 'length_score desc, then em_dash desc',
    candidates: top,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n');
  console.log(`Scanned ${concepts.length} concepts.`);
  console.log(`Excluded ${doneIds.size} done + ${inFlightIds.size} in-flight.`);
  console.log(`Found ${candidates.length} flagged, wrote top ${top.length} to rewrite-candidates.json.`);
  if (candidates.length === 0) {
    console.log('No candidates left — every remaining concept passes the mechanical checks. Time for a human pass or raise the bar.');
  }
}

main();
