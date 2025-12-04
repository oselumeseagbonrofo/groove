'use client';

import { useState } from 'react';
import { Header, NavigationMenu } from '../components';

/**
 * Create New Page - Vinyl customization interface for creating new playlists
 * Requirements: 4.1, 4.2, 6.6, 9.4, 10.1
 */
export default function CreateNewPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4A2C6D');

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (screen) => {
    // Navigation is handled by Link components in NavigationMenu
    console.log('Navigating to:', screen);
  };

  const colorOptions = [
    '#4A2C6D', // Purple
    '#E8C5D0', // Pink
    '#00BCD4', // Teal
    '#1DB954', // Green
    '#FF6B6B', // Red
    '#FFD93D', // Yellow
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="CREATE NEW" 
        onMenuToggle={handleMenuToggle}
        isDark={false}
      />

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        currentScreen="create-new"
        onNavigate={handleNavigate}
        onClose={handleMenuClose}
      />

      {/* Main Content Area */}
      <main className="pt-16 px-4 pb-8">
        {/* Vinyl Preview */}
        <div className="flex justify-center py-8">
          <div 
            className="w-48 h-48 rounded-full shadow-2xl relative"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-gray-800" />
            <div className="absolute inset-4 rounded-full border border-gray-800" />
            <div className="absolute inset-6 rounded-full border border-gray-800" />
            <div className="absolute inset-8 rounded-full border border-gray-800" />
            
            {/* Center Label with selected color */}
            <div 
              className="absolute inset-0 m-auto w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedColor }}
            >
              <span className="text-white text-sm font-bold">
                {playlistName ? playlistName.charAt(0).toUpperCase() : 'G'}
              </span>
            </div>
          </div>
        </div>

        {/* Playlist Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Playlist Name
          </label>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-primary focus:border-transparent outline-none"
          />
        </div>

        {/* Color Picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label Color
          </label>
          <div className="flex gap-3 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full transition-transform ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-teal-primary scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Image Gallery Placeholder */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label Image
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-400 text-xs">Image {i}</span>
              </div>
            ))}
          </div>
          <button className="mt-2 text-sm text-teal-primary hover:underline">
            + Upload custom image
          </button>
        </div>

        {/* Create Button */}
        <button
          disabled={!playlistName.trim()}
          className="w-full py-4 bg-teal-primary text-white font-semibold rounded-full shadow-lg hover:bg-teal-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Playlist
        </button>
      </main>
    </div>
  );
}
