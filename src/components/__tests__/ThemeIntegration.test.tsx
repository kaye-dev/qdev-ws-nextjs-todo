import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';
import ThemeToggle from '../ThemeToggle';
import TodoApp from '../TodoApp';
import * as themeUtils from '@/utils/theme';

// Mock the theme utilities
jest.mock('@/utils/theme');
const mockThemeUtils = themeUtils as jest.Mocked<typeof themeUtils>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock storage utilities
jest.mock('@/utils/storage', () => ({
  loadTodosFromStorage: jest.fn(() => []),
  saveTodosToStorage: jest.fn(),
}));

// Mock matchMedia for system theme detection
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
});

// Test component that uses theme context
function TestApp() {
  return (
    <ThemeProvider>
      <div data-testid="app-container">
        <TodoApp />
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}

describe('Theme Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset DOM
    document.documentElement.className = '';

    // Default mock implementations
    mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
    mockThemeUtils.resolveTheme.mockImplementation((theme) =>
      theme === 'system' ? 'light' : theme as 'light' | 'dark'
    );
    mockThemeUtils.saveThemeToStorage.mockImplementation(() => { });
    mockThemeUtils.applyThemeToHtml.mockImplementation(() => { });
    mockThemeUtils.createSystemThemeListener.mockReturnValue(() => { });

    // Mock matchMedia
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    // Mock localStorage
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => { });
  });

  describe('Theme Persistence Across Page Reloads', () => {
    it('should persist light theme selection across page reloads', async () => {
      // Simulate stored light theme
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      // Verify theme was loaded from storage
      expect(mockThemeUtils.loadThemeFromStorage).toHaveBeenCalledTimes(1);
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('light');

      // Verify theme toggle shows correct state
      await waitFor(() => {
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
        expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('dark mode'));
      });
    });

    it('should persist dark theme selection across page reloads', async () => {
      // Simulate stored dark theme
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('dark');
      mockThemeUtils.resolveTheme.mockReturnValue('dark');

      render(<TestApp />);

      // Verify theme was loaded from storage
      expect(mockThemeUtils.loadThemeFromStorage).toHaveBeenCalledTimes(1);
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

      // Verify theme toggle shows correct state
      await waitFor(() => {
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
        expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('light mode'));
      });
    });

    it('should persist system theme selection across page reloads', async () => {
      // Simulate stored system theme
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('dark'); // System resolves to dark

      render(<TestApp />);

      // Verify theme was loaded from storage
      expect(mockThemeUtils.loadThemeFromStorage).toHaveBeenCalledTimes(1);
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');

      // Verify system theme listener was created
      expect(mockThemeUtils.createSystemThemeListener).toHaveBeenCalledTimes(1);
    });

    it('should handle missing storage data gracefully on page reload', async () => {
      // Simulate no stored theme (first visit)
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      // Should default to system theme
      expect(mockThemeUtils.loadThemeFromStorage).toHaveBeenCalledTimes(1);
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');
    });
  });

  describe('Theme Application to All Components', () => {
    it('should apply theme to TodoApp and all its child components', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('dark');
      mockThemeUtils.resolveTheme.mockReturnValue('dark');

      render(<TestApp />);

      await waitFor(() => {
        // Verify theme was applied to HTML
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

        // Verify app container exists (TodoApp rendered)
        expect(screen.getByTestId('app-container')).toBeInTheDocument();

        // Verify theme toggle exists and shows correct state
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should update all components when theme changes', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
      });

      // Mock theme change to dark
      mockThemeUtils.resolveTheme.mockReturnValue('dark');

      // Click theme toggle
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      // Verify theme was saved and applied
      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('dark');
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

      // Verify toggle button state updated
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
        expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('light mode'));
      });
    });

    it('should maintain theme consistency across all UI elements', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('dark');
      mockThemeUtils.resolveTheme.mockReturnValue('dark');

      render(<TestApp />);

      await waitFor(() => {
        // Verify HTML class was applied
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

        // Verify theme toggle reflects dark mode
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

        // Verify moon icon is displayed (dark mode indicator)
        const moonIcon = toggleButton.querySelector('svg.text-blue-500');
        expect(moonIcon).toBeInTheDocument();
      });
    });
  });

  describe('System Theme Detection and Fallback', () => {
    it('should detect system dark theme preference', async () => {
      // Mock system dark theme
      mockMatchMedia.mockReturnValue({
        matches: true, // Dark theme
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('dark');

      render(<TestApp />);

      await waitFor(() => {
        // Should apply system theme
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');

        // Should create system theme listener
        expect(mockThemeUtils.createSystemThemeListener).toHaveBeenCalledTimes(1);

        // Toggle should reflect dark mode
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should detect system light theme preference', async () => {
      // Mock system light theme
      mockMatchMedia.mockReturnValue({
        matches: false, // Light theme
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      await waitFor(() => {
        // Should apply system theme
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');

        // Toggle should reflect light mode
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('should handle system theme changes dynamically', async () => {
      let systemThemeCallback: (theme: 'light' | 'dark') => void = () => { };

      mockThemeUtils.createSystemThemeListener.mockImplementation((callback) => {
        systemThemeCallback = callback;
        return () => { };
      });

      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
      });

      // Simulate system theme change to dark
      act(() => {
        systemThemeCallback('dark');
      });

      // Verify toggle updated to reflect system change
      await waitFor(() => {
        const toggleButton = screen.getByRole('button', { name: /switch to light mode/i });
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should fallback to light theme when system detection fails', async () => {
      // Mock system theme detection failure
      mockThemeUtils.resolveTheme.mockImplementation(() => {
        throw new Error('System theme detection failed');
      });

      render(<TestApp />);

      await waitFor(() => {
        // Should fallback to light theme
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('light');
      });
    });

    it('should handle matchMedia API unavailability', async () => {
      // Mock matchMedia as undefined (older browsers)
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      });

      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('light'); // Should fallback to light

      render(<TestApp />);

      await waitFor(() => {
        // Should still work with fallback
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');
      });
    });
  });

  describe('localStorage Error Handling', () => {
    it('should handle localStorage read errors gracefully', async () => {
      // Mock localStorage.getItem to throw error
      mockThemeUtils.loadThemeFromStorage.mockImplementation(() => {
        throw new Error('localStorage read error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      render(<TestApp />);

      await waitFor(() => {
        // Should log warning and fallback to system theme
        expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize theme:', expect.any(Error));
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');
      });

      consoleSpy.mockRestore();
    });

    it('should handle localStorage write errors gracefully', async () => {
      // Mock localStorage.setItem to throw error
      mockThemeUtils.saveThemeToStorage.mockImplementation(() => {
        throw new Error('localStorage write error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      render(<TestApp />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      // Try to change theme
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        // Should log warning but continue functioning
        expect(consoleSpy).toHaveBeenCalledWith('Failed to set theme:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it('should continue functioning when localStorage is completely unavailable', async () => {
      // Mock localStorage as undefined (private browsing mode)
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.saveThemeToStorage.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      render(<TestApp />);

      await waitFor(() => {
        // Should still render and function
        const toggleButton = screen.getByRole('button', { name: /switch to/i });
        expect(toggleButton).toBeInTheDocument();
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');
      });

      // Theme toggle should still work (just won't persist)
      const toggleButton = screen.getByRole('button', { name: /switch to/i });
      fireEvent.click(toggleButton);

      // Should log warning but continue
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to set theme:', expect.any(Error));
      });

      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });

      consoleSpy.mockRestore();
    });

    it('should handle corrupted localStorage data', async () => {
      // Mock corrupted data in localStorage
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system'); // Fallback to system

      render(<TestApp />);

      await waitFor(() => {
        // Should fallback to system theme
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  describe('Complete User Workflow - Theme Selection to Persistence', () => {
    it('should complete full workflow: light -> dark -> persistence -> reload', async () => {
      // Start with light theme
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      const { unmount } = render(<TestApp />);

      // Verify initial light theme
      await waitFor(() => {
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('light');
      });

      // Switch to dark theme
      mockThemeUtils.resolveTheme.mockReturnValue('dark');
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      // Verify theme change and persistence
      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('dark');
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      });

      // Simulate page reload by unmounting and remounting
      unmount();

      // Mock loading dark theme from storage (simulating persistence)
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('dark');
      mockThemeUtils.resolveTheme.mockReturnValue('dark');

      render(<TestApp />);

      // Verify theme persisted after reload
      await waitFor(() => {
        expect(mockThemeUtils.loadThemeFromStorage).toHaveBeenCalled();
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

        const newToggleButton = screen.getByRole('button');
        expect(newToggleButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should complete full workflow: system -> manual -> persistence', async () => {
      // Start with system theme
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');
      mockThemeUtils.resolveTheme.mockReturnValue('light'); // System resolves to light

      render(<TestApp />);

      // Verify initial system theme
      await waitFor(() => {
        expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('system');
        expect(mockThemeUtils.createSystemThemeListener).toHaveBeenCalledTimes(1);
      });

      // Switch to manual dark theme
      mockThemeUtils.resolveTheme.mockReturnValue('dark');
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      // Verify switch to manual theme and persistence
      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('dark');
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should handle rapid theme changes in user workflow', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      const toggleButton = screen.getByRole('button');

      // Rapid theme changes
      mockThemeUtils.resolveTheme.mockReturnValue('dark');
      fireEvent.click(toggleButton);

      mockThemeUtils.resolveTheme.mockReturnValue('light');
      fireEvent.click(toggleButton);

      mockThemeUtils.resolveTheme.mockReturnValue('dark');
      fireEvent.click(toggleButton);

      // Verify all changes were processed
      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledTimes(3);
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledTimes(4); // Initial + 3 changes

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('should maintain accessibility throughout complete workflow', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      // Verify initial accessibility
      await waitFor(() => {
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('Switch to dark mode'));
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
        expect(toggleButton).toHaveAttribute('aria-describedby', 'theme-toggle-description');
      });

      // Change theme and verify accessibility updates
      mockThemeUtils.resolveTheme.mockReturnValue('dark');
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-label', expect.stringContaining('Switch to light mode'));
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

        // Verify screen reader announcement
        const announcements = screen.getAllByRole('status', { hidden: true });
        const themeAnnouncement = announcements.find(el => el.classList.contains('sr-only'));
        expect(themeAnnouncement).toHaveTextContent('Switched to dark mode');
      });
    });

    it('should handle keyboard navigation throughout workflow', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      const toggleButton = screen.getByRole('button');

      // Test keyboard navigation
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      // Use Enter key to toggle
      mockThemeUtils.resolveTheme.mockReturnValue('dark');
      fireEvent.keyDown(toggleButton, { key: 'Enter' });

      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('dark');
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('dark');

      // Use Space key to toggle back
      mockThemeUtils.resolveTheme.mockReturnValue('light');
      fireEvent.keyDown(toggleButton, { key: ' ' });

      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('light');
      expect(mockThemeUtils.applyThemeToHtml).toHaveBeenCalledWith('light');

      // Verify focus is maintained
      expect(toggleButton).toHaveFocus();
    });

    it('should handle error recovery in complete workflow', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      // Start normally
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('light');
      mockThemeUtils.resolveTheme.mockReturnValue('light');

      render(<TestApp />);

      // Simulate storage error during theme change
      mockThemeUtils.saveThemeToStorage.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);

      // Should log error but continue functioning
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to set theme:', expect.any(Error));
      });

      // Subsequent operations should work normally
      mockThemeUtils.saveThemeToStorage.mockImplementation(() => { });
      mockThemeUtils.resolveTheme.mockReturnValue('dark');
      fireEvent.click(toggleButton);

      expect(mockThemeUtils.saveThemeToStorage).toHaveBeenCalledWith('dark');

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle component unmounting during theme operations', async () => {
      mockThemeUtils.loadThemeFromStorage.mockReturnValue('system');

      const mockCleanup = jest.fn();

      mockThemeUtils.createSystemThemeListener.mockImplementation(() => {
        return mockCleanup;
      });

      const { unmount } = render(<TestApp />);

      // Verify listener was created
      expect(mockThemeUtils.createSystemThemeListener).toHaveBeenCalledTimes(1);

      // Unmount component
      unmount();

      // Verify cleanup was called
      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple ThemeProvider instances gracefully', async () => {
      // This tests that the context works correctly even with nested providers
      function NestedApp() {
        return (
          <ThemeProvider>
            <ThemeProvider>
              <ThemeToggle />
            </ThemeProvider>
          </ThemeProvider>
        );
      }

      render(<NestedApp />);

      await waitFor(() => {
        // Should still work with nested providers
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });

    it('should handle theme changes during component initialization', async () => {
      // Mock theme change during initialization
      const initCallback: (() => void) | null = null;

      mockThemeUtils.loadThemeFromStorage.mockImplementation(() => {
        // Simulate async theme change during init
        setTimeout(() => {
          if (initCallback) initCallback();
        }, 0);
        return 'light';
      });

      render(<TestApp />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });
});
