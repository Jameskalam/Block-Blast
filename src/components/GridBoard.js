import React, { useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GRID_SIZE } from '../engine/gameLogic';

// Must match the styles below so drop-position math lines up with what's drawn.
export const BOARD_BORDER = 3;
export const BOARD_PADDING = 8;
export const CELL_MARGIN = 3;
export const CELL_RADIUS = 8;

export default function GridBoard({ grid, preview, onMeasure, measureRef, theme }) {
  const boardRef = useRef(null);

  // Report the board's position + size so the parent can convert a finger
  // position into a grid cell. We use `measure()`'s pageX/pageY (page
  // coordinates) rather than measureInWindow, because PanResponder touch
  // coordinates are also page-relative. On Android measureInWindow includes
  // the status bar, which introduced a constant vertical offset.
  const handleLayout = useCallback(() => {
    const node = boardRef.current;
    if (!node || !onMeasure) return;
    node.measure((x, y, width, height, pageX, pageY) => {
      onMeasure({ x: pageX, y: pageY, width, height });
    });
  }, [onMeasure]);

  // Expose a re-measure trigger so the parent can refresh the board rect right
  // before a drag starts (positions can shift on foldables / rotation).
  if (measureRef) {
    measureRef.current = handleLayout;
  }

  // Build quick lookups for the drag preview (which cells the piece covers).
  const previewSet = new Set();
  if (preview && preview.matrix) {
    const { matrix, row, col } = preview;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) previewSet.add(`${row + r}_${col + c}`);
      }
    }
  }
  const previewValid = preview?.valid;
  const previewColor =
    preview && theme.blockColors[preview.colorIndex]
      ? theme.blockColors[preview.colorIndex]
      : theme.accent;

  return (
    <View
      ref={boardRef}
      onLayout={handleLayout}
      style={[styles.board, { backgroundColor: theme.boardBg, borderColor: theme.cellBorder }]}
    >
      {grid.map((row, r) => (
        <View key={`row_${r}`} style={styles.row}>
          {row.map((cellValue, c) => {
            const hasBlock = cellValue > 0;
            const blockColor = hasBlock ? theme.blockColors[cellValue] : null;
            const inPreview = previewSet.has(`${r}_${c}`);

            let backgroundColor = hasBlock ? blockColor : theme.emptyCell;
            let borderColor = hasBlock ? 'rgba(255,255,255,0.4)' : theme.cellBorder;

            if (inPreview) {
              backgroundColor = previewValid ? previewColor : 'rgba(255,60,60,0.55)';
              borderColor = previewValid ? 'rgba(255,255,255,0.9)' : 'rgba(255,120,120,0.9)';
            }

            return (
              <View
                key={`${r}_${c}`}
                style={[
                  styles.cell,
                  {
                    backgroundColor,
                    borderColor,
                    opacity: inPreview && !hasBlock ? 0.85 : 1,
                  },
                ]}
              >
                {hasBlock ? (
                  <>
                    {/* top highlight */}
                    <View style={styles.faceTop} />
                    {/* bottom + right dark edges = raised 3D bevel */}
                    <View style={styles.edgeBottom} />
                    <View style={styles.edgeRight} />
                    {/* glossy shine dot */}
                    <View style={styles.shine} />
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: '100%',
    maxWidth: 460,
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: BOARD_BORDER,
    padding: BOARD_PADDING,
  },
  row: { flex: 1, flexDirection: 'row' },
  cell: {
    flex: 1,
    margin: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  // Lit top face: brighter band across the upper half (light from top-left).
  faceTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  // Shaded bottom edge for a raised, chunky look.
  edgeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '26%',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  // Shaded right edge to complete the bevel.
  edgeRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '18%',
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  // Small bright highlight dot in the top-left corner for a glassy pop.
  shine: {
    position: 'absolute',
    top: '12%',
    left: '14%',
    width: '24%',
    height: '18%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 6,
  },
});

export const _GRID_SIZE = GRID_SIZE;
