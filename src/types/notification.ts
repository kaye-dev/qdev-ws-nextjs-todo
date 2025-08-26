/**
 * 通知設定のインターフェース
 */
export interface NotificationSetting {
  /** 設定ID */
  id: string;
  /** 通知先メールアドレス */
  email: string;
  /** 通知が有効かどうか */
  enabled: boolean;
  /** 作成日時 */
  createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/**
 * 通知設定フォームのプロパティ
 */
export interface NotificationFormProps {
  /** 通知設定追加時のコールバック */
  onAddNotification: (email: string) => Promise<void>;
}

/**
 * 通知設定リストのプロパティ
 */
export interface NotificationListProps {
  /** 通知設定一覧 */
  notifications: NotificationSetting[];
  /** 通知設定削除時のコールバック */
  onDeleteNotification: (id: string) => void;
  /** 通知設定有効/無効切り替え時のコールバック */
  onToggleNotification: (id: string) => void;
}

/**
 * 通知設定アイテムのプロパティ
 */
export interface NotificationItemProps {
  /** 通知設定 */
  notification: NotificationSetting;
  /** 削除時のコールバック */
  onDelete: (id: string) => void;
  /** 有効/無効切り替え時のコールバック */
  onToggle: (id: string) => void;
}