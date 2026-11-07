import type { TConsentCategory } from '@repo/analytics';

/** `essential` não passa pelo consentimento: o site não funciona sem ele. */
export type TCookieCategoryId = 'essential' | TConsentCategory;

export type TCookieCategory = {
  id: TCookieCategoryId;
  title: string;
  description: string;
  /** Ferramenta que usa a categoria, mostrada abaixo da descrição. */
  tool?: string;
};
