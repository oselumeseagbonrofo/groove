'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

/**
 * NavigationMenu - Slide-out menu with navigation options
 * Props: { isOpen: boolean, currentScreen: string, onNavigate: Function, onClose: Function }
 * Requirements: 6.2, 6.3
 */
export default function NavigationMenu({ isOpen, currentScreen, onNavigate, onClose }) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleNavigation = (screen) => {
    onNavigate?.(screen);
    onClose?.();
  };

  const navItems = [
    { id: 'now-playing', label: 'Now Playing', href: '/now-playing', icon: PlayIcon },
    { id: 'my-shelf', label: 'My Shelf', href: '/my-shelf', icon: ShelfIcon },
    { id: 'create-new', label: 'Create New', href: '/create-new', icon: PlusIcon },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Slide-out menu */}
      <nav
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-72 bg-purple-dark z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Mini Vinyl Logo */}
            <div className="w-10 h-10 rounded-full bg-black relative">
              <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-gradient-to-br from-purple-medium to-lavender" />
            </div>
            <span className="text-white font-bold tracking-wider">GROOVE</span>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close navigation menu"
          >
            <CloseIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Navigation Items */}
        <ul className="py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    isActive
                      ? 'bg-white/10 text-teal-primary border-l-4 border-teal-primary'
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout Option */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={() => handleNavigation('logout')}
            className="flex items-center gap-4 w-full px-2 py-3 text-white/70 hover:text-white transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </nav>
    </>
  );
}

// Icon Components
function PlayIcon({ className = '' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ShelfIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function PlusIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CloseIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function LogoutIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
