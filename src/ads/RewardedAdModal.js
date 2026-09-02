import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import Icon from '../components/Icon';
import { soundEngine } from '../engine/soundEngine';
import { AD_UNITS, AD_REQUEST_OPTIONS, IS_TEST_ADS } from './adConfig';

// Rewarded ad experience shown when the player is out of moves AND online.
//
// Presents a friendly, kid-appropriate prompt ("Watch to keep playing"), then
// plays a short simulated ad with a progress bar. On completion it calls
// onReward(); if the player backs out it calls onSkip().
//
// TODO (real SDK): replace the simulated playback in `startAd` with
// react-native-google-mobile-ads RewardedAd.createForAdRequest(AD_UNITS.rewarded),
// load it, show it, and resolve onReward on the EARNED_REWARD event.
export default function RewardedAdModal({ isOpen, onReward, onSkip, theme }) {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const adRef = useRef(null);
  // Tracks whether the SDK actually reported EARNED_REWARD for this view, so a
  // player who closes the ad early is never granted the reward.
  const earnedRef = useRef(false);

  // Preload a rewarded ad whenever the prompt opens, so tapping "watch" is
  // instant instead of staring at a spinner.
  useEffect(() => {
    if (!isOpen) return;

    setPlaying(false);
    setLoaded(false);
    setFailed(false);
    earnedRef.current = false;
    progress.setValue(0);

    const ad = RewardedAd.createForAdRequest(AD_UNITS.rewarded, AD_REQUEST_OPTIONS);
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earnedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setPlaying(false);
      // Grant only if the reward was genuinely earned; otherwise treat the
      // dismissal as a skip.
      if (earnedRef.current) {
        soundEngine.playRewardSound();
        onReward && onReward();
      } else {
        onSkip && onSkip();
      }
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setFailed(true);
      setPlaying(false);
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
      adRef.current = null;
    };
    // onReward/onSkip are stable enough here; re-subscribing per open is correct.
  }, [isOpen]);

  const startAd = useCallback(() => {
    soundEngine.playPopSound();
    const ad = adRef.current;
    if (!ad || !loaded) {
      // Nothing to show (no fill / still loading). Don't punish the player for
      // an ad problem -- let them continue.
      onReward && onReward();
      return;
    }
    setPlaying(true);
    try {
      ad.show();
    } catch (e) {
      setFailed(true);
      setPlaying(false);
      onReward && onReward();
    }
  }, [loaded, onReward]);

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

              <Pressable
                onPress={startAd}
                style={[styles.watchBtn, { backgroundColor: theme.accent, opacity: loaded || failed ? 1 : 0.6 }]}
              >
                <Icon name="Film" size={20} color="#ffffff" />
                <Text style={styles.watchText}>
                  {failed ? 'CONTINUE' : loaded ? 'WATCH & CONTINUE' : 'LOADING AD…'}
                </Text>
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
                  {IS_TEST_ADS ? 'Google test ad' : 'Advertisement'}
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
