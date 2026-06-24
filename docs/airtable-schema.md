# Airtable Schema — Epistemic

**Last updated:** 2026-05-09
**Base name:** Epistemic — Concept Management
**Purpose:** Intake, review, and approval workflow for all concepts before they go live on the site.

**Note:** this document describes the **current** schema as of the date
above. `Collection ID` (Concepts) and `People` (Episodes) are now live
on the base as of v1.16. The publish path (Make.com + `/api/publish-concept.js`)
does not yet read `Collection ID` — that's C3, still pending.

---

**v1.43 update — `Editor's Pick` field added to Concepts table.**
Checkbox type. Yellow ★ icon. Default unchecked. Captured at extraction time in `extract.html` / `upload.html`; overrideable in Airtable for PENDING rows. Flows through Make.com batch publish into `editors_pick: boolean` on each concept in `concepts.json`. The field name in Make.com aggregator output is verbatim `"Editor's Pick"` (Airtable display name) — `publish-batch.js` reads both that casing and snake_case for resilience.

---

**v1.35 update — `Publish Error` field expected by batch publish.**
The new batch publish scenario writes per-concept failure messages to a `Publish Error` field on the Concepts table. Long text. Cleared on successful publish, populated when the publish-batch endpoint returns `success: false` for a row (e.g. duplicate term, missing required field). Used by the Iterator + Airtable Update branch in `LLL — APPROVED → Batch Publish → Live`.

---

**v1.34 update — `Timestamp` field added to Concepts table.**
Integer seconds, populated by the extraction pipeline from Glasp-style timestamp markers in transcripts. Flows through `extract.html` → Airtable → Make.com → `publish-concept.js` → `concepts.json`. Optional — concepts without a timestamp simply don't render the Listen button on the live site.

---

**v1.33 update — Source field is now open-ended.**
The Single Select still gates valid options server-side, but `typecast: true` on POSTs from `extract-concepts.js`, `publish-concept.js`, and `extract.html` means new source codes (e.g. `jr`, `tf`, `lf`, `rh`, `sb`, `nr`, `ahu`) auto-create as new Single Select options the first time they're used. No need to manually pre-add a new code when onboarding a new podcast.

---

## How this document is used

When Claude writes Make.com automation logic, API calls, or anything that touches Airtable, it needs to know the exact field names. Airtable's API is case-sensitive and strict — a typo in a field name silently returns no data.

**Always match these field names exactly, including capitalization and spaces.**

---

## Table 1: Concepts

The primary table where all extracted concepts live — pending, approved, rejected, and published.

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `ID` | Autonumber | Yes | Airtable's internal row ID. Do not confuse with the `Concept ID` field below. |
| `Concept ID` | Number (integer) | No | The sequential ID used in concepts.json. Assigned on approval, not on extraction. Leave blank for PENDING rows. |
| `Collection ID` | Number (integer) | No | 1–6 = foundational packs, 10+ = episode-based collections. Blank means unassigned. Added v1.16, wired through publish path in v1.17. **Auto-populated for new episode concepts (v1.18, D1)** — the extract function pre-fills this with the newly-created collection's id. Manual fill no longer required for the agent pipeline; only relevant when manually editing or assigning an unattached concept to a collection. |
| `Status` | Single select | Yes | Options: `PENDING`, `APPROVED`, `REJECTED`, `EDIT`, `PUBLISHED` |
| `Term` | Single line text | Yes | 2–5 words. The concept name. |
| `Category` | Single select | Yes | Options: `finance`, `psychology`, `thinking`, `power`, `relationships`, `language`, `business`, `identity`, `health`, `philosophy`, `society`, `creativity`, `science`, `tech-ai` |
| `Source` | Single select | Yes | Options: `core`, `cw`, `ah`, `dk` |
| `Hook` | Long text | Yes | One sentence, max 12 words. The punchy one-liner. |
| `Plain` | Long text | Yes | 2–3 sentences explaining the concept in plain English. |
| `Analogy` | Long text | Yes | One concrete real-world scenario. |
| `Prompt` | Long text | Yes | One reflection or conversation question. |
| `Universality Score` | Number (1-10) | No | From extraction prompt. 1 decimal. |
| `Actionability Score` | Number (1-10) | No | From extraction prompt. 1 decimal. |
| `Novelty Score` | Number (1-10) | No | From extraction prompt. 1 decimal. |
| `Conversation Value Score` | Number (1-10) | No | From extraction prompt. 1 decimal. |
| `Composite Score` | Formula | Auto | `(Universality + Actionability + Novelty + Conversation Value) / 4` |
| `Episode Reference` | Single line text | No | Title + timestamp from source episode |
| `Timestamp` | Number (integer) | No | Seconds from start of episode where this concept is discussed. Used by the live site to deep-link the "↗ Listen" button to the right moment (with an 8-second pre-roll buffer). Added v1.34. |
| `Editor's Pick` | Checkbox | No | Marks the concept as an editorial standout. Toggled in `extract.html` / `upload.html` before sending to Airtable, OR manually flipped on PENDING rows before approval. Flows through Make.com → `publish-batch.js` → `editors_pick: boolean` on `concepts.json` → gold border + ★ PICK badge on the live site. Cannot be flipped retroactively on PUBLISHED rows (pipeline only fires on Status changes). Added v1.43. |
| `Episode URL` | URL | No | Link to source podcast episode |
| `Notes` | Long text | No | Editorial notes from reviewer |
| `Publish Error` | Long text | No | Populated by batch publish scenario when a row fails validation or hits a duplicate. Blank means last publish attempt succeeded (or row hasn't been attempted yet). Added v1.35. |
| `Created` | Created time | Auto | When row was added |
| `Approved Date` | Date | No | Set when status changes to APPROVED |
| `Published Date` | Date | No | Set by automation when pushed to GitHub |
| `People` | Long text | No | Full name(s) of source person(s), comma-separated. Populated by bulk upload tool for non-episode concepts. Same convention as Episodes table `People` field. Example: `Ryan Holiday`, `Naval Ravikant`. Blank for foundational/curated concepts with no single attribution. |

### Status field — what each value means

| Status | Meaning | Triggers what |
|--------|---------|---------------|
| `PENDING` | Just extracted by agent, awaiting review | Nothing. Waits for human. |
| `EDIT` | Needs Claude to regenerate a field | Manual re-prompting |
| `APPROVED` | Human has approved as-is | Make.com automation: push to GitHub |
| `REJECTED` | Not good enough, will not be published | Nothing. Kept for learning. |
| `PUBLISHED` | Successfully added to live site | Set by automation on success |

### Views

Create these saved views in Airtable for efficient review:

1. **Review Queue** — filtered to Status = PENDING, sorted by Composite Score descending
2. **Approved Today** — filtered to Status = APPROVED AND Approved Date = today
3. **Live Library** — filtered to Status = PUBLISHED, sorted by Concept ID
4. **Rejects** — filtered to Status = REJECTED (useful for pattern analysis)
5. **By Category** — grouped by Category, filtered to Status = PUBLISHED

---

## Table 2: Episodes

Track every podcast episode processed through the pipeline.

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `ID` | Autonumber | Yes | Airtable internal |
| `Episode Title` | Single line text | Yes | |
| `Podcast` | Single select | Yes | Options: `Modern Wisdom`, `Diary of a CEO`, `Lex Fridman`, `Huberman Lab`, `Other` |
| `Host` | Single line text | Yes | |
| `People` | Long text | Yes (by convention) | Host first, then guests, comma-separated, full canonical names. Example: `Chris Williamson, Naval Ravikant`. Field-level required toggle not available on Long text; enforced at form level. Added v1.16. Will flow into the `people` array on collections in `collections.json` once C3 ships. |
| `Podcast` | Single line text | Yes (form-level) | Name of the podcast the episode is from. Examples: `Modern Wisdom`, `Diary of a CEO`, `Lex Fridman`, `Dan Koe`. Flows through `extract-concepts.js` into the `podcast` field on the episode collection in `collections.json`. The frontend groups episode rows by this value. Defaults to "Other" downstream if blank. Added v1.31, 2026-05-06. |
| `URL` | URL | Yes | Original episode URL |
| `Date Aired` | Date | No | When episode originally published |
| `Date Processed` | Date | Auto | When run through pipeline |
| `Duration (min)` | Number | No | |
| `Transcript` | Long text | No | Stored for reference |
| `Concepts Extracted` | Number | Auto | Count of rows in Concepts table with matching Episode Reference |
| `Concepts Approved` | Number | Auto | Subset of above that reached APPROVED status |
| `Quality Score` | Formula | Auto | `Concepts Approved / Concepts Extracted` |
| `Notes` | Long text | No | |

---

## Table 3: Submissions (for community submissions — Phase 2)

User-submitted concepts awaiting review.

### Fields

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `ID` | Autonumber | Yes | |
| `Submitted By` | Single line text | No | Name or handle (optional) |
| `Submitter Location` | Single line text | No | For credit ("Marco, Netherlands") |
| `Submitter Email` | Email | No | For notification on approval |
| `Raw Submission` | Long text | Yes | The user's original description |
| `Status` | Single select | Yes | Options: `PENDING`, `FORMATTED`, `APPROVED`, `REJECTED` |
| `Formatted Concept ID` | Link to Concepts | No | Links to the concept record once formatted |
| `Date Submitted` | Created time | Auto | |
| `Notes` | Long text | No | |

---

## Intake table — `People` field (added v1.18, D1)

The Intake table now has a `People` field that flows into the `people` array
on the auto-created episode collection.

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| `People` | Long text | Yes (form-level) | Host first, then guests, comma-separated, full canonical names. Example: `Chris Williamson, Naval Ravikant`. Solo episode: just the host name. Empty input is tolerated by the function (collection still created with `people: []`), but the Submit Transcript form view should mark it required. |

The `People` field exists on both the Intake table (D1) and the Episodes
table (v1.16). Same convention on both. The Episodes table is currently a
reference table only — not in the active pipeline. The Intake.People field
is what the extract function actually reads.

---

## Automation reference — field mappings for Make.com

When writing Make.com automations, these are the exact field names the modules will reference:

### Pipeline trigger: new PENDING row appears
```
Table: Concepts
Trigger: Record created
Filter: Status = "PENDING"
```

### Publish trigger: status changes to APPROVED
```
Table: Concepts
Trigger: Record updated
Filter: Status changed to "APPROVED"
Fields to extract:
  - Concept ID
  - Term
  - Category
  - Source
  - Hook
  - Plain
  - Analogy
  - Prompt
```

### JSON construction for HTTP POST to publish function

Make.com's HTTP module sends this body to /api/publish-concept. Note: `id` is NOT sent — the publish function generates it server-side as `max(existing id) + 1`. For episode-based concepts, `Collection ID` is pre-filled by the extract function (v1.18, D1), so the human reviewer doesn't manually fill it.

```json
{
  "term": "{{Term}}",
  "category": "{{Category}}",
  "source": "{{Source}}",
  "hook": "{{Hook}}",
  "plain": "{{Plain}}",
  "analogy": "{{Analogy}}",
  "prompt": "{{Prompt}}",
  "collection_id": {{ifempty(`Collection ID`; "null"; `Collection ID`)}},
  "editors_pick": {{`Editor's Pick`}}
}
```

Note: the Make batch scenario uses an Array Aggregator + Create JSON module rather than a raw HTTP body, so the above is illustrative for the legacy single-concept path. The aggregator passes Editor's Pick automatically since v1.43.

---

Notes:
- 8 fields posted by Make. Function adds `id` to produce the 9-field shape stored in concepts.json.
- `collection_id` uses `ifempty(...)` so empty Airtable Collection ID renders as the string `"null"`. The publish function's parseInt fall-through normalizes this to JSON null. Valid values in concepts.json: positive integer (existing collection) or null (no collection).
- The `Concept ID` field in Airtable is a legacy display-only field — it's NOT sent to the function, NOT used to determine the published id, and may drift from the actual published id over time. Treat as informational only.

**Schema gap (will be closed in the next session):** the schema-of-record
in `quality-rules.md` is 9 fields (this 8-field shape plus `collection_id`).
The 165 existing concepts in `concepts.json` all have `collection_id: null`
because that field was added by a separate batch operation, not by the
publish path. New concepts published today inherit the 8-field shape
above and would land in `concepts.json` without a `collection_id` key.
The C1 + C2 + C3 work in the next session closes this gap.

---

## Future schema evolution

When adding new features, these are anticipated schema changes:

### Tech & AI and other new categories — already added April 2026
All 14 category options are now live in the `Category` field single select.

### If adding new authors (Jordan Peterson, Taleb, etc.)
Update `Source` single select options — add `jp`, `nt`, etc.

### If adding difficulty levels
Add new field `Difficulty` — Single select with `foundational`, `intermediate`, `advanced`

### If adding related concepts linking
Add new field `Related Concepts` — Link to Concepts (self-referencing, multiple allowed)

### If adding user-submitted stories
Add new field `Usage Stories` — Long text, collect real-world examples of the concept being used

**Always update this document when schema changes happen.**

---

## Coming in the next session — C3

The C3 build will update the Make.com publish automation and
`/api/publish-concept.js` to read the new `Collection ID` field and
write it as `collection_id` on each concept committed to
`concepts.json`. This closes the schema gap between `quality-rules.md`
(9-field schema-of-record) and the publish path (currently 8 fields).

After C3 lands, the JSON construction will become:

```json
{
  "id": {{Concept ID}},
  "term": "{{Term}}",
  "category": "{{Category}}",
  "source": "{{Source}}",
  "hook": "{{Hook}}",
  "plain": "{{Plain}}",
  "analogy": "{{Analogy}}",
  "prompt": "{{Prompt}}",
  "collection_id": {{Collection ID or null}}
}
```

The Episodes table's `People` field will be read into the
corresponding episode-based collection's `people` array as part of
the same C3 work.

---

## Setup checklist (historical — base exists; kept for reference if rebuilding)

When creating this base from scratch (or rebuilding after deletion):

- [x] Create new Airtable base named "Epistemic — Concept Management"
- [x] Create `Concepts` table with all fields listed above
- [x] Create `Episodes` table with all fields listed above
- [ ] Create `Submissions` table (can skip until Phase 2)
- [x] Set up review views on Concepts table
- [x] Import initial concepts from concepts.json with Status = PUBLISHED (165 records as of 2026-04-27)
- [x] Generate Airtable API key in account settings → Developer hub
- [x] Save API key + Base ID + Table IDs to secure password manager
- [x] Never commit API keys to GitHub or share in chat

---

## Source field — legacy status (as of 2026-04-27)

The `source` field on the Concepts table is **legacy in intent** but
**still active in the data path and the live UI**.

### Current live state
- The source filter row in `index.html` is still rendered. The filter pills,
  `SOURCES` array, `SRC_LABEL`, `buildSrc()`, `setSrc()`, `activeSrc`
  variable, and `.src-btn` CSS are all live (the v1.7 removal session
  did not land — pending re-application as a held build task).
- The `Source` field still exists on the Concepts table.
- The Make.com publish automation still maps `Source` → `source`.
- The agent pipeline (`/api/extract-concepts.js`) still requires a valid
  source value (one of: `core`, `cw`, `ah`, `dk`).
- All 165 existing concepts retain their original source value.

### Why retiring it is deferred
Removing the source field from the schema requires coordinated changes to:
- The Airtable Concepts table (delete field)
- The Make.com publish automation (remove mapping)
- `/api/extract-concepts.js` (remove validation + return value)
- `extraction-prompt-v1_2.txt` (remove source from required output)
- `quality-rules.md` (remove source from schema spec)
- `index.html` (remove source filter UI)

This is held until after C1+C2+C3 (which add `Collection ID` to the
publish path). Until then: keep filling in `source` on new concepts.

### Going forward — attribution moves to collections

In the new architecture, attribution lives on the **collection**, not the
concept. Each episode-based collection in `collections.json` will have a
`people` array (host + guests, populated from the Episodes table's
`People` field — added in C2). Card UI will eventually show those people
as small coloured pills (step B3).

For the existing 165 concepts: a future A4 task will assign them to the
6 foundational curated collections. Those foundational collections have
no `people` array (they're pre-podcast, pre-attribution). So existing
cards will show no people pills — only future episode-based concepts
will.

### Bulk upload tool — source field behaviour (v1.29)

The `upload.html` tool sends auto-generated initials to the `Source` field (e.g. `rh`, `nr`, `jc`). These are not pre-defined options in the Airtable single-select — Airtable will accept them as new options on first use and add them to the dropdown automatically. Review these values during the approval step and correct if needed. Future session: consider whether to formally expand the Source single-select options or migrate attribution fully to the `People` field.