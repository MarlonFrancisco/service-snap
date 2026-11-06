import type { INotificationsHistory } from '@/types/api/notifications.types';
import {
  MODULE_BADGE_TONE_CLASS,
  type TModuleBadgeTone,
} from './notifications-module.styles';

/**
 * Format a timestamp to a readable string
 * @param date - The date to format
 * @returns Formatted timestamp string
 */
/** Converte a antecedência do formulário (`'24h'`) em horas; `undefined` se inválida. */
export function parseAdvanceHours(value?: string): number | undefined {
  const hours = Number.parseInt(value ?? '', 10);
  return Number.isNaN(hours) ? undefined : hours;
}

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

const STATUS_BADGE: Record<
  NonNullable<INotificationsHistory['status']>,
  { label: string; tone: TModuleBadgeTone }
> = {
  sent: { label: 'Enviada', tone: 'neutral' },
  delivered: { label: 'Entregue', tone: 'success' },
  failed: { label: 'Falhou', tone: 'danger' },
  pending: { label: 'Pendente', tone: 'warning' },
};

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

  const { label, tone } = STATUS_BADGE[status];

  return { label, className: MODULE_BADGE_TONE_CLASS[tone] };
}
