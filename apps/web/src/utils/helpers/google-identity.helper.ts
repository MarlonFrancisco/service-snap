const GOOGLE_IDENTITY_SRC = 'https://accounts.google.com/gsi/client';

let loading: Promise<boolean> | null = null;

/**
 * Carrega o script de login do Google só quando o botão aparece (modal de
 * login), em vez de em toda página. Resolve `false` se o script falhar ou for
 * bloqueado, e a próxima chamada tenta de novo.
 */
export function loadGoogleIdentity(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.accounts) return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = GOOGLE_IDENTITY_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.google?.accounts));
    script.onerror = () => {
      script.remove();
      loading = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return loading;
}

/** Só para testes. */
export function resetGoogleIdentityLoader() {
  loading = null;
}
