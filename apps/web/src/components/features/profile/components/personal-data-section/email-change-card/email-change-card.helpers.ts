import { isApiHttpError } from '@/service/api';
import type { TEmailChangeFeedback } from './email-change-card.types';

export const EMAIL_CODE_LENGTH = 6;

const TOO_MANY_ATTEMPTS = 'Muitas tentativas. Tente de novo em alguns minutos.';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Erro do e-mail digitado antes de pedir o código; `null` se está ok. */
export const validateNewEmail = (email: string, currentEmail?: string) => {
  const value = email.trim();
  if (!EMAIL_PATTERN.test(value)) return 'Digite um e-mail válido.';
  if (value.toLowerCase() === currentEmail?.toLowerCase()) {
    return 'Este já é o seu e-mail atual.';
  }
  return null;
};

/** Só dígitos, no tamanho do código. */
export const sanitizeEmailCode = (value: string) =>
  value.replace(/\D/g, '').slice(0, EMAIL_CODE_LENGTH);

/**
 * Resposta de `POST /auth/email-change`. O 503 é a falha no envio do e-mail:
 * a API já gravou o pedido, então o código continua valendo.
 */
export const getEmailRequestFeedback = (
  error: unknown,
  email: string,
): TEmailChangeFeedback => {
  const status = isApiHttpError(error) ? error.status : undefined;

  switch (status) {
    case 409:
      return { message: 'Este e-mail já está em uso', canEnterCode: false };
    case 429:
      return { message: TOO_MANY_ATTEMPTS, canEnterCode: false };
    case 400:
      return { message: 'Digite um e-mail válido.', canEnterCode: false };
    case 503:
      return {
        message: `Não conseguimos enviar o código para ${email} agora. Toque em "Reenviar código" em instantes.`,
        canEnterCode: true,
      };
    default:
      return {
        message: 'Não foi possível enviar o código. Tente de novo.',
        canEnterCode: false,
      };
  }
};

/** Resposta de `POST /auth/email-change/confirm`. */
export const getEmailConfirmError = (error: unknown) => {
  if (!isApiHttpError(error)) {
    return 'Não foi possível confirmar o código. Tente de novo.';
  }

  switch (error.status) {
    case 400:
      return error.message === 'Code expired'
        ? 'Este código expirou. Peça um novo.'
        : 'Código incorreto ou expirado. Confira ou peça um novo.';
    case 409:
      return 'Este e-mail já está em uso';
    case 429:
      return TOO_MANY_ATTEMPTS;
    default:
      return 'Não foi possível confirmar o código. Tente de novo.';
  }
};
