import type { INotificationsHistory } from '@/types/api/notifications.types';

export type TNotificationHistoryRow = INotificationsHistory & {
  statusBadge: { label: string; className: string } | null;
  timeLabel: string;
};

export type TNotificationsHistoryProps = {
  notifications: INotificationsHistory[];
  unreadCount: number;
  searchQuery: string;
  filterType: string;
  filterStatus: string;
  onSearchChange: (query: string) => void;
  onFilterTypeChange: (type: string) => void;
  onFilterStatusChange: (status: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
};
