'use client';
import { useSchedulesQuery } from '@/hooks/use-query/use-schedules-query';
import { generateTimeSlots } from '@/store/admin/agenda/agenda.helpers';
import { TWorkingDays } from '@/types/api/stores.types';
import { formatStorePrice } from '@/utils/helpers/price.helper';
import { Button, Calendar as CalendarComponent, Card } from '@repo/ui';
import { Calendar, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useGetStore } from '../../booking.hook';
import { TBookingFormData } from '../../booking.schema';
import { ITimeSlot } from '../../booking.types';
import { DatePickerHorizontal } from './date-picker-horizontal';
import { SkeletonTimeSlots } from './skeleton-time-slots';

export function DateTimeSelectionStep() {
  const store = useGetStore();
  const { watch, setValue } = useFormContext<TBookingFormData>();
  const selectedServices = watch('selectedServices');
  const selectedDate = watch('selectedDate');
  const selectedTime = watch('selectedTime');
  const selectedProfessional = watch('selectedProfessional');
  const [availableSlots, setAvailableSlots] = useState<ITimeSlot[]>([]);

  const { schedules, isPendingSchedules } = useSchedulesQuery({
    storeId: store?.id,
  });

  const professionalSchedules = useMemo(() => {
    // "Qualquer profissional": não restringe por agenda (mesmo comportamento anterior).
    if (!selectedProfessional) return [];
    return schedules.filter(
      (schedule) => schedule.storeMember.id === selectedProfessional.id,
    );
  }, [schedules, selectedProfessional]);

  const generateSlots = (): ITimeSlot[] => {
    const selectedDateToIso = selectedDate?.toISOString().split('T')[0];

    const slots: ITimeSlot[] = [];

    const hours = generateTimeSlots({
      openTime: store?.openTime || '',
      closeTime: store?.closeTime || '',
      lunchStartTime: store?.lunchStartTime || '',
      lunchEndTime: store?.lunchEndTime || '',
    });

    hours.forEach((time) => {
      const isBlockedTime = selectedProfessional?.blockedTimes?.some(
        (blockedTime) =>
          blockedTime.date === selectedDateToIso && blockedTime.time === time,
      );

      const isScheduledTime = professionalSchedules.some((schedule) => {
        const scheduleDate = String(schedule.date).slice(0, 10);
        const startTimeNormalized = schedule.startTime.replace(':', '');
        const endTimeNormalized = schedule.endTime.replace(':', '');
        const timeNormalized = time.replace(':', '');

        return (
          scheduleDate === selectedDateToIso &&
          startTimeNormalized <= timeNormalized &&
          endTimeNormalized > timeNormalized
        );
      });

      slots.push({
        time,
        available: !isBlockedTime && !isScheduledTime,
      });
    });

    return slots;
  };

  useEffect(() => {
    if (!selectedDate || isPendingSchedules) return;
    setAvailableSlots(generateSlots());
  }, [selectedDate, isPendingSchedules, professionalSchedules, selectedProfessional]);

  const isLoadingSlots = isPendingSchedules;

  const handleDateSelect = (date: Date | undefined) => {
    setValue('selectedDate', date);
    setValue('selectedTime', null);
  };

  const handleTimeSelect = (time: string) => {
    setValue('selectedTime', time);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return formatStorePrice(price, store!.currency, store!.country);
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
    <div className="space-y-8">
      <div>
        <h2 className="text-lg sm:text-2xl text-[#1a2b4c] mb-1">
          Escolha data e horário
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Selecione quando deseja realizar{' '}
          {selectedServices.length > 1 ? 'os serviços' : 'o serviço'}
        </p>
      </div>

      <div className="md:hidden space-y-4">
        <Card className="p-5 bg-white shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-[#1a2b4c]">Selecione a data</h3>
          </div>

          <DatePickerHorizontal
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            businessDays={store?.businessDays}
          />
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-[#1a2b4c]">Selecione o horário</h3>
          </div>

          {!selectedDate && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Selecione uma data primeiro
              </p>
            </div>
          )}

          {selectedDate && isLoadingSlots && <SkeletonTimeSlots />}

          {selectedDate && !isLoadingSlots && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-sm text-gray-600 mb-3">
                {formatDate(selectedDate)}
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Nenhum horário disponível nesta data
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <AnimatePresence>
                    {availableSlots.map((slot, index) => (
                      <motion.div
                        key={slot.time}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant={
                            selectedTime === slot.time ? 'default' : 'outline'
                          }
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`p-3 h-auto flex flex-col w-full transition-all ${
                            selectedTime === slot.time
                              ? 'bg-black hover:bg-gray-800 text-white'
                              : slot.available
                                ? 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          aria-label={`Selecionar horário ${slot.time}`}
                        >
                          <span className="font-medium">{slot.time}</span>
                          {slot.available && slot.price && (
                            <span className="text-xs opacity-80">
                              {formatPrice(slot.price)}
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </div>

      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600" />
            <h3 className="text-[#1a2b4c]">Selecione a data</h3>
          </div>

          <CalendarComponent
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border-0 w-full"
          />
        </Card>

        <Card className="p-5 border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-[#1a2b4c]">Selecione o horário</h3>
          </div>

          {!selectedDate && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Selecione uma data primeiro
              </p>
            </div>
          )}

          {selectedDate && isLoadingSlots && <SkeletonTimeSlots />}

          {selectedDate && !isLoadingSlots && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-sm text-gray-600 mb-3">
                {formatDate(selectedDate)}
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Nenhum horário disponível nesta data
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <AnimatePresence>
                    {availableSlots.map((slot, index) => (
                      <motion.div
                        key={slot.time}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Button
                          variant={
                            selectedTime === slot.time ? 'default' : 'outline'
                          }
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className={`p-3 h-auto flex flex-col w-full transition-all ${
                            selectedTime === slot.time
                              ? 'bg-black hover:bg-gray-800 text-white'
                              : slot.available
                                ? 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-medium">{slot.time}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
