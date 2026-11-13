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
  cn,
  Spinner,
} from '@repo/ui';
import {
  RETENTION_BUTTON_CLASS,
  RETENTION_DIALOG_CLASS,
  RETENTION_DIALOG_TITLE_CLASS,
  RETENTION_PRIMARY_BUTTON_CLASS,
} from '../../packages-module.styles';
import type { TRetentionConfirmDialogConfig } from './retention-confirm-dialog.types';

const DANGER_CLASS =
  'border-[#A4231A] bg-[#A4231A] hover:bg-[#8A1D16] text-white';

/** Confirmação curta de ações que não voltam atrás (cancelar saldo, usar recompensa). */
export const RetentionConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel = 'Voltar',
  tone = 'primary',
  isPending = false,
  onConfirm,
  onCancel,
}: TRetentionConfirmDialogConfig) => (
  <AlertDialog
    open={isOpen}
    onOpenChange={(nextOpen) => {
      if (!nextOpen && !isPending) onCancel();
    }}
  >
    <AlertDialogContent
      className={cn(RETENTION_DIALOG_CLASS, 'sm:max-w-[440px]')}
    >
      <AlertDialogHeader className="text-left">
        <AlertDialogTitle className={RETENTION_DIALOG_TITLE_CLASS}>
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm leading-normal text-[#5F5C6E]">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2.5 pt-1">
        <AlertDialogCancel
          disabled={isPending}
          className={RETENTION_BUTTON_CLASS}
        >
          {cancelLabel}
        </AlertDialogCancel>
        <AlertDialogAction
          disabled={isPending}
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
          className={cn(
            RETENTION_PRIMARY_BUTTON_CLASS,
            tone === 'danger' && DANGER_CLASS,
          )}
        >
          {isPending ? (
            <>
              <Spinner />
              {pendingLabel}
            </>
          ) : (
            confirmLabel
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
