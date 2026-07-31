# Epistemic — SEO Session Plan
# v2.0 — 2026-07-31
# Start a new Cowork session and paste this as context.
---

## What we are doing and why

**epistemic.live is a Single-Page Application (SPA).** That means the entire site is one `index.html` file — JavaScript renders all content dynamically. When Google's crawler visits the site, it gets back a mostly empty HTML shell and cannot read any of the concepts. None of the 300+ concept cards are indexable.

The fix: generate static HTML pages for each concept, each category, and each episode source using a Node build script. No framework change. The SPA at `/` stays completely untouched. Vercel serves the static pages alongside it.

---

## Architecture (ALREADY DECIDED — do not re-litigate)

- A Node script (`tools/generate-static-pages.js`) reads `concepts.json`
- Outputs one static `.html` file per concept to `/public/concepts/[id]-[slug].html`
- Each file contains: title, meta description, canonical, OG tags, JSON-LD structured data, minimal above-the-fold content, and a CTA back to the main app
- Vercel serves them as static assets — no serverless functions needed
- **No Next.js. No React. Stack stays vanilla HTML/JS/Vercel.**

---

## Canonical URL format (permanent rule)

```
/concepts/[zero-padded-id]-[term-slug]
```

Examples:
- `/concepts/042-recency-bias`
- `/concepts/128-dunning-kruger-effect`
- `/concepts/007-loss-aversion`

The `id` is the canonical anchor — it never changes. The `term-slug` is human-readable only. If a term is renamed, the old URL 301-redirects to the new one via `vercel.json`. A helper script (`tools/update-seo-redirects.js`) diffs old vs new `concepts.json` and generates the redirect entries.

---

## The 4 sessions

### Session 1 — Static concept pages + Vercel routing [~3–4h]

**Goal:** Every concept has a crawlable URL that Google can index.

1. Write `tools/generate-static-pages.js`:
   - Reads `concepts.json`
   - For each concept: generates slug from term (`Recency Bias` → `recency-bias`)
   - Writes `/public/concepts/[id]-[slug].html` with:
     - `<title>[Term] — [Hook] | Epistemic</title>`
     - `<meta name="description" content="[Hook]. [First sentence of plain.]">`
     - `<link rel="canonical" href="https://epistemic.live/concepts/[id]-[slug]">`
     - Minimal above-the-fold HTML: term, hook, category label, plain explanation, analogy, prompt
     - "← Back to Epistemic" navigation link
     - CTA button: "Explore all concepts →" linking to `https://epistemic.live`
   - Writes `/public/concepts/index.html` — a full listing page of all concepts (optional but useful)
2. Update `vercel.json` to ensure `/public/concepts/*` is served correctly (Vercel serves `/public` by default but confirm routing order doesn't conflict with SPA fallback)
3. Run the script: `node tools/generate-static-pages.js`
4. Deploy and verify a few URLs are live and crawlable

**Files created:** `tools/generate-static-pages.js`, `public/concepts/*.html`, `vercel.json` (updated)

---

### Session 2 — OG image generation + site-wide meta tags [~2–3h]

**Goal:** Concept pages have custom social share images. Main site has proper meta tags.

1. Write `tools/generate-og-images.js` using `sharp` (or `@vercel/og` as a fallback):
   - Template: dark bg `#0d0d0d`, Playfair term large serif, hook italic below, category color accent stripe on left, `epistemic.live` monogram bottom right, 1200×630px
   - Output: `/public/og/[id].png` — one per concept
   - Run once, commit. Re-run only after concept rewrites.
2. Reference in each concept page: `<meta property="og:image" content="https://epistemic.live/og/[id].png">`
3. Update `index.html` (main SPA) with site-wide meta tags:
   - `<meta name="description">` — compelling site-wide description
   - `<link rel="canonical" href="https://epistemic.live/">`
   - `og:title`, `og:description`, `og:image` (generic site image)
   - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
   - `<meta name="robots" content="index, follow">`

**Files created/updated:** `tools/generate-og-images.js`, `public/og/*.png`, `index.html` (meta tags only)

---

### Session 3 — Structured data + sitemap + robots.txt [~1–2h]

**Goal:** Google understands what each page is. Sitemap submitted.

1. Add JSON-LD `DefinedTerm` block to each concept page (can be baked into Session 1 script or added here):
   ```json
   {
     "@context": "https://schema.org",
     "@type": "DefinedTerm",
     "name": "[term]",
     "description": "[hook]. [plain, first sentence]",
     "inDefinedTermSet": {
       "@type": "DefinedTermSet",
       "name": "Epistemic Concept Library",
       "url": "https://epistemic.live"
     },
     "url": "https://epistemic.live/concepts/[id]-[slug]"
   }
   ```
2. Write `tools/generate-sitemap.js` — reads concept pages list, outputs `sitemap.xml` at root
3. Write `robots.txt` at root:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://epistemic.live/sitemap.xml
   ```
4. Deploy. Submit `sitemap.xml` to Google Search Console.

**Files created:** `tools/generate-sitemap.js`, `sitemap.xml`, `robots.txt`

---

### Session 4 — Category pages + episode source pages [~2–3h]

**Goal:** Browsable topic hubs that capture category-level search traffic.

1. Extend `tools/generate-static-pages.js` (or write a separate `tools/generate-category-pages.js`) to output one page per category:
   - URL: `/category/psychology`, `/category/finance`, etc. (14 categories)
   - Title: "Psychology Concepts | Epistemic"
   - Lists all concept terms in that category with links to their concept pages
   - Breadcrumb structured data: Home > Psychology
2. Write `tools/update-seo-redirects.js` — redirect map helper:
   - Takes old `concepts.json` (passed as arg) and current `concepts.json`
   - Diffs term names to detect renames
   - Outputs new redirect entries for `vercel.json`
   - Run after every concept rewrite session

**Files created:** `tools/generate-category-pages.js`, `public/category/*.html`, `tools/update-seo-redirects.js`

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| SPA routing conflicts with static pages | LOW | Vercel serves static files before SPA fallback; check `vercel.json` routes order |
| OG image generation slow or brittle | MEDIUM | Generate once, commit; only re-run on rewrites |
| Slug collisions | LOW | `[id]-[slug]` format — id makes every URL unique |
| Term rename breaks indexed URLs | MEDIUM | `update-seo-redirects.js` handles this; 301 is SEO-safe |
| Large image commit bloats repo | LOW | Host on Cloudinary/Vercel Blob if repo exceeds ~100MB |
| Google ignores static pages if too thin | LOW | Each page has 200+ words (term + hook + plain + analogy + prompt) |

---

## Start command for each session

Copy this verbatim at the start of a Cowork session:

```
BEFORE YOU DO ANYTHING ELSE: read the following files in full, every line.
- docs/cowork-default-instructions.md
- docs/engineering-standards.md
- docs/seo-session-plan.md (this file — re-read it even if you think you know it)

Session type: BUILD — SEO static pages.
Model: claude-sonnet-4-6

Tell me which session we are on (1, 2, 3, or 4), confirm the goal, list the files you will create or modify, and state any assumptions before writing a single line of code.

Do not skip the file reads. Do not start coding before confirming the plan. Clean work only.
```

---

## Files reference

| File | Status | Session |
|------|--------|---------|
| `tools/generate-static-pages.js` | To create | 1 |
| `public/concepts/*.html` | Generated by script | 1 |
| `vercel.json` | Update | 1 |
| `tools/generate-og-images.js` | To create | 2 |
| `public/og/*.png` | Generated by script | 2 |
| `index.html` | Meta tags only | 2 |
| `tools/generate-sitemap.js` | To create | 3 |
| `sitemap.xml` | Generated | 3 |
| `robots.txt` | Hand-written | 3 |
| `tools/generate-category-pages.js` | To create | 4 |
| `public/category/*.html` | Generated | 4 |
| `tools/update-seo-redirects.js` | To create | 4 |
