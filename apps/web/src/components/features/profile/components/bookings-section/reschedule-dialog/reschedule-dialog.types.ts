import type { TProfileVisit } from '../bookings-section.types';

export type TRescheduleDialogConfig = {
  visit: TProfileVisit;
  onClose: () => void;
  /** A API barrou pela política da loja; recebe a mensagem dela. */
  onPolicyBlocked: (message: string) => void;
};

export type TRescheduleDay = {
  /** YYYY-MM-DD */
  key: string;
  weekday: string;
  day: number;
  label: string;
  isDisabled: boolean;
};
