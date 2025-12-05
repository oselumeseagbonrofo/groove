'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * useSwipeGesture - Custom hook for detecting horizontal swipe gestures
 * Requirements: 8.5 - Touch gesture support for navigation
 * 
 * @param {Object} options
 * @param {Function} options.onSwipeLeft - Callback when user swipes left
 * @param {Function} options.onSwipeRight - Callback when user swipes right
 * @param {number} options.threshold - Minimum distance in pixels to trigger swipe (default: 50)
 * @param {number} options.maxVerticalMovement - Maximum vertical movement allowed (default: 100)
 * @returns {Object} Touch event handlers to spread on the target element
 */
export default function useSwipeGesture({
  onSwipeLeft = () => {},
  onSwipeRight = () => {},
  threshold = 50,
  maxVerticalMovement = 100
} = {}) {
  const touchStartRef = useRef({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isSwiping) return;
    
    // Allow default behavior for vertical scrolling
    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    
    // If vertical movement is greater than horizontal, allow scrolling
    if (deltaY > deltaX) {
      setIsSwiping(false);
    }
  }, [isSwiping]);

  const handleTouchEnd = useCallback((e) => {
    if (!isSwiping) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    setIsSwiping(false);

    // Only trigger swipe if horizontal movement exceeds threshold
    // and vertical movement is within acceptable range
    if (Math.abs(deltaX) >= threshold && deltaY <= maxVerticalMovement) {
      if (deltaX < 0) {
        // Swipe left - skip forward to next track
        onSwipeLeft();
      } else {
        // Swipe right - skip backward to previous track
        onSwipeRight();
      }
    }
  }, [isSwiping, threshold, maxVerticalMovement, onSwipeLeft, onSwipeRight]);

  const handleTouchCancel = useCallback(() => {
    setIsSwiping(false);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    isSwiping
  };
}
