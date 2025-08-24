import { DynamoDBClient, CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'ap-northeast-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
  },
});

async function setupTable(): Promise<void> {
  try {
    const listCommand = new ListTablesCommand({});
    const tables = await client.send(listCommand);
    
    if (tables.TableNames && tables.TableNames.includes('TodoTable')) {
      console.log('TodoTable already exists');
      return;
    }

    const createCommand = new CreateTableCommand({
      TableName: 'TodoTable',
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
      AttributeDefinitions: [
        {
          AttributeName: 'id',
          AttributeType: 'S',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });

    await client.send(createCommand);
    console.log('TodoTable created successfully');
  } catch (error) {
    console.error('Error setting up DynamoDB table:', (error as Error).message);
    process.exit(1);
  }
}

setupTable();