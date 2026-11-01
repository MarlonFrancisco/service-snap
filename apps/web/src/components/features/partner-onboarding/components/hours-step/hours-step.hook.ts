import { OnboardingService } from '@/service/partner/onboarding';
import type { TOnboardingStore } from '@/types/api/onboarding.types';
import type { TWorkingDays } from '@/types/api/stores.types';
import { useState } from 'react';
import { DEFAULT_BUSINESS_DAYS } from '../../partner-onboarding.constants';
import { getApiErrorMessage, maskTime } from '../../partner-onboarding.helpers';
import { useOnboardingMutation } from '../../partner-onboarding.hook';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

type TUseHoursStepParams = {
  store: TOnboardingStore;
  onSaved: () => void;
  onExit: () => void;
};

export const useHoursStep = ({
  store,
  onSaved,
  onExit,
}: TUseHoursStepParams) => {
  // Loja que já passou por aqui e desligou o almoço volta com ele desligado.
  const hasSavedHours = Boolean(store.openTime);

  const [businessDays, setBusinessDays] = useState<TWorkingDays>(
    store.businessDays ?? DEFAULT_BUSINESS_DAYS,
  );
  const [openTime, setOpenTime] = useState(store.openTime ?? '09:00');
  const [closeTime, setCloseTime] = useState(store.closeTime ?? '18:00');
  const [hasLunch, setHasLunch] = useState(
    hasSavedHours ? Boolean(store.lunchStartTime) : true,
  );
  const [lunchStartTime, setLunchStartTime] = useState(
    store.lunchStartTime ?? '12:00',
  );
  const [lunchEndTime, setLunchEndTime] = useState(
    store.lunchEndTime ?? '13:00',
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [exitBlocked, setExitBlocked] = useState(false);

  const mutation = useOnboardingMutation(
    OnboardingService.saveHours.bind(OnboardingService),
  );

  const validate = () => {
    if (!Object.values(businessDays).some(Boolean)) {
      return 'Escolha pelo menos um dia de atendimento.';
    }

    const times = hasLunch
      ? [openTime, closeTime, lunchStartTime, lunchEndTime]
      : [openTime, closeTime];

    if (!times.every((time) => TIME_PATTERN.test(time))) {
      return 'Use horários no formato 09:00.';
    }

    if (openTime >= closeTime) {
      return 'O fechamento precisa ser depois da abertura.';
    }

    if (
      hasLunch &&
      (lunchStartTime >= lunchEndTime ||
        lunchStartTime < openTime ||
        lunchEndTime > closeTime)
    ) {
      return 'A pausa precisa ficar dentro do horário de atendimento.';
    }

    return null;
  };

  const save = async (afterSave: () => void, isExit: boolean) => {
    const error = validate();
    setValidationError(error);
    setExitBlocked(Boolean(error) && isExit);

    if (error) return;

    try {
      await mutation.mutateAsync({
        businessDays,
        openTime,
        closeTime,
        lunchStartTime: hasLunch ? lunchStartTime : null,
        lunchEndTime: hasLunch ? lunchEndTime : null,
      });
      afterSave();
    } catch {
      // A mensagem aparece via `mutation.error`.
    }
  };

  const touched =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setIsDirty(true);
      setter(value);
    };

  return {
    businessDays,
    openTime,
    closeTime,
    hasLunch,
    lunchStartTime,
    lunchEndTime,
    isSaving: mutation.isPending,
    exitBlocked,
    error:
      validationError ??
      (mutation.isError
        ? getApiErrorMessage(
            mutation.error,
            'Não foi possível salvar. Tente de novo.',
          )
        : null),
    toggleDay: (day: keyof TWorkingDays) => {
      setIsDirty(true);
      setBusinessDays((current) => ({ ...current, [day]: !current[day] }));
    },
    setOpenTime: touched((value: string) => setOpenTime(maskTime(value))),
    setCloseTime: touched((value: string) => setCloseTime(maskTime(value))),
    setHasLunch: touched(setHasLunch),
    setLunchStartTime: touched((value: string) =>
      setLunchStartTime(maskTime(value)),
    ),
    setLunchEndTime: touched((value: string) =>
      setLunchEndTime(maskTime(value)),
    ),
    handleContinue: () => void save(onSaved, false),
    handleSaveAndExit: () => {
      if (!isDirty) {
        onExit();
        return;
      }
      void save(onExit, true);
    },
  };
};
