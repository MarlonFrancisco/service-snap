import { StoreCard } from '@/components/ui/store-card';
import type { TOnboardingResult } from '@/types/api/onboarding.types';
import Link from 'next/link';
import {
  ONBOARDING_BUTTON_CLASS,
  ONBOARDING_COPY_BUTTON_CLASS,
  ONBOARDING_PRIMARY_BUTTON_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingHeader } from '../onboarding-header';
import { useReadyStep } from './ready-step.hook';

type TReadyStepProps = {
  result: TOnboardingResult;
};

export const ReadyStep = ({ result }: TReadyStepProps) => {
  const { bookingPath, bookingUrl, previewStore, handleCopy, handleShare } =
    useReadyStep(result);

  return (
    <>
      <OnboardingHeader />

      <main className="mx-auto grid w-full max-w-[1040px] flex-1 grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 py-10 md:px-6 min-[861px]:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-[#0B0B0F] text-[25px] font-extrabold text-white"
          >
            ✓
          </div>
          <h1 className="mt-4 text-[32px] leading-[1.06] font-extrabold tracking-[-0.035em] min-[861px]:text-[44px]">
            Seu espaço está no ar
          </h1>
          <p className="mt-2.5 mb-[22px] text-base leading-[1.55] text-[#5F5C6E]">
            Clientes com o seu link já podem agendar. Compartilhe para receber
            os primeiros.
          </p>

          <p className="mb-[7px] text-sm font-semibold">
            Seu link de agendamento
          </p>
          <div className="flex flex-wrap items-center gap-2 rounded-[28px] border border-[#E3E1EA] py-1.5 pr-1.5 pl-4 text-sm text-[#5F5C6E]">
            <span className="min-w-0 flex-[1_1_140px] truncate">
              {bookingUrl.replace(/^https?:\/\//, '')}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={ONBOARDING_COPY_BUTTON_CLASS}
            >
              Copiar
            </button>
            <button
              type="button"
              onClick={handleShare}
              className={ONBOARDING_COPY_BUTTON_CLASS}
            >
              Compartilhar
            </button>
          </div>
          <p className="mt-2.5 mb-6 text-sm leading-normal text-[#5F5C6E]">
            Cole este link na bio do Instagram e no seu Google Perfil da Empresa.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/partner/agenda"
              className={`${ONBOARDING_PRIMARY_BUTTON_CLASS} inline-flex items-center`}
            >
              Ver minha agenda
            </Link>
            <Link
              href={bookingPath}
              target="_blank"
              className={`${ONBOARDING_BUTTON_CLASS} inline-flex items-center`}
            >
              Ver como cliente
            </Link>
          </div>
        </section>

        <aside aria-label="Prévia do seu cartão">
          <p className="mb-2.5 text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase">
            Como aparece para o cliente
          </p>
          {/* Sem o selo de disponibilidade: nada aqui garante horário livre hoje. */}
          <StoreCard store={previewStore} showAvailabilityBadge={false} />
        </aside>
      </main>
    </>
  );
};
