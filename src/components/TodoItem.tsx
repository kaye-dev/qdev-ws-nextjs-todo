'use client';

import { TodoItemProps } from '@/types/todo';

/**
 * TodoItem component for displaying individual todo items
 * Handles completion state toggle and deletion
 */
export default function TodoItem({ todo, onToggleTodo, onDeleteTodo }: TodoItemProps) {
  const handleToggle = () => {
    onToggleTodo(todo.id);
  };

  const handleDelete = () => {
    onDeleteTodo(todo.id);
  };

  return (
    <div className="group flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:bg-white hover:border-gray-200 transition-all duration-300 ease-in-out transform hover:scale-[1.01] hover:-translate-y-0.5">
      {/* Checkbox for completion state */}
      <label className="flex items-center cursor-pointer min-h-[44px] min-w-[44px] justify-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 bg-white border-2 border-gray-200 rounded-md outline-none focus:outline-none focus:ring-0 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
          aria-describedby={`todo-text-${todo.id}`}
        />
        <span className="sr-only">
          {todo.completed ? `${todo.text}を未完了にする` : `${todo.text}を完了にする`}
        </span>
      </label>

      {/* Todo text with conditional strikethrough */}
      <span
        id={`todo-text-${todo.id}`}
        className={`flex-1 text-sm sm:text-base leading-relaxed select-text ${todo.completed
          ? 'line-through text-gray-500 opacity-75'
          : 'text-gray-900'
          } transition-all duration-300 ease-in-out`}
        role="text"
        aria-label={`タスク: ${todo.text}${todo.completed ? ' (完了済み)' : ' (未完了)'}`}
      >
        {todo.text}
      </span>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 group-hover:opacity-100 opacity-70"
        aria-label={`タスク「${todo.text}」を削除する`}
        type="button"
        title="タスクを削除"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
