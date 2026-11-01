import {
  ONBOARDING_ERROR_CLASS,
  ONBOARDING_PRIMARY_BUTTON_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingHeader } from '../onboarding-header';
import { useWelcomeStep } from './welcome-step.hook';
import { useState } from 'react';

const OPTION_CLASS =
  'min-h-[60px] cursor-pointer rounded-2xl border border-[#E3E1EA] bg-white px-3.5 text-left text-sm font-semibold text-[#0B0B0F] aria-pressed:border-2 aria-pressed:border-[#0B0B0F] aria-pressed:px-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]';

type TWelcomeStepProps = {
  selected: string | null;
  onSelect: (type: string) => void;
  onStart: () => void;
  onExit: () => void;
};

export const WelcomeStep = ({
  selected,
  onSelect,
  onStart,
  onExit,
}: TWelcomeStepProps) => {
  const { search, setSearch, options, canShowAll, showAllTypes, customType } =
    useWelcomeStep(selected);
  const [showError, setShowError] = useState(false);

  const handleStart = () => {
    if (!selected) {
      setShowError(true);
      return;
    }
    onStart();
  };

  return (
    <>
      <OnboardingHeader onSaveAndExit={onExit} />

      <main className="mx-auto w-full max-w-[688px] flex-1 px-5 py-7 md:px-6 md:py-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F3F7] px-[13px] py-[7px] text-[13px] font-bold">
          ✓ Tudo pronto! Sua assinatura está ativa
        </span>
        <h1 className="mt-3.5 text-[30px] leading-[1.08] font-extrabold tracking-[-0.035em] md:text-[40px]">
          Vamos preparar seu espaço para receber agendamentos
        </h1>
        <p className="mt-2.5 text-base leading-[1.55] text-[#5F5C6E]">
          Leva poucos minutos, e você pode parar e voltar quando quiser.
        </p>

        <h2 className="mt-[30px] mb-3 text-[19px] font-extrabold tracking-[-0.02em]">
          Qual é o seu tipo de negócio?
        </h2>

        <label className="block text-sm font-semibold">
          Buscar tipo de negócio
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ex: Barbearia"
            className="mt-[7px] block h-[52px] w-full rounded-full border border-[#E3E1EA] px-[18px] text-base font-medium placeholder:text-[#6F6C7E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F] md:text-[15px]"
          />
        </label>

        <div
          role="group"
          aria-label="Tipos de negócio"
          className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(min(150px,100%),1fr))] gap-2.5"
        >
          {options.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={selected === type}
              onClick={() => {
                onSelect(type);
                setShowError(false);
              }}
              className={OPTION_CLASS}
            >
              {type}
            </button>
          ))}
          {customType && (
            <button
              type="button"
              aria-pressed={selected === customType}
              onClick={() => {
                onSelect(customType);
                setShowError(false);
              }}
              className={OPTION_CLASS}
            >
              Usar “{customType}”
            </button>
          )}
          {canShowAll && (
            <button type="button" onClick={showAllTypes} className={OPTION_CLASS}>
              Ver todas
            </button>
          )}
        </div>

        {showError && (
          <p role="alert" className={`mt-3 ${ONBOARDING_ERROR_CLASS}`}>
            Escolha um tipo de negócio para começar.
          </p>
        )}
      </main>

      <footer className="sticky bottom-0 flex justify-end border-t border-[#EBE9F0] bg-white/97 px-5 pt-3.5 pb-[calc(14px+env(safe-area-inset-bottom,0px))] md:px-8">
        <button
          type="button"
          onClick={handleStart}
          className={`${ONBOARDING_PRIMARY_BUTTON_CLASS} w-full md:w-auto`}
        >
          Começar
        </button>
      </footer>
    </>
  );
};
