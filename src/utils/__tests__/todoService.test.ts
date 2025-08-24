import { saveTodoToDynamoDB } from '../todoService';
import { Todo } from '../../types/todo';

// DynamoDBクライアントをモック
jest.mock('../dynamodb', () => ({
  dynamoDbClient: {
    send: jest.fn(),
  },
  TABLE_NAME: 'TestTodoTable',
}));

describe('todoService', () => {
  it('should save todo to DynamoDB', async () => {
    const mockTodo: Todo = {
      id: 'test-id',
      text: 'Test todo',
      completed: false,
      createdAt: new Date('2024-01-01'),
    };

    await expect(saveTodoToDynamoDB(mockTodo)).resolves.not.toThrow();
  });
});