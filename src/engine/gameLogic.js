export const GRID_SIZE = 8;

export function createEmptyGrid() {
  const grid = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push(0);
    }
    grid.push(row);
  }
  return grid;
}

export function canPlacePiece(grid, matrix, startRow, startCol) {
  const numRows = matrix.length;
  const numCols = matrix[0].length;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (matrix[r][c] !== 0) {
        const gridR = startRow + r;
        const gridC = startCol + c;

        // Check boundary limits
        if (gridR < 0 || gridR >= GRID_SIZE || gridC < 0 || gridC >= GRID_SIZE) {
          return false;
        }

        // Check if grid space is already occupied
        if (grid[gridR][gridC] !== 0) {
          return false;
        }
      }
    }
  }
  return true;
}

export function placePieceOnGrid(grid, matrix, startRow, startCol, colorIndex) {
  const newGrid = grid.map(row => [...row]);
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  let blocksPlacedCount = 0;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (matrix[r][c] !== 0) {
        newGrid[startRow + r][startCol + c] = colorIndex;
        blocksPlacedCount++;
      }
    }
  }

  return { newGrid, blocksPlacedCount };
}

export function checkLinesAndClear(grid) {
  const newGrid = grid.map(row => [...row]);
  const fullRows = [];
  const fullCols = [];
  const clearedCells = [];

  // 1. Identify full rows
  for (let r = 0; r < GRID_SIZE; r++) {
    let isFull = true;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      fullRows.push(r);
    }
  }

  // 2. Identify full columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let isFull = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === 0) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      fullCols.push(c);
    }
  }

  // Collect cleared cells for blast particle FX before resetting grid
  const cellSet = new Set();
  fullRows.forEach(r => {
    for (let c = 0; c < GRID_SIZE; c++) {
      cellSet.add(`${r}_${c}`);
    }
  });
  fullCols.forEach(c => {
    for (let r = 0; r < GRID_SIZE; r++) {
      cellSet.add(`${r}_${c}`);
    }
  });

  cellSet.forEach(key => {
    const [r, c] = key.split('_').map(Number);
    clearedCells.push({ r, c, color: grid[r][c] });
    newGrid[r][c] = 0;
  });

  const totalLinesCleared = fullRows.length + fullCols.length;
  let lineScore = 0;

  if (totalLinesCleared === 1) {
    lineScore = 100;
  } else if (totalLinesCleared === 2) {
    lineScore = 300;
  } else if (totalLinesCleared === 3) {
    lineScore = 600;
  } else if (totalLinesCleared >= 4) {
    lineScore = 1000 + (totalLinesCleared - 4) * 500;
  }

  return {
    newGrid,
    fullRows,
    fullCols,
    clearedCells,
    totalLinesCleared,
    lineScore
  };
}

export function canAnyPieceFit(grid, pieceSet) {
  const unusedPieces = pieceSet.filter(p => !p.used);
  if (unusedPieces.length === 0) return true; // Will generate new set

  for (const piece of unusedPieces) {
    const numRows = piece.matrix.length;
    const numCols = piece.matrix[0].length;

    for (let r = 0; r <= GRID_SIZE - numRows; r++) {
      for (let c = 0; c <= GRID_SIZE - numCols; c++) {
        if (canPlacePiece(grid, piece.matrix, r, c)) {
          return true;
        }
      }
    }
  }

  return false;
}

// True when not a single block is left on the board. Wiping the board is the
// level-complete condition, so this drives level (and background) progression.
export function isGridEmpty(grid) {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] > 0) return false;
    }
  }
  return true;
}

export function clearSpaceForResume(grid) {
  const newGrid = grid.map(row => [...row]);
  // Clear rows 3 and 4 (the middle of the 8x8 grid) to ensure generous space for continuation
  for (let c = 0; c < GRID_SIZE; c++) {
    newGrid[3][c] = 0;
    newGrid[4][c] = 0;
    newGrid[c][3] = 0;
    newGrid[c][4] = 0;
  }
  return newGrid;
}
