export interface Subscription {
  subscriptionArn: string;
  endpoint: string;
  protocol: string;
  status: 'PendingConfirmation' | 'Confirmed';
}

export interface SubscribeRequest {
  email: string;
}

export interface UnsubscribeRequest {
  subscriptionArn: string;
}

export interface NotificationMessage {
  subject: string;
  message: string;
}
