import type { TPaymentMethod } from '@/types/api/cash.types';

/** Situação da loja ativa antes de carregar as telas de gestão. */
export type TManagementStoreState = 'loading' | 'ready' | 'no-store' | 'error';

/** Nome de quem é da equipe pelo id do usuário (abriu, registrou, fechou). */
export type TMemberNames = Record<string, string>;

export type TPaymentMethodLabels = Record<TPaymentMethod, string>;

export type TFormatMoney = (value: number) => string;
