'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useNetworkStatus hook - detects network connectivity changes
 * Requirements: 7.2
 * 
 * @returns {Object} Network status information
 * @returns {boolean} isOnline - Whether the browser is online
 * @returns {boolean} wasOffline - Whether the connection was recently restored
 * @returns {Function} checkConnection - Manual connection check function
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setWasOffline(true);
    // Reset wasOffline after 3 seconds
    setTimeout(() => setWasOffline(false), 3000);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  // Manual connection check by pinging a known endpoint
  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store'
      });
      const online = response.ok;
      setIsOnline(online);
      return online;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline, checkConnection };
}

export default useNetworkStatus;
