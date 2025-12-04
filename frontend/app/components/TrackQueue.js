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
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-white font-semibold mb-2">Up Next</h3>
        <p className="text-white/60 text-sm">No tracks in queue</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Up Next</h3>
        {hasMoreTracks && (
          <button
            onClick={onViewAll}
            className="text-teal-primary text-sm font-medium hover:text-teal-primary/80 transition-colors"
          >
            View All
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {visibleTracks.map((track, index) => {
          const actualIndex = currentIndex + index;
          const isCurrent = index === 0;

          return (
            <li key={track.id || actualIndex}>
              <button
                onClick={() => onTrackSelect(actualIndex)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  isCurrent 
                    ? 'bg-white/20' 
                    : 'hover:bg-white/10'
                }`}
              >
                {/* Track Number or Playing Indicator */}
                <span className={`w-6 text-center text-sm ${
                  isCurrent ? 'text-teal-primary' : 'text-white/50'
                }`}>
                  {isCurrent ? (
                    <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    actualIndex + 1
                  )}
                </span>

                {/* Track Info */}
                <div className="flex-1 min-w-0 text-left">
                  <p className={`text-sm font-medium truncate ${
                    isCurrent ? 'text-white' : 'text-white/90'
                  }`}>
                    {track.name || 'Unknown Track'}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {track.artist || 'Unknown Artist'}
                  </p>
                </div>

                {/* Duration */}
                {track.duration && (
                  <span className="text-xs text-white/50">
                    {formatDuration(track.duration)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {hasMoreTracks && (
        <p className="text-white/50 text-xs mt-3 text-center">
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
