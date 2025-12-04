'use client';

import { useEffect, useState } from 'react';

/**
 * RateLimitNotification component - displays notification when rate limited
 * Requirements: 7.5
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isRateLimited - Whether currently rate limited
 * @param {number} props.retryAfter - Seconds until retry
 * @param {number} props.queuedRequests - Number of queued requests
 * @param {Function} props.onCancel - Callback to cancel queued requests
 */
export default function RateLimitNotification({
  isRateLimited,
  retryAfter,
  queuedRequests,
  onCancel
}) {
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    setCountdown(retryAfter);
  }, [retryAfter]);

  useEffect(() => {
    if (!isRateLimited || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRateLimited, countdown]);

  if (!isRateLimited) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-amber-500 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Too many requests</h3>
            <p className="text-sm text-amber-100 mt-1">
              {countdown > 0
                ? `Retrying in ${countdown} seconds...`
                : 'Retrying now...'}
            </p>
            {queuedRequests > 0 && (
              <p className="text-xs text-amber-200 mt-1">
                {queuedRequests} request{queuedRequests > 1 ? 's' : ''} queued
              </p>
            )}
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-shrink-0 text-amber-200 hover:text-white transition-colors"
              aria-label="Cancel queued requests"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-amber-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{
              width: retryAfter > 0 ? `${(countdown / retryAfter) * 100}%` : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
}
