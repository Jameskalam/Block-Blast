import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import Icon from '../components/Icon';
import { soundEngine } from '../engine/soundEngine';
import { AD_UNITS } from './adConfig';

/**
 * Rewarded ad modal presented when the player is out of moves.
 *
 * Prompts the player to watch a rewarded video ad to clear space and continue.
 * When completed, onReward() is called. If skipped or closed without reward, onSkip() is called.
 */
export default function RewardedAdModal({ isOpen, onReward, onSkip, theme }) {
  const { isLoaded, isEarnedReward, isClosed, load, show, error } = useRewardedAd(
    AD_UNITS.rewarded,
    { requestNonPersonalizedAdsOnly: true }
  );

  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const hasHandledCloseRef = useRef(false);
  const callbacksRef = useRef({ onReward, onSkip });
  callbacksRef.current = { onReward, onSkip };

  // Preload the ad when the modal is presented
  useEffect(() => {
    if (isOpen) {
      hasHandledCloseRef.current = false;
      setIsLoadingAd(false);
      load();
    }
  }, [isOpen, load]);

  // Once the ad closes, evaluate if the reward was earned (guaranteed ONCE per ad)
  useEffect(() => {
    if (isClosed && !hasHandledCloseRef.current) {
      hasHandledCloseRef.current = true;
      if (isEarnedReward) {
        soundEngine.playRewardSound();
        callbacksRef.current.onReward && callbacksRef.current.onReward();
      } else {
        callbacksRef.current.onSkip && callbacksRef.current.onSkip();
      }
    }
  }, [isClosed, isEarnedReward]);

  const handleWatchPress = () => {
    soundEngine.playPopSound();
    if (isLoaded) {
      show();
    } else {
      setIsLoadingAd(true);
      load();
    }
  };

  // If the user tapped watch while the ad was still loading, display as soon as ready
  useEffect(() => {
    if (isLoadingAd && isLoaded) {
      setIsLoadingAd(false);
      show();
    }
  }, [isLoadingAd, isLoaded, show]);

  const handleSkipPress = () => {
    soundEngine.playPopSound();
    onSkip && onSkip();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleSkipPress}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.accent }]}>
          <View style={[styles.badge, { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: '#fbbf24' }]}>
            <Icon name="Sparkles" size={32} color="#fbbf24" />
          </View>
          <Text style={styles.heading}>Keep Playing!</Text>
          <Text style={[styles.body, { color: theme.textMuted }]}>
            Watch a short video to magically clear space and continue your game.
          </Text>

          {error ? (
            <Text style={styles.errorNotice}>
              Ad temporarily unavailable. Tap below to start over.
            </Text>
          ) : null}

          <Pressable
            onPress={handleWatchPress}
            disabled={isLoadingAd}
            style={[styles.watchBtn, { backgroundColor: theme.accent, opacity: isLoadingAd ? 0.7 : 1 }]}
          >
            {isLoadingAd ? (
              <ActivityIndicator color="#ffffff" style={{ marginRight: 8 }} />
            ) : (
              <Icon name="Film" size={20} color="#ffffff" />
            )}
            <Text style={styles.watchText}>
              {isLoadingAd ? 'LOADING AD…' : 'WATCH & CONTINUE'}
            </Text>
          </Pressable>

          <Pressable onPress={handleSkipPress} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: theme.textMuted }]}>No thanks</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5,5,20,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 28,
    borderWidth: 2,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heading: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 21,
  },
  errorNotice: {
    fontSize: 12,
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 14,
  },
  watchBtn: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  watchText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  skipBtn: {
    padding: 10,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
