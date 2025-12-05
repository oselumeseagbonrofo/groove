'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import groove from "@/public/groove.png"

/**
 * WelcomeScreen - Authentication options
 * Props: { onSpotifyConnect: Function }
 * Requirements: 1.2, 9.1
 */
export default function WelcomeScreen({ onSpotifyConnect }) {
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connectSpotify } = useAuth();

  const handleSpotifyConnect = async () => {
    setSpotifyLoading(true);
    setError(null);
    try {
      // Use provided handler or default to auth hook
      if (onSpotifyConnect) {
        await onSpotifyConnect();
      } else {
        await connectSpotify();
      }
    } catch (err) {
      setError('Failed to connect with Spotify. Please try again.');
      setSpotifyLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFFFFF] via-[#E4CEE6] to-[#8C2E96]">
      {/* Logo Section */}
      <div className="mb-12">
        {/* Vinyl Record Logo */}
        <div><Image src={groove} height={200} width={200} alt="Groove vinyl" /></div>
        
        <h1 className="text-5xl font-bold tracking-widest -mt-20 text-center" style={{ fontFamily: "'DM Bubble Pop', sans-serif", color: '#0A0047' }}>GROOVE</h1>
      </div>

      {/* Authentication Buttons */}
      <div className="flex flex-col items-center gap-8 w-full px-6">
        {/* Spotify Button */}
        <button
          onClick={handleSpotifyConnect}
          disabled={spotifyLoading}
          className="flex items-center justify-between w-[400px] h-[60px] px-6 rounded-[20px] bg-white text-black font-semibold transition-all hover:bg-gray-50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="flex items-center gap-3">
            {spotifyLoading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <SpotifyIcon />
            )}
            <span>{spotifyLoading ? 'Connecting...' : 'Connect with Spotify'}</span>
          </div>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-200 text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  );
}

function SpotifyIcon() {
  return (
    <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
    </div>
  );
}
