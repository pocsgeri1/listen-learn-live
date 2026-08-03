#!/usr/bin/env node
// tools/sort-by-timestamp.js
//
// One-off retroactive fix: re-sorts concepts.json so that within each
// episode collection, concepts appear in chronological order (timestamp
// ascending, nulls last). Composite score is the tiebreaker within the
// same second. Concept IDs and all other fields are untouched.
//
// Safe to re-run: idempotent. Already-sorted collections are not moved.
//
// Usage:
//   node tools/sort-by-timestamp.js [--dry-run]
//
//   --dry-run  Print a summary of what would change without writing the file.
//
// After running, commit with:
//   ./ep-commit.sh "v2.71 - retroactive sort concepts by timestamp within collections"

const fs = require('fs');
const path = require('path');

const CONCEPTS_PATH = path.join(__dirname, '..', 'concepts.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Sort comparator: timestamp asc, nulls last; composite desc as tiebreaker
function conceptComparator(a, b) {
  const aTs = a.timestamp != null ? a.timestamp : Infinity;
  const bTs = b.timestamp != null ? b.timestamp : Infinity;
  if (aTs !== bTs) return aTs - bTs;
  const aC = (a.scores && a.scores.composite != null) ? a.scores.composite : 0;
  const bC = (b.scores && b.scores.composite != null) ? b.scores.composite : 0;
  return bC - aC;
}

function main() {
  const raw = fs.readFileSync(CONCEPTS_PATH, 'utf-8');
  const concepts = JSON.parse(raw);

  if (!Array.isArray(concepts)) {
    console.error('concepts.json is not an array. Aborting.');
    process.exit(1);
  }

  // Group concepts by collection_id, preserving the order collections first appear
  const collectionOrder = [];
  const byCollection = new Map();

  for (const c of concepts) {
    const col = c.collection_id != null ? c.collection_id : '__null__';
    if (!byCollection.has(col)) {
      collectionOrder.push(col);
      byCollection.set(col, []);
    }
    byCollection.get(col).push(c);
  }

  let totalMoved = 0;
  const sorted = [];

  for (const col of collectionOrder) {
    const group = byCollection.get(col);
    const original = group.map(c => c.id);

    // Sort within this collection
    const sortedGroup = [...group].sort(conceptComparator);
    const reordered = sortedGroup.map(c => c.id);

    // Count how many changed position
    let moved = 0;
    for (let i = 0; i < original.length; i++) {
      if (original[i] !== reordered[i]) moved++;
    }

    if (moved > 0) {
      totalMoved += moved;
      const colLabel = col === '__null__' ? 'no collection' : `collection ${col}`;
      console.log(`${colLabel}: ${group.length} concepts, ${moved} reordered`);
      if (DRY_RUN) {
        // Show first 5 position changes
        let shown = 0;
        for (let i = 0; i < original.length && shown < 5; i++) {
          if (original[i] !== reordered[i]) {
            const c = sortedGroup[i];
            console.log(`  pos ${i}: id=${c.id} ts=${c.timestamp} "${c.term}"`);
            shown++;
          }
        }
      }
    }

    sorted.push(...sortedGroup);
  }

  console.log(`\nTotal concepts: ${concepts.length}`);
  console.log(`Concepts reordered: ${totalMoved}`);

  if (totalMoved === 0) {
    console.log('Already fully sorted. Nothing to write.');
    return;
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No file written. Remove --dry-run to apply.');
    return;
  }

  fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log('\nconcepts.json written. Commit with:');
  console.log('  ./ep-commit.sh "v2.71 - sort concepts chronologically within collections"');
}

main();
