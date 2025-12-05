'use client';

import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * useAuth - Authentication hook for Spotify
 * Requirements: 1.3, 1.5, 1.6, 1.7
 */
export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initiate Spotify OAuth flow
   * Requirements: 1.3
   */
  const connectSpotify = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/spotify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to initiate Spotify authentication');
      }

      const { authUrl } = await response.json();
      
      // Redirect to Spotify authorization page
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Logout and clear authentication data
   * Requirements: 1.7
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = sessionStorage.getItem('userId');
      
      if (userId) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
      }
      
      // Clear local storage
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('provider');
      
      // Redirect to welcome screen
      window.location.href = '/welcome';
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check authentication status
   */
  const checkAuthStatus = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status/${userId}`);
      
      if (!response.ok) {
        return { authenticated: false };
      }
      
      return await response.json();
    } catch (err) {
      return { authenticated: false, error: err.message };
    }
  }, []);

  /**
   * Refresh access token
   * Requirements: 1.6
   */
  const refreshToken = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Token refresh failed');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    connectSpotify,
    logout,
    checkAuthStatus,
    refreshToken,
    clearError: () => setError(null),
  };
}
