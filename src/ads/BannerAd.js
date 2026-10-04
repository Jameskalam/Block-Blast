import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd as GoogleBannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { SHOW_ADS, AD_UNITS, BANNER_HEIGHT } from './adConfig';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * Bottom anchored adaptive banner ad slot.
 *
 * Offline-first: renders nothing when offline or when an ad fails to load,
 * so the board and tray retain clean padding without ugly empty boxes.
 */
export default function BannerAd({ theme }) {
  const isOnline = useOnlineStatus();
  const [adFailed, setAdFailed] = useState(false);

  if (!SHOW_ADS || !isOnline || adFailed) return null;

  return (
    <View style={[styles.wrap, { minHeight: BANNER_HEIGHT, backgroundColor: 'transparent' }]}>
      <GoogleBannerAd
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          setAdFailed(false);
        }}
        onAdFailedToLoad={(error) => {
          console.log('[AdMob Banner] Failed to load:', error?.message || error);
          setAdFailed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
