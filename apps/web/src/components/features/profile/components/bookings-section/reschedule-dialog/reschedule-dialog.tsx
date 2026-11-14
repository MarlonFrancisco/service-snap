'use client';

import { cn, Dialog, DialogContent, DialogTitle } from '@repo/ui';
import { Loader2 } from 'lucide-react';
import {
  PROFILE_DIALOG_BUTTON_CLASS,
  PROFILE_DIALOG_BUTTON_PRIMARY_CLASS,
  PROFILE_DIALOG_CLASS,
  PROFILE_DIALOG_CLOSE_CLASS,
  PROFILE_FIELD_ERROR_CLASS,
  PROFILE_FOCUS_CLASS,
  PROFILE_HINT_CLASS,
} from '../../../profile.styles';
import { useRescheduleDialog } from './reschedule-dialog.hook';
import type { TRescheduleDialogConfig } from './reschedule-dialog.types';

const ARROW_CLASS = cn(
  'grid size-9 shrink-0 place-items-center sm:size-11 rounded-full border border-[#E3E1EA] bg-white text-[15px] font-bold text-[#0B0B0F] disabled:cursor-not-allowed disabled:opacity-40',
  PROFILE_FOCUS_CLASS,
);
const NOTICE_CLASS =
  'rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-center text-sm text-[#5F5C6E]';

export const RescheduleDialog = (config: TRescheduleDialogConfig) => {
  const {
    storeName,
    serviceLine,
    currentTimeLine,
    days,
    selectedDateKey,
    times,
    selectedTime,
    error,
    isLoadingSlots,
    isSlotsError,
    canGoBack,
    canGoForward,
    canConfirm,
    isReschedulingBooking,
    handleSelectDay,
    handleSelectTime,
    handlePrevWeek,
    handleNextWeek,
    handleConfirm,
  } = useRescheduleDialog(config);

  const renderTimes = () => {
    if (!selectedDateKey) {
      return <p className={NOTICE_CLASS}>Escolha uma data.</p>;
    }
    if (isLoadingSlots) {
      return (
        <p
          className={cn(NOTICE_CLASS, 'flex items-center justify-center gap-2')}
        >
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Carregando horários...
        </p>
      );
    }
    if (isSlotsError) {
      return (
        <p className={NOTICE_CLASS}>Não foi possível carregar os horários.</p>
      );
    }
    if (times.length === 0) {
      return (
        <p className={NOTICE_CLASS}>
          Nenhum horário livre neste dia. Escolha outra data.
        </p>
      );
    }
    return (
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-labelledby="reschedule-times-label"
      >
        {times.map((time) => (
          <button
            key={time}
            type="button"
            aria-pressed={time === selectedTime}
            onClick={() => handleSelectTime(time)}
            className={cn(
              'h-11 min-w-20 rounded-full border px-3.5 text-sm font-semibold transition-colors',
              PROFILE_FOCUS_CLASS,
              time === selectedTime
                ? 'border-[#0B0B0F] bg-[#0B0B0F] text-white'
                : 'border-[#E3E1EA] bg-white text-[#0B0B0F] hover:bg-[#F7F6FA]',
            )}
          >
            {time}
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && config.onClose()}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          PROFILE_DIALOG_CLASS,
          PROFILE_DIALOG_CLOSE_CLASS,
          'max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto rounded-[28px] border-0 p-5 sm:max-w-[600px] sm:p-[30px]',
        )}
      >
        <DialogTitle className="pr-11 text-2xl font-extrabold tracking-[-0.025em]">
          Remarcar agendamento
        </DialogTitle>

        <div className="rounded-2xl bg-[#F7F6FA] px-[18px] py-4 text-sm leading-[1.5]">
          <b className="block text-[15px]">{storeName}</b>
          <span className="block text-[#5F5C6E]">{serviceLine}</span>
          <span className="block text-[#5F5C6E]">{currentTimeLine}</span>
        </div>

        <p id="reschedule-days-label" className="text-sm font-bold">
          Nova data
        </p>
        <div
          className="flex items-center gap-1 sm:gap-1.5"
          role="group"
          aria-labelledby="reschedule-days-label"
        >
          <button
            type="button"
            onClick={handlePrevWeek}
            disabled={!canGoBack}
            aria-label="Semana anterior"
            className={ARROW_CLASS}
          >
            ←
          </button>
          {days.map((day) => {
            const isSelected = day.key === selectedDateKey;
            return (
              <button
                key={day.key}
                type="button"
                aria-pressed={isSelected}
                aria-disabled={day.isDisabled}
                aria-label={day.label}
                onClick={() => handleSelectDay(day)}
                className={cn(
                  'grid h-16 min-w-0 flex-1 place-items-center rounded-2xl border text-xs font-semibold',
                  PROFILE_FOCUS_CLASS,
                  isSelected
                    ? 'border-[#0B0B0F] bg-[#0B0B0F] text-white'
                    : day.isDisabled
                      ? 'cursor-default border-[#F7F6FA] bg-[#F7F6FA] text-[#5F5C6E]'
                      : 'border-[#E3E1EA] bg-white text-[#5F5C6E] hover:bg-[#F7F6FA]',
                )}
              >
                <span>{day.weekday}</span>
                <b
                  className={cn(
                    'text-lg font-extrabold',
                    isSelected
                      ? 'text-white'
                      : day.isDisabled
                        ? 'text-[#8D8A9B]'
                        : 'text-[#0B0B0F]',
                  )}
                >
                  {day.day}
                </b>
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleNextWeek}
            disabled={!canGoForward}
            aria-label="Próxima semana"
            className={ARROW_CLASS}
          >
            →
          </button>
        </div>

        <p id="reschedule-times-label" className="text-sm font-bold">
          Horários disponíveis
        </p>
        {renderTimes()}

        {error && (
          <p role="alert" className={PROFILE_FIELD_ERROR_CLASS}>
            {error}
          </p>
        )}

        <p className={PROFILE_HINT_CLASS}>Avisamos a loja da mudança.</p>

        <div className="mt-1 flex gap-2.5">
          <button
            type="button"
            onClick={config.onClose}
            className={PROFILE_DIALOG_BUTTON_CLASS}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={PROFILE_DIALOG_BUTTON_PRIMARY_CLASS}
          >
            {isReschedulingBooking && (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            )}
            Confirmar remarcação
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
