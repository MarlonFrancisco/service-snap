'use client';

import { useFormContext, type FieldValues } from 'react-hook-form';
import type { TUseReminderChannelCardConfig } from './reminder-channel-card.types';

export const useReminderChannelCard = <TFormValues extends FieldValues>({
  enabledName,
  messageName,
}: TUseReminderChannelCardConfig<TFormValues>) => {
  const { control, watch } = useFormContext<TFormValues>();

  const isEnabled = Boolean(watch(enabledName));
  const messageLength = String(watch(messageName) ?? '').length;

  return {
    control,
    isEnabled,
    messageLength,
    enabledLabel: isEnabled ? 'Ativado' : 'Desativado',
  };
};
