import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  BackHandler,
} from 'react-native';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';

export default function ExitConfirmModal({ isOpen, onClose, theme }) {
  if (!isOpen) return null;

  const handleStay = () => {
    soundEngine.playPopSound();
    onClose();
  };

  const handleExitApp = () => {
    soundEngine.playPopSound();
    BackHandler.exitApp();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }]}>
            <Icon name="Home" size={32} color="#ef4444" />
          </View>

          <Text style={styles.title}>EXIT BLOCK MINT?</Text>
          <Text style={[styles.message, { color: theme.textMuted }]}>
            Are you sure you want to exit the game?
          </Text>

          <View style={[styles.infoBox, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
            <Icon name="CheckCircle" size={16} color="#34d399" />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Your high score, coins, and unlocks are safely saved!
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleExitApp}
              style={[styles.btn, styles.exitBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
            >
              <Text style={[styles.btnText, { color: '#ef4444' }]}>EXIT GAME</Text>
            </Pressable>

            <Pressable
              onPress={handleStay}
              style={[styles.btn, styles.stayBtn, { backgroundColor: theme.accent }]}
            >
              <Text style={[styles.btnText, { color: '#ffffff' }]}>STAY &amp; PLAY</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 2,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtn: {
    borderWidth: 1,
  },
  stayBtn: {},
  btnText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

