import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  // DYNAMODB_ENDPOINTが設定されている場合のみローカルDynamoDBを使用
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
    },
  }),
});

export const dynamoDbClient = DynamoDBDocumentClient.from(client);

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'TodoTable';