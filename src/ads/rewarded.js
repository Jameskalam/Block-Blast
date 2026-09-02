import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import { SHOW_ADS, AD_UNITS, AD_REQUEST_OPTIONS } from './adConfig';

// -----------------------------------------------------------------------------
// One-shot rewarded ad.
//
// Resolves true ONLY if the SDK reported EARNED_REWARD -- closing the ad early
// resolves false, so the reward can't be farmed by dismissing instantly.
//
// If no ad is available (no fill, offline, ads disabled) it resolves true. That
// is deliberate: the player asked for a reward and did nothing wrong, so an ad
// supply problem shouldn't punish them. Being stingy here is what makes players
// uninstall.
// -----------------------------------------------------------------------------
export function showRewarded() {
  return new Promise((resolve) => {
    if (!SHOW_ADS) {
      resolve(true);
      return;
    }

    let settled = false;
    let earned = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    let unsubs = [];
    const cleanup = () => {
      unsubs.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          /* ignore */
        }
      });
      unsubs = [];
      clearTimeout(timer);
    };

    let ad;
    try {
      ad = RewardedAd.createForAdRequest(AD_UNITS.rewarded, AD_REQUEST_OPTIONS);
    } catch (e) {
      resolve(true);
      return;
    }

    unsubs.push(
      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        try {
          ad.show();
        } catch (e) {
          done(true);
        }
      })
    );
    unsubs.push(
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      })
    );
    unsubs.push(ad.addAdEventListener(AdEventType.CLOSED, () => done(earned)));
    unsubs.push(ad.addAdEventListener(AdEventType.ERROR, () => done(true)));

    // Don't leave the player staring at a frozen button if the network stalls.
    const timer = setTimeout(() => done(true), 12000);

    try {
      ad.load();
    } catch (e) {
      done(true);
    }
  });
}
