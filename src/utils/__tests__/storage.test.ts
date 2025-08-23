import {
  loadTodosFromStorage,
  saveTodosToStorage,
  clearTodosFromStorage,
} from '../storage'
import { Todo } from '../../types/todo'

describe('Storage Utils', () => {
  // Mock console methods to suppress error messages during tests
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  beforeAll(() => {
    console.error = jest.fn()
    console.warn = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
  })
  const mockTodos: Todo[] = [
    {
      id: '1',
      text: 'Test todo 1',
      completed: false,
      createdAt: new Date('2023-01-01'),
    },
    {
      id: '2',
      text: 'Test todo 2',
      completed: true,
      createdAt: new Date('2023-01-02'),
    },
  ]

  describe('loadTodosFromStorage', () => {
    it('should return empty array when no data in localStorage', () => {
      localStorage.getItem.mockReturnValue(null)
      const result = loadTodosFromStorage()
      expect(result).toEqual([])
    })

    it('should return empty array when localStorage data is invalid JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json')
      const result = loadTodosFromStorage()
      expect(result).toEqual([])
    })

    it('should return empty array when localStorage data is not an array', () => {
      localStorage.getItem.mockReturnValue('{"not": "array"}')
      const result = loadTodosFromStorage()
      expect(result).toEqual([])
    })

    it('should load and parse valid todos from localStorage', () => {
      const storedData = JSON.stringify(mockTodos)
      localStorage.getItem.mockReturnValue(storedData)

      const result = loadTodosFromStorage()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[0].text).toBe('Test todo 1')
      expect(result[0].completed).toBe(false)
      expect(result[0].createdAt).toEqual(new Date('2023-01-01'))
    })

    it('should filter out invalid todo items', () => {
      const invalidData = JSON.stringify([
        mockTodos[0], // valid
        { id: 'invalid' }, // missing required fields
        mockTodos[1], // valid
        { text: 'no id' }, // missing id
      ])
      localStorage.getItem.mockReturnValue(invalidData)

      const result = loadTodosFromStorage()

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('1')
      expect(result[1].id).toBe('2')
    })

    it('should handle localStorage errors gracefully', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = loadTodosFromStorage()
      expect(result).toEqual([])
    })
  })

  describe('saveTodosToStorage', () => {
    it('should save todos to localStorage', () => {
      const result = saveTodosToStorage(mockTodos)

      expect(result).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'todos',
        JSON.stringify(mockTodos)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      localStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = saveTodosToStorage(mockTodos)
      expect(result).toBe(false)
    })
  })

  describe('clearTodosFromStorage', () => {
    it('should clear todos from localStorage', () => {
      const result = clearTodosFromStorage()

      expect(result).toBe(true)
      expect(localStorage.removeItem).toHaveBeenCalledWith('todos')
    })

    it('should handle localStorage errors gracefully', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = clearTodosFromStorage()
      expect(result).toBe(false)
    })
  })
})
