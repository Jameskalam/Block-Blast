// -----------------------------------------------------------------------------
// Central ad configuration -- the ONLY file you edit to go live.
//
// Ads are served by react-native-google-mobile-ads (the real AdMob SDK).
//
// IMPORTANT: keep USE_REAL_ADS = false while developing. Loading or tapping your
// OWN live ad units is an AdMob policy violation ("invalid traffic") and is a
// common way first-time publishers get their account suspended. Google's test
// IDs below are the sanctioned way to develop, and they render real-looking ads.
// -----------------------------------------------------------------------------

import { Platform } from 'react-native';

// Master switch for the whole ad system. false => a completely ad-free build
// (useful if you ever want to ship a clean v1).
export const SHOW_ADS = true;

// ---------------------------------------------------------------------------
// GO-LIVE CHECKLIST -- flip this to true only when ALL of the below are true:
//   1. PROD_IDS below are filled in with your real ad unit IDs (the "/" ones).
//   2. app.json -> expo.plugins react-native-google-mobile-ads androidAppId is
//      set to your real App ID (the "~" one).
//   3. You are building a release build for the Play Store, not testing locally.
// ---------------------------------------------------------------------------
export const USE_REAL_ADS = false;

// Google's public test IDs (safe + required during development).
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

// -----------------------------------------------------------------------------
// YOUR REAL AD UNIT IDs GO HERE.
//
// Our AdMob publisher (account) ID:  ca-app-pub-7074226288393213
//
// Every ID below MUST start with that exact prefix, followed by a FORWARD SLASH
// and the ad unit's own digits:
//     ca-app-pub-7074226288393213/9876543210
//                                ^ slash = AD UNIT
//
// Do NOT paste the App ID here -- that one uses a TILDE (~) and belongs in
// app.json under the react-native-google-mobile-ads plugin config.
//
// Create one Banner unit and one Rewarded unit in the AdMob console, then paste
// them here. A mismatched prefix means you've grabbed an ID from the wrong app.
// -----------------------------------------------------------------------------
export const PUBLISHER_ID = 'ca-app-pub-7074226288393213';

const PROD_IDS = {
  banner: '',
  rewarded: '',
  interstitial: '', // not used yet
};

// Catch the two mistakes that actually happen: pasting an App ID (~) into a unit
// slot, or pasting a unit from a different AdMob account. Dev-only guard.
if (__DEV__) {
  Object.entries(PROD_IDS).forEach(([slot, id]) => {
    if (!id) return;
    if (id.includes('~')) {
      console.warn(
        `[adConfig] PROD_IDS.${slot} looks like an APP ID (contains "~"). ` +
          'Ad unit IDs use "/". The App ID belongs in app.json.'
      );
    } else if (!id.startsWith(`${PUBLISHER_ID}/`)) {
      console.warn(
        `[adConfig] PROD_IDS.${slot} does not start with ${PUBLISHER_ID}/ ` +
          '— it may belong to a different AdMob account.'
      );
    }
  });
}

// Only use production IDs when explicitly enabled AND actually filled in, so a
// half-finished config can never accidentally ship pointing at empty strings.
const useProd = USE_REAL_ADS && !!PROD_IDS.banner && !!PROD_IDS.rewarded;
const IDS = useProd ? PROD_IDS : TEST_IDS;

export const AD_UNITS = {
  banner: IDS.banner,
  rewarded: IDS.rewarded,
  interstitial: IDS.interstitial,
};

// True when we're knowingly serving Google's test ads.
export const IS_TEST_ADS = !useProd;

// -----------------------------------------------------------------------------
// Audience / compliance.
//
// This game is colorful and appeals to mixed ages, which makes it eligible for
// Google Play's Families policy. We therefore opt into the STRICT settings:
// child-directed treatment + G-rated + non-personalized ads only.
//
// Trade-off: this lowers ad revenue (non-personalized ads pay less), but serving
// personalized ads to children violates COPPA/Play policy and risks removal.
// If you later declare the app as 13+ ONLY in the Play Console, you can set
// CHILD_DIRECTED = false to earn more.
// -----------------------------------------------------------------------------
export const CHILD_DIRECTED = true;

export const AD_REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: CHILD_DIRECTED,
};

// Standard banner height (dp) used to reserve layout space so the UI doesn't
// jump when a banner loads.
export const BANNER_HEIGHT = 50;
