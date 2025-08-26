"use client";

import { useState, useEffect } from "react";
import { NotificationSetting } from "../types/notification";
import NotificationForm from "./NotificationForm";
import NotificationList from "./NotificationList";

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(
          data.map(
            (item: {
              id: string;
              email: string;
              enabled: boolean;
              createdAt: string;
              updatedAt: string;
            }) => ({
              ...item,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt),
            })
          )
        );
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotification = async (email: string) => {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to add notification");
    }

    const newNotification = await response.json();
    setNotifications((prev) => [
      ...prev,
      {
        ...newNotification,
        createdAt: new Date(newNotification.createdAt),
        updatedAt: new Date(newNotification.updatedAt),
      },
    ]);
  };

  const handleDeleteNotification = async (id: string) => {
    const response = await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleToggleNotification = async (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return;

    const response = await fetch(`/api/notifications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !notification.enabled }),
    });

    if (response.ok) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, enabled: !n.enabled, updatedAt: new Date() } : n
        )
      );
    }
  };

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">通知設定</h2>
      <p className="text-sm text-gray-600 mb-4">
        新しいタスクが追加された時にメール通知を受け取る設定ができます。
      </p>

      <NotificationForm onAddNotification={handleAddNotification} />

      <NotificationList
        notifications={notifications}
        onDeleteNotification={handleDeleteNotification}
        onToggleNotification={handleToggleNotification}
      />
    </div>
  );
}
