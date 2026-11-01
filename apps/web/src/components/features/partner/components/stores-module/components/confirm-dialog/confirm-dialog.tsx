import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  cn,
} from '@repo/ui';
import type { TConfirmDialogConfig } from './confirm-dialog.types';

export const ConfirmDialog = ({
  title,
  description,
  cancelLabel,
  confirmLabel,
  onConfirm,
  trigger,
  open,
  onOpenChange,
}: TConfirmDialogConfig) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}

    <AlertDialogContent
      className={cn(
        PARTNER_PORTAL_CLASS,
        'gap-2 rounded-[24px] border-0 bg-white px-6 py-[22px] shadow-[0_20px_60px_rgba(15,12,30,0.18)]',
      )}
    >
      <AlertDialogHeader className="gap-2 text-left">
        <AlertDialogTitle className="text-xl font-extrabold tracking-[-0.02em]">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm leading-normal text-[#5F5C6E]">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter className="gap-2.5 pt-2.5">
        <AlertDialogCancel className="h-auto min-h-[46px] rounded-full border-[#E3E1EA] px-5 text-sm font-bold text-[#0B0B0F] shadow-none">
          {cancelLabel}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="h-auto min-h-[46px] rounded-full bg-[#A4231A] px-5 text-sm font-bold text-white hover:bg-[#8A1D16]"
        >
          {confirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
