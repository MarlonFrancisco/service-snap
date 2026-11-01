import {
  AlertDialog,
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
  PARTNER_MUTED_TEXT_CLASS,
  PARTNER_PORTAL_CLASS,
} from '../../../../partner.styles';
import {
  SERVICES_BUTTON_CLASS,
  SERVICES_DANGER_BUTTON_CLASS,
} from '../../services-module.styles';

type TServicesConfirmDialogConfig = {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  /** Sem `confirmLabel`, o diálogo só informa: resta o botão de fechar. */
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm?: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

const ACTION_CLASS = 'min-h-[46px] px-5 text-sm font-bold';

export const ServicesConfirmDialog = ({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  isPending = false,
  onConfirm,
  onOpenChange,
}: TServicesConfirmDialogConfig) => (
  <AlertDialog
    open={isOpen}
    onOpenChange={(open) => {
      if (!isPending) onOpenChange(open);
    }}
  >
    <AlertDialogContent
      className={cn(
        PARTNER_PORTAL_CLASS,
        'gap-2 rounded-[24px] border-0 bg-white px-6 py-[22px] sm:max-w-[520px]',
      )}
    >
      <AlertDialogHeader className="gap-2 text-left">
        <AlertDialogTitle className="text-xl font-extrabold tracking-[-0.02em]">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription
          className={cn('text-sm leading-normal', PARTNER_MUTED_TEXT_CLASS)}
        >
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className="gap-2.5 pt-2.5">
        <AlertDialogCancel
          disabled={isPending}
          className={cn(
            SERVICES_BUTTON_CLASS,
            ACTION_CLASS,
            'm-0 h-auto focus-visible:ring-2 focus-visible:ring-[#0B0B0F] focus-visible:ring-offset-2',
          )}
        >
          {cancelLabel}
        </AlertDialogCancel>
        {confirmLabel && (
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={cn(SERVICES_DANGER_BUTTON_CLASS, ACTION_CLASS)}
          >
            {isPending && <Spinner />}
            {isPending ? 'Excluindo...' : confirmLabel}
          </button>
        )}
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
