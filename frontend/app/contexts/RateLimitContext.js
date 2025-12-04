'use client';

import { createContext, useContext } from 'react';
import { useRateLimitHandler } from '../hooks/useRateLimitHandler';
import RateLimitNotification from '../components/RateLimitNotification';

/**
 * RateLimitContext - provides rate limit handling throughout the app
 * Requirements: 7.5
 */
const RateLimitContext = createContext(null);

/**
 * useRateLimit hook - access rate limit context
 * @returns {Object} Rate limit utilities from context
 */
export function useRateLimit() {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
}

/**
 * RateLimitProvider component - wraps app with rate limit handling
 * Requirements: 7.5
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function RateLimitProvider({ children }) {
  const {
    isRateLimited,
    retryAfter,
    queuedRequests,
    withRateLimitHandling,
    clearQueue
  } = useRateLimitHandler();

  return (
    <RateLimitContext.Provider
      value={{
        isRateLimited,
        retryAfter,
        queuedRequests,
        withRateLimitHandling,
        clearQueue
      }}
    >
      {children}
      <RateLimitNotification
        isRateLimited={isRateLimited}
        retryAfter={retryAfter}
        queuedRequests={queuedRequests}
        onCancel={clearQueue}
      />
    </RateLimitContext.Provider>
  );
}

export default RateLimitProvider;
