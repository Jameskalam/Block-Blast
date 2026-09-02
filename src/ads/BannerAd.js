import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BannerAd as GoogleBanner,
  BannerAdSize,
} from 'react-native-google-mobile-ads';
import { SHOW_ADS, AD_UNITS, BANNER_HEIGHT, AD_REQUEST_OPTIONS } from './adConfig';
import { useOnlineStatus } from './useOnlineStatus';

// A bottom banner ad slot.
//
// Offline-first: renders nothing when the device is offline, so the layout stays
// clean with no empty ad box. Also renders nothing if the ad fails to load
// (no fill, misconfigured unit), rather than leaving a dead grey bar on screen.
export default function BannerAd({ theme }) {
  const isOnline = useOnlineStatus();
  const [failed, setFailed] = useState(false);

  if (!SHOW_ADS) return null;
  if (!isOnline) return null;
  if (failed) return null;

  return (
    <View style={styles.host}>
      <GoogleBanner
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={AD_REQUEST_OPTIONS}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    width: '100%',
    minHeight: BANNER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
