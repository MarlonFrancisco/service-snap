import type { TConsentState } from '@repo/analytics';
import type { TCookieCategory } from './cookie-consent.types';

export const COOKIE_CATEGORIES: TCookieCategory[] = [
  {
    id: 'essential',
    title: 'Essenciais',
    description:
      'Mantêm você conectado, protegem sua conta e guardam o agendamento em andamento. Sem eles o site não funciona.',
  },
  {
    id: 'analytics',
    title: 'Análise',
    description:
      'Medem visitas e o uso das páginas, de forma agregada, para entendermos o que melhorar.',
    tool: 'Google Analytics',
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description:
      'Ajudam a mostrar anúncios do ServiceSnap mais relevantes para você em outros sites.',
    tool: 'Google Ads',
  },
];

export const ACCEPT_ALL_CONSENT: TConsentState = {
  analytics: true,
  marketing: true,
};

export const PRIVACY_POLICY_PATH = '/privacy';
