'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header, NavigationMenu, VinylShelf } from '../components';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const PLAYLISTS_PER_PAGE = 20;

/**
 * My Shelf Page - Playlist collection displayed as vinyl records on shelves
 * Requirements: 2.1, 2.2, 2.6, 6.5, 9.3, 9.6, 10.1
 */
export default function MyShelfPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Get userId from URL params or localStorage
  const userId = searchParams.get('userId') || 
    (typeof window !== 'undefined' ? localStorage.getItem('groove_user_id') : null);

  /**
   * Fetch playlists from API
   * Requirements: 2.1, 2.4
   */
  const fetchPlaylists = useCallback(async (currentOffset = 0, append = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/playlists?userId=${userId}&limit=${PLAYLISTS_PER_PAGE}&offset=${currentOffset}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch playlists');
      }

      const data = await response.json();

      if (append) {
        setPlaylists(prev => [...prev, ...data.playlists]);
      } else {
        setPlaylists(data.playlists);
      }

      setHasMore(data.pagination.hasMore);
      setOffset(currentOffset + data.playlists.length);

    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchPlaylists(0, false);
  }, [fetchPlaylists]);

  /**
   * Infinite scroll implementation
   * Requirements: 2.4
   */
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          fetchPlaylists(offset, true);
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, offset, fetchPlaylists]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (screen) => {
    console.log('Navigating to:', screen);
  };

  /**
   * Handle vinyl selection - navigate to Now Playing
   * Requirements: 2.5
   */
  const handleVinylSelect = (playlist) => {
    router.push(`/now-playing?playlistId=${playlist.id}&userId=${userId}`);
  };

  /**
   * Handle Add New Vinyl button
   * Requirements: 2.6
   */
  const handleAddNewVinyl = () => {
    router.push('/create-new');
  };

  const handleRetry = () => {
    setOffset(0);
    fetchPlaylists(0, false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FBFBFB] to-[#D5B4D8]">
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

      {/* Main Content Area - Responsive padding */}
      <main className="pt-14 sm:pt-16 pb-20 sm:pb-24 safe-area-bottom">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full border-4 border-purple-medium border-t-transparent animate-spin mb-4" />
            <p className="text-gray-600">Loading your collection...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-white rounded-lg shadow-lg transition-colors"
              style={{ backgroundColor: '#3d2b5e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4d3b6e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d2b5e'}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Not Authenticated State */}
        {!userId && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-4xl text-gray-400">♪</span>
            </div>
            <p className="text-gray-600 text-center mb-4">
              Connect your music service to see your playlists
            </p>
            <button
              onClick={() => router.push('/welcome')}
              className="px-6 py-3 text-white font-semibold rounded-full shadow-lg transition-colors"
              style={{ backgroundColor: '#3d2b5e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4d3b6e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d2b5e'}
            >
              Connect Now
            </button>
          </div>
        )}

        {/* Vinyl Shelf with Playlists */}
        {!isLoading && !error && userId && (
          <>
            <VinylShelf
              playlists={playlists}
              onVinylSelect={handleVinylSelect}
            />

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div 
                ref={loadMoreRef}
                className="flex justify-center py-8"
              >
                {isLoadingMore && (
                  <div className="w-8 h-8 rounded-full border-2 border-purple-medium border-t-transparent animate-spin" />
                )}
              </div>
            )}
          </>
        )}

        {/* Add New Vinyl Button - Requirements: 2.6, 9.6, touch-friendly */}
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 safe-area-bottom">
          <button
            onClick={handleAddNewVinyl}
            className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-white font-semibold rounded-full shadow-lg active:scale-95 transition-all touch-target text-sm sm:text-base"
            style={{ backgroundColor: '#3d2b5e' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4d3b6e'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3d2b5e'}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Vinyl
          </button>
        </div>
      </main>
    </div>
  );
}
