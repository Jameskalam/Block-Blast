import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';

// Color + subtitle per difficulty phase so the wave reads at a glance.
const PHASE_STYLE = {
  'Very Easy': { color: '#22c55e', sub: 'Relax & have fun!' },
  Easy: { color: '#38ef7d', sub: 'Keep it going!' },
  Medium: { color: '#fbbf24', sub: 'Getting spicy!' },
  Complex: { color: '#fb7185', sub: 'Big challenge!' },
};

/**
 * Announces a difficulty-phase change with a short animated banner.
 * Re-fires whenever `phase` (an object like { name }) changes identity.
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
    }, 1700);
    return () => clearTimeout(timer);
  }, [phase]);

  if (!visible || !phase) return null;

  const info = PHASE_STYLE[phase.name] || { color: '#fbbf24', sub: 'New shapes!' };

  return (
    <View style={styles.wrap} pointerEvents="none">
      <Animated.View style={{ opacity, transform: [{ scale }, { translateY }], alignItems: 'center' }}>
        <Text style={styles.small}>DIFFICULTY</Text>
        <Text style={[styles.big, { color: '#0f172a', backgroundColor: info.color, shadowColor: info.color }]}>
          {phase.name.toUpperCase()}
        </Text>
        <Text style={[styles.sub, { color: theme.text }]}>{info.sub}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 70,
  },
  small: { color: '#ffffff', fontWeight: '800', fontSize: 14, letterSpacing: 4, marginBottom: 6, opacity: 0.9 },
  big: {
    paddingVertical: 12, paddingHorizontal: 30, borderRadius: 30,
    fontWeight: '900', fontSize: 30, letterSpacing: 2, overflow: 'hidden',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)',
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 12,
  },
  sub: { marginTop: 10, fontWeight: '800', fontSize: 15, letterSpacing: 1 },
});
