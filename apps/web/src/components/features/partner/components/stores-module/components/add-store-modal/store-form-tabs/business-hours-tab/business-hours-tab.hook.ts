import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import type { TStoreFormSchema } from '../store-form.schema';

type TBusinessDay = keyof NonNullable<TStoreFormSchema['businessDays']>;

const BUSINESS_DAYS: readonly { key: TBusinessDay; label: string }[] = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const useBusinessHoursTab = () => {
  const form = useFormContext<TStoreFormSchema>();

  const businessDays = form.watch('businessDays');

  const days = useMemo(
    () =>
      BUSINESS_DAYS.map((day) => ({
        ...day,
        isOpen: businessDays?.[day.key] ?? false,
      })),
    [businessDays],
  );

  const handleDayToggle = useCallback(
    (day: TBusinessDay) => {
      const current = form.getValues('businessDays');
      if (!current) return;

      form.setValue(
        'businessDays',
        { ...current, [day]: !current[day] },
        { shouldValidate: true, shouldDirty: true },
      );
    },
    [form],
  );

  return { days, handleDayToggle };
};
