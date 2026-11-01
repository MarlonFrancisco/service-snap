import type { ReactNode } from 'react';
import {
  ONBOARDING_BUTTON_CLASS,
  ONBOARDING_ERROR_CLASS,
  ONBOARDING_PRIMARY_BUTTON_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingHeader } from '../onboarding-header';

const TOTAL_STEPS = 5;

type TOnboardingStepLayoutProps = {
  step: number;
  stepLabel?: string;
  title: string;
  lead: string;
  children: ReactNode;
  error?: string | null;
  isSaving?: boolean;
  primaryLabel?: string;
  /** Oferecido quando "Salvar e sair" não conseguiu salvar o que foi digitado. */
  showExitAnyway?: boolean;
  secondaryAction?: ReactNode;
  onBack: () => void;
  onPrimary: () => void;
  onSaveAndExit: () => void;
  onExitAnyway?: () => void;
};

export const OnboardingStepLayout = ({
  step,
  stepLabel,
  title,
  lead,
  children,
  error,
  isSaving = false,
  primaryLabel = 'Salvar e continuar',
  showExitAnyway = false,
  secondaryAction,
  onBack,
  onPrimary,
  onSaveAndExit,
  onExitAnyway,
}: TOnboardingStepLayoutProps) => (
  <>
    <OnboardingHeader onSaveAndExit={onSaveAndExit} isSaving={isSaving} />

    <main className="mx-auto w-full max-w-[688px] flex-1 px-5 pt-[22px] pb-7 md:px-6 md:pt-7 md:pb-9">
      <p className="text-[13px] font-semibold text-[#5F5C6E]">
        {stepLabel ?? `Etapa ${step} de ${TOTAL_STEPS}`}
      </p>
      <div
        role="progressbar"
        aria-label="Progresso"
        aria-valuenow={step}
        aria-valuemin={0}
        aria-valuemax={TOTAL_STEPS}
        className="mt-2 h-1 overflow-hidden rounded-full bg-[#EBE9F0]"
      >
        <div
          className="h-full bg-[#0B0B0F]"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <h1 className="mt-[18px] text-[28px] leading-[1.1] font-extrabold tracking-[-0.03em] md:mt-[22px] md:text-[32px]">
        {title}
      </h1>
      <p className="mt-1.5 mb-[18px] text-sm leading-normal text-[#5F5C6E] md:mt-[7px] md:mb-[22px] md:text-[15px]">
        {lead}
      </p>

      {children}

      {error && (
        <div
          role="alert"
          className={`mt-4 flex flex-wrap items-center justify-between gap-2 ${ONBOARDING_ERROR_CLASS}`}
        >
          <span>{error}</span>
          {showExitAnyway && (
            <button
              type="button"
              onClick={onExitAnyway}
              className="min-h-11 cursor-pointer rounded-full bg-[#F4F3F7] px-3.5 text-[13px] font-bold text-[#0B0B0F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]"
            >
              Sair sem salvar
            </button>
          )}
        </div>
      )}
    </main>

    <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#EBE9F0] bg-white/97 px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] md:gap-3 md:px-8 md:py-3.5">
      <button
        type="button"
        onClick={onBack}
        disabled={isSaving}
        className={ONBOARDING_BUTTON_CLASS}
      >
        Voltar
      </button>
      <div className="flex flex-1 justify-end gap-2">
        {secondaryAction}
        <button
          type="button"
          onClick={onPrimary}
          disabled={isSaving}
          className={`${ONBOARDING_PRIMARY_BUTTON_CLASS} flex-1 md:flex-none`}
        >
          {isSaving ? 'Salvando…' : primaryLabel}
        </button>
      </div>
    </footer>
  </>
);
