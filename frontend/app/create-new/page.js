'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header, NavigationMenu, VinylCreator } from '../components';

/**
 * Create New Page - Vinyl customization interface for creating new playlists
 * Requirements: 4.1, 4.7, 4.8, 9.4
 */
export default function CreateNewPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

  /**
   * Handle playlist creation
   * Requirements: 4.6, 4.7, 4.8
   */
  const handleCreatePlaylist = useCallback(async (vinylConfig) => {
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get user ID from localStorage or auth context
      // In production, this would come from an auth context
      const userId = localStorage.getItem('groove_user_id');

      if (!userId) {
        setError('Please log in to create a playlist');
        setIsCreating(false);
        return;
      }

      // Prepare the request body
      const requestBody = {
        userId,
        name: vinylConfig.name,
        description: vinylConfig.description || '',
        color: vinylConfig.color || null,
        customImageUrl: vinylConfig.labelImage?.url || vinylConfig.labelImage?.previewUrl || null
      };

      // If there's a custom uploaded image, we'd upload it to Supabase Storage first
      // For now, we'll handle this in a future iteration
      if (vinylConfig.labelImage?.isCustom && vinylConfig.labelImage?.file) {
        // TODO: Upload to Supabase Storage and get URL
        console.log('Custom image upload would happen here');
      }

      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create playlist');
      }

      // Success! Show message and redirect to My Shelf
      setSuccessMessage(`"${data.playlist.name}" created successfully!`);
      
      // Redirect to My Shelf after a short delay
      setTimeout(() => {
        router.push('/my-shelf');
      }, 1500);

    } catch (err) {
      console.error('Create playlist error:', err);
      setError(err.message || 'Failed to create playlist. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Requirements: 6.6 */}
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

      {/* Main Content Area - Requirements: 9.4 (light gray/white background) */}
      {/* Responsive max-width: mobile full, tablet centered, desktop wider */}
      <main className="pt-24 sm:pt-16 px-3 sm:px-4 md:px-6 pb-32 sm:pb-40 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto safe-area-bottom">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg 
                className="w-5 h-5 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Vinyl Creator Component */}
        <VinylCreator
          onCreatePlaylist={handleCreatePlaylist}
          isCreating={isCreating}
          error={error}
        />
      </main>
    </div>
  );
}
