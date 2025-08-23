import { Todo, TodoStorageKey } from '../types/todo';

/**
 * Local storage utility functions for todo persistence
 */

const STORAGE_KEY: TodoStorageKey = 'todos';

/**
 * Reads todos from local storage
 * @returns Array of todos or empty array if none exist or error occurs
 */
export function loadTodosFromStorage(): Todo[] {
  try {
    if (typeof window === 'undefined') {
      // Server-side rendering - return empty array
      return [];
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid todos data in localStorage, resetting to empty array');
      return [];
    }

    // Convert createdAt strings back to Date objects and validate structure
    return parsed.map((item: unknown) => ({
      id: (item as Record<string, unknown>).id,
      text: (item as Record<string, unknown>).text,
      completed: Boolean((item as Record<string, unknown>).completed),
      createdAt: new Date((item as Record<string, unknown>).createdAt as string),
    })).filter((item: unknown) => {
      const todoItem = item as Record<string, unknown>;
      return (
        // Filter out invalid items
        typeof todoItem.id === 'string' &&
        typeof todoItem.text === 'string' &&
        typeof todoItem.completed === 'boolean' &&
        todoItem.createdAt instanceof Date &&
        !isNaN((todoItem.createdAt as Date).getTime())
      );
    }) as Todo[];
  } catch (error) {
    console.error('Error loading todos from localStorage:', error);
    return [];
  }
}

/**
 * Saves todos to local storage
 * @param todos Array of todos to save
 * @returns boolean indicating success
 */
export function saveTodosToStorage(todos: Todo[]): boolean {
  try {
    if (typeof window === 'undefined') {
      // Server-side rendering - cannot save
      return false;
    }

    const serialized = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Error saving todos to localStorage:', error);
    return false;
  }
}

/**
 * Clears all todos from local storage
 * @returns boolean indicating success
 */
export function clearTodosFromStorage(): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing todos from localStorage:', error);
    return false;
  }
}
