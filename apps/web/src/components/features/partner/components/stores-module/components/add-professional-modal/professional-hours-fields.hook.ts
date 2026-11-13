import { useCallback, useMemo } from 'react';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import {
  HOURS_MODE_OPTIONS,
  WEEK_DAY_LABELS,
} from './add-professional-modal.constants';
import type { TProfessionalHoursRow } from './add-professional-modal.types';
import type { TProfessionalFormSchema } from './add-professional.schema';

const DAY_FIELDS = [
  'openTime',
  'closeTime',
  'lunchStartTime',
  'lunchEndTime',
] as const;

export const useProfessionalHoursFields = () => {
  const form = useFormContext<TProfessionalFormSchema>();
  const [hoursMode, days] = useWatch({
    control: form.control,
    name: ['hoursMode', 'days'],
  });
  const { errors } = useFormState({ control: form.control, name: 'days' });

  const rows = useMemo<TProfessionalHoursRow[]>(
    () =>
      (days ?? []).map((day, index) => {
        const dayErrors = errors.days?.[index];
        const firstError = DAY_FIELDS.map((field) => dayErrors?.[field]?.message)
          .find(Boolean);

        return {
          index,
          day: day.day,
          label: WEEK_DAY_LABELS[day.day].label,
          switchLabel: `Atende ${WEEK_DAY_LABELS[day.day].ariaLabel}`,
          offLabel: WEEK_DAY_LABELS[day.day].offLabel,
          isStoreClosed: day.isStoreClosed,
          isWorking: day.isWorking && !day.isStoreClosed,
          error: firstError,
        };
      }),
    [days, errors.days],
  );

  const handleModeChange = useCallback(
    (mode: TProfessionalFormSchema['hoursMode']) => {
      form.setValue('hoursMode', mode, { shouldDirty: true });
      form.clearErrors('days');
    },
    [form],
  );

  const handleToggleDay = useCallback(
    (index: number) => {
      const current = form.getValues(`days.${index}.isWorking`);

      form.setValue(`days.${index}.isWorking`, !current, { shouldDirty: true });
      form.clearErrors(`days.${index}`);
    },
    [form],
  );

  return {
    form,
    modeOptions: HOURS_MODE_OPTIONS,
    hoursMode,
    isCustom: hoursMode === 'custom',
    rows,
    handleModeChange,
    handleToggleDay,
  };
};
