import { canPlacePiece, GRID_SIZE } from './gameLogic';

// -----------------------------------------------------------------------------
// Shape pool + difficulty.
//
// Every shape fits inside a 3x3 bounding box (the 3x3 square is the largest
// piece in the game). Rather than hand-writing every orientation, we define a
// few BASE shapes and generate all their unique rotations automatically -- that
// gives a lot of variety with no duplicated, hand-mistyped matrices.
//
// Tiers rank shapes by how easy they make it to BLAST a line -- which is what
// actually hooks a player -- not by how easy they are to drop somewhere.
//
// The property that matters is whether a shape TILES WITHOUT LEAVING HOLES.
// Rectangles and straight lines pack flush against each other and complete rows
// fast. Bends (L/J/T) leave small gaps. S/Z/plus/U leave gaps you can't fill
// without exactly the right follow-up piece.
//
//   tier 1 -> rectangular: lines, 2x2, 2x3. Tiles perfectly => frequent clears
//   tier 2 -> bends and big solids: corner, L, J, T, boot, 3x3
//   tier 3 -> hole-makers: S, Z, plus, U, big corner
//
// Note a 1x1 is trivially easy to PLACE but poor for clearing (it fills one cell
// and clutters the board), so it lives in tier 1 only as a light filler.
// -----------------------------------------------------------------------------

const BASE_SHAPES = [
  // ---------------- TIER 1: blast-friendly rectangles ----------------
  // `weight` biases picks within a tier. The big rectangles are the ones that
  // actually complete lines, so they dominate; the dot and domino are useful
  // gap-fillers but dull to play, so they stay occasional.
  { id: 'line3', tier: 1, weight: 3, matrix: [[1, 1, 1]] },
  { id: 'rect23', tier: 1, weight: 3, matrix: [[1, 1, 1], [1, 1, 1]] },
  { id: 'square2', tier: 1, weight: 3, matrix: [[1, 1], [1, 1]] },
  { id: 'domino', tier: 1, weight: 1, matrix: [[1, 1]] },
  { id: 'dot', tier: 1, weight: 1, matrix: [[1]] },

  // ---------------- TIER 2: bends + big solids ----------------
  { id: 'corner', tier: 2, matrix: [[1, 1], [1, 0]] },
  { id: 'jshape', tier: 2, matrix: [[0, 1], [0, 1], [1, 1]] },
  { id: 'lshape', tier: 2, matrix: [[1, 0], [1, 0], [1, 1]] },
  { id: 'tshape', tier: 2, matrix: [[1, 1, 1], [0, 1, 0]] },
  // Short L inside 2x3 (a.k.a. the "boot").
  { id: 'boot', tier: 2, matrix: [[1, 0, 0], [1, 1, 1]] },
  { id: 'square3', tier: 2, matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },

  // ---------------- TIER 3: hole-makers ----------------
  { id: 'sshape', tier: 3, matrix: [[0, 1, 1], [1, 1, 0]] },
  { id: 'zshape', tier: 3, matrix: [[1, 1, 0], [0, 1, 1]] },
  { id: 'plus', tier: 3, matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] },
  { id: 'bigcorner', tier: 3, matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
  // U -- awkward but very satisfying to slot in.
  { id: 'ushape', tier: 3, matrix: [[1, 0, 1], [1, 1, 1]] },
];

// Rotate a matrix 90 degrees clockwise.
function rotate90(m) {
  const rows = m.length;
  const cols = m[0].length;
  const out = [];
  for (let c = 0; c < cols; c++) {
    const row = [];
    for (let r = rows - 1; r >= 0; r--) row.push(m[r][c]);
    out.push(row);
  }
  return out;
}

const key = (m) => m.map((r) => r.join('')).join('/');

// Expand each base shape into its distinct rotations (1, 2 or 4 of them).
function expandRotations(shapes) {
  const out = [];
  shapes.forEach((shape) => {
    const seen = new Set();
    let m = shape.matrix;
    for (let i = 0; i < 4; i++) {
      const k = key(m);
      if (!seen.has(k)) {
        seen.add(k);
        out.push({
          // Distinct id per orientation so "no duplicates in a tray" also means
          // no two identical-looking pieces.
          id: `${shape.id}_r${i}`,
          family: shape.id,
          tier: shape.tier,
          weight: shape.weight || 1,
          matrix: m,
        });
      }
      m = rotate90(m);
    }
  });
  return out;
}

export const BLOCK_SHAPES = expandRotations(BASE_SHAPES);

// How many colors are defined per theme (blockColors 1..8).
const COLOR_COUNT = 8;

// Guarantee this many placeable pieces per tray when the board allows it.
const TARGET_PLACEABLE = 2;

// -----------------------------------------------------------------------------
// Difficulty curve.
//
// Paced by TRAYS COMPLETED, not by level. Levels only advance when the whole
// board is wiped (rare by design), so tying the shape mix to level meant a
// player could spend an entire game seeing only the handful of tier-1 shapes.
// Trays refill every 3 placements, so this ramps at a pace players actually feel.
//
// It never becomes permanently hard: every 5th tray is an easy breather and
// tier 3 is capped so late trays stay winnable.
// -----------------------------------------------------------------------------
export function difficultyForTrays(trays) {
  const t = Math.max(0, Math.floor(trays || 0));

  // Regular breather so the game never feels relentless.
  if (t > 0 && t % 6 === 0) return { name: 'Breather', weights: { 1: 8, 2: 3, 3: 0 } };

  // Opening hook: rectangles only. The board fills flush, lines complete almost
  // by accident, and the player gets a run of satisfying blasts straight away.
  if (t <= 3) return { name: 'Warm Up', weights: { 1: 10, 2: 0, 3: 0 } };

  // Bends start appearing, still comfortably blast-friendly.
  if (t <= 8) return { name: 'Easy', weights: { 1: 8, 2: 3, 3: 0 } };

  // First hole-makers, sparingly.
  if (t <= 15) return { name: 'Steady', weights: { 1: 6, 2: 4, 3: 1 } };

  if (t <= 25) return { name: 'Tricky', weights: { 1: 5, 2: 5, 3: 2 } };

  // Hard cap: tier 1 never drops below tier 3, so clears always stay achievable.
  return { name: 'Master', weights: { 1: 4, 2: 5, 3: 3 } };
}

export function difficultyName(trays) {
  return difficultyForTrays(trays).name;
}

// Build a pool where each shape appears `weight` times for its tier.
function buildWeightedPool(trays) {
  const { weights } = difficultyForTrays(trays);
  const pool = [];
  BLOCK_SHAPES.forEach((shape) => {
    // Tier weight (how common this difficulty band is) x per-shape weight (how
    // desirable this specific shape is within its band).
    const w = (weights[shape.tier] || 0) * shape.weight;
    for (let i = 0; i < w; i++) pool.push(shape);
  });
  return pool.length > 0 ? pool : BLOCK_SHAPES.filter((s) => s.tier === 1);
}

// Pick `count` distinct vivid colors (indices 1..COLOR_COUNT).
function pickDistinctColors(count) {
  const available = [];
  for (let i = 1; i <= COLOR_COUNT; i++) available.push(i);
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  const colors = [];
  for (let i = 0; i < count; i++) colors.push(available[i % available.length]);
  return colors;
}

// Does `matrix` fit anywhere on `grid`?
function fitsAnywhere(grid, matrix) {
  if (!grid) return true;
  const rows = matrix.length;
  const cols = matrix[0].length;
  for (let r = 0; r <= GRID_SIZE - rows; r++) {
    for (let c = 0; c <= GRID_SIZE - cols; c++) {
      if (canPlacePiece(grid, matrix, r, c)) return true;
    }
  }
  return false;
}

function makePiece(template, colorIndex, i) {
  return {
    instanceId: `piece_${Date.now()}_${i}_${Math.random()}`,
    id: template.id,
    family: template.family,
    matrix: template.matrix,
    tier: template.tier,
    colorIndex,
    used: false,
  };
}

/**
 * Generate a fresh set of tray pieces.
 *
 * Two guarantees that matter for how the game feels:
 *   1. VARIETY   -- no two pieces in a tray come from the same shape family, so
 *                   you never get three identical blocks at once.
 *   2. PLAYABLE  -- at least TARGET_PLACEABLE pieces fit the current board when
 *                   the board has room, so a tray is never an instant dead end.
 *
 * @param {number} count  Number of pieces (default 3).
 * @param {number} trays  Trays completed so far; drives the difficulty mix.
 * @param {number[][]} grid  Current board, used to guarantee playability.
 */
export function getRandomPieceSet(count = 3, trays = 0, grid = null) {
  const pool = buildWeightedPool(trays);
  const colors = pickDistinctColors(count);

  // Draw pieces, rejecting families already in this tray so the set looks varied.
  const pieces = [];
  const usedFamilies = new Set();
  for (let i = 0; i < count; i++) {
    let template = null;
    for (let attempt = 0; attempt < 24 && !template; attempt++) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (!usedFamilies.has(candidate.family)) template = candidate;
    }
    // Fallback: pool ran out of distinct families -> allow a repeat.
    if (!template) template = pool[Math.floor(Math.random() * pool.length)];
    usedFamilies.add(template.family);
    pieces.push(makePiece(template, colors[i], i));
  }

  if (!grid) return pieces;

  // Repair the tray so enough pieces are genuinely placeable.
  const options = BLOCK_SHAPES.filter((s) => fitsAnywhere(grid, s.matrix)).sort(
    (a, b) => a.tier - b.tier
  );
  if (options.length === 0) return pieces; // board is full; game over is fair

  const want = Math.min(TARGET_PLACEABLE, count, options.length);
  let fitting = pieces.filter((p) => fitsAnywhere(grid, p.matrix)).length;

  for (let i = 0; i < count && fitting < want; i++) {
    if (fitsAnywhere(grid, pieces[i].matrix)) continue;
    // Prefer a replacement whose family isn't already in the tray, to keep the
    // variety guarantee while making the tray playable.
    const fresh = options.filter((o) => !usedFamilies.has(o.family));
    const from = fresh.length > 0 ? fresh : options;
    const pick = from[Math.floor(Math.random() * Math.min(from.length, 8))];
    usedFamilies.delete(pieces[i].family);
    usedFamilies.add(pick.family);
    pieces[i] = makePiece(pick, pieces[i].colorIndex, i);
    fitting++;
  }

  return pieces;
}
