'use client';

import { useEffect } from 'react';

/**
 * QuickGuide - Tutorial overlay for Now Playing page
 * Shows instructions for tonearm and swipe gestures
 * @param {boolean} isOpen - Whether the guide is visible
 * @param {Function} onClose - Callback to close the guide
 * @param {boolean} autoClose - Whether to auto-close after 2 seconds (default: false)
 */
export default function QuickGuide({ isOpen, onClose, autoClose = false }) {
  useEffect(() => {
    if (isOpen && autoClose) {
      // Auto-close after 2 seconds only on first visit
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-2xl mx-4 p-8 rounded-3xl shadow-2xl" style={{ backgroundColor: '#2d1b4e' }}>
        <h2 className="text-3xl font-bold text-white text-center mb-8" style={{ fontFamily: "'DM Bubble Pop', sans-serif" }}>
          QUICK GUIDE
        </h2>

        <div className="space-y-6 text-white">
          {/* Tonearm instruction */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <p className="text-lg">
              <span className="font-semibold">Click the tonearm or the play button</span> to Play/Pause.
            </p>
          </div>

          {/* Skip tracks instruction */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </div>
            <p className="text-lg">
              <span className="font-semibold">Swipe left/right</span> on touch screen devices or <span className="font-semibold">use the forward and back buttons</span> on non-touch screen devices to skip tracks.
            </p>
          </div>
        </div>

        {/* Got it button */}
        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-white text-purple-900 font-semibold rounded-full hover:bg-gray-100 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
