import { useBlockedTimeMutations } from '@/hooks';
import { usePartnerStore } from '@/store';
import {
  getAppointmentForSlot as getAppointmentForSlotHelper,
  getSlotColor,
  getSlotsSpan,
  INITIAL_APPOINTMENT_FORM,
  isSlotOccupied as isSlotOccupiedHelper,
  selectTimeSlots,
  selectWeekDates,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IAppointment } from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';
import { useCallback, useMemo } from 'react';
import { useAgendaGridBulkBlock } from '../agenda-grid/agenda-grid-bulk-block.hook';
import type { TSelectedSlot } from '../agenda-grid/agenda-grid-bulk-block.types';
import {
  dateToISOString,
  formatDateBR,
  isBlockedTime,
  isToday,
} from '../agenda-grid/agenda-grid.helpers';

/**
 * Hook para visualização de dia único
 * Foca em um único dia com todos os profissionais
 */
export const useAgendaDayView = () => {
  // Store selectors
  const professionals = usePartnerStore(
    (state) => state.activeStore.storeMembers || [],
  );
  const days = useAgendaStore((state) => state.days);
  const weekDates = useAgendaStore(selectWeekDates);
  const workingDayKeys = useAgendaStore((state) => state.workingDayKeys);
  const timeSlots = usePartnerStore(selectTimeSlots);
  const selectedProfessionalId = useAgendaStore(
    (state) => state.selectedProfessional,
  );
  const appointments = useAgendaStore((state) => state.appointments);
  const isBlockMode = useAgendaStore((state) => state.isBlockMode);
  const selectedDayIndex = useAgendaStore((state) => state.selectedDayIndex);
  const setSelectedDayIndex = useAgendaStore(
    (state) => state.setSelectedDayIndex,
  );
  const { activeStore } = usePartnerStore();
  const workingDays = usePartnerStore(
    (state) => state.activeStore.businessDays,
  );

  const setDetailsAppointment = useAgendaStore(
    (state) => state.setDetailsAppointment,
  );
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const {
    createBlockedTime,
    deleteBlockedTime,
    createBulkBlockedTime,
    deleteBulkBlockedTime,
  } = useBlockedTimeMutations({
    storeId: activeStore?.id,
  });

  // Bulk block handler
  const handleBulkBlock = useCallback(
    (slots: TSelectedSlot[]) => {
      const professional = professionals.find(
        (p) => p.id === slots[0]?.professionalId,
      );

      if (!professional) return;

      const slotsByAction = slots.reduce(
        (acc, slot) => {
          if (slot.isBlocked) {
            acc.blockedTimes.push(slot);
          } else {
            acc.unblockedTimes.push(slot);
          }
          return acc;
        },
        {
          blockedTimes: [] as TSelectedSlot[],
          unblockedTimes: [] as TSelectedSlot[],
        },
      );

      if (slotsByAction.unblockedTimes.length > 0) {
        createBulkBlockedTime({
          storeMemberId: professional.id,
          blockedTimes: slotsByAction.unblockedTimes,
        });
      }

      if (slotsByAction.blockedTimes.length > 0) {
        deleteBulkBlockedTime({
          storeMemberId: professional.id,
          blockedTimes: slotsByAction.blockedTimes.map((slot) => ({
            id: slot.id!,
          })),
        });
      }
    },
    [createBulkBlockedTime, deleteBulkBlockedTime, professionals],
  );

  // Initialize bulk block hook
  const bulkBlockHook = useAgendaGridBulkBlock({
    isBlockMode,
    onBulkBlock: handleBulkBlock,
  });

  // Filtered professionals based on selection
  const filteredProfessionals = useMemo(() => {
    if (selectedProfessionalId === 'all') {
      return professionals;
    }
    return professionals.filter(
      (professional) => professional.id === selectedProfessionalId,
    );
  }, [professionals, selectedProfessionalId]);

  // Current day data
  const currentDayData = useMemo(() => {
    const date = weekDates[selectedDayIndex];
    const workingKey = workingDayKeys[selectedDayIndex];
    const dayLabel = days[selectedDayIndex];

    if (!date || !workingKey || !dayLabel) {
      return null;
    }

    return {
      date,
      dayIndex: selectedDayIndex,
      dayLabel,
      isToday: isToday(date),
      isWorkingDay: workingDays[workingKey],
      formattedDate: formatDateBR(date),
      dateStr: dateToISOString(date),
    };
  }, [weekDates, selectedDayIndex, workingDayKeys, days, workingDays]);

  // Navigation handlers
  const handlePreviousDay = useCallback(() => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  }, [selectedDayIndex, setSelectedDayIndex]);

  const handleNextDay = useCallback(() => {
    if (selectedDayIndex < 6) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  }, [selectedDayIndex, setSelectedDayIndex]);

  const handleSelectDay = useCallback(
    (dayIndex: number) => {
      setSelectedDayIndex(dayIndex);
    },
    [setSelectedDayIndex],
  );

  // Get today's day index
  const todayDayIndex = useMemo(() => {
    return weekDates.findIndex((date) => date && isToday(date));
  }, [weekDates]);

  const handleGoToToday = useCallback(() => {
    if (todayDayIndex >= 0) {
      setSelectedDayIndex(todayDayIndex);
    }
  }, [todayDayIndex, setSelectedDayIndex]);

  // Core utility functions
  const getAppointmentForSlot = useCallback(
    (professionalId: string, time: string) => {
      const date = weekDates[selectedDayIndex];
      if (!date) return null;

      const dateStr = dateToISOString(date);
      if (!dateStr) return null;

      return getAppointmentForSlotHelper(
        appointments,
        professionalId,
        dateStr,
        time,
      );
    },
    [appointments, weekDates, selectedDayIndex],
  );

  const isSlotOccupied = useCallback(
    (professionalId: string, time: string) => {
      const date = weekDates[selectedDayIndex];
      if (!date) return false;

      const dateStr = dateToISOString(date);
      if (!dateStr) return false;

      return isSlotOccupiedHelper(appointments, professionalId, dateStr, time);
    },
    [appointments, weekDates, selectedDayIndex],
  );

  // Slot click handler
  const handleSlotClick = useCallback(
    (professional: IProfessional, time: string, blockedTime?: IBlockedTime) => {
      const appointment = getAppointmentForSlot(professional.id, time);

      const date = weekDates[selectedDayIndex];
      if (!date) return;

      const dateStr = dateToISOString(date);
      if (!dateStr) return;

      if (isBlockMode) {
        if (blockedTime) {
          deleteBlockedTime({
            id: blockedTime.id,
            date: dateStr,
            time: time,
            isRecurring: false,
            dayOfWeek: selectedDayIndex,
            storeMember: professional,
          });
          bulkBlockHook.removeSlotFromSelection(
            professional.id,
            selectedDayIndex,
            time,
          );
          return;
        }

        createBlockedTime({
          date: dateStr,
          time: time,
          isRecurring: false,
          dayOfWeek: selectedDayIndex,
          storeMember: professional,
        });
        bulkBlockHook.removeSlotFromSelection(
          professional.id,
          selectedDayIndex,
          time,
        );
        return;
      }

      if (blockedTime) return;

      if (appointment) {
        setDetailsAppointment(appointment);
        return;
      }

      setIsAddAppointmentOpen({
        isAddAppointmentOpen: true,
        selectedAppointment: {
          ...INITIAL_APPOINTMENT_FORM,
          date: dateStr,
          startTime: time,
          storeMember: professional,
        },
      });
    },
    [
      getAppointmentForSlot,
      isBlockMode,
      setDetailsAppointment,
      createBlockedTime,
      weekDates,
      selectedDayIndex,
      setIsAddAppointmentOpen,
      deleteBlockedTime,
      bulkBlockHook,
    ],
  );

  // Get day appointments
  const getDayAppointments = useCallback(() => {
    const date = weekDates[selectedDayIndex];
    if (!date) return [];

    const targetDate = dateToISOString(date);
    if (!targetDate) return [];

    return appointments
      .filter((appointment) => {
        if (appointment.date !== targetDate) return false;
        if (appointment.status === 'cancelled') return false;

        if (selectedProfessionalId !== 'all') {
          return appointment.storeMember.id === selectedProfessionalId;
        }

        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, weekDates, selectedDayIndex, selectedProfessionalId]);

  const handleAppointmentClick = useCallback(
    (appointment: IAppointment) => {
      setDetailsAppointment(appointment);
    },
    [setDetailsAppointment],
  );

  // Slot className
  const getSlotClassName = useCallback(
    (context: {
      appointment: IAppointment | null;
      isBlocked: boolean;
      isWorkingDay: boolean;
    }) => {
      const base = 'px-3 py-2 transition-colors';

      if (!context.isWorkingDay) {
        return `${base} cursor-not-allowed opacity-60`;
      }

      if (context.appointment) {
        return `${base} rounded-lg ${getSlotColor(context.appointment, context.isBlocked)}`;
      }

      if (context.isBlocked) {
        return `${base} cursor-pointer border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200`;
      }

      return `${base} cursor-pointer border-gray-200 bg-white text-gray-700 hover:bg-gray-50`;
    },
    [],
  );

  // Week days for quick navigation
  const weekDaysNavigation = useMemo(() => {
    return days.map((label, index) => {
      const date = weekDates[index];
      const workingKey = workingDayKeys[index];

      if (!date || !workingKey) return null;

      return {
        index,
        label: label.substring(0, 3),
        day: date.getDate(),
        isToday: isToday(date),
        isWorkingDay: workingDays[workingKey],
        isSelected: index === selectedDayIndex,
      };
    });
  }, [days, weekDates, workingDayKeys, workingDays, selectedDayIndex]);

  return {
    // State
    timeSlots,
    isBlockMode,
    selectedDayIndex,
    currentDayData,
    filteredProfessionals,
    weekDaysNavigation,
    todayDayIndex,

    // Navigation
    handlePreviousDay,
    handleNextDay,
    handleSelectDay,
    handleGoToToday,

    // Slot operations
    getAppointmentForSlot,
    isSlotOccupied,
    handleSlotClick,
    getSlotClassName,
    getDayAppointments,
    handleAppointmentClick,
    getSlotsSpan,
    isBlockedTime,

    // Bulk block
    bulkBlockHook,
  };
};
