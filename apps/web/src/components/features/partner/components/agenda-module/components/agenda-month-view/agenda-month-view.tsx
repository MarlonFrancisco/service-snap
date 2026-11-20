import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import { STATUS_CONFIG } from '../agenda-grid/agenda-grid.constants';
import {
  formatCompletedCount,
  formatNoShowCount,
  formatScheduledCount,
} from './agenda-month-view.helpers';
import { useAgendaMonthView } from './agenda-month-view.hook';

const CHIP_CLASS =
  'max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-bold';

const LEGEND_CLASS = 'rounded-full px-2.5 py-[5px]';

export const AgendaMonthView = () => {
  const { weekdays, days, handleOpenDay } = useAgendaMonthView();

  return (
    <>
      <div className="overflow-x-auto rounded-[22px] border border-line">
        <div className="grid min-w-[720px] grid-cols-7">
          {weekdays.map((weekday) => (
            <div
              key={weekday.label}
              className={cn(
                'border-b border-line bg-surface px-2 py-3 text-center text-[13px] font-bold',
                weekday.isClosed && 'text-ink-muted',
              )}
            >
              {weekday.label}
            </div>
          ))}

          {days.map((day) => (
            <button
              key={day.key}
              type="button"
              aria-label={day.ariaLabel}
              aria-current={day.isToday ? 'date' : undefined}
              onClick={() => handleOpenDay(day.date)}
              className={cn(
                'flex h-[124px] min-w-0 flex-col items-start gap-1 border-b border-l border-surface-3 p-2.5 text-left text-ink transition-colors hover:bg-surface',
                !day.isCurrentMonth && 'bg-surface text-ink-muted',
                day.isCurrentMonth &&
                  (day.isClosed || day.holiday ? 'bg-surface' : 'bg-white'),
                day.isToday && 'shadow-[inset_0_0_0_2px_var(--ss-ink)]',
                PARTNER_FOCUS_CLASS,
                'focus-visible:outline-offset-[-2px]',
              )}
            >
              <span className="mb-0.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    'grid h-7 min-w-7 place-items-center rounded-full px-1 text-sm',
                    day.isCurrentMonth ? 'font-bold' : 'font-medium',
                    day.isToday && 'bg-ink text-white',
                  )}
                >
                  {day.day}
                </span>
                {day.isToday && (
                  <span className="text-[11px] font-extrabold">Hoje</span>
                )}
              </span>

              {day.holiday && (
                <>
                  <span className="rounded-full bg-line-2 px-2 py-0.5 text-[11px] font-extrabold text-ink">
                    Feriado
                  </span>
                  {day.holiday.name && (
                    <span className="max-w-full truncate text-[11px] font-semibold text-ink-muted">
                      {day.holiday.name}
                    </span>
                  )}
                </>
              )}

              {!day.holiday && day.isClosed && day.isCurrentMonth && (
                <span className="max-w-full truncate text-[11px] font-semibold text-ink-muted">
                  Loja fechada
                </span>
              )}

              {day.counts.scheduled > 0 && (
                <span
                  className={cn(CHIP_CLASS, STATUS_CONFIG.scheduled.className)}
                >
                  {formatScheduledCount(day.counts.scheduled)}
                </span>
              )}
              {day.counts.completed > 0 && (
                <span
                  className={cn(CHIP_CLASS, STATUS_CONFIG.completed.className)}
                >
                  {formatCompletedCount(day.counts.completed)}
                </span>
              )}
              {day.counts.noShow > 0 && (
                <span
                  className={cn(CHIP_CLASS, STATUS_CONFIG['no-show'].className)}
                >
                  {formatNoShowCount(day.counts.noShow)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div
        aria-label="Legenda"
        className="flex flex-wrap items-center gap-2 text-xs font-semibold"
      >
        <span className={cn(LEGEND_CLASS, STATUS_CONFIG.scheduled.className)}>
          Agendados
        </span>
        <span className={cn(LEGEND_CLASS, STATUS_CONFIG.completed.className)}>
          Concluídos
        </span>
        <span className={cn(LEGEND_CLASS, STATUS_CONFIG['no-show'].className)}>
          Faltas
        </span>
        <p className="ml-auto text-ink-muted">
          Clique em um dia para abrir a visão Dia.
        </p>
      </div>
    </>
  );
};
