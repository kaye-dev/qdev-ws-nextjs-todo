import {
  THEME_STORAGE_KEY,
  getSystemTheme,
  resolveTheme,
  loadThemeFromStorage,
  saveThemeToStorage,
  applyThemeToHtml,
  createSystemThemeListener
} from '../theme';

// Mock window and localStorage
const mockMatchMedia = jest.fn();
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock document
const mockDocumentElement = {
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn()
  }
};

// Mock MediaQueryList
const mockMediaQueryList = {
  matches: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

describe('theme utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup window mocks
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    });

    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: mockLocalStorage
    });

    // Setup document mock
    Object.defineProperty(document, 'documentElement', {
      writable: true,
      value: mockDocumentElement
    });

    mockMatchMedia.mockReturnValue(mockMediaQueryList);
  });

  describe('THEME_STORAGE_KEY', () => {
    it('should have the correct storage key', () => {
      expect(THEME_STORAGE_KEY).toBe('theme-preference');
    });
  });

  describe('getSystemTheme', () => {
    it('should return "light" when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Temporarily delete window to test SSR behavior
      delete global.window;

      const result = getSystemTheme();
      expect(result).toBe('light');

      global.window = originalWindow;
    });

    it('should return "dark" when system prefers dark mode', () => {
      mockMediaQueryList.matches = true;

      const result = getSystemTheme();
      expect(result).toBe('dark');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return "light" when system prefers light mode', () => {
      mockMediaQueryList.matches = false;

      const result = getSystemTheme();
      expect(result).toBe('light');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should return "light" when matchMedia throws an error', () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = getSystemTheme();
      expect(result).toBe('light');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to detect system theme:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('resolveTheme', () => {
    it('should return "light" when theme is "light"', () => {
      const result = resolveTheme('light');
      expect(result).toBe('light');
    });

    it('should return "dark" when theme is "dark"', () => {
      const result = resolveTheme('dark');
      expect(result).toBe('dark');
    });

    it('should return system theme when theme is "system"', () => {
      mockMediaQueryList.matches = true;

      const result = resolveTheme('system');
      expect(result).toBe('dark');
      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });
  });

  describe('loadThemeFromStorage', () => {
    it('should return "system" when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Temporarily delete window to test SSR behavior
      delete global.window;

      const result = loadThemeFromStorage();
      expect(result).toBe('system');

      global.window = originalWindow;
    });

    it('should return stored theme when valid theme exists', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');

      const result = loadThemeFromStorage();
      expect(result).toBe('dark');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
    });

    it('should return "system" when no stored theme exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = loadThemeFromStorage();
      expect(result).toBe('system');
    });

    it('should return "system" when stored theme is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');

      const result = loadThemeFromStorage();
      expect(result).toBe('system');
    });

    it('should return "system" when localStorage throws an error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = loadThemeFromStorage();
      expect(result).toBe('system');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load theme from storage:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('saveThemeToStorage', () => {
    it('should handle SSR environment gracefully', () => {
      const originalWindow = (global as typeof globalThis).window;
      delete (global as typeof globalThis).window;

      // Should not throw an error in SSR environment
      expect(() => {
        saveThemeToStorage('dark');
      }).not.toThrow();

      // Restore window
      (global as typeof globalThis).window = originalWindow;
    });

    it('should save theme to localStorage', () => {
      saveThemeToStorage('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      saveThemeToStorage('dark');
      expect(consoleSpy).toHaveBeenCalledWith('Failed to save theme to storage:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('applyThemeToHtml', () => {
    it('should not apply theme when document is undefined (SSR)', () => {
      const originalDocument = global.document;
      // @ts-expect-error - Temporarily delete document to test SSR behavior
      delete global.document;

      applyThemeToHtml('dark');

      global.document = originalDocument;
    });

    it('should remove existing theme classes and add new one', () => {
      applyThemeToHtml('dark');

      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark', 'system');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should apply light theme correctly', () => {
      applyThemeToHtml('light');

      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark', 'system');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('light');
    });

    it('should apply system theme correctly', () => {
      applyThemeToHtml('system');

      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark', 'system');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('system');
    });
  });

  describe('createSystemThemeListener', () => {
    it('should return empty cleanup function when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      // @ts-expect-error - Temporarily delete window to test SSR behavior
      delete global.window;

      const callback = jest.fn();
      const cleanup = createSystemThemeListener(callback);

      expect(typeof cleanup).toBe('function');
      cleanup(); // Should not throw

      global.window = originalWindow;
    });

    it('should create media query listener and return cleanup function', () => {
      const callback = jest.fn();

      const cleanup = createSystemThemeListener(callback);

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(typeof cleanup).toBe('function');
    });

    it('should call callback with "dark" when media query matches', () => {
      const callback = jest.fn();
      let changeHandler: (e: MediaQueryListEvent) => void;

      mockMediaQueryList.addEventListener.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      createSystemThemeListener(callback);

      // Simulate media query change
      changeHandler!({ matches: true } as MediaQueryListEvent);

      expect(callback).toHaveBeenCalledWith('dark');
    });

    it('should call callback with "light" when media query does not match', () => {
      const callback = jest.fn();
      let changeHandler: (e: MediaQueryListEvent) => void;

      mockMediaQueryList.addEventListener.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      createSystemThemeListener(callback);

      // Simulate media query change
      changeHandler!({ matches: false } as MediaQueryListEvent);

      expect(callback).toHaveBeenCalledWith('light');
    });

    it('should remove event listener when cleanup is called', () => {
      const callback = jest.fn();

      const cleanup = createSystemThemeListener(callback);
      cleanup();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should handle matchMedia errors gracefully', () => {
      mockMatchMedia.mockImplementation(() => {
        throw new Error('matchMedia not supported');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const callback = jest.fn();

      const cleanup = createSystemThemeListener(callback);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to create system theme listener:', expect.any(Error));
      expect(typeof cleanup).toBe('function');
      cleanup(); // Should not throw

      consoleSpy.mockRestore();
    });
  });
});
