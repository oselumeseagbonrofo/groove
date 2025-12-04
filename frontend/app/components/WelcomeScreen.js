'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Image from 'next/image';
import groove from "@/public/groove.png"

/**
 * WelcomeScreen - Authentication options
 * Props: { onSpotifyConnect: Function, onAppleMusicConnect: Function }
 * Requirements: 1.2, 9.1
 */
export default function WelcomeScreen({ onSpotifyConnect, onAppleMusicConnect }) {
  const [spotifyLoading, setSpotifyLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [error, setError] = useState(null);
  const { connectSpotify, connectAppleMusic } = useAuth();

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

  const handleAppleMusicConnect = async () => {
    setAppleLoading(true);
    setError(null);
    try {
      // Use provided handler or default to auth hook
      if (onAppleMusicConnect) {
        await onAppleMusicConnect();
      } else {
        await connectAppleMusic();
      }
    } catch (err) {
      setError('Failed to connect with Apple Music. Please try again.');
      setAppleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-dark via-purple-medium to-pink-medium">
      {/* Logo Section */}
      <div className="mb-12">
        {/* Vinyl Record Logo */}
        <div><Image src={groove} height={200} width={200} /></div>
        
        <h1 className="text-3xl font-bold text-white tracking-widest mt-6 text-center">GROOVE</h1>
        <p className="text-lavender text-sm mt-2 text-center">Your music, reimagined</p>
      </div>

      {/* Authentication Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs px-6">
        {/* Spotify Button */}
        <button
          onClick={handleSpotifyConnect}
          disabled={spotifyLoading || appleLoading}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full bg-[#1DB954] text-white font-semibold transition-all hover:bg-[#1ed760] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {spotifyLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SpotifyIcon />
          )}
          <span>{spotifyLoading ? 'Connecting...' : 'Connect with Spotify'}</span>
        </button>

        {/* Apple Music Button */}
        <button
          onClick={handleAppleMusicConnect}
          disabled={spotifyLoading || appleLoading}
          className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full bg-white text-black font-semibold transition-all hover:bg-gray-100 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {appleLoading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <AppleMusicIcon />
          )}
          <span>{appleLoading ? 'Connecting...' : 'Connect with Apple Music'}</span>
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
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}

function AppleMusicIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.042-1.8-.6-1.965-1.49-.18-.975.46-1.943 1.42-2.163.357-.08.72-.136 1.074-.233.27-.074.387-.238.39-.51.004-.35.002-.7.002-1.05V8.472c0-.29-.1-.4-.39-.34l-4.17.9c-.03.01-.06.02-.09.03-.2.07-.29.2-.29.41v7.63c0 .42-.05.83-.23 1.21-.29.59-.75.96-1.38 1.15-.35.1-.71.16-1.07.18-.95.05-1.82-.57-2-1.47-.18-.97.44-1.94 1.4-2.17.36-.09.73-.14 1.09-.24.27-.07.38-.24.38-.51V7.63c0-.4.15-.63.54-.73l5.63-1.26c.11-.02.22-.05.33-.05.32 0 .49.17.49.5v4.01z"/>
    </svg>
  );
}
