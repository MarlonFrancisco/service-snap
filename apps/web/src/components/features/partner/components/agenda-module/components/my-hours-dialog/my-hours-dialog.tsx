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
  AGENDA_MODAL_TITLE_CLASS,
} from '../../agenda-module.styles';
import { useMyHoursDialog } from './my-hours-dialog.hook';

export const MyHoursDialog = () => {
  const { isOpen, rows, handleClose } = useMyHoursDialog();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={AGENDA_DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle className={AGENDA_MODAL_TITLE_CLASS}>
            Meu horário
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-[#5F5C6E]">
            Para mudar seus horários, fale com o dono ou gerente.
          </DialogDescription>
        </DialogHeader>

        <dl>
          {rows.map((row) => (
            <div
              key={row.dayKey}
              className="flex justify-between gap-5 border-b border-[#F0EEF4] py-[11px] text-sm"
            >
              <dt className="text-[#5F5C6E]">{row.label}</dt>
              <dd
                className={cn(
                  'text-right font-semibold',
                  row.isOff && 'text-[#5F5C6E]',
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={handleClose}
          className={AGENDA_MODAL_BUTTON_CLASS}
        >
          Fechar
        </button>
      </DialogContent>
    </Dialog>
  );
};
