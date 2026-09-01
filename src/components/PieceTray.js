import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

function DraggableSlot({ piece, isDragging, onDragStart, onDragMove, onDragEnd, theme }) {
  const isUsed = piece.used;
  const matrix = piece.matrix;
  const color = theme.blockColors[piece.colorIndex] || theme.accent;

  // Keep the latest callbacks in a ref. The PanResponder below is memoized, so
  // without this it would capture the callbacks (and their closed-over state)
  // from the first render, making drops read stale state and never place.
  const cbRef = useRef({ onDragStart, onDragMove, onDragEnd });
  cbRef.current = { onDragStart, onDragMove, onDragEnd };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isUsed,
        onMoveShouldSetPanResponder: () => !isUsed,
        onPanResponderGrant: (evt, gesture) => {
          const { pageX, pageY } = evt.nativeEvent;
          cbRef.current.onDragStart(piece, pageX, pageY);
        },
        onPanResponderMove: (evt, gesture) => {
          cbRef.current.onDragMove(piece, gesture.moveX, gesture.moveY);
        },
        onPanResponderRelease: (evt, gesture) => {
          cbRef.current.onDragEnd(piece, gesture.moveX, gesture.moveY);
        },
        onPanResponderTerminate: (evt, gesture) => {
          cbRef.current.onDragEnd(piece, gesture.moveX, gesture.moveY);
        },
      }),
    // Recreate only when the piece identity or usability changes.
    [piece.instanceId, isUsed]
  );

  // Once placed, the piece is removed from the tray: render an empty slot so
  // the row keeps its spacing but the shape is gone.
  if (isUsed) {
    return <View style={[styles.slot, styles.emptySlot]} />;
  }

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.slot,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cellBorder,
          borderWidth: 1,
          opacity: isDragging ? 0.35 : 1,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 3,
        },
      ]}
    >
      <View>
        {matrix.map((row, r) => (
          <View key={`r_${r}`} style={styles.miniRow}>
            {row.map((cell, c) => (
              <View
                key={`${r}_${c}`}
                style={[
                  styles.miniCell,
                  cell === 1
                    ? { backgroundColor: color, borderColor: 'rgba(255,255,255,0.5)', borderWidth: 1, overflow: 'hidden' }
                    : { backgroundColor: 'transparent' },
                ]}
              >
                {cell === 1 ? (
                  <>
                    <View style={styles.miniTop} />
                    <View style={styles.miniBottom} />
                  </>
                ) : null}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function PieceTray({
  pieceSet,
  draggingPieceId,
  onDragStart,
  onDragMove,
  onDragEnd,
  theme,
}) {
  return (
    <View style={styles.tray}>
      {pieceSet.map((piece) => (
        <DraggableSlot
          key={piece.instanceId}
          piece={piece}
          isDragging={draggingPieceId === piece.instanceId}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          theme={theme}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: { width: '100%', maxWidth: 560, flexDirection: 'row', gap: 14, padding: 14, justifyContent: 'space-between' },
  slot: { flex: 1, height: 130, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 } },
  emptySlot: { backgroundColor: 'transparent' },
  miniRow: { flexDirection: 'row' },
  miniCell: { width: 22, height: 22, borderRadius: 5, margin: 2 },
  miniTop: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.32)' },
  miniBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '28%', backgroundColor: 'rgba(0,0,0,0.28)' },
});
