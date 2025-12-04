'use client';

import { useEffect, useState } from 'react';

/**
 * SplashScreen - Animated vinyl logo intro
 * Props: { onAnimationComplete: Function, duration: number (default 2000ms) }
 * Requirements: 1.1, 9.1
 */
export default function SplashScreen({ onAnimationComplete, duration = 2000 }) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onAnimationComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-dark via-purple-medium to-pink-medium">
      {/* Animated Vinyl Logo */}
      <div className={`relative transition-all duration-1000 ${isAnimating ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
        {/* Vinyl Record */}
        <div className={`w-48 h-48 rounded-full bg-black shadow-2xl relative ${isAnimating ? 'animate-spin-slow' : ''}`}>
          {/* Grooves */}
          <div className="absolute inset-2 rounded-full border border-gray-800" />
          <div className="absolute inset-4 rounded-full border border-gray-800" />
          <div className="absolute inset-6 rounded-full border border-gray-800" />
          <div className="absolute inset-8 rounded-full border border-gray-800" />
          <div className="absolute inset-10 rounded-full border border-gray-800" />
          <div className="absolute inset-12 rounded-full border border-gray-800" />
          
          {/* Center Label */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-medium to-lavender flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
        </div>
      </div>

      {/* Logo Text */}
      <div className={`mt-8 transition-all duration-700 delay-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-4xl font-bold text-white tracking-widest">GROOVE</h1>
      </div>
    </div>
  );
}
