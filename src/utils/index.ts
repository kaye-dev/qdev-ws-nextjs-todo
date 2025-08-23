/**
 * Utility functions for the todo application
 */

// Storage utilities
export {
  loadTodosFromStorage,
  saveTodosToStorage,
  clearTodosFromStorage
} from './storage';

// UUID utilities
export {
  generateUUID,
  isValidUUID
} from './uuid';

// Validation utilities
export {
  validateTodoText,
  validateTodoDuplicate,
  validateTodo,
  sanitizeTodoText
} from './validation';

// Theme utilities
export {
  THEME_STORAGE_KEY,
  getSystemTheme,
  resolveTheme,
  loadThemeFromStorage,
  saveThemeToStorage,
  applyThemeToHtml,
  createSystemThemeListener
} from './theme';
