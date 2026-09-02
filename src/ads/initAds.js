import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';
import { SHOW_ADS, CHILD_DIRECTED } from './adConfig';

// -----------------------------------------------------------------------------
// One-time AdMob SDK initialization.
//
// The request configuration MUST be applied BEFORE initialize() / before any ad
// loads, otherwise the first ad request can go out without the child-directed
// flags -- which is exactly the compliance failure we're trying to avoid.
// -----------------------------------------------------------------------------
export async function initAds() {
  if (!SHOW_ADS) return;

  try {
    await mobileAds().setRequestConfiguration({
      // G = suitable for general/family audiences.
      maxAdContentRating: CHILD_DIRECTED ? MaxAdContentRating.G : MaxAdContentRating.PG,
      // COPPA: mark traffic as child-directed.
      tagForChildDirectedTreatment: CHILD_DIRECTED,
      // GDPR: treat users as being of "under age of consent" in the EEA.
      tagForUnderAgeOfConsent: CHILD_DIRECTED,
    });

    await mobileAds().initialize();

    // Warm the first interstitial now so the earliest between-games slot has
    // something ready to show.
    const { initInterstitial } = require('./interstitial');
    initInterstitial();
  } catch (e) {
    // Ads are non-essential: never let an ad failure block the game starting.
  }
}
