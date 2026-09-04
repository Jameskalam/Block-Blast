import { Linking } from 'react-native';

// Android application id (must match app.json > expo.android.package). This is
// what the Play Store uses to identify your app.
export const ANDROID_PACKAGE = 'com.blockmint.game';

// Deep link that opens the app's Play Store page directly in the Play Store app
// (falls back to the web listing if the store app isn't available).
export const PLAY_STORE_URI = `market://details?id=${ANDROID_PACKAGE}`;
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/**
 * Open the Play Store listing so the user can rate/review the app.
 * Tries the native Play Store deep link first, then the web URL.
 */
export async function openRateUs() {
  try {
    const supported = await Linking.canOpenURL(PLAY_STORE_URI);
    await Linking.openURL(supported ? PLAY_STORE_URI : PLAY_STORE_URL);
  } catch (e) {
    try {
      await Linking.openURL(PLAY_STORE_URL);
    } catch (_) {
      // Nothing else we can do if the OS can't open any URL.
    }
  }
}
