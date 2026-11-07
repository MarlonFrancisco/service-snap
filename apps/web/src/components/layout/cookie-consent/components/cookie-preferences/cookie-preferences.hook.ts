'use client';

import { useConsentStore } from '@/store/consent';
import { DENIED_CONSENT, type TConsentState } from '@repo/analytics';
import { useIsMobile } from '@repo/ui';
import { useEffect, useState } from 'react';
import { ACCEPT_ALL_CONSENT } from '../../cookie-consent.constants';
import { useConsentDecision } from '../../cookie-consent.hook';
import type { TCookieCategoryId } from '../../cookie-consent.types';

export const useCookiePreferences = () => {
  const isOpen = useConsentStore((state) => state.isPreferencesOpen);
  const consent = useConsentStore((state) => state.consent);
  const closePreferences = useConsentStore((state) => state.closePreferences);
  const decide = useConsentDecision();
  const isMobile = useIsMobile();

  // Rascunho: os switches só valem quando a pessoa salva.
  const [draft, setDraft] = useState<TConsentState>(DENIED_CONSENT);

  // Cada abertura começa da escolha atual (ou tudo desligado, se não houver).
  useEffect(() => {
    if (isOpen) setDraft(consent ?? DENIED_CONSENT);
  }, [isOpen, consent]);

  return {
    isOpen,
    isMobile,
    draft,
    handleOpenChange: (open: boolean) => {
      if (!open) closePreferences();
    },
    handleToggle: (category: TCookieCategoryId, enabled: boolean) => {
      // Essenciais não têm switch: não entram no consentimento.
      if (category === 'essential') return;
      setDraft((current) => ({ ...current, [category]: enabled }));
    },
    handleSave: () => decide(draft),
    handleAcceptAll: () => decide(ACCEPT_ALL_CONSENT),
    handleRejectAll: () => decide(DENIED_CONSENT),
  };
};
