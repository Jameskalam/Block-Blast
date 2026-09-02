// -----------------------------------------------------------------------------
// Level backgrounds.
//
// CURRENTLY UNUSED. The game now takes its palette from the player's selected
// (purchased) theme on every screen, because overriding it here meant a theme
// someone spent coins on was invisible during play. Kept because it's
// self-contained: wire `applyLevelBackground(theme, level)` back into
// GameScreen if per-level backgrounds are ever wanted as an opt-in setting.
//
// Clearing every shape in the tray completes a level and unlocks a brand-new
// background. Levels never run out: the first CURATED palettes are handcrafted,
// and everything past that is generated procedurally from the level number.
// Level 100 (or 1000) therefore has its own unique, guaranteed-attractive look.
//
// Generation is deterministic -- level 42 always looks the same on every device,
// so players can compare progress.
// -----------------------------------------------------------------------------

// Hand-tuned opening palettes so the first impression is polished.
const CURATED = [
  { name: 'Midnight', bg: '#0f172a', accent: '#38bdf8' },
  { name: 'Grape Soda', bg: '#2e1065', accent: '#e879f9' },
  { name: 'Deep Ocean', bg: '#082f49', accent: '#22d3ee' },
  { name: 'Ember', bg: '#3f1004', accent: '#fb923c' },
  { name: 'Forest', bg: '#052e1a', accent: '#4ade80' },
  { name: 'Royal', bg: '#1e1b4b', accent: '#a78bfa' },
  { name: 'Cherry', bg: '#4c0519', accent: '#fb7185' },
  { name: 'Teal Dream', bg: '#042f2e', accent: '#2dd4bf' },
  { name: 'Sunset', bg: '#431407', accent: '#fbbf24' },
  { name: 'Cosmic', bg: '#1a103d', accent: '#818cf8' },
  { name: 'Rose Noir', bg: '#500724', accent: '#f472b6' },
  { name: 'Steel Blue', bg: '#0c1a2e', accent: '#60a5fa' },
];

// Names cycled for generated levels, chosen by hue so the word matches the color.
const HUE_NAMES = [
  { max: 20, words: ['Crimson', 'Scarlet', 'Ruby'] },
  { max: 45, words: ['Amber', 'Copper', 'Sunrise'] },
  { max: 70, words: ['Gold', 'Honey', 'Citrus'] },
  { max: 100, words: ['Lime', 'Meadow', 'Fern'] },
  { max: 160, words: ['Emerald', 'Jade', 'Pine'] },
  { max: 200, words: ['Aqua', 'Lagoon', 'Mint'] },
  { max: 240, words: ['Azure', 'Sapphire', 'Tide'] },
  { max: 280, words: ['Indigo', 'Cobalt', 'Nebula'] },
  { max: 320, words: ['Violet', 'Orchid', 'Amethyst'] },
  { max: 360, words: ['Magenta', 'Fuchsia', 'Blossom'] },
];

function nameForHue(hue, level) {
  const band = HUE_NAMES.find((b) => hue < b.max) || HUE_NAMES[HUE_NAMES.length - 1];
  const word = band.words[level % band.words.length];
  return word;
}

// Small deterministic PRNG so a level always generates the same palette.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToHex(h, s, l) {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.max(0, Math.min(1, s));
  const ln = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const hp = hn / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = ln - c / 2;
  const to255 = (v) => {
    const n = Math.round((v + m) * 255);
    return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  };
  return `#${to255(r)}${to255(g)}${to255(b)}`;
}

// Golden-angle hue rotation: consecutive levels look clearly different, yet
// every hue stays evenly distributed around the wheel (never two muddy
// neighbours in a row).
const GOLDEN_ANGLE = 137.508;

/**
 * Background palette for a level (1-based). Always returns a dark, saturated
 * background so the bright block colors on top stay readable.
 */
export function getBackgroundForLevel(level) {
  const lv = Math.max(1, Math.floor(level || 1));

  if (lv <= CURATED.length) {
    const c = CURATED[lv - 1];
    return buildPalette(c.bg, c.accent, c.name, lv);
  }

  // Procedural: deterministic hue + gentle random variation in depth/vividness.
  const rand = mulberry32(lv * 2654435761);
  const hue = (lv * GOLDEN_ANGLE) % 360;
  const bgSat = 0.55 + rand() * 0.3; // 0.55..0.85 -> rich, never grey
  const bgLight = 0.09 + rand() * 0.06; // 0.09..0.15 -> always dark
  const accentHue = (hue + 150 + rand() * 60) % 360; // contrasting accent
  const bg = hslToHex(hue, bgSat, bgLight);
  const accent = hslToHex(accentHue, 0.85, 0.62);
  return buildPalette(bg, accent, nameForHue(hue, lv), lv);
}

// Expand a background + accent into the full theme shape the UI expects.
function buildPalette(bgSolid, accent, name, level) {
  return {
    level,
    name,
    bgSolid,
    accent,
    accentSecondary: accent,
    // Board sits slightly darker than the background for depth.
    boardBg: 'rgba(0,0,0,0.42)',
    cardBg: 'rgba(255,255,255,0.10)',
    emptyCell: 'rgba(255,255,255,0.07)',
    cellBorder: 'rgba(255,255,255,0.14)',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.72)',
  };
}

/**
 * Merge a level's background into the player's chosen theme.
 *
 * The level controls the background/board/accent (that's the visible reward for
 * progressing), while the theme keeps supplying `blockColors` so purchased
 * themes still change how the pieces look. Generated backgrounds are always
 * dark, so any theme's bright blocks stay legible on top.
 */
export function applyLevelBackground(theme, level) {
  const bg = getBackgroundForLevel(level);
  return {
    ...theme,
    level: bg.level,
    levelName: bg.name,
    bgSolid: bg.bgSolid,
    boardBg: bg.boardBg,
    cardBg: bg.cardBg,
    emptyCell: bg.emptyCell,
    cellBorder: bg.cellBorder,
    accent: bg.accent,
    accentSecondary: bg.accentSecondary,
    text: bg.text,
    textMuted: bg.textMuted,
  };
}
