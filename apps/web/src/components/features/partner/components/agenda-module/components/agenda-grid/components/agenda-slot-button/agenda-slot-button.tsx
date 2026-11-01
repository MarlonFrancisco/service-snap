import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { Check, Lock, Plus, Unlock } from 'lucide-react';
import type { TAgendaSlotState } from '../../agenda-grid.types';
import type { TAgendaSlotButtonConfig } from './agenda-slot-button.types';

const SLOT_BASE_CLASS =
  'flex h-full w-full min-w-0 select-none items-center justify-center gap-1 rounded-[9px] px-0.5 text-xs font-medium';

const SLOT_STATE_CLASS: Record<TAgendaSlotState, string> = {
  free: 'text-[#5F5C6E] hover:bg-[#F7F6FA]',
  blocked: 'bg-[#EBE9F0] font-semibold text-[#0B0B0F]',
  'selected-to-block': 'bg-[#FFF1E0] font-semibold text-[#6E3B00]',
  'selected-to-unblock':
    'bg-[#FFF1E0] font-semibold text-[#6E3B00] ring-1 ring-inset ring-[#8A4B00]',
};

const SLOT_STATE_ICON = {
  blocked: Lock,
  'selected-to-block': Check,
  'selected-to-unblock': Unlock,
} as const;

export const AgendaSlotButton = ({ slot }: TAgendaSlotButtonConfig) => {
  const stateClass = cn(SLOT_BASE_CLASS, SLOT_STATE_CLASS[slot.state]);

  if (!slot.isInteractive) {
    return (
      <div className={stateClass} title={slot.ariaLabel}>
        {slot.text}
      </div>
    );
  }

  const StateIcon = slot.state === 'free' ? null : SLOT_STATE_ICON[slot.state];

  return (
    <button
      type="button"
      aria-label={slot.ariaLabel}
      aria-pressed={slot.isPressed}
      title={slot.isGutter ? slot.ariaLabel : undefined}
      className={cn(
        stateClass,
        slot.isGutter && 'w-6 shrink-0 bg-[#F7F6FA] hover:bg-[#EBE9F0]',
        PARTNER_FOCUS_CLASS,
        'focus-visible:outline-offset-[-2px]',
      )}
      {...slot.handlers}
    >
      {slot.isGutter ? (
        <Plus className="size-3.5" aria-hidden="true" />
      ) : (
        <>
          {StateIcon && (
            <StateIcon className="size-3 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">{slot.text}</span>
        </>
      )}
    </button>
  );
};
