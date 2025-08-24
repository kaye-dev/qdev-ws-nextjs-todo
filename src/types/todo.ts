/**
 * Todo item interface representing a single task
 */
export interface Todo {
  /** Unique identifier for the todo item */
  id: string;
  /** The text content of the todo item */
  text: string;
  /** Whether the todo item is completed */
  completed: boolean;
  /** When the todo item was created */
  createdAt: Date;
}

/**
 * Props for components that handle todo operations
 */
export interface TodoOperations {
  /** Function to add a new todo */
  onAddTodo: (text: string) => void;
  /** Function to toggle todo completion status */
  onToggleTodo: (id: string) => void;
  /** Function to delete a todo */
  onDeleteTodo: (id: string) => void;
}

/**
 * Props for TodoForm component
 */
export interface TodoFormProps {
  /** Function called when a new todo should be added */
  onAddTodo: (text: string) => Promise<void>;
}

/**
 * Props for TodoList component
 */
export interface TodoListProps {
  /** Array of todo items to display */
  todos: Todo[];
  /** Function to toggle todo completion status */
  onToggleTodo: (id: string) => void;
  /** Function to delete a todo */
  onDeleteTodo: (id: string) => void;
}

/**
 * Props for TodoItem component
 */
export interface TodoItemProps {
  /** The todo item to display */
  todo: Todo;
  /** Function to toggle todo completion status */
  onToggleTodo: (id: string) => void;
  /** Function to delete a todo */
  onDeleteTodo: (id: string) => void;
}

/**
 * Form validation error types
 */
export interface ValidationError {
  /** Error message to display */
  message: string;
  /** Field that has the error */
  field: string;
}

/**
 * Local storage utility types
 */
export type TodoStorageKey = 'todos';

/**
 * Constants for todo validation
 */
export const TODO_CONSTANTS = {
  /** Maximum length for todo text */
  MAX_TEXT_LENGTH: 200,
  /** Minimum length for todo text */
  MIN_TEXT_LENGTH: 1,
} as const;
