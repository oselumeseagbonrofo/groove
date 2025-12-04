'use client';

import VinylRecord from './VinylRecord';

/**
 * VinylShelf - Row of vinyl records arranged on wooden shelf
 * Displays playlists as vinyl records with wood texture background
 * Requirements: 2.2, 2.5, 9.3
 * 
 * @param {Object} props
 * @param {Array} props.playlists - Array of playlist objects to display
 * @param {Function} props.onVinylSelect - Callback when a vinyl is clicked
 */
export default function VinylShelf({
  playlists = [],
  onVinylSelect = () => {}
}) {
  // Group playlists into rows (4 per row on desktop, 3 on tablet, 2 on mobile)
  const ITEMS_PER_ROW = 4;
  const rows = [];
  
  for (let i = 0; i < playlists.length; i += ITEMS_PER_ROW) {
    rows.push(playlists.slice(i, i + ITEMS_PER_ROW));
  }

  return (
    <div className="w-full bg-pink-light min-h-screen">
      {/* Shelf Container */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="mb-8">
            {/* Vinyl Records Row */}
            <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap pb-4">
              {row.map((playlist) => (
                <div key={playlist.id} className="flex flex-col items-center">
                  <VinylRecord
                    playlist={playlist}
                    vinylColor={playlist.vinylColor}
                    customImageUrl={playlist.customImageUrl}
                    onClick={onVinylSelect}
                  />
                  {/* Playlist Name Below Vinyl */}
                  <span className="mt-2 text-xs sm:text-sm text-gray-700 text-center max-w-28 sm:max-w-32 truncate">
                    {playlist.name}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Wooden Shelf */}
            <div className="relative h-4 sm:h-5 md:h-6">
              {/* Shelf Top Surface */}
              <div 
                className="absolute inset-0 rounded-sm shadow-md"
                style={{
                  background: 'linear-gradient(180deg, #8B6914 0%, #A0522D 50%, #8B4513 100%)'
                }}
              />
              {/* Wood Grain Texture */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.1) 2px,
                    rgba(0,0,0,0.1) 4px
                  )`
                }}
              />
              {/* Shelf Edge Shadow */}
              <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-black/20 to-transparent" />
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-4xl text-gray-400">♪</span>
            </div>
            <p className="text-gray-500 text-center">
              No playlists yet. Create your first vinyl!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
