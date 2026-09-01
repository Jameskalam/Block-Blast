import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const IONICONS = new Set([
  'play',
  'trophy',
  'flame',
  'color-palette',
  'volume-high',
  'volume-mute',
  'sparkles',
  'flash',
  'phone-portrait-outline',
  'rocket',
  'close',
  'checkmark',
  'checkmark-circle',
  'home',
  'refresh',
  'film',
  'warning',
  'play-circle',
  'construct',
]);

export default function Icon({ name, size = 20, color = '#ffffff' }) {
  if (IONICONS.has(name)) {
    return <Ionicons name={name} size={size} color={color} />;
  }
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}
