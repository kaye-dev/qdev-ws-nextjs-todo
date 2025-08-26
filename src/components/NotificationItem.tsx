"use client";

import { NotificationItemProps } from "../types/notification";

export default function NotificationItem({
  notification,
  onDelete,
  onToggle,
}: NotificationItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={notification.enabled}
          onChange={() => onToggle(notification.id)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <span
          className={`${
            notification.enabled ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {notification.email}
        </span>
        {!notification.enabled && (
          <span className="text-xs text-gray-500">(無効)</span>
        )}
      </div>
      <button
        onClick={() => onDelete(notification.id)}
        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
      >
        削除
      </button>
    </div>
  );
}
