import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { USE_REAL_ADS, AD_UNITS, BANNER_HEIGHT } from './adConfig';
import { useOnlineStatus } from './useOnlineStatus';

// A bottom banner ad slot.
//
// Offline-first: renders nothing when the device is offline, so the layout
// stays clean with no empty ad box. When online it either shows the real
// AdMob banner (once USE_REAL_ADS is on and the SDK is wired below) or a
// clearly-labeled placeholder during development.
//
// TODO (when wiring the real SDK):
//   import { BannerAd as GoogleBanner, BannerAdSize } from 'react-native-google-mobile-ads';
//   ...and render <GoogleBanner unitId={AD_UNITS.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
export default function BannerAd({ theme }) {
  const isOnline = useOnlineStatus();

  // Offline => no banner at all (game is fully offline).
  if (!isOnline) return null;

  if (USE_REAL_ADS) {
    // Real banner is rendered here once the SDK is installed. Until then we
    // fall through to the placeholder so nothing crashes.
    // return <GoogleBanner unitId={AD_UNITS.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />;
  }

  const border = theme?.cellBorder || 'rgba(255,255,255,0.15)';
  const card = theme?.cardBg || 'rgba(255,255,255,0.08)';
  const muted = theme?.textMuted || '#94a3b8';

  return (
    <View style={[styles.wrap, { height: BANNER_HEIGHT, backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.label, { color: muted }]}>Ad</Text>
      <Text style={[styles.sub, { color: muted }]} numberOfLines={1}>
        Banner slot · {AD_UNITS.banner}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 2, opacity: 0.8 },
  sub: { fontSize: 9, opacity: 0.5, marginTop: 1, paddingHorizontal: 12 },
});
