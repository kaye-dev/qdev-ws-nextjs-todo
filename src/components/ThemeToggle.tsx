'use client';

import { useTheme } from '@/hooks/useTheme';
import { useRef, useCallback, useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const announcementRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousTheme, setPreviousTheme] = useState<'light' | 'dark'>(resolvedTheme);

  // Handle theme change animations
  useEffect(() => {
    if (previousTheme !== resolvedTheme) {
      setIsAnimating(true);
      setPreviousTheme(resolvedTheme);

      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [resolvedTheme, previousTheme]);

  const announceThemeChange = useCallback((newTheme: 'light' | 'dark') => {
    // Create a temporary announcement for screen readers
    const announcement = newTheme === 'light'
      ? 'Switched to light mode'
      : 'Switched to dark mode';

    if (announcementRef.current) {
      announcementRef.current.textContent = announcement;
      // Clear the announcement after a short delay to avoid cluttering
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  const handleToggle = useCallback(() => {
    // Toggle between light and dark modes
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    announceThemeChange(newTheme);

    // Trigger button bounce animation
    const button = document.querySelector('.theme-toggle-button');
    if (button) {
      button.classList.add('button-bounce');
      setTimeout(() => {
        button.classList.remove('button-bounce');
      }, 300);
    }
  }, [resolvedTheme, setTheme, announceThemeChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  const currentThemeLabel = resolvedTheme === 'light' ? 'light mode' : 'dark mode';
  const nextThemeLabel = resolvedTheme === 'light' ? 'dark mode' : 'light mode';

  return (
    <>
      {/* Screen reader announcement area */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
        role="status"
      />

      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="theme-toggle-button fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[9999] p-3 sm:p-4 rounded-full bg-gray-900 dark:bg-white border border-gray-800 dark:border-gray-200 shadow-lg hover:shadow-xl outline-none focus:outline-none cursor-pointer w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] md:w-[52px] md:h-[52px] flex items-center justify-center transition-all duration-200 ease-in-out aspect-square"
        aria-label={`Switch to ${nextThemeLabel}. Currently in ${currentThemeLabel}.`}
        aria-pressed={resolvedTheme === 'dark'}
        aria-describedby="theme-toggle-description"
        type="button"
        title={`Switch to ${nextThemeLabel}`}
      >
        {resolvedTheme === 'light' ? (
          // Sun icon for light mode
          <svg
            className={`theme-toggle-icon w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-300 ${isAnimating ? 'icon-rotate-in' : ''}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
            aria-label="Sun icon"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM18.894 17.834a.75.75 0 00-1.06 1.06l-1.591-1.59a.75.75 0 111.06-1.061l1.591 1.59zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        ) : (
          // Moon icon for dark mode
          <svg
            className={`theme-toggle-icon w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-500 ${isAnimating ? 'icon-fade-in' : ''}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
            aria-label="Moon icon"
          >
            <path
              fillRule="evenodd"
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Hidden description for screen readers */}
      <div id="theme-toggle-description" className="sr-only">
        Toggle between light and dark theme. Use Enter or Space key to activate.
      </div>
    </>
  );
}
