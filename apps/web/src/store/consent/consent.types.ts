import type { TConsentState } from '@repo/analytics';

export interface IConsentStore {
  /** `null` enquanto a pessoa não escolheu: o aviso fica visível. */
  consent: TConsentState | null;
  /** Versão das categorias aceitas. Mudou a lista, pede de novo. */
  version: number;
  isPreferencesOpen: boolean;

  saveConsent: (consent: TConsentState) => void;
  openPreferences: () => void;
  closePreferences: () => void;
}
