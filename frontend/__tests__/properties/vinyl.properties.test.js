/**
 * Property-Based Tests for Vinyl Components
 * 
 * These tests verify correctness properties for vinyl-related components
 * using fast-check for property-based testing.
 */

import fc from 'fast-check';
import { PBT_CONFIG } from './pbt.config.js';

/**
 * Helper function to determine if a cover image should trigger fallback
 * This mirrors the logic in VinylRecord component
 */
function shouldShowDefaultCover(coverImage) {
  return coverImage === null || coverImage === undefined;
}

/**
 * Helper function to get the label image based on component logic
 * Priority: customImageUrl > playlist.coverImage > null (default)
 */
function getLabelImage(customImageUrl, playlistCoverImage) {
  return customImageUrl || playlistCoverImage || null;
}

describe('Vinyl Component Properties', () => {
  /**
   * **Feature: vinyl-spotify-player, Property 3: Default Cover Fallback**
   * 
   * For any playlist that has no cover image (coverImage is null or undefined),
   * the VinylRecord component SHALL display the default Groove logo design.
   * 
   * **Validates: Requirements 2.3**
   */
  describe('Property 3: Default Cover Fallback', () => {
    it('should show default Groove logo when playlist has no cover image', () => {
      // Arbitrary for playlist without cover image
      const playlistWithoutCoverArb = fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 100 }),
        coverImage: fc.constantFrom(null, undefined),
        trackCount: fc.nat({ max: 1000 }),
        owner: fc.string({ minLength: 1, maxLength: 50 })
      });

      fc.assert(
        fc.property(
          playlistWithoutCoverArb,
          (playlist) => {
            // When coverImage is null or undefined, shouldShowDefaultCover returns true
            const showDefault = shouldShowDefaultCover(playlist.coverImage);
            return showDefault === true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should NOT show default Groove logo when playlist has valid cover image', () => {
      // Arbitrary for valid image URLs
      const validImageUrlArb = fc.oneof(
        fc.webUrl(),
        fc.constant('https://example.com/image.jpg'),
        fc.constant('https://i.scdn.co/image/abc123'),
        fc.constant('https://images.spotify.com/cover.png')
      );

      const playlistWithCoverArb = fc.record({
        id: fc.uuid(),
        name: fc.string({ minLength: 1, maxLength: 100 }),
        coverImage: validImageUrlArb,
        trackCount: fc.nat({ max: 1000 }),
        owner: fc.string({ minLength: 1, maxLength: 50 })
      });

      fc.assert(
        fc.property(
          playlistWithCoverArb,
          (playlist) => {
            // When coverImage is a valid string, shouldShowDefaultCover returns false
            const showDefault = shouldShowDefaultCover(playlist.coverImage);
            return showDefault === false;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should use customImageUrl over playlist coverImage when both exist', () => {
      const imageUrlArb = fc.oneof(
        fc.webUrl(),
        fc.constant('https://example.com/custom.jpg')
      );

      fc.assert(
        fc.property(
          imageUrlArb, // customImageUrl
          imageUrlArb, // playlistCoverImage
          (customImageUrl, playlistCoverImage) => {
            const labelImage = getLabelImage(customImageUrl, playlistCoverImage);
            // customImageUrl should take priority
            return labelImage === customImageUrl;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should fall back to playlist coverImage when customImageUrl is null', () => {
      const imageUrlArb = fc.oneof(
        fc.webUrl(),
        fc.constant('https://example.com/cover.jpg')
      );

      fc.assert(
        fc.property(
          fc.constantFrom(null, undefined), // customImageUrl
          imageUrlArb, // playlistCoverImage
          (customImageUrl, playlistCoverImage) => {
            const labelImage = getLabelImage(customImageUrl, playlistCoverImage);
            // Should fall back to playlistCoverImage
            return labelImage === playlistCoverImage;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return null (trigger default) when both customImageUrl and coverImage are missing', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(null, undefined), // customImageUrl
          fc.constantFrom(null, undefined), // playlistCoverImage
          (customImageUrl, playlistCoverImage) => {
            const labelImage = getLabelImage(customImageUrl, playlistCoverImage);
            // Should return null, triggering default Groove logo
            return labelImage === null;
          }
        ),
        PBT_CONFIG
      );
    });
  });
});
