'use client';

import { TodoListProps } from '@/types/todo';
import TodoItem from './TodoItem';
import EmptyState from './EmptyState';

/**
 * TodoList component for displaying a list of todo items
 * Handles empty state and renders todos in creation order
 */
export default function TodoList({ todos, onToggleTodo, onDeleteTodo }: TodoListProps) {
  // Requirement 4.2: Display appropriate message when task list is empty
  if (todos.length === 0) {
    return <EmptyState />;
  }

  // Requirement 4.3: Display tasks in the order they were added (by createdAt)
  const sortedTodos = [...todos].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div
      className="space-y-3 sm:space-y-4"
      role="list"
      aria-label={`タスクリスト（${todos.length}個のタスク）`}
    >
      {/* Requirement 4.1: Display all tasks when user opens the application */}
      {/* Requirement 4.4: Display completion state, task text, and delete button for each task */}
      {sortedTodos.map((todo, index) => (
        <div
          key={todo.id}
          role="listitem"
          className="animate-in slide-in-from-left duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TodoItem
            todo={todo}
            onToggleTodo={onToggleTodo}
            onDeleteTodo={onDeleteTodo}
          />
        </div>
      ))}
    </div>
  );
}
