import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';
import { useTheme } from '@/hooks/useTheme';
import * as themeUtils from '@/utils/theme';

// Mock the theme utilities
jest.mock('@/utils/theme');

const mockThemeUtils = themeUtils as jest.Mocked<typeof themeUtils>;

// Test component that uses the theme context
function TestComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button
        data-testid="set-light"
        onClick={() => setTheme('light')}
      >
        Set Light
      </button>
      <button
        data-testid="set-dark"
        onClick={() => setTheme('dark')}
      >
        Set Dark
      </button>
      <button
        data-testid="set-system"
        onClick={() => setTheme('system')}
      >
        Set System
      </button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
    mockThemeUtils.resolveTheme.mockImplementation((theme) =>
      theme === 'system' ? 'light' : theme as 'light' | 'dark'
    );
    mockThemeUtils.saveThemeToStorage.mockImplementation(() => { });
    mockThemeUtils.applyThemeToHtml.mockImplementation(() => { });
    mockThemeUtils.createSystemThemeListener.mockReturnValue(() => { });
  });

  describe('initialization', () => {
    it('should load theme from storage on mount', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('dark');
      mockThemeUtils.resolveTheme.mockReturnValue('dark');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });

      expect(mockThemeUtils.loadThemeFromStorage).toHaveBeenCalledTimes(1);
      expect(mockThemeUtils.resolveTheme).toHaveBeenCalledWith('dark');
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');
    });

    it('should default to system theme when no stored theme', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      });
    });

    it('should apply theme to HTML on initialization', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('light');
      });
    });
  });

  describe('theme setting', () => {
    it('should update theme when setTheme is called', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setDarkButton = screen.getByTestId('set-dark');

      act(() => {
        setDarkButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });

      expect(mockThemeUtils.resolveTheme).toHaveBeenCalledWith('dark');
      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('dark');
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');
    });

    it('should resolve system theme correctly', async () => {
      mockThemeUtils.resolveTheme.mockImplementation((theme) =>
        theme === 'system' ? 'dark' : theme as 'light' | 'dark'
      );

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setSystemButton = screen.getByTestId('set-system');

      act(() => {
        setSystemButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });
    });

    it('should save theme to storage when changed', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setLightButton = screen.getByTestId('set-light');

      act(() => {
        setLightButton.click();
      });

      await waitFor(() => {
        expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('light');
      });
    });
  });

  describe('system theme listener', () => {
    it('should create system theme listener when theme is system', async () => {
      const mockCleanup = jest.fn();
      mockThemeUtils.createSystemThemeListener.mockReturnValue(mockCleanup);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      const setSystemButton = screen.getByTestId('set-system');

      act(() => {
        setSystemButton.click();
      });

      await waitFor(() => {
        expect(mockThemeUtils.createSystemThemeListener).toHaveBeenCalled();
      });
    });

    it('should handle system theme changes', async () => {
      let systemThemeCallback: (theme: 'light' | 'dark') => void = () => { };

      mockThemeUtils.createSystemThemeListener.mockImplementation((callback) => {
        systemThemeCallback = callback;
        return () => { };
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Set to system theme first
      const setSystemButton = screen.getByTestId('set-system');
      act(() => {
        setSystemButton.click();
      });

      // Simulate system theme change
      act(() => {
        systemThemeCallback('dark');
      });

      await waitFor(() => {
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      });

      // The HTML should have the 'system' class, not the resolved theme
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');
    });

    it('should cleanup system theme listener on unmount', async () => {
      const mockCleanup = jest.fn();
      mockThemeUtils.createSystemThemeListener.mockReturnValue(mockCleanup);

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Set to system theme to create listener
      const setSystemButton = screen.getByTestId('set-system');
      act(() => {
        setSystemButton.click();
      });

      unmount();

      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should not create additional listener when theme changes from system to non-system', async () => {
      const mockCleanup = jest.fn();
      mockThemeUtils.createSystemThemeListener.mockReturnValue(mockCleanup);

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Clear the call count from initialization (since default theme is 'system')
      mockThemeUtils.createSystemThemeListener.mockClear();

      const setLightButton = screen.getByTestId('set-light');

      act(() => {
        setLightButton.click();
      });

      // Should not create additional listener for non-system themes
      expect(mockThemeUtils.createSystemThemeListener).not.toHaveBeenCalled();
    });
  });

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('should provide theme context when used within ThemeProvider', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toBeInTheDocument();
      expect(screen.getByTestId('resolved-theme')).toBeInTheDocument();
      expect(screen.getByTestId('set-light')).toBeInTheDocument();
      expect(screen.getByTestId('set-dark')).toBeInTheDocument();
      expect(screen.getByTestId('set-system')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle storage loading errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      mockThemeUtils.loadThemeFromStorage.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw and should use fallback
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize theme:', expect.any(Error));
      });

      // Should fallback to system theme
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');

      consoleSpy.mockRestore();
    });

    it('should handle theme resolution errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      mockThemeUtils.resolveTheme.mockImplementation(() => {
        throw new Error('Resolution error');
      });

      // Should not throw and should use ultimate fallback
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize theme:', expect.any(Error));
        expect(consoleSpy).toHaveBeenCalledWith('Failed to apply fallback theme:', expect.any(Error));
      });

      // Should fallback to light theme
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');

      consoleSpy.mockRestore();
    });

    it('should handle setTheme errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Mock resolveTheme to throw error during setTheme call
      mockThemeUtils.resolveTheme.mockImplementation((theme) => {
        if (theme === 'dark') {
          throw new Error('Resolution error during setTheme');
        }
        return theme === 'system' ? 'light' : theme as 'light' | 'dark';
      });

      const setDarkButton = screen.getByTestId('set-dark');

      act(() => {
        setDarkButton.click();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to set theme:', expect.any(Error));
      });

      // Theme should not change due to error
      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');

      consoleSpy.mockRestore();
    });
  });
});
