'use client';

import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * useAuth - Authentication hook for Spotify and Apple Music
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7
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
   * Initiate Apple Music OAuth flow
   * Requirements: 1.4
   */
  const connectAppleMusic = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/apple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to initiate Apple Music authentication');
      }

      const { developerToken, state } = await response.json();
      
      // Store state for callback validation
      sessionStorage.setItem('apple_auth_state', state);
      
      // Initialize MusicKit JS (Apple's client-side auth library)
      // This requires the MusicKit JS script to be loaded
      if (typeof window !== 'undefined' && window.MusicKit) {
        await window.MusicKit.configure({
          developerToken,
          app: {
            name: 'Groove',
            build: '1.0.0',
          },
        });
        
        const music = window.MusicKit.getInstance();
        const musicUserToken = await music.authorize();
        
        // Send the token to our backend
        const callbackResponse = await fetch(`${API_BASE_URL}/auth/apple/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            musicUserToken,
            state,
          }),
        });

        if (!callbackResponse.ok) {
          const errorData = await callbackResponse.json();
          throw new Error(errorData.error?.message || 'Apple Music authentication failed');
        }

        const { userId, provider } = await callbackResponse.json();
        
        // Store user info and redirect
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('provider', provider);
        window.location.href = `/now-playing?userId=${userId}&provider=${provider}`;
      } else {
        // MusicKit not available - show error or fallback
        throw new Error('Apple Music is not available. Please ensure MusicKit JS is loaded.');
      }
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
      sessionStorage.removeItem('apple_auth_state');
      
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
    connectAppleMusic,
    logout,
    checkAuthStatus,
    refreshToken,
    clearError: () => setError(null),
  };
}
