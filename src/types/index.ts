// Re-export all types for easier importing
export * from './todo';
export * from './theme';

/**
 * Generic utility types for the application
 */

/** Function type for event handlers that don't return anything */
export type VoidFunction = () => void;

/** Function type for event handlers that take a string parameter */
export type StringHandler = (value: string) => void;

/** Function type for event handlers that take an ID parameter */
export type IdHandler = (id: string) => void;
