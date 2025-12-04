'use client';

import { useState } from 'react';
import { Header, NavigationMenu } from '../components';

/**
 * Now Playing Page - Main playback interface with vinyl turntable
 * Requirements: 3.1, 6.4, 9.2, 10.1
 */
export default function NowPlayingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-dark via-pink-medium to-lavender">
      {/* Header with dark styling for Now Playing */}
      <Header 
        title="NOW PLAYING" 
        onMenuToggle={handleMenuToggle}
        isDark={true}
      />

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        currentScreen="now-playing"
        onNavigate={handleNavigate}
        onClose={handleMenuClose}
      />

      {/* Main Content Area */}
      <main className="pt-16 px-4 pb-8">
        {/* Placeholder for VinylTurntable component (Task 7) */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-64 h-64 rounded-full bg-black shadow-2xl relative">
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-gray-800" />
            <div className="absolute inset-4 rounded-full border border-gray-800" />
            <div className="absolute inset-6 rounded-full border border-gray-800" />
            <div className="absolute inset-8 rounded-full border border-gray-800" />
            <div className="absolute inset-10 rounded-full border border-gray-800" />
            
            {/* Center Label */}
            <div className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-medium to-lavender flex items-center justify-center">
              <span className="text-white text-lg font-bold">G</span>
            </div>
          </div>
          
          <p className="mt-8 text-white/60 text-sm">
            Select a playlist from My Shelf to start playing
          </p>
        </div>

        {/* Placeholder for PlaybackControls (Task 7) */}
        <div className="flex justify-center gap-8 mt-8">
          <button className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white">⏮</span>
          </button>
          <button className="w-16 h-16 rounded-full bg-teal-primary flex items-center justify-center">
            <span className="text-white text-2xl">▶</span>
          </button>
          <button className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white">⏭</span>
          </button>
        </div>

        {/* Placeholder for TrackQueue (Task 7) */}
        <div className="mt-8 bg-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Up Next</h3>
          <p className="text-white/60 text-sm">No tracks in queue</p>
        </div>
      </main>
    </div>
  );
}
