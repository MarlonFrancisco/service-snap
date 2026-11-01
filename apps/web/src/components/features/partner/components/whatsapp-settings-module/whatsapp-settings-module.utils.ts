import type { TWhatsappConnectionStatus } from '@/types/api/whatsapp.types';
import {
  MODULE_BADGE_TONE_CLASS,
  type TModuleBadgeTone,
} from '../notifications-module/notifications-module.styles';

const STATUS_BADGE: Record<
  TWhatsappConnectionStatus,
  { label: string; tone: TModuleBadgeTone }
> = {
  connected: { label: 'Conectado', tone: 'success' },
  inactive: { label: 'Desativado', tone: 'neutral' },
  error: { label: 'Erro', tone: 'danger' },
  incomplete: { label: 'Incompleto', tone: 'warning' },
};

export const getStatusBadge = ({
  status,
  isError,
}: {
  status?: TWhatsappConnectionStatus;
  isError: boolean;
}) => {
  if (status) {
    const { label, tone } = STATUS_BADGE[status];
    return { label, className: MODULE_BADGE_TONE_CLASS[tone] };
  }

  return isError
    ? { label: 'Indisponível', className: MODULE_BADGE_TONE_CLASS.danger }
    : { label: 'Verificando...', className: MODULE_BADGE_TONE_CLASS.neutral };
};

export const maskToken = (token?: string) => {
  if (!token) return 'Disponível depois de salvar';
  if (token.length <= 8) return '••••••••';
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
};
