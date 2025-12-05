'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * useAccessToken - Manages Spotify access token for client-side use
 * Fetches token from backend and refreshes before expiration
 * Required for Spotify Web Playback SDK
 */
export function useAccessToken(userId) {
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshTimeoutRef = useRef(null);

    /**
     * Fetch access token from backend
     */
    const fetchToken = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to fetch access token');
            }

            const data = await response.json();
            setAccessToken(data.accessToken);
            setError(null);

            // Schedule refresh before token expires
            // Refresh 5 minutes before expiration
            const expiresAt = new Date(data.expiresAt);
            const refreshTime = expiresAt.getTime() - Date.now() - (5 * 60 * 1000);

            if (refreshTime > 0) {
                refreshTimeoutRef.current = setTimeout(() => {
                    fetchToken();
                }, refreshTime);
            }

        } catch (err) {
            console.error('Fetch token error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    /**
     * Initial fetch on mount
     */
    useEffect(() => {
        fetchToken();

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [fetchToken]);

    /**
     * Manual refresh
     */
    const refresh = useCallback(() => {
        setLoading(true);
        return fetchToken();
    }, [fetchToken]);

    return {
        accessToken,
        loading,
        error,
        refresh
    };
}
