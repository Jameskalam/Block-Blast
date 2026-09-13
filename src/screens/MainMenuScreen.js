import React from 'react';
import { Play, Trophy, Flame, Palette, Volume2, VolumeX, Sparkles, Zap, Smartphone } from 'lucide-react';
import { soundEngine } from '../engine/soundEngine';

export default function MainMenuScreen({
  onStartGame,
  highScore,
  totalBlasts,
  gamesPlayed,
  isMuted,
  onToggleSound,
  onOpenThemes,
  theme
}) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: theme.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 16px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Animated Floating Blocks */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        opacity: 0.15,
        zIndex: 0
      }}>
        {[10, 30, 50, 70, 85].map((left, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: `${(idx * 20) % 80}%`,
              width: `${30 + (idx % 3) * 15}px`,
              height: `${30 + (idx % 3) * 15}px`,
              background: theme.blockColors[(idx % 8) + 1],
              borderRadius: '10px',
              filter: `drop-shadow(${theme.glows[(idx % 8) + 1]})`,
              animation: `floatAnim ${4 + idx}s ease-in-out infinite alternate`
            }}
          />
        ))}
        <style>{`
          @keyframes floatAnim {
            0% { transform: translateY(0px) rotate(0deg); }
            100% { transform: translateY(-40px) rotate(25deg); }
          }
        `}</style>
      </div>

      {/* Top Bar Controls */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: theme.cardBg,
          padding: '8px 16px',
          borderRadius: '50px',
          border: `1px solid ${theme.cellBorder}`,
          backdropFilter: 'blur(8px)'
        }}>
          <Smartphone size={16} color={theme.accent} />
          <span style={{ fontSize: '12px', fontWeight: '800', color: theme.text, letterSpacing: '1px' }}>
            ANDROID PLAY STORE READY
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onOpenThemes}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cellBorder}`,
              borderRadius: '14px',
              padding: '10px',
              color: theme.text,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)'
            }}
            title="Themes"
          >
            <Palette size={22} />
          </button>
          <button
            onClick={onToggleSound}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cellBorder}`,
              borderRadius: '14px',
              padding: '10px',
              color: isMuted ? '#ef4444' : theme.accent,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(8px)'
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>
        </div>
      </div>

      {/* Hero Branding Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: '20px',
        zIndex: 10
      }}>
        {/* Animated Gem Logo */}
        <div style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '28px',
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
            transform: 'rotate(12deg)',
            opacity: 0.6,
            filter: `drop-shadow(${theme.glows[1]})`
          }} />
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            border: '2px solid rgba(255,255,255,0.5)'
          }}>
            <Zap size={44} color="#ffffff" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
          </div>
        </div>

        <h1 style={{
          margin: '0 0 6px 0',
          fontSize: '44px',
          fontWeight: '900',
          letterSpacing: '2px',
          background: `linear-gradient(180deg, #ffffff 0%, ${theme.textMuted} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          BLOCK BLAST
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: theme.accent,
          fontWeight: '800',
          fontSize: '14px',
          letterSpacing: '3px'
        }}>
          <Sparkles size={16} /> POP & MATCH PUZZLE <Sparkles size={16} />
        </div>
      </div>

      {/* Main Play Action & Mode Card */}
      <div style={{
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        margin: '20px 0',
        zIndex: 10
      }}>
        {/* Play Button */}
        <button
          onClick={() => {
            soundEngine.playPopSound();
            onStartGame();
          }}
          style={{
            width: '100%',
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
            border: 'none',
            borderRadius: '24px',
            padding: '20px',
            color: '#ffffff',
            fontWeight: '900',
            fontSize: '22px',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: `0 14px 35px rgba(0,0,0,0.4), ${theme.glows[1]}`,
            transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: '2px solid rgba(255,255,255,0.4)'
          }}
        >
          <Play size={32} fill="#ffffff" />
          PLAY GAME
        </button>

        {/* Stats Display Grid */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px'
        }}>
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cellBorder}`,
            borderRadius: '18px',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <Trophy size={18} color="#fbbf24" style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', color: theme.textMuted }}>HIGH SCORE</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#fbbf24', marginTop: '2px' }}>
              {highScore.toLocaleString()}
            </span>
          </div>

          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cellBorder}`,
            borderRadius: '18px',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <Flame size={18} color={theme.accent} style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', color: theme.textMuted }}>TOTAL BLASTS</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
              {totalBlasts.toLocaleString()}
            </span>
          </div>

          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.cellBorder}`,
            borderRadius: '18px',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <Sparkles size={18} color="#38ef7d" style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '10px', fontWeight: '800', color: theme.textMuted }}>GAMES</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
              {gamesPlayed}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        fontSize: '12px',
        color: theme.textMuted,
        textAlign: 'center',
        zIndex: 10
      }}>
        Drag or tap blocks onto the 8x8 grid to clear full lines!
      </div>
    </div>
  );
}
