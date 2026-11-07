'use client';

import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { CookiePreferences } from './components/cookie-preferences';
import { PRIVACY_POLICY_PATH } from './cookie-consent.constants';
import { useCookieConsent } from './cookie-consent.hook';

const DECISION_BUTTON_CLASS =
  'h-12 rounded-full bg-[#0B0B0F] text-sm font-bold text-white transition-colors hover:bg-[#2B2B2B]';

/**
 * Aviso de cookies (LGPD) e painel de preferências. Montado uma vez no layout
 * raiz: aplica a escolha salva ao carregar e reabre pelo rodapé.
 */
export const CookieConsent = () => {
  const { isVisible, handleAcceptAll, handleRejectAll, handleCustomize } =
    useCookieConsent();

  return (
    <>
      {isVisible ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white px-5 pt-5 pb-7 text-[#0B0B0F] shadow-[0_-12px_40px_rgba(15,12,30,0.16)] md:inset-x-auto md:bottom-8 md:left-8 md:w-[480px] md:rounded-3xl md:border md:border-[#E3E1EA] md:p-7 md:shadow-[0_24px_64px_rgba(15,12,30,0.18)]"
        >
          <div
            className="mb-4 hidden h-10 w-10 place-items-center rounded-xl bg-[#F4F3F7] md:grid"
            aria-hidden="true"
          >
            <Cookie className="h-[22px] w-[22px]" strokeWidth={1.7} />
          </div>

          <h2
            id="cookie-consent-title"
            className="text-lg font-extrabold tracking-[-0.02em] md:text-xl"
          >
            Sua privacidade, suas escolhas
          </h2>
          <p
            id="cookie-consent-description"
            className="mt-2 text-sm leading-[1.55] text-[#5F5C6E] md:mt-2.5 md:leading-[1.6]"
          >
            Usamos cookies essenciais para o site funcionar. Com a sua
            permissão, também usamos cookies de análise para entender como o
            ServiceSnap é usado e melhorar a experiência. Saiba mais na{' '}
            <Link
              href={PRIVACY_POLICY_PATH}
              className="font-semibold text-[#0B0B0F] underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>

          {/* Rejeitar com o mesmo peso de aceitar, como pede a ANPD. */}
          <div className="mt-[18px] grid grid-cols-2 gap-2.5 md:mt-[22px]">
            <button
              type="button"
              className={DECISION_BUTTON_CLASS}
              onClick={handleRejectAll}
            >
              Rejeitar
            </button>
            <button
              type="button"
              className={DECISION_BUTTON_CLASS}
              onClick={handleAcceptAll}
            >
              Aceitar todos
            </button>
          </div>
          <button
            type="button"
            className="mt-2.5 h-12 w-full rounded-full border border-[#E3E1EA] bg-white text-sm font-bold transition-colors hover:bg-[#F4F3F7]"
            onClick={handleCustomize}
          >
            Personalizar
          </button>
        </section>
      ) : null}

      <CookiePreferences />
    </>
  );
};
