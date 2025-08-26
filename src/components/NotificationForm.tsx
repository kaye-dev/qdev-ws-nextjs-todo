"use client";

import { useState } from "react";
import { NotificationFormProps } from "../types/notification";

export default function NotificationForm({
  onAddNotification,
}: NotificationFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddNotification(email.trim());
      setEmail("");
    } catch (error) {
      console.error("Failed to add notification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="通知先メールアドレスを入力"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "追加中..." : "追加"}
        </button>
      </div>
    </form>
  );
}
