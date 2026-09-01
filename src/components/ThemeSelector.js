import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { THEMES } from '../styles/themes';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';

export default function ThemeSelector({
  isOpen,
  currentThemeId,
  unlockedThemes = ['ocean'],
  coins = 0,
  onSelectTheme,
  onBuyTheme,
  onClose,
  theme,
}) {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>THEME SHOP</Text>
            <View style={styles.headerRight}>
              <View style={[styles.coinPill, { backgroundColor: theme.cardBg, borderColor: '#fbbf24' }]}>
                <Icon name="Coin" size={15} color="#fbbf24" />
                <Text style={styles.coinPillText}>{coins.toLocaleString()}</Text>
              </View>
              <Pressable
                onPress={() => {
                  soundEngine.playPopSound();
                  onClose();
                }}
                style={[styles.closeBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
              >
                <Icon name="X" size={20} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ gap: 12 }}>
            {Object.values(THEMES).map((th) => {
              const isSelected = currentThemeId === th.id;
              const isOwned = unlockedThemes.includes(th.id) || th.price === 0;
              const canAfford = coins >= th.price;

              const handlePress = () => {
                if (isOwned) {
                  soundEngine.playPopSound();
                  onSelectTheme(th.id);
                } else if (canAfford) {
                  onBuyTheme && onBuyTheme(th);
                } else {
                  // Not enough coins: gentle nudge, no purchase.
                  soundEngine.playPopSound();
                }
              };

              return (
                <Pressable
                  key={th.id}
                  onPress={handlePress}
                  style={[
                    styles.themeRow,
                    {
                      backgroundColor: th.bgSolid,
                      borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)',
                      borderWidth: isSelected ? 3 : 1,
                      opacity: isOwned || canAfford ? 1 : 0.6,
                    },
                  ]}
                >
                  <View style={{ gap: 6, flex: 1 }}>
                    <Text style={styles.themeName}>{th.name}</Text>
                    <View style={styles.dots}>
                      {[1, 2, 3, 4, 5].map((cIdx) => (
                        <View key={cIdx} style={[styles.dot, { backgroundColor: th.blockColors[cIdx] }]} />
                      ))}
                    </View>
                  </View>

                  {isSelected ? (
                    <View style={styles.checkCircle}>
                      <Icon name="Check" size={18} color="#000000" />
                    </View>
                  ) : isOwned ? (
                    <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                      <Text style={styles.tagText}>OWNED</Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.priceTag,
                        { backgroundColor: canAfford ? '#fbbf24' : 'rgba(0,0,0,0.4)' },
                      ]}
                    >
                      <Icon name="Coin" size={15} color={canAfford ? '#0f172a' : '#fbbf24'} />
                      <Text style={[styles.priceText, { color: canAfford ? '#0f172a' : '#fbbf24' }]}>
                        {th.price}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.hint, { color: theme.textMuted }]}>
            Earn coins by clearing lines, then unlock new themes!
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,5,20,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, maxHeight: '82%', borderRadius: 28, borderWidth: 2, padding: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coinPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 50, borderWidth: 1.5 },
  coinPillText: { color: '#fbbf24', fontWeight: '900', fontSize: 15 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  closeBtn: { borderRadius: 12, padding: 8, borderWidth: 1 },
  themeRow: { borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeName: { color: '#ffffff', fontWeight: '800', fontSize: 16 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 4 },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  tag: { borderRadius: 50, paddingVertical: 6, paddingHorizontal: 14 },
  tagText: { color: '#ffffff', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  priceTag: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 50, paddingVertical: 7, paddingHorizontal: 14 },
  priceText: { fontWeight: '900', fontSize: 15 },
  hint: { fontSize: 12, textAlign: 'center', marginTop: 16 },
});
