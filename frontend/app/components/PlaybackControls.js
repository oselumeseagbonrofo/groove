'use client';

/**
 * PlaybackControls - Play/Pause/Skip buttons for playback control
 * Requirements: 3.2, 3.3, 3.5, 3.6
 * 
 * @param {Object} props
 * @param {boolean} props.isPlaying - Whether playback is active
 * @param {number} props.currentTime - Current playback position in seconds
 * @param {Function} props.onPlay - Callback when play is pressed
 * @param {Function} props.onPause - Callback when pause is pressed
 * @param {Function} props.onSkipForward - Callback when skip forward is pressed
 * @param {Function} props.onSkipBackward - Callback when skip backward is pressed (receives shouldRestart boolean)
 */
export default function PlaybackControls({
  isPlaying = false,
  currentTime = 0,
  onPlay = () => {},
  onPause = () => {},
  onSkipForward = () => {},
  onSkipBackward = () => {}
}) {
  /**
   * Property 7: Skip Backward Behavior
   * For any playback state, tapping skip backward SHALL:
   * (a) restart the current track if elapsed time > 3 seconds, or
   * (b) go to the previous track if elapsed time <= 3 seconds
   */
  const handleSkipBackward = () => {
    const shouldRestart = currentTime > 3;
    onSkipBackward(shouldRestart);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
      {/* Skip Backward Button - Touch-friendly minimum 44px */}
      <button
        onClick={handleSkipBackward}
        className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 active:scale-95 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/50 touch-target"
        aria-label="Skip backward"
      >
        <svg 
          className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Play/Pause Button - Larger touch target for primary action */}
      <button
        onClick={handlePlayPause}
        className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-teal-primary hover:bg-teal-primary/90 active:bg-teal-primary/80 active:scale-95 flex items-center justify-center transition-all duration-150 shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-primary/50 focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          /* Pause Icon */
          <svg 
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          /* Play Icon */
          <svg 
            className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white ml-1" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Skip Forward Button - Touch-friendly minimum 44px */}
      <button
        onClick={onSkipForward}
        className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 active:scale-95 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/50 touch-target"
        aria-label="Skip forward"
      >
        <svg 
          className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>
  );
}
