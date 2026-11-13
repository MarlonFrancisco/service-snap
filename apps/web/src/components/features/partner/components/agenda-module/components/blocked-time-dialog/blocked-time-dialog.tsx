import {
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import {
  AGENDA_DIALOG_CLASS,
  AGENDA_MODAL_BUTTON_CLASS,
  AGENDA_MODAL_DANGER_BUTTON_CLASS,
  AGENDA_MODAL_TITLE_CLASS,
} from '../../agenda-module.styles';
import { useBlockedTimeDialog } from './blocked-time-dialog.hook';

export const BlockedTimeDialog = () => {
  const { isOpen, details, isRemoving, handleClose, handleRemove } =
    useBlockedTimeDialog();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={AGENDA_DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle className={AGENDA_MODAL_TITLE_CLASS}>
            Bloqueado · {details?.range}
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-[#5F5C6E]">
            {details?.day}
            {details?.professionalName ? ` · ${details.professionalName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-[#5F5C6E]">
          Enquanto estiver bloqueado, este horário não aparece na agenda
          online.
        </p>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleClose}
            className={AGENDA_MODAL_BUTTON_CLASS}
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className={cn(
              AGENDA_MODAL_BUTTON_CLASS,
              AGENDA_MODAL_DANGER_BUTTON_CLASS,
            )}
          >
            Remover bloqueio
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
