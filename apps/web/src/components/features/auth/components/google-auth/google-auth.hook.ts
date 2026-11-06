import { useAnalytics } from '@/providers/analytics.provider';
import { useAuthStore } from '@/store/auth/auth.store';
import { loadGoogleIdentity } from '@/utils/helpers/google-identity.helper';
import { getStoredReferralCode } from '@/utils/helpers/referral.helper';
import { useCallback, useEffect, useRef } from 'react';

const GOOGLE_BUTTON_MIN_WIDTH = 200;
const GOOGLE_BUTTON_MAX_WIDTH = 400;

export const useGoogleAuth = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const googleLoginAction = useAuthStore((state) => state.googleLoginAction);
  const onAuth = useAuthStore((state) => state.onAuth);
  const analytics = useAnalytics();

  const handleAuth = useCallback(
    async (response: { credential: string }) => {
      // Lido antes do login: para usuário novo a action limpa o código salvo
      const hasReferral = Boolean(getStoredReferralCode());

      try {
        await googleLoginAction(response.credential);
      } catch (error) {
        analytics.track('login_failed', { method: 'google', stage: 'google' });
        throw error;
      }

      if (useAuthStore.getState().isNewUser) {
        analytics.track('sign_up', {
          method: 'google',
          has_referral: hasReferral,
        });
      } else {
        analytics.track('login', { method: 'google' });
      }

      onAuth?.();
    },
    [analytics, googleLoginAction, onAuth],
  );

  useEffect(() => {
    let cancelled = false;

    const renderGoogleButton = (container: HTMLDivElement) => {
      if (!window.google?.accounts) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleAuth,
      });

      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'center',
        locale: 'pt-BR',
        width: Math.min(
          Math.max(container.offsetWidth, GOOGLE_BUTTON_MIN_WIDTH),
          GOOGLE_BUTTON_MAX_WIDTH,
        ),
      });

      window.google.accounts.id.prompt();
    };

    // Script bloqueado ou lento não pode derrubar o modal: o e-mail continua.
    void loadGoogleIdentity().then((loaded) => {
      const container = containerRef.current;
      if (cancelled || !loaded || !container) return;

      renderGoogleButton(container);
    });

    return () => {
      cancelled = true;
    };
  }, [handleAuth]);

  return { containerRef };
};
