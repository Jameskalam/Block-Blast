import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';

export default function AdWatchModal({
  isOpen,
  onWatchAdSuccess,
  onDecline,
  theme
}) {
  const [countdown, setCountdown] = useState(5);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  useEffect(() => {
    let timer;
    if (isOpen && !isPlayingAd && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && !isPlayingAd && countdown === 0) {
      onDecline();
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlayingAd, countdown, onDecline]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsPlayingAd(false);
      setAdProgress(0);
    }
  }, [isOpen]);

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

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.accent }]}>
          {!isPlayingAd ? (
            <>
              <View style={styles.warnIcon}>
                <Icon name="warning" size={32} color="#f59e0b" />
              </View>
              <Text style={styles.title}>NO MORE MOVES!</Text>
              <Text style={[styles.body, { color: theme.textMuted }]}>
                Watch a quick ad to <Text style={{ color: theme.accent, fontWeight: '800' }}>CLEAR SPACE</Text> and continue your current game!
              </Text>
              <View style={[styles.countdown, { borderColor: theme.cellBorder }]}>
                <Text style={[styles.closing, { color: theme.textMuted }]}>Closing in</Text>
                <Text style={[styles.seconds, { color: countdown <= 2 ? '#ef4444' : theme.accent }]}>{countdown}s</Text>
              </View>
              <Pressable onPress={handleStartAd} style={[styles.watchBtn, { backgroundColor: theme.accent }]}>
                <Icon name="film" size={22} color="#ffffff" />
                <Text style={styles.watchText}>WATCH AD TO CONTINUE</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  soundEngine.playPopSound();
                  onDecline();
                }}
              >
                <Text style={[styles.decline, { color: theme.textMuted }]}>No thanks, I'll give up</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.adWrap}>
              <View style={[styles.adBox, { borderColor: theme.cellBorder }]}>
                <Icon name="play-circle" size={48} color={theme.accent} />
                <Text style={styles.sponsored}>SPONSORED REWARDED AD</Text>
                <Text style={styles.sponsorName}>Block Blast Sponsor</Text>
                <View style={[styles.progress, { width: `${adProgress}%`, backgroundColor: theme.accent }]} />
              </View>
              <View style={styles.adStatus}>
                <Icon name="sparkles" size={18} color={theme.accent} />
                <Text style={[styles.adStatusText, { color: theme.text }]}>
                  {adProgress < 100 ? `Playing Ad (${adProgress / 20}/5s)...` : 'Reward Unlocked!'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 20, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  warnIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 2,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  body: { marginTop: 6, marginBottom: 20, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  countdown: {
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  closing: { fontSize: 13 },
  seconds: { fontSize: 18, fontWeight: '900' },
  watchBtn: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  watchText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  decline: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline', padding: 8 },
  adWrap: { width: '100%', alignItems: 'center' },
  adBox: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#09090b',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  sponsored: { fontSize: 12, color: '#a1a1aa', marginTop: 12, letterSpacing: 1 },
  sponsorName: { fontSize: 15, fontWeight: '800', color: '#ffffff', marginTop: 4 },
  progress: { position: 'absolute', bottom: 0, left: 0, height: 6 },
  adStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adStatusText: { fontSize: 15, fontWeight: '700' },
});
