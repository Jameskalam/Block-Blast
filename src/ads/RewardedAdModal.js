import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import Icon from '../components/Icon';
import { soundEngine } from '../engine/soundEngine';
import { USE_REAL_ADS, AD_UNITS } from './adConfig';

// Rewarded ad experience shown when the player is out of moves AND online.
//
// Presents a friendly, kid-appropriate prompt ("Watch to keep playing"), then
// plays a short simulated ad with a progress bar. On completion it calls
// onReward(); if the player backs out it calls onSkip().
//
// TODO (real SDK): replace the simulated playback in `startAd` with
// react-native-google-mobile-ads RewardedAd.createForAdRequest(AD_UNITS.rewarded),
// load it, show it, and resolve onReward on the EARNED_REWARD event.
const AD_DURATION_MS = 3000;

export default function RewardedAdModal({ isOpen, onReward, onSkip, theme }) {
  const [playing, setPlaying] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setPlaying(false);
      progress.setValue(0);
    }
  }, [isOpen]);

  const startAd = () => {
    setPlaying(true);
    soundEngine.playPopSound();

    // Simulated rewarded playback. Swap for the real SDK show() call.
    Animated.timing(progress, {
      toValue: 1,
      duration: AD_DURATION_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        soundEngine.playRewardSound();
        setPlaying(false);
        onReward && onReward();
      }
    });
  };

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.accent }]}>
          {!playing ? (
            <>
              <View style={[styles.badge, { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: '#fbbf24' }]}>
                <Icon name="Sparkles" size={32} color="#fbbf24" />
              </View>
              <Text style={styles.heading}>Keep Playing!</Text>
              <Text style={[styles.body, { color: theme.textMuted }]}>
                Watch a short video to magically clear space and continue your game.
              </Text>

              <Pressable onPress={startAd} style={[styles.watchBtn, { backgroundColor: theme.accent }]}>
                <Icon name="Film" size={20} color="#ffffff" />
                <Text style={styles.watchText}>WATCH & CONTINUE</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  soundEngine.playPopSound();
                  onSkip && onSkip();
                }}
                style={styles.skipBtn}
              >
                <Text style={[styles.skipText, { color: theme.textMuted }]}>No thanks</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.playWrap}>
              <View style={[styles.adScreen, { borderColor: theme.cellBorder }]}>
                <Icon name="PlayCircle" size={46} color={theme.accent} />
                <Text style={styles.adLabel}>Advertisement</Text>
                <Text style={[styles.adUnit, { color: theme.textMuted }]} numberOfLines={1}>
                  {USE_REAL_ADS ? 'Loading ad…' : `Test unit · ${AD_UNITS.rewarded}`}
                </Text>
                <View style={styles.progressTrack}>
                  <Animated.View style={[styles.progressFill, { width, backgroundColor: theme.accent }]} />
                </View>
              </View>
              <Text style={[styles.playHint, { color: theme.textMuted }]}>Reward unlocking…</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,5,20,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 400, borderRadius: 28, borderWidth: 2, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center' },
  badge: { width: 64, height: 64, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heading: { color: '#ffffff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  body: { fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 21 },
  watchBtn: { width: '100%', borderRadius: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  watchText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  skipBtn: { padding: 10 },
  skipText: { fontSize: 14, fontWeight: '600' },
  playWrap: { width: '100%', alignItems: 'center' },
  adScreen: { width: '100%', height: 190, borderRadius: 16, backgroundColor: '#18181b', borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, overflow: 'hidden' },
  adLabel: { fontSize: 13, color: '#e4e4e7', fontWeight: '700', marginTop: 12, letterSpacing: 1 },
  adUnit: { fontSize: 10, marginTop: 4 },
  progressTrack: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressFill: { height: 6 },
  playHint: { fontSize: 13, fontWeight: '700', marginTop: 14 },
});
