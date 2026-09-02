import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { GRID_SIZE } from '../engine/gameLogic';
import Block from './Block';

// Must match the styles below so drop-position math lines up with what's drawn.
export const BOARD_BORDER = 3;
export const BOARD_PADDING = 8;
export const CELL_MARGIN = 3;
export const CELL_RADIUS = 8;

export default function GridBoard({ grid, preview, onMeasure, measureRef, theme, onCellPress }) {
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

            // Empty cell styling; filled cells are drawn by <Block/> instead.
            let backgroundColor = theme.emptyCell;
            let borderColor = theme.cellBorder;
            if (inPreview && !hasBlock) {
              // Ghost of where the dragged piece will land.
              backgroundColor = previewValid ? previewColor : 'rgba(255,60,60,0.45)';
              borderColor = previewValid ? 'rgba(255,255,255,0.9)' : 'rgba(255,120,120,0.9)';
            }

            // Only interactive while a power-up (the hammer) is armed.
            const Cell = onCellPress ? Pressable : View;
            const cellProps = onCellPress ? { onPress: () => onCellPress(r, c) } : {};

            return (
              <Cell
                key={`${r}_${c}`}
                {...cellProps}
                style={[
                  styles.cell,
                  // Keep borderWidth identical in both states and only hide the
                  // border's COLOR. Dropping borderWidth to 0 changes the cell's
                  // content box by 1px on every side, which made every square
                  // visibly shift the moment a piece was placed.
                  hasBlock
                    ? { backgroundColor: 'transparent', borderColor: 'transparent' }
                    : { backgroundColor, borderColor, opacity: inPreview ? 0.7 : 1 },
                ]}
              >
                {hasBlock ? <Block color={blockColor} radius={CELL_RADIUS} /> : null}
              </Cell>
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
    // No alignItems/justifyContent here: the <Block> child sizes itself with
    // flex, and centering would collapse it to zero width.
    overflow: 'hidden',
  },
});

export const _GRID_SIZE = GRID_SIZE;
