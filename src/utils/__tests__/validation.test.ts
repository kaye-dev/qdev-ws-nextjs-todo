import {
  validateTodoText,
  validateTodoDuplicate,
  validateTodo,
  sanitizeTodoText,
} from '../validation'

describe('Validation Utils', () => {
  describe('validateTodoText', () => {
    it('should return error for empty text', () => {
      const result = validateTodoText('')
      expect(result).toEqual({
        message: 'タスクの内容を入力してください',
        field: 'text'
      })
    })

    it('should return error for whitespace only text', () => {
      const result = validateTodoText('   ')
      expect(result).toEqual({
        message: 'タスクの内容を入力してください',
        field: 'text'
      })
    })

    it('should return error for text exceeding max length', () => {
      const longText = 'a'.repeat(201)
      const result = validateTodoText(longText)
      expect(result).toEqual({
        message: 'タスクの内容は200文字以内で入力してください',
        field: 'text'
      })
    })

    it('should return null for valid text', () => {
      const result = validateTodoText('Valid todo text')
      expect(result).toBeNull()
    })

    it('should return null for text at max length', () => {
      const maxText = 'a'.repeat(200)
      const result = validateTodoText(maxText)
      expect(result).toBeNull()
    })
  })

  describe('validateTodoDuplicate', () => {
    const existingTexts = ['Buy milk', 'Walk the dog', 'Read book']

    it('should return error for exact duplicate', () => {
      const result = validateTodoDuplicate('Buy milk', existingTexts)
      expect(result).toEqual({
        message: '同じ内容のタスクが既に存在します',
        field: 'text'
      })
    })

    it('should return error for case-insensitive duplicate', () => {
      const result = validateTodoDuplicate('BUY MILK', existingTexts)
      expect(result).toEqual({
        message: '同じ内容のタスクが既に存在します',
        field: 'text'
      })
    })

    it('should return error for duplicate with extra whitespace', () => {
      const result = validateTodoDuplicate('  Buy milk  ', existingTexts)
      expect(result).toEqual({
        message: '同じ内容のタスクが既に存在します',
        field: 'text'
      })
    })

    it('should return null for unique text', () => {
      const result = validateTodoDuplicate('New unique task', existingTexts)
      expect(result).toBeNull()
    })
  })

  describe('validateTodo', () => {
    const existingTexts = ['Existing task']

    it('should return text validation error first', () => {
      const result = validateTodo('', existingTexts)
      expect(result).toEqual({
        message: 'タスクの内容を入力してください',
        field: 'text'
      })
    })

    it('should return duplicate error for valid text that duplicates', () => {
      const result = validateTodo('Existing task', existingTexts)
      expect(result).toEqual({
        message: '同じ内容のタスクが既に存在します',
        field: 'text'
      })
    })

    it('should return null for valid unique text', () => {
      const result = validateTodo('New unique task', existingTexts)
      expect(result).toBeNull()
    })

    it('should work without existing texts', () => {
      const result = validateTodo('Any task')
      expect(result).toBeNull()
    })
  })

  describe('sanitizeTodoText', () => {
    it('should trim whitespace', () => {
      const result = sanitizeTodoText('  Task with spaces  ')
      expect(result).toBe('Task with spaces')
    })

    it('should normalize multiple spaces', () => {
      const result = sanitizeTodoText('Task   with    multiple     spaces')
      expect(result).toBe('Task with multiple spaces')
    })

    it('should handle mixed whitespace', () => {
      const result = sanitizeTodoText('  Task\t\nwith\r\nmixed   whitespace  ')
      expect(result).toBe('Task with mixed whitespace')
    })
  })
})
