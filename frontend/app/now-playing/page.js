'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Header,
  NavigationMenu,
  VinylTurntable,
  PlaybackControls,
  TrackQueue,
  TrackInfo,
  QuickGuide
} from '../components';
import useSwipeGesture from '../hooks/useSwipeGesture';
import { usePlayback } from '../hooks/usePlayback';
import { usePlaylists } from '../hooks/usePlaylists';
import { useAccessToken } from '../hooks/useAccessToken';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';

/**
 * Now Playing Page - Main playback interface with vinyl turntable
 * Requirements: 3.1, 6.4, 9.2, 10.1
 */
export default function NowPlayingPage() {
  return (
    <Suspense fallback={<NowPlayingLoading />}>
      <NowPlayingContent />
    </Suspense>
  );
}

/**
 * Loading fallback for Suspense boundary
 */
function NowPlayingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-dark via-pink-medium to-lavender flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin mb-4 mx-auto" />
        <p className="text-lg">Loading player...</p>
      </div>
    </div>
  );
}

/**
 * Now Playing Content - Contains the actual page logic with useSearchParams
 */
function NowPlayingContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const playlistIdParam = searchParams.get('playlistId');
  const [showQuickGuide, setShowQuickGuide] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Store userId in sessionStorage when received from OAuth callback
  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      sessionStorage.setItem('userId', userId);
      const provider = searchParams.get('provider');
      if (provider) {
        sessionStorage.setItem('provider', provider);
      }
    }
  }, [userId, searchParams]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playlist, setPlaylist] = useState(null);

  // Get access token for Spotify Web Player
  const { accessToken } = useAccessToken(userId);

  // Initialize Spotify Web Player
  const { deviceId, isReady, transferPlayback } = useSpotifyPlayer(accessToken);

  // Use real playback hook
  const {
    isPlaying,
    currentTrack,
    progress,
    currentTime,
    duration,
    play,
    pause,
    seek,
    skipForward,
    skipBackward,
    loadPlaylist,
    loading: playbackLoading,
    error: playbackError
  } = usePlayback(userId);

  // Use playlists hook to fetch playlist data
  const {
    playlists,
    fetchPlaylists,
    fetchPlaylist,
    loading: playlistLoading,
    error: playlistError
  } = usePlaylists(userId);

  // Load playlist data on mount
  useEffect(() => {
    async function loadPlaylistData() {
      if (!userId) return;

      // If playlistId is provided in URL, load that playlist directly
      if (playlistIdParam) {
        const playlistData = await fetchPlaylist(playlistIdParam);
        if (playlistData) {
          setPlaylist(playlistData);
          // Auto-play the first track if we have tracks
          if (playlistData.tracks && playlistData.tracks.length > 0) {
            await loadPlaylist(playlistIdParam);
          }
        }
        return;
      }

      // Otherwise, fetch all playlists and load the first one
      const allPlaylists = await fetchPlaylists();
      if (allPlaylists && allPlaylists.length > 0) {
        const firstPlaylistId = allPlaylists[0].id;
        const playlistData = await fetchPlaylist(firstPlaylistId);
        if (playlistData) {
          setPlaylist(playlistData);
          // Auto-play the first track if we have tracks
          if (playlistData.tracks && playlistData.tracks.length > 0) {
            await loadPlaylist(firstPlaylistId);
          }
        }
      }
    }

    loadPlaylistData();
  }, [userId, playlistIdParam, fetchPlaylists, fetchPlaylist, loadPlaylist]);

  // Show Quick Guide on first visit
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenQuickGuide');
    if (!hasSeenGuide) {
      setShowQuickGuide(true);
      setIsFirstVisit(true);
      localStorage.setItem('hasSeenQuickGuide', 'true');
    }
  }, []);

  // Fallback to empty playlist if none loaded
  const displayPlaylist = playlist || {
    id: null,
    name: 'No Playlist',
    tracks: []
  }

  const currentTrackIndex = displayPlaylist.tracks.findIndex(
    track => track.id === currentTrack?.id
  );

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (screen) => {
    console.log('Navigating to:', screen);
  };

  const handlePlay = useCallback(async () => {
    try {
      // Transfer playback to web player if ready
      if (isReady && deviceId) {
        await transferPlayback();
        await play({ deviceId });
      } else {
        await play();
      }
    } catch (error) {
      console.error('Play error:', error);
    }
  }, [play, isReady, deviceId, transferPlayback]);

  const handlePause = useCallback(async () => {
    try {
      await pause();
    } catch (error) {
      console.error('Pause error:', error);
    }
  }, [pause]);

  /**
   * Property 6: Skip Forward Track Advancement
   * For any playlist with multiple tracks, tapping skip forward SHALL
   * increment the current track index by 1, wrapping to 0 when at the last track.
   */
  const handleSkipForward = useCallback(async () => {
    try {
      await skipForward();
    } catch (error) {
      console.error('Skip forward error:', error);
    }
  }, [skipForward]);

  /**
   * Property 7: Skip Backward Behavior
   * For any playback state, tapping skip backward SHALL:
   * (a) restart the current track if elapsed time > 3 seconds, or
   * (b) go to the previous track if elapsed time <= 3 seconds
   */
  const handleSkipBackward = useCallback(async (shouldRestart) => {
    try {
      await skipBackward(shouldRestart);
    } catch (error) {
      console.error('Skip backward error:', error);
    }
  }, [skipBackward]);

  /**
   * Property 5: Seek Position Mapping
   * For any drag/scrub position on the vinyl record (0-100%),
   * the seek position SHALL map proportionally to the current track's duration.
   */
  const handleSeek = useCallback(async (seekPercentage) => {
    try {
      await seek(seekPercentage);
    } catch (error) {
      console.error('Seek error:', error);
    }
  }, [seek]);

  const handleTrackSelect = useCallback(async (index) => {
    const track = displayPlaylist.tracks[index];
    if (track) {
      try {
        if (isReady && deviceId) {
          await transferPlayback();
          await play({ trackUri: track.uri, deviceId });
        } else {
          await play({ trackUri: track.uri });
        }
      } catch (error) {
        console.error('Track select error:', error);
      }
    }
  }, [displayPlaylist.tracks, play, isReady, deviceId, transferPlayback]);

  const handleViewAll = useCallback(() => {
    // Will navigate to full playlist view
    console.log('View all tracks');
  }, []);

  /**
   * Touch Gesture Support - Requirements: 8.5
   * Swipe left to skip forward, swipe right to skip backward
   */
  const handleSwipeLeft = useCallback(() => {
    handleSkipForward();
  }, [handleSkipForward]);

  const handleSwipeRight = useCallback(() => {
    // Swipe right = skip backward (always go to previous track on swipe)
    handleSkipBackward(false);
  }, [handleSkipBackward]);

  // Load playlist if playlistId is provided
  useEffect(() => {
    if (playlistIdParam && userId) {
      loadPlaylist(playlistIdParam);
    }
  }, [playlistIdParam, userId, loadPlaylist]);

  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    maxVerticalMovement: 100
  });

  // Show loading state
  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-dark via-pink-medium to-lavender flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">Please log in to continue</p>
        </div>
      </div>
    );
  }
  const handleHelpClick = useCallback(() => {
    setShowQuickGuide(true);
    setIsFirstVisit(false); // Manual trigger, don't auto-close
  }, []);

  const handleCloseGuide = useCallback(() => {
    setShowQuickGuide(false);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to right, #FBFBFB, #D7D7D7)' }}>
      {/* Header with dark styling for Now Playing */}
      <Header
        title="NOW PLAYING"
        onMenuToggle={handleMenuToggle}
        isDark={true}
        onHelpClick={handleHelpClick}
      />

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        currentScreen="now-playing"
        onNavigate={handleNavigate}
        onClose={handleMenuClose}
      />

      {/* Error Display */}
      {(playbackError || playlistError) && (
        <div className="pt-14 px-4">
          <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{playbackError || playlistError}</p>
          </div>
        </div>
      )}

      {/* Main Content Area - Responsive layout: stacked on mobile, side-by-side on desktop */}
      {/* Swipe gesture handlers applied for track navigation (Requirements: 8.5) */}
      <main
        className="pt-14 sm:pt-16 px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8 safe-area-bottom max-w-7xl mx-auto"
        {...swipeHandlers}
      >
        {/* Desktop: Two-column layout */}
        <div className="lg:flex lg:gap-8 lg:items-start lg:pt-4">
          {/* Left Column: Turntable and Controls */}
          <div className="lg:flex-1 lg:max-w-xl">
            {/* Vinyl Turntable - Centered with responsive sizing */}
            <div className="flex justify-center py-2 sm:py-4">
              <VinylTurntable
                playlist={displayPlaylist}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                progress={progress}
                onSeek={handleSeek}
                onPlay={handlePlay}
                onPause={handlePause}
                onSkipForward={handleSkipForward}
                onSkipBackward={handleSkipBackward}
              />
            </div>

            {/* Track Info */}
            <TrackInfo
              track={currentTrack}
              progress={progress}
              currentTime={currentTime * 1000}
              duration={duration}
            />

            {/* Playback Controls - Touch-friendly spacing */}
            <div className="py-3 sm:py-4">
              <PlaybackControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                onPlay={handlePlay}
                onPause={handlePause}
                onSkipForward={handleSkipForward}
                onSkipBackward={handleSkipBackward}
              />
            </div>
          </div>

          {/* Right Column: Track Queue (visible on desktop) */}
          <div className="mt-3 sm:mt-4 lg:mt-0 lg:w-80 xl:w-96 lg:sticky lg:top-20 lg:mx-auto">
            <TrackQueue
              tracks={displayPlaylist.tracks}
              currentIndex={currentTrackIndex >= 0 ? currentTrackIndex : 0}
              onTrackSelect={handleTrackSelect}
              onViewAll={handleViewAll}
              maxVisible={8}
              playlistName={displayPlaylist.name !== 'No Playlist' ? displayPlaylist.name : null}
            />
          </div>
        </div>
      </main>
      {/* Quick Guide Overlay */}
      <QuickGuide isOpen={showQuickGuide} onClose={handleCloseGuide} autoClose={isFirstVisit} />
    </div >
  );
}
