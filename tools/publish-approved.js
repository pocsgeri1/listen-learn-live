#!/usr/bin/env node
// tools/publish-approved.js
//
// Replaces the manual step of Make.com's "LLL — APPROVED → Batch Publish →
// Live" scenario. Triggered by the "Publish approved concepts" GitHub Action
// (Actions tab -> Run workflow), same one-click pattern as "hit run scenario"
// in Make.com used to be.
//
// What it does NOT change: the actual GitHub commit still happens inside
// /api/publish-batch.js on Vercel, exactly as before. This script only
// replaces the orchestration Make.com used to do — fetch Status=APPROVED
// rows from Airtable, POST them to the existing endpoint, write the result
// back to Airtable. Zero changes to concepts.json's commit logic, theme
// assignment, or scoring — all of that already lives in publish-batch.js.
//
// Required env vars (set as GitHub Actions repository secrets):
//   AIRTABLE_API_KEY   - same PAT already used elsewhere in the pipeline
//   AIRTABLE_BASE_ID   - same base as extract.html / extract-concepts.js
//   PUBLISH_SECRET     - MUST match the PUBLISH_SECRET env var already set
//                        on the Vercel project (publish-batch.js checks this)
// Optional:
//   AIRTABLE_TABLE     - defaults to "Concepts"
//   PUBLISH_URL        - defaults to https://epistemic.live/api/publish-batch

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || 'Concepts';
const PUBLISH_SECRET = process.env.PUBLISH_SECRET;
const PUBLISH_URL = process.env.PUBLISH_URL || 'https://epistemic.live/api/publish-batch';

const BATCH_SIZE = 100; // matches publish-batch.js's hard cap per call

function requireEnv() {
  const missing = [];
  if (!AIRTABLE_API_KEY) missing.push('AIRTABLE_API_KEY');
  if (!AIRTABLE_BASE_ID) missing.push('AIRTABLE_BASE_ID');
  if (!PUBLISH_SECRET) missing.push('PUBLISH_SECRET');
  if (missing.length) {
    console.error('Missing required secrets:', missing.join(', '));
    console.error('Add them under repo Settings -> Secrets and variables -> Actions.');
    process.exit(1);
  }
}

async function fetchApprovedRecords() {
  const records = [];
  let offset = null;
  const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`;
  do {
    const url = new URL(baseUrl);
    url.searchParams.set('filterByFormula', "{Status}='APPROVED'");
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);

    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Airtable fetch failed ${resp.status}: ${text.slice(0, 400)}`);
    }
    const data = await resp.json();
    records.push(...data.records);
    offset = data.offset || null;
  } while (offset);
  return records;
}

// Pass Airtable's own field names straight through — publish-batch.js's
// readField() helper already knows how to read this exact casing (it was
// built to accept Make.com's raw aggregator output, which has the same
// shape). `ID` carries the Airtable record id so results can be matched
// back to the row for the Status/Publish Error write-back.
function recordToPayload(record) {
  const f = record.fields || {};
  return {
    ID: record.id,
    Term: f['Term'],
    Category: f['Category'],
    Source: f['Source'],
    Hook: f['Hook'],
    Plain: f['Plain'],
    Analogy: f['Analogy'],
    Prompt: f['Prompt'],
    'Collection ID': f['Collection ID'],
    Timestamp: f['Timestamp'],
    'Universality Score': f['Universality Score'],
    'Actionability Score': f['Actionability Score'],
    'Novelty Score': f['Novelty Score'],
    'Conversation Value Score': f['Conversation Value Score'],
    "Editor's Pick": f["Editor's Pick"],
    'Related IDs': f['Related IDs'],
    'Extraction Prompt Version': f['Extraction Prompt Version'],
  };
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function publishBatch(concepts) {
  const resp = await fetch(PUBLISH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-publish-secret': PUBLISH_SECRET,
    },
    body: JSON.stringify({ concepts }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(`publish-batch call failed ${resp.status}: ${JSON.stringify(data).slice(0, 400)}`);
  }
  return data;
}

async function updateAirtableRow(recordId, fields) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}/${recordId}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    console.error(`Airtable update failed for ${recordId}: ${resp.status} ${text.slice(0, 300)}`);
  }
}

async function main() {
  requireEnv();

  const records = await fetchApprovedRecords();
  console.log(`Found ${records.length} Airtable row(s) with Status = APPROVED.`);

  if (records.length === 0) {
    console.log('Nothing to publish. Exiting.');
    return;
  }

  const recordsById = new Map(records.map(r => [r.id, r]));
  const batches = chunk(records.map(recordToPayload), BATCH_SIZE);

  let publishedCount = 0;
  let failedCount = 0;
  const today = new Date().toISOString().slice(0, 10);

  for (const batch of batches) {
    console.log(`Publishing batch of ${batch.length}...`);
    const result = await publishBatch(batch);
    console.log(result.message || JSON.stringify(result));

    for (const r of result.results || []) {
      const recordId = r.airtable_id;
      if (!recordId || !recordsById.has(recordId)) {
        console.warn('Result with unmatched airtable_id, skipping Airtable write-back:', r);
        continue;
      }
      if (r.success) {
        publishedCount++;
        await updateAirtableRow(recordId, {
          Status: 'PUBLISHED',
          'Published Date': today,
          'Publish Error': '',
        });
        console.log(`  #${r.concept_id} "${r.term}" -> PUBLISHED`);
      } else {
        failedCount++;
        await updateAirtableRow(recordId, {
          'Publish Error': r.error || 'Unknown error',
        });
        console.error(`  "${r.term}" -> FAILED: ${r.error}`);
      }
    }
  }

  console.log(`\nDone. Published: ${publishedCount}. Failed: ${failedCount}.`);
  if (failedCount > 0) {
    console.error('One or more concepts failed to publish. Check the Publish Error column in Airtable, fix, and re-run.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
