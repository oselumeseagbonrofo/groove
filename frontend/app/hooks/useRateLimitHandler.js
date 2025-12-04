'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * useRateLimitHandler hook - handles 429 responses and queues requests
 * Requirements: 7.5
 * 
 * @returns {Object} Rate limit handling utilities
 */
export function useRateLimitHandler() {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [queuedRequests, setQueuedRequests] = useState(0);
  const requestQueue = useRef([]);
  const processingQueue = useRef(false);

  /**
   * Process queued requests after rate limit expires
   */
  const processQueue = useCallback(async () => {
    if (processingQueue.current || requestQueue.current.length === 0) {
      return;
    }

    processingQueue.current = true;
    setIsRateLimited(false);
    setRetryAfter(0);

    while (requestQueue.current.length > 0) {
      const { request, resolve, reject } = requestQueue.current.shift();
      setQueuedRequests(requestQueue.current.length);

      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        // If we hit rate limit again, re-queue remaining requests
        if (error.status === 429) {
          const retryTime = parseInt(error.retryAfter || '30', 10);
          setIsRateLimited(true);
          setRetryAfter(retryTime);
          
          // Wait and retry
          await new Promise(r => setTimeout(r, retryTime * 1000));
          continue;
        }
        reject(error);
      }
    }

    processingQueue.current = false;
  }, []);

  /**
   * Wrap a fetch request with rate limit handling
   * @param {Function} requestFn - Async function that makes the request
   * @returns {Promise} - Promise that resolves with the response
   */
  const withRateLimitHandling = useCallback(async (requestFn) => {
    try {
      const response = await requestFn();
      
      // Check if response is a 429
      if (response.status === 429) {
        const retryTime = parseInt(
          response.headers?.get('Retry-After') || '30',
          10
        );
        
        setIsRateLimited(true);
        setRetryAfter(retryTime);

        // Queue the request for retry
        return new Promise((resolve, reject) => {
          requestQueue.current.push({ request: requestFn, resolve, reject });
          setQueuedRequests(requestQueue.current.length);

          // Start processing queue after retry delay
          setTimeout(processQueue, retryTime * 1000);
        });
      }

      return response;
    } catch (error) {
      // Handle network errors that might indicate rate limiting
      if (error.message?.includes('429') || error.status === 429) {
        const retryTime = error.retryAfter || 30;
        setIsRateLimited(true);
        setRetryAfter(retryTime);

        return new Promise((resolve, reject) => {
          requestQueue.current.push({ request: requestFn, resolve, reject });
          setQueuedRequests(requestQueue.current.length);
          setTimeout(processQueue, retryTime * 1000);
        });
      }

      throw error;
    }
  }, [processQueue]);

  /**
   * Clear the request queue
   */
  const clearQueue = useCallback(() => {
    requestQueue.current.forEach(({ reject }) => {
      reject(new Error('Request cancelled'));
    });
    requestQueue.current = [];
    setQueuedRequests(0);
    setIsRateLimited(false);
    setRetryAfter(0);
  }, []);

  return {
    isRateLimited,
    retryAfter,
    queuedRequests,
    withRateLimitHandling,
    clearQueue
  };
}

export default useRateLimitHandler;
