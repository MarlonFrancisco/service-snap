'use client';

import { Loader2 } from 'lucide-react';
import { useCheckoutStep } from './checkout-step.hook';
import type { TCheckoutStepConfig } from './checkout-step.types';

const SUBTITLE_CLASS = 'mt-1.5 mb-6 text-[15px] text-ink-muted';
const NOTICE_CLASS =
  'mt-5 rounded-[14px] bg-surface px-[18px] py-4 text-sm leading-[1.5] text-ink';
const PRIMARY_BUTTON_CLASS =
  'mt-6 flex h-14 w-full max-w-[420px] items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-bold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-60';

export function CheckoutStep(config: TCheckoutStepConfig) {
  const {
    user,
    isLoggedIn,
    initials,
    contactLine,
    isCreatingSchedule,
    handleSchedule,
    handleLoginClick,
  } = useCheckoutStep(config);

  return (
    <div>
      <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-ink">
        Finalize seu agendamento
      </h1>

      {isLoggedIn ? (
        <>
          <p className={SUBTITLE_CLASS}>
            Confira seus dados e confirme a reserva
          </p>

          <div className="flex items-center gap-4 rounded-[22px] border border-line-strong p-5">
            <span
              aria-hidden
              className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-ink text-[15px] font-bold text-white"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-ink">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="mt-[3px] text-sm break-words text-ink-muted">
                {contactLine}
              </p>
            </div>
          </div>

          <p className={NOTICE_CLASS}>
            O pagamento é feito no local, direto com o estabelecimento.
          </p>

          <button
            type="button"
            onClick={handleSchedule}
            disabled={isCreatingSchedule}
            className={PRIMARY_BUTTON_CLASS}
          >
            {isCreatingSchedule ? 'Confirmando...' : 'Confirmar agendamento'}
            {isCreatingSchedule && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
          </button>

          <p className="mt-3 max-w-[420px] text-[13px] leading-[1.5] text-ink-muted">
            Ao confirmar, você concorda com nossos{' '}
            <a href="/terms" className="underline hover:text-ink">
              termos de serviço
            </a>{' '}
            e{' '}
            <a href="/privacy" className="underline hover:text-ink">
              política de privacidade
            </a>
            .
          </p>
        </>
      ) : (
        <>
          <p className={SUBTITLE_CLASS}>
            Entre na sua conta para confirmar a reserva
          </p>

          <p className={NOTICE_CLASS}>
            Sua seleção fica salva. Depois do login, você volta para esta etapa.
          </p>

          <button
            type="button"
            onClick={handleLoginClick}
            className={PRIMARY_BUTTON_CLASS}
          >
            Fazer login para confirmar
          </button>
        </>
      )}
    </div>
  );
}
