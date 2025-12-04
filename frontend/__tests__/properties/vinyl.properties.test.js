/**
 * Property-Based Tests for Vinyl Components
 * 
 * These tests verify correctness properties for vinyl-related components
 * using fast-check for property-based testing.
 */

import fc from 'fast-check';
import { PBT_CONFIG } from './pbt.config.js';

/**
 * Calculate the next track index after skip forward
 * This is the core logic for Property 6: Skip Forward Track Advancement
 * 
 * @param {number} currentIndex - Current track index (0-based)
 * @param {number} totalTracks - Total number of tracks in playlist
 * @returns {number} Next track index (wraps to 0 at end)
 */
function calculateSkipForwardIndex(currentIndex, totalTracks) {
  if (totalTracks <= 0) return 0;
  return (currentIndex + 1) % totalTracks;
}

/**
 * Get the track queue from current index to end of playlist
 * This is the core logic for Property 8: Track Queue Completeness
 * 
 * @param {Array} tracks - Array of track objects
 * @param {number} currentIndex - Current track index (0-based)
 * @returns {Array} Array of tracks from currentIndex to end
 */
function getTrackQueue(tracks, currentIndex) {
  if (!Array.isArray(tracks) || tracks.length === 0) return [];
  const validIndex = Math.max(0, Math.min(currentIndex, tracks.length - 1));
  return tracks.slice(validIndex);
}

/**
 * Check if a track has required display properties (name and artist)
 * This validates that each track in the queue shows the required info
 * 
 * @param {Object} track - Track object
 * @returns {boolean} True if track has name and artist properties
 */
function trackHasRequiredDisplayInfo(track) {
  return track !== null && 
         track !== undefined &&
         typeof track === 'object' &&
         'name' in track &&
         'artist' in track;
}

/**
 * Determine skip backward behavior based on elapsed time
 * This is the core logic for Property 7: Skip Backward Behavior
 * 
 * For any playback state, tapping skip backward SHALL:
 * (a) restart the current track if elapsed time > 3 seconds, or
 * (b) go to the previous track if elapsed time <= 3 seconds
 * 
 * @param {number} currentTime - Current playback position in seconds
 * @returns {boolean} shouldRestart - true to restart current track, false to go to previous
 */
function calculateSkipBackwardBehavior(currentTime) {
  return currentTime > 3;
}

/**
 * Calculate seek time from position percentage and track duration
 * This is the core mapping function for Property 5: Seek Position Mapping
 * 
 * @param {number} positionPercent - Position percentage (0-100)
 * @param {number} durationMs - Track duration in milliseconds
 * @returns {number} Seek time in milliseconds
 */
function calculateSeekTime(positionPercent, durationMs) {
  // Clamp position to valid range
  const clampedPosition = Math.max(0, Math.min(100, positionPercent));
  return Math.floor((clampedPosition / 100) * durationMs);
}

/**
 * Calculate seek percentage from normalized distance on vinyl
 * Maps the seekable area (0.3-1.0 from center) to progress (0-100)
 * This mirrors the logic in VinylTurntable component
 * 
 * @param {number} normalizedDistance - Distance from center (0-1)
 * @returns {number|null} Seek percentage (0-100) or null if in label area
 */
function calculateSeekPercentageFromDistance(normalizedDistance) {
  // Inner 30% is the label, not seekable
  if (normalizedDistance < 0.3) return null;
  
  // Map the seekable area (0.3-1.0) to progress (0-100)
  const seekableRange = normalizedDistance - 0.3;
  const seekPercentage = Math.min(100, Math.max(0, (seekableRange / 0.7) * 100));
  
  return seekPercentage;
}

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

/**
 * Helper function to get the vinyl label image for VinylTurntable
 * This mirrors the logic in VinylTurntable component:
 * const coverImage = playlist?.coverImage || currentTrack?.albumArt || null;
 * 
 * @param {Object|null} playlist - Playlist object with optional coverImage
 * @param {Object|null} currentTrack - Current track with optional albumArt
 * @returns {string|null} The cover image URL or null
 */
function getVinylLabelImage(playlist, currentTrack) {
  return playlist?.coverImage || currentTrack?.albumArt || null;
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

  /**
   * **Feature: vinyl-spotify-player, Property 4: Vinyl Label Display**
   * 
   * For any playlist with a valid cover image, when displayed on the Now Playing screen,
   * the vinyl record label SHALL show that cover image.
   * 
   * **Validates: Requirements 3.1**
   */
  describe('Property 4: Vinyl Label Display', () => {
    // Arbitrary for valid image URLs
    const validImageUrlArb = fc.oneof(
      fc.webUrl(),
      fc.constant('https://i.scdn.co/image/abc123'),
      fc.constant('https://images.spotify.com/cover.png'),
      fc.constant('https://example.com/album.jpg')
    );

    // Arbitrary for playlist with valid cover image
    const playlistWithCoverArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      coverImage: validImageUrlArb,
      trackCount: fc.nat({ max: 1000 })
    });

    // Arbitrary for playlist without cover image
    const playlistWithoutCoverArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      coverImage: fc.constantFrom(null, undefined),
      trackCount: fc.nat({ max: 1000 })
    });

    // Arbitrary for track with album art
    const trackWithAlbumArtArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      artist: fc.string({ minLength: 1, maxLength: 100 }),
      albumArt: validImageUrlArb,
      duration: fc.integer({ min: 1000, max: 600000 })
    });

    // Arbitrary for track without album art
    const trackWithoutAlbumArtArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      artist: fc.string({ minLength: 1, maxLength: 100 }),
      albumArt: fc.constantFrom(null, undefined),
      duration: fc.integer({ min: 1000, max: 600000 })
    });

    it('should display playlist cover image as vinyl label when playlist has valid cover', () => {
      fc.assert(
        fc.property(
          playlistWithCoverArb,
          fc.option(trackWithoutAlbumArtArb, { nil: null }),
          (playlist, currentTrack) => {
            const labelImage = getVinylLabelImage(playlist, currentTrack);
            // When playlist has a valid cover image, it should be used as the label
            return labelImage === playlist.coverImage;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should fall back to track album art when playlist has no cover image', () => {
      fc.assert(
        fc.property(
          playlistWithoutCoverArb,
          trackWithAlbumArtArb,
          (playlist, currentTrack) => {
            const labelImage = getVinylLabelImage(playlist, currentTrack);
            // When playlist has no cover, should fall back to track's album art
            return labelImage === currentTrack.albumArt;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should prioritize playlist cover over track album art when both exist', () => {
      fc.assert(
        fc.property(
          playlistWithCoverArb,
          trackWithAlbumArtArb,
          (playlist, currentTrack) => {
            const labelImage = getVinylLabelImage(playlist, currentTrack);
            // Playlist cover should take priority over track album art
            return labelImage === playlist.coverImage;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return null (show default logo) when neither playlist nor track has image', () => {
      fc.assert(
        fc.property(
          playlistWithoutCoverArb,
          fc.option(trackWithoutAlbumArtArb, { nil: null }),
          (playlist, currentTrack) => {
            const labelImage = getVinylLabelImage(playlist, currentTrack);
            // Should return null, triggering default Groove logo display
            return labelImage === null;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle null playlist gracefully and use track album art', () => {
      fc.assert(
        fc.property(
          trackWithAlbumArtArb,
          (currentTrack) => {
            const labelImage = getVinylLabelImage(null, currentTrack);
            // When playlist is null, should use track's album art
            return labelImage === currentTrack.albumArt;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return null when both playlist and track are null', () => {
      const labelImage = getVinylLabelImage(null, null);
      expect(labelImage).toBeNull();
    });
  });

  /**
   * **Feature: vinyl-spotify-player, Property 5: Seek Position Mapping**
   * 
   * For any drag/scrub position on the vinyl record (0-100%), the seek position
   * SHALL map proportionally to the current track's duration (position% * duration = seekTime).
   * 
   * **Validates: Requirements 3.4**
   */
  describe('Property 5: Seek Position Mapping', () => {
    it('should map seek position percentage proportionally to track duration', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // position percentage
          fc.integer({ min: 1000, max: 600000 }), // duration in ms (1 second to 10 minutes)
          (positionPercent, durationMs) => {
            const seekTime = calculateSeekTime(positionPercent, durationMs);
            const expectedSeekTime = Math.floor((positionPercent / 100) * durationMs);
            return seekTime === expectedSeekTime;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should clamp position percentage to valid range (0-100)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: 1000 }), // any integer including out of range
          fc.integer({ min: 1000, max: 600000 }), // duration in ms
          (positionPercent, durationMs) => {
            const seekTime = calculateSeekTime(positionPercent, durationMs);
            // Seek time should always be within valid bounds
            return seekTime >= 0 && seekTime <= durationMs;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return 0 when position is 0%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 600000 }), // duration in ms
          (durationMs) => {
            const seekTime = calculateSeekTime(0, durationMs);
            return seekTime === 0;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return duration when position is 100%', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 600000 }), // duration in ms
          (durationMs) => {
            const seekTime = calculateSeekTime(100, durationMs);
            return seekTime === durationMs;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return null for positions in the label area (< 30% from center)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 0.29, noNaN: true }), // normalized distance in label area
          (normalizedDistance) => {
            const seekPercentage = calculateSeekPercentageFromDistance(normalizedDistance);
            return seekPercentage === null;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should map seekable area (30%-100% from center) to 0-100% progress', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.3, max: 1.0, noNaN: true }), // normalized distance in seekable area
          (normalizedDistance) => {
            const seekPercentage = calculateSeekPercentageFromDistance(normalizedDistance);
            // Should return a valid percentage between 0 and 100
            return seekPercentage !== null && seekPercentage >= 0 && seekPercentage <= 100;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return 0% at the boundary of label area (30% from center)', () => {
      const seekPercentage = calculateSeekPercentageFromDistance(0.3);
      expect(seekPercentage).toBeCloseTo(0, 5);
    });

    it('should return 100% at the edge of vinyl (100% from center)', () => {
      const seekPercentage = calculateSeekPercentageFromDistance(1.0);
      expect(seekPercentage).toBeCloseTo(100, 5);
    });

    it('should map 50% of seekable area to approximately 50% progress', () => {
      // 50% of seekable area is at 0.3 + (0.7 * 0.5) = 0.65 from center
      const seekPercentage = calculateSeekPercentageFromDistance(0.65);
      expect(seekPercentage).toBeCloseTo(50, 5);
    });

    it('should maintain monotonic relationship between distance and seek percentage', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.3, max: 0.99, noNaN: true }), // first distance
          fc.double({ min: 0.01, max: 0.1, noNaN: true }), // delta (positive increment)
          (distance1, delta) => {
            const distance2 = Math.min(1.0, distance1 + delta);
            const seek1 = calculateSeekPercentageFromDistance(distance1);
            const seek2 = calculateSeekPercentageFromDistance(distance2);
            // Greater distance should result in greater or equal seek percentage
            return seek1 !== null && seek2 !== null && seek2 >= seek1;
          }
        ),
        PBT_CONFIG
      );
    });
  });

  /**
   * **Feature: vinyl-spotify-player, Property 7: Skip Backward Behavior**
   * 
   * For any playback state, tapping skip backward SHALL:
   * (a) restart the current track if elapsed time > 3 seconds, or
   * (b) go to the previous track if elapsed time <= 3 seconds.
   * 
   * **Validates: Requirements 3.6**
   */
  describe('Property 7: Skip Backward Behavior', () => {
    it('should restart current track when elapsed time is greater than 3 seconds', () => {
      fc.assert(
        fc.property(
          // Generate elapsed time > 3 seconds (up to 10 minutes = 600 seconds)
          fc.double({ min: 3.001, max: 600, noNaN: true }),
          (currentTime) => {
            const shouldRestart = calculateSkipBackwardBehavior(currentTime);
            // When elapsed time > 3 seconds, should restart current track
            return shouldRestart === true;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should go to previous track when elapsed time is 3 seconds or less', () => {
      fc.assert(
        fc.property(
          // Generate elapsed time <= 3 seconds (including 0)
          fc.double({ min: 0, max: 3, noNaN: true }),
          (currentTime) => {
            const shouldRestart = calculateSkipBackwardBehavior(currentTime);
            // When elapsed time <= 3 seconds, should go to previous track
            return shouldRestart === false;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle boundary case at exactly 3 seconds (go to previous)', () => {
      const shouldRestart = calculateSkipBackwardBehavior(3);
      // At exactly 3 seconds, should go to previous track (not restart)
      expect(shouldRestart).toBe(false);
    });

    it('should handle boundary case just above 3 seconds (restart)', () => {
      const shouldRestart = calculateSkipBackwardBehavior(3.001);
      // Just above 3 seconds, should restart current track
      expect(shouldRestart).toBe(true);
    });

    it('should handle zero elapsed time (go to previous)', () => {
      const shouldRestart = calculateSkipBackwardBehavior(0);
      // At 0 seconds, should go to previous track
      expect(shouldRestart).toBe(false);
    });

    it('should return boolean for any valid elapsed time', () => {
      fc.assert(
        fc.property(
          // Any non-negative elapsed time
          fc.double({ min: 0, max: 600, noNaN: true }),
          (currentTime) => {
            const shouldRestart = calculateSkipBackwardBehavior(currentTime);
            // Result should always be a boolean
            return typeof shouldRestart === 'boolean';
          }
        ),
        PBT_CONFIG
      );
    });

    it('should have consistent behavior across the threshold boundary', () => {
      fc.assert(
        fc.property(
          // Generate pairs of times: one just below and one just above 3 seconds
          fc.double({ min: 0, max: 2.999, noNaN: true }),
          fc.double({ min: 3.001, max: 6, noNaN: true }),
          (timeBelowThreshold, timeAboveThreshold) => {
            const belowResult = calculateSkipBackwardBehavior(timeBelowThreshold);
            const aboveResult = calculateSkipBackwardBehavior(timeAboveThreshold);
            // Below threshold should NOT restart, above threshold SHOULD restart
            return belowResult === false && aboveResult === true;
          }
        ),
        PBT_CONFIG
      );
    });
  });

  /**
   * **Feature: vinyl-spotify-player, Property 8: Track Queue Completeness**
   * 
   * For any playing playlist, the track queue display SHALL contain all tracks
   * from the current track index to the end of the playlist, each showing
   * track name and artist.
   * 
   * **Validates: Requirements 3.7**
   */
  describe('Property 8: Track Queue Completeness', () => {
    // Arbitrary for a valid track with required display properties
    const trackArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 100 }),
      artist: fc.string({ minLength: 1, maxLength: 100 }),
      album: fc.string({ minLength: 0, maxLength: 100 }),
      duration: fc.integer({ min: 1000, max: 600000 }),
      albumArt: fc.option(fc.webUrl(), { nil: null })
    });

    // Arbitrary for a playlist with tracks (1-50 tracks)
    const playlistTracksArb = fc.array(trackArb, { minLength: 1, maxLength: 50 });

    it('should return all tracks from current index to end of playlist', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          fc.nat(), // currentIndex (will be clamped to valid range)
          (tracks, rawIndex) => {
            // Clamp index to valid range
            const currentIndex = rawIndex % tracks.length;
            const queue = getTrackQueue(tracks, currentIndex);
            
            // Queue should contain exactly (tracks.length - currentIndex) tracks
            const expectedLength = tracks.length - currentIndex;
            return queue.length === expectedLength;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should preserve track order from current index to end', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          fc.nat(),
          (tracks, rawIndex) => {
            const currentIndex = rawIndex % tracks.length;
            const queue = getTrackQueue(tracks, currentIndex);
            
            // Each track in queue should match the corresponding track in original array
            return queue.every((track, queueIndex) => {
              const originalIndex = currentIndex + queueIndex;
              return track === tracks[originalIndex];
            });
          }
        ),
        PBT_CONFIG
      );
    });

    it('should ensure every track in queue has name and artist properties', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          fc.nat(),
          (tracks, rawIndex) => {
            const currentIndex = rawIndex % tracks.length;
            const queue = getTrackQueue(tracks, currentIndex);
            
            // Every track in the queue must have name and artist
            return queue.every(track => trackHasRequiredDisplayInfo(track));
          }
        ),
        PBT_CONFIG
      );
    });

    it('should include current track as first item in queue', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          fc.nat(),
          (tracks, rawIndex) => {
            const currentIndex = rawIndex % tracks.length;
            const queue = getTrackQueue(tracks, currentIndex);
            
            // First track in queue should be the current track
            return queue.length > 0 && queue[0] === tracks[currentIndex];
          }
        ),
        PBT_CONFIG
      );
    });

    it('should include last track of playlist as last item in queue when starting from index 0', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          (tracks) => {
            const queue = getTrackQueue(tracks, 0);
            
            // When starting from 0, last track in queue should be last track in playlist
            return queue.length === tracks.length && 
                   queue[queue.length - 1] === tracks[tracks.length - 1];
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return single track when current index is at last track', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          (tracks) => {
            const lastIndex = tracks.length - 1;
            const queue = getTrackQueue(tracks, lastIndex);
            
            // Queue should contain only the last track
            return queue.length === 1 && queue[0] === tracks[lastIndex];
          }
        ),
        PBT_CONFIG
      );
    });

    it('should return empty array for empty playlist', () => {
      const queue = getTrackQueue([], 0);
      expect(queue).toEqual([]);
    });

    it('should handle index beyond playlist length by clamping to last track', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          fc.integer({ min: 100, max: 1000 }), // index way beyond playlist length
          (tracks, largeIndex) => {
            const queue = getTrackQueue(tracks, largeIndex);
            
            // Should clamp to last valid index and return at least the last track
            return queue.length >= 1 && queue[0] === tracks[tracks.length - 1];
          }
        ),
        PBT_CONFIG
      );
    });

    it('should handle negative index by treating as 0', () => {
      fc.assert(
        fc.property(
          playlistTracksArb,
          fc.integer({ min: -1000, max: -1 }), // negative indices
          (tracks, negativeIndex) => {
            const queue = getTrackQueue(tracks, negativeIndex);
            
            // Should treat negative as 0 and return all tracks
            return queue.length === tracks.length && queue[0] === tracks[0];
          }
        ),
        PBT_CONFIG
      );
    });
  });

  /**
   * **Feature: vinyl-spotify-player, Property 12: Track Info Display**
   * 
   * For any currently playing track, the Now Playing screen SHALL display
   * the track's name and artist properties in the info section below the turntable.
   * 
   * **Validates: Requirements 5.1**
   */
  describe('Property 12: Track Info Display', () => {
    /**
     * Get the display info for a track
     * This mirrors the logic in TrackInfo component
     * 
     * @param {Object|null} track - Track object
     * @returns {Object} Display info with name and artist
     */
    function getTrackDisplayInfo(track) {
      if (!track) {
        return { name: null, artist: null, hasTrack: false };
      }
      return {
        name: track.name || 'Unknown Track',
        artist: track.artist || 'Unknown Artist',
        hasTrack: true
      };
    }

    // Arbitrary for a valid track with name and artist
    const validTrackArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 200 }),
      artist: fc.string({ minLength: 1, maxLength: 200 }),
      album: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
      duration: fc.integer({ min: 1000, max: 600000 }),
      albumArt: fc.option(fc.webUrl(), { nil: null })
    });

    // Arbitrary for track with missing name
    const trackWithoutNameArb = fc.record({
      id: fc.uuid(),
      name: fc.constantFrom(null, undefined, ''),
      artist: fc.string({ minLength: 1, maxLength: 200 }),
      album: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
      duration: fc.integer({ min: 1000, max: 600000 })
    });

    // Arbitrary for track with missing artist
    const trackWithoutArtistArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 200 }),
      artist: fc.constantFrom(null, undefined, ''),
      album: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: null }),
      duration: fc.integer({ min: 1000, max: 600000 })
    });

    it('should display track name for any valid track', () => {
      fc.assert(
        fc.property(
          validTrackArb,
          (track) => {
            const displayInfo = getTrackDisplayInfo(track);
            // Track name should be displayed and match the track's name
            return displayInfo.hasTrack === true && displayInfo.name === track.name;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should display artist name for any valid track', () => {
      fc.assert(
        fc.property(
          validTrackArb,
          (track) => {
            const displayInfo = getTrackDisplayInfo(track);
            // Artist name should be displayed and match the track's artist
            return displayInfo.hasTrack === true && displayInfo.artist === track.artist;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should display both name and artist for any valid track', () => {
      fc.assert(
        fc.property(
          validTrackArb,
          (track) => {
            const displayInfo = getTrackDisplayInfo(track);
            // Both name and artist should be present and match
            return displayInfo.hasTrack === true &&
                   displayInfo.name === track.name &&
                   displayInfo.artist === track.artist;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should show "Unknown Track" when track name is missing', () => {
      fc.assert(
        fc.property(
          trackWithoutNameArb,
          (track) => {
            const displayInfo = getTrackDisplayInfo(track);
            // Should fall back to "Unknown Track" for missing/empty name
            return displayInfo.name === 'Unknown Track';
          }
        ),
        PBT_CONFIG
      );
    });

    it('should show "Unknown Artist" when artist is missing', () => {
      fc.assert(
        fc.property(
          trackWithoutArtistArb,
          (track) => {
            const displayInfo = getTrackDisplayInfo(track);
            // Should fall back to "Unknown Artist" for missing/empty artist
            return displayInfo.artist === 'Unknown Artist';
          }
        ),
        PBT_CONFIG
      );
    });

    it('should indicate no track when track is null', () => {
      const displayInfo = getTrackDisplayInfo(null);
      expect(displayInfo.hasTrack).toBe(false);
      expect(displayInfo.name).toBeNull();
      expect(displayInfo.artist).toBeNull();
    });

    it('should indicate no track when track is undefined', () => {
      const displayInfo = getTrackDisplayInfo(undefined);
      expect(displayInfo.hasTrack).toBe(false);
      expect(displayInfo.name).toBeNull();
      expect(displayInfo.artist).toBeNull();
    });

    it('should preserve track name exactly as provided (no truncation in logic)', () => {
      fc.assert(
        fc.property(
          // Generate tracks with various name lengths
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 500 }), // Long names
            artist: fc.string({ minLength: 1, maxLength: 200 }),
            duration: fc.integer({ min: 1000, max: 600000 })
          }),
          (track) => {
            const displayInfo = getTrackDisplayInfo(track);
            // Name should be preserved exactly (UI truncation is separate concern)
            return displayInfo.name === track.name;
          }
        ),
        PBT_CONFIG
      );
    });

    it('should preserve artist name exactly as provided (no truncation in logic)', () => {
      fc.assert(
        fc.property(
          // Generate tracks with various artist name lengths
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 200 }),
            artist: fc.string({ minLength: 1, maxLength: 500 }), // Long artist names
            duration: fc.integer({ min: 1000, max: 600000 })
          }),
          (track) => {
            const displayInfo = getTrackDisplayInfo(track);
            // Artist should be preserved exactly (UI truncation is separate concern)
            return displayInfo.artist === track.artist;
          }
        ),
        PBT_CONFIG
      );
    });
  });
});
