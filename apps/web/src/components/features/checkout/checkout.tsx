'use client';
import { plusJakartaSans } from '@/utils/fonts/plus-jakarta-sans';
import { Alert, AlertDescription, cn } from '@repo/ui';
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
    loadingMessage,
    progress,
    hasTimeout,
    activationDate,
    nextSteps,
    mainButtonRef,
    handleGoToDashboard,
    handleGoToPricing,
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
              {loadingMessage}
            </h1>
            <p className={LEAD_CLASS}>
              Aguarde um momento, estamos finalizando tudo para você.
            </p>
            <div
              role="progressbar"
              aria-label="Progresso da ativação"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#EBE9F0]"
            >
              <div
                className="h-full bg-[#0B0B0F]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'success' && (
          <>
            {hasTimeout && (
              <Alert className="mb-6 rounded-[14px] border-yellow-200 bg-yellow-50 text-left">
                <AlertDescription className="text-yellow-800">
                  A validação está demorando mais que o esperado, mas não se
                  preocupe! Você pode acessar o dashboard enquanto finalizamos o
                  processo.
                </AlertDescription>
              </Alert>
            )}

            <div
              aria-hidden="true"
              className="mx-auto grid size-[72px] place-items-center rounded-full bg-[#0B0B0F] text-[32px] font-extrabold text-white"
            >
              ✓
            </div>
            <h1 className={TITLE_CLASS}>Tudo pronto!</h1>
            <p className={LEAD_CLASS}>
              Sua conta foi ativada com sucesso. Agora você pode começar a
              gerenciar seus agendamentos e fazer crescer seu negócio.
            </p>
            <p className="mt-2 text-[13px] text-[#5F5C6E]">
              Ativado em {activationDate}
            </p>

            <ol
              aria-label="Próximos passos"
              className="mt-7 list-none rounded-3xl px-6 py-2 text-left shadow-[0_12px_40px_rgba(15,12,30,0.1)]"
            >
              {nextSteps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid grid-cols-[32px_1fr] gap-3 border-b border-[#F0EEF4] py-4 last:border-0"
                >
                  <i className="grid size-8 place-items-center rounded-full bg-[#F4F3F7] text-[13px] font-bold not-italic">
                    {index + 1}
                  </i>
                  <div>
                    <b className="block text-[15px]">{step.title}</b>
                    <span className="text-sm text-[#5F5C6E]">
                      {step.description}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

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
