import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Spotify API URLs
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * GET /api/playlists
 * Fetch user playlists from connected music service
 * Requirements: 2.1, 2.4
 */
router.get('/', async (req, res) => {
  const { userId, limit = 20, offset = 0 } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({
        error: {
          message: 'User ID is required',
          code: 'MISSING_USER_ID',
          retryable: false
        }
      });
    }

    // Get user and their provider
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, provider')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
          retryable: false
        }
      });
    }

    // Get access token
    const { data: tokenData, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({
        error: {
          message: 'No valid authentication token found',
          code: 'NO_TOKEN',
          retryable: false
        }
      });
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(401).json({
        error: {
          message: 'Authentication token expired',
          code: 'TOKEN_EXPIRED',
          retryable: false
        }
      });
    }

    let playlists;
    let total;
    let hasMore;

    if (user.provider === 'spotify') {
      const result = await fetchSpotifyPlaylists(
        tokenData.access_token,
        parseInt(limit),
        parseInt(offset)
      );
      playlists = result.playlists;
      total = result.total;
      hasMore = result.hasMore;
    } else if (user.provider === 'apple') {
      const result = await fetchAppleMusicPlaylists(
        tokenData.access_token,
        parseInt(limit),
        parseInt(offset)
      );
      playlists = result.playlists;
      total = result.total;
      hasMore = result.hasMore;
    } else {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    // Fetch custom vinyl designs for these playlists
    const playlistIds = playlists.map(p => p.id);
    const { data: vinylDesigns } = await supabase
      .from('vinyl_designs')
      .select('playlist_id, color, custom_image_url')
      .eq('user_id', userId)
      .in('playlist_id', playlistIds);

    // Merge vinyl designs with playlists
    const designMap = new Map(
      (vinylDesigns || []).map(d => [d.playlist_id, d])
    );

    const enrichedPlaylists = playlists.map(playlist => ({
      ...playlist,
      vinylColor: designMap.get(playlist.id)?.color || null,
      customImageUrl: designMap.get(playlist.id)?.custom_image_url || null
    }));

    res.json({
      playlists: enrichedPlaylists,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore
      }
    });

  } catch (error) {
    console.error('Fetch playlists error:', error);
    
    // Log error to Supabase
    await logError(req.query.userId, 'PLAYLIST_FETCH_ERROR', error.message, req.path);
    
    res.status(500).json({
      error: {
        message: 'Failed to fetch playlists',
        code: 'PLAYLIST_FETCH_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * Fetch playlists from Spotify API
 */
async function fetchSpotifyPlaylists(accessToken, limit, offset) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/me/playlists?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Spotify API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();

  const playlists = data.items.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    coverImage: item.images?.[0]?.url || null,
    trackCount: item.tracks?.total || 0,
    owner: item.owner?.display_name || 'Unknown',
    isPublic: item.public,
    provider: 'spotify'
  }));

  return {
    playlists,
    total: data.total,
    hasMore: offset + limit < data.total
  };
}

/**
 * Fetch playlists from Apple Music API
 */
async function fetchAppleMusicPlaylists(musicUserToken, limit, offset) {
  // Apple Music API uses different pagination
  const response = await fetch(
    `https://api.music.apple.com/v1/me/library/playlists?limit=${limit}&offset=${offset}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.APPLE_MUSIC_DEVELOPER_TOKEN}`,
        'Music-User-Token': musicUserToken
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Apple Music API error: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
  }

  const data = await response.json();

  const playlists = (data.data || []).map(item => ({
    id: item.id,
    name: item.attributes?.name || 'Untitled Playlist',
    description: item.attributes?.description?.standard || '',
    coverImage: item.attributes?.artwork?.url?.replace('{w}x{h}', '300x300') || null,
    trackCount: item.attributes?.trackCount || 0,
    owner: 'You',
    isPublic: item.attributes?.isPublic || false,
    provider: 'apple'
  }));

  const hasMore = data.next !== undefined;
  const total = data.meta?.total || playlists.length + (hasMore ? 1 : 0);

  return {
    playlists,
    total,
    hasMore
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

export default router;
