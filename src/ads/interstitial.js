import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { SHOW_ADS, AD_UNITS, AD_REQUEST_OPTIONS } from './adConfig';

// -----------------------------------------------------------------------------
// Interstitial ads, shown between games.
//
// Frequency capping matters more than raw impressions here: an interstitial on
// every single game-over makes players quit the app entirely, which costs more
// revenue than the extra impressions earn. So we show one at most every
// GAMES_BETWEEN_ADS games AND never more than once per MIN_INTERVAL_MS.
//
// The ad is also preloaded in the background, so it appears instantly rather
// than making the player wait on a spinner.
// -----------------------------------------------------------------------------

const GAMES_BETWEEN_ADS = 3;
const MIN_INTERVAL_MS = 90 * 1000;

let ad = null;
let loaded = false;
let gamesSinceAd = 0;
let lastShownAt = 0;
let unsubscribers = [];

function teardown() {
  unsubscribers.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      /* ignore */
    }
  });
  unsubscribers = [];
  ad = null;
  loaded = false;
}

// Create + load a fresh interstitial. Interstitials are single-use: once shown,
// a new one must be created for the next time.
function preload() {
  if (!SHOW_ADS) return;
  if (ad) return;

  const next = InterstitialAd.createForAdRequest(AD_UNITS.interstitial, AD_REQUEST_OPTIONS);
  ad = next;
  loaded = false;

  unsubscribers.push(
    next.addAdEventListener(AdEventType.LOADED, () => {
      loaded = true;
    })
  );
  unsubscribers.push(
    next.addAdEventListener(AdEventType.CLOSED, () => {
      // Burned: build the next one for later.
      teardown();
      preload();
    })
  );
  unsubscribers.push(
    next.addAdEventListener(AdEventType.ERROR, () => {
      // Don't retry in a loop -- wait until the next natural opportunity.
      teardown();
    })
  );

  try {
    next.load();
  } catch (e) {
    teardown();
  }
}

export function initInterstitial() {
  preload();
}

/** Call when a game ends. Returns true if an ad was actually shown. */
export function maybeShowInterstitial() {
  if (!SHOW_ADS) return false;

  gamesSinceAd += 1;

  const enoughGames = gamesSinceAd >= GAMES_BETWEEN_ADS;
  const enoughTime = Date.now() - lastShownAt >= MIN_INTERVAL_MS;

  if (!enoughGames || !enoughTime) {
    // Make sure one is warming up for when we do qualify.
    preload();
    return false;
  }

  if (!ad || !loaded) {
    preload();
    return false;
  }

  try {
    ad.show();
    gamesSinceAd = 0;
    lastShownAt = Date.now();
    return true;
  } catch (e) {
    teardown();
    preload();
    return false;
  }
}
