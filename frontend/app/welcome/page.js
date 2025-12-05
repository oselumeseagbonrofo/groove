'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SplashScreen from '../components/SplashScreen';
import WelcomeScreen from '../components/WelcomeScreen';

/**
 * Welcome Page - Entry point with splash animation and authentication
 * Requirements: 1.1, 1.2, 9.1
 */
export default function WelcomePage() {
  return (
    <Suspense fallback={<WelcomeLoading />}>
      <WelcomeContent />
    </Suspense>
  );
}

/**
 * Loading fallback for Suspense boundary
 */
function WelcomeLoading() {
  return <SplashScreen onAnimationComplete={() => { }} duration={2500} />;
}

/**
 * Welcome Content - Contains the actual page logic with useSearchParams
 */
function WelcomeContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [authError, setAuthError] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for OAuth error in URL params
    const error = searchParams.get('error');
    if (error) {
      setAuthError(getErrorMessage(error));
      // Skip splash if there's an error
      setShowSplash(false);
    }
  }, [searchParams]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationComplete={handleSplashComplete} duration={2500} />;
  }

  return (
    <>
      <WelcomeScreen />
      {authError && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/90 rounded-lg shadow-lg z-50">
          <p className="text-white text-sm">{authError}</p>
          <button
            onClick={() => setAuthError(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full text-red-500 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Convert OAuth error codes to user-friendly messages
 */
function getErrorMessage(errorCode) {
  const errorMessages = {
    'access_denied': 'You denied access to your music account.',
    'invalid_state': 'Authentication session expired. Please try again.',
    'provider_mismatch': 'Authentication provider mismatch. Please try again.',
    'token_exchange_failed': 'Failed to complete authentication. Please try again.',
    'user_fetch_failed': 'Failed to retrieve your profile. Please try again.',
    'database_error': 'A server error occurred. Please try again later.',
    'user_creation_failed': 'Failed to create your account. Please try again.',
    'token_storage_failed': 'Failed to save your session. Please try again.',
    'callback_failed': 'Authentication failed. Please try again.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}
