'use client';

import { useSubscriptionQuery } from '@/hooks/use-query/use-subscription-query';
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
  MODULE_DIALOG_PRIMARY_CLASS,
  MODULE_DIALOG_TEXT_CLASS,
  MODULE_DIALOG_TITLE_CLASS,
} from '../../../../notifications-module/notifications-module.styles';
import { formatPlanDate } from '../../../plans-module.utils';
import type { TCancelReactivateDialogConfig } from './cancel-reactivate-dialog.types';

export function CancelReactivateDialog({
  isOpen,
  isFetching,
  onConfirm,
  onCancel,
}: TCancelReactivateDialogConfig) {
  const { currentPlan } = useSubscriptionQuery();

  if (!currentPlan) return null;

  const isReactivating = currentPlan.cancelAtPeriodEnd;
  const billingDate = formatPlanDate(currentPlan.nextBillingDate);

  const content = isReactivating
    ? {
        title: `Reativar o plano ${currentPlan.planName}?`,
        description: billingDate
          ? `A renovação automática volta a valer e a próxima cobrança será em ${billingDate}.`
          : 'A renovação automática volta a valer na próxima data de cobrança.',
        cancelLabel: 'Voltar',
        confirmLabel: 'Reativar plano',
        pendingLabel: 'Reativando...',
        confirmClassName: MODULE_DIALOG_PRIMARY_CLASS,
      }
    : {
        title: `Cancelar o plano ${currentPlan.planName}?`,
        description: billingDate
          ? `Seu acesso continua até ${billingDate}. Depois dessa data, o plano é encerrado e não há novas cobranças.`
          : 'Seu acesso continua até o fim do ciclo atual. Depois disso, o plano é encerrado e não há novas cobranças.',
        cancelLabel: 'Manter plano',
        confirmLabel: 'Cancelar plano',
        pendingLabel: 'Cancelando...',
        confirmClassName: MODULE_DIALOG_DANGER_CLASS,
      };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isFetching) onCancel();
      }}
    >
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
            disabled={isFetching}
            className={MODULE_DIALOG_CANCEL_CLASS}
          >
            {content.cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isFetching}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className={content.confirmClassName}
          >
            {isFetching ? content.pendingLabel : content.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
