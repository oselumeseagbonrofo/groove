/**
 * Property-Based Tests for Authentication
 * 
 * **Feature: vinyl-spotify-player, Property 1: Token Refresh Preserves Authentication**
 * 
 * For any expired access token with a valid refresh token stored in Supabase,
 * the Backend Service SHALL successfully obtain a new access token without
 * requiring user re-authentication.
 * 
 * **Validates: Requirements 1.6**
 */

import fc from 'fast-check';
import { PBT_CONFIG } from './pbt.config.js';
import {
  needsRefresh,
  calculateNewExpiration,
  validateRefreshToken,
  processRefreshResult,
  determineRefreshAction
} from '../../services/tokenRefresh.js';

describe('Property Tests: Authentication', () => {
  /**
   * **Feature: vinyl-spotify-player, Property 1: Token Refresh Preserves Authentication**
   * 
   * For any expired access token with a valid refresh token stored in Supabase,
   * the Backend Service SHALL successfully obtain a new access token without
   * requiring user re-authentication.
   * 
   * **Validates: Requirements 1.6**
   */
  describe('Property 1: Token Refresh Preserves Authentication', () => {
    
    // Generator for valid refresh tokens (non-empty strings)
    const validRefreshTokenArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);
    
    // Generator for valid access tokens
    const validAccessTokenArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);
    
    // Generator for token expiration times (in seconds, 1 hour to 24 hours)
    const expiresInArb = fc.integer({ min: 3600, max: 86400 });
    
    // Generator for past timestamps (expired tokens) - using integer offset from now
    const expiredTimestampArb = fc.integer({ 
      min: 1000, // 1 second ago
      max: 7 * 24 * 60 * 60 * 1000 // 7 days ago
    }).map(offset => new Date(Date.now() - offset).toISOString());
    
    // Generator for future timestamps (valid tokens) - using integer offset from now
    const validTimestampArb = fc.integer({ 
      min: 10 * 60 * 1000, // 10 minutes from now
      max: 24 * 60 * 60 * 1000 // 24 hours from now
    }).map(offset => new Date(Date.now() + offset).toISOString());

    it('should identify expired tokens as needing refresh', () => {
      fc.assert(
        fc.property(
          expiredTimestampArb,
          (expiresAt) => {
            // Any expired token should need refresh
            return needsRefresh(expiresAt) === true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should identify valid tokens as not needing refresh', () => {
      fc.assert(
        fc.property(
          validTimestampArb,
          (expiresAt) => {
            // Any token expiring more than 5 minutes from now should not need refresh
            return needsRefresh(expiresAt) === false;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should calculate new expiration correctly for any expiresIn value', () => {
      fc.assert(
        fc.property(
          expiresInArb,
          (expiresIn) => {
            const now = new Date();
            const newExpiration = calculateNewExpiration(expiresIn, now);
            const expectedExpiration = new Date(now.getTime() + expiresIn * 1000);
            
            // The calculated expiration should match expected
            return new Date(newExpiration).getTime() === expectedExpiration.getTime();
          }
        ),
        PBT_CONFIG
      );
    });

    it('should validate non-empty refresh tokens as valid', () => {
      fc.assert(
        fc.property(
          validRefreshTokenArb,
          (refreshToken) => {
            const result = validateRefreshToken(refreshToken);
            return result.valid === true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should reject empty or whitespace-only refresh tokens', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('', '   ', '\t', '\n', '  \t\n  '),
          (invalidToken) => {
            const result = validateRefreshToken(invalidToken);
            return result.valid === false;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should process successful Spotify refresh and preserve authentication', () => {
      fc.assert(
        fc.property(
          validAccessTokenArb,
          validRefreshTokenArb,
          expiresInArb,
          expiredTimestampArb,
          (newAccessToken, refreshToken, expiresIn, oldExpiresAt) => {
            const tokenData = {
              access_token: 'old_token',
              refresh_token: refreshToken,
              expires_at: oldExpiresAt
            };
            
            const refreshResult = {
              success: true,
              accessToken: newAccessToken,
              refreshToken: refreshToken,
              expiresIn: expiresIn
            };
            
            const result = processRefreshResult({
              tokenData,
              refreshResult,
              provider: 'spotify'
            });
            
            // For any successful refresh, authentication should be preserved
            // (new access token returned, no re-auth required)
            return (
              result.success === true &&
              result.accessToken === newAccessToken &&
              result.refreshed === true &&
              result.expiresAt !== undefined
            );
          }
        ),
        PBT_CONFIG
      );
    });

    it('should determine refresh action correctly for expired Spotify tokens with valid refresh token', () => {
      fc.assert(
        fc.property(
          validRefreshTokenArb,
          expiredTimestampArb,
          (refreshToken, expiresAt) => {
            const result = determineRefreshAction({
              provider: 'spotify',
              tokenData: {
                refresh_token: refreshToken,
                expires_at: expiresAt
              }
            });
            
            // For expired Spotify tokens with valid refresh token,
            // action should be 'refresh' (not 'reauth')
            return result.action === 'refresh';
          }
        ),
        PBT_CONFIG
      );
    });

    it('should not require re-authentication when refresh token is valid', () => {
      fc.assert(
        fc.property(
          validRefreshTokenArb,
          validAccessTokenArb,
          expiresInArb,
          (refreshToken, newAccessToken, expiresIn) => {
            // Simulate an expired token scenario
            const expiredAt = new Date(Date.now() - 1000).toISOString();
            
            const tokenData = {
              access_token: 'expired_token',
              refresh_token: refreshToken,
              expires_at: expiredAt
            };
            
            // Simulate successful refresh from Spotify
            const refreshResult = {
              success: true,
              accessToken: newAccessToken,
              refreshToken: refreshToken,
              expiresIn: expiresIn
            };
            
            const result = processRefreshResult({
              tokenData,
              refreshResult,
              provider: 'spotify'
            });
            
            // The key property: with a valid refresh token and successful refresh,
            // authentication is preserved (no re-auth required)
            return (
              result.success === true &&
              result.error === undefined
            );
          }
        ),
        PBT_CONFIG
      );
    });

  });
});
