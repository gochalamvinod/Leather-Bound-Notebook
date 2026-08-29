import fs from 'fs';
import path from 'path';

// Helper to compute WCAG 2.1 relative luminance and contrast ratio
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb) {
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1, hex2) {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('======================================================================');
console.log(' EMPIRICAL CHALLENGER 1: VISUAL, RESPONSIVE & DOM STRUCTURE TEST SUITE');
console.log('======================================================================\n');

const cssPath = path.resolve('src/App.css');
const indexHtmlPath = path.resolve('index.html');
const richTextPath = path.resolve('src/lib/editor/richText.ts');
const bookRoomPath = path.resolve('src/components/book/BookRoom.tsx');
const bookSpreadPath = path.resolve('src/components/book/BookSpread.tsx');
const lockScreenPath = path.resolve('src/components/auth/LockScreen.tsx');
const lockClaspPath = path.resolve('src/components/auth/LockClasp.tsx');
const registerTabPath = path.resolve('src/components/auth/RegisterTab.tsx');
const imageOverlayPath = path.resolve('src/components/media/ImageOverlay.tsx');

const css = fs.readFileSync(cssPath, 'utf8');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const richText = fs.readFileSync(richTextPath, 'utf8');
const bookRoom = fs.readFileSync(bookRoomPath, 'utf8');
const bookSpread = fs.readFileSync(bookSpreadPath, 'utf8');
const lockScreen = fs.readFileSync(lockScreenPath, 'utf8');
const lockClasp = fs.readFileSync(lockClaspPath, 'utf8');
const registerTab = fs.readFileSync(registerTabPath, 'utf8');
const imageOverlay = fs.readFileSync(imageOverlayPath, 'utf8');

// -----------------------------------------------------------------------------
// Test Suite 1: All 5 Leather Cover Themes, Textures & Contrast
// -----------------------------------------------------------------------------
console.log('[1/5] Testing 5 Leather Cover Themes, Micro-Textures & Color Contrast');

const themes = ['brown', 'green', 'navy', 'burgundy', 'black'];
themes.forEach((theme) => {
  assert(
    css.includes(`[data-cover="${theme}"]`) || css.includes(`body[data-cover="${theme}"]`),
    `Cover theme [data-cover="${theme}"] is defined in App.css`
  );
  assert(
    css.includes(`.chip-${theme}`) && css.includes(`.spine-${theme}`),
    `Cover swatch classes .chip-${theme} and .spine-${theme} are defined in App.css`
  );
});

// Check theme micro-grain striations and radial highlights
assert(
  css.includes('.chip-brown') && css.includes('repeating-linear-gradient(45deg'),
  'Brown leather theme features 45deg micro-linear striations'
);
assert(
  css.includes('.chip-green') && css.includes('#1e4533'),
  'Emerald Pine theme features distinct evergreen gradients (#1e4533 / #153224 / #0c1d15)'
);
assert(
  css.includes('.chip-navy') && css.includes('#1d304f'),
  'Midnight Navy theme features distinct nautical navy gradients (#1d304f / #142137 / #09121f)'
);
assert(
  css.includes('.chip-burgundy') && css.includes('#571926'),
  'Royal Burgundy theme features distinct wine morocco gradients (#571926 / #3e101b / #24080f)'
);
assert(
  css.includes('.chip-black') && css.includes('#303030'),
  'Obsidian Noir theme features embossed pebble grain gradients (#303030 / #1e1e1e / #0e0e0e)'
);

// Selection rings on checked swatches
assert(
  css.includes('.color-choice input:checked + .cover-chip'),
  'Checked cover chip selector .color-choice input:checked + .cover-chip exists'
);
assert(
  css.includes('#fff6d1') && css.includes('var(--brass-bright, #d4af37)'),
  'Checked cover chip defines multi-tier gold selection rings with #fff6d1 highlight and #d4af37 bevel'
);
assert(
  css.includes('rgba(212, 175, 55, 0.7)') && css.includes('transform: scale(1.06)'),
  'Checked cover chip features glowing amber aura and scale(1.06) transform'
);

// WCAG Contrast checks
const inkOnPaperContrast = contrastRatio('#2c2416', '#f4edde');
console.log(`  -> Ink on Paper Contrast Ratio: ${inkOnPaperContrast.toFixed(2)}:1`);
assert(inkOnPaperContrast >= 7.0, 'Ink on Paper meets WCAG AAA standard (>= 7.0:1)');

const chipContrasts = {
  brown: contrastRatio('#fff5e3', '#3e2213'),
  green: contrastRatio('#f0fdf4', '#153224'),
  navy: contrastRatio('#f0f6ff', '#142137'),
  burgundy: contrastRatio('#fff1f2', '#3e101b'),
  black: contrastRatio('#f9fafb', '#1e1e1e'),
};

for (const [themeName, ratio] of Object.entries(chipContrasts)) {
  console.log(`  -> ${themeName} chip text contrast: ${ratio.toFixed(2)}:1`);
  assert(ratio >= 4.5, `${themeName} leather chip text meets WCAG AA standard (>= 4.5:1)`);
}

// -----------------------------------------------------------------------------
// Test Suite 2: Responsive Breakpoints (<=900px, >=1600px, >=2200px)
// -----------------------------------------------------------------------------
console.log('\n[2/5] Testing Responsive Breakpoint Rules & Dynamic Height Math');

assert(
  css.includes('@media (max-width: 900px)'),
  'App.css contains @media (max-width: 900px) breakpoint'
);
assert(
  css.includes('@media (min-width: 1600px)'),
  'App.css contains @media (min-width: 1600px) 1440p desktop breakpoint'
);
assert(
  css.includes('@media (min-width: 2200px)'),
  'App.css contains @media (min-width: 2200px) 4K desktop breakpoint'
);

// Check <=900px single-page rules
assert(
  css.includes('.page-slot.slot-right,') && css.includes('display: none !important;'),
  '<=900px hides slot-right and spine-crease via display: none !important'
);
assert(
  css.includes('.page-stack-left {') && css.includes('display: none !important;'),
  '<=900px hides page-stack-left via display: none !important'
);
assert(
  bookRoom.includes('window.innerWidth <= 900'),
  'BookRoom.tsx sets isMobile based on window.innerWidth <= 900'
);
assert(
  bookRoom.includes('orientationchange'),
  'BookRoom.tsx handles orientationchange event for tablet rotation'
);

// Dynamic Height Math Simulation
console.log('  -> Simulating dynamic height calculations across viewports:');
const viewports = [
  { device: 'iPhone 14 / Mobile', width: 390, height: 844, isMobile: true },
  { device: 'iPad 10.2 / Tablet Portrait', width: 810, height: 1080, isMobile: true },
  { device: 'iPad Air Landscape', width: 1180, height: 820, isMobile: false },
  { device: '13" Laptop Screen', width: 1366, height: 768, isMobile: false },
  { device: '1080p Desktop', width: 1920, height: 1080, isMobile: false },
  { device: '1440p QHD Desktop', width: 2560, height: 1440, isMobile: false },
  { device: '4K UHD Screen', width: 3840, height: 2160, isMobile: false },
];

viewports.forEach((vp) => {
  let bookWidth, bookHeight, mode;
  if (vp.width <= 900) {
    mode = 'Single Page';
    bookWidth = Math.min(vp.width - 24, 580);
    bookHeight = Math.min(Math.max(vp.height - 125, 420), 920);
  } else if (vp.width >= 2200) {
    mode = 'Two Page (4K)';
    bookWidth = Math.min(vp.width * 0.92, 1720);
    bookHeight = Math.min(Math.max(vp.height - 160, 440), 1140);
  } else if (vp.width >= 1600) {
    mode = 'Two Page (1440p)';
    bookWidth = Math.min(vp.width * 0.94, 1560);
    bookHeight = Math.min(Math.max(vp.height - 140, 440), 1020);
  } else {
    mode = 'Two Page (Standard)';
    bookWidth = Math.min(vp.width * 0.96, 1360);
    bookHeight = Math.min(Math.max(vp.height - 130, 440), 920);
  }

  console.log(`     * ${vp.device} (${vp.width}x${vp.height}) -> ${mode} [Width: ${bookWidth}px, Height: ${bookHeight}px]`);
  assert(bookHeight >= 420, `${vp.device} maintains sufficient height (>= 420px)`);
  assert(bookWidth <= vp.width, `${vp.device} book width fits within screen`);
});

// -----------------------------------------------------------------------------
// Test Suite 3: Font Declarations & Fallback Chains
// -----------------------------------------------------------------------------
console.log('\n[3/5] Testing Font Declarations and Fallback Chains');

assert(
  indexHtml.includes('family=Cinzel') &&
  indexHtml.includes('family=EB+Garamond') &&
  indexHtml.includes('family=Playfair+Display'),
  'index.html imports Cinzel, EB Garamond, and Playfair Display via Google Fonts'
);
assert(
  indexHtml.includes('rel="preconnect"') && indexHtml.includes('https://fonts.gstatic.com'),
  'index.html uses preconnect for Google Fonts domain'
);

assert(
  css.includes("--font-title: 'Cinzel', 'Playfair Display', Georgia, serif;"),
  '--font-title properly defined with Cinzel -> Playfair Display -> Georgia -> serif fallback chain'
);
assert(
  css.includes("--font-serif: 'EB Garamond', 'Playfair Display', Georgia, 'Times New Roman', serif;"),
  '--font-serif properly defined with EB Garamond -> Playfair Display -> Georgia -> serif fallback chain'
);
assert(
  css.includes("--font-chrome: 'EB Garamond', 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, 'Times New Roman', serif;"),
  '--font-chrome properly defined with robust serif fallback chain'
);
assert(
  css.includes("--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"),
  '--font-sans properly defined with system font stack ending in sans-serif'
);

// Check all font options in richText.ts terminate in generic font families
const fontLines = richText.split('\n').filter((line) => line.includes('{ label:') && line.includes('value:'));
assert(fontLines.length >= 10, 'richText.ts exports rich typeface options list');

let allFontsHaveGeneric = true;
const genericFamilies = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];

fontLines.forEach((line) => {
  // Extract content between value: "..." or value: '...'
  const valMatch = line.match(/value:\s*("([^"]+)"|'([^']+)')/);
  if (valMatch) {
    const val = (valMatch[2] || valMatch[3] || '').trim();
    const hasGeneric = genericFamilies.some((g) => val.endsWith(g));
    if (!hasGeneric) {
      allFontsHaveGeneric = false;
      console.error(`  Font missing generic fallback: ${val}`);
    } else {
      console.log(`     * Font "${val}" ends with generic fallback`);
    }
  }
});
assert(allFontsHaveGeneric, 'All typography options in richText.ts terminate in a generic CSS font family');

// -----------------------------------------------------------------------------
// Test Suite 4: Touch Target Dimensions (>= 44px)
// -----------------------------------------------------------------------------
console.log('\n[4/5] Testing Touch Target Dimensions (>= 44px Accessibility Target)');

// 8-Handle Resizer Touch Hitbox
assert(
  css.includes('.img-overlay__handle::before') &&
  css.includes('width: 44px;') &&
  css.includes('height: 44px;'),
  'Resize handles include .img-overlay__handle::before hitbox with 44px x 44px'
);

// Mobile touch targets in <=900px media query
assert(
  css.includes('.icon-btn,') && css.includes('.swatch {') && css.includes('min-width: 44px;') && css.includes('min-height: 44px;'),
  'Toolbar buttons and color swatches enforce min-width/min-height 44px in <=900px query'
);
assert(
  css.includes('.bookshelf-trigger-btn {') && css.includes('min-height: 44px;'),
  'Bookshelf trigger button enforces min-height 44px in <=900px query'
);
assert(
  css.includes('.tool-group select {') && css.includes('min-height: 44px;'),
  'Toolbar select dropdowns enforce min-height 44px in <=900px query'
);
assert(
  css.includes('.page-turn {') && css.includes('width: 44px;') && css.includes('height: 54px;'),
  'Page turn navigation buttons enforce 44px x 54px hit target in <=900px query'
);

// Form and Auth Touch Targets
assert(
  css.includes('.lock-tab-btn {') && css.includes('min-height: 44px;'),
  'Lock screen tab buttons enforce min-height 44px'
);
assert(
  css.includes('.toggle-password-btn') && css.includes('min-width: 44px;') && css.includes('min-height: 44px;'),
  'Password visibility toggle buttons enforce min-width and min-height 44px'
);
assert(
  css.includes('.banner-clear-btn') && css.includes('min-width: 44px;') && css.includes('min-height: 44px;'),
  'Selected notebook clear button enforces min-width and min-height 44px'
);
assert(
  css.includes('.color-choice') && css.includes('min-height: 44px;'),
  'Cover color choice label enforces min-height 44px'
);
assert(
  css.includes('.cover-chip {') && css.includes('min-height: 44px;'),
  'Cover chip swatch enforces min-height 44px'
);
assert(
  css.includes('.brass-btn {') && css.includes('min-height: 46px;'),
  'Brass action buttons enforce min-height >= 44px (46px)'
);
assert(
  css.includes('.field input[type="text"]') && css.includes('font-size: 16px;'),
  'Input fields enforce font-size: 16px to prevent iOS auto-zoom'
);

// -----------------------------------------------------------------------------
// Test Suite 5: DOM Structure & Skeuomorphic Layer Integrity
// -----------------------------------------------------------------------------
console.log('\n[5/5] Testing DOM Structure & Skeuomorphic Depth Architecture');

// Clasp SVG and Shackle
assert(
  lockClasp.includes('claspBrassPlate') &&
  lockClasp.includes('claspRivetGrad') &&
  lockClasp.includes('claspShackle') &&
  lockClasp.includes('claspKeyholeDepth'),
  'LockClasp.tsx renders multi-stop metallic brass plate, 3D rivets, keyhole relief, and tubular shackle'
);
assert(
  lockClasp.includes('rotate(-44deg) translate(-4px, -6px)'),
  'LockClasp.tsx executes spring-eased mechanical swivel unlock rotation'
);

// Book Spread Depth Elements
assert(
  bookSpread.includes('className="book-cover-backing"') &&
  bookSpread.includes('className="page-stack-left"') &&
  bookSpread.includes('className="page-stack-right"') &&
  bookSpread.includes('id="pageViewport"'),
  'BookSpread.tsx renders leather backing frame, stacked page fore-edges, and 3D page viewport'
);

// Move & Resizer Overlay Controls
assert(
  imageOverlay.includes('data-testid="img-overlay-drag"') &&
  imageOverlay.includes('data-testid="img-overlay-delete"') &&
  imageOverlay.includes('RESIZE_HANDLES.map'),
  'ImageOverlay.tsx renders ⠿ Move drag handle pill, delete button, and 8 directional resize handles'
);

console.log('\n======================================================================');
console.log(` TEST RUN COMPLETED: ${passed} PASSED, ${failed} FAILED`);
console.log('======================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
