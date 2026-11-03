import type { LucideIcon } from 'lucide-react';
import type { FormEventHandler, ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import type { TReminderLoadState } from '../../notifications-module.types';

export type TReminderTimingOption = {
  value: string;
  label: string;
};

/** Props que cada canal recebe da própria tela de configurações. */
export type TReminderSectionConfig = {
  isSaving: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** Canal indisponível (ex.: WhatsApp sem integração): nada se edita nem salva. */
  lockedHint?: string;
};

export type TReminderChannelCardConfig<TFormValues extends FieldValues> =
  TReminderSectionConfig & {
    icon: LucideIcon;
    title: string;
    description: string;
    enabledName: FieldPath<TFormValues>;
    timingName: FieldPath<TFormValues>;
    messageName: FieldPath<TFormValues>;
    timingOptions: TReminderTimingOption[];
    messageLimit: number;
    messageHint: string;
    messagePlaceholder: string;
    previewLabel: string;
    onOpenPreview: () => void;
  };

export type TUseReminderChannelCardConfig<TFormValues extends FieldValues> =
  Pick<
    TReminderChannelCardConfig<TFormValues>,
    'enabledName' | 'messageName' | 'lockedHint'
  >;

export type TReminderChannelLayoutConfig = {
  title: string;
  description: string;
  loadState: TReminderLoadState;
  onRetry: () => void;
  isRetrying: boolean;
  children: ReactNode;
};
