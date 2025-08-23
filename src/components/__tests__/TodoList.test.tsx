import { render, screen } from '@testing-library/react'
import TodoList from '../TodoList'
import { Todo } from '../../types/todo'

// Mock the TodoItem component
jest.mock('../TodoItem', () => {
  return function MockTodoItem({ todo }: { todo: Todo }) {
    return <div data-testid={`todo-item-${todo.id}`}>{todo.text}</div>
  }
})

// Mock the EmptyState component
jest.mock('../EmptyState', () => {
  return function MockEmptyState() {
    return <div data-testid="empty-state">No todos</div>
  }
})

describe('TodoList Component', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'First todo',
      completed: false,
      createdAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      text: 'Second todo',
      completed: true,
      createdAt: new Date('2023-01-02'),
    },
    {
      id: '3',
      text: 'Third todo',
      completed: false,
      createdAt: new Date('2023-01-03'),
    },
  ]

  const mockProps = {
    onToggleTodo: jest.fn(),
    onDeleteTodo: jest.fn(),
  }

  it('should render EmptyState when no todos', () => {
    render(<TodoList todos={[]} {...mockProps} />)

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('should render all todos when todos exist', () => {
    render(<TodoList todos={mockTodos} {...mockProps} />)

    expect(screen.getByTestId('todo-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('todo-item-2')).toBeInTheDocument()
    expect(screen.getByTestId('todo-item-3')).toBeInTheDocument()
  })

  it('should render todos in creation order', () => {
    const unorderedTodos = [mockTodos[2], mockTodos[0], mockTodos[1]] // 3rd, 1st, 2nd
    render(<TodoList todos={unorderedTodos} {...mockProps} />)

    const todoItems = screen.getAllByTestId(/todo-item-/)
    expect(todoItems[0]).toHaveAttribute('data-testid', 'todo-item-1') // First created
    expect(todoItems[1]).toHaveAttribute('data-testid', 'todo-item-2') // Second created
    expect(todoItems[2]).toHaveAttribute('data-testid', 'todo-item-3') // Third created
  })

  it('should have proper accessibility attributes', () => {
    render(<TodoList todos={mockTodos} {...mockProps} />)

    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-label', 'タスクリスト（3個のタスク）')
  })

  it('should render each todo as a list item', () => {
    render(<TodoList todos={mockTodos} {...mockProps} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
  })
})
