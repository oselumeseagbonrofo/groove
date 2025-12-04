'use client';

/**
 * VinylRecord - Individual vinyl representation for My Shelf
 * Renders vinyl with black outer ring, grooves texture, and center label
 * Requirements: 2.2, 2.3
 * 
 * @param {Object} props
 * @param {Object} props.playlist - Playlist data object
 * @param {string} props.playlist.id - Playlist ID
 * @param {string} props.playlist.name - Playlist name
 * @param {string|null} props.playlist.coverImage - Cover image URL
 * @param {string|null} props.vinylColor - Custom vinyl color (hex)
 * @param {string|null} props.customImageUrl - Custom label image URL
 * @param {Function} props.onClick - Click handler for navigation
 */
export default function VinylRecord({
  playlist = {},
  vinylColor = null,
  customImageUrl = null,
  onClick = () => {}
}) {
  // Determine the label image: custom image > playlist cover > default Groove logo
  const labelImage = customImageUrl || playlist?.coverImage || null;
  
  // Determine vinyl color (default to black)
  const recordColor = vinylColor || '#1a1a1a';

  /**
   * Property 3: Default Cover Fallback
   * When a playlist has no cover image (coverImage is null or undefined),
   * the VinylRecord component SHALL display the default Groove logo design.
   */
  const hasValidCover = labelImage !== null && labelImage !== undefined;

  return (
    <button
      onClick={() => onClick(playlist)}
      className="group relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 cursor-pointer transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-primary focus:ring-offset-2 rounded-full"
      aria-label={`Play ${playlist?.name || 'playlist'}`}
    >
      {/* Vinyl Record Outer Ring */}
      <div 
        className="absolute inset-0 rounded-full shadow-lg"
        style={{ backgroundColor: recordColor }}
      >
        {/* Vinyl Grooves Texture */}
        <div className="absolute inset-1 rounded-full border border-gray-700 opacity-40" />
        <div className="absolute inset-2 rounded-full border border-gray-700 opacity-35" />
        <div className="absolute inset-3 rounded-full border border-gray-700 opacity-30" />
        <div className="absolute inset-4 rounded-full border border-gray-700 opacity-25" />
        <div className="absolute inset-5 rounded-full border border-gray-700 opacity-20" />
        <div className="absolute inset-6 rounded-full border border-gray-700 opacity-15" />
        
        {/* Vinyl Shine Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Center Label */}
        <div className="absolute inset-0 m-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden shadow-inner">
          {hasValidCover ? (
            <img 
              src={labelImage} 
              alt={playlist?.name || 'Playlist cover'}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Default Groove Logo Design - Requirements: 2.3 */
            <div className="w-full h-full bg-gradient-to-br from-purple-medium to-lavender flex items-center justify-center">
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold">G</span>
            </div>
          )}
        </div>
        
        {/* Center Spindle Hole */}
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-gray-800 shadow-inner" />
      </div>
      
      {/* Playlist Name Tooltip on Hover */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <span className="text-xs text-gray-700 whitespace-nowrap max-w-24 truncate block text-center">
          {playlist?.name || 'Untitled'}
        </span>
      </div>
    </button>
  );
}
