'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

/**
 * VinylTurntable - Main playback visualization component
 * Renders vinyl record on turntable base with spinning animation
 * Requirements: 3.1, 5.4, 9.5
 * 
 * @param {Object} props
 * @param {Object} props.playlist - Current playlist object
 * @param {Object} props.currentTrack - Currently playing track
 * @param {boolean} props.isPlaying - Whether playback is active
 * @param {number} props.progress - Playback progress (0-100)
 * @param {Function} props.onSeek - Callback when user seeks to position
 */
export default function VinylTurntable({
  playlist = null,
  currentTrack = null,
  isPlaying = false,
  progress = 0,
  onSeek = () => { }
}) {
  const [isDragging, setIsDragging] = useState(false);
  const vinylRef = useRef(null);

  /**
   * Calculate seek position from drag/click position on vinyl
   * Maps position percentage (0-100) to track duration
   * Property 5: Seek Position Mapping
   */
  const calculateSeekPosition = useCallback((clientX, clientY) => {
    if (!vinylRef.current) return null;

    const rect = vinylRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate angle from center
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Calculate distance from center (normalized 0-1)
    const maxRadius = rect.width / 2;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normalizedDistance = Math.min(distance / maxRadius, 1);

    // Only allow seeking on the outer portion of the vinyl (grooves area)
    // Inner 30% is the label, outer 70% is seekable
    if (normalizedDistance < 0.3) return null;

    // Map the seekable area (0.3-1.0) to progress (0-100)
    const seekableRange = normalizedDistance - 0.3;
    const seekPercentage = Math.min(100, Math.max(0, (seekableRange / 0.7) * 100));

    return seekPercentage;
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const seekPosition = calculateSeekPosition(e.clientX, e.clientY);
    if (seekPosition !== null) {
      onSeek(seekPosition);
    }
  }, [calculateSeekPosition, onSeek]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const seekPosition = calculateSeekPosition(e.clientX, e.clientY);
    if (seekPosition !== null) {
      onSeek(seekPosition);
    }
  }, [isDragging, calculateSeekPosition, onSeek]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    // Stop propagation to prevent swipe gesture handlers from triggering
    // when user is interacting with the vinyl for seeking
    e.stopPropagation();
    setIsDragging(true);

    const touch = e.touches[0];
    const seekPosition = calculateSeekPosition(touch.clientX, touch.clientY);
    if (seekPosition !== null) {
      onSeek(seekPosition);
    }
  }, [calculateSeekPosition, onSeek]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const seekPosition = calculateSeekPosition(touch.clientX, touch.clientY);
    if (seekPosition !== null) {
      onSeek(seekPosition);
    }
  }, [isDragging, calculateSeekPosition, onSeek]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Get cover image from playlist or use default
  const coverImage = playlist?.coverImage || currentTrack?.albumArt || null;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Turntable Base - Responsive sizing for mobile/tablet/desktop */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
        {/* Turntable Platform */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl" />

        {/* Vinyl Record */}
        <div
          ref={vinylRef}
          className={`absolute inset-4 rounded-full bg-black shadow-xl cursor-pointer select-none ${isPlaying ? 'animate-spin-vinyl' : ''
            }`}
          style={{
            animationPlayState: isPlaying ? 'running' : 'paused'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Vinyl Grooves */}
          <div className="absolute inset-2 rounded-full border border-gray-800" />
          <div className="absolute inset-4 rounded-full border border-gray-800" />
          <div className="absolute inset-6 rounded-full border border-gray-800" />
          <div className="absolute inset-8 rounded-full border border-gray-800" />
          <div className="absolute inset-10 rounded-full border border-gray-800" />
          <div className="absolute inset-12 rounded-full border border-gray-800" />
          <div className="absolute inset-14 rounded-full border border-gray-800" />

          {/* Progress Indicator Ring */}
          <div
            className="absolute inset-3 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, rgba(0, 188, 212, 0.3) ${progress}%, transparent ${progress}%)`
            }}
          />

          {/* Center Label - Shows playlist cover or default Groove logo */}
          <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-inner">
            {coverImage ? (
              <Image
                width={250}
                height={250}
                src={coverImage}
                alt={playlist?.name || 'Album cover'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-medium to-lavender flex items-center justify-center">
                <span className="text-white text-2xl md:text-3xl font-bold">G</span>
              </div>
            )}
          </div>

          {/* Center Spindle */}
          <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-gray-600 shadow-inner" />
        </div>

        {/* Tonearm */}
        <div className="absolute top-4 right-4 w-2 h-32 origin-top">
          <div
            className="w-full h-full bg-gradient-to-b from-gray-400 to-gray-600 rounded-full transform transition-transform duration-300"
            style={{
              transform: isPlaying ? 'rotate(25deg)' : 'rotate(0deg)'
            }}
          />
          {/* Tonearm Head */}
          <div
            className="absolute -bottom-1 -left-1 w-4 h-4 bg-gray-500 rounded transition-transform duration-300"
            style={{
              transform: isPlaying ? 'rotate(25deg)' : 'rotate(0deg)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
