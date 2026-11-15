import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';
import {
  APP_VERSION,
  CONTACT_EMAIL,
  openContactEmail,
  openPrivacyPolicy,
  openRateUs,
} from '../config/appInfo';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  isMuted,
  onToggleSound,
  onOpenThemes,
  onOpenTutorial,
  onOpenPrivacy,
}) {
  const handleClose = () => {
    soundEngine.playPopSound();
    onClose();
  };

  const handleEmail = () => {
    soundEngine.playPopSound();
    openContactEmail();
  };

  const handleRate = () => {
    soundEngine.playPopSound();
    openRateUs();
  };

  const handlePrivacy = () => {
    soundEngine.playPopSound();
    if (onOpenPrivacy) {
      onOpenPrivacy();
    } else {
      openPrivacyPolicy();
    }
  };

  const handleTutorial = () => {
    soundEngine.playPopSound();
    if (onOpenTutorial) onOpenTutorial();
  };

  const handleThemes = () => {
    soundEngine.playPopSound();
    onClose();
    if (onOpenThemes) onOpenThemes();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Icon name="Settings" size={22} color={theme.accent} />
              <Text style={styles.title}>SETTINGS</Text>
            </View>

            <Pressable
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
            >
              <Icon name="X" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Version Card */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconTag}>
                  <Icon name="Info" size={16} color={theme.accent} />
                </View>
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>APP INFORMATION</Text>
              </View>

              <View style={styles.versionRow}>
                <View>
                  <Text style={[styles.appTitle, { color: theme.text }]}>Block Mint</Text>
                  <Text style={[styles.versionText, { color: theme.accent }]}>
                    Version {APP_VERSION}
                  </Text>
                </View>
                <View style={[styles.betaPill, { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399' }]}>
                  <Text style={styles.betaPillText}>RELEASE CANDIDATE</Text>
                </View>
              </View>
              <Text style={[styles.versionHint, { color: theme.textMuted }]}>
                Production Release Candidate with live AdMob ads enabled.
              </Text>
            </View>

            {/* Developer Contact Card */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconTag}>
                  <Icon name="Mail" size={16} color="#38bdf8" />
                </View>
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>DEVELOPER SUPPORT</Text>
              </View>

              <Text style={[styles.contactDesc, { color: theme.text }]}>
                Have tester feedback, found a bug, or have a suggestion? Reach out directly:
              </Text>

              <View style={[styles.emailBox, { borderColor: theme.cellBorder, backgroundColor: 'rgba(0,0,0,0.25)' }]}>
                <Icon name="Mail" size={18} color="#38bdf8" />
                <Text style={styles.emailText} selectable>{CONTACT_EMAIL}</Text>
              </View>

              <Pressable
                onPress={handleEmail}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: theme.accent,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Icon name="Send" size={18} color="#ffffff" />
                <Text style={styles.primaryBtnText}>SEND FEEDBACK</Text>
              </Pressable>
            </View>

            {/* Preferences & Quick Actions */}
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconTag}>
                  <Icon name="Sparkles" size={16} color="#fbbf24" />
                </View>
                <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>PREFERENCES</Text>
              </View>

              {/* Sound Toggle */}
              <View style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Icon name={isMuted ? 'VolumeX' : 'Volume2'} size={20} color={isMuted ? '#ef4444' : theme.accent} />
                  <Text style={[styles.actionLabel, { color: theme.text }]}>Game Audio</Text>
                </View>
                <Pressable
                  onPress={() => {
                    soundEngine.playPopSound();
                    if (onToggleSound) onToggleSound();
                  }}
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                      borderColor: isMuted ? '#ef4444' : '#34d399',
                    },
                  ]}
                >
                  <Text style={[styles.toggleBtnText, { color: isMuted ? '#ef4444' : '#34d399' }]}>
                    {isMuted ? 'MUTED' : 'ENABLED'}
                  </Text>
                </Pressable>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.cellBorder }]} />

              {/* Tutorial / Walkthrough */}
              <Pressable onPress={handleTutorial} style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Icon name="BookOpen" size={20} color={theme.accent} />
                  <Text style={[styles.actionLabel, { color: theme.text }]}>How to Play (Tutorial)</Text>
                </View>
                <Text style={[styles.actionChevron, { color: theme.accent }]}>Replay ▶</Text>
              </Pressable>

              <View style={[styles.divider, { backgroundColor: theme.cellBorder }]} />

              {/* Theme Shop */}
              <Pressable onPress={handleThemes} style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Icon name="Palette" size={20} color={theme.text} />
                  <Text style={[styles.actionLabel, { color: theme.text }]}>Theme Shop</Text>
                </View>
                <Text style={[styles.actionChevron, { color: theme.accent }]}>Customize ▶</Text>
              </Pressable>

              <View style={[styles.divider, { backgroundColor: theme.cellBorder }]} />

              {/* Rate on Google Play */}
              <Pressable onPress={handleRate} style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Icon name="Star" size={20} color="#fbbf24" />
                  <Text style={[styles.actionLabel, { color: theme.text }]}>Rate on Google Play</Text>
                </View>
                <Text style={[styles.actionChevron, { color: theme.accent }]}>Open ▶</Text>
              </Pressable>

              <View style={[styles.divider, { backgroundColor: theme.cellBorder }]} />

              {/* Privacy Policy */}
              <Pressable onPress={handlePrivacy} style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <Icon name="Shield" size={20} color="#38bdf8" />
                  <Text style={[styles.actionLabel, { color: theme.text }]}>Privacy Policy</Text>
                </View>
                <Text style={[styles.actionChevron, { color: theme.accent }]}>Read In-App ▶</Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Close Action */}
          <Pressable
            onPress={handleClose}
            style={({ pressed }) => [
              styles.doneBtn,
              {
                backgroundColor: theme.accent,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text style={styles.doneBtnText}>CLOSE</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 20, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderWidth: 2,
    borderRadius: 28,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  closeBtn: {
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 8,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconTag: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  versionText: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  betaPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  betaPillText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  versionHint: {
    fontSize: 11,
    lineHeight: 16,
  },
  contactDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  emailText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionChevron: {
    fontSize: 12,
    fontWeight: '800',
  },
  toggleBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.6,
  },
  doneBtn: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
