import Link from 'next/link';
import NotificationSettings from '@/components/NotificationSettings';

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-2xl">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← トップページに戻る
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            通知設定
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            タスク追加時のメール通知を設定できます
          </p>
        </header>

        <NotificationSettings />
      </div>
    </main>
  );
}
