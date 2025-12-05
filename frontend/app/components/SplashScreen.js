'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import groove from '@/public/groove.png';

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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFFFFF] via-[#E4CEE6] to-[#8C2E96]">
      {/* Animated Vinyl Logo */}
      <div className={`relative transition-opacity duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
        <div className={isAnimating ? 'animate-spin-slow' : ''} style={{ transformOrigin: 'center center' }}>
          <Image src={groove} height={300} width={300} alt="Groove vinyl logo" style={{ display: 'block' }} />
        </div>
      </div>

      {/* Logo Text */}
      <div className={`-mt-16 transition-all duration-700 delay-300 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h1 className="text-5xl font-bold tracking-widest text-center" style={{ fontFamily: "'DM Bubble Pop', sans-serif", color: '#0A0047' }}>GROOVE</h1>
      </div>
    </div>
  );
}
