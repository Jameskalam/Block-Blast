// Every shape carries a `tier` used by the difficulty curve:
//   tier 1 -> basic & friendly (1x1, lines 2-3, small square, small corners - easy for beginners/kids)
//   tier 2 -> little advanced (line 4, 2x3 rectangles, standard 3-high L and T shapes)
//   tier 3 -> more advanced (3x3 big square, S/Z shapes, plus, big 3x3 L, line 5)
export const BLOCK_SHAPES = [
  // ---------------- TIER 1: Basic / Friendly blocks ----------------
  { id: 'single_1', tier: 1, matrix: [[1]] },
  { id: 'h_line_2', tier: 1, matrix: [[1, 1]] },
  { id: 'v_line_2', tier: 1, matrix: [[1], [1]] },
  { id: 'h_line_3', tier: 1, matrix: [[1, 1, 1]] },
  { id: 'v_line_3', tier: 1, matrix: [[1], [1], [1]] },
  {
    id: 'square_2x2',
    tier: 1,
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    id: 'corner_2x2_1',
    tier: 1,
    matrix: [
      [1, 1],
      [1, 0],
    ],
  },
  {
    id: 'corner_2x2_2',
    tier: 1,
    matrix: [
      [1, 1],
      [0, 1],
    ],
  },
  {
    id: 'corner_2x2_3',
    tier: 1,
    matrix: [
      [1, 0],
      [1, 1],
    ],
  },
  {
    id: 'corner_2x2_4',
    tier: 1,
    matrix: [
      [0, 1],
      [1, 1],
    ],
  },

  // ---------------- TIER 2: Little Advanced (Introduced after 5-6 blasts) ----------------
  { id: 'h_line_4', tier: 2, matrix: [[1, 1, 1, 1]] },
  { id: 'v_line_4', tier: 2, matrix: [[1], [1], [1], [1]] },
  {
    id: 'rect_2x3',
    tier: 2,
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  {
    id: 'rect_3x2',
    tier: 2,
    matrix: [
      [1, 1],
      [1, 1],
      [1, 1],
    ],
  },
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
    id: 't_shape_2',
    tier: 2,
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },

  // ---------------- TIER 3: More Advanced (Heavy Complexity) ----------------
  {
    id: 'square_3x3',
    tier: 3,
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
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
    id: 'l_big_1',
    tier: 3,
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  {
    id: 'l_big_2',
    tier: 3,
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
  { id: 'h_line_5', tier: 3, matrix: [[1, 1, 1, 1, 1]] },
  { id: 'v_line_5', tier: 3, matrix: [[1], [1], [1], [1], [1]] },
];

// How many colors are defined per theme (blockColors 1..8).
const COLOR_COUNT = 8;

// Difficulty phases mapped to number of completed line blasts:
//   Phase 1 (0 to 4 blasts): 100% basic blocks!
//   Phase 2 (5 to 11 blasts): Candy Pop! Vibrant colors for kids + little advanced blocks.
//   Phase 3 (12 to 21 blasts): Rainbow Frenzy! High-energy neon + more advanced blocks.
//   Phase 4 (22+ blasts): Bonus Breather! Gives simpler blocks so the player doesn't get boxed in.
export const DIFFICULTY_PHASES = [
  {
    name: 'Starter',
    displayName: 'Phase 1: Starter',
    minBlasts: 0,
    themeId: 'ocean',
    weights: { 1: 10, 2: 0, 3: 0 },
    bannerSub: 'Easy & Fun Blocks!',
    bannerColor: '#38ef7d',
  },
  {
    name: 'Candy Blast',
    displayName: 'Phase 2: Candy Pop!',
    minBlasts: 5,
    themeId: 'candy',
    weights: { 1: 5, 2: 5, 3: 0 },
    bannerSub: '🍬 Sweet New Colors & Shapes!',
    bannerColor: '#ff5ecb',
  },
  {
    name: 'Rainbow Pop',
    displayName: 'Phase 3: Rainbow Frenzy!',
    minBlasts: 12,
    themeId: 'rainbow',
    weights: { 1: 3, 2: 5, 3: 3 },
    bannerSub: '🌈 Rainbow Master Challenge!',
    bannerColor: '#00d4ff',
  },
  {
    name: 'Bonus Wave',
    displayName: 'Bonus Breather!',
    minBlasts: 22,
    themeId: 'candy',
    weights: { 1: 7, 2: 3, 3: 1 },
    bannerSub: '⭐ Clear the Board!',
    bannerColor: '#ffd21e',
  },
];

/**
 * Get active phase object from the total blasts achieved in the current game.
 */
export function getPhaseForBlasts(blastsCount = 0) {
  let activePhase = DIFFICULTY_PHASES[0];
  for (let i = 0; i < DIFFICULTY_PHASES.length; i++) {
    if (blastsCount >= DIFFICULTY_PHASES[i].minBlasts) {
      activePhase = DIFFICULTY_PHASES[i];
    }
  }
  return activePhase;
}

export function phaseNameForBlasts(blastsCount = 0) {
  return getPhaseForBlasts(blastsCount).name;
}

// Backward-compatible fallback for round-based queries
export function phaseIndexForRound(round = 0) {
  return Math.min(Math.floor(round / 2), DIFFICULTY_PHASES.length - 1);
}

export function phaseNameForRound(round = 0) {
  return DIFFICULTY_PHASES[phaseIndexForRound(round)].name;
}

// Build a pool of shapes where each shape appears `weight` times based on its
// tier for the current blast milestone.
function buildWeightedPool(blastsCount = 0) {
  const phase = getPhaseForBlasts(blastsCount);
  const weights = phase.weights;
  const pool = [];
  BLOCK_SHAPES.forEach((shape) => {
    const w = weights[shape.tier] || 0;
    for (let i = 0; i < w; i++) pool.push(shape);
  });
  return pool.length > 0 ? pool : BLOCK_SHAPES;
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
  for (let i = 0; i < count; i++) {
    colors.push(available[i % available.length]);
  }
  return colors;
}

/**
 * Generate a fresh set of tray pieces.
 * @param {number} count        Number of pieces (default 3).
 * @param {number} round        Round counter.
 * @param {number} blastsCount  Total line blasts achieved this run.
 */
export function getRandomPieceSet(count = 3, round = 0, blastsCount = 0) {
  const pool = buildWeightedPool(blastsCount);
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
