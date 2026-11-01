import type { TReminderSectionConfig } from '../../components/reminder-channel-card';

export type TTimingOption = {
  value: string;
  label: string;
};

export type TSmsReminderSettings = {
  enabled: boolean;
  timing: string;
  customMessage: string;
};

export type TSmsRemindersSectionConfig = TReminderSectionConfig;
