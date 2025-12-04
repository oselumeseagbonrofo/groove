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
      <div className="text-center py-4">
        <p className="text-white/60 text-sm">No track playing</p>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      {/* Track Name */}
      <h2 className="text-white text-lg md:text-xl font-semibold truncate px-4">
        {track.name || 'Unknown Track'}
      </h2>
      
      {/* Artist Name */}
      <p className="text-white/70 text-sm md:text-base mt-1 truncate px-4">
        {track.artist || 'Unknown Artist'}
      </p>

      {/* Progress Bar */}
      <div className="mt-4 px-4">
        <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-teal-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between mt-2 text-xs text-white/50">
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
