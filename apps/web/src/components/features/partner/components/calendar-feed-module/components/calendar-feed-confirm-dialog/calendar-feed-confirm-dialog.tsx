'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui';
import {
  MODULE_DIALOG_CANCEL_CLASS,
  MODULE_DIALOG_CLASS,
  MODULE_DIALOG_DANGER_CLASS,
  MODULE_DIALOG_TEXT_CLASS,
  MODULE_DIALOG_TITLE_CLASS,
} from '../../../notifications-module/notifications-module.styles';
import type { TCalendarFeedConfirmDialogConfig } from './calendar-feed-confirm-dialog.types';

export const CalendarFeedConfirmDialog = ({
  content,
  isPending,
  onConfirm,
  onCancel,
}: TCalendarFeedConfirmDialogConfig) => (
  <AlertDialog
    open={Boolean(content)}
    onOpenChange={(open) => {
      if (!open) onCancel();
    }}
  >
    {content ? (
      <AlertDialogContent className={MODULE_DIALOG_CLASS}>
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className={MODULE_DIALOG_TITLE_CLASS}>
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className={MODULE_DIALOG_TEXT_CLASS}>
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-2.5">
          <AlertDialogCancel
            disabled={isPending}
            className={MODULE_DIALOG_CANCEL_CLASS}
          >
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className={MODULE_DIALOG_DANGER_CLASS}
          >
            {isPending ? content.pendingLabel : content.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    ) : null}
  </AlertDialog>
);
