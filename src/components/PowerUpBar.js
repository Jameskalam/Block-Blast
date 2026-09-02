import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { POWERUP_COST } from '../engine/storage';

// -----------------------------------------------------------------------------
// Power-up bar.
//
// Three helpers that make the game more forgiving (and give coins something
// worth buying):
//   undo    -- take back the last placement
//   shuffle -- reroll the pieces still in the tray
//   hammer  -- tap a single block to remove it
//
// If the player owns one, tapping uses it. If not, tapping buys one with coins.
// When they can't afford it either, the button offers a rewarded ad instead, so
// there's always a way forward that doesn't require spending money.
// -----------------------------------------------------------------------------

const ITEMS = [
  { kind: 'undo', icon: 'Undo', label: 'UNDO' },
  { kind: 'shuffle', icon: 'Shuffle', label: 'SHUFFLE' },
  { kind: 'hammer', icon: 'Hammer', label: 'HAMMER' },
];

export default function PowerUpBar({
  powerUps,
  coins,
  activeKind,
  canUndo,
  onUse,
  onBuy,
  onWatchAd,
  theme,
}) {
  return (
    <View style={styles.row}>
      {ITEMS.map(({ kind, icon, label }) => {
        const owned = powerUps?.[kind] ?? 0;
        const cost = POWERUP_COST[kind];
        const affordable = (coins ?? 0) >= cost;
        const isActive = activeKind === kind;
        // Undo is the only one that can be unavailable for a game-state reason.
        const disabled = kind === 'undo' && owned > 0 && !canUndo;

        let onPress;
        if (owned > 0) onPress = () => onUse(kind);
        else if (affordable) onPress = () => onBuy(kind);
        else onPress = () => onWatchAd(kind);

        return (
          <Pressable
            key={kind}
            onPress={disabled ? undefined : onPress}
            style={({ pressed }) => [
              styles.btn,
              {
                backgroundColor: isActive ? theme.accent : theme.cardBg,
                borderColor: isActive ? '#ffffff' : theme.cellBorder,
                opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Icon name={icon} size={20} color={isActive ? '#0f172a' : theme.text} />
            <Text style={[styles.label, { color: isActive ? '#0f172a' : theme.textMuted }]}>
              {label}
            </Text>

            {owned > 0 ? (
              // Owned count.
              <View style={[styles.badge, { backgroundColor: '#22c55e' }]}>
                <Text style={styles.badgeText}>{owned}</Text>
              </View>
            ) : affordable ? (
              // Buy price.
              <View style={[styles.badge, { backgroundColor: '#fbbf24' }]}>
                <Text style={styles.badgeText}>{cost}</Text>
              </View>
            ) : (
              // Fall back to a rewarded ad.
              <View style={[styles.badge, { backgroundColor: '#8b5cf6' }]}>
                <Icon name="Film" size={10} color="#ffffff" />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    maxWidth: 560,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
});
