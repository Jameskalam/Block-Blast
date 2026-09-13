import React from 'react';
import { THEMES } from '../styles/themes';
import { Check, X } from 'lucide-react';
import { soundEngine } from '../engine/soundEngine';

export default function ThemeSelector({
  isOpen,
  currentThemeId,
  onSelectTheme,
  onClose,
  theme
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 5, 20, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div style={{
        background: theme.bgSolid,
        border: `2px solid ${theme.cellBorder}`,
        borderRadius: '28px',
        padding: '24px',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: '900' }}>
            SELECT THEME
          </h2>
          <button
            onClick={() => {
              soundEngine.playPopSound();
              onClose();
            }}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cellBorder}`,
              borderRadius: '12px',
              padding: '6px',
              color: theme.text,
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(THEMES).map((th) => {
            const isSelected = currentThemeId === th.id;
            return (
              <div
                key={th.id}
                onClick={() => {
                  soundEngine.playPopSound();
                  onSelectTheme(th.id);
                }}
                style={{
                  background: th.bg,
                  border: isSelected ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '18px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 8px 20px rgba(0,0,0,0.4)' : 'none',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '16px' }}>
                    {th.name}
                  </span>

                  {/* Preview Palette Dots */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '4px',
                          background: th.blockColors[cIdx],
                          boxShadow: `0 0 6px ${th.blockColors[cIdx]}`
                        }}
                      />
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000000'
                  }}>
                    <Check size={18} strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
