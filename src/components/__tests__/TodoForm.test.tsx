import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoForm from '../TodoForm'

describe('TodoForm Component', () => {
  const mockOnAddTodo = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render input field and submit button', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /タスクを追加/ })).toBeInTheDocument()
  })

  it('should update input value when typing', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    await user.type(input, 'New todo item')

    expect(input).toHaveValue('New todo item')
  })

  it('should show character count', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    await user.type(input, 'Test')

    expect(screen.getByText('4/200')).toBeInTheDocument()
  })

  it('should disable submit button when input is empty', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when input has text', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    await user.type(input, 'New todo')

    expect(submitButton).not.toBeDisabled()
  })

  it('should call onAddTodo when form is submitted', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    await user.type(input, 'New todo item')
    await user.click(submitButton)

    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo item')
  })

  it('should call onAddTodo when Enter key is pressed', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')

    await user.type(input, 'New todo item')
    await user.keyboard('{Enter}')

    expect(mockOnAddTodo).toHaveBeenCalledWith('New todo item')
  })

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup()
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    await user.type(input, 'New todo item')
    await user.click(submitButton)

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('should display validation error', async () => {
    const user = userEvent.setup()

    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    await user.type(input, ' ') // Invalid input (only whitespace)
    await user.click(submitButton)

    expect(screen.getByText('タスクの内容を入力してください')).toBeInTheDocument()
    expect(mockOnAddTodo).not.toHaveBeenCalled()
  })

  it('should clear error when user starts typing', async () => {
    const user = userEvent.setup()

    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    // Trigger error
    await user.type(input, ' ')
    await user.click(submitButton)
    expect(screen.getByText('タスクの内容を入力してください')).toBeInTheDocument()

    // Clear error by typing valid content
    await user.clear(input)
    await user.type(input, 'Valid input')

    expect(screen.queryByText('タスクの内容を入力してください')).not.toBeInTheDocument()
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: void) => void
    const slowOnAddTodo = jest.fn(() => new Promise<void>(resolve => {
      resolvePromise = resolve
    }))

    render(<TodoForm onAddTodo={slowOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    await user.type(input, 'New todo')
    await user.click(submitButton)

    expect(screen.getByText('追加中...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolvePromise!()
    await waitFor(() => {
      expect(screen.getByText('タスクを追加')).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')

    expect(input).toHaveAttribute('aria-label', '新しいタスクを入力してください')
    expect(input).toHaveAttribute('maxLength', '200')
  })

  it('should have proper accessibility attributes when error occurs', async () => {
    const user = userEvent.setup()

    render(<TodoForm onAddTodo={mockOnAddTodo} />)

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    await user.type(input, ' ')
    await user.click(submitButton)

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'todo-error char-count')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
