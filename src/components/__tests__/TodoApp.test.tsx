import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoApp from '../TodoApp'
import { Todo } from '../../types/todo'

// Mock the storage functions
jest.mock('../../utils/storage', () => ({
  loadTodosFromStorage: jest.fn(),
  saveTodosToStorage: jest.fn(),
}))

import { loadTodosFromStorage, saveTodosToStorage } from '../../utils/storage'

describe('TodoApp Integration Tests', () => {
  const mockLoadTodosFromStorage = loadTodosFromStorage as jest.MockedFunction<typeof loadTodosFromStorage>
  const mockSaveTodosToStorage = saveTodosToStorage as jest.MockedFunction<typeof saveTodosToStorage>

  // Mock console methods to suppress error messages during tests
  const originalConsoleError = console.error

  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'Existing todo 1',
      completed: false,
      createdAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      text: 'Existing todo 2',
      completed: true,
      createdAt: new Date('2023-01-02'),
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockLoadTodosFromStorage.mockReturnValue([])
    mockSaveTodosToStorage.mockReturnValue(true)
  })

  it('should load initial todos from storage', async () => {
    mockLoadTodosFromStorage.mockReturnValue(mockTodos)

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('Existing todo 1')).toBeInTheDocument()
      expect(screen.getByText('Existing todo 2')).toBeInTheDocument()
    })
  })

  it('should show loading state initially', async () => {
    // Mock loadTodosFromStorage to return empty array
    mockLoadTodosFromStorage.mockReturnValue([])

    render(<TodoApp />)

    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    })
  })

  it('should show empty state when no todos', async () => {
    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    })
  })

  it('should add new todo', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    await user.type(input, 'New todo item')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('New todo item')).toBeInTheDocument()
    })

    expect(mockSaveTodosToStorage).toHaveBeenCalled()
  })

  it('should toggle todo completion', async () => {
    const user = userEvent.setup()
    mockLoadTodosFromStorage.mockReturnValue([mockTodos[0]]) // Only incomplete todo

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('Existing todo 1')).toBeInTheDocument()
    })

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)

    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })

    expect(mockSaveTodosToStorage).toHaveBeenCalled()
  })

  it('should delete todo', async () => {
    const user = userEvent.setup()
    mockLoadTodosFromStorage.mockReturnValue([mockTodos[0]])

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('Existing todo 1')).toBeInTheDocument()
    })

    const deleteButton = screen.getByRole('button', { name: /削除/ })
    await user.click(deleteButton)

    await waitFor(() => {
      expect(screen.queryByText('Existing todo 1')).not.toBeInTheDocument()
      expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    })

    expect(mockSaveTodosToStorage).toHaveBeenCalled()
  })

  it('should show task count and progress', async () => {
    mockLoadTodosFromStorage.mockReturnValue(mockTodos)

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('1 個の未完了タスク')).toBeInTheDocument()
      expect(screen.getByText('1 個の完了タスク')).toBeInTheDocument()
      expect(screen.getByText('全 2 個のタスク')).toBeInTheDocument()
    })

    // Check progress bar
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('aria-valuenow', '1')
    expect(progressBar).toHaveAttribute('aria-valuemax', '2')
  })

  it('should handle storage loading errors gracefully', async () => {
    mockLoadTodosFromStorage.mockImplementation(() => {
      throw new Error('Storage error')
    })

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    })
  })

  it('should handle todo addition errors gracefully', async () => {
    const user = userEvent.setup()

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('新しいタスクを入力...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    const submitButton = screen.getByRole('button', { name: /タスクを追加/ })

    // Try to submit empty input (should show validation error)
    await user.type(input, ' ')
    await user.click(submitButton)

    expect(screen.getByText('タスクの内容を入力してください')).toBeInTheDocument()
  })

  it('should complete full user workflow', async () => {
    const user = userEvent.setup()
    render(<TodoApp />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    })

    // Add first todo
    const input = screen.getByPlaceholderText('新しいタスクを入力...')
    await user.type(input, 'First task')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('First task')).toBeInTheDocument()
    })

    // Add second todo
    await user.type(input, 'Second task')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(screen.getByText('Second task')).toBeInTheDocument()
    })

    // Complete first task
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked()
    })

    // Verify progress
    expect(screen.getByText('1 個の未完了タスク')).toBeInTheDocument()
    expect(screen.getByText('1 個の完了タスク')).toBeInTheDocument()

    // Delete completed task
    const deleteButtons = screen.getAllByRole('button', { name: /削除/ })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('First task')).not.toBeInTheDocument()
      expect(screen.getByText('Second task')).toBeInTheDocument()
    })

    // Verify final state
    expect(screen.getByText('1 個の未完了タスク')).toBeInTheDocument()
    expect(screen.getByText('0 個の完了タスク')).toBeInTheDocument()
  })
})
