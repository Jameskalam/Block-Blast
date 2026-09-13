import React from 'react';
import { GRID_SIZE } from '../engine/gameLogic';

export default function GridBoard({
  grid,
  selectedPiece,
  hoverPos,
  onCellHover,
  onCellClick,
  isValidPlacement,
  theme,
  boardRef
}) {
  return (
    <div
      ref={boardRef}
      style={{
        width: '100%',
        maxWidth: '380px',
        aspectRatio: '1/1',
        background: theme.boardBg,
        border: `3px solid ${theme.cellBorder}`,
        borderRadius: '24px',
        padding: '10px',
        boxSizing: 'border-box',
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        gap: '6px',
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px ${theme.emptyCell}`,
        position: 'relative',
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {grid.map((row, r) =>
        row.map((cellValue, c) => {
          // Check if cell is part of hover preview for selected piece
          let isPreview = false;
          let isPreviewValid = false;

          if (selectedPiece && hoverPos) {
            const numRows = selectedPiece.matrix.length;
            const numCols = selectedPiece.matrix[0].length;
            const pr = r - hoverPos.r;
            const pc = c - hoverPos.c;

            if (pr >= 0 && pr < numRows && pc >= 0 && pc < numCols) {
              if (selectedPiece.matrix[pr][pc] !== 0) {
                isPreview = true;
                isPreviewValid = isValidPlacement;
              }
            }
          }

          const hasBlock = cellValue > 0;
          const blockColor = hasBlock ? theme.blockColors[cellValue] : null;
          const blockGlow = hasBlock ? theme.glows[cellValue] : null;

          return (
            <div
              key={`${r}_${c}`}
              onMouseEnter={() => onCellHover && onCellHover(r, c)}
              onClick={() => onCellClick && onCellClick(r, c)}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                background: hasBlock
                  ? `linear-gradient(135deg, ${blockColor} 0%, rgba(255,255,255,0.2) 100%), ${blockColor}`
                  : isPreview
                  ? isPreviewValid
                    ? 'rgba(16, 185, 129, 0.45)'
                    : 'rgba(239, 68, 68, 0.45)'
                  : theme.emptyCell,
                border: hasBlock
                  ? '1px solid rgba(255,255,255,0.4)'
                  : isPreview
                  ? isPreviewValid
                    ? '2px dashed #10b981'
                    : '2px dashed #ef4444'
                  : `1px solid ${theme.cellBorder}`,
                boxShadow: hasBlock
                  ? `inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.4), ${blockGlow}`
                  : 'none',
                transition: 'all 0.1s ease',
                cursor: selectedPiece ? 'pointer' : 'default',
                transform: isPreview ? 'scale(0.96)' : 'scale(1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Internal shiny tile bevel line */}
              {hasBlock && (
                <div style={{
                  width: '60%',
                  height: '2px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '2px',
                  marginBottom: '65%',
                  filter: 'blur(0.5px)'
                }} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
