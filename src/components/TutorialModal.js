import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from './Icon';
import { soundEngine } from '../engine/soundEngine';
import { storage } from '../engine/storage';

const STEPS = [
  {
    step: 1,
    tag: 'STEP 1 OF 3',
    title: 'Place Blocks on the Board',
    subtitle: 'Drag shapes from the bottom onto the 8×8 grid.',
    icon: 'Target',
    iconColor: '#38bdf8',
    previewType: 'place',
    description:
      'Choose from 3 shapes in your tray. Touch and drag any shape into place. Blocks cannot be rotated, so think one step ahead to keep your options open!',
    proTip: 'Keep central 3×3 spaces open for bigger pieces.',
  },
  {
    step: 2,
    tag: 'STEP 2 OF 3',
    title: 'Blast Full Lines',
    subtitle: 'Fill complete horizontal rows or vertical columns.',
    icon: 'Zap',
    iconColor: '#fbbf24',
    previewType: 'blast',
    description:
      'Whenever a full horizontal row or vertical column is completely filled with blocks, it automatically blasts away, freeing up room for your next moves.',
    proTip: 'Clearing multiple lines in a single drop gives bonus points!',
  },
  {
    step: 3,
    tag: 'STEP 3 OF 3',
    title: 'Chains, Combos & Coins',
    subtitle: 'Score massive streaks and unlock custom themes.',
    icon: 'Flame',
    iconColor: '#f43f5e',
    previewType: 'combo',
    description:
      'Blast lines on consecutive turns to build your COMBO multiplier! The higher your combo streak, the higher your score and coin earnings.',
    proTip: 'Collect coins to unlock exclusive color themes in the Shop.',
  },
];

export default function TutorialModal({ isOpen, onClose, theme }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];
  const isLast = currentStepIndex === STEPS.length - 1;

  const handleFinish = () => {
    soundEngine.playPopSound();
    storage.setHasSeenTutorial(true);
    setCurrentStepIndex(0);
    onClose();
  };

  const handleNext = () => {
    soundEngine.playPopSound();
    if (isLast) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    soundEngine.playPopSound();
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleFinish}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.bgSolid, borderColor: theme.cellBorder }]}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={[styles.stepTag, { backgroundColor: 'rgba(52, 211, 153, 0.15)', borderColor: '#34d399' }]}>
              <Text style={styles.stepTagText}>{currentStep.tag}</Text>
            </View>

            <Pressable onPress={handleFinish} style={styles.skipBtn}>
              <Text style={[styles.skipText, { color: theme.textMuted }]}>SKIP</Text>
              <Icon name="X" size={16} color={theme.textMuted} />
            </Pressable>
          </View>

          {/* Step Visual Preview Card */}
          <View style={[styles.visualBox, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}>
            {currentStep.previewType === 'place' && (
              <View style={styles.visualDiagram}>
                <View style={styles.miniGrid}>
                  {[0, 1, 2, 3].map((r) => (
                    <View key={r} style={styles.miniRow}>
                      {[0, 1, 2, 3].map((c) => {
                        const isFilled = (r === 2 && c >= 1) || (r === 1 && c === 2);
                        return (
                          <View
                            key={c}
                            style={[
                              styles.miniCell,
                              {
                                backgroundColor: isFilled ? theme.accent : 'rgba(255, 255, 255, 0.05)',
                                borderColor: isFilled ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                  ))}
                </View>
                <View style={styles.arrowPointer}>
                  <Text style={styles.arrowText}>⬇ Drag Into Board</Text>
                  <View style={styles.floatingPiece}>
                    <View style={styles.miniRow}>
                      <View style={[styles.miniCell, { backgroundColor: '#38bdf8', borderColor: '#ffffff' }]} />
                      <View style={[styles.miniCell, { backgroundColor: '#38bdf8', borderColor: '#ffffff' }]} />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {currentStep.previewType === 'blast' && (
              <View style={styles.visualDiagram}>
                <View style={styles.miniGrid}>
                  {[0, 1, 2, 3].map((r) => (
                    <View key={r} style={styles.miniRow}>
                      {[0, 1, 2, 3].map((c) => {
                        const isBlastingRow = r === 1;
                        const isBlastingCol = c === 2;
                        const isHighlighted = isBlastingRow || isBlastingCol;
                        return (
                          <View
                            key={c}
                            style={[
                              styles.miniCell,
                              {
                                backgroundColor: isHighlighted ? '#fbbf24' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: isHighlighted ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                              },
                            ]}
                          >
                            {isHighlighted && <Text style={styles.sparkleIcon}>✦</Text>}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
                <View style={[styles.blastBadge, { backgroundColor: 'rgba(251, 191, 36, 0.2)', borderColor: '#fbbf24' }]}>
                  <Icon name="Sparkles" size={16} color="#fbbf24" />
                  <Text style={styles.blastBadgeText}>ROW &amp; COLUMN CLEARED!</Text>
                </View>
              </View>
            )}

            {currentStep.previewType === 'combo' && (
              <View style={styles.comboVisual}>
                <View style={styles.streakBadgeWrap}>
                  <View style={[styles.streakBadge, { backgroundColor: 'rgba(244, 63, 94, 0.25)', borderColor: '#f43f5e' }]}>
                    <Icon name="Flame" size={24} color="#f43f5e" />
                    <Text style={styles.streakText}>COMBO x4</Text>
                  </View>
                  <View style={[styles.coinRewardPill, { backgroundColor: 'rgba(251, 191, 36, 0.2)', borderColor: '#fbbf24' }]}>
                    <Icon name="Coin" size={18} color="#fbbf24" />
                    <Text style={styles.coinRewardText}>+200 BONUS</Text>
                  </View>
                </View>
                <Text style={styles.streakHint}>Consecutive blasts yield exponentially higher scores!</Text>
              </View>
            )}
          </View>

          {/* Title & Description */}
          <View style={styles.contentWrap}>
            <View style={styles.stepHeader}>
              <Icon name={currentStep.icon} size={24} color={currentStep.iconColor} />
              <Text style={[styles.stepTitle, { color: theme.text }]}>{currentStep.title}</Text>
            </View>

            <Text style={[styles.stepSubtitle, { color: theme.accent }]}>
              {currentStep.subtitle}
            </Text>

            <Text style={[styles.stepDesc, { color: theme.textMuted }]}>
              {currentStep.description}
            </Text>

            {/* Pro Tip Box */}
            <View style={[styles.tipCard, { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: theme.cellBorder }]}>
              <Text style={styles.tipLabel}>💡 PRO TIP:</Text>
              <Text style={[styles.tipText, { color: theme.text }]}>
                {currentStep.proTip}
              </Text>
            </View>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  {
                    backgroundColor: idx === currentStepIndex ? theme.accent : 'rgba(255, 255, 255, 0.2)',
                    width: idx === currentStepIndex ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>

          {/* Bottom Navigation Buttons */}
          <View style={styles.btnRow}>
            {currentStepIndex > 0 ? (
              <Pressable
                onPress={handlePrev}
                style={[styles.backBtn, { backgroundColor: theme.cardBg, borderColor: theme.cellBorder }]}
              >
                <Text style={[styles.backBtnText, { color: theme.text }]}>Back</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            <Pressable
              onPress={handleNext}
              style={[
                styles.nextBtn,
                {
                  backgroundColor: theme.accent,
                  flex: currentStepIndex > 0 ? 2 : 3,
                },
              ]}
            >
              <Text style={styles.nextBtnText}>
                {isLast ? 'GOT IT, LET’S PLAY!' : 'NEXT STEP ▶'}
              </Text>
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
    backgroundColor: 'rgba(3, 7, 18, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 26,
    borderWidth: 2,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
    elevation: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepTag: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#34d399',
    letterSpacing: 0.8,
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  visualBox: {
    width: '100%',
    height: 140,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 14,
  },
  visualDiagram: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  miniGrid: {
    gap: 4,
  },
  miniRow: {
    flexDirection: 'row',
    gap: 4,
  },
  miniCell: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleIcon: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  arrowPointer: {
    alignItems: 'center',
    gap: 8,
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  floatingPiece: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  blastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  blastBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  comboVisual: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  streakBadgeWrap: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  streakText: {
    color: '#f43f5e',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  coinRewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  coinRewardText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '900',
  },
  streakHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentWrap: {
    gap: 6,
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stepSubtitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
  },
  tipLabel: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '900',
  },
  tipText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  nextBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});

