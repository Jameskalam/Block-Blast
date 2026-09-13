export const BLOCK_SHAPES = [
  // Single dot
  {
    id: 'single_1',
    matrix: [[1]],
    colorIndex: 1,
  },
  // 2x2 Square
  {
    id: 'square_2x2',
    matrix: [
      [1, 1],
      [1, 1]
    ],
    colorIndex: 2,
  },
  // 3x3 Square
  {
    id: 'square_3x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    colorIndex: 3,
  },
  // Horizontal 2
  {
    id: 'h_line_2',
    matrix: [[1, 1]],
    colorIndex: 4,
  },
  // Vertical 2
  {
    id: 'v_line_2',
    matrix: [[1], [1]],
    colorIndex: 5,
  },
  // Horizontal 3
  {
    id: 'h_line_3',
    matrix: [[1, 1, 1]],
    colorIndex: 6,
  },
  // Vertical 3
  {
    id: 'v_line_3',
    matrix: [[1], [1], [1]],
    colorIndex: 7,
  },
  // Horizontal 4
  {
    id: 'h_line_4',
    matrix: [[1, 1, 1, 1]],
    colorIndex: 8,
  },
  // L Shape
  {
    id: 'l_shape_1',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1]
    ],
    colorIndex: 1,
  },
  // Reverse L
  {
    id: 'l_shape_2',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1]
    ],
    colorIndex: 2,
  },
  // T Shape
  {
    id: 't_shape_1',
    matrix: [
      [1, 1, 1],
      [0, 1, 0]
    ],
    colorIndex: 3,
  },
  // Corner 2x2
  {
    id: 'corner_2x2',
    matrix: [
      [1, 1],
      [1, 0]
    ],
    colorIndex: 4,
  }
];

export function getRandomPieceSet(count = 3) {
  const pieces = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
    const template = BLOCK_SHAPES[randomIndex];
    // Random color override for extra variety
    const colorOverride = Math.floor(Math.random() * 8) + 1;
    pieces.push({
      instanceId: `piece_${Date.now()}_${i}_${Math.random()}`,
      id: template.id,
      matrix: template.matrix,
      colorIndex: colorOverride,
      used: false
    });
  }
  return pieces;
}
