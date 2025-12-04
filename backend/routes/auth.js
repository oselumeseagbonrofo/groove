import express from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Spotify OAuth configuration
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_USER_URL = 'https://api.spotify.com/v1/me';

// Apple Music configuration
const APPLE_MUSIC_AUTH_URL = 'https://appleid.apple.com/auth/authorize';

// Scopes required for Spotify
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
].join(' ');

// Generate random state for OAuth security
const generateState = () => crypto.randomBytes(16).toString('hex');

// Store states temporarily (in production, use Redis or similar)
const pendingStates = new Map();

/**
 * POST /api/auth/spotify
 * Initiate Spotify OAuth flow
 * Requirements: 1.3
 */
router.post('/spotify', (req, res) => {
  try {
    const state = generateState();
    pendingStates.set(state, { provider: 'spotify', timestamp: Date.now() });
    
    // Clean up old states (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [key, value] of pendingStates.entries()) {
      if (value.timestamp < tenMinutesAgo) {
        pendingStates.delete(key);
      }
    }

    const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
      state: state,
      show_dialog: 'true'
    });

    const authUrl = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
    
    res.json({ authUrl, state });
  } catch (error) {
    console.error('Spotify auth initiation error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to initiate Spotify authentication',
        code: 'AUTH_INIT_FAILED',
        retryable: true
      }
    });
  }
});


/**
 * GET /api/auth/callback
 * Handle OAuth callback from Spotify
 * Requirements: 1.3, 1.5
 */
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`${frontendUrl}/welcome?error=${encodeURIComponent(error)}`);
    }

    // Validate state
    if (!state || !pendingStates.has(state)) {
      return res.redirect(`${frontendUrl}/welcome?error=invalid_state`);
    }

    const stateData = pendingStates.get(state);
    pendingStates.delete(state);

    if (stateData.provider !== 'spotify') {
      return res.redirect(`${frontendUrl}/welcome?error=provider_mismatch`);
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange error:', errorData);
      return res.redirect(`${frontendUrl}/welcome?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();

    // Get user profile from Spotify
    const userResponse = await fetch(SPOTIFY_USER_URL, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!userResponse.ok) {
      return res.redirect(`${frontendUrl}/welcome?error=user_fetch_failed`);
    }

    const spotifyUser = await userResponse.json();

    // Store or update user in Supabase
    const { data: existingUser, error: userLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('provider', 'spotify')
      .eq('provider_id', spotifyUser.id)
      .single();

    let userId;

    if (userLookupError && userLookupError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for new users
      console.error('User lookup error:', userLookupError);
      return res.redirect(`${frontendUrl}/welcome?error=database_error`);
    }

    if (existingUser) {
      userId = existingUser.id;
      // Update user info
      await supabase
        .from('users')
        .update({
          email: spotifyUser.email,
          display_name: spotifyUser.display_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          provider: 'spotify',
          provider_id: spotifyUser.id,
          email: spotifyUser.email,
          display_name: spotifyUser.display_name
        })
        .select('id')
        .single();

      if (createError) {
        console.error('User creation error:', createError);
        return res.redirect(`${frontendUrl}/welcome?error=user_creation_failed`);
      }

      userId = newUser.id;
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // Store tokens in Supabase
    const { error: tokenError } = await supabase
      .from('auth_tokens')
      .upsert({
        user_id: userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return res.redirect(`${frontendUrl}/welcome?error=token_storage_failed`);
    }

    // Redirect to frontend with user ID (frontend will handle session)
    res.redirect(`${frontendUrl}/now-playing?userId=${userId}&provider=spotify`);

  } catch (error) {
    console.error('Callback error:', error);
    res.redirect(`${frontendUrl}/welcome?error=callback_failed`);
  }
});


/**
 * POST /api/auth/apple
 * Initiate Apple Music OAuth flow
 * Requirements: 1.4
 */
router.post('/apple', (req, res) => {
  try {
    const state = generateState();
    pendingStates.set(state, { provider: 'apple', timestamp: Date.now() });

    // Apple Music uses MusicKit JS on the frontend for authorization
    // The backend generates a developer token for MusicKit
    const developerToken = generateAppleMusicDeveloperToken();

    res.json({
      developerToken,
      state,
      // Apple Music auth is handled client-side with MusicKit JS
      // This endpoint provides the developer token needed for initialization
    });
  } catch (error) {
    console.error('Apple Music auth initiation error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to initiate Apple Music authentication',
        code: 'AUTH_INIT_FAILED',
        retryable: true
      }
    });
  }
});

/**
 * POST /api/auth/apple/callback
 * Handle Apple Music authorization callback
 * Requirements: 1.4, 1.5
 */
router.post('/apple/callback', async (req, res) => {
  const { musicUserToken, state } = req.body;

  try {
    // Validate state
    if (!state || !pendingStates.has(state)) {
      return res.status(400).json({
        error: {
          message: 'Invalid state parameter',
          code: 'INVALID_STATE',
          retryable: false
        }
      });
    }

    const stateData = pendingStates.get(state);
    pendingStates.delete(state);

    if (stateData.provider !== 'apple') {
      return res.status(400).json({
        error: {
          message: 'Provider mismatch',
          code: 'PROVIDER_MISMATCH',
          retryable: false
        }
      });
    }

    if (!musicUserToken) {
      return res.status(400).json({
        error: {
          message: 'Missing music user token',
          code: 'MISSING_TOKEN',
          retryable: false
        }
      });
    }

    // Generate a unique identifier for Apple Music user
    // Apple Music doesn't provide a user ID directly, so we hash the token
    const appleUserId = crypto
      .createHash('sha256')
      .update(musicUserToken)
      .digest('hex')
      .substring(0, 32);

    // Store or update user in Supabase
    const { data: existingUser, error: userLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('provider', 'apple')
      .eq('provider_id', appleUserId)
      .single();

    let userId;

    if (userLookupError && userLookupError.code !== 'PGRST116') {
      console.error('User lookup error:', userLookupError);
      return res.status(500).json({
        error: {
          message: 'Database error',
          code: 'DATABASE_ERROR',
          retryable: true
        }
      });
    }

    if (existingUser) {
      userId = existingUser.id;
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);
    } else {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          provider: 'apple',
          provider_id: appleUserId,
          display_name: 'Apple Music User'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('User creation error:', createError);
        return res.status(500).json({
          error: {
            message: 'Failed to create user',
            code: 'USER_CREATION_FAILED',
            retryable: true
          }
        });
      }

      userId = newUser.id;
    }

    // Apple Music tokens don't expire in the same way as Spotify
    // Set a long expiration (180 days is typical for MusicKit tokens)
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();

    // Store token in Supabase
    const { error: tokenError } = await supabase
      .from('auth_tokens')
      .upsert({
        user_id: userId,
        access_token: musicUserToken,
        refresh_token: '', // Apple Music doesn't use refresh tokens the same way
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (tokenError) {
      console.error('Token storage error:', tokenError);
      return res.status(500).json({
        error: {
          message: 'Failed to store token',
          code: 'TOKEN_STORAGE_FAILED',
          retryable: true
        }
      });
    }

    res.json({
      userId,
      provider: 'apple',
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Apple callback error:', error);
    res.status(500).json({
      error: {
        message: 'Authentication callback failed',
        code: 'CALLBACK_FAILED',
        retryable: true
      }
    });
  }
});

/**
 * Generate Apple Music Developer Token
 * This creates a JWT signed with the Apple Music private key
 */
function generateAppleMusicDeveloperToken() {
  const keyId = process.env.APPLE_MUSIC_KEY_ID;
  const teamId = process.env.APPLE_MUSIC_TEAM_ID;
  const privateKey = process.env.APPLE_MUSIC_PRIVATE_KEY;

  if (!keyId || !teamId || !privateKey) {
    throw new Error('Missing Apple Music configuration');
  }

  // Create JWT header
  const header = {
    alg: 'ES256',
    kid: keyId
  };

  // Create JWT payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + (180 * 24 * 60 * 60) // 180 days
  };

  // For a full implementation, you'd use a JWT library like jsonwebtoken
  // This is a simplified version - in production, use proper JWT signing
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  // Note: In production, properly sign with ES256 algorithm
  // This requires the jsonwebtoken package with the private key
  return `${base64Header}.${base64Payload}.signature_placeholder`;
}


/**
 * POST /api/auth/refresh
 * Refresh access token before expiration
 * Requirements: 1.6
 */
router.post('/refresh', async (req, res) => {
  const { userId } = req.body;

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

    // Get user and their tokens from Supabase
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

    const { data: tokenData, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.status(404).json({
        error: {
          message: 'No tokens found for user',
          code: 'TOKENS_NOT_FOUND',
          retryable: false
        }
      });
    }

    // Check if token needs refresh (within 5 minutes of expiration)
    const expiresAt = new Date(tokenData.expires_at);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      // Token is still valid
      return res.json({
        accessToken: tokenData.access_token,
        expiresAt: tokenData.expires_at,
        refreshed: false
      });
    }

    // Handle refresh based on provider
    if (user.provider === 'spotify') {
      const refreshResult = await refreshSpotifyToken(tokenData.refresh_token);
      
      if (!refreshResult.success) {
        return res.status(401).json({
          error: {
            message: 'Token refresh failed',
            code: 'REFRESH_FAILED',
            retryable: false
          }
        });
      }

      // Update tokens in Supabase
      const newExpiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000).toISOString();
      
      await supabase
        .from('auth_tokens')
        .update({
          access_token: refreshResult.accessToken,
          refresh_token: refreshResult.refreshToken || tokenData.refresh_token,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      return res.json({
        accessToken: refreshResult.accessToken,
        expiresAt: newExpiresAt,
        refreshed: true
      });

    } else if (user.provider === 'apple') {
      // Apple Music tokens are long-lived and handled differently
      // The user may need to re-authorize if the token is truly expired
      if (new Date() > expiresAt) {
        return res.status(401).json({
          error: {
            message: 'Apple Music authorization expired. Please re-authenticate.',
            code: 'AUTH_EXPIRED',
            retryable: false
          }
        });
      }

      return res.json({
        accessToken: tokenData.access_token,
        expiresAt: tokenData.expires_at,
        refreshed: false
      });
    }

    return res.status(400).json({
      error: {
        message: 'Unknown provider',
        code: 'UNKNOWN_PROVIDER',
        retryable: false
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to refresh token',
        code: 'REFRESH_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * Refresh Spotify access token using refresh token
 */
async function refreshSpotifyToken(refreshToken) {
  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Spotify refresh error:', errorData);
      return { success: false };
    }

    const data = await response.json();
    
    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token, // Spotify may return a new refresh token
      expiresIn: data.expires_in
    };
  } catch (error) {
    console.error('Spotify token refresh error:', error);
    return { success: false };
  }
}

/**
 * POST /api/auth/logout
 * Clear authentication data
 * Requirements: 1.7
 */
router.post('/logout', async (req, res) => {
  const { userId } = req.body;

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

    // Delete tokens from Supabase
    const { error: deleteError } = await supabase
      .from('auth_tokens')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Token deletion error:', deleteError);
      return res.status(500).json({
        error: {
          message: 'Failed to clear authentication data',
          code: 'LOGOUT_FAILED',
          retryable: true
        }
      });
    }

    res.json({
      message: 'Logged out successfully',
      success: true
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: {
        message: 'Logout failed',
        code: 'LOGOUT_ERROR',
        retryable: true
      }
    });
  }
});

/**
 * GET /api/auth/status
 * Check authentication status for a user
 */
router.get('/status/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, provider, display_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        authenticated: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    const { data: tokenData, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('expires_at')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return res.json({
        authenticated: false,
        user: {
          id: user.id,
          provider: user.provider,
          displayName: user.display_name
        }
      });
    }

    const isExpired = new Date(tokenData.expires_at) < new Date();

    res.json({
      authenticated: !isExpired,
      user: {
        id: user.id,
        provider: user.provider,
        displayName: user.display_name,
        email: user.email
      },
      tokenExpired: isExpired,
      expiresAt: tokenData.expires_at
    });

  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({
      authenticated: false,
      error: {
        message: 'Failed to check authentication status',
        code: 'STATUS_CHECK_FAILED'
      }
    });
  }
});

export default router;
