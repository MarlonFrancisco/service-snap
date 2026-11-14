import { cn } from '@repo/ui';
import type { TAgendaClosedNoticeConfig } from './agenda-closed-notice.types';

/** Listras da folga: gradiente com dados fixos, não cabe numa classe utilitária. */
const OFF_PATTERN_STYLE = {
  backgroundImage:
    'repeating-linear-gradient(135deg, #F4F3F7 0 7px, #E6E4EC 7px 14px)',
};

/**
 * Feriado: aviso no topo da coluna, com as linhas em cinza.
 * Folga: a coluna inteira listrada, com o aviso dentro.
 */
export const AgendaClosedNotice = ({ notice }: TAgendaClosedNoticeConfig) => {
  const isOff = notice.variant === 'off';

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-[5]',
        isOff ? 'bottom-0 rounded-[12px] p-2' : 'p-[3px]',
      )}
      style={isOff ? OFF_PATTERN_STYLE : undefined}
    >
      <div
        className={cn(
          'flex flex-col gap-0.5 bg-white p-2.5 text-[11px] text-[#5F5C6E]',
          isOff ? 'rounded-[10px]' : 'rounded-[12px] border border-[#E3E1EA]',
        )}
      >
        <b className="text-xs text-[#0B0B0F]">{notice.title}</b>
        <span>{notice.text}</span>
      </div>
    </div>
  );
};
