import { PARTNER_FOCUS_CLASS } from '@/components/features/partner/partner.styles';
import { cn } from '@repo/ui';
import {
  AGENDA_BUTTON_ACTIVE_CLASS,
  AGENDA_BUTTON_CLASS,
} from '../../../../agenda-module.styles';
import type { TAgendaDayStripConfig } from './agenda-day-strip.types';

export const AgendaDayStrip = ({
  days,
  variant,
  onSelect,
}: TAgendaDayStripConfig) => {
  if (variant === 'card') {
    return (
      <div
        role="group"
        aria-label="Dia"
        className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1"
      >
        {days.map((day) => (
          <button
            key={day.index}
            type="button"
            onClick={() => onSelect(day.index)}
            disabled={!day.isWorkingDay}
            aria-pressed={day.isSelected}
            aria-current={day.isToday ? 'date' : undefined}
            aria-label={`${day.label} ${day.day}${day.isWorkingDay ? '' : ', dia não útil'}`}
            className={cn(
              'h-16 min-w-11 flex-1 rounded-2xl border border-[#E3E1EA] bg-white text-xs font-semibold text-[#5F5C6E]',
              !day.isWorkingDay &&
                'cursor-default border-[#F0EEF4] bg-[#F7F6FA] text-[#6F6C7E]',
              day.isSelected && 'border-[#0B0B0F] bg-[#0B0B0F] text-white',
              PARTNER_FOCUS_CLASS,
            )}
          >
            {day.label}
            <b
              className={cn(
                'block text-[17px]',
                day.isSelected ? 'text-white' : 'text-[#0B0B0F]',
                !day.isWorkingDay && !day.isSelected && 'text-[#6F6C7E]',
              )}
            >
              {day.day}
            </b>
          </button>
        ))}
      </div>
    );
  }

  return (
    <nav aria-label="Dias da semana" className="flex gap-1.5 overflow-x-auto">
      {days.map((day) => (
        <button
          key={day.index}
          type="button"
          onClick={() => onSelect(day.index)}
          disabled={!day.isWorkingDay}
          aria-pressed={day.isSelected}
          aria-current={day.isToday ? 'date' : undefined}
          className={cn(
            AGENDA_BUTTON_CLASS,
            'shrink-0 whitespace-nowrap',
            !day.isWorkingDay &&
              'border-[#F0EEF4] bg-[#F7F6FA] text-[#6F6C7E] disabled:cursor-default disabled:opacity-100',
            day.isSelected && AGENDA_BUTTON_ACTIVE_CLASS,
          )}
        >
          {day.label} {day.day}
          {!day.isWorkingDay && ' · Dia não útil'}
        </button>
      ))}
    </nav>
  );
};
