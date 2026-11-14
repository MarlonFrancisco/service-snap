import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { Lock } from 'lucide-react';
import type { TAgendaBlockedBlockConfig } from './agenda-blocked-block.types';

export const AgendaBlockedBlock = ({
  block,
  style,
  onClick,
}: TAgendaBlockedBlockConfig) => {
  const { blockedTime, label } = block;
  const rangeText = label.replace('–', ' a ');

  return (
    <button
      type="button"
      onClick={() => onClick(blockedTime)}
      aria-label={`Bloqueado ${label === 'dia inteiro' ? 'o dia inteiro' : `de ${rangeText}`}, abrir bloqueio`}
      className={cn(
        'absolute z-10 flex flex-col gap-0.5 overflow-hidden rounded-[9px] bg-[#DEDBE6] px-2 py-1.5 text-left text-[11px] font-medium text-[#0B0B0F] transition-[filter] hover:brightness-95',
        PARTNER_FOCUS_CLASS,
        'focus-visible:outline-offset-[-2px]',
      )}
      style={style}
    >
      <span className="flex min-w-0 items-center gap-[5px] text-xs font-bold">
        <Lock className="size-[13px] shrink-0 stroke-2" aria-hidden="true" />
        <span className="truncate">Bloqueado · {label}</span>
      </span>
      {blockedTime.isRecurring && (
        <span className="truncate">Toda semana</span>
      )}
    </button>
  );
};
