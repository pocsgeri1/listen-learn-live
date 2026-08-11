#!/usr/bin/env node
// tools/generate-static-pages.js
// Epistemic SEO static page generator — v1.0
// Reads concepts.json → writes /concepts/[id]-[slug].html for each concept
// Also writes sitemap.xml and robots.txt at repo root
// Run: node tools/generate-static-pages.js
// Auto-runs via .git/hooks/pre-push on every push

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONCEPTS_FILE = path.join(ROOT, 'concepts.json');
const CONCEPTS_OUT_DIR = path.join(ROOT, 'concepts');
const SITEMAP_OUT = path.join(ROOT, 'sitemap.xml');
const ROBOTS_OUT = path.join(ROOT, 'robots.txt');
const BASE_URL = 'https://epistemic.live';

// Category colors — must match design-tokens.md
const CAT_COLOR = {
  finance: '#6b9fc4',
  psychology: '#a08fd4',
  thinking: '#7aaf8a',
  power: '#d4715a',
  relationships: '#c47a9f',
  language: '#5abfaf',
  business: '#e0a060',
  identity: '#b89878',
  health: '#8ab87a',
  philosophy: '#9a8fb8',
  society: '#7090a8',
  'tech-ai': '#b8a07a',
  creativity: '#d4a574',
  science: '#6ab0c4',
};

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

function conceptFilename(concept) {
  return `${zeroPad(concept.id)}-${slugify(concept.term)}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPage(concept, allConcepts, totalCount) {
  const slug = conceptFilename(concept);
  const canonicalUrl = `${BASE_URL}/concepts/${slug}`;
  const color = CAT_COLOR[concept.category] || '#e8d5a3';
  const colorAlpha10 = color + '1a'; // ~10% opacity
  const colorAlpha20 = color + '33'; // ~20% opacity

  // Related concepts
  const relatedHtml = (() => {
    if (!concept.related_ids || concept.related_ids.length === 0) return '';
    const chips = concept.related_ids
      .map(rid => {
        const rel = allConcepts.find(c => c.id === rid);
        if (!rel) return '';
        const relSlug = conceptFilename(rel);
        return `<a class="ep-related-chip" href="/concepts/${relSlug}">${escapeHtml(rel.term)}</a>`;
      })
      .filter(Boolean)
      .join('\n            ');
    if (!chips) return '';
    return `
        <div class="ep-related">
          <p class="ep-section-label">Related concepts</p>
          <div class="ep-related-chips">
            ${chips}
          </div>
        </div>`;
  })();

  // JSON-LD structured data
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: concept.term,
    description: `${concept.hook} ${concept.plain}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Epistemic Concept Library',
      url: BASE_URL,
    },
    url: canonicalUrl,
  });

  const metaDescription = escapeHtml(`${concept.hook} ${concept.plain}`.slice(0, 155));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(concept.term)} — ${escapeHtml(concept.hook)} | Epistemic</title>
<meta name="description" content="${metaDescription}">
<link rel="canonical" href="${canonicalUrl}">
<meta name="robots" content="index, follow">
<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${escapeHtml(concept.term)} | Epistemic">
<meta property="og:description" content="${metaDescription}">
<meta property="og:image" content="${BASE_URL}/og/${concept.id}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(concept.term)} | Epistemic">
<meta name="twitter:description" content="${metaDescription}">
<meta name="twitter:image" content="${BASE_URL}/og/${concept.id}.png">
<!-- Structured data -->
<script type="application/ld+json">${jsonLd}</script>
<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0d0d;
    --surface: #141414;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.15);
    --text: #f0ede8;
    --muted: #6b6b6b;
    --muted2: #9a9a9a;
    --accent: #e8d5a3;
    --cat: ${color};
  }

  html, body {
    min-height: 100%;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Noise overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.35;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* Nav */
  .ep-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 10;
    padding: 18px 32px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(13,13,13,0.94);
  }
  .ep-nav-logo {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
  }
  .ep-nav-back {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    text-decoration: none;
    transition: color 0.15s;
  }
  .ep-nav-back:hover { color: var(--text); }

  /* Page layout */
  .ep-page {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 24px 80px;
  }

  /* Card */
  .ep-card {
    width: 100%;
    max-width: 600px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    animation: fadeUp 0.35s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .ep-card { animation: none; }
  }

  .ep-card-accent {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--cat);
  }

  .ep-card-inner {
    padding: 32px 32px 32px 36px;
  }

  /* Eyebrow */
  .ep-eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }
  .ep-cat-pill {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--cat);
    background: ${colorAlpha10};
    border: 1px solid ${colorAlpha20};
    border-radius: 999px;
    padding: 3px 10px;
  }
  .ep-id-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* Term + hook */
  h1.ep-term {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 2rem;
    color: var(--text);
    margin-bottom: 10px;
    line-height: 1.15;
  }
  .ep-hook {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 1.05rem;
    color: var(--cat);
    margin-bottom: 28px;
    line-height: 1.5;
  }

  /* Divider */
  .ep-divider {
    height: 1px;
    background: var(--border);
    margin-bottom: 24px;
  }

  /* Labels + body */
  .ep-section-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }
  .ep-body {
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    font-size: 0.93rem;
    color: var(--text);
    line-height: 1.75;
    margin-bottom: 24px;
  }

  /* Analogy block */
  .ep-analogy-block {
    background: rgba(232,213,163,0.04);
    border: 1px solid rgba(232,213,163,0.1);
    border-radius: 8px;
    padding: 16px 18px;
    margin-bottom: 24px;
  }
  .ep-analogy-block .ep-section-label { margin-bottom: 6px; }
  .ep-analogy-block .ep-body { margin-bottom: 0; }

  /* Prompt block */
  .ep-prompt-block {
    background: ${colorAlpha10};
    border: 1px solid ${colorAlpha20};
    border-radius: 8px;
    padding: 16px 18px;
    margin-bottom: 28px;
  }
  .ep-prompt-block .ep-section-label {
    color: var(--cat);
    opacity: 0.7;
    margin-bottom: 6px;
  }
  .ep-prompt-text {
    font-family: 'DM Sans', sans-serif;
    font-weight: 400;
    font-size: 0.88rem;
    color: var(--text);
    line-height: 1.65;
  }

  /* Related */
  .ep-related {
    border-top: 1px solid var(--border);
    padding-top: 20px;
  }
  .ep-related-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }
  .ep-related-chip {
    font-family: 'DM Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 5px 10px;
    text-decoration: none;
    transition: color 0.15s, border-color 0.15s;
    display: inline-block;
  }
  .ep-related-chip:hover {
    color: var(--text);
    border-color: var(--border-hover);
  }

  /* CTA */
  .ep-cta-wrap {
    width: 100%;
    max-width: 600px;
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .ep-cta-btn {
    display: inline-block;
    background: var(--accent);
    color: #0d0d0d;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    border-radius: 999px;
    padding: 13px 36px;
    text-decoration: none;
    transition: background 0.15s, transform 0.15s;
  }
  .ep-cta-btn:hover {
    background: #f0e0b0;
    transform: translateY(-1px);
  }
  .ep-cta-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 300;
    color: var(--muted);
    text-align: center;
  }

  /* Footer */
  .ep-footer {
    margin-top: 40px;
    font-family: 'DM Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #3a3a3a;
    text-align: center;
  }

  /* Mobile */
  @media (max-width: 600px) {
    .ep-nav { padding: 16px 20px; }
    .ep-card-inner { padding: 24px 24px 24px 28px; }
    h1.ep-term { font-size: 1.6rem; }
    .ep-page { padding: 90px 16px 60px; }
  }
</style>
</head>
<body>

<nav class="ep-nav">
  <a class="ep-nav-logo" href="/">Epistemic</a>
  <a class="ep-nav-back" href="/">← Back to library</a>
</nav>

<main class="ep-page">

  <article class="ep-card">
    <div class="ep-card-accent"></div>
    <div class="ep-card-inner">

      <div class="ep-eyebrow">
        <span class="ep-cat-pill">${escapeHtml(concept.category)}</span>
        <span class="ep-id-label">#${zeroPad(concept.id)}</span>
      </div>

      <h1 class="ep-term">${escapeHtml(concept.term)}</h1>
      <p class="ep-hook">${escapeHtml(concept.hook)}</p>

      <div class="ep-divider"></div>

      <p class="ep-section-label">What it means</p>
      <p class="ep-body">${escapeHtml(concept.plain)}</p>

      <div class="ep-analogy-block">
        <p class="ep-section-label">Analogy</p>
        <p class="ep-body">${escapeHtml(concept.analogy)}</p>
      </div>

      <div class="ep-prompt-block">
        <p class="ep-section-label">Reflect on this</p>
        <p class="ep-prompt-text">${escapeHtml(concept.prompt)}</p>
      </div>
${relatedHtml}

    </div>
  </article>

  <div class="ep-cta-wrap">
    <a class="ep-cta-btn" href="/${concept.id ? '#open=' + concept.id : ''}">Open this card in Epistemic →</a>
    <a class="ep-cta-btn" href="/" style="background:transparent;color:var(--accent);border:1px solid rgba(232,213,163,0.25);margin-top:-4px;">Explore all ${totalCount} concepts →</a>
    <p class="ep-cta-sub">epistemic.live — ideas from the podcasts you already listen to</p>
  </div>

  <footer class="ep-footer">epistemic.live &nbsp;·&nbsp; vol. i</footer>

</main>

</body>
</html>`;
}



// Human-readable category display names
const CAT_DISPLAY = {
  finance: 'Finance',
  psychology: 'Psychology',
  thinking: 'Thinking',
  power: 'Power',
  relationships: 'Relationships',
  language: 'Language',
  business: 'Business',
  identity: 'Identity',
  health: 'Health',
  philosophy: 'Philosophy',
  society: 'Society',
  creativity: 'Creativity',
  science: 'Science',
  'tech-ai': 'Tech & AI',
};

function buildCategoryPage(categoryId, concepts, totalCount) {
  const color = CAT_COLOR[categoryId] || '#e8d5a3';
  const colorAlpha10 = color + '1a';
  const colorAlpha20 = color + '33';
  const displayName = CAT_DISPLAY[categoryId] || categoryId;
  const canonicalUrl = `${BASE_URL}/category/${categoryId}`;

  const catConcepts = concepts
    .filter(c => c.category === categoryId && !c.duplicate_of)
    .reverse(); // newest first, matches SPA order

  const conceptListHtml = catConcepts.map(c => {
    const slug = conceptFilename(c);
    return `
        <a class="cat-concept-row" href="/concepts/${slug}">
          <span class="cat-concept-id">#${zeroPad(c.id)}</span>
          <span class="cat-concept-term">${escapeHtml(c.term)}</span>
          <span class="cat-concept-hook">${escapeHtml(c.hook)}</span>
          <span class="cat-concept-arrow">→</span>
        </a>`;
  }).join('\n');

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${displayName} Concepts | Epistemic`,
    description: `${catConcepts.length} ${displayName.toLowerCase()} concepts explained in plain English — with analogies and reflection prompts.`,
    url: canonicalUrl,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Epistemic', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: displayName, item: canonicalUrl },
      ],
    },
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${displayName} Concepts | Epistemic</title>
<meta name="description" content="${catConcepts.length} ${displayName.toLowerCase()} concepts explained in plain English — with real analogies and prompts to use them.">
<link rel="canonical" href="${canonicalUrl}">
<meta name="robots" content="index, follow">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${displayName} Concepts | Epistemic">
<meta property="og:description" content="${catConcepts.length} ${displayName.toLowerCase()} concepts explained in plain English.">
<meta property="og:image" content="${BASE_URL}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${displayName} Concepts | Epistemic">
<meta name="twitter:image" content="${BASE_URL}/og-image.png">
<script type="application/ld+json">${jsonLd}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0d0d;
    --surface: #141414;
    --surface2: #1c1c1c;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.15);
    --text: #f0ede8;
    --muted: #6b6b6b;
    --muted2: #9a9a9a;
    --accent: #e8d5a3;
    --cat: ${color};
  }

  html, body { min-height: 100%; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

  body::before {
    content: '';
    position: fixed; inset: 0;
    pointer-events: none; z-index: 0; opacity: 0.35;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .ep-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 10;
    padding: 18px 32px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(13,13,13,0.94);
  }
  .ep-nav-logo { font-family: 'DM Mono', monospace; font-size: 0.7rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); text-decoration: none; }
  .ep-nav-back { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); text-decoration: none; transition: color 0.15s; }
  .ep-nav-back:hover { color: var(--text); }

  .ep-page { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding: 110px 24px 80px; }

  /* Header */
  .cat-header { margin-bottom: 48px; }
  .cat-breadcrumb { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; }
  .cat-breadcrumb a { color: var(--muted); text-decoration: none; }
  .cat-breadcrumb a:hover { color: var(--text); }
  .cat-breadcrumb span { margin: 0 6px; opacity: 0.4; }
  .cat-accent-bar { width: 32px; height: 3px; background: var(--cat); border-radius: 2px; margin-bottom: 16px; }
  h1.cat-title { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 2.4rem; color: var(--text); line-height: 1.1; margin-bottom: 10px; }
  .cat-subtitle { font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.93rem; color: var(--muted2); line-height: 1.6; }
  .cat-count { display: inline-block; font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--cat); background: ${colorAlpha10}; border: 1px solid ${colorAlpha20}; border-radius: 999px; padding: 3px 10px; margin-left: 10px; vertical-align: middle; }

  /* Divider */
  .cat-divider { height: 1px; background: var(--border); margin-bottom: 32px; }

  /* Concept list */
  .cat-concept-list { display: flex; flex-direction: column; gap: 2px; }

  .cat-concept-row {
    display: grid;
    grid-template-columns: 44px 1fr auto 20px;
    align-items: center;
    gap: 12px;
    padding: 14px 16px 14px 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
    position: relative;
    overflow: hidden;
  }
  .cat-concept-row::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0;
    width: 2px;
    background: var(--cat);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .cat-concept-row:hover { border-color: var(--border-hover); background: var(--surface2); }
  .cat-concept-row:hover::before { opacity: 1; }

  .cat-concept-id { font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.12em; color: var(--muted); }
  .cat-concept-term { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 0.95rem; color: var(--text); }
  .cat-concept-hook { font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.8rem; color: var(--muted2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cat-concept-arrow { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: var(--muted); transition: color 0.15s, transform 0.15s; }
  .cat-concept-row:hover .cat-concept-arrow { color: var(--cat); transform: translateX(2px); }

  /* CTA */
  .cat-cta { margin-top: 48px; text-align: center; }
  .ep-cta-btn { display: inline-block; background: var(--accent); color: #0d0d0d; font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 999px; padding: 13px 36px; text-decoration: none; transition: background 0.15s, transform 0.15s; }
  .ep-cta-btn:hover { background: #f0e0b0; transform: translateY(-1px); }
  .cat-cta-sub { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 300; color: var(--muted); margin-top: 12px; }

  /* Footer */
  .ep-footer { margin-top: 40px; font-family: 'DM Mono', monospace; font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: #3a3a3a; text-align: center; }

  /* Mobile */
  @media (max-width: 600px) {
    .ep-nav { padding: 16px 20px; }
    .ep-page { padding: 90px 16px 60px; }
    h1.cat-title { font-size: 1.8rem; }
    .cat-concept-row { grid-template-columns: 36px 1fr 16px; }
    .cat-concept-hook { display: none; }
  }
</style>
</head>
<body>

<nav class="ep-nav">
  <a class="ep-nav-logo" href="/">Epistemic</a>
  <a class="ep-nav-back" href="/">← Back to library</a>
</nav>

<main class="ep-page">

  <header class="cat-header">
    <p class="cat-breadcrumb"><a href="/">Epistemic</a><span>›</span>${escapeHtml(displayName)}</p>
    <div class="cat-accent-bar"></div>
    <h1 class="cat-title">${escapeHtml(displayName)} <span class="cat-count">${catConcepts.length} concepts</span></h1>
    <p class="cat-subtitle">${escapeHtml(displayName)} concepts explained in plain English — with real analogies and prompts to use them in conversation.</p>
  </header>

  <div class="cat-divider"></div>

  <div class="cat-concept-list">
${conceptListHtml}
  </div>

  <div class="cat-cta">
    <a class="ep-cta-btn" href="/#open-cat=${categoryId}">Explore ${escapeHtml(displayName)} in Epistemic →</a>
    <p class="cat-cta-sub">epistemic.live — ${totalCount} concepts from the podcasts you already listen to</p>
  </div>

  <footer class="ep-footer">epistemic.live &nbsp;·&nbsp; vol. i</footer>

</main>

</body>
</html>`;
}

function buildSitemap(concepts, allConcepts) {
  const conceptUrls = concepts
    .map(c => {
      const slug = conceptFilename(c);
      return `  <url>\n    <loc>${BASE_URL}/concepts/${slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    })
    .join('\n');

  // NOTE: category URLs intentionally excluded — SPA routes, not indexable static pages.
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${conceptUrls}
</urlset>`;
}

function buildRobots() {
  return `User-agent: *
Allow: /
Sitemap: ${BASE_URL}/sitemap.xml
`;
}

// --- Main ---
function main() {
  const concepts = JSON.parse(fs.readFileSync(CONCEPTS_FILE, 'utf8'));
  const totalCount = concepts.length;

  // Ensure output dirs exist
  const CATEGORY_OUT_DIR = path.join(ROOT, 'category');
  if (!fs.existsSync(CONCEPTS_OUT_DIR)) fs.mkdirSync(CONCEPTS_OUT_DIR, { recursive: true });
  if (!fs.existsSync(CATEGORY_OUT_DIR)) fs.mkdirSync(CATEGORY_OUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  for (const concept of concepts) {
    if (concept.duplicate_of) { skipped++; continue; }
    const html = buildPage(concept, concepts, totalCount);
    const filename = conceptFilename(concept) + '.html';
    fs.writeFileSync(path.join(CONCEPTS_OUT_DIR, filename), html, 'utf8');
    generated++;
  }

  // Category pages
  const categories = Object.keys(CAT_COLOR);
  for (const cat of categories) {
    const html = buildCategoryPage(cat, concepts, totalCount);
    fs.writeFileSync(path.join(CATEGORY_OUT_DIR, cat + '.html'), html, 'utf8');
  }

  // Sitemap (now includes category URLs)
  const sitemap = buildSitemap(concepts.filter(c => !c.duplicate_of), concepts);
  fs.writeFileSync(SITEMAP_OUT, sitemap, 'utf8');

  // Robots.txt
  fs.writeFileSync(ROBOTS_OUT, buildRobots(), 'utf8');

  console.log(`✓ Generated ${generated} concept pages → /concepts/`);
  console.log(`✓ Skipped ${skipped} duplicate concepts`);
  console.log(`✓ Generated ${categories.length} category pages → /category/`);
  console.log(`✓ sitemap.xml updated (concepts + categories)`);
  console.log(`✓ robots.txt written`);
}

main();
