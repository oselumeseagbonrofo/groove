'use client';

import { RateLimitProvider } from '../contexts/RateLimitContext';
import OfflineNotification from './OfflineNotification';

/**
 * Providers component - wraps app with all client-side providers
 * Requirements: 7.2, 7.5
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export default function Providers({ children }) {
  return (
    <RateLimitProvider>
      <OfflineNotification />
      {children}
    </RateLimitProvider>
  );
}
