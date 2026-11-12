import type { TPolicyBlock } from '../bookings-section.types';

export type TPolicyBlockedDialogConfig = {
  block: TPolicyBlock | null;
  onClose: () => void;
};
