import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';
import { openPrivacyPolicy, CONTACT_EMAIL } from '../config/appInfo';

export default function InAppPrivacyModal({ isOpen, onClose, theme }) {
  if (!isOpen) return null;

  const handleClose = () => {
    soundEngine.playPopSound();
    onClose();
  };

  const handleOpenBrowser = () => {
    soundEngine.playPopSound();
    openPrivacyPolicy();
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <Icon name="Shield" size={22} color={theme.accent} />
              <Text style={styles.title}>PRIVACY POLICY</Text>
            </View>

            <Pressable
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
            >
              <Icon name="X" size={20} color={theme.text} />
            </Pressable>
          </View>

          {/* Subtitle / badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399' }]}>
              <Text style={styles.badgeText}>🔒 OFFLINE-FIRST</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38bdf8' }]}>
              <Text style={styles.badgeText}>👤 NO ACCOUNT REQUIRED</Text>
            </View>
          </View>

          {/* Scrollable Policy Body */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>1. Overview</Text>
              <Text style={[styles.bodyText, { color: theme.textMuted }]}>
                This Privacy Policy describes how Block Mint (&quot;we&quot;, &quot;our&quot;, or &quot;the Game&quot;) handles your data. Block Mint is designed as an offline-first casual block puzzle game. We respect your privacy and do not sell your personal information.
              </Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>2. Information Collection</Text>
              <Text style={[styles.bodyText, { color: theme.textMuted }]}>
                Block Mint does not require registration, login, email address, phone number, or names to play. All gameplay data including high scores, game statistics, coins, and unlocked themes are saved locally on your device storage.
              </Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>3. Advertising &amp; Third-Party SDKs</Text>
              <Text style={[styles.bodyText, { color: theme.textMuted }]}>
                Block Mint integrates Google AdMob (Google Mobile Ads SDK) to display banner and rewarded video ads. Third-party advertising partners may automatically collect limited technical device information, including:
              </Text>
              <View style={styles.bulletList}>
                <Text style={[styles.bulletItem, { color: theme.textMuted }]}>• Google Advertising ID (GAID / AAID)</Text>
                <Text style={[styles.bulletItem, { color: theme.textMuted }]}>• Device identifiers, model, and OS version</Text>
                <Text style={[styles.bulletItem, { color: theme.textMuted }]}>• Approximate IP-based network location</Text>
                <Text style={[styles.bulletItem, { color: theme.textMuted }]}>• Ad interaction and fraud-prevention telemetry</Text>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>4. Children&apos;s Privacy</Text>
              <Text style={[styles.bodyText, { color: theme.textMuted }]}>
                Block Mint does not knowingly collect personally identifiable information from children under 13. If you believe your child has inadvertently provided personal information, please contact us immediately.
              </Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>5. Data Security</Text>
              <Text style={[styles.bodyText, { color: theme.textMuted }]}>
                All user game progress is stored securely on your local device. Any communication with Google AdMob servers utilizes industry-standard HTTPS / TLS encryption in transit.
              </Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>6. Contact &amp; Inquiries</Text>
              <Text style={[styles.bodyText, { color: theme.textMuted }]}>
                If you have questions or concerns regarding our privacy practices, please contact:
              </Text>
              <Text style={[styles.contactEmail, { color: theme.accent }]} selectable>
                {CONTACT_EMAIL}
              </Text>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <Pressable
                onPress={handleOpenBrowser}
                style={[styles.webBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
              >
                <Icon name="ExternalLink" size={16} color={theme.accent} />
                <Text style={[styles.webBtnText, { color: theme.text }]}>Open in Web Browser</Text>
              </Pressable>

              <Pressable
                onPress={handleClose}
                style={[styles.doneBtn, { backgroundColor: theme.accent }]}
              >
                <Text style={styles.doneBtnText}>I UNDERSTAND</Text>
              </Pressable>
            </View>
          </ScrollView>
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '88%',
    borderRadius: 24,
    borderWidth: 2,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingVertical: 4,
    gap: 10,
  },
  sectionCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  bulletList: {
    marginTop: 4,
    gap: 4,
    paddingLeft: 6,
  },
  bulletItem: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  contactEmail: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  bottomActions: {
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  webBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  webBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: 16,
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

