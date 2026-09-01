// -----------------------------------------------------------------------------
// Central ad configuration.
//
// Real ad serving (via react-native-google-mobile-ads) is NOT wired up yet.
// This file is the single place to manage ad unit IDs and the on/off switch so
// that dropping in the real SDK later requires no UI changes.
//
// The IDs below are Google's official AdMob TEST unit IDs. Replace them with
// your real unit IDs when you're ready to go live (and flip USE_REAL_ADS).
// -----------------------------------------------------------------------------

import { Platform } from 'react-native';

// Flip to true once react-native-google-mobile-ads is installed + configured.
export const USE_REAL_ADS = false;

// Google's public test IDs (safe to use during development).
const TEST_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
};

// TODO: put your real AdMob unit IDs here before shipping.
const PROD_IDS = {
  banner: '',
  rewarded: '',
  interstitial: '',
};

const IDS = USE_REAL_ADS && PROD_IDS.banner ? PROD_IDS : TEST_IDS;

export const AD_UNITS = {
  banner: IDS.banner,
  rewarded: IDS.rewarded,
  interstitial: IDS.interstitial,
};

// Standard banner height (dp) used to reserve layout space so the UI doesn't
// jump when a banner loads.
export const BANNER_HEIGHT = 50;
