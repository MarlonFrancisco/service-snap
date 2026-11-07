'use client';

import { useAnalytics, useAnalyticsConsent } from '@/providers/analytics.provider';
import { useConsentStore } from '@/store/consent';
import { DENIED_CONSENT, type TConsentState } from '@repo/analytics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCEPT_ALL_CONSENT } from './cookie-consent.constants';

/** Registra uma escolha: grava, avisa o GTM e conta o evento, nessa ordem. */
export const useConsentDecision = () => {
  const saveConsent = useConsentStore((state) => state.saveConsent);
  const setAnalyticsConsent = useAnalyticsConsent();
  const analytics = useAnalytics();

  return useCallback(
    (consent: TConsentState) => {
      saveConsent(consent);
      // O consentimento vai antes do evento: aceitando análise, o próprio
      // consent_updated já sai com permissão.
      setAnalyticsConsent(consent);
      analytics.track('consent_updated', consent);
    },
    [analytics, saveConsent, setAnalyticsConsent],
  );
};

export const useCookieConsent = () => {
  const consent = useConsentStore((state) => state.consent);
  const openPreferences = useConsentStore((state) => state.openPreferences);
  const isPreferencesOpen = useConsentStore(
    (state) => state.isPreferencesOpen,
  );
  const setAnalyticsConsent = useAnalyticsConsent();
  const decide = useConsentDecision();

  // O servidor não conhece o localStorage: o aviso só aparece depois de
  // montar, senão quem já escolheu veria um piscar do aviso.
  const [isHydrated, setIsHydrated] = useState(false);
  const appliedStoredConsent = useRef(false);

  useEffect(() => {
    setIsHydrated(true);

    // Escolha de uma visita anterior: aplica uma vez, ao carregar. Este efeito
    // roda antes do page_view do AnalyticsProvider, então a visita já é
    // medida com a permissão certa. Lê direto do store: na hidratação o
    // `consent` do render ainda é o inicial (null), igual ao do servidor.
    const storedConsent = useConsentStore.getState().consent;
    if (storedConsent && !appliedStoredConsent.current) {
      appliedStoredConsent.current = true;
      setAnalyticsConsent(storedConsent);
    }
  }, [setAnalyticsConsent]);

  return {
    // Some enquanto o painel está aberto, para não ficar por cima dele.
    isVisible: isHydrated && consent === null && !isPreferencesOpen,
    handleAcceptAll: () => decide(ACCEPT_ALL_CONSENT),
    handleRejectAll: () => decide(DENIED_CONSENT),
    handleCustomize: openPreferences,
  };
};
