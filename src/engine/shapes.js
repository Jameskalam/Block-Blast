// Every shape carries a `tier` used by the difficulty curve:
//   tier 1 -> big & simple (satisfying, easy to place on an open board)
//   tier 2 -> medium complexity (L / T / short lines)
//   tier 3 -> complex & irregular (single dots, S / Z / plus)
export const BLOCK_SHAPES = [
  // ---------------- TIER 1: big & simple ----------------
  {
    id: 'square_3x3',
    tier: 1,
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  {
    id: 'square_2x2',
    tier: 1,
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'rect_2x3',
    tier: 1,
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  {
    id: 'rect_3x2',
    tier: 1,
    matrix: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'h_line_4',
    tier: 1,
    matrix: [[1, 1, 1, 1]],
  },
  {
    id: 'v_line_4',
    tier: 1,
    matrix: [[1], [1], [1], [1]],
  },
  {
    id: 'h_line_3',
    tier: 1,
    matrix: [[1, 1, 1]],
  },
  {
    id: 'v_line_3',
    tier: 1,
    matrix: [[1], [1], [1]],
  },

  // ---------------- TIER 2: medium ----------------
  {
    id: 'l_shape_1',
    tier: 2,
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: 'l_shape_2',
    tier: 2,
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  },
  {
    id: 'l_shape_3',
    tier: 2,
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
  },
  {
    id: 'l_shape_4',
    tier: 2,
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  },
  {
    id: 't_shape_1',
    tier: 2,
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    id: 'corner_2x2',
    tier: 2,
    matrix: [
      [1, 1],
      [1, 0],
    ],
  },
  {
    id: 'h_line_2',
    tier: 2,
    matrix: [[1, 1]],
  },
  {
    id: 'v_line_2',
    tier: 2,
    matrix: [[1], [1]],
  },

  // ---------------- TIER 3: complex & irregular ----------------
  {
    id: 'single_1',
    tier: 3,
    matrix: [[1]],
  },
  {
    id: 's_shape',
    tier: 3,
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  {
    id: 'z_shape',
    tier: 3,
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  {
    id: 'plus_shape',
    tier: 3,
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    id: 'l_big',
    tier: 3,
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
];

// How many colors are defined per theme (blockColors 1..8).
const COLOR_COUNT = 8;

// Difficulty phases, from gentlest to hardest. Each defines how tier-1 (big &
// simple), tier-2 (medium) and tier-3 (complex) shapes are weighted in the pool.
export const DIFFICULTY_PHASES = [
  { name: 'Very Easy', weights: { 1: 10, 2: 1, 3: 0 } },
  { name: 'Easy', weights: { 1: 7, 2: 3, 3: 0 } },
  { name: 'Medium', weights: { 1: 3, 2: 5, 3: 2 } },
  { name: 'Complex', weights: { 1: 1, 2: 4, 3: 5 } },
];

// Rounds (tray refills) spent at each phase before advancing. Kept short but
// >1 so the change is gentle rather than jarring.
const ROUNDS_PER_PHASE = 2;

// Map a round number to a difficulty phase index using a repeating sawtooth:
//   Very Easy -> Easy -> Medium -> Complex -> Very Easy -> ...
// This keeps the game from getting permanently hard: after a Complex stretch it
// resets to Very Easy so players of all ages get regular breathers.
export function phaseIndexForRound(round) {
  const step = Math.floor(Math.max(0, round) / ROUNDS_PER_PHASE);
  return step % DIFFICULTY_PHASES.length;
}

export function phaseNameForRound(round) {
  return DIFFICULTY_PHASES[phaseIndexForRound(round)].name;
}

// Build a pool of shapes where each shape appears `weight` times based on its
// tier, so a weighted random pick respects the current difficulty phase.
function buildWeightedPool(round) {
  const weights = DIFFICULTY_PHASES[phaseIndexForRound(round)].weights;
  const pool = [];
  BLOCK_SHAPES.forEach((shape) => {
    const w = weights[shape.tier] || 0;
    for (let i = 0; i < w; i++) pool.push(shape);
  });
  // Safety net: never return an empty pool.
  return pool.length > 0 ? pool : BLOCK_SHAPES;
}

// Pick `count` distinct vivid colors (indices 1..COLOR_COUNT). Falls back to
// allowing repeats only if more pieces than available colors are requested.
function pickDistinctColors(count) {
  const available = [];
  for (let i = 1; i <= COLOR_COUNT; i++) available.push(i);
  // Fisher-Yates shuffle
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(available[i % available.length]);
  }
  return colors;
}

/**
 * Generate a fresh set of tray pieces.
 * @param {number} count  Number of pieces (default 3).
 * @param {number} round  Round number (tray refill count). Difficulty cycles
 *                        gently through phases based on this.
 */
export function getRandomPieceSet(count = 3, round = 0) {
  const pool = buildWeightedPool(round);
  const colors = pickDistinctColors(count);
  const pieces = [];

  for (let i = 0; i < count; i++) {
    const template = pool[Math.floor(Math.random() * pool.length)];
    pieces.push({
      instanceId: `piece_${Date.now()}_${i}_${Math.random()}`,
      id: template.id,
      matrix: template.matrix,
      colorIndex: colors[i],
      used: false,
    });
  }
  return pieces;
}
