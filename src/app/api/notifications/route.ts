import { NextRequest, NextResponse } from 'next/server';
import { 
  saveNotificationToDynamoDB, 
  loadNotificationsFromDynamoDB,
  subscribeEmailToSNS 
} from '../../../utils/notificationService';
import { generateUUID } from '../../../utils/uuid';

export async function GET() {
  try {
    const notifications = await loadNotificationsFromDynamoDB();
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const newNotification = {
      id: generateUUID(),
      email: email.trim(),
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveNotificationToDynamoDB(newNotification);
    
    // SNSにメールアドレスを登録
    try {
      await subscribeEmailToSNS(email.trim());
    } catch (snsError) {
      console.error('Failed to subscribe to SNS:', snsError);
      // SNS登録に失敗してもDynamoDBの登録は成功として扱う
    }

    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}