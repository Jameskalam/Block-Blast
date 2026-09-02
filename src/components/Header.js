import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';

export default function Header({
  score,
  highScore,
  coins,
  level,
  levelName,
  isMuted,
  onToggleSound,
  onOpenThemes,
  onGoHome,
  theme,
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.navbar}>
        {onGoHome ? (
          <Pressable onPress={onGoHome} style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
            <Icon name="Home" size={20} color={theme.text} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}

        {/* Level + the current background's name: progress at a glance. */}
        <View style={styles.centerGroup}>
          <View style={styles.centerRow}>
            <View style={[styles.levelPill, { backgroundColor: theme.accent, borderColor: 'rgba(255,255,255,0.55)' }]}>
              <Text style={styles.levelText}>LV {level ?? 1}</Text>
            </View>
            <View style={[styles.coinPill, { backgroundColor: theme.cardBg, borderColor: '#fbbf24' }]}>
              <Icon name="Coin" size={15} color="#fbbf24" />
              <Text style={styles.coinText}>{(coins ?? 0).toLocaleString()}</Text>
            </View>
          </View>
          {levelName ? (
            <Text style={[styles.levelName, { color: theme.textMuted }]} numberOfLines={1}>
              {String(levelName).toUpperCase()}
            </Text>
          ) : null}
        </View>

        <View style={styles.navButtons}>
          <Pressable onPress={onOpenThemes} style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
            <Icon name="Palette" size={20} color={theme.text} />
          </Pressable>
          <Pressable onPress={onToggleSound} style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
            <Icon name={isMuted ? 'VolumeX' : 'Volume2'} size={20} color={isMuted ? '#ef4444' : theme.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>CURRENT SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
          <View style={styles.hsLabelRow}>
            <Icon name="Trophy" size={13} color="#fbbf24" />
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>HIGH SCORE</Text>
          </View>
          <Text style={[styles.scoreValue, { color: '#fbbf24' }]}>{highScore.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 480, gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  spacer: { width: 40 },
  iconBtn: { borderRadius: 12, padding: 10, borderWidth: 1 },
  coinPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 50, borderWidth: 1.5 },
  coinText: { color: '#fbbf24', fontWeight: '900', fontSize: 15 },
  centerGroup: { flex: 1, alignItems: 'center', gap: 3 },
  centerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelPill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 50, borderWidth: 1.5 },
  levelText: { color: '#0f172a', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  levelName: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  navButtons: { flexDirection: 'row', gap: 8 },
  scoreRow: { flexDirection: 'row', gap: 12 },
  scoreCard: { flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1 },
  hsLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  scoreValue: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
});
