import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Spotify API URLs
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Helper function to get user token and validate authentication
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: Object, error?: Object}>}
 */
async function getUserToken(userId) {
  if (!userId) {
    return {
      success: false,
      error: {
        message: 'User ID is required',
        code: 'MISSING_USER_ID',
        retryable: false
      },
      status: 400
    };
  }

  // Get user and their provider
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, provider')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return {
      success: false,
      error: {
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        retryable: false
      },
      status: 404
    };
  }

  // Get access token
  const { data: tokenData, error: tokenError } = await supabase
    .from('auth_tokens')
    .select('access_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (tokenError || !tokenData) {
    return {
      success: false,
      error: {
        message: 'No valid authentication token found',
        code: 'NO_TOKEN',
        retryable: false
      },
      status: 401
    };
  }

  // Check if token is expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return {
      success: false,
      error: {
        message: 'Authentication token expired',
        code: 'TOKEN_EXPIRED',
        retryable: false
      },
      status: 401
    };
  }

  return {
    success: true,
    data: {
      user,
      accessToken: tokenData.access_token
    }
  };
}

/**
 * Log error to Supabase error_logs table
 */
async function logError(userId, errorType, errorMessage, requestPath) {
  try {
    await supabase.from('error_logs').insert({
      user_id: userId || null,
      error_type: errorType,
      error_message: errorMessage,
      request_path: requestPath
    });
  } catch (logErr) {
    console.error('Failed to log error:', logErr);
  }
}


/**
 * POST /api/playback/play
 * Start or resume playback
 * Requirements: 3.2
 */
router.post('/play', async (req, res) => {
  const { userId, playlistId, trackUri, deviceId } = req.body;

  try {
    const authResult = await getUserToken(userId);
    if (!authResult.success) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const { user, accessToken } = authResult.data;

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const result = await spotifyPlay(accessToken, { playlistId, trackUri, deviceId });
    if (!result.success) {
      await logError(userId, 'PLAYBACK_PLAY_ERROR', result.error, req.path);
      return res.status(result.status || 500).json({
        error: {
          message: result.error,
          code: 'PLAYBACK_FAILED',
          retryable: true
        }
      });
    }
    return res.json({ success: true, message: 'Playback started' });
  } catch (error) {
    console.error('Play error:', error);
    await logError(userId, 'PLAYBACK_PLAY_ERROR', error.message, req.path);
    res.status(500).json({
      error: {
        message: 'Failed to start playback',
        code: 'PLAYBACK_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * POST /api/playback/pause
 * Pause playback
 * Requirements: 3.3
 */
router.post('/pause', async (req, res) => {
  const { userId } = req.body;

  try {
    const authResult = await getUserToken(userId);
    if (!authResult.success) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const { user, accessToken } = authResult.data;

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const result = await spotifyPause(accessToken);
    if (!result.success) {
      await logError(userId, 'PLAYBACK_PAUSE_ERROR', result.error, req.path);
      return res.status(result.status || 500).json({
        error: {
          message: result.error,
          code: 'PAUSE_FAILED',
          retryable: true
        }
      });
    }
    return res.json({ success: true, message: 'Playback paused' });
  } catch (error) {
    console.error('Pause error:', error);
    await logError(userId, 'PLAYBACK_PAUSE_ERROR', error.message, req.path);
    res.status(500).json({
      error: {
        message: 'Failed to pause playback',
        code: 'PLAYBACK_ERROR',
        retryable: true
      }
    });
  }
});


/**
 * POST /api/playback/seek
 * Seek to a position in the current track
 * Requirements: 3.4
 */
router.post('/seek', async (req, res) => {
  const { userId, positionMs } = req.body;

  try {
    const authResult = await getUserToken(userId);
    if (!authResult.success) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const { user, accessToken } = authResult.data;

    if (typeof positionMs !== 'number' || positionMs < 0) {
      return res.status(400).json({
        error: {
          message: 'Invalid position. Must be a non-negative number in milliseconds.',
          code: 'INVALID_POSITION',
          retryable: false
        }
      });
    }

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const result = await spotifySeek(accessToken, positionMs);
    if (!result.success) {
      await logError(userId, 'PLAYBACK_SEEK_ERROR', result.error, req.path);
      return res.status(result.status || 500).json({
        error: {
          message: result.error,
          code: 'SEEK_FAILED',
          retryable: true
        }
      });
    }
    return res.json({ success: true, positionMs, message: 'Seek successful' });
  } catch (error) {
    console.error('Seek error:', error);
    await logError(userId, 'PLAYBACK_SEEK_ERROR', error.message, req.path);
    res.status(500).json({
      error: {
        message: 'Failed to seek',
        code: 'PLAYBACK_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * POST /api/playback/skip
 * Skip to next or previous track
 * Requirements: 3.5, 3.6
 */
router.post('/skip', async (req, res) => {
  const { userId, direction } = req.body;

  try {
    const authResult = await getUserToken(userId);
    if (!authResult.success) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const { user, accessToken } = authResult.data;

    if (direction !== 'forward' && direction !== 'backward') {
      return res.status(400).json({
        error: {
          message: 'Invalid direction. Must be "forward" or "backward".',
          code: 'INVALID_DIRECTION',
          retryable: false
        }
      });
    }

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const result = direction === 'forward'
      ? await spotifySkipNext(accessToken)
      : await spotifySkipPrevious(accessToken);

    if (!result.success) {
      await logError(userId, 'PLAYBACK_SKIP_ERROR', result.error, req.path);
      return res.status(result.status || 500).json({
        error: {
          message: result.error,
          code: 'SKIP_FAILED',
          retryable: true
        }
      });
    }
    return res.json({ success: true, direction, message: `Skipped ${direction}` });
  } catch (error) {
    console.error('Skip error:', error);
    await logError(userId, 'PLAYBACK_SKIP_ERROR', error.message, req.path);
    res.status(500).json({
      error: {
        message: 'Failed to skip track',
        code: 'PLAYBACK_ERROR',
        retryable: true
      }
    });
  }
});


/**
 * GET /api/playback/state
 * Get current playback state
 * Requirements: 3.2, 3.3, 5.3
 */
router.get('/state', async (req, res) => {
  const { userId } = req.query;

  try {
    const authResult = await getUserToken(userId);
    if (!authResult.success) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const { user, accessToken } = authResult.data;

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const state = await getSpotifyPlaybackState(accessToken);
    return res.json(state);
  } catch (error) {
    console.error('Get state error:', error);
    await logError(req.query.userId, 'PLAYBACK_STATE_ERROR', error.message, req.path);
    res.status(500).json({
      error: {
        message: 'Failed to get playback state',
        code: 'PLAYBACK_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * GET /api/playback/devices
 * Get available Spotify devices
 */
router.get('/devices', async (req, res) => {
  const { userId } = req.query;

  try {
    const authResult = await getUserToken(userId);
    if (!authResult.success) {
      return res.status(authResult.status).json({ error: authResult.error });
    }

    const { user, accessToken } = authResult.data;

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const devices = await getSpotifyDevices(accessToken);
    return res.json(devices);
  } catch (error) {
    console.error('Get devices error:', error);
    await logError(req.query.userId, 'PLAYBACK_DEVICES_ERROR', error.message, req.path);
    res.status(500).json({
      error: {
        message: 'Failed to get devices',
        code: 'PLAYBACK_ERROR',
        retryable: true
      }
    });
  }
});

// ============================================
// Spotify API Helper Functions
// ============================================

/**
 * Start or resume playback on Spotify
 */
async function spotifyPlay(accessToken, { playlistId, trackUri, deviceId }) {
  try {
    const body = {};

    if (playlistId) {
      body.context_uri = `spotify:playlist:${playlistId}`;
    }

    if (trackUri) {
      body.uris = [trackUri];
    }

    // Add device_id to URL if provided
    const url = deviceId
      ? `${SPOTIFY_API_BASE}/me/player/play?device_id=${deviceId}`
      : `${SPOTIFY_API_BASE}/me/player/play`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
    });

    // 204 No Content is success for this endpoint
    if (response.status === 204 || response.ok) {
      return { success: true };
    }

    // Handle specific error cases
    if (response.status === 404) {
      return {
        success: false,
        error: 'No active device found. Please open Spotify on a device or enable the web player.',
        status: 404
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error?.message || 'Failed to start playback',
      status: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Pause playback on Spotify
 */
async function spotifyPause(accessToken) {
  try {
    const url = `${SPOTIFY_API_BASE}/me/player/pause`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || response.ok) {
      return { success: true };
    }

    if (response.status === 404) {
      return { success: false, error: 'No active device found.', status: 404 };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error?.message || 'Failed to pause playback',
      status: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * Seek to position on Spotify
 */
async function spotifySeek(accessToken, positionMs) {
  try {
    const url = `${SPOTIFY_API_BASE}/me/player/seek?position_ms=${positionMs}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || response.ok) {
      return { success: true };
    }

    if (response.status === 404) {
      return { success: false, error: 'No active device found.', status: 404 };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error?.message || 'Failed to seek',
      status: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Skip to next track on Spotify
 */
async function spotifySkipNext(accessToken) {
  try {
    const url = `${SPOTIFY_API_BASE}/me/player/next`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || response.ok) {
      return { success: true };
    }

    if (response.status === 404) {
      return { success: false, error: 'No active device found.', status: 404 };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error?.message || 'Failed to skip to next track',
      status: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Skip to previous track on Spotify
 */
async function spotifySkipPrevious(accessToken) {
  try {
    const url = `${SPOTIFY_API_BASE}/me/player/previous`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (response.status === 204 || response.ok) {
      return { success: true };
    }

    if (response.status === 404) {
      return { success: false, error: 'No active device found.', status: 404 };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.error?.message || 'Failed to skip to previous track',
      status: response.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get current playback state from Spotify
 */
async function getSpotifyPlaybackState(accessToken) {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // 204 means no active playback
    if (response.status === 204) {
      return {
        isPlaying: false,
        currentTrack: null,
        position: 0,
        duration: 0,
        playlistId: null,
        trackIndex: 0,
        device: null
      };
    }

    if (!response.ok) {
      throw new Error('Failed to get playback state');
    }

    const data = await response.json();

    // Extract playlist ID from context if available
    let playlistId = null;
    if (data.context?.type === 'playlist') {
      // Context URI format: spotify:playlist:PLAYLIST_ID
      playlistId = data.context.uri?.split(':')[2] || null;
    }

    return {
      isPlaying: data.is_playing || false,
      currentTrack: data.item ? {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
        album: data.item.album?.name || 'Unknown Album',
        albumArt: data.item.album?.images?.[0]?.url || null,
        duration: data.item.duration_ms || 0,
        uri: data.item.uri
      } : null,
      position: data.progress_ms || 0,
      duration: data.item?.duration_ms || 0,
      playlistId,
      trackIndex: 0, // Spotify doesn't provide track index directly
      device: data.device ? {
        id: data.device.id,
        name: data.device.name,
        type: data.device.type,
        volume: data.device.volume_percent
      } : null,
      shuffleState: data.shuffle_state || false,
      repeatState: data.repeat_state || 'off'
    };
  } catch (error) {
    console.error('Get Spotify playback state error:', error);
    return {
      isPlaying: false,
      currentTrack: null,
      position: 0,
      duration: 0,
      playlistId: null,
      trackIndex: 0,
      error: error.message
    };
  }
}

/**
 * Get available Spotify devices
 */
async function getSpotifyDevices(accessToken) {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/devices`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get devices');
    }

    const data = await response.json();

    return {
      devices: data.devices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        isActive: device.is_active,
        volume: device.volume_percent
      }))
    };
  } catch (error) {
    console.error('Get Spotify devices error:', error);
    return {
      devices: [],
      error: error.message
    };
  }
}

export default router;
