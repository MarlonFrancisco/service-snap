import type { User } from '../../modules/users/user.entity';
import { toE164 } from './region.helpers';

export const getUserFullName = (
  user?: Partial<Pick<User, 'firstName' | 'lastName'>>,
): string => [user?.firstName, user?.lastName].filter(Boolean).join(' ');

/**
 * Telefone em E.164. Número sem DDI é lido como do país informado (padrão: o da
 * plataforma). Se não for um número válido, mantém o formato antigo (+dígitos)
 * para não perder o vínculo com cadastros já gravados assim.
 */
export const normalizePhoneNumber = (
  phoneNumber: string,
  country?: string | null,
): string => {
  if (!phoneNumber) return undefined;

  const digits = phoneNumber.replace(/\D/g, '');
  if (!digits) return undefined;

  return toE164(phoneNumber, country) ?? `+${digits}`;
};
