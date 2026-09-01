import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';

// Friendly "under development" popup used for features that are visible in the
// UI but not built yet, so no button ever does nothing.
export default function ComingSoonModal({ visible, title, message, onClose, theme }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.accent }]}>
          <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: theme.accent }]}>
            <Icon name="Rocket" size={34} color={theme.accent} />
          </View>
          <Text style={styles.title}>{title || 'Coming Soon!'}</Text>
          <Text style={[styles.body, { color: theme.textMuted }]}>
            {message || "We're still building this. Check back in a future update!"}
          </Text>
          <Pressable
            onPress={() => {
              soundEngine.playPopSound();
              onClose && onClose();
            }}
            style={[styles.btn, { backgroundColor: theme.accent }]}
          >
            <Text style={styles.btnText}>GOT IT</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(5,5,20,0.85)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 360, borderRadius: 28, borderWidth: 2, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center' },
  badge: { width: 60, height: 60, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { color: '#ffffff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  body: { fontSize: 14, textAlign: 'center', marginBottom: 22, lineHeight: 20 },
  btn: { width: '100%', borderRadius: 18, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#ffffff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
