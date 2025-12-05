'use client';

/**
 * TrackQueue - List of tracks with current track highlighting
 * Requirements: 3.7, 3.8
 * 
 * Property 8: Track Queue Completeness
 * For any playing playlist, the track queue display SHALL contain all tracks
 * from the current track index to the end of the playlist, each showing
 * track name and artist.
 * 
 * @param {Object} props
 * @param {Array} props.tracks - Array of track objects
 * @param {number} props.currentIndex - Index of currently playing track
 * @param {Function} props.onTrackSelect - Callback when a track is selected
 * @param {Function} props.onViewAll - Callback when "View All" is pressed
 * @param {number} props.maxVisible - Maximum tracks to show before "View All" (default 5)
 */
export default function TrackQueue({
  tracks = [],
  currentIndex = 0,
  onTrackSelect = () => {},
  onViewAll = () => {},
  maxVisible = 5
}) {
  // Get tracks from current index to end (the queue)
  const queuedTracks = tracks.slice(currentIndex);
  const visibleTracks = queuedTracks.slice(0, maxVisible);
  const hasMoreTracks = queuedTracks.length > maxVisible;

  if (tracks.length === 0) {
    return (
      <div className="backdrop-blur-sm rounded-xl p-3 sm:p-4 mx-auto max-w-md" style={{ backgroundColor: 'rgba(150, 39, 157, 0.3)' }}>
        <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">Up Next</h3>
        <p className="text-white/60 text-xs sm:text-sm">No tracks in queue</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-sm rounded-xl p-3 sm:p-4 mx-auto max-w-md" style={{ backgroundColor: 'rgba(150, 39, 157, 0.3)' }}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-white font-semibold text-sm sm:text-base">Up Next</h3>
        {hasMoreTracks && (
          <button
            onClick={onViewAll}
            className="text-teal-primary text-xs sm:text-sm font-medium hover:text-teal-primary/80 active:text-teal-primary/70 transition-colors touch-target px-2 py-1"
          >
            View All
          </button>
        )}
      </div>

      <ul className="space-y-1 sm:space-y-2">
        {visibleTracks.map((track, index) => {
          const actualIndex = currentIndex + index;
          const isCurrent = index === 0;

          return (
            <li key={track.id || actualIndex}>
              <button
                onClick={() => onTrackSelect(actualIndex)}
                className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg transition-colors touch-target ${
                  isCurrent 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10 active:bg-white/15'
                }`}
              >
                {/* Track Number or Playing Indicator */}
                <span className={`w-5 sm:w-6 text-center text-xs sm:text-sm flex-shrink-0 ${
                  isCurrent ? '' : 'text-white/50'
                }`} style={isCurrent ? { color: '#96279d' } : {}}>
                  {isCurrent ? (
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    actualIndex + 1
                  )}
                </span>

                {/* Track Info */}
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-xs sm:text-sm font-medium truncate ${
                    isCurrent ? 'text-white' : 'text-white/90'
                  }`}>
                    {track.name || 'Unknown Track'}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {track.artist || 'Unknown Artist'}
                  </p>
                </div>

                {/* Duration - Hidden on very small screens */}
                {track.duration && (
                  <span className="text-xs text-white/50 hidden xs:block flex-shrink-0">
                    {formatDuration(track.duration)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {hasMoreTracks && (
        <p className="text-white/50 text-xs mt-2 sm:mt-3 text-center">
          +{queuedTracks.length - maxVisible} more tracks
        </p>
      )}
    </div>
  );
}

/**
 * Format duration from milliseconds to mm:ss
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration string
 */
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
