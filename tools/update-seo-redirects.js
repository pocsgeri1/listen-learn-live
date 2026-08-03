#!/usr/bin/env node
// tools/update-seo-redirects.js
// Epistemic SEO redirect helper — v1.0
//
// Run AFTER a concept rewrite session that includes term renames.
// Diffs old vs current concepts.json, finds renamed terms, and
// writes 301 redirect entries into vercel.json automatically.
//
// Usage:
//   node tools/update-seo-redirects.js <path-to-old-concepts.json>
//
// Example:
//   node tools/update-seo-redirects.js tools/concepts-backup.json
//
// Workflow:
//   1. Before a rewrite session: cp concepts.json tools/concepts-backup.json
//   2. Run rewrite session, update concepts.json as normal
//   3. After session: node tools/update-seo-redirects.js tools/concepts-backup.json
//   4. Review the output, then commit vercel.json + concepts.json together

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONCEPTS_FILE = path.join(ROOT, 'concepts.json');
const VERCEL_FILE = path.join(ROOT, 'vercel.json');

function slugify(term) {
  return term
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function zeroPad(id) {
  return String(id).padStart(3, '0');
}

function conceptSlug(concept) {
  return `${zeroPad(concept.id)}-${slugify(concept.term)}`;
}

function main() {
  const oldPath = process.argv[2];

  if (!oldPath) {
    console.error('✗ Usage: node tools/update-seo-redirects.js <path-to-old-concepts.json>');
    console.error('  Example: node tools/update-seo-redirects.js tools/concepts-backup.json');
    process.exit(1);
  }

  const resolvedOldPath = path.resolve(oldPath);

  if (!fs.existsSync(resolvedOldPath)) {
    console.error(`✗ Old concepts file not found: ${resolvedOldPath}`);
    console.error('  Run: cp concepts.json tools/concepts-backup.json BEFORE your rewrite session.');
    process.exit(1);
  }

  const oldConcepts = JSON.parse(fs.readFileSync(resolvedOldPath, 'utf8'));
  const newConcepts = JSON.parse(fs.readFileSync(CONCEPTS_FILE, 'utf8'));

  // Index both by ID for fast lookup
  const oldById = {};
  oldConcepts.forEach(c => { oldById[c.id] = c; });

  const newById = {};
  newConcepts.forEach(c => { newById[c.id] = c; });

  const redirectsToAdd = [];
  const removedIds = [];
  let unchanged = 0;

  for (const id of Object.keys(oldById)) {
    const old = oldById[id];
    const cur = newById[id];

    // Concept removed entirely or marked duplicate
    if (!cur) {
      removedIds.push({ id: old.id, term: old.term, oldSlug: conceptSlug(old) });
      continue;
    }

    // Term unchanged — skip
    if (old.term === cur.term) {
      unchanged++;
      continue;
    }

    // Term renamed — needs 301
    const oldSlug = conceptSlug(old);
    const newSlug = conceptSlug(cur);

    // Double-check slug actually changed (e.g. capitalisation-only changes that don't affect slug)
    if (oldSlug === newSlug) {
      unchanged++;
      continue;
    }

    redirectsToAdd.push({
      source: `/concepts/${oldSlug}`,
      destination: `/concepts/${newSlug}`,
      permanent: true,
      _note: `#${zeroPad(old.id)}: "${old.term}" → "${cur.term}"`,
    });
  }

  // Report
  console.log(`\n── Epistemic SEO Redirect Diff ──`);
  console.log(`  Concepts checked:   ${Object.keys(oldById).length}`);
  console.log(`  Unchanged:          ${unchanged}`);
  console.log(`  Renames found:      ${redirectsToAdd.length}`);
  console.log(`  Removed concepts:   ${removedIds.length}`);

  if (redirectsToAdd.length === 0 && removedIds.length === 0) {
    console.log(`\n✓ No URL changes detected. vercel.json not modified.\n`);
    return;
  }

  if (redirectsToAdd.length > 0) {
    console.log(`\n  Redirects to add:`);
    redirectsToAdd.forEach(r => console.log(`    ${r._note}\n    ${r.source} → ${r.destination}`));
  }

  if (removedIds.length > 0) {
    console.log(`\n  Removed concepts (no redirect added — manual review recommended):`);
    removedIds.forEach(r => console.log(`    #${zeroPad(r.id)} "${r.term}" — was at /concepts/${r.oldSlug}`));
    console.log(`  → Consider adding manual redirects for these to /category/[cat] or / if they had indexed traffic.`);
  }

  // Read and update vercel.json
  const vercel = JSON.parse(fs.readFileSync(VERCEL_FILE, 'utf8'));

  if (!vercel.redirects) vercel.redirects = [];

  // Merge: avoid duplicates by source URL
  const existingSources = new Set(vercel.redirects.map(r => r.source));
  let added = 0;
  let skipped = 0;

  for (const r of redirectsToAdd) {
    if (existingSources.has(r.source)) {
      console.log(`\n  ⚠ Already exists in vercel.json, skipping: ${r.source}`);
      skipped++;
      continue;
    }
    // Strip internal _note before writing
    vercel.redirects.push({ source: r.source, destination: r.destination, permanent: r.permanent });
    existingSources.add(r.source);
    added++;
  }

  // Write vercel.json with 2-space indent
  fs.writeFileSync(VERCEL_FILE, JSON.stringify(vercel, null, 2) + '\n', 'utf8');

  console.log(`\n✓ vercel.json updated — ${added} redirect(s) added, ${skipped} skipped (already present).`);
  console.log(`  Commit vercel.json together with concepts.json to deploy the redirects.\n`);
}

main();
