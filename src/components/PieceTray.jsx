import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export default function PieceTray({
  pieceSet,
  selectedPieceId,
  onSelectPiece,
  onDragStartPiece,
  theme
}) {
  return (
    <View style={styles.tray}>
      {pieceSet.map((piece) => {
        const isSelected = selectedPieceId === piece.instanceId;
        const isUsed = piece.used;
        const matrix = piece.matrix;
        const color = theme.blockColors[piece.colorIndex] || theme.accent;

        return (
          <Pressable
            key={piece.instanceId}
            onPress={() => {
              if (isUsed) return;
              if (onSelectPiece) onSelectPiece(piece);
              if (onDragStartPiece) onDragStartPiece(piece);
            }}
            style={[
              styles.slot,
              {
                backgroundColor: theme.cardBg,
                borderColor: isSelected ? theme.accent : theme.cellBorder,
                borderWidth: isSelected ? 2 : 1,
                opacity: isUsed ? 0.2 : 1,
                transform: [{ scale: isSelected ? 1.06 : 1 }],
              },
            ]}
          >
            <View>
              {matrix.map((row, r) => (
                <View key={`${piece.instanceId}_r_${r}`} style={styles.shapeRow}>
                  {row.map((cell, c) => (
                    <View
                      key={`${r}_${c}`}
                      style={[
                        styles.miniCell,
                        {
                          backgroundColor: cell === 1 ? color : 'transparent',
                          borderWidth: cell === 1 ? 1 : 0,
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  slot: {
    flex: 1,
    height: 110,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeRow: { flexDirection: 'row', gap: 3 },
  miniCell: { width: 16, height: 16, borderRadius: 4, margin: 1.5 },
});
