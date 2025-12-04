'use client';

/**
 * Header - Screen title and hamburger menu
 * Props: { title: string, onMenuToggle: Function, isDark: boolean }
 * Requirements: 6.1, 6.4, 6.5, 6.6, 8.1, 8.5
 */
export default function Header({ title = 'NOW PLAYING', onMenuToggle, isDark = false }) {
  const handleMenuClick = () => {
    if (onMenuToggle) {
      onMenuToggle();
    }
  };

  // Dynamic styling based on screen type
  // isDark: true for Now Playing (dark purple header)
  // isDark: false for My Shelf (light pink bg) and Create New (light gray bg)
  const headerBg = isDark ? 'bg-purple-dark' : 'bg-white/80 backdrop-blur-sm';
  const textColor = isDark ? 'text-white' : 'text-purple-dark';
  const hoverBg = isDark ? 'hover:bg-white/10 active:bg-white/20' : 'hover:bg-purple-dark/10 active:bg-purple-dark/20';

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 ${headerBg} safe-area-top`}>
      <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
        {/* Hamburger Menu Icon - Touch-friendly 44px minimum */}
        <button
          onClick={handleMenuClick}
          className={`p-2 sm:p-2 rounded-lg ${hoverBg} transition-colors touch-target flex items-center justify-center`}
          aria-label="Open navigation menu"
        >
          <HamburgerIcon className={textColor} />
        </button>

        {/* Dynamic Screen Title - Responsive text size */}
        <h1 className={`text-base sm:text-lg font-bold tracking-wider ${textColor}`}>
          {title}
        </h1>

        {/* Spacer for centering title */}
        <div className="w-10 sm:w-10" />
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
