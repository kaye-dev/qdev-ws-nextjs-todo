/**
 * Theme type definitions for the theme switcher system
 */

export type Theme = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

export type StoredTheme = Theme;
