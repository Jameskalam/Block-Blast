import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';

/**
 * Celebrates completing a level and reveals the new background's name.
 * Re-fires whenever `phase` ({ level, name, difficulty }) changes identity.
 */
export default function StageBanner({ phase, theme }) {
  const [visible, setVisible] = useState(false);
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!phase) return;
    setVisible(true);
    scale.setValue(0.5);
    opacity.setValue(0);
    translateY.setValue(20);

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 6, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setVisible(false);
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, [phase]);

  if (!visible || !phase) return null;

  const accent = theme.accent || '#fbbf24';

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={{ opacity, transform: [{ scale }, { translateY }], alignItems: 'center' }}>
        <Text style={styles.small}>BOARD CLEARED!</Text>
        <Text style={[styles.big, { color: '#0f172a', backgroundColor: accent, shadowColor: accent }]}>
          LEVEL {phase.level}
        </Text>
        <Text style={[styles.sub, { color: theme.text }]}>
          +{phase.bonus ?? 0} COINS
        </Text>
        <Text style={[styles.tiny, { color: theme.textMuted }]}>
          {String(phase.difficulty || '').toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 70,
  },
  small: { color: '#ffffff', fontWeight: '900', fontSize: 15, letterSpacing: 4, marginBottom: 8, opacity: 0.95 },
  big: {
    paddingVertical: 12, paddingHorizontal: 32, borderRadius: 30,
    fontWeight: '900', fontSize: 36, letterSpacing: 2, overflow: 'hidden',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.75)',
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 12,
  },
  sub: { marginTop: 14, fontWeight: '900', fontSize: 15, letterSpacing: 1.5 },
  tiny: { marginTop: 6, fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
});
