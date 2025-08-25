'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { TodoFormProps, ValidationError } from '../types/todo';
import { validateTodo, sanitizeTodoText } from '../utils/validation';

/**
 * TodoForm component for adding new todo items
 * Handles input validation, form submission, and error display
 */
export default function TodoForm({ onAddTodo }: TodoFormProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<ValidationError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitTodo();
  };

  /**
   * Handles Enter key press in input field
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitTodo();
    }
  };

  /**
   * Submits the todo after validation
   */
  const submitTodo = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate the input
      const validationError = validateTodo(inputValue);

      if (validationError) {
        setError(validationError);
        setIsSubmitting(false);
        return;
      }

      // Sanitize and submit the todo
      const sanitizedText = sanitizeTodoText(inputValue);
      await onAddTodo(sanitizedText);

      // Clear the input field on successful submission
      setInputValue('');
      setError(null);
    } catch {
      setError({
        message: 'タスクの追加中にエラーが発生しました',
        field: 'text'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles input value changes and clears errors
   */
  const handleInputChange = (value: string) => {
    setInputValue(value);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-md hover:border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="新しいタスクを入力..."
              disabled={isSubmitting}
              className={`
              w-full px-4 py-3 text-base border rounded-lg
              min-h-[44px] sm:min-h-[48px]
              outline-none focus:outline-none focus:ring-0 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
              transform hover:scale-[1.01] focus:scale-[1.01]
              placeholder:text-gray-400
              ${error
                  ? 'border-red-400 bg-red-50 text-gray-900 focus:ring-red-400 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-white focus:ring-blue-400 focus:bg-white hover:shadow-sm focus:shadow-md'
                }
            `}
              maxLength={200}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'todo-error char-count' : 'char-count'}
              aria-label="新しいタスクを入力してください"
            />

            {/* Character count indicator */}
            <div
              id="char-count"
              className={`absolute right-3 top-3 text-xs transition-colors duration-200 ${inputValue.length > 180
                ? 'text-red-500 font-medium'
                : 'text-gray-400'
                }`}
              aria-live="polite"
              aria-label={`${inputValue.length}文字入力済み、最大200文字`}
            >
              {inputValue.length}/200
            </div>
          </div>

          {/* Error message display */}
          {error && (
            <div
              id="todo-error"
              className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3 animate-in slide-in-from-top-2 duration-300"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error.message}
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || inputValue.length === 0}
            className={`
            w-full py-3 px-4 text-base font-medium rounded-lg
            min-h-[44px] sm:min-h-[48px]
            transition-all duration-300 ease-in-out
            transform hover:scale-[1.02] active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isSubmitting || inputValue.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-400 focus:ring-offset-gray-100'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 hover:shadow-lg focus:shadow-lg focus:ring-blue-500 focus:ring-offset-white'
              }
          `}
            aria-label={isSubmitting ? 'タスクを追加中です' : 'タスクを追加する'}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>追加中...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>タスクを追加</span>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
