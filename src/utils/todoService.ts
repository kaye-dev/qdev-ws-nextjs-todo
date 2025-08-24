import { PutCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient, TABLE_NAME } from './dynamodb';
import { Todo } from '../types/todo';

export async function saveTodoToDynamoDB(todo: Todo): Promise<void> {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      createdAt: todo.createdAt.toISOString(),
    },
  });

  await dynamoDbClient.send(command);
}

export async function loadTodosFromDynamoDB(): Promise<Todo[]> {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
  });

  const result = await dynamoDbClient.send(command);
  
  return (result.Items || []).map(item => ({
    id: item.id,
    text: item.text,
    completed: item.completed,
    createdAt: new Date(item.createdAt),
  }));
}

export async function updateTodoInDynamoDB(id: string, completed: boolean): Promise<void> {
  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'SET completed = :completed',
    ExpressionAttributeValues: {
      ':completed': completed,
    },
  });

  await dynamoDbClient.send(command);
}

export async function deleteTodoFromDynamoDB(id: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { id },
  });

  await dynamoDbClient.send(command);
}