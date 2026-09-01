import React from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { GRID_SIZE } from '../engine/gameLogic';

const BOARD_SIZE = Math.min(Dimensions.get('window').width - 32, 380);

export default function GridBoard({
  grid,
  selectedPiece,
  hoverPos,
  onCellHover,
  onCellClick,
  onDropPiece,
  isValidPlacement,
  theme,
  boardRef
}) {
  return (
    <View
      ref={boardRef}
      style={[
        styles.board,
        {
          backgroundColor: theme.boardBg,
          borderColor: theme.cellBorder,
          width: BOARD_SIZE,
          height: BOARD_SIZE,
        },
      ]}
    >
      {grid.map((row, r) => (
        <View key={`row_${r}`} style={styles.row}>
          {row.map((cellValue, c) => {
            let isPreview = false;
            let isPreviewValid = false;

            if (selectedPiece && hoverPos) {
              const numRows = selectedPiece.matrix.length;
              const numCols = selectedPiece.matrix[0].length;
              const pr = r - hoverPos.r;
              const pc = c - hoverPos.c;
              if (pr >= 0 && pr < numRows && pc >= 0 && pc < numCols && selectedPiece.matrix[pr][pc] !== 0) {
                isPreview = true;
                isPreviewValid = isValidPlacement;
              }
            }

            const hasBlock = cellValue > 0;
            const blockColor = hasBlock ? theme.blockColors[cellValue] : null;
            let backgroundColor = theme.emptyCell;
            let borderColor = theme.cellBorder;
            let borderWidth = 1;

            if (hasBlock) {
              backgroundColor = blockColor;
              borderColor = 'rgba(255,255,255,0.4)';
            } else if (isPreview) {
              backgroundColor = isPreviewValid ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)';
              borderColor = isPreviewValid ? '#10b981' : '#ef4444';
              borderWidth = 2;
            }

            return (
              <Pressable
                key={`${r}_${c}`}
                onPressIn={() => onCellHover && onCellHover(r, c)}
                onPress={() => {
                  if (onCellClick) onCellClick(r, c);
                  else if (onDropPiece) onDropPiece(r, c);
                }}
                style={[
                  styles.cell,
                  {
                    backgroundColor,
                    borderColor,
                    borderWidth,
                    transform: [{ scale: isPreview ? 0.96 : 1 }],
                  },
                ]}
              >
                {hasBlock ? <View style={styles.shine} /> : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 3,
    borderRadius: 24,
    padding: 10,
  },
  row: { flex: 1, flexDirection: 'row' },
  cell: {
    flex: 1,
    margin: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  shine: {
    width: '60%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
  },
});
