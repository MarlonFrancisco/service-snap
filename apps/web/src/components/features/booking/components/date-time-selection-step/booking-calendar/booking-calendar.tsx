'use client';

import { Calendar, cn } from '@repo/ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { DayButton, type DayPickerProps } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';

type TBookingCalendarConfig = {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled: (date: Date) => boolean;
};

const CAPTION_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
});
const WEEKDAY_FORMAT = new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow' });

const NAV_BUTTON_CLASS =
  'grid h-11 w-11 place-items-center rounded-full border border-[#E3E1EA] bg-white text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7] aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:bg-white';

const CALENDAR_CLASS_NAMES: DayPickerProps['classNames'] = {
  root: 'w-full',
  months: 'relative w-full',
  month: 'w-full',
  nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
  button_previous: NAV_BUTTON_CLASS,
  button_next: NAV_BUTTON_CLASS,
  month_caption: 'mb-3 flex h-11 items-center justify-center',
  caption_label:
    'block text-[17px] font-bold text-[#0B0B0F] first-letter:uppercase',
  month_grid: 'block w-full [&>thead]:block',
  weekdays: 'grid grid-cols-7 gap-1',
  weekday: 'py-2 text-center text-xs font-semibold text-[#5F5C6E]',
  weeks: 'block',
  week: 'mt-1 grid grid-cols-7 gap-1',
  day: 'block p-0 text-center',
  today: '',
  outside: '',
  disabled: '',
  hidden: 'invisible',
};

const CalendarChevron = ({
  orientation,
}: {
  orientation?: 'up' | 'down' | 'left' | 'right';
}) =>
  orientation === 'left' ? (
    <ArrowLeft className="h-4 w-4" aria-hidden />
  ) : (
    <ArrowRight className="h-4 w-4" aria-hidden />
  );

const CalendarDayButton = ({
  className,
  modifiers,
  ...props
}: ComponentProps<typeof DayButton>) => (
  <DayButton
    {...props}
    modifiers={modifiers}
    className={cn(
      className,
      'aspect-square min-h-11 w-full rounded-full text-sm font-semibold text-[#0B0B0F] transition-colors',
      modifiers.disabled
        ? 'cursor-default font-medium text-[#8D8A9B] line-through'
        : 'cursor-pointer hover:bg-[#F4F3F7]',
      modifiers.selected &&
        'bg-[#0B0B0F] text-white hover:bg-[#0B0B0F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B0B0F]',
    )}
  />
);

export function BookingCalendar({
  selected,
  onSelect,
  disabled,
}: TBookingCalendarConfig) {
  return (
    <Calendar
      mode="single"
      locale={ptBR}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      startMonth={new Date()}
      showOutsideDays={false}
      className="w-full p-0"
      classNames={CALENDAR_CLASS_NAMES}
      formatters={{
        formatCaption: (date) => CAPTION_FORMAT.format(date),
        formatWeekdayName: (date) => WEEKDAY_FORMAT.format(date),
      }}
      labels={{
        labelPrevious: () => 'Mês anterior',
        labelNext: () => 'Próximo mês',
      }}
      components={{
        Chevron: CalendarChevron,
        DayButton: CalendarDayButton,
      }}
    />
  );
}
