import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';

// Kid-friendly "second chance" prompt. The original version simulated a
// rewarded video ad with guilt framing ("I'll give up"). For an all-ages /
// children's audience that's inappropriate (and runs into Play's Designed for
// Families ad policies), so this is a gentle, optional helper instead: a
// friendly "Magic Clear" that tidies the board so the player can keep going.
export default function AdWatchModal({
  isOpen,
  onWatchAdSuccess,
  onDecline,
  theme,
}) {
  const handleContinue = () => {
    soundEngine.playRewardSound();
    onWatchAdSuccess();
  };

  const handleClose = () => {
    soundEngine.playPopSound();
    onDecline();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onDecline}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.accent }]}>
          <View style={[styles.badge, { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: '#fbbf24' }]}>
            <Icon name="Sparkles" size={32} color="#fbbf24" />
          </View>

          <Text style={styles.heading}>Board is full!</Text>
          <Text style={[styles.body, { color: theme.textMuted }]}>
            Want a little help? Use a Magic Clear to tidy the board and keep playing!
          </Text>

          <Pressable onPress={handleContinue} style={[styles.continueBtn, { backgroundColor: theme.accent }]}>
            <Icon name="Sparkles" size={20} color="#ffffff" />
            <Text style={styles.continueText}>MAGIC CLEAR & CONTINUE</Text>
          </Pressable>

          <Pressable onPress={handleClose} style={styles.endBtn}>
            <Text style={[styles.endText, { color: theme.textMuted }]}>Finish this game</Text>
          </Pressable>
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
  continueBtn: { width: '100%', borderRadius: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 },
  continueText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  endBtn: { padding: 10 },
  endText: { fontSize: 14, fontWeight: '600' },
});
