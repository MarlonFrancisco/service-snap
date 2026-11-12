import { cn } from '@repo/ui';
import { Check } from 'lucide-react';
import { PRESENCE_CONFIG } from '../../agenda-grid.constants';
import type { TAgendaPresenceChipConfig } from './agenda-presence-chip.types';

export const AgendaPresenceChip = ({
  kind,
  isBordered = false,
  className,
  ...props
}: TAgendaPresenceChipConfig) => {
  const presence = PRESENCE_CONFIG[kind];

  return (
    <span
      className={cn(
        'inline-flex max-w-full shrink-0 items-center gap-1 rounded-full bg-white px-2 py-px text-[11px] leading-[14px] font-bold whitespace-nowrap',
        presence.className,
        isBordered && 'border border-[#E3E1EA]',
        className,
      )}
      {...props}
    >
      {presence.hasIcon && (
        <Check
          aria-hidden="true"
          className="size-3 shrink-0"
          strokeWidth={2.4}
        />
      )}
      <span className="min-w-0 truncate">{presence.label}</span>
    </span>
  );
};
