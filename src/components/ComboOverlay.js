import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

export default function ComboOverlay({ comboText, theme }) {
  const [visible, setVisible] = useState(false);
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (comboText) {
      setVisible(true);
      scale.setValue(0.3);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setVisible(false);
        });
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [comboText]);

  if (!visible || !comboText) return null;

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ scale }] }]} pointerEvents="none">
      <Text
        style={[
          styles.text,
          { backgroundColor: theme.accent, shadowColor: theme.accent },
        ]}
      >
        {comboText}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: '28%', left: 0, right: 0, alignItems: 'center', zIndex: 60 },
  text: {
    paddingVertical: 10, paddingHorizontal: 24, borderRadius: 30, color: '#ffffff',
    fontWeight: '900', fontSize: 24, letterSpacing: 2, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
});
