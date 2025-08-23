import type { Theme, ResolvedTheme, StoredTheme } from '@/types/theme';

/**
 * Local storage key for theme preference
 */
export const THEME_STORAGE_KEY = 'theme-preference';

/**
 * Detects the system theme preference using matchMedia API
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 */
export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (error) {
    console.warn('Failed to detect system theme:', error);
    return 'light';
  }
};

/**
 * Resolves a theme value to its actual applied theme
 * @param theme - The theme to resolve
 * @returns The resolved theme ('light' or 'dark')
 */
export const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

/**
 * Loads theme preference from localStorage
 * @returns The stored theme or 'system' as default
 */
export const loadThemeFromStorage = (): Theme => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as StoredTheme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
  }

  return 'system';
};

/**
 * Saves theme preference to localStorage
 * @param theme - The theme to save
 */
export const saveThemeToStorage = (theme: Theme): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to storage:', error);
  }
};

/**
 * Applies theme to HTML element by updating class attribute
 * @param theme - The theme to apply (light, dark, or system)
 */
export const applyThemeToHtml = (theme: Theme): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const html = document.documentElement;

  // Remove existing theme classes
  html.classList.remove('light', 'dark', 'system');

  // Add the theme class
  html.classList.add(theme);
};

/**
 * Creates a media query listener for system theme changes
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to remove the listener
 */
export const createSystemThemeListener = (
  callback: (theme: ResolvedTheme) => void
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => { };
  }

  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  } catch (error) {
    console.warn('Failed to create system theme listener:', error);
    return () => { };
  }
};
