import type { TAnamnesisInvite } from '@/types/api/anamnesis.types';

/** Valores do formulário: texto, data e escolhas; "sim/não" vira texto. */
export type TAnamnesisAnswerInput = string | string[];

export type TAnamnesisFormValues = {
  answers: Record<string, TAnamnesisAnswerInput>;
  consent: boolean;
};

/** Situação do link: vale, expirou ou não deu para carregar. */
export type TAnamnesisInviteState = 'loading' | 'ready' | 'expired' | 'error';

export type TAnamnesisInvitePageConfig = {
  token: string;
};

export type TAnamnesisInviteHeader = Pick<
  TAnamnesisInvite,
  'storeName' | 'customerFirstName'
> & {
  title: string;
  /** "Antes do seu horário de quarta, 18/11 às 10:00." */
  lead: string;
  /** "quarta" */
  weekday: string;
};
