import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { TStoreFormSchema } from '../store-form.schema';
import { getScheduleRulesPreview } from './schedule-rules-tab.helpers';

export const useScheduleRulesTab = () => {
  const form = useFormContext<TStoreFormSchema>();

  const [
    slotIntervalMinutes,
    minAdvanceMinutes,
    maxAdvanceDays,
    cancellationNoticeHours,
    rescheduleNoticeHours,
  ] = useWatch({
    control: form.control,
    name: [
      'slotIntervalMinutes',
      'minAdvanceMinutes',
      'maxAdvanceDays',
      'cancellationNoticeHours',
      'rescheduleNoticeHours',
    ],
  });

  const preview = useMemo(
    () =>
      getScheduleRulesPreview({
        slotIntervalMinutes,
        minAdvanceMinutes,
        maxAdvanceDays,
        cancellationNoticeHours,
        rescheduleNoticeHours,
      }),
    [
      slotIntervalMinutes,
      minAdvanceMinutes,
      maxAdvanceDays,
      cancellationNoticeHours,
      rescheduleNoticeHours,
    ],
  );

  return { preview };
};
