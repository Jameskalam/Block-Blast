import React, { useEffect, useState } from 'react';
import { Film, PlayCircle, XCircle, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { soundEngine } from '../engine/soundEngine';

export default function AdWatchModal({
  isOpen,
  score,
  highScore,
  onWatchAdSuccess,
  onDecline,
  theme
}) {
  const [countdown, setCountdown] = useState(5);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  // 5-second initial decision countdown
  useEffect(() => {
    let timer;
    if (isOpen && !isPlayingAd && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && !isPlayingAd && countdown === 0) {
      // Auto decline when countdown reaches 0
      onDecline();
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlayingAd, countdown, onDecline]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsPlayingAd(false);
      setAdProgress(0);
    }
  }, [isOpen]);

  // Simulate Rewarded Ad Playback (5s ad video simulation with reward callback)
  const handleStartAd = () => {
    setIsPlayingAd(true);
    soundEngine.playPopSound();

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setAdProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          soundEngine.playRewardSound();
          onWatchAdSuccess();
        }, 500);
      }
    }, 1000);
  };

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
        border: `2px solid ${theme.accent}`,
        borderRadius: '28px',
        padding: '28px 24px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: `0 25px 50px rgba(0,0,0,0.6), ${theme.glows[1]}`,
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        {!isPlayingAd ? (
          <>
            {/* Header Badge */}
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            }}>
              <AlertTriangle size={32} color="#f59e0b" />
            </div>

            <h2 style={{
              margin: '0 0 6px 0',
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '900',
              textAlign: 'center'
            }}>
              NO MORE MOVES!
            </h2>

            <p style={{
              margin: '0 0 20px 0',
              color: theme.textMuted,
              fontSize: '14px',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              Watch a quick ad to <strong style={{ color: theme.accent }}>CLEAR SPACE</strong> and continue your current game!
            </p>

            {/* Countdown Badge */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${theme.cellBorder}`,
              borderRadius: '50px',
              padding: '6px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '13px', color: theme.textMuted }}>Closing in</span>
              <span style={{
                fontSize: '18px',
                fontWeight: '900',
                color: countdown <= 2 ? '#ef4444' : theme.accent
              }}>
                {countdown}s
              </span>
            </div>

            {/* Watch Ad Button */}
            <button
              onClick={handleStartAd}
              style={{
                width: '100%',
                background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSecondary} 100%)`,
                border: 'none',
                borderRadius: '18px',
                padding: '16px',
                color: '#ffffff',
                fontWeight: '900',
                fontSize: '17px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: `0 10px 25px rgba(0,0,0,0.3), ${theme.glows[1]}`,
                marginBottom: '12px',
                transition: 'transform 0.15s ease'
              }}
            >
              <Film size={22} />
              WATCH AD TO CONTINUE
            </button>

            {/* Decline Button */}
            <button
              onClick={() => {
                soundEngine.playPopSound();
                onDecline();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.textMuted,
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '8px',
                textDecoration: 'underline'
              }}
            >
              No thanks, I'll give up
            </button>
          </>
        ) : (
          /* Ad Playing Screen */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            padding: '10px 0'
          }}>
            <div style={{
              width: '100%',
              height: '180px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
              border: `1px solid ${theme.cellBorder}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <PlayCircle size={48} color={theme.accent} style={{ animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '12px', letterSpacing: '1px' }}>
                SPONSORED REWARDED AD
              </span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
                Block Blast Sponsor
              </span>

              {/* Ad Progress Bar */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: `${adProgress}%`,
                height: '6px',
                background: theme.accent,
                transition: 'width 1s linear'
              }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.text }}>
              <Sparkles size={18} color={theme.accent} />
              <span style={{ fontSize: '15px', fontWeight: '700' }}>
                {adProgress < 100 ? `Playing Ad (${adProgress / 20}/5s)...` : 'Reward Unlocked!'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
