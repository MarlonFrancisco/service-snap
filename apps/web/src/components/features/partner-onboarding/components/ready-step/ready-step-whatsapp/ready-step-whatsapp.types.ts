import type { TOnboardingStore } from '@/types/api/onboarding.types';

export type TReadyStepWhatsappConfig = {
  store: Pick<TOnboardingStore, 'id' | 'name'>;
};

/** `loading` enquanto confere a conexão, para não piscar o convite. */
export type TReadyStepWhatsappView =
  | 'loading'
  | 'invite'
  | 'connected'
  | 'hidden';
