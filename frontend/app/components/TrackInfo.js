'use client';

/**
 * TrackInfo - Display current track name, artist, and progress
 * Requirements: 5.1, 5.2
 * 
 * Property 12: Track Info Display
 * For any currently playing track, the Now Playing screen SHALL display
 * the track's name and artist properties in the info section below the turntable.
 * 
 * @param {Object} props
 * @param {Object} props.track - Current track object
 * @param {string} props.track.name - Track name
 * @param {string} props.track.artist - Artist name
 * @param {number} props.progress - Playback progress (0-100)
 * @param {number} props.currentTime - Current playback time in milliseconds
 * @param {number} props.duration - Total track duration in milliseconds
 */
export default function TrackInfo({
  track = null,
  progress = 0,
  currentTime = 0,
  duration = 0
}) {
  if (!track) {
    return (
      <div className="text-center py-3 sm:py-4">
        <p className="text-white/60 text-xs sm:text-sm">No track playing</p>
      </div>
    );
  }

  return (
    <div className="text-center py-3 sm:py-4">
      {/* Track Name - Responsive text sizing */}
      <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate px-3 sm:px-4" style={{ color: '#8C2E96' }}>
        {track.name || 'Unknown Track'}
      </h2>
      
      {/* Artist Name */}
      <p className="text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1 truncate px-3 sm:px-4" style={{ color: '#8C2E96' }}>
        {track.artist || 'Unknown Artist'}
      </p>

      {/* Progress Bar - Touch-friendly height */}
      <div className="mt-3 sm:mt-4 px-3 sm:px-4">
        <div className="relative h-1.5 sm:h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#d3d3d3' }}>
          <div 
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: '#2d1b4e' }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between mt-1.5 sm:mt-2 text-xs" style={{ color: '#2d1b4e' }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Format time from milliseconds to mm:ss
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
