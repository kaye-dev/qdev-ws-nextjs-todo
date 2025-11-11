import { SNSClient, SubscribeCommand, UnsubscribeCommand, ListSubscriptionsByTopicCommand, PublishCommand } from '@aws-sdk/client-sns';
import type { Subscription, NotificationMessage } from '@/types/notification';

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const topicArn = process.env.SNS_TOPIC_ARN;

if (!topicArn) {
  console.warn('SNS_TOPIC_ARN is not set');
}

export async function subscribeEmail(email: string): Promise<string> {
  if (!topicArn) throw new Error('SNS_TOPIC_ARN is not configured');

  const command = new SubscribeCommand({
    TopicArn: topicArn,
    Protocol: 'email',
    Endpoint: email,
  });

  const response = await snsClient.send(command);
  return response.SubscriptionArn || 'pending confirmation';
}

export async function listSubscriptions(): Promise<Subscription[]> {
  if (!topicArn) throw new Error('SNS_TOPIC_ARN is not configured');

  const command = new ListSubscriptionsByTopicCommand({
    TopicArn: topicArn,
  });

  const response = await snsClient.send(command);
  
  return (response.Subscriptions || []).map(sub => ({
    subscriptionArn: sub.SubscriptionArn || '',
    endpoint: sub.Endpoint || '',
    protocol: sub.Protocol || '',
    status: sub.SubscriptionArn === 'PendingConfirmation' ? 'PendingConfirmation' : 'Confirmed',
  }));
}

export async function unsubscribeEmail(subscriptionArn: string): Promise<void> {
  const command = new UnsubscribeCommand({
    SubscriptionArn: subscriptionArn,
  });

  await snsClient.send(command);
}

export async function publishNotification(notification: NotificationMessage): Promise<void> {
  if (!topicArn) {
    console.warn('SNS_TOPIC_ARN is not configured, skipping notification');
    return;
  }

  const command = new PublishCommand({
    TopicArn: topicArn,
    Subject: notification.subject,
    Message: notification.message,
  });

  await snsClient.send(command);
}
