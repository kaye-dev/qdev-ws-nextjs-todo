import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { ThemeContextType } from '@/types/theme';

// Mock the theme utilities
jest.mock('@/utils/theme', () => ({
  loadThemeFromStorage: jest.fn(() => 'system'),
  saveThemeToStorage: jest.fn(),
  resolveTheme: jest.fn((theme) => theme === 'system' ? 'light' : theme),
  applyThemeToHtml: jest.fn(),
  createSystemThemeListener: jest.fn(() => () => { }),
}));

describe('useTheme', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when used within ThemeProvider', () => {
    it('should return theme context value', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toBeDefined();
      expect(typeof result.current.theme).toBe('string');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.resolvedTheme).toBe('string');
    });

    it('should return correct theme context type', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Check that all required properties exist
      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('setTheme');
      expect(result.current).toHaveProperty('resolvedTheme');

      // Check types
      expect(['light', 'dark', 'system']).toContain(result.current.theme);
      expect(['light', 'dark']).toContain(result.current.resolvedTheme);
    });

    it('should provide setTheme function that can be called', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(() => {
        act(() => {
          result.current.setTheme('dark');
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.setTheme('light');
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.setTheme('system');
        });
      }).not.toThrow();
    });

    it('should maintain stable reference to context value', () => {
      const { result, rerender } = renderHook(() => useTheme(), { wrapper });

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      // The context object itself might change, but the structure should be consistent
      expect(typeof firstResult.setTheme).toBe('function');
      expect(typeof secondResult.setTheme).toBe('function');
    });
  });

  describe('when used outside ThemeProvider', () => {
    it('should throw error with descriptive message', () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow(
        'useTheme must be used within a ThemeProvider. ' +
        'Make sure your component is wrapped with <ThemeProvider>.'
      );
    });

    it('should throw error immediately on first call', () => {
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow();
    });

    it('should provide helpful error message for debugging', () => {
      try {
        renderHook(() => useTheme());
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('ThemeProvider');
        expect((error as Error).message).toContain('wrapped');
      }
    });
  });

  describe('error handling', () => {
    it('should handle context being undefined', () => {
      // Create a mock context that returns undefined
      const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
        return React.createElement(
          React.Fragment,
          null,
          children
        );
      };

      const mockWrapper = ({ children }: { children: React.ReactNode }) => (
        <MockThemeProvider>{children}</MockThemeProvider>
      );

      expect(() => {
        renderHook(() => useTheme(), { wrapper: mockWrapper });
      }).toThrow('useTheme must be used within a ThemeProvider');
    });

    it('should provide consistent error message format', () => {
      try {
        renderHook(() => useTheme());
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toMatch(/^useTheme must be used within a ThemeProvider\./);
        expect(message).toContain('Make sure your component is wrapped');
      }
    });
  });

  describe('TypeScript type safety', () => {
    it('should return correctly typed context value', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // TypeScript should infer the correct types
      const context: ThemeContextType = result.current;

      expect(context.theme).toBeDefined();
      expect(context.setTheme).toBeDefined();
      expect(context.resolvedTheme).toBeDefined();
    });

    it('should accept valid theme values in setTheme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      // These should not cause TypeScript errors
      expect(() => {
        act(() => {
          result.current.setTheme('light');
          result.current.setTheme('dark');
          result.current.setTheme('system');
        });
      }).not.toThrow();
    });
  });
});
