import { ValidationError, TODO_CONSTANTS } from '../types/todo';

/**
 * Validation utility functions for todo operations
 */

/**
 * Validates todo text input
 * @param text The text to validate
 * @returns ValidationError if invalid, null if valid
 */
export function validateTodoText(text: string): ValidationError | null {
  // Check if text is empty or only whitespace
  if (!text || text.trim().length === 0) {
    return {
      message: 'タスクの内容を入力してください',
      field: 'text'
    };
  }

  // Check minimum length
  if (text.trim().length < TODO_CONSTANTS.MIN_TEXT_LENGTH) {
    return {
      message: 'タスクの内容は1文字以上で入力してください',
      field: 'text'
    };
  }

  // Check maximum length
  if (text.length > TODO_CONSTANTS.MAX_TEXT_LENGTH) {
    return {
      message: `タスクの内容は${TODO_CONSTANTS.MAX_TEXT_LENGTH}文字以内で入力してください`,
      field: 'text'
    };
  }

  return null;
}

/**
 * Validates if a todo text already exists in the list (case-insensitive)
 * @param text The text to check for duplicates
 * @param existingTexts Array of existing todo texts
 * @returns ValidationError if duplicate found, null if unique
 */
export function validateTodoDuplicate(text: string, existingTexts: string[]): ValidationError | null {
  const normalizedText = text.trim().toLowerCase();
  const isDuplicate = existingTexts.some(existing =>
    existing.trim().toLowerCase() === normalizedText
  );

  if (isDuplicate) {
    return {
      message: '同じ内容のタスクが既に存在します',
      field: 'text'
    };
  }

  return null;
}

/**
 * Validates all aspects of todo text input
 * @param text The text to validate
 * @param existingTexts Array of existing todo texts (optional)
 * @returns ValidationError if invalid, null if valid
 */
export function validateTodo(text: string, existingTexts: string[] = []): ValidationError | null {
  // First validate the text format
  const textValidation = validateTodoText(text);
  if (textValidation) {
    return textValidation;
  }

  // Then check for duplicates if existing texts provided
  if (existingTexts.length > 0) {
    const duplicateValidation = validateTodoDuplicate(text, existingTexts);
    if (duplicateValidation) {
      return duplicateValidation;
    }
  }

  return null;
}

/**
 * Sanitizes todo text by trimming whitespace and normalizing
 * @param text The text to sanitize
 * @returns Sanitized text
 */
export function sanitizeTodoText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}
