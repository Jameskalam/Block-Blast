import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Tracks whether the device currently has a usable internet connection.
 * The game itself is fully offline; this is used only to decide whether ads
 * (which need network) should be shown.
 *
 * @returns {boolean} true when online, false when offline/unknown.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Initial read.
    NetInfo.fetch()
      .then((state) => {
        if (mounted) setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
      })
      .catch(() => {});

    // Live updates.
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected && state.isInternetReachable !== false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return isOnline;
}
