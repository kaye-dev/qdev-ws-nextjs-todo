'use client';

import { useState, useEffect } from 'react';
import { Todo } from '../types/todo';
import TodoForm from './TodoForm';
import TodoList from './TodoList';

/**
 * TodoApp - Main container component for the todo application
 * Manages application state, handles CRUD operations, and syncs with localStorage
 */
export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/todos');
        if (response.ok) {
          const todosData = await response.json();
          setTodos(todosData);
        }
      } catch (error) {
        console.error('Failed to load initial todos:', error);
        setTodos([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleAddTodo = async (text: string) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add todo');
      }

      const newTodo = await response.json();
      setTodos(prevTodos => [...prevTodos, newTodo]);
    } catch (error) {
      console.error('Failed to add todo:', error);
      throw error;
    }
  };
  const handleToggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (response.ok) {
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === id
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  // Show loading state during initial data load
  if (isLoading) {
    return (
      <div className="text-center py-8 sm:py-12" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm sm:text-base transition-colors duration-300">読み込み中...</p>
        <span className="sr-only">タスクデータを読み込んでいます</span>
      </div>
    );
  }

  const completedCount = Array.isArray(todos) ? todos.filter(todo => todo.completed).length : 0;
  const totalCount = Array.isArray(todos) ? todos.length : 0;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Todo Form */}
      <section aria-labelledby="add-task-heading">
        <h2 id="add-task-heading" className="sr-only">新しいタスクを追加</h2>
        <TodoForm onAddTodo={handleAddTodo} />
      </section>

      {/* Todo List */}
      <section
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-600"
        aria-labelledby="task-list-heading"
      >
        <h2 id="task-list-heading" className="sr-only">タスクリスト</h2>
        <TodoList
          todos={Array.isArray(todos) ? todos : []}
          onToggleTodo={handleToggleTodo}
          onDeleteTodo={handleDeleteTodo}
        />
      </section>

      {/* Footer with task count */}
      {Array.isArray(todos) && todos.length > 0 && (
        <footer
          className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 transition-colors duration-300"
          role="status"
          aria-live="polite"
          aria-label={`タスクの進捗: ${completedCount}個完了、${pendingCount}個未完了、全${totalCount}個`}
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-sm"></div>
              <span>{pendingCount} 個の未完了タスク</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full shadow-sm"></div>
              <span>{completedCount} 個の完了タスク</span>
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">全 {totalCount} 個のタスク</span>
          </div>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mt-3 w-full max-w-xs mx-auto">
              <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-400">
                <span>進捗</span>
                <span className="font-medium">{Math.round((completedCount / totalCount) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 dark:from-blue-400 dark:to-green-400 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={completedCount}
                  aria-valuemin={0}
                  aria-valuemax={totalCount}
                  aria-label={`タスク完了進捗: ${completedCount}/${totalCount}`}
                ></div>
              </div>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
