import type { TOnboardingStore } from '@/types/api/onboarding.types';
import { WEEK_DAYS } from '../../partner-onboarding.constants';
import {
  ONBOARDING_FIELD_LABEL_CLASS,
  ONBOARDING_INPUT_CLASS,
} from '../../partner-onboarding.styles';
import { OnboardingStepLayout } from '../onboarding-step-layout';
import { useHoursStep } from './hours-step.hook';

type THoursStepProps = {
  store: TOnboardingStore;
  onBack: () => void;
  onExit: () => void;
  onSaved: () => void;
};

export const HoursStep = ({
  store,
  onBack,
  onExit,
  onSaved,
}: THoursStepProps) => {
  const {
    businessDays,
    openTime,
    closeTime,
    hasLunch,
    lunchStartTime,
    lunchEndTime,
    isSaving,
    exitBlocked,
    error,
    toggleDay,
    setOpenTime,
    setCloseTime,
    setHasLunch,
    setLunchStartTime,
    setLunchEndTime,
    handleContinue,
    handleSaveAndExit,
  } = useHoursStep({ store, onSaved, onExit });

  return (
    <OnboardingStepLayout
      step={2}
      title="Quando você atende?"
      lead="Os clientes só conseguem agendar dentro destes horários."
      error={error}
      isSaving={isSaving}
      showExitAnyway={exitBlocked}
      onBack={onBack}
      onPrimary={handleContinue}
      onSaveAndExit={handleSaveAndExit}
      onExitAnyway={onExit}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleContinue();
        }}
      >
        <fieldset className="mb-6">
          <legend className="mb-2.5 text-sm font-bold">
            Dias de funcionamento
          </legend>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={businessDays[id]}
                onClick={() => toggleDay(id)}
                className="min-h-12 min-w-16 cursor-pointer rounded-full border border-[#E3E1EA] bg-white px-3.5 text-sm font-bold text-[#0B0B0F] aria-pressed:border-[#0B0B0F] aria-pressed:bg-[#0B0B0F] aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]"
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2.5 text-sm font-bold">Horário</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className={ONBOARDING_FIELD_LABEL_CLASS}>
              Abertura
              <input
                type="text"
                inputMode="numeric"
                placeholder="09:00"
                value={openTime}
                onChange={(event) => setOpenTime(event.target.value)}
                className={ONBOARDING_INPUT_CLASS}
              />
            </label>
            <label className={ONBOARDING_FIELD_LABEL_CLASS}>
              Fechamento
              <input
                type="text"
                inputMode="numeric"
                placeholder="18:00"
                value={closeTime}
                onChange={(event) => setCloseTime(event.target.value)}
                className={ONBOARDING_INPUT_CLASS}
              />
            </label>
          </div>
        </fieldset>

        <label className="flex min-h-14 cursor-pointer items-center justify-between rounded-[14px] bg-[#F7F6FA] px-4 text-sm font-semibold">
          Faço pausa para almoço
          <input
            type="checkbox"
            checked={hasLunch}
            onChange={(event) => setHasLunch(event.target.checked)}
            className="h-6 w-11 accent-[#0B0B0F]"
          />
        </label>

        {hasLunch && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className={ONBOARDING_FIELD_LABEL_CLASS}>
              Início
              <input
                type="text"
                inputMode="numeric"
                placeholder="12:00"
                value={lunchStartTime}
                onChange={(event) => setLunchStartTime(event.target.value)}
                className={ONBOARDING_INPUT_CLASS}
              />
            </label>
            <label className={ONBOARDING_FIELD_LABEL_CLASS}>
              Fim
              <input
                type="text"
                inputMode="numeric"
                placeholder="13:00"
                value={lunchEndTime}
                onChange={(event) => setLunchEndTime(event.target.value)}
                className={ONBOARDING_INPUT_CLASS}
              />
            </label>
          </div>
        )}
      </form>
    </OnboardingStepLayout>
  );
};
