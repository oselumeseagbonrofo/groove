'use client';

import VinylRecord from './VinylRecord';

/**
 * VinylShelf - Row of vinyl records arranged on wooden shelf
 * Displays playlists as vinyl records with wood texture background
 * Requirements: 2.2, 2.5, 9.3, 8.1, 8.2, 8.3
 * 
 * Responsive layout:
 * - Mobile (<768px): 2-3 vinyls per row
 * - Tablet (768px-1024px): 3-4 vinyls per row
 * - Desktop (>1024px): 4-5 vinyls per row with larger sizes
 * 
 * @param {Object} props
 * @param {Array} props.playlists - Array of playlist objects to display
 * @param {Function} props.onVinylSelect - Callback when a vinyl is clicked
 */
export default function VinylShelf({
  playlists = [],
  onVinylSelect = () => {}
}) {
  // Responsive items per row based on screen size
  // We use CSS grid for automatic responsive layout
  return (
    <div className="w-full bg-pink-light min-h-screen">
      {/* Shelf Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="flex flex-col items-center">
              <VinylRecord
                playlist={playlist}
                vinylColor={playlist.vinylColor}
                customImageUrl={playlist.customImageUrl}
                onClick={onVinylSelect}
              />
              {/* Playlist Name Below Vinyl */}
              <span className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700 text-center w-full max-w-24 sm:max-w-28 md:max-w-32 truncate px-1">
                {playlist.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Decorative Wooden Shelf Bar - appears after every row on larger screens */}
        {playlists.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="relative h-3 sm:h-4 md:h-5">
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
        )}
        
        {/* Empty State */}
        {playlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-3xl sm:text-4xl text-gray-400">♪</span>
            </div>
            <p className="text-gray-500 text-center text-sm sm:text-base">
              No playlists yet. Create your first vinyl!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
