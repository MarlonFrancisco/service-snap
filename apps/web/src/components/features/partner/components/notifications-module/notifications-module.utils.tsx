import type { INotificationsHistory } from '@/types/api/stores.types';
import {
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  List,
  Loader,
  Mail,
  MessageCircle,
  MessageSquare,
  Save,
  Search,
  Send,
  Settings as SettingsIcon,
  Smartphone,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import { ReactNode } from 'react';

/**
 * Format a timestamp to a readable string
 * @param date - The date to format
 * @returns Formatted timestamp string
 */
export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Agora mesmo';
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get the icon for a notification type
 * @param type - The notification type
 * @returns Icon component
 */
export function getNotificationIcon(
  type: INotificationsHistory['type'],
): ReactNode {
  switch (type) {
    case 'booking':
      return <Calendar className="h-4 w-4" />;
    case 'cancellation':
      return <X className="h-4 w-4" />;
    case 'reminder':
      return <Bell className="h-4 w-4" />;
    case 'system':
      return <SettingsIcon className="h-4 w-4" />;
    case 'marketing':
      return <Sparkles className="h-4 w-4" />;
  }
}

/**
 * Get the color classes for a notification type
 * @param type - The notification type
 * @returns Tailwind color classes
 */
export function getNotificationColor(
  type: INotificationsHistory['type'],
): string {
  switch (type) {
    case 'booking':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'cancellation':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'reminder':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'system':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'marketing':
      return 'bg-green-50 text-green-700 border-green-200';
  }
}

/**
 * Get the status badge config
 * @param status - The notification status
 * @returns Badge config with label and className
 */
export function getStatusBadgeConfig(
  status?: INotificationsHistory['status'],
): {
  label: string;
  className: string;
} | null {
  if (!status) return null;

  const statusConfig: Record<
    NonNullable<INotificationsHistory['status']>,
    { label: string; className: string }
  > = {
    sent: {
      label: 'Enviada',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    delivered: {
      label: 'Entregue',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    failed: {
      label: 'Falhou',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    pending: {
      label: 'Pendente',
      className: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  };

  return statusConfig[status];
}

/**
 * Icon exports for convenience in components
 */
export const Icons = {
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  List,
  Loader,
  Mail,
  MessageSquare,
  Save,
  Search,
  Send,
  Settings: SettingsIcon,
  Smartphone,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
  MessageCircle,
};
