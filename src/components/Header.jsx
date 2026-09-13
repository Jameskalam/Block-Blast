import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from './Icon';

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
    <View style={styles.wrap}>
      <View style={styles.nav}>
        {onGoHome ? (
          <Pressable
            onPress={onGoHome}
            style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
          >
            <Icon name="home" size={20} color={theme.text} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <View style={styles.titleRow}>
          <Icon name="flash" size={22} color={theme.accent} />
          <Text style={[styles.title, { color: theme.accent }]}>BLOCK BLAST</Text>
        </View>

        <View style={styles.navActions}>
          <Pressable
            onPress={onOpenThemes}
            style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
          >
            <Icon name="color-palette" size={20} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={onToggleSound}
            style={[styles.iconBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
          >
            <Icon name={isMuted ? 'volume-mute' : 'volume-high'} size={20} color={isMuted ? '#ef4444' : theme.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.scores}>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
          <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>CURRENT SCORE</Text>
          <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={[styles.scoreCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
          <View style={styles.highLabelRow}>
            <Icon name="trophy" size={14} color="#fbbf24" />
            <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>HIGH SCORE</Text>
          </View>
          <Text style={[styles.scoreValue, { color: '#fbbf24' }]}>{highScore.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { borderRadius: 12, padding: 10, borderWidth: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  navActions: { flexDirection: 'row', gap: 8 },
  scores: { flexDirection: 'row', gap: 12 },
  scoreCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  scoreLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  scoreValue: { fontSize: 26, fontWeight: '900', color: '#ffffff' },
  highLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
