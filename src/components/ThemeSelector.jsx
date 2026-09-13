import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { THEMES } from '../styles/themes';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';

export default function ThemeSelector({
  isOpen,
  currentThemeId,
  onSelectTheme,
  onClose,
  theme
}) {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
          <View style={styles.header}>
            <Text style={styles.title}>SELECT THEME</Text>
            <Pressable
              onPress={() => {
                soundEngine.playPopSound();
                onClose();
              }}
              style={[styles.closeBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
            >
              <Icon name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          {Object.values(THEMES).map((th) => {
            const isSelected = currentThemeId === th.id;
            return (
              <Pressable
                key={th.id}
                onPress={() => {
                  soundEngine.playPopSound();
                  onSelectTheme(th.id);
                }}
                style={[
                  styles.themeRow,
                  {
                    backgroundColor: th.bgSolid,
                    borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)',
                    borderWidth: isSelected ? 3 : 1,
                  },
                ]}
              >
                <View>
                  <Text style={styles.themeName}>{th.name}</Text>
                  <View style={styles.dots}>
                    {[1, 2, 3, 4, 5].map((cIdx) => (
                      <View
                        key={cIdx}
                        style={[styles.dot, { backgroundColor: th.blockColors[cIdx] }]}
                      />
                    ))}
                  </View>
                </View>
                {isSelected ? (
                  <View style={styles.check}>
                    <Icon name="checkmark" size={18} color="#000000" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
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
  card: { width: '100%', maxWidth: 420, borderWidth: 2, borderRadius: 28, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  closeBtn: { borderRadius: 12, padding: 6, borderWidth: 1 },
  themeRow: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  themeName: { color: '#ffffff', fontWeight: '800', fontSize: 16, marginBottom: 6 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 4 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
