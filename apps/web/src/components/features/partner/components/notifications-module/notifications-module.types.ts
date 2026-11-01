import type { INotificationsSettings } from '@/types/api/notifications.types';

/** A API responde sem corpo enquanto a loja nunca salvou configurações. */
export type TNotificationsSettingsData = INotificationsSettings | null;

export type TStoreAvailability = 'loading' | 'ready' | 'no-store' | 'error';

export type TReminderLoadState = TStoreAvailability;

export type TStore = {
  id: string;
  name: string;
  address: string;
};

export type TNotificationPreviewType = 'email' | 'sms' | 'whatsapp';

export type TEmailReminderSettings = {
  enabled: boolean;
  timing: string;
  customMessage: string;
};

export type TSmsReminderSettings = {
  enabled: boolean;
  timing: string;
  customMessage: string;
};

export type TNewBookingNotificationSettings = {
  enabled: boolean;
};

export type TCancellationNotificationSettings = {
  enabled: boolean;
};

export type TMarketingNotificationSettings = {
  enabled: boolean;
};

export type TNotificationSettings = {
  unitId: string;
  unitName: string;
  emailReminders: TEmailReminderSettings;
  smsReminders: TSmsReminderSettings;
  newBookingNotifications: TNewBookingNotificationSettings;
  cancellationNotifications: TCancellationNotificationSettings;
  marketingNotifications: TMarketingNotificationSettings;
};

export type TTimingOption = {
  value: string;
  label: string;
};

export type TPreviewModal = {
  isOpen: boolean;
  type: TNotificationPreviewType;
};
