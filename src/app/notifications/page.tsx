import Link from "next/link";
import NotificationSettings from "../../components/NotificationSettings";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Todoアプリに戻る
          </Link>
        </div>

        <NotificationSettings />
      </div>
    </div>
  );
}
