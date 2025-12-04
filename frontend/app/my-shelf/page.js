'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, NavigationMenu } from '../components';

/**
 * My Shelf Page - Playlist collection displayed as vinyl records on shelves
 * Requirements: 2.1, 2.2, 2.6, 6.5, 9.3, 10.1
 */
export default function MyShelfPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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

  const handleAddNewVinyl = () => {
    router.push('/create-new');
  };

  return (
    <div className="min-h-screen bg-pink-light">
      {/* Header */}
      <Header 
        title="MY SHELF" 
        onMenuToggle={handleMenuToggle}
        isDark={false}
      />

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        currentScreen="my-shelf"
        onNavigate={handleNavigate}
        onClose={handleMenuClose}
      />

      {/* Main Content Area */}
      <main className="pt-16 pb-24">
        {/* Placeholder for VinylShelf component (Task 6) */}
        <div className="px-4 py-8">
          {/* Shelf Row 1 */}
          <div className="mb-8">
            <div className="bg-gradient-to-b from-amber-700 to-amber-900 h-4 rounded-t-sm shadow-md" />
            <div className="flex gap-4 py-4 overflow-x-auto">
              {/* Placeholder vinyl records */}
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 w-24 h-24 rounded-full bg-black shadow-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full rounded-full relative">
                    <div className="absolute inset-1 rounded-full border border-gray-800" />
                    <div className="absolute inset-2 rounded-full border border-gray-800" />
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-gradient-to-br from-purple-medium to-lavender flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-b from-amber-800 to-amber-950 h-3 rounded-b-sm shadow-lg" />
          </div>

          {/* Shelf Row 2 */}
          <div className="mb-8">
            <div className="bg-gradient-to-b from-amber-700 to-amber-900 h-4 rounded-t-sm shadow-md" />
            <div className="flex gap-4 py-4 overflow-x-auto">
              {[4, 5, 6].map((i) => (
                <div 
                  key={i}
                  className="flex-shrink-0 w-24 h-24 rounded-full bg-black shadow-lg cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-full h-full rounded-full relative">
                    <div className="absolute inset-1 rounded-full border border-gray-800" />
                    <div className="absolute inset-2 rounded-full border border-gray-800" />
                    <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-gradient-to-br from-purple-medium to-lavender flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-b from-amber-800 to-amber-950 h-3 rounded-b-sm shadow-lg" />
          </div>

          {/* Empty state message */}
          <p className="text-center text-purple-dark/60 text-sm mt-8">
            Connect your music service to see your playlists
          </p>
        </div>

        {/* Add New Vinyl Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
          <button
            onClick={handleAddNewVinyl}
            className="flex items-center gap-2 px-6 py-3 bg-teal-primary text-white font-semibold rounded-full shadow-lg hover:bg-teal-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Vinyl
          </button>
        </div>
      </main>
    </div>
  );
}
