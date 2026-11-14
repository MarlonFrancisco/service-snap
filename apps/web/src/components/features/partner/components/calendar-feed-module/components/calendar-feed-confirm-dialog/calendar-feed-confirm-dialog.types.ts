import type { TCalendarFeedConfirmContent } from '../../calendar-feed-module.types';

export type TCalendarFeedConfirmDialogConfig = {
  content: TCalendarFeedConfirmContent | null;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};
