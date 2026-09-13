import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
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
  const [isBetaModalOpen, setIsBetaModalOpen] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: theme.bgSolid }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={[styles.badge, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
            <Icon name="phone-portrait-outline" size={16} color={theme.accent} />
            <Text style={[styles.badgeText, { color: theme.text }]}>ANDROID READY</Text>
          </View>
          <View style={styles.topActions}>
            <Pressable
              onPress={onOpenThemes}
              style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
            >
              <Icon name="color-palette" size={22} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={onToggleSound}
              style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
            >
              <Icon name={isMuted ? 'volume-mute' : 'volume-high'} size={22} color={isMuted ? '#ef4444' : theme.accent} />
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <View style={[styles.logoBack, { backgroundColor: theme.accentSecondary }]} />
            <View style={[styles.logoFront, { backgroundColor: theme.accent }]}>
              <Icon name="flash" size={44} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.title}>BLOCK BLAST</Text>
          <View style={styles.subtitleRow}>
            <Icon name="sparkles" size={16} color={theme.accent} />
            <Text style={[styles.subtitle, { color: theme.accent }]}> POP & MATCH PUZZLE </Text>
            <Icon name="sparkles" size={16} color={theme.accent} />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              soundEngine.playPopSound();
              onStartGame();
            }}
            style={[styles.playBtn, { backgroundColor: theme.accent }]}
          >
            <Icon name="play" size={28} color="#ffffff" />
            <Text style={styles.playText}>PLAY GAME</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              soundEngine.playPopSound();
              setIsBetaModalOpen(true);
            }}
            style={[styles.betaBtn, { backgroundColor: theme.cardBg, borderColor: theme.accent }]}
          >
            <Icon name="rocket" size={20} color={theme.accent} />
            <Text style={[styles.betaText, { color: theme.text }]}>NEW GAMES - BETA</Text>
            <View style={[styles.soon, { backgroundColor: theme.accent }]}>
              <Text style={styles.soonText}>SOON</Text>
            </View>
          </Pressable>

          <View style={styles.statsRow}>
            <StatCard theme={theme} icon="trophy" iconColor="#fbbf24" label="HIGH SCORE" value={highScore.toLocaleString()} valueColor="#fbbf24" />
            <StatCard theme={theme} icon="flame" iconColor={theme.accent} label="TOTAL BLASTS" value={totalBlasts.toLocaleString()} />
            <StatCard theme={theme} icon="sparkles" iconColor="#38ef7d" label="GAMES" value={String(gamesPlayed)} />
          </View>
        </View>

        <Text style={[styles.footer, { color: theme.textMuted }]}>
          Tap a piece, then tap the 8x8 grid to clear full lines!
        </Text>
      </ScrollView>

      <Modal visible={isBetaModalOpen} transparent animationType="fade" onRequestClose={() => setIsBetaModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.bgSolid, borderColor: theme.accent }]}>
            <Pressable
              onPress={() => {
                soundEngine.playPopSound();
                setIsBetaModalOpen(false);
              }}
              style={[styles.modalClose, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
            >
              <Icon name="close" size={18} color={theme.text} />
            </Pressable>
            <View style={[styles.modalIcon, { backgroundColor: theme.accent }]}>
              <Icon name="construct" size={32} color="#ffffff" />
            </View>
            <Text style={styles.modalTitle}>UNDER DEVELOPMENT</Text>
            <Text style={[styles.modalHint, { color: theme.accent }]}>NEW BETA MODES COMING SOON</Text>
            <View style={[styles.featureList, { borderColor: theme.cellBorder }]}>
              <FeatureRow theme={theme} text="Time Attack Speed Mode" />
              <FeatureRow theme={theme} text="Daily Block Puzzle Rush" />
              <FeatureRow theme={theme} text="1v1 Real-Time Multiplayer Duel" />
            </View>
            <Pressable
              onPress={() => {
                soundEngine.playPopSound();
                setIsBetaModalOpen(false);
              }}
              style={[styles.gotIt, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.gotItText}>GOT IT!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({ theme, icon, iconColor, label, value, valueColor = '#ffffff' }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
      <Icon name={icon} size={18} color={iconColor} />
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function FeatureRow({ theme, text }) {
  return (
    <View style={styles.featureRow}>
      <Icon name="checkmark-circle" size={16} color={theme.accent} />
      <Text style={[styles.featureText, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  topActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { borderRadius: 14, padding: 10, borderWidth: 1 },
  hero: { alignItems: 'center', marginTop: 20 },
  logoWrap: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoBack: { position: 'absolute', width: 90, height: 90, borderRadius: 28, transform: [{ rotate: '12deg' }], opacity: 0.6 },
  logoFront: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#ffffff', fontSize: 40, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center' },
  subtitle: { fontWeight: '800', fontSize: 13, letterSpacing: 2 },
  actions: { width: '100%', maxWidth: 380, gap: 14, marginVertical: 16 },
  playBtn: {
    width: '100%',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  playText: { color: '#ffffff', fontWeight: '900', fontSize: 22, letterSpacing: 1 },
  betaBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  betaText: { fontWeight: '800', fontSize: 16 },
  soon: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  soonText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statLabel: { fontSize: 9, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  statValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  footer: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 20, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 2,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  modalClose: { position: 'absolute', top: 16, right: 16, borderRadius: 10, padding: 6, borderWidth: 1 },
  modalIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  modalHint: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 16, marginTop: 6 },
  featureList: { width: '100%', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, fontWeight: '700', flex: 1 },
  gotIt: { width: '100%', borderRadius: 16, padding: 14, alignItems: 'center' },
  gotItText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
});
