'use client';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { cn } from '@repo/ui';
import { useCheckout } from './checkout.hook';
import { CheckoutHeader } from './components/checkout-header';

const TITLE_CLASS =
  'mt-5 text-[38px] leading-[1.1] font-extrabold tracking-[-0.035em]';
const LEAD_CLASS = 'mt-3 text-base leading-[1.6] text-[#5F5C6E]';
const CTA_CLASS =
  'mt-6 block w-full cursor-pointer rounded-full bg-[#0B0B0F] p-[17px] text-[15px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

export const Checkout = () => {
  const {
    status,
    activationDate,
    mainButtonRef,
    handleGoToDashboard,
    handleGoToPricing,
    handleRetry,
  } = useCheckout();

  return (
    <div
      className={cn(
        plusJakartaSans.className,
        'min-h-screen bg-white text-[#0B0B0F]',
      )}
    >
      <CheckoutHeader />

      <main className="mx-auto max-w-[560px] px-5 pt-10 pb-16 text-center">
        {status === 'invalid' && (
          <>
            <div
              aria-hidden="true"
              className="mx-auto grid size-[72px] place-items-center rounded-full bg-[#F4F3F7] text-[30px] font-extrabold"
            >
              !
            </div>
            <h1 className={TITLE_CLASS}>Nenhuma sessão de pagamento</h1>
            <p className={LEAD_CLASS}>
              Este link de checkout é inválido ou expirou. Se você ainda não
              assinou um plano, escolha um para continuar.
            </p>
            <button
              type="button"
              onClick={handleGoToPricing}
              className={CTA_CLASS}
            >
              Ver planos
            </button>
          </>
        )}

        {status === 'validating' && (
          <div aria-busy="true">
            <h1 aria-live="polite" className={TITLE_CLASS}>
              Verificando pagamento
            </h1>
            <p className={LEAD_CLASS}>
              Aguarde um momento, estamos confirmando sua assinatura.
            </p>
            <div
              role="progressbar"
              aria-label="Confirmando pagamento"
              className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#EBE9F0]"
            >
              <div className="h-full w-1/3 animate-pulse bg-[#0B0B0F]" />
            </div>
          </div>
        )}

        {(status === 'delayed' || status === 'error') && (
          <>
            <div
              aria-hidden="true"
              className="mx-auto grid size-[72px] place-items-center rounded-full bg-[#F4F3F7] text-[30px] font-extrabold"
            >
              …
            </div>
            <h1 className={TITLE_CLASS}>
              {status === 'delayed'
                ? 'Ainda estamos confirmando'
                : 'Não conseguimos confirmar agora'}
            </h1>
            <p className={LEAD_CLASS}>
              {status === 'delayed'
                ? 'O pagamento está demorando mais que o esperado para ser confirmado. Nada foi perdido: tente de novo em instantes.'
                : 'Houve uma falha ao falar com o serviço de pagamento. Nada foi perdido: tente de novo em instantes.'}
            </p>
            <button type="button" onClick={handleRetry} className={CTA_CLASS}>
              Tentar novamente
            </button>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              aria-hidden="true"
              className="mx-auto grid size-[72px] place-items-center rounded-full bg-[#0B0B0F] text-[32px] font-extrabold text-white"
            >
              ✓
            </div>
            <h1 className={TITLE_CLASS}>Tudo pronto!</h1>
            <p className={LEAD_CLASS}>
              Sua assinatura está ativa. Agora você pode voltar a gerenciar seus
              agendamentos.
            </p>
            <p className="mt-2 text-[13px] text-[#5F5C6E]">
              Confirmado em {activationDate}
            </p>

            <button
              ref={mainButtonRef}
              type="button"
              onClick={handleGoToDashboard}
              className={CTA_CLASS}
            >
              Acessar painel
            </button>
          </>
        )}
      </main>
    </div>
  );
};
