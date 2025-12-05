'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useSpotifyPlayer - Spotify Web Playback SDK integration
 * Creates a browser-based Spotify player device
 * Eliminates need for external Spotify app
 * Requirements: Web Playback SDK integration
 */
export function useSpotifyPlayer(accessToken) {
    const [deviceId, setDeviceId] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState(null);
    const [player, setPlayer] = useState(null);
    const [isPremium, setIsPremium] = useState(true);

    const playerRef = useRef(null);

    /**
     * Initialize Spotify Web Playback SDK
     */
    useEffect(() => {
        if (!accessToken) {
            return;
        }

        // Check if SDK is already loaded
        if (window.Spotify) {
            initializePlayer();
            return;
        }

        // Load Spotify SDK script
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        document.body.appendChild(script);

        // SDK calls this when ready
        window.onSpotifyWebPlaybackSDKReady = () => {
            initializePlayer();
        };

        return () => {
            if (playerRef.current) {
                playerRef.current.disconnect();
            }
        };
    }, [accessToken]);

    /**
     * Initialize the Spotify Player
     */
    const initializePlayer = useCallback(() => {
        if (!window.Spotify || !accessToken) {
            return;
        }

        const spotifyPlayer = new window.Spotify.Player({
            name: 'Groove Web Player',
            getOAuthToken: (cb) => {
                cb(accessToken);
            },
            volume: 0.8
        });

        // Error handling
        spotifyPlayer.addListener('initialization_error', ({ message }) => {
            console.error('Initialization error:', message);
            setError('Failed to initialize player');
        });

        spotifyPlayer.addListener('authentication_error', ({ message }) => {
            console.error('Authentication error:', message);
            setError('Authentication failed. Please log in again.');
            setIsPremium(false);
        });

        spotifyPlayer.addListener('account_error', ({ message }) => {
            console.error('Account error:', message);
            setError('Spotify Premium required for web playback');
            setIsPremium(false);
        });

        spotifyPlayer.addListener('playback_error', ({ message }) => {
            console.error('Playback error:', message);
            setError('Playback error occurred');
        });

        // Ready
        spotifyPlayer.addListener('ready', ({ device_id }) => {
            console.log('Spotify player ready with device ID:', device_id);
            setDeviceId(device_id);
            setIsReady(true);
            setError(null);
        });

        // Not Ready
        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
            console.log('Device has gone offline:', device_id);
            setIsReady(false);
        });

        // Player state changes
        spotifyPlayer.addListener('player_state_changed', (state) => {
            if (!state) {
                return;
            }
            // You can use this to sync playback state if needed
            console.log('Player state changed:', state);
        });

        // Connect to the player
        spotifyPlayer.connect().then((success) => {
            if (success) {
                console.log('Successfully connected to Spotify player');
            } else {
                console.error('Failed to connect to Spotify player');
                setError('Failed to connect to player');
            }
        });

        playerRef.current = spotifyPlayer;
        setPlayer(spotifyPlayer);
    }, [accessToken]);

    /**
     * Transfer playback to this device
     */
    const transferPlayback = useCallback(async () => {
        if (!deviceId || !accessToken) {
            return false;
        }

        try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: false
                })
            });

            if (response.ok || response.status === 204) {
                console.log('Playback transferred to web player');
                return true;
            } else {
                console.error('Failed to transfer playback:', response.status);
                return false;
            }
        } catch (err) {
            console.error('Transfer playback error:', err);
            return false;
        }
    }, [deviceId, accessToken]);

    /**
     * Get current player state
     */
    const getCurrentState = useCallback(async () => {
        if (!playerRef.current) {
            return null;
        }

        try {
            const state = await playerRef.current.getCurrentState();
            return state;
        } catch (err) {
            console.error('Get current state error:', err);
            return null;
        }
    }, []);

    /**
     * Toggle play/pause
     */
    const togglePlay = useCallback(async () => {
        if (!playerRef.current) {
            return;
        }

        try {
            await playerRef.current.togglePlay();
        } catch (err) {
            console.error('Toggle play error:', err);
        }
    }, []);

    /**
     * Set volume (0-1)
     */
    const setVolume = useCallback(async (volume) => {
        if (!playerRef.current) {
            return;
        }

        try {
            await playerRef.current.setVolume(volume);
        } catch (err) {
            console.error('Set volume error:', err);
        }
    }, []);

    return {
        deviceId,
        isReady,
        error,
        player,
        isPremium,
        transferPlayback,
        getCurrentState,
        togglePlay,
        setVolume
    };
}
