import type { TAnamnesisInviteForm } from '@/types/api/anamnesis.types';

export type TAnamnesisFormCardConfig = {
  token: string;
  form: TAnamnesisInviteForm;
  consentText: string;
  storeName: string;
  /** "quarta", para o "Até quarta!". */
  weekday: string;
  /** Com mais de uma ficha no link, cada cartão mostra o nome dela. */
  showTitle: boolean;
};

export type TUseAnamnesisFormCardConfig = Pick<
  TAnamnesisFormCardConfig,
  'token' | 'form'
>;
