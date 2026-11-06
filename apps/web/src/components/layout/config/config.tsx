'use client';

import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth/auth.store';
import { captureReferralCodeFromSearch } from '@/utils/helpers/referral.helper';
import { useEffect } from 'react';

const GOOGLE_POLL_MS = 200;
const GOOGLE_MAX_WAIT_MS = 5000;

/**
 * Side-effect shell: capture `?ref=` for the bilateral referral program and open
 * sign-up for `?cadastro=1`, the link partners send to a professional.
 */
export const Config = () => {
  const analytics = useAnalytics();

  useEffect(() => {
    // Só o fato de ter chegado por indicação: o código não vai para o analytics.
    if (captureReferralCodeFromSearch(window.location.search)) {
      analytics.track('referral_link_landed', {});
    }

    if (new URLSearchParams(window.location.search).get('cadastro') !== '1') {
      return;
    }

    analytics.track('sign_up_deep_link', {});

    // O modal desenha o botão do Google: abre quando o script dele carregar, ou
    // depois do limite, com o login por e-mail, se o script estiver bloqueado.
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (
        window.google?.accounts ||
        Date.now() - startedAt >= GOOGLE_MAX_WAIT_MS
      ) {
        clearInterval(timer);
        void useAuthStore.getState().openAuthAction({ source: 'deep_link' });
      }
    }, GOOGLE_POLL_MS);

    return () => clearInterval(timer);
  }, [analytics]);

  return null;
};
