import React from 'react';
import { Volume2, VolumeX, Home, Palette, Trophy, Zap } from 'lucide-react';

export default function Header({
  score,
  highScore,
  isMuted,
  onToggleSound,
  onOpenThemes,
  onGoHome,
  theme
}) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '480px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px 16px',
      boxSizing: 'border-box'
    }}>
      {/* Top Navbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {onGoHome && (
          <button
            onClick={onGoHome}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cellBorder}`,
              borderRadius: '12px',
              padding: '10px',
              color: theme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)',
              transition: 'transform 0.15s ease'
            }}
            title="Home Menu"
          >
            <Home size={20} />
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '900',
          fontSize: '22px',
          letterSpacing: '1px',
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentSecondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          <Zap size={22} color={theme.accent} style={{ filter: `drop-shadow(${theme.glows[1]})` }} />
          BLOCK BLAST
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onOpenThemes}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cellBorder}`,
              borderRadius: '12px',
              padding: '10px',
              color: theme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)'
            }}
            title="Themes"
          >
            <Palette size={20} />
          </button>

          <button
            onClick={onToggleSound}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cellBorder}`,
              borderRadius: '12px',
              padding: '10px',
              color: isMuted ? '#ef4444' : theme.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)'
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Score Dashboard Card */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        width: '100%'
      }}>
        {/* Score Card */}
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cellBorder}`,
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: theme.textMuted, letterSpacing: '1px' }}>
            CURRENT SCORE
          </span>
          <span style={{
            fontSize: '28px',
            fontWeight: '900',
            color: '#ffffff',
            textShadow: `0 0 12px ${theme.accent}`
          }}>
            {score.toLocaleString()}
          </span>
        </div>

        {/* High Score Card */}
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cellBorder}`,
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trophy size={14} color="#fbbf24" />
            <span style={{ fontSize: '11px', fontWeight: '700', color: theme.textMuted, letterSpacing: '1px' }}>
              HIGH SCORE
            </span>
          </div>
          <span style={{
            fontSize: '28px',
            fontWeight: '900',
            color: '#fbbf24',
            textShadow: '0 0 12px rgba(251, 191, 36, 0.5)'
          }}>
            {highScore.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
