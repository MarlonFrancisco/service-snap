'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IConsentStore } from './consent.types';

/** Suba ao incluir ou mudar uma categoria: quem já escolheu vê o aviso de novo. */
export const CONSENT_VERSION = 1;

export const useConsentStore = create<IConsentStore>()(
  persist(
    (set) => ({
      consent: null,
      version: CONSENT_VERSION,
      isPreferencesOpen: false,

      saveConsent: (consent) =>
        set({ consent, version: CONSENT_VERSION, isPreferencesOpen: false }),
      openPreferences: () => set({ isPreferencesOpen: true }),
      closePreferences: () => set({ isPreferencesOpen: false }),
    }),
    {
      name: 'servicesnap-consent',
      // O painel aberto não é preferência: só a escolha vai para o storage.
      partialize: ({ consent, version }) => ({ consent, version }),
      // Escolha feita para outra versão das categorias não vale mais.
      merge: (persisted, current) => {
        const stored = persisted as Partial<IConsentStore> | undefined;
        if (!stored || stored.version !== CONSENT_VERSION) return current;
        return { ...current, consent: stored.consent ?? null };
      },
    },
  ),
);
