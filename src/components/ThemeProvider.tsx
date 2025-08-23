'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import type { Theme, ResolvedTheme, ThemeContextType } from '@/types/theme';
import {
  loadThemeFromStorage,
  saveThemeToStorage,
  resolveTheme,
  applyThemeToHtml,
  createSystemThemeListener,
} from '@/utils/theme';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Initialize theme from storage and apply to HTML
  useEffect(() => {
    try {
      const storedTheme = loadThemeFromStorage();
      const resolved = resolveTheme(storedTheme);

      setThemeState(storedTheme);
      setResolvedTheme(resolved);
      applyThemeToHtml(storedTheme);
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
      // Fallback to system theme
      try {
        const fallbackResolved = resolveTheme('system');
        setThemeState('system');
        setResolvedTheme(fallbackResolved);
        applyThemeToHtml('system');
      } catch (fallbackError) {
        console.warn('Failed to apply fallback theme:', fallbackError);
        // Ultimate fallback to light theme
        setThemeState('light');
        setResolvedTheme('light');
        applyThemeToHtml('light');
      }
    }
  }, []);

  // Set up system theme listener when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    const cleanup = createSystemThemeListener((systemTheme) => {
      setResolvedTheme(systemTheme);
      // Keep the 'system' class on HTML element, CSS will handle the actual theme
    });

    return cleanup;
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      const resolved = resolveTheme(newTheme);

      setThemeState(newTheme);
      setResolvedTheme(resolved);
      saveThemeToStorage(newTheme);
      applyThemeToHtml(newTheme);
    } catch (error) {
      console.warn('Failed to set theme:', error);
      // Don't update state if there's an error
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}


