"use client";

import { NotificationListProps } from "../types/notification";
import NotificationItem from "./NotificationItem";

export default function NotificationList({
  notifications,
  onDeleteNotification,
  onToggleNotification,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">通知設定がありません</div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDelete={onDeleteNotification}
          onToggle={onToggleNotification}
        />
      ))}
    </div>
  );
}
