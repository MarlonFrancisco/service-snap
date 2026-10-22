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
import { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IAppointment } from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';
import { useCallback, useMemo } from 'react';
import { useAgendaGridBulkBlock } from './agenda-grid-bulk-block.hook';
import type { TSelectedSlot } from './agenda-grid-bulk-block.types';
import {
  dateToISOString,
  getProfessionalFullName,
} from './agenda-grid.helpers';
import type {
  TSelectedProfessionalData,
  TSlotRenderContext,
} from './agenda-grid.types';

/**
 * Hook base compartilhado para grids de agenda (mobile e desktop)
 * Contém toda a lógica comum de manipulação de slots, appointments e blocked times
 */
export const useAgendaGrid = () => {
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
        // Create blocked times for all selected slots in bulk
        createBulkBlockedTime({
          storeMemberId: professional.id,
          blockedTimes: slotsByAction.unblockedTimes,
        });
      }

      if (slotsByAction.blockedTimes.length > 0) {
        // Delete blocked times for all selected slots in bulk
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

  const filteredProfessionals = useMemo(() => {
    if (selectedProfessionalId === 'all') {
      return professionals;
    }
    return professionals.filter(
      (professional) => professional.id === selectedProfessionalId,
    );
  }, [professionals, selectedProfessionalId]);

  // ✅ FIX CRITICAL C1: Triple fetch otimizado com useMemo
  const selectedProfessionalData: TSelectedProfessionalData = useMemo(() => {
    if (selectedProfessionalId === 'all') {
      return { name: null, professional: null };
    }

    const professional = professionals.find(
      (p) => p.id === selectedProfessionalId,
    );

    const name = professional ? getProfessionalFullName(professional) : null;

    return { name, professional: professional ?? null };
  }, [professionals, selectedProfessionalId]);

  // Core utility functions
  const getAppointmentForSlot = useCallback(
    (professionalId: string, dayIndex: number, time: string) => {
      const date = weekDates[dayIndex];
      if (!date) {
        return null;
      }

      const dateStr = dateToISOString(date);
      if (!dateStr) {
        return null;
      }

      return getAppointmentForSlotHelper(
        appointments,
        professionalId,
        dateStr,
        time,
      );
    },
    [appointments, weekDates],
  );

  const isSlotOccupied = useCallback(
    (professionalId: string, dayIndex: number, time: string) => {
      const date = weekDates[dayIndex];
      if (!date) {
        return false;
      }

      const dateStr = dateToISOString(date);
      if (!dateStr) {
        return false;
      }

      return isSlotOccupiedHelper(appointments, professionalId, dateStr, time);
    },
    [appointments, weekDates],
  );

  // Default slot click handler
  const handleSlotClick = useCallback(
    (
      professional: IProfessional,
      dayIndex: number,
      time: string,
      blockedTime?: IBlockedTime,
    ) => {
      const appointment = getAppointmentForSlot(
        professional.id,
        dayIndex,
        time,
      );

      const date = weekDates[dayIndex];
      if (!date) {
        return;
      }

      const dateStr = dateToISOString(date);
      if (!dateStr) {
        return;
      }

      if (isBlockMode) {
        if (blockedTime) {
          deleteBlockedTime({
            id: blockedTime.id,
            date: dateStr,
            time: time,
            isRecurring: false,
            dayOfWeek: dayIndex,
            storeMember: professional,
          });
          // Remove from selection after unblocking
          bulkBlockHook.removeSlotFromSelection(
            professional.id,
            dayIndex,
            time,
          );
          return;
        }

        createBlockedTime({
          date: dateStr,
          time: time,
          isRecurring: false,
          dayOfWeek: dayIndex,
          storeMember: professional,
        });
        // Remove from selection after blocking
        bulkBlockHook.removeSlotFromSelection(professional.id, dayIndex, time);
        return;
      }

      if (blockedTime) return;

      // Default behavior
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
      setIsAddAppointmentOpen,
      deleteBlockedTime,
      bulkBlockHook,
    ],
  );

  // Mobile-specific: Get appointments filtered by professional name (excluding cancelled)
  const getDayAppointmentsForCalendar = useCallback(
    (date: Date) => {
      const targetDate = dateToISOString(date);
      if (!targetDate) {
        return [];
      }

      return appointments
        .filter((appointment) => {
          if (appointment.date !== targetDate) {
            return false;
          }

          // Excluir appointments cancelados
          if (appointment.status === 'cancelled') {
            return false;
          }

          if (!selectedProfessionalData.name) {
            return true;
          }

          const appointmentName = getProfessionalFullName(
            appointment.storeMember,
          );

          return appointmentName === selectedProfessionalData.name;
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    },
    [appointments, selectedProfessionalData],
  );

  const handleQuickAdd = useCallback(() => {
    setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
  }, [setIsAddAppointmentOpen]);

  const handleAppointmentClick = useCallback(
    (appointment: IAppointment) => {
      setDetailsAppointment(appointment);
    },
    [setDetailsAppointment],
  );

  // Desktop-specific: Slot className
  const getSlotClassName = useCallback((context: TSlotRenderContext) => {
    const base = 'px-2 py-1 transition-colors';

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
  }, []);

  return {
    // Store state
    days,
    weekDates,
    workingDayKeys,
    workingDays,
    timeSlots,
    selectedProfessionalId,
    appointments,
    isBlockMode,
    selectedDayIndex,

    // Computed values
    filteredProfessionals,
    selectedProfessionalData,

    // Functions
    getAppointmentForSlot,
    isSlotOccupied,
    handleSlotClick,
    setDetailsAppointment,
    setIsAddAppointmentOpen,
    getDayAppointmentsForCalendar,
    handleQuickAdd,
    handleAppointmentClick,
    getSlotClassName,
    getSlotsSpan,

    // Bulk block hook
    bulkBlockHook,
  };
};
