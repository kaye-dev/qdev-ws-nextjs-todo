import { SNSClient } from '@aws-sdk/client-sns';

export const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'ap-northeast-1',
});

export const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';