import { PARTNER_PORTAL_CLASS } from '@/components/features/partner/partner.styles';
import { cn, Popover, PopoverAnchor, PopoverContent } from '@repo/ui';
import {
  AGENDA_BUTTON_ACTIVE_CLASS,
  AGENDA_BUTTON_CLASS,
} from '../../agenda-module.styles';
import { useAgendaReschedulePopover } from './agenda-reschedule-popover.hook';

export const AgendaReschedulePopover = () => {
  const { pending, question, isRescheduling, handleCancel, handleConfirm } =
    useAgendaReschedulePopover();

  return (
    <Popover
      open={!!pending}
      onOpenChange={(isOpen) => !isOpen && handleCancel()}
    >
      {pending && (
        // Âncora sobre a célula de destino; posição vem do soltar, por isso `style`.
        <PopoverAnchor asChild>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed"
            style={pending.anchor}
          />
        </PopoverAnchor>
      )}
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        role="dialog"
        aria-label="Confirmar remarcação"
        className={cn(
          PARTNER_PORTAL_CLASS,
          'flex w-[300px] flex-col gap-2 rounded-[20px] border-[#EBE9F0] bg-white p-4 shadow-[0_20px_50px_rgba(15,12,30,0.2)]',
        )}
      >
        <p className="text-[15px] leading-[1.35] font-bold text-pretty">
          {question}
        </p>
        <p className="text-[13px] text-[#5F5C6E]">
          Avisamos o cliente por e-mail.
        </p>
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className={cn(AGENDA_BUTTON_CLASS, 'flex-1')}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isRescheduling}
            className={cn(
              AGENDA_BUTTON_CLASS,
              AGENDA_BUTTON_ACTIVE_CLASS,
              'flex-1',
            )}
          >
            Remarcar
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
