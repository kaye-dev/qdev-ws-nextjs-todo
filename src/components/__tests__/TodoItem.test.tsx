import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoItem from '../TodoItem'
import { Todo } from '../../types/todo'

describe('TodoItem Component', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test todo item',
    completed: false,
    createdAt: new Date('2023-01-01'),
  }

  const mockCompletedTodo: Todo = {
    ...mockTodo,
    completed: true,
  }

  const mockProps = {
    onToggleTodo: jest.fn(),
    onDeleteTodo: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render todo text', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    expect(screen.getByText('Test todo item')).toBeInTheDocument()
  })

  it('should render unchecked checkbox for incomplete todo', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('should render checked checkbox for completed todo', () => {
    render(<TodoItem todo={mockCompletedTodo} {...mockProps} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should apply strikethrough style to completed todo text', () => {
    render(<TodoItem todo={mockCompletedTodo} {...mockProps} />)

    const todoText = screen.getByText('Test todo item')
    expect(todoText).toHaveClass('line-through')
  })

  it('should not apply strikethrough style to incomplete todo text', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const todoText = screen.getByText('Test todo item')
    expect(todoText).not.toHaveClass('line-through')
  })

  it('should call onToggleTodo when checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(mockProps.onToggleTodo).toHaveBeenCalledWith('1')
  })

  it('should call onDeleteTodo when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const deleteButton = screen.getByRole('button', { name: /削除/ })
    await user.click(deleteButton)

    expect(mockProps.onDeleteTodo).toHaveBeenCalledWith('1')
  })

  it('should have proper accessibility attributes', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    const checkbox = screen.getByRole('checkbox')
    const todoText = screen.getByText('Test todo item')
    const deleteButton = screen.getByRole('button', { name: /削除/ })

    expect(checkbox).toHaveAttribute('aria-describedby', 'todo-text-1')
    expect(todoText).toHaveAttribute('id', 'todo-text-1')
    expect(todoText).toHaveAttribute('role', 'text')
    expect(deleteButton).toHaveAttribute('aria-label', 'タスク「Test todo item」を削除する')
  })

  it('should have proper screen reader labels', () => {
    render(<TodoItem todo={mockTodo} {...mockProps} />)

    expect(screen.getByLabelText('Test todo itemを完了にする')).toBeInTheDocument()
  })

  it('should have proper screen reader labels for completed todo', () => {
    render(<TodoItem todo={mockCompletedTodo} {...mockProps} />)

    expect(screen.getByLabelText('Test todo itemを未完了にする')).toBeInTheDocument()
  })
})
