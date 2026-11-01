'use client';
import { Button, cn } from '@repo/ui/index';
import { TWorkingDays } from '@/types/api/stores.types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          disabled={startIndex === 0}
          className="h-8 w-8 p-0 flex-shrink-0"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div ref={scrollContainerRef} className="flex-1 overflow-hidden">
          <div className="flex gap-2">
            {visibleDates.map((date, index) => {
              const isSelected = isDateSelected(date);
              const isDisabled = isDateDisabled(date);
              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => !isDisabled && onSelect(date)}
                  disabled={isDisabled}
                  className={cn(
                    'flex min-w-[60px] flex-1 flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all',
                    isSelected &&
                      'border-[#0A0A0A] bg-[#0A0A0A] text-white shadow-md',
                    !isSelected &&
                      !isDisabled &&
                      'border-[#E4E4E7] hover:border-[#D4D4D8] hover:bg-[#F4F4F5]',
                    isDisabled &&
                      'border-[#F4F4F5] bg-[#F4F4F5] text-[#A1A1AA] cursor-not-allowed opacity-50',
                  )}
                  aria-label={`Selecionar ${formatDayName(date)}, ${formatDate(date)} de ${formatMonth(date)}`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={cn(
                      'text-xs uppercase',
                      isSelected ? 'text-white' : 'text-[#71717A]',
                    )}
                  >
                    {formatDayName(date)}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      isSelected ? 'text-white' : 'text-[#0A0A0A]',
                    )}
                  >
                    {formatDate(date)}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isSelected ? 'text-white/90' : 'text-[#71717A]',
                    )}
                  >
                    {formatMonth(date)}
                  </span>
                  {isToday && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-[#0A0A0A] mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={startIndex + 7 >= dates.length}
          className="h-8 w-8 p-0 flex-shrink-0"
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
