import { NextResponse } from 'next/server';
import { subscribeEmail, listSubscriptions, unsubscribeEmail } from '@/utils/snsService';
import type { SubscribeRequest, UnsubscribeRequest } from '@/types/notification';

export async function GET() {
  try {
    const subscriptions = await listSubscriptions();
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Failed to list subscriptions:', error);
    return NextResponse.json(
      { error: 'サブスクリプションの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: SubscribeRequest = await request.json();
    
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    const subscriptionArn = await subscribeEmail(body.email);
    
    return NextResponse.json({
      message: '確認メールを送信しました。メールボックスを確認してください。',
      subscriptionArn,
    });
  } catch (error) {
    console.error('Failed to subscribe:', error);
    return NextResponse.json(
      { error: 'サブスクリプションの登録に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body: UnsubscribeRequest = await request.json();
    
    if (!body.subscriptionArn) {
      return NextResponse.json(
        { error: 'subscriptionArnが必要です' },
        { status: 400 }
      );
    }

    await unsubscribeEmail(body.subscriptionArn);
    
    return NextResponse.json({ message: 'サブスクリプションを削除しました' });
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return NextResponse.json(
      { error: 'サブスクリプションの削除に失敗しました' },
      { status: 500 }
    );
  }
}
