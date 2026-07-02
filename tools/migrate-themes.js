#!/usr/bin/env node
// tools/migrate-themes.js
//
// One-time migration: replace the retired 101-116 LLM-assigned themes with
// the new 201-206 deterministic themes (Money & Power, Mind & Meaning,
// Self & Signal, Connection, Body & Evidence, Making & Building) across the
// whole concept library.
//
// GRANDFATHER RULE (decided with Gergely, 2026-07-02): none of the existing
// legacy concepts have a scores.composite value (that field only exists on
// concepts extracted by the newer scored pipeline). Gating theme assignment
// on composite >= 8.0 for all of them would zero out every legacy concept's
// theme. Instead: concepts with NO composite score are assigned a theme by
// category alone, no quality gate. Concepts that DO have a composite score
// still go through the normal >= 8.0 gate — same logic as
// api/publish-batch.js's computeCuratedCollectionIds(). If you change the
// gate or the category map there, change it here too (kept in sync by hand,
// there are only two copies).
//
// Usage:
//   node tools/migrate-themes.js            # dry run, report only, no writes
//   node tools/migrate-themes.js --apply    # writes concepts.json in place

const fs = require('fs');
const path = require('path');

const CONCEPTS_PATH = path.join(__dirname, '..', 'concepts.json');
const COMPOSITE_THEME_THRESHOLD = 8.0;

// Each category belongs to exactly one theme (no overlap) — mirrors
// THEME_CATEGORY_MAP in api/publish-batch.js, inverted for per-concept lookup.
const CATEGORY_TO_THEME = {
  finance: 201, power: 201, business: 201,           // Money & Power
  thinking: 202, psychology: 202, philosophy: 202,   // Mind & Meaning
  identity: 203, language: 203,                      // Self & Signal
  relationships: 204, society: 204,                  // Connection
  health: 205, science: 205,                         // Body & Evidence
  creativity: 206, 'tech-ai': 206,                   // Making & Building
};

function computeNewThemeIds(concept) {
  const themeId = CATEGORY_TO_THEME[concept.category];
  if (!themeId) return []; // unmapped/unknown category — shouldn't happen, flagged in report

  const composite = concept.scores && typeof concept.scores.composite === 'number'
    ? concept.scores.composite
    : null;

  if (composite === null) {
    return [themeId]; // grandfather rule: no score to gate on
  }
  return composite >= COMPOSITE_THEME_THRESHOLD ? [themeId] : [];
}

function main() {
  const apply = process.argv.includes('--apply');
  const raw = fs.readFileSync(CONCEPTS_PATH, 'utf-8');
  const concepts = JSON.parse(raw);

  let changed = 0, unchanged = 0, wentEmpty = 0, gained = 0, unmappedCategory = 0;
  const oldThemeCounts = {};
  const newThemeCounts = {};
  const sampleChanges = [];
  const unmapped = [];

  for (const c of concepts) {
    const oldIds = Array.isArray(c.curated_collection_ids) ? c.curated_collection_ids.slice().sort() : [];
    const newIds = computeNewThemeIds(c).slice().sort();

    if (!CATEGORY_TO_THEME[c.category]) {
      unmappedCategory++;
      unmapped.push({ id: c.id, term: c.term, category: c.category });
    }

    oldIds.forEach(id => { oldThemeCounts[id] = (oldThemeCounts[id] || 0) + 1; });
    newIds.forEach(id => { newThemeCounts[id] = (newThemeCounts[id] || 0) + 1; });
    if (newIds.length === 0) newThemeCounts['none'] = (newThemeCounts['none'] || 0) + 1;
    if (oldIds.length === 0) oldThemeCounts['none'] = (oldThemeCounts['none'] || 0) + 1;

    const oldHad = oldIds.length > 0;
    const newHas = newIds.length > 0;
    const same = JSON.stringify(oldIds) === JSON.stringify(newIds);

    if (same) {
      unchanged++;
    } else {
      changed++;
      if (oldHad && !newHas) wentEmpty++;
      if (!oldHad && newHas) gained++;
      if (sampleChanges.length < 20) {
        sampleChanges.push({ id: c.id, term: c.term, category: c.category, old: oldIds, new: newIds });
      }
    }

    if (apply) {
      c.curated_collection_ids = computeNewThemeIds(c);
    }
  }

  console.log('=== Theme migration report ===');
  console.log('Mode:', apply ? 'APPLY (writing concepts.json)' : 'DRY RUN (no writes)');
  console.log('Total concepts:', concepts.length);
  console.log('Unchanged:', unchanged, '| Changed:', changed);
  console.log('  -> had a theme, now none:', wentEmpty);
  console.log('  -> had no theme, now has one:', gained);
  console.log('Unmapped categories (should be 0):', unmappedCategory);
  if (unmapped.length) console.log(unmapped.slice(0, 10));

  console.log('\nOld theme counts (101-116 legacy + none):');
  console.log(oldThemeCounts);
  console.log('\nNew theme counts (201-206 + none):');
  console.log(newThemeCounts);

  console.log('\nSample changes (up to 20):');
  sampleChanges.forEach(s => {
    console.log(`  #${s.id} "${s.term}" [${s.category}]: ${JSON.stringify(s.old)} -> ${JSON.stringify(s.new)}`);
  });

  if (apply) {
    fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(concepts, null, 2) + '\n');
    console.log('\nconcepts.json updated in place.');
  } else {
    console.log('\nDry run only, nothing written. Re-run with --apply once approved.');
  }
}

main();
