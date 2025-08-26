import { PutCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { PublishCommand, SubscribeCommand, UnsubscribeCommand } from '@aws-sdk/client-sns';
import { dynamoDbClient } from './dynamodb';
import { snsClient, SNS_TOPIC_ARN } from './sns';
import { NotificationSetting } from '../types/notification';

const NOTIFICATION_TABLE_NAME = process.env.NOTIFICATION_TABLE_NAME || 'NotificationSettings';

export async function saveNotificationToDynamoDB(notification: NotificationSetting): Promise<void> {
  const command = new PutCommand({
    TableName: NOTIFICATION_TABLE_NAME,
    Item: {
      id: notification.id,
      email: notification.email,
      enabled: notification.enabled,
      createdAt: notification.createdAt.toISOString(),
      updatedAt: notification.updatedAt.toISOString(),
    },
  });

  await dynamoDbClient.send(command);
}

export async function loadNotificationsFromDynamoDB(): Promise<NotificationSetting[]> {
  const command = new ScanCommand({
    TableName: NOTIFICATION_TABLE_NAME,
  });

  const result = await dynamoDbClient.send(command);
  
  return (result.Items || []).map(item => ({
    id: item.id,
    email: item.email,
    enabled: item.enabled,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  }));
}

export async function updateNotificationInDynamoDB(id: string, enabled: boolean): Promise<void> {
  const command = new UpdateCommand({
    TableName: NOTIFICATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'SET enabled = :enabled, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':enabled': enabled,
      ':updatedAt': new Date().toISOString(),
    },
  });

  await dynamoDbClient.send(command);
}

export async function deleteNotificationFromDynamoDB(id: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: NOTIFICATION_TABLE_NAME,
    Key: { id },
  });

  await dynamoDbClient.send(command);
}

export async function subscribeEmailToSNS(email: string): Promise<string> {
  console.log('Subscribing email to SNS:', email, 'Topic:', SNS_TOPIC_ARN);
  
  const command = new SubscribeCommand({
    TopicArn: SNS_TOPIC_ARN,
    Protocol: 'email',
    Endpoint: email,
  });

  try {
    const result = await snsClient.send(command);
    console.log('SNS subscription successful:', result.SubscriptionArn);
    return result.SubscriptionArn || '';
  } catch (error) {
    console.error('SNS subscription failed:', error);
    throw error;
  }
}

export async function unsubscribeFromSNS(subscriptionArn: string): Promise<void> {
  const command = new UnsubscribeCommand({
    SubscriptionArn: subscriptionArn,
  });

  await snsClient.send(command);
}

export async function publishTaskNotification(taskText: string): Promise<void> {
  console.log('publishTaskNotification called with:', taskText);
  console.log('SNS_TOPIC_ARN:', SNS_TOPIC_ARN);
  
  if (!SNS_TOPIC_ARN) {
    console.warn('SNS_TOPIC_ARN is not configured');
    return;
  }

  // 有効な通知設定があるかチェック
  try {
    const notifications = await loadNotificationsFromDynamoDB();
    const enabledNotifications = notifications.filter(n => n.enabled);
    console.log('Enabled notifications count:', enabledNotifications.length);
    
    if (enabledNotifications.length === 0) {
      console.log('No enabled notifications found, skipping SNS publish');
      return;
    }
  } catch (error) {
    console.error('Failed to check notifications:', error);
  }

  const message = `新しいタスクが追加されました: ${taskText}`;
  const subject = 'Todo アプリ - 新しいタスク追加';

  console.log('Publishing to SNS:', { message, subject, topicArn: SNS_TOPIC_ARN });

  const command = new PublishCommand({
    TopicArn: SNS_TOPIC_ARN,
    Message: message,
    Subject: subject,
  });

  try {
    const result = await snsClient.send(command);
    console.log('SNS publish successful:', result.MessageId);
  } catch (error) {
    console.error('SNS publish failed:', error);
    throw error;
  }
}