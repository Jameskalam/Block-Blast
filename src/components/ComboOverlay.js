import React, { useEffect, useState } from 'react';

export default function ComboOverlay({ comboText, theme }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (comboText) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [comboText]);

  if (!visible || !comboText) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    }}>
      <style>{`
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
          70% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
      <div style={{
        background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
        padding: '10px 24px',
        borderRadius: '30px',
        color: '#ffffff',
        fontWeight: '900',
        fontSize: '24px',
        letterSpacing: '2px',
        boxShadow: `0 10px 30px rgba(0,0,0,0.5), ${theme.glows[1]}`,
        textShadow: '0 2px 8px rgba(0,0,0,0.4)',
        border: '2px solid rgba(255,255,255,0.6)'
      }}>
        {comboText}
      </div>
    </div>
  );
}
