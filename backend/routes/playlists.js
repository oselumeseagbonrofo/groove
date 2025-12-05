import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Spotify API URLs
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * GET /api/playlists
 * Fetch user playlists from Spotify
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

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const result = await fetchSpotifyPlaylists(
      tokenData.access_token,
      parseInt(limit),
      parseInt(offset)
    );

    // Fetch custom vinyl designs for these playlists
    const playlistIds = result.playlists.map(p => p.id);
    const { data: vinylDesigns } = await supabase
      .from('vinyl_designs')
      .select('playlist_id, color, custom_image_url')
      .eq('user_id', userId)
      .in('playlist_id', playlistIds);

    // Merge vinyl designs with playlists
    const designMap = new Map(
      (vinylDesigns || []).map(d => [d.playlist_id, d])
    );

    const enrichedPlaylists = result.playlists.map(playlist => ({
      ...playlist,
      vinylColor: designMap.get(playlist.id)?.color || null,
      customImageUrl: designMap.get(playlist.id)?.custom_image_url || null
    }));

    res.json({
      playlists: enrichedPlaylists,
      pagination: {
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: result.hasMore
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
 * POST /api/playlists
 * Create a new playlist via Spotify API and store vinyl design metadata
 * Requirements: 4.6, 4.7
 */
router.post('/', async (req, res) => {
  const { userId, name, description, color, customImageUrl } = req.body;

  try {
    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        error: {
          message: 'User ID is required',
          code: 'MISSING_USER_ID',
          retryable: false
        }
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: {
          message: 'Playlist name is required',
          code: 'MISSING_PLAYLIST_NAME',
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

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const playlist = await createSpotifyPlaylist(
      tokenData.access_token,
      name.trim(),
      description?.trim() || ''
    );

    // Store vinyl design metadata in Supabase
    if (color || customImageUrl) {
      const { error: designError } = await supabase
        .from('vinyl_designs')
        .upsert({
          user_id: userId,
          playlist_id: playlist.id,
          color: color || null,
          custom_image_url: customImageUrl || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,playlist_id'
        });

      if (designError) {
        console.error('Failed to save vinyl design:', designError);
        // Don't fail the request, just log the error
      }
    }

    res.status(201).json({
      playlist: {
        ...playlist,
        vinylColor: color || null,
        customImageUrl: customImageUrl || null
      },
      message: 'Playlist created successfully'
    });

  } catch (error) {
    console.error('Create playlist error:', error);
    
    // Log error to Supabase
    await logError(req.body.userId, 'PLAYLIST_CREATE_ERROR', error.message, req.path);
    
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create playlist',
        code: 'PLAYLIST_CREATE_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * Create playlist via Spotify API
 */
async function createSpotifyPlaylist(accessToken, name, description) {
  // First, get the current user's ID
  const userResponse = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!userResponse.ok) {
    const errorData = await userResponse.json();
    throw new Error(`Spotify API error: ${errorData.error?.message || 'Failed to get user'}`);
  }

  const userData = await userResponse.json();
  const spotifyUserId = userData.id;

  // Create the playlist
  const response = await fetch(
    `${SPOTIFY_API_BASE}/users/${spotifyUserId}/playlists`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        public: false // Create as private by default
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Spotify API error: ${errorData.error?.message || 'Failed to create playlist'}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    coverImage: data.images?.[0]?.url || null,
    trackCount: 0,
    owner: data.owner?.display_name || 'You',
    isPublic: data.public,
    provider: 'spotify'
  };
}

/**
 * GET /api/playlists/:playlistId
 * Fetch a specific playlist with tracks
 * Requirements: 2.1
 */
router.get('/:playlistId', async (req, res) => {
  const { playlistId } = req.params;
  const { userId } = req.query;

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

    if (user.provider !== 'spotify') {
      return res.status(400).json({
        error: {
          message: 'Unknown music provider',
          code: 'UNKNOWN_PROVIDER',
          retryable: false
        }
      });
    }

    const playlist = await fetchSpotifyPlaylist(tokenData.access_token, playlistId);

    // Fetch custom vinyl design for this playlist
    const { data: vinylDesign } = await supabase
      .from('vinyl_designs')
      .select('color, custom_image_url')
      .eq('user_id', userId)
      .eq('playlist_id', playlistId)
      .single();

    res.json({
      ...playlist,
      vinylColor: vinylDesign?.color || null,
      customImageUrl: vinylDesign?.custom_image_url || null
    });

  } catch (error) {
    console.error('Fetch playlist error:', error);
    await logError(req.query.userId, 'PLAYLIST_FETCH_ERROR', error.message, req.path);
    
    res.status(500).json({
      error: {
        message: 'Failed to fetch playlist',
        code: 'PLAYLIST_FETCH_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * Fetch a specific playlist with tracks from Spotify API
 */
async function fetchSpotifyPlaylist(accessToken, playlistId) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/playlists/${playlistId}`,
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

  const tracks = data.tracks.items
    .filter(item => item.track) // Filter out null tracks
    .map(item => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
      album: item.track.album?.name || 'Unknown Album',
      duration: item.track.duration_ms,
      uri: item.track.uri,
      albumArt: item.track.album?.images?.[0]?.url || null
    }));

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    coverImage: data.images?.[0]?.url || null,
    trackCount: data.tracks.total,
    owner: data.owner?.display_name || 'Unknown',
    isPublic: data.public,
    provider: 'spotify',
    tracks
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
