import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ComboOverlay({ comboText, theme }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (comboText) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [comboText]);

  if (!visible || !comboText) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.badge, { backgroundColor: theme.accent }]}>
        <Text style={styles.text}>{comboText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  badge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  text: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 1,
  },
});
