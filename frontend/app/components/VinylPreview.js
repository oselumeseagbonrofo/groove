'use client';

/**
 * VinylPreview - Real-time vinyl preview with selected color and image
 * Updates preview on customization changes
 * Requirements: 4.2
 * 
 * @param {Object} props
 * @param {string} props.color - Selected vinyl label color (hex)
 * @param {Object|null} props.image - Selected image object { url, gradient, name }
 * @param {string} props.playlistName - Name of the playlist being created
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'lg')
 */
export default function VinylPreview({
  color = '#4A2C6D',
  image = null,
  playlistName = '',
  size = 'lg'
}) {
  // Size configurations - Responsive for mobile/tablet/desktop
  const sizeClasses = {
    sm: 'w-28 h-28 sm:w-32 sm:h-32',
    md: 'w-36 h-36 sm:w-40 sm:h-40',
    lg: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56'
  };

  const labelSizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm sm:text-base md:text-lg'
  };

  // Get the first letter of playlist name for display
  const displayLetter = playlistName ? playlistName.charAt(0).toUpperCase() : 'G';

  // Determine what to show in the label
  const hasImage = image?.url || image?.previewUrl;
  const hasGradient = image?.gradient;

  return (
    <div className="flex flex-col items-center">
      {/* Vinyl Record */}
      <div 
        className={`${sizeClasses[size]} rounded-full shadow-2xl relative`}
        style={{ backgroundColor: '#1a1a1a' }}
        role="img"
        aria-label={`Vinyl preview for ${playlistName || 'new playlist'}`}
      >
        {/* Vinyl Grooves Texture */}
        <div className="absolute inset-2 rounded-full border border-gray-700 opacity-40" />
        <div className="absolute inset-4 rounded-full border border-gray-700 opacity-35" />
        <div className="absolute inset-6 rounded-full border border-gray-700 opacity-30" />
        <div className="absolute inset-8 rounded-full border border-gray-700 opacity-25" />
        <div className="absolute inset-10 rounded-full border border-gray-700 opacity-20" />
        
        {/* Vinyl Shine Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent" />
        
        {/* Center Label */}
        <div 
          className={`absolute inset-0 m-auto ${labelSizeClasses[size]} rounded-full overflow-hidden shadow-inner flex items-center justify-center transition-all duration-200`}
          style={{ backgroundColor: hasImage || hasGradient ? undefined : color }}
        >
          {hasImage ? (
            /* Display selected image */
            <img 
              src={image.url || image.previewUrl} 
              alt={image.name || 'Custom label'}
              className="w-full h-full object-cover"
            />
          ) : hasGradient ? (
            /* Display gradient preset */
            <div 
              className={`w-full h-full bg-gradient-to-br ${image.gradient} flex items-center justify-center`}
            >
              <span className={`text-white font-bold ${textSizeClasses[size]}`}>
                {displayLetter}
              </span>
            </div>
          ) : (
            /* Display color with letter */
            <span className={`text-white font-bold ${textSizeClasses[size]}`}>
              {displayLetter}
            </span>
          )}
        </div>
        
        {/* Center Spindle Hole */}
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
      </div>

      {/* Playlist Name Display */}
      {playlistName && (
        <p className="mt-4 text-sm text-gray-600 font-medium text-center max-w-48 truncate">
          {playlistName}
        </p>
      )}
    </div>
  );
}
