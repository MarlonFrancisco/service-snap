import { useAuthStore } from '@/store/auth/auth.store';
import { useCallback, useEffect, useRef } from 'react';

const GOOGLE_BUTTON_MIN_WIDTH = 200;
const GOOGLE_BUTTON_MAX_WIDTH = 400;

export const useGoogleAuth = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const googleLoginAction = useAuthStore((state) => state.googleLoginAction);
  const onAuth = useAuthStore((state) => state.onAuth);

  const handleAuth = useCallback(
    async (response: { credential: string }) => {
      await googleLoginAction(response.credential);
      onAuth?.();
    },
    [googleLoginAction, onAuth],
  );

  useEffect(() => {
    const container = containerRef.current;
    // Script bloqueado ou lento não pode derrubar o modal: o e-mail continua.
    if (!container || !window.google?.accounts) return;

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
  }, [handleAuth]);

  return { containerRef };
};
