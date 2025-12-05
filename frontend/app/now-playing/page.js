'use client';

import { useState, useCallback } from 'react';
import { 
  Header, 
  NavigationMenu, 
  VinylTurntable, 
  PlaybackControls, 
  TrackQueue, 
  TrackInfo 
} from '../components';
import useSwipeGesture from '../hooks/useSwipeGesture';

/**
 * Now Playing Page - Main playback interface with vinyl turntable
 * Requirements: 3.1, 6.4, 9.2, 10.1
 */
export default function NowPlayingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Playback state - will be connected to usePlayback hook in Task 8
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // Mock playlist data - will be replaced with real data from API
  const [playlist] = useState({
    id: 'demo-playlist',
    name: 'Demo Playlist',
    coverImage: null,
    tracks: [
      { id: '1', name: 'Track One', artist: 'Artist A', duration: 210000 },
      { id: '2', name: 'Track Two', artist: 'Artist B', duration: 185000 },
      { id: '3', name: 'Track Three', artist: 'Artist C', duration: 240000 },
      { id: '4', name: 'Track Four', artist: 'Artist D', duration: 195000 },
      { id: '5', name: 'Track Five', artist: 'Artist E', duration: 220000 },
      { id: '6', name: 'Track Six', artist: 'Artist F', duration: 175000 },
    ]
  });

  const currentTrack = playlist.tracks[currentTrackIndex] || null;
  const duration = currentTrack?.duration || 0;

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (screen) => {
    console.log('Navigating to:', screen);
  };

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  /**
   * Property 6: Skip Forward Track Advancement
   * For any playlist with multiple tracks, tapping skip forward SHALL
   * increment the current track index by 1, wrapping to 0 when at the last track.
   */
  const handleSkipForward = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      const nextIndex = prev + 1;
      return nextIndex >= playlist.tracks.length ? 0 : nextIndex;
    });
    setProgress(0);
    setCurrentTime(0);
  }, [playlist.tracks.length]);

  /**
   * Property 7: Skip Backward Behavior
   * For any playback state, tapping skip backward SHALL:
   * (a) restart the current track if elapsed time > 3 seconds, or
   * (b) go to the previous track if elapsed time <= 3 seconds
   */
  const handleSkipBackward = useCallback((shouldRestart) => {
    if (shouldRestart) {
      // Restart current track
      setProgress(0);
      setCurrentTime(0);
    } else {
      // Go to previous track
      setCurrentTrackIndex((prev) => {
        const prevIndex = prev - 1;
        return prevIndex < 0 ? playlist.tracks.length - 1 : prevIndex;
      });
      setProgress(0);
      setCurrentTime(0);
    }
  }, [playlist.tracks.length]);

  /**
   * Property 5: Seek Position Mapping
   * For any drag/scrub position on the vinyl record (0-100%),
   * the seek position SHALL map proportionally to the current track's duration.
   */
  const handleSeek = useCallback((seekPercentage) => {
    setProgress(seekPercentage);
    const seekTime = Math.floor((seekPercentage / 100) * duration);
    setCurrentTime(seekTime);
    // Will call playback API in Task 8
  }, [duration]);

  const handleTrackSelect = useCallback((index) => {
    setCurrentTrackIndex(index);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const handleViewAll = useCallback(() => {
    // Will navigate to full playlist view
    console.log('View all tracks');
  }, []);

  /**
   * Touch Gesture Support - Requirements: 8.5
   * Swipe left to skip forward, swipe right to skip backward
   */
  const handleSwipeLeft = useCallback(() => {
    // Swipe left = skip forward to next track
    handleSkipForward();
  }, [handleSkipForward]);

  const handleSwipeRight = useCallback(() => {
    // Swipe right = skip backward (always go to previous track on swipe)
    // Using false to go to previous track rather than restart
    handleSkipBackward(false);
  }, [handleSkipBackward]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    maxVerticalMovement: 100
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-dark via-pink-medium to-lavender">
      {/* Header with dark styling for Now Playing */}
      <Header 
        title="NOW PLAYING" 
        onMenuToggle={handleMenuToggle}
        isDark={true}
      />

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        currentScreen="now-playing"
        onNavigate={handleNavigate}
        onClose={handleMenuClose}
      />

      {/* Main Content Area - Responsive layout: stacked on mobile, side-by-side on desktop */}
      {/* Swipe gesture handlers applied for track navigation (Requirements: 8.5) */}
      <main 
        className="pt-14 sm:pt-16 px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8 safe-area-bottom max-w-7xl mx-auto swipe-container"
        {...swipeHandlers}
      >
        {/* Desktop: Two-column layout */}
        <div className="lg:flex lg:gap-8 lg:items-start lg:pt-4">
          {/* Left Column: Turntable and Controls */}
          <div className="lg:flex-1 lg:max-w-xl">
            {/* Vinyl Turntable - Centered with responsive sizing */}
            <div className="flex justify-center py-2 sm:py-4">
              <VinylTurntable
                playlist={playlist}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                progress={progress}
                onSeek={handleSeek}
              />
            </div>

            {/* Track Info */}
            <TrackInfo
              track={currentTrack}
              progress={progress}
              currentTime={currentTime}
              duration={duration}
            />

            {/* Playback Controls - Touch-friendly spacing */}
            <div className="py-3 sm:py-4">
              <PlaybackControls
                isPlaying={isPlaying}
                currentTime={currentTime / 1000} // Convert to seconds for 3-second threshold
                onPlay={handlePlay}
                onPause={handlePause}
                onSkipForward={handleSkipForward}
                onSkipBackward={handleSkipBackward}
              />
            </div>
          </div>

          {/* Right Column: Track Queue (visible on desktop) */}
          <div className="mt-3 sm:mt-4 lg:mt-0 lg:w-80 xl:w-96 lg:sticky lg:top-20">
            <TrackQueue
              tracks={playlist.tracks}
              currentIndex={currentTrackIndex}
              onTrackSelect={handleTrackSelect}
              onViewAll={handleViewAll}
              maxVisible={8}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
