import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import Icon from '../components/Icon';
import BannerAd from '../ads/BannerAd';
import { showRewarded } from '../ads/rewarded';
import { soundEngine } from '../engine/soundEngine';
import { storage, FREE_COINS_AMOUNT } from '../engine/storage';
import { openRateUs } from '../config/appInfo';

export default function MainMenuScreen({
  onStartGame,
  highScore,
  totalBlasts,
  gamesPlayed,
  coins,
  bestCombo,
  bestLevel,
  dailyReward,
  onDismissDailyReward,
  isMuted,
  onToggleSound,
  onOpenThemes,
  onCoinsChange,
  theme,
}) {
  // ---- Free hourly coins (rewarded ad) ------------------------------------
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  // Tick once a second only while the reward is still on cooldown, so the
  // countdown stays live without re-rendering the menu forever.
  const readyAt = storage.getFreeCoinsReadyAt();
  const freeCoinsReady = now >= readyAt;

  useEffect(() => {
    if (freeCoinsReady) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [freeCoinsReady]);

  const remainingMs = Math.max(0, readyAt - now);
  const mm = String(Math.floor(remainingMs / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');
  const cooldownLabel = `${mm}:${ss}`;

  const handleFreeCoins = async () => {
    if (!freeCoinsReady || busy) return;
    setBusy(true);
    soundEngine.playPopSound();
    try {
      const earned = await showRewarded();
      if (earned) {
        const res = storage.claimFreeCoins();
        if (res.granted) {
          if (onCoinsChange) onCoinsChange(res.coins);
          soundEngine.playRewardSound();
        }
      }
    } finally {
      setBusy(false);
      setNow(Date.now());
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgSolid }}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.root}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={[styles.coinPill, { backgroundColor: theme.cardBg, borderColor: '#fbbf24' }]}>
          <Icon name="Coin" size={16} color="#fbbf24" />
          <Text style={styles.coinPillText}>{(coins ?? 0).toLocaleString()}</Text>
        </View>

        <View style={styles.topButtons}>
          <Pressable
            onPress={onOpenThemes}
            style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
          >
            <Icon name="Palette" size={22} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={onToggleSound}
            style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
          >
            <Icon name={isMuted ? 'VolumeX' : 'Volume2'} size={22} color={isMuted ? '#ef4444' : theme.accent} />
          </Pressable>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: theme.accent, shadowColor: theme.accent }]}>
          <Icon name="Zap" size={44} color="#ffffff" />
        </View>
        {/* Stacked title: an offset dark copy behind the white text fakes a
            thick outline, which RN can't do with a real text stroke. */}
        <View style={styles.titleStack}>
          <Text style={[styles.title, styles.titleShadow]}>BLOCK</Text>
          <Text style={[styles.title, { color: '#ffffff' }]}>BLOCK</Text>
        </View>
        <View style={[styles.titleStack, { marginTop: -8 }]}>
          <Text style={[styles.title, styles.titleShadow]}>MINT</Text>
          <Text style={[styles.title, { color: theme.accent }]}>MINT</Text>
        </View>

        <View style={[styles.subtitlePill, { backgroundColor: theme.accent }]}>
          <Icon name="Sparkles" size={13} color="#0f172a" />
          <Text style={styles.subtitle}>POP &amp; MATCH PUZZLE</Text>
          <Icon name="Sparkles" size={13} color="#0f172a" />
        </View>

        {/* Level progress: the next background is the thing to play toward. */}
        <View style={[styles.levelBadge, { borderColor: theme.accent }]}>
          <Icon name="Star" size={15} color={theme.accent} />
          <Text style={[styles.levelBadgeText, { color: theme.text }]}>
            BEST LEVEL {bestLevel ?? 1}
          </Text>
        </View>
      </View>

      {/* Play + Stats */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            soundEngine.playPopSound();
            onStartGame();
          }}
          style={({ pressed }) => [
            styles.playBtn,
            { backgroundColor: theme.accent, shadowColor: theme.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
        >
          <Icon name="Play" size={26} color="#ffffff" />
          <Text style={styles.playText}>PLAY GAME</Text>
        </Pressable>

        <View style={styles.statsRow}>
          <StatCard label="HIGH SCORE" value={highScore.toLocaleString()} valueColor="#fbbf24" iconName="Trophy" iconColor="#fbbf24" theme={theme} />
          <StatCard label="BEST COMBO" value={`x${bestCombo ?? 0}`} valueColor="#ffffff" iconName="Flame" iconColor={theme.accent} theme={theme} />
          <StatCard label="GAMES" value={String(gamesPlayed)} valueColor="#ffffff" iconName="Rocket" iconColor="#38ef7d" theme={theme} />
        </View>
      </View>

      {/* Free coins via rewarded ad, rate limited to once an hour. */}
      <Pressable
        onPress={handleFreeCoins}
        disabled={!freeCoinsReady || busy}
        style={({ pressed }) => [
          styles.freeCoinsBtn,
          {
            borderColor: freeCoinsReady ? '#fbbf24' : theme.cellBorder,
            backgroundColor: freeCoinsReady ? 'rgba(251,191,36,0.14)' : theme.cardBg,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Icon name={freeCoinsReady ? 'Film' : 'Clock'} size={18} color={freeCoinsReady ? '#fbbf24' : theme.textMuted} />
        <Text style={[styles.freeCoinsText, { color: freeCoinsReady ? '#fbbf24' : theme.textMuted }]}>
          {busy
            ? 'LOADING…'
            : freeCoinsReady
            ? `WATCH AD — FREE ${FREE_COINS_AMOUNT} COINS`
            : `FREE COINS IN ${cooldownLabel}`}
        </Text>
      </Pressable>

      {/* How to play */}
      <View style={[styles.howTo, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
        <Text style={[styles.howToTitle, { color: theme.text }]}>How to Play</Text>
        <HowToStep icon="Target" text="Drag a colorful block onto the grid" theme={theme} />
        <HowToStep icon="Sparkles" text="Fill a full row or column to blast it" theme={theme} />
        <HowToStep icon="Coin" text="Earn coins and beat your high score!" theme={theme} />
      </View>

      {/* Rate Us — opens the Play Store listing */}
      <Pressable
        onPress={() => {
          soundEngine.playPopSound();
          openRateUs();
        }}
        style={({ pressed }) => [
          styles.rateBtn,
          { backgroundColor: theme.cardBg, borderColor: theme.cellBorder, transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
      >
        <Icon name="Heart" size={18} color="#ff5277" />
        <Text style={[styles.rateText, { color: theme.text }]}>Rate Us on Play Store</Text>
        <Icon name="Star" size={16} color="#fbbf24" />
      </Pressable>

      {/* Daily reward popup */}
      <Modal visible={!!dailyReward} transparent animationType="fade" onRequestClose={onDismissDailyReward}>
        <View style={styles.rewardBackdrop}>
          <View style={[styles.rewardCard, { backgroundColor: theme.bgSolid, borderColor: '#fbbf24' }]}>
            <Icon name="Gift" size={56} color="#fbbf24" />
            <Text style={styles.rewardTitle}>DAILY GIFT!</Text>
            <Text style={[styles.rewardBody, { color: theme.textMuted }]}>
              {dailyReward?.streak > 1
                ? `${dailyReward.streak} day streak! Keep it going — the reward grows every day.`
                : "Welcome back! Here's your daily treat:"}
            </Text>
            <View style={styles.rewardCoinRow}>
              <Icon name="Coin" size={28} color="#fbbf24" />
              <Text style={styles.rewardCoinText}>+{dailyReward?.amount ?? 0}</Text>
            </View>
            <Pressable
              onPress={() => {
                soundEngine.playPopSound();
                onDismissDailyReward && onDismissDailyReward();
              }}
              style={[styles.rewardBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.rewardBtnText}>AWESOME!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      </ScrollView>

      {/* Bottom banner ad (renders only when online). */}
      <BannerAd theme={theme} />
    </View>
  );
}

function StatCard({ label, value, valueColor, iconName, iconColor, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
      <Icon name={iconName} size={18} color={iconColor} />
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function HowToStep({ icon, text, theme }) {
  return (
    <View style={styles.howToStep}>
      <Icon name={icon} size={18} color={theme.accent} />
      <Text style={[styles.howToText, { color: theme.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 24, paddingHorizontal: 16, gap: 8 },
  topBar: { width: '100%', maxWidth: 440, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  coinPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 50, borderWidth: 1.5 },
  coinPillText: { color: '#fbbf24', fontSize: 16, fontWeight: '900' },
  topButtons: { flexDirection: 'row', gap: 10 },
  iconBtn: { borderRadius: 14, padding: 10, borderWidth: 1 },
  hero: { alignItems: 'center', marginTop: 16 },
  logo: {
    width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10,
  },
  titleStack: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 58,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
    includeFontPadding: false,
  },
  // Offset dark copy sitting behind the real text = chunky outline + drop shadow.
  titleShadow: {
    position: 'absolute',
    color: 'rgba(0,0,0,0.55)',
    left: 3,
    top: 4,
  },
  subtitlePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12,
    paddingVertical: 7, paddingHorizontal: 16, borderRadius: 50,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
  },
  subtitle: { color: '#0f172a', fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12,
    paddingVertical: 7, paddingHorizontal: 16, borderRadius: 50, borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  levelBadgeText: { fontWeight: '900', fontSize: 13, letterSpacing: 1.5 },
  actions: { width: '100%', maxWidth: 380, alignItems: 'center', gap: 16, marginVertical: 16 },
  playBtn: {
    width: '100%', borderRadius: 24, paddingVertical: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  playText: { color: '#ffffff', fontWeight: '900', fontSize: 26, letterSpacing: 2 },
  statsRow: { width: '100%', flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', borderWidth: 1.5 },
  statLabel: { fontSize: 10, fontWeight: '900', marginTop: 5, letterSpacing: 0.8 },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: 3 },
  freeCoinsBtn: {
    width: '100%', maxWidth: 380, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, borderRadius: 18, borderWidth: 2,
    paddingVertical: 14, marginTop: 4,
  },
  freeCoinsText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.8 },
  rateBtn: { width: '100%', maxWidth: 380, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 18, borderWidth: 1, paddingVertical: 14, marginTop: 4 },
  rateText: { fontSize: 14, fontWeight: '800' },
  howTo: { width: '100%', maxWidth: 380, borderRadius: 20, borderWidth: 1, padding: 16, gap: 12, marginTop: 4 },
  howToTitle: { fontSize: 16, fontWeight: '900', marginBottom: 2 },
  howToStep: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  howToText: { fontSize: 14, fontWeight: '600', flex: 1 },
  rewardBackdrop: { flex: 1, backgroundColor: 'rgba(5,5,20,0.88)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  rewardCard: { width: '100%', maxWidth: 360, borderRadius: 28, borderWidth: 2, paddingVertical: 30, paddingHorizontal: 24, alignItems: 'center' },
  rewardTitle: { color: '#fbbf24', fontSize: 28, fontWeight: '900', marginTop: 10, letterSpacing: 1 },
  rewardBody: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 16 },
  rewardCoinRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  rewardCoinText: { color: '#fbbf24', fontSize: 36, fontWeight: '900' },
  rewardBtn: { width: '100%', borderRadius: 18, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  rewardBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
});
