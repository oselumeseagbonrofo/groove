'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useNetworkStatus hook - detects network connectivity changes
 * Requirements: 7.2
 * 
 * Only tracks actual browser online/offline events (user's internet connection),
 * not backend API availability.
 * 
 * @returns {Object} Network status information
 * @returns {boolean} isOnline - Whether the browser is online
 * @returns {boolean} wasOffline - Whether the connection was recently restored
 * @returns {Function} checkConnection - Manual connection check function
 */
export function useNetworkStatus() {
  // Only track browser's navigator.onLine status
  // This reflects actual internet connectivity, not backend availability
  const [isOnline, setIsOnline] = useState(true);
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

  // Manual connection check by pinging the backend health endpoint
  const checkConnection = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const baseUrl = apiUrl.replace('/api', ''); // Remove /api suffix to get base URL
      const response = await fetch(`${baseUrl}/health`, {
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
