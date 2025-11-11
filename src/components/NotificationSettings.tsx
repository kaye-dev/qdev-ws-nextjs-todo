'use client';

import { useState, useEffect } from 'react';
import type { Subscription } from '@/types/notification';

export default function NotificationSettings() {
  const [email, setEmail] = useState('');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch {
      console.error('Failed to load subscriptions');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
        setTimeout(() => loadSubscriptions(), 1000);
      } else {
        setError(data.error || '登録に失敗しました');
      }
    } catch {
      setError('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionArn: string) => {
    if (!confirm('このサブスクリプションを削除しますか？')) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionArn }),
      });

      if (response.ok) {
        setMessage('サブスクリプションを削除しました');
        loadSubscriptions();
      } else {
        const data = await response.json();
        setError(data.error || '削除に失敗しました');
      }
    } catch {
      setError('削除に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          メール通知設定
        </h2>
        
        <form onSubmit={handleSubscribe} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              通知先メールアドレス
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '登録中...' : '登録'}
              </button>
            </div>
          </div>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          登録済みメールアドレス
        </h3>

        {subscriptions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            登録されているメールアドレスはありません
          </p>
        ) : (
          <ul className="space-y-2">
            {subscriptions.map((sub) => (
              <li
                key={sub.subscriptionArn}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-white font-medium">
                    {sub.endpoint}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {sub.status === 'PendingConfirmation' ? '確認待ち' : '確認済み'}
                  </p>
                </div>
                {sub.subscriptionArn !== 'PendingConfirmation' && (
                  <button
                    onClick={() => handleUnsubscribe(sub.subscriptionArn)}
                    className="px-4 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    削除
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          📧 通知について
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• メールアドレスを登録すると確認メールが送信されます</li>
          <li>• メール内のリンクをクリックして登録を完了してください</li>
          <li>• タスクが追加されると、登録済みのメールアドレスに通知が送信されます</li>
        </ul>
      </div>
    </div>
  );
}
