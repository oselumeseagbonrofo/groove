'use client';

import { useState, useEffect } from 'react';

/**
 * Header - Screen title and hamburger menu
 * Props: { title: string, onMenuToggle: Function, isDark: boolean }
 * Requirements: 6.1, 6.4, 6.5, 6.6, 8.1, 8.5
 */
export default function Header({ title = 'NOW PLAYING', onMenuToggle, isDark = false, onHelpClick = null }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuClick = () => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  // Dynamic styling based on screen type
  // isDark: true for Now Playing (dark purple header)
  // isDark: false for My Shelf (light pink bg) and Create New (light gray bg)
  const headerBg = isDark ? 'bg-transparent' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? '' : 'text-purple-dark';
  const textStyle = isDark ? { color: '#2d1b4e' } : {};
  const hoverBg = isDark ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-purple-dark/10 active:bg-purple-dark/20';

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 md:${headerBg} safe-area-top transition-colors duration-300`}>
      {/* Mobile: Stacked centered layout, Desktop: Horizontal layout */}
      <div className={`md:hidden flex flex-row items-start justify-between pt-12 pb-0 px-3 transition-colors duration-300 ${isScrolled ? 'shadow-md' : 'bg-transparent'}`} style={isScrolled ? { backgroundColor: '#dbdbdb' } : {}}>
        {/* Hamburger Menu Icon - Positioned on left */}
        <button
          onClick={handleMenuClick}
          className="p-2 rounded-lg transition-colors touch-target flex items-center justify-center"
          style={{ color: '#2d1b4e' }}
          aria-label="Open navigation menu"
        >
          <HamburgerIcon className="" />
        </button>

        {/* Right-aligned Title - Stacked words with letter spacing */}
        <h1 className="text-2xl font-bold tracking-widest text-left" style={{ color: '#2d1b4e', lineHeight: '1.2' }}>
          {title.split(' ').map((word, index) => (
            <div key={index}>{word}</div>
          ))}
        </h1>

        {/* Help button (mobile) */}
        {onHelpClick && (
          <button
            onClick={onHelpClick}
            className="p-2 rounded-full transition-colors touch-target flex items-center justify-center"
            style={{ backgroundColor: '#2d1b4e', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f1338'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d1b4e'}
            aria-label="Show quick guide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>

      {/* Desktop: Original horizontal layout */}
      <div className="hidden md:flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
        {/* Hamburger Menu Icon - Touch-friendly 44px minimum */}
        <button
          onClick={handleMenuClick}
          className={`p-2 sm:p-2 rounded-lg ${hoverBg} transition-colors touch-target flex items-center justify-center`}
          style={isDark ? { color: '#2d1b4e' } : {}}
          aria-label="Open navigation menu"
        >
          <HamburgerIcon className={textColor} />
        </button>

        {/* Dynamic Screen Title - Responsive text size */}
        <h1 className={`text-base sm:text-lg font-bold tracking-wider ${textColor}`} style={textStyle}>
          {title}
        </h1>

        {/* Help button or Spacer */}
        {onHelpClick ? (
          <button
            onClick={onHelpClick}
            className="p-2 rounded-full transition-colors touch-target flex items-center justify-center"
            style={{ backgroundColor: '#2d1b4e', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f1338'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d1b4e'}
            aria-label="Show quick guide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        ) : (
          <div className="w-10 sm:w-10" />
        )}
      </div>
    </header>
  );
}

/**
 * Hamburger menu icon component
 */
function HamburgerIcon({ className = '' }) {
  return (
    <svg
      className={`w-6 h-6 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}
