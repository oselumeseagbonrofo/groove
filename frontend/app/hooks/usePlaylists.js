'use client';

import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * usePlaylists - Hook for fetching and managing playlists
 * Requirements: 2.1, 2.4
 */
export function usePlaylists(userId) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  /**
   * Fetch user playlists from API
   */
  const fetchPlaylists = useCallback(async (limit = 20, offset = 0) => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/playlists?userId=${userId}&limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch playlists');
      }

      const data = await response.json();
      console.log(data)
      
      setPlaylists(data.playlists);
      setPagination(data.pagination);
      
      return data.playlists;
    } catch (err) {
      console.error('Fetch playlists error:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetch a specific playlist with tracks
   */
  const fetchPlaylist = useCallback(async (playlistId) => {
    if (!userId || !playlistId) {
      setError('User ID and Playlist ID are required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, we'll use the Spotify Web API directly through the backend
      // This would need a new endpoint in backend/routes/playlists.js
      const response = await fetch(
        `${API_BASE_URL}/playlists/${playlistId}?userId=${userId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch playlist');
      }

      const playlist = await response.json();
      return playlist;
    } catch (err) {
      console.error('Fetch playlist error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    playlists,
    loading,
    error,
    pagination,
    fetchPlaylists,
    fetchPlaylist,
    clearError: () => setError(null)
  };
}
