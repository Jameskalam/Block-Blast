// -----------------------------------------------------------------------------
// Central AdMob configuration.
//
// Integrated with `react-native-google-mobile-ads`.
//
// When PROD_IDS are left empty (''), the app safely serves official Google
// TEST ads so you can verify rendering and rewarded logic without risking
// AdMob account suspension for invalid traffic.
//
// When you're ready for production:
// 1. Paste your real AdMob unit IDs into PROD_IDS below.
// 2. Ensure your real AdMob App ID is set in app.json, package.json, and AndroidManifest.xml.
// -----------------------------------------------------------------------------

import { TestIds } from 'react-native-google-mobile-ads';

// Master switch for the whole ad system.
export const SHOW_ADS = true;

// Active real native Google Mobile Ads SDK.
export const USE_REAL_ADS = true;

// Official Google AdMob Test Unit IDs
const TEST_IDS = {
  banner: TestIds.BANNER,
  rewarded: TestIds.REWARDED,
  interstitial: TestIds.INTERSTITIAL,
};

// -----------------------------------------------------------------------------
// PASTE YOUR REAL ADMOB PRODUCTION IDS HERE BEFORE PUBLISHING
// -----------------------------------------------------------------------------
export const PROD_IDS = {
  banner: '',       // e.g. 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
  rewarded: '',     // e.g. 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
  interstitial: '', // e.g. 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'
};

export const AD_UNITS = {
  banner: (PROD_IDS.banner && PROD_IDS.banner.trim()) ? PROD_IDS.banner : TEST_IDS.banner,
  rewarded: (PROD_IDS.rewarded && PROD_IDS.rewarded.trim()) ? PROD_IDS.rewarded : TEST_IDS.rewarded,
  interstitial: (PROD_IDS.interstitial && PROD_IDS.interstitial.trim()) ? PROD_IDS.interstitial : TEST_IDS.interstitial,
};

// Standard adaptive banner reserved height (dp) to prevent layout jumping
export const BANNER_HEIGHT = 50;
