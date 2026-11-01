'use client';
import { useAvailabilityQuery } from '@/hooks/use-query/use-availability-query';
import { IAvailabilitySlot } from '@/types/api/schedule.types';
import { TWorkingDays } from '@/types/api/stores.types';
import { cn } from '@repo/ui';
import { motion } from 'motion/react';
import { Fragment, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  getLocalDateKey,
  getServiceIdsByQuantity,
  groupSlotsByPeriod,
} from '../../booking.helpers';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';
import { BookingCalendar } from './booking-calendar';
import { DatePickerHorizontal } from './date-picker-horizontal';
import { SkeletonTimeSlots } from './skeleton-time-slots';

const EMPTY_NOTICE_CLASS =
  'rounded-[14px] bg-[#F7F6FA] px-3.5 py-3 text-center text-sm text-[#5F5C6E]';

export function DateTimeSelectionStep() {
  const store = useGetStore();
  const { watch, setValue } = useFormContext<TBookingFormData>();
  const selectedServices = watch('selectedServices');
  const selectedDate = watch('selectedDate');
  const selectedTime = watch('selectedTime');
  const selectedProfessional = watch('selectedProfessional');
  const isAnyProfessional = watch('isAnyProfessional');

  const { slots, isLoadingSlots, isSlotsError } = useAvailabilityQuery({
    storeId: store?.id,
    date: selectedDate ? getLocalDateKey(selectedDate) : undefined,
    serviceIds: getServiceIdsByQuantity(selectedServices),
    memberId: isAnyProfessional ? undefined : selectedProfessional?.id,
  });
  const availableSlots = slots ?? [];

  // Ao voltar para a etapa, o horário escolhido pode ter deixado de valer
  useEffect(() => {
    if (!slots || !selectedTime) return;

    const slot = slots.find(({ time }) => time === selectedTime);
    setValue('selectedTime', slot?.available ? selectedTime : null);
    setValue(
      'assignedProfessionalId',
      slot?.available ? slot.storeMemberId : null,
    );
  }, [slots]);

  const handleDateSelect = (date: Date | undefined) => {
    setValue('selectedDate', date);
    setValue('selectedTime', null);
    setValue('assignedProfessionalId', null);
  };

  const handleTimeSelect = (slot: IAvailabilitySlot) => {
    setValue('selectedTime', slot.time);
    setValue('assignedProfessionalId', slot.storeMemberId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getDayOfWeekKey = (date: Date) => {
    const dayIndex = date.getDay();
    const dayKeys: Record<number, string> = {
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable if date is in the past
    if (date < today) {
      return true;
    }

    // Disable if it's not a business day
    if (store?.businessDays) {
      const dayKey = getDayOfWeekKey(date);
      if (!store.businessDays[dayKey as keyof TWorkingDays]) {
        return true;
      }
    }

    return false;
  };

  return (
    <div>
      <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#0B0B0F]">
        Escolha data e horário
      </h1>
      <p className="mt-1.5 mb-6 text-[15px] text-[#5F5C6E]">
        Selecione quando deseja realizar{' '}
        {selectedServices.length > 1 ? 'os serviços' : 'o serviço'}
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-8">
        <div className="min-w-0">
          <div className="md:hidden">
            <DatePickerHorizontal
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              businessDays={store?.businessDays}
            />
          </div>

          <div className="hidden md:block">
            <BookingCalendar
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
            />
          </div>
        </div>

        <div className="min-w-0">
          {!selectedDate && (
            <p className={EMPTY_NOTICE_CLASS}>Selecione uma data primeiro</p>
          )}

          {selectedDate && isLoadingSlots && <SkeletonTimeSlots />}

          {selectedDate && !isLoadingSlots && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="mb-3 text-[17px] font-bold text-[#0B0B0F] first-letter:uppercase">
                {formatDate(selectedDate)}
              </p>

              {isSlotsError ? (
                <p role="alert" className={EMPTY_NOTICE_CLASS}>
                  Não foi possível carregar os horários. Tente novamente.
                </p>
              ) : availableSlots.length === 0 ? (
                <p className={EMPTY_NOTICE_CLASS}>
                  Nenhum horário disponível nesta data
                </p>
              ) : (
                groupSlotsByPeriod(availableSlots).map((period) => (
                  <Fragment key={period.label}>
                    <p className="mb-2 text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase">
                      {period.label}
                    </p>
                    <div className="mb-5 grid grid-cols-3 gap-2">
                      {period.slots.map((slot) => {
                        const isSelected = selectedTime === slot.time;

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            aria-pressed={isSelected}
                            aria-label={`Selecionar horário ${slot.time}`}
                            onClick={() => handleTimeSelect(slot)}
                            className={cn(
                              'h-12 rounded-full border text-sm font-semibold transition-colors disabled:cursor-default disabled:border-[#F0EEF4] disabled:bg-[#F7F6FA] disabled:text-[#8D8A9B] disabled:line-through',
                              isSelected
                                ? 'border-[#0B0B0F] bg-[#0B0B0F] text-white'
                                : 'border-[#E3E1EA] bg-white text-[#0B0B0F] hover:bg-[#F4F3F7]',
                            )}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </Fragment>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
