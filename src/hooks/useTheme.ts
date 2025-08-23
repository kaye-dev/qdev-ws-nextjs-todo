'use client';

import { useContext } from 'react';
import type { ThemeContextType } from '@/types/theme';
import { ThemeContext } from '@/components/ThemeProvider';

/**
 * Custom hook to access theme context
 * 
 * This hook provides access to the current theme state and theme manipulation functions.
 * It must be used within a ThemeProvider component tree.
 * 
 * @returns ThemeContextType object containing theme state and setTheme function
 * @throws Error if used outside of ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, resolvedTheme } = useTheme();
 *   
 *   return (
 *     <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *       Current theme: {resolvedTheme}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Make sure your component is wrapped with <ThemeProvider>.'
    );
  }

  return context;
}
