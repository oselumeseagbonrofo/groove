/**
 * Token Refresh Service
 * 
 * Handles token refresh logic for Spotify authentication.
 * This module is designed to be testable with property-based testing.
 * 
 * Requirements: 1.6
 */

/**
 * Determines if a token needs refresh based on expiration time.
 * A token needs refresh if it expires within the buffer period.
 * 
 * @param {Date|string} expiresAt - Token expiration timestamp
 * @param {number} bufferMs - Buffer time in milliseconds (default: 5 minutes)
 * @returns {boolean} - True if token needs refresh
 */
export function needsRefresh(expiresAt, bufferMs = 5 * 60 * 1000) {
  const expirationDate = new Date(expiresAt);
  const bufferTime = new Date(Date.now() + bufferMs);
  return expirationDate <= bufferTime;
}

/**
 * Calculates the new expiration timestamp after a token refresh.
 * 
 * @param {number} expiresIn - Token lifetime in seconds
 * @param {Date} [now] - Current time (for testing)
 * @returns {string} - ISO timestamp of new expiration
 */
export function calculateNewExpiration(expiresIn, now = new Date()) {
  return new Date(now.getTime() + expiresIn * 1000).toISOString();
}

/**
 * Validates that a refresh token is present and valid.
 * 
 * @param {string} refreshToken - The refresh token to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateRefreshToken(refreshToken) {
  if (!refreshToken) {
    return { valid: false, error: 'MISSING_REFRESH_TOKEN' };
  }
  if (typeof refreshToken !== 'string') {
    return { valid: false, error: 'INVALID_REFRESH_TOKEN_TYPE' };
  }
  if (refreshToken.trim().length === 0) {
    return { valid: false, error: 'EMPTY_REFRESH_TOKEN' };
  }
  return { valid: true };
}

/**
 * Processes a token refresh result and returns the appropriate response.
 * This function encapsulates the logic for handling refresh results.
 * 
 * @param {Object} params - Parameters for processing refresh
 * @param {Object} params.tokenData - Current token data from database
 * @param {Object} params.refreshResult - Result from the refresh operation
 * @param {string} params.provider - The authentication provider ('spotify')
 * @returns {Object} - Processed result with new token data or error
 */
export function processRefreshResult({ tokenData, refreshResult, provider }) {
  if (provider !== 'spotify') {
    return {
      success: false,
      error: {
        message: 'Unknown provider',
        code: 'UNKNOWN_PROVIDER',
        retryable: false
      }
    };
  }

  if (!refreshResult || !refreshResult.success) {
    return {
      success: false,
      error: {
        message: 'Token refresh failed',
        code: 'REFRESH_FAILED',
        retryable: false
      }
    };
  }

  return {
    success: true,
    accessToken: refreshResult.accessToken,
    refreshToken: refreshResult.refreshToken || tokenData.refresh_token,
    expiresAt: calculateNewExpiration(refreshResult.expiresIn),
    refreshed: true
  };
}

/**
 * Determines the refresh action needed based on token state.
 * 
 * @param {Object} params - Parameters
 * @param {string} params.provider - The authentication provider
 * @param {Object} params.tokenData - Current token data
 * @param {number} [params.bufferMs] - Buffer time in milliseconds
 * @returns {{ action: 'none' | 'refresh' | 'reauth', reason: string }}
 */
export function determineRefreshAction({ provider, tokenData, bufferMs = 5 * 60 * 1000 }) {
  const validation = validateRefreshToken(tokenData.refresh_token);
  
  // Check if token is still valid (not within buffer period)
  if (!needsRefresh(tokenData.expires_at, bufferMs)) {
    return { action: 'none', reason: 'Token still valid' };
  }

  if (provider !== 'spotify') {
    return { action: 'reauth', reason: 'Unknown provider' };
  }

  // For Spotify, check if we have a valid refresh token
  if (!validation.valid) {
    return { action: 'reauth', reason: validation.error };
  }

  return { action: 'refresh', reason: 'Token needs refresh' };
}
