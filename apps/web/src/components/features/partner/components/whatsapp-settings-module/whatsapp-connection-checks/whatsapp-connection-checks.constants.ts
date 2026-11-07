import type {
  TWhatsappCheckKey,
  TWhatsappCheckState,
} from '@/types/api/whatsapp.types';
import type { TModuleBadgeTone } from '../../notifications-module/notifications-module.styles';

export const WHATSAPP_CHECK_LABEL: Record<TWhatsappCheckKey, string> = {
  ids: 'Phone Number ID e Business Account ID',
  token: 'Access Token',
  webhook: 'Webhook',
  displayName: 'Nome de exibição',
};

/** Etapa do guia que resolve cada conferência. */
export const WHATSAPP_CHECK_STEP: Record<TWhatsappCheckKey, number> = {
  ids: 3,
  token: 4,
  webhook: 5,
  displayName: 2,
};

export const WHATSAPP_CHECK_BADGE: Record<
  TWhatsappCheckState,
  { label: string; tone: TModuleBadgeTone }
> = {
  ok: { label: 'Tudo certo', tone: 'success' },
  warning: { label: 'Atenção', tone: 'warning' },
  error: { label: 'Precisa de ajuste', tone: 'danger' },
  pending: { label: 'Aguardando', tone: 'neutral' },
};
