#!/usr/bin/env node
// tools/check-fields.js
//
// Fast pass/fail checker for draft field rewrites — computes word/char/
// sentence counts and scans for banned patterns instead of hand-counting.
// Mirrors the hard rules in docs/{hook,plain,analogy,prompt}-style-guide.md
// and docs/concept-rewrite-prompt.md's "Field rules — quick reference".
//
// This is a MECHANICAL check only. It catches objective, rule-based
// violations (length, em-dashes, banned openers/phrases, sentence count,
// jargon). It cannot judge: image quality, cross-field repetition of a
// scenario/image, whether an analogy's logic actually transfers, or
// whether a term overlaps a hook in spirit but not literal words. Still
// run the diagnosis + cross-field check by eye — this just removes the
// counting from that process.
//
// Usage:
//   node tools/check-fields.js drafts.json
//   echo '{"id":184,"hook":"...","plain":"...","analogy":"...","prompt":"..."}' | node tools/check-fields.js
//   node tools/check-fields.js '{"hook":"..."}'   # inline JSON as first arg
//
// Input: a single object OR an array of objects. Each object may have any
// subset of: id, term, hook, plain, analogy, prompt. Missing fields are
// skipped (not flagged).
//
// Exit code: 0 if everything passes, 1 if any field fails.

const fs = require('fs');

const HOOK_TARGET = [8, 12];
const HOOK_CEILING = 14;
const PLAIN_WORD_CEILING = 55;
const PLAIN_CHAR_CEILING = 350;
const ANALOGY_TARGET = [10, 18];
const ANALOGY_CEILING = 20;
const PROMPT_SOFT_CEILING = 40;

const JARGON = ['utilize', 'facilitate', 'phenomenon', 'paradigm', 'cognitive',
  'epistemological', 'heuristic', 'non-local', 'empirical', 'nuanced',
  'salient', 'synergy', 'leverage', 'framework', 'delineate', 'modality',
  'instantiate', 'tranche', 'desensitize', 'acclimation', 'incremental'];

const UNIVERSAL_BANNED = [
  { re: /—/, label: 'em-dash' },
  { re: /\byou'?re not\b.{0,40}\byou'?re\b/i, label: "'you're not X, you're Y'" },
  { re: /\bit'?s not\b.{0,40}\bit'?s\b/i, label: "'it's not X, it's Y'" },
  { re: /most people don'?t realiz/i, label: "'most people don't realize'" },
  { re: /here'?s the thing/i, label: "'here's the thing'" },
];

const HOOK_BANNED = [
  { re: /\bgame[- ]changing\b/i, label: "'game-changing'" },
  { re: /\ba new era of\b/i, label: "'a new era of'" },
  { re: /\beverything shifted\b/i, label: "'everything shifted'" },
  { re: /^[a-z]+ing\s+\w+.*\.$/i, label: 'possible bare -ing opener (verify by eye)' },
];

const ANALOGY_BANNED_OPENERS = ["it's like", 'think of it as', 'imagine', 'picture'];
const ANALOGY_TAIL_PHRASES = ['which means', 'just like', 'in the same way', 'this is why'];

const PLAIN_BANNED_OPENERS = [/^[a-z\s]+ is when\b/i, /^[a-z\s]+ refers to\b/i];

const PROMPT_BANNED_OPENERS = ['have you ever', 'think about', 'think of', 'reflect on', 'consider'];

function wordCount(s) {
  return s ? s.trim().split(/\s+/).filter(Boolean).length : 0;
}

function sentenceCount(s) {
  if (!s) return 0;
  const trimmed = s.trim();
  const matches = trimmed.match(/[.!?]+(?=\s|["')]*\s|["')]*$)/g) || [];
  return Math.max(matches.length, 1);
}

function triadCheck(s) {
  // Heuristic: three comma-separated items followed by end of clause, or
  // "X, Y, and Z" / "X, Y and Z" pattern.
  if (!s) return false;
  return /\b\w[\w'-]*,\s*\w[\w'-]*,\s*(?:and\s+)?\w[\w'-]*\b/.test(s);
}

function scanUniversal(text) {
  const out = [];
  for (const { re, label } of UNIVERSAL_BANNED) {
    if (re.test(text)) out.push(label);
  }
  return out;
}

function checkHook(hook) {
  if (hook == null) return null;
  const hard = [], warn = [];
  const w = wordCount(hook);
  const sc = sentenceCount(hook);
  if (w > HOOK_CEILING) hard.push(`${w} words > ${HOOK_CEILING} hard ceiling`);
  else if (w < HOOK_TARGET[0] || w > HOOK_TARGET[1]) warn.push(`${w} words (target ${HOOK_TARGET[0]}-${HOOK_TARGET[1]}, within ${HOOK_CEILING} ceiling)`);
  if (sc > 1) hard.push(`${sc} sentences — must be exactly 1 (v2.1: no two-clause exception)`);
  hard.push(...scanUniversal(hook));
  for (const { re, label } of HOOK_BANNED) if (re.test(hook)) warn.push(label);
  if (triadCheck(hook)) warn.push('possible triad of three (verify by eye)');
  return { field: 'hook', value: hook, words: w, sentences: sc, pass: hard.length === 0, hard, warn };
}

function checkPlain(plain) {
  if (plain == null) return null;
  const hard = [], warn = [];
  const w = wordCount(plain);
  const c = plain.length;
  const sc = sentenceCount(plain);
  if (w > PLAIN_WORD_CEILING) hard.push(`${w} words > ${PLAIN_WORD_CEILING} ceiling`);
  if (c > PLAIN_CHAR_CEILING) hard.push(`${c} chars > ${PLAIN_CHAR_CEILING} ceiling`);
  if (sc > 3) warn.push(`${sc} sentences (3 only if mechanism genuinely needs it — verify)`);
  hard.push(...scanUniversal(plain));
  for (const re of PLAIN_BANNED_OPENERS) if (re.test(plain.trim())) hard.push("banned opener: 'X is when/refers to'");
  const found = JARGON.filter(j => new RegExp(`\\b${j}\\b`, 'i').test(plain));
  if (found.length) hard.push(`jargon: ${found.join(', ')}`);
  if (/\bwhy isn'?t\b.*\?/i.test(plain)) warn.push('possible rhetorical-question-then-answer pattern');
  if (triadCheck(plain)) warn.push('possible triad of three (verify by eye)');
  return { field: 'plain', value: plain, words: w, chars: c, sentences: sc, pass: hard.length === 0, hard, warn };
}

function checkAnalogy(analogy) {
  if (analogy == null) return null;
  const hard = [], warn = [];
  const w = wordCount(analogy);
  const sc = sentenceCount(analogy);
  if (w > ANALOGY_CEILING) hard.push(`${w} words > ${ANALOGY_CEILING} hard ceiling`);
  else if (w < ANALOGY_TARGET[0] || w > ANALOGY_TARGET[1]) warn.push(`${w} words (target ${ANALOGY_TARGET[0]}-${ANALOGY_TARGET[1]}, within ${ANALOGY_CEILING} ceiling)`);
  if (sc > 2) warn.push(`${sc} sentences (2 allowed only if 2nd adds new angle — verify)`);
  hard.push(...scanUniversal(analogy));
  const al = analogy.toLowerCase().trim();
  for (const o of ANALOGY_BANNED_OPENERS) if (al.startsWith(o)) hard.push(`banned opener: '${o}'`);
  for (const t of ANALOGY_TAIL_PHRASES) if (al.includes(t)) warn.push(`explanation tail: '${t}'`);
  if (triadCheck(analogy)) warn.push('possible triad of three (verify by eye)');
  return { field: 'analogy', value: analogy, words: w, sentences: sc, pass: hard.length === 0, hard, warn };
}

function checkPrompt(prompt) {
  if (prompt == null) return null;
  const hard = [], warn = [];
  const w = wordCount(prompt);
  if (w > PROMPT_SOFT_CEILING) warn.push(`${w} words > ~${PROMPT_SOFT_CEILING} soft ceiling — likely hiding a second question`);
  hard.push(...scanUniversal(prompt));
  const pl = prompt.toLowerCase().trim();
  for (const o of PROMPT_BANNED_OPENERS) if (pl.startsWith(o)) hard.push(`banned opener: '${o}'`);
  return { field: 'prompt', value: prompt, words: w, pass: hard.length === 0, hard, warn };
}

function checkTerm(term, hook) {
  if (term == null) return null;
  const hard = [], warn = [];
  const w = wordCount(term);
  const wHyphenAware = wordCount(term.replace(/-/g, ' '));
  if (wHyphenAware < 2 || wHyphenAware > 5) warn.push(`${w} words (target 2-5; hyphen-aware count ${wHyphenAware})`);
  if (term !== toTitleCase(term) && !/[A-Z]/.test(term)) warn.push('not Title Case');
  hard.push(...scanUniversal(term));
  if (hook) {
    const stop = new Set(['the', 'a', 'an', 'of', 'to', 'in', 'on', 'for', 'and', 'or',
      'your', 'you', 'is', 'are', 'it', 'its', 'that', 'this', 'with', 'when', 'not']);
    const strip = s => new Set((s || '').split(/\s+/).map(x => x.replace(/[.,'"]/g, '').toLowerCase()).filter(x => x && !stop.has(x)));
    const overlap = [...strip(term)].filter(w2 => strip(hook).has(w2));
    if (overlap.length >= 2) warn.push(`overlaps hook: ${overlap.join(', ')} (verify — may be false positive)`);
  }
  return { field: 'term', value: term, words: w, pass: hard.length === 0, hard, warn };
}

function toTitleCase(s) {
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function checkConcept(c) {
  const results = [
    checkTerm(c.term, c.hook),
    checkHook(c.hook),
    checkPlain(c.plain),
    checkAnalogy(c.analogy),
    checkPrompt(c.prompt),
  ].filter(Boolean);
  return { id: c.id, results };
}

function printReport(items) {
  let anyFail = false;
  let warnCount = 0;
  for (const item of items) {
    const label = item.id != null ? `ID ${item.id}` : '(no id)';
    console.log(`\n=== ${label} ===`);
    for (const r of item.results) {
      const status = r.pass ? 'PASS' : 'FAIL';
      if (!r.pass) anyFail = true;
      warnCount += r.warn.length;
      const meta = [
        r.words != null ? `${r.words}w` : null,
        r.chars != null ? `${r.chars}c` : null,
        r.sentences != null ? `${r.sentences}s` : null,
      ].filter(Boolean).join(' ');
      console.log(`  ${status}  ${r.field.padEnd(8)} ${meta}`);
      for (const iss of r.hard) console.log(`        HARD FAIL - ${iss}`);
      for (const iss of r.warn) console.log(`        warn      - ${iss}`);
    }
  }
  console.log(`\n${anyFail ? 'FAIL' : 'PASS'} — ${items.length} concept(s) checked, ${warnCount} warning(s) to eyeball.`);
  return anyFail;
}

function main() {
  const arg = process.argv[2];
  let raw;
  if (arg && fs.existsSync(arg)) {
    raw = fs.readFileSync(arg, 'utf8');
  } else if (arg) {
    raw = arg;
  } else {
    raw = fs.readFileSync(0, 'utf8'); // stdin
  }
  const data = JSON.parse(raw);
  const arr = Array.isArray(data) ? data : [data];
  const items = arr.map(checkConcept);
  const anyFail = printReport(items);
  process.exit(anyFail ? 1 : 0);
}

main();
