'use client';
import { cn } from '@repo/ui/index';
import { TWorkingDays } from '@/types/api/stores.types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const NAV_BUTTON_CLASS =
  'grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#E3E1EA] bg-white text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white';

interface IDatePickerHorizontalProps {
  selected: Date | undefined;
  daysToShow?: number;
  onSelect: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  businessDays?: TWorkingDays;
}

export function DatePickerHorizontal({
  selected,
  daysToShow = 14,
  onSelect,
  disabled,
  businessDays,
}: IDatePickerHorizontalProps) {
  const [startIndex, setStartIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate array of dates starting from today
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const visibleDates = dates.slice(startIndex, startIndex + 7);

  const handlePrevious = () => {
    if (startIndex > 0) {
      setStartIndex(Math.max(0, startIndex - 1));
    }
  };

  const handleNext = () => {
    if (startIndex + 7 < dates.length) {
      setStartIndex(Math.min(dates.length - 7, startIndex + 1));
    }
  };

  const isDateSelected = (date: Date) => {
    if (!selected) return false;
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  const getDayOfWeekKey = (date: Date): keyof TWorkingDays => {
    const dayIndex = date.getDay();
    const dayKeys: Record<number, keyof TWorkingDays> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    return dayKeys[dayIndex] || 'monday';
  };

  const isDateDisabled = (date: Date) => {
    // Check custom disabled function first
    if (disabled && disabled(date)) {
      return true;
    }

    // Check if day is a business day
    if (businessDays) {
      const dayKey = getDayOfWeekKey(date);
      if (!businessDays[dayKey]) {
        return true;
      }
    }

    return false;
  };

  const formatDayName = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date);
  };

  // Auto-scroll to selected date
  useEffect(() => {
    if (selected && scrollContainerRef.current) {
      const selectedIndex = dates.findIndex((date) => isDateSelected(date));
      if (selectedIndex !== -1 && selectedIndex >= startIndex + 7) {
        setStartIndex(Math.max(0, selectedIndex - 3));
      }
    }
  }, [selected]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={startIndex === 0}
          className={NAV_BUTTON_CLASS}
          aria-label="Semana anterior"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </button>

        <div
          ref={scrollContainerRef}
          className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]"
        >
          <div className="flex gap-2">
            {visibleDates.map((date) => {
              const isSelected = isDateSelected(date);
              const isDisabled = isDateDisabled(date);
              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => !isDisabled && onSelect(date)}
                  disabled={isDisabled}
                  className={cn(
                    'flex min-w-[60px] flex-1 flex-col items-center gap-1 rounded-[14px] border p-3 transition-colors',
                    isSelected && 'border-[#0B0B0F] bg-[#0B0B0F] text-white',
                    !isSelected &&
                      !isDisabled &&
                      'border-[#E3E1EA] bg-white hover:bg-[#F4F3F7]',
                    isDisabled &&
                      'cursor-default border-[#F0EEF4] bg-[#F7F6FA] text-[#8D8A9B] line-through',
                  )}
                  aria-label={`Selecionar ${formatDayName(date)}, ${formatDate(date)} de ${formatMonth(date)}`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase',
                      !isSelected && 'text-[#5F5C6E]',
                      isDisabled && 'text-[#8D8A9B]',
                    )}
                  >
                    {formatDayName(date)}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      !isSelected && !isDisabled && 'text-[#0B0B0F]',
                    )}
                  >
                    {formatDate(date)}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      !isSelected && 'text-[#5F5C6E]',
                      isDisabled && 'text-[#8D8A9B]',
                    )}
                  >
                    {formatMonth(date)}
                  </span>
                  {isToday && !isSelected && (
                    <span
                      aria-hidden
                      className="mt-0.5 h-1 w-1 rounded-full bg-[#0B0B0F]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={startIndex + 7 >= dates.length}
          className={NAV_BUTTON_CLASS}
          aria-label="Próxima semana"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
