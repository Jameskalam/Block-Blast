import React from 'react';
import { Text } from 'react-native';

// Lightweight emoji-based icon substitute for React Native so we don't
// depend on lucide-react (which is web/DOM only).
const GLYPHS = {
  Play: '▶',
  Trophy: '🏆',
  Flame: '🔥',
  Palette: '🎨',
  Volume2: '🔊',
  VolumeX: '🔇',
  Sparkles: '✨',
  Zap: '⚡',
  Smartphone: '📱',
  Home: '🏠',
  Check: '✓',
  X: '✕',
  Film: '🎬',
  PlayCircle: '⏵',
  XCircle: '✖',
  CheckCircle: '✔',
  AlertTriangle: '⚠️',
  Coin: '🪙',
  Gift: '🎁',
  Star: '⭐',
  Crown: '👑',
  Heart: '❤️',
  Rocket: '🚀',
  Medal: '🏅',
  Target: '🎯',
};

export default function Icon({ name, size = 20, color = '#fff', style }) {
  const glyph = GLYPHS[name] || '•';
  return (
    <Text
      style={[
        { fontSize: size * 0.9, color, lineHeight: size * 1.1, textAlign: 'center' },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}
