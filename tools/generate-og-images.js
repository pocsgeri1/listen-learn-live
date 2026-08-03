#!/usr/bin/env node
// tools/generate-og-images.js
// Epistemic OG image generator — v1.0
// Generates 1200×630 branded PNG per concept using Satori + Sharp
//
// Install dependencies first (one-time):
//   npm install satori sharp @fontsource/playfair-display @fontsource/dm-mono
//
// Run:
//   node tools/generate-og-images.js
//
// Output: /og/[id].png — one per concept (skips duplicate_of)
// Re-run after any hook or term rewrite to refresh affected images.

const fs   = require('fs');
const path = require('path');

const ROOT         = path.resolve(__dirname, '..');
const CONCEPTS_FILE = path.join(ROOT, 'concepts.json');
const OG_OUT_DIR   = path.join(ROOT, 'og');

// Category colors — must match design-tokens.md
const CAT_COLOR = {
  finance:       '#6b9fc4',
  psychology:    '#a08fd4',
  thinking:      '#7aaf8a',
  power:         '#d4715a',
  relationships: '#c47a9f',
  language:      '#5abfaf',
  business:      '#e0a060',
  identity:      '#b89878',
  health:        '#8ab87a',
  philosophy:    '#9a8fb8',
  society:       '#7090a8',
  'tech-ai':     '#b8a07a',
  creativity:    '#d4a574',
  science:       '#6ab0c4',
};

// Scale term font size by character length to avoid overflow
function termFontSize(term) {
  const len = term.length;
  if (len <= 14) return 72;
  if (len <= 22) return 58;
  if (len <= 32) return 46;
  return 38;
}

// Hex color to rgba string helper for Satori (uses CSS color strings)
function alpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

function zeroPad(id) {
  return String(id).padStart(3, '0');
}

// Satori element helper — every container needs explicit display
function el(style, children) {
  return { type: 'div', props: { style, children: Array.isArray(children) ? children : [children] } };
}
function txt(style, text) {
  return { type: 'div', props: { style: { display: 'flex', ...style }, children: [String(text)] } };
}

// Build Satori element tree for one concept
function buildElement(concept) {
  const color = CAT_COLOR[concept.category] || '#e8d5a3';
  const fontSize = termFontSize(concept.term);

  return el({
    width: 1200, height: 630,
    background: '#0d0d0d',
    display: 'flex', flexDirection: 'column',
    position: 'relative',
  }, [

    // Left category stripe
    el({ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: color, display: 'flex' }, []),

    // Corner ornaments
    el({ position: 'absolute', top: 32, left: 40, width: 20, height: 20, display: 'flex',
         borderTop: '1px solid rgba(232,213,163,0.18)', borderLeft: '1px solid rgba(232,213,163,0.18)' }, []),
    el({ position: 'absolute', top: 32, right: 32, width: 20, height: 20, display: 'flex',
         borderTop: '1px solid rgba(232,213,163,0.18)', borderRight: '1px solid rgba(232,213,163,0.18)' }, []),
    el({ position: 'absolute', bottom: 32, left: 40, width: 20, height: 20, display: 'flex',
         borderBottom: '1px solid rgba(232,213,163,0.18)', borderLeft: '1px solid rgba(232,213,163,0.18)' }, []),
    el({ position: 'absolute', bottom: 32, right: 32, width: 20, height: 20, display: 'flex',
         borderBottom: '1px solid rgba(232,213,163,0.18)', borderRight: '1px solid rgba(232,213,163,0.18)' }, []),

    // Main content
    el({ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', flex: 1 }, [

      // Eyebrow: category pill + ID
      el({ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }, [
        txt({
          fontFamily: '"DM Mono"', fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: color, background: alpha(color, 0.12),
          border: `1px solid ${alpha(color, 0.25)}`, borderRadius: 999, padding: '6px 18px',
        }, concept.category),
        txt({
          fontFamily: '"DM Mono"', fontSize: 18, letterSpacing: '0.14em', color: 'rgba(107,107,107,1)',
        }, `#${zeroPad(concept.id)}`),
      ]),

      // Term
      txt({
        fontFamily: '"Playfair Display"', fontWeight: 700, fontSize: fontSize,
        color: '#f0ede8', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.01em',
      }, concept.term),

      // Hook
      txt({
        fontFamily: '"Playfair Display"', fontStyle: 'italic', fontWeight: 400,
        fontSize: 28, color: color, lineHeight: 1.4, maxWidth: 900,
      }, concept.hook),
    ]),

    // Bottom row
    el({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 44px 36px 80px' }, [
      txt({ fontFamily: '"DM Mono"', fontSize: 18, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(232,213,163,0.25)' }, '1000+ concepts'),
      txt({ fontFamily: '"DM Mono"', fontSize: 20, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(232,213,163,0.28)' }, 'epistemic.live'),
    ]),

  ]);
}


async function main() {
  // Load dependencies
  let satori, sharp;
  try {
    satori = (await import('satori')).default;
    sharp  = require('sharp');
  } catch (e) {
    console.error('✗ Missing dependencies. Run first:');
    console.error('  npm install satori sharp @fontsource/playfair-display @fontsource/dm-mono');
    process.exit(1);
  }

  // Load fonts — woff1 (.woff) from @fontsource packages (satori supports woff1, not woff2)
  let playfairBold, playfairItalic, dmMono;
  try {
    const pfd = path.dirname(require.resolve('@fontsource/playfair-display/package.json'));
    const dmd = path.dirname(require.resolve('@fontsource/dm-mono/package.json'));
    playfairBold   = fs.readFileSync(path.join(pfd, 'files', 'playfair-display-latin-700-normal.woff'));
    playfairItalic = fs.readFileSync(path.join(pfd, 'files', 'playfair-display-latin-400-italic.woff'));
    dmMono         = fs.readFileSync(path.join(dmd, 'files', 'dm-mono-latin-400-normal.woff'));
  } catch (e) {
    console.error('✗ Could not load font files:', e.message);
    console.error('  Run: npm install @fontsource/playfair-display @fontsource/dm-mono');
    process.exit(1);
  }

  const fonts = [
    { name: 'Playfair Display', data: playfairBold,   weight: 700, style: 'normal' },
    { name: 'Playfair Display', data: playfairItalic,  weight: 400, style: 'italic' },
    { name: 'DM Mono',          data: dmMono,          weight: 400, style: 'normal' },
  ];

  const concepts = JSON.parse(fs.readFileSync(CONCEPTS_FILE, 'utf8'));

  if (!fs.existsSync(OG_OUT_DIR)) fs.mkdirSync(OG_OUT_DIR, { recursive: true });

  let generated = 0;
  let skipped   = 0;
  const total   = concepts.filter(c => !c.duplicate_of).length;

  console.log(`Generating ${total} OG images...`);

  for (const concept of concepts) {
    if (concept.duplicate_of) { skipped++; continue; }

    const el  = buildElement(concept);
    const svg = await satori(el, { width: 1200, height: 630, fonts });
    const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 8 }).toBuffer();

    fs.writeFileSync(path.join(OG_OUT_DIR, `${concept.id}.png`), png);
    generated++;

    if (generated % 50 === 0) {
      console.log(`  ${generated}/${total} done...`);
    }
  }

  console.log(`\n✓ Generated ${generated} OG images → /og/`);
  console.log(`✓ Skipped ${skipped} duplicate_of concepts`);
  console.log(`\nNext step: commit /og/ folder and push.`);
  console.log(`Vercel will serve images at https://epistemic.live/og/[id].png`);
}

main().catch(err => {
  console.error('✗ Fatal error:', err);
  process.exit(1);
});
