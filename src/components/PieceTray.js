import React from 'react';

export default function PieceTray({
  pieceSet,
  selectedPieceId,
  onSelectPiece,
  theme
}) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      padding: '12px',
      boxSizing: 'border-box'
    }}>
      {pieceSet.map((piece) => {
        const isSelected = selectedPieceId === piece.instanceId;
        const isUsed = piece.used;
        const matrix = piece.matrix;
        const numRows = matrix.length;
        const numCols = matrix[0].length;
        const color = theme.blockColors[piece.colorIndex] || theme.accent;

        return (
          <div
            key={piece.instanceId}
            onClick={() => !isUsed && onSelectPiece(piece)}
            style={{
              background: isSelected
                ? `radial-gradient(circle, ${theme.cardBg} 0%, rgba(255,255,255,0.15) 100%)`
                : theme.cardBg,
              border: isSelected
                ? `2px solid ${theme.accent}`
                : `1px solid ${theme.cellBorder}`,
              borderRadius: '20px',
              height: '110px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isUsed ? 'default' : 'pointer',
              opacity: isUsed ? 0.2 : 1,
              boxShadow: isSelected
                ? `0 0 20px ${theme.accent}, inset 0 0 10px rgba(255,255,255,0.2)`
                : '0 4px 12px rgba(0,0,0,0.2)',
              transform: isSelected ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              backdropFilter: 'blur(8px)',
              position: 'relative'
            }}
          >
            {/* Shape Grid Mini Display */}
            <div style={{
              display: 'grid',
              gridTemplateRows: `repeat(${numRows}, 1fr)`,
              gridTemplateColumns: `repeat(${numCols}, 1fr)`,
              gap: '3px',
              padding: '6px'
            }}>
              {matrix.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}_${c}`}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      background: cell === 1
                        ? `linear-gradient(135deg, ${color} 0%, rgba(255,255,255,0.2) 100%), ${color}`
                        : 'transparent',
                      border: cell === 1 ? '1px solid rgba(255,255,255,0.5)' : 'none',
                      boxShadow: cell === 1 ? `0 2px 6px rgba(0,0,0,0.3)` : 'none'
                    }}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
