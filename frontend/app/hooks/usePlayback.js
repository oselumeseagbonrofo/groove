'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * usePlayback - Playback state management hook
 * Manages playback state (isPlaying, currentTrack, progress)
 * Handles real-time progress updates
 * Syncs with Spotify playback state
 * Requirements: 5.3
 */
export function usePlayback(userId) {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [position, setPosition] = useState(0); // Current position in ms
  const [duration, setDuration] = useState(0); // Track duration in ms
  const [playlistId, setPlaylistId] = useState(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [device, setDevice] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for progress tracking
  const progressIntervalRef = useRef(null);
  const lastSyncTimeRef = useRef(Date.now());

  /**
   * Calculate progress percentage (0-100)
   */
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  /**
   * Current time in seconds (for PlaybackControls)
   */
  const currentTime = position / 1000;

  /**
   * Fetch current playback state from API
   */
  const fetchPlaybackState = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/playback/state?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch playback state');
      }

      const state = await response.json();

      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.currentTrack);
      setPosition(state.position);
      setDuration(state.duration);
      setPlaylistId(state.playlistId);
      setTrackIndex(state.trackIndex);
      setDevice(state.device || null);
      lastSyncTimeRef.current = Date.now();

      return state;
    } catch (err) {
      console.error('Fetch playback state error:', err);
      setError(err.message);
      return null;
    }
  }, [userId]);


  /**
   * Start or resume playback
   * Requirements: 3.2
   */
  const play = useCallback(async (options = {}) => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/playback/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          playlistId: options.playlistId,
          trackUri: options.trackUri,
          deviceId: device?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to start playback');
      }

      const result = await response.json();
      
      // Handle client-side playback
      if (result.clientSide) {
        return result;
      }

      setIsPlaying(true);
      
      // Refresh state after a short delay to get updated track info
      setTimeout(() => fetchPlaybackState(), 500);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, device, fetchPlaybackState]);

  /**
   * Pause playback
   * Requirements: 3.3
   */
  const pause = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/playback/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          deviceId: device?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to pause playback');
      }

      const result = await response.json();
      
      if (!result.clientSide) {
        setIsPlaying(false);
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, device]);

  /**
   * Seek to position in current track
   * Requirements: 3.4
   * 
   * Property 5: Seek Position Mapping
   * For any drag/scrub position on the vinyl record (0-100%),
   * the seek position SHALL map proportionally to the current track's duration
   */
  const seek = useCallback(async (positionPercent) => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    // Calculate position in milliseconds from percentage
    const positionMs = Math.floor((positionPercent / 100) * duration);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/playback/seek`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          positionMs,
          deviceId: device?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to seek');
      }

      const result = await response.json();
      
      if (!result.clientSide) {
        setPosition(positionMs);
        lastSyncTimeRef.current = Date.now();
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, device, duration]);


  /**
   * Skip to next track
   * Requirements: 3.5
   * 
   * Property 6: Skip Forward Track Advancement
   * For any playlist with multiple tracks, tapping skip forward SHALL
   * increment the current track index by 1, wrapping to 0 when at the last track
   */
  const skipForward = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/playback/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          direction: 'forward',
          deviceId: device?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to skip forward');
      }

      const result = await response.json();
      
      // Refresh state to get new track info
      setTimeout(() => fetchPlaybackState(), 500);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, device, fetchPlaybackState]);

  /**
   * Skip to previous track or restart current track
   * Requirements: 3.6
   * 
   * Property 7: Skip Backward Behavior
   * For any playback state, tapping skip backward SHALL:
   * (a) restart the current track if elapsed time > 3 seconds, or
   * (b) go to the previous track if elapsed time <= 3 seconds
   * 
   * @param {boolean} shouldRestart - If true, restart current track; if false, go to previous
   */
  const skipBackward = useCallback(async (shouldRestart = false) => {
    if (!userId) {
      setError('User not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // If shouldRestart is true, seek to beginning instead of skipping
      if (shouldRestart) {
        const response = await fetch(`${API_BASE_URL}/playback/seek`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            positionMs: 0,
            deviceId: device?.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to restart track');
        }

        const result = await response.json();
        
        if (!result.clientSide) {
          setPosition(0);
          lastSyncTimeRef.current = Date.now();
        }
        
        return result;
      }

      // Otherwise, skip to previous track
      const response = await fetch(`${API_BASE_URL}/playback/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          direction: 'backward',
          deviceId: device?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to skip backward');
      }

      const result = await response.json();
      
      // Refresh state to get new track info
      setTimeout(() => fetchPlaybackState(), 500);
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, device, fetchPlaybackState]);


  /**
   * Real-time progress update effect
   * Updates position locally while playing to provide smooth progress
   * Syncs with server periodically to stay accurate
   * Requirements: 5.3
   */
  useEffect(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (isPlaying && duration > 0) {
      // Update progress every 100ms for smooth animation
      progressIntervalRef.current = setInterval(() => {
        setPosition((prevPosition) => {
          const elapsed = Date.now() - lastSyncTimeRef.current;
          const newPosition = prevPosition + 100;
          
          // Don't exceed duration
          if (newPosition >= duration) {
            return duration;
          }
          
          return newPosition;
        });
      }, 100);

      // Sync with server every 5 seconds
      const syncInterval = setInterval(() => {
        fetchPlaybackState();
      }, 5000);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        clearInterval(syncInterval);
      };
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying, duration, fetchPlaybackState]);

  /**
   * Initial state fetch on mount
   */
  useEffect(() => {
    if (userId) {
      fetchPlaybackState();
    }
  }, [userId, fetchPlaybackState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  /**
   * Load a specific playlist
   */
  const loadPlaylist = useCallback(async (newPlaylistId) => {
    setPlaylistId(newPlaylistId);
    return play({ playlistId: newPlaylistId });
  }, [play]);

  return {
    // State
    isPlaying,
    currentTrack,
    position,
    duration,
    progress,
    currentTime,
    playlistId,
    trackIndex,
    device,
    loading,
    error,
    
    // Actions
    play,
    pause,
    seek,
    skipForward,
    skipBackward,
    loadPlaylist,
    fetchPlaybackState,
    
    // Utilities
    clearError: () => setError(null),
  };
}
