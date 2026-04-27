import { useEffect, useRef } from 'react';
import { getCachedSettings } from './appSettings';

/**
 * Calls `callback` on a repeating interval based on the `refresh_interval`
 * setting (in seconds). The latest callback reference is always used so
 * the caller never needs to worry about stale closures.
 *
 * Pass 0 (or leave unset) in settings to disable auto-refresh.
 */
export function useAutoRefresh(callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const seconds = getCachedSettings().refresh_interval;
    if (!seconds || seconds <= 0) return;

    const id = setInterval(() => {
      callbackRef.current();
    }, seconds * 1000);

    return () => clearInterval(id);
  // Re-read interval if settings cache changes (e.g. after saving Settings page).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
