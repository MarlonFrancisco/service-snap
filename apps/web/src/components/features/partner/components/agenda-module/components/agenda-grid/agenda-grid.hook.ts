import { useBlockedTimeMutations } from '@/hooks';
import { useAnalytics } from '@/providers/analytics.provider';
import { usePartnerStore } from '@/store';
import {
  INITIAL_APPOINTMENT_FORM,
  selectTimeSlots,
  selectWeekDates,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IAppointment } from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useAgendaPresence } from '../agenda-data-state/agenda-data-state.hook';
import { useAgendaGridBulkBlock } from './agenda-grid-bulk-block.hook';
import type { TSelectedSlot } from './agenda-grid-bulk-block.types';
import {
  buildAppointmentLayout,
  dateToISOString,
  getProfessionalFullName,
  getProfessionalInitials,
  groupSlotsByProfessional,
  isBlockedTime,
  isToday,
} from './agenda-grid.helpers';
import type {
  TAgendaColumn,
  TAgendaSlot,
  TAgendaSlotState,
  TDayViewData,
} from './agenda-grid.types';
import { GRID_SCROLL_CLASS } from './agenda-grid.constants';

const EMPTY_PROFESSIONALS: IProfessional[] = [];

const getSlotState = (
  isBlocked: boolean,
  isSelected: boolean,
): TAgendaSlotState => {
  if (isSelected)
    return isBlocked ? 'selected-to-unblock' : 'selected-to-block';
  return isBlocked ? 'blocked' : 'free';
};

const SLOT_STATE_TEXT: Record<Exclude<TAgendaSlotState, 'free'>, string> = {
  blocked: 'Bloqueado',
  'selected-to-block': 'Selecionado',
  'selected-to-unblock': 'Desbloquear',
};

const getSlotAriaLabel = (
  state: TAgendaSlotState,
  isBlockMode: boolean,
  time: string,
  professionalName: string,
): string => {
  if (!isBlockMode) {
    return state === 'blocked'
      ? `${time} bloqueado para ${professionalName}`
      : `Agendar às ${time} com ${professionalName}`;
  }

  switch (state) {
    case 'blocked':
      return `Desbloquear ${time} de ${professionalName}`;
    case 'selected-to-block':
      return `${time} de ${professionalName} selecionado para bloquear`;
    case 'selected-to-unblock':
      return `${time} de ${professionalName} selecionado para desbloquear`;
    default:
      return `Bloquear ${time} de ${professionalName}`;
  }
};

/**
 * Hook base compartilhado para as visões da agenda (semana, dia e mobile)
 * Contém toda a lógica comum de manipulação de slots, appointments e blocked times
 */
export const useAgendaGrid = () => {
  const analytics = useAnalytics();
  const professionals = usePartnerStore(
    (state) => state.activeStore.storeMembers ?? EMPTY_PROFESSIONALS,
  );
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const workingDays = usePartnerStore(
    (state) => state.activeStore.businessDays,
  );
  const timeSlots = usePartnerStore(selectTimeSlots);

  const days = useAgendaStore((state) => state.days);
  const weekDates = useAgendaStore(selectWeekDates);
  const currentWeek = useAgendaStore((state) => state.currentWeek);
  const workingDayKeys = useAgendaStore((state) => state.workingDayKeys);
  const selectedProfessionalId = useAgendaStore(
    (state) => state.selectedProfessional,
  );
  const appointments = useAgendaStore((state) => state.appointments);
  const isBlockMode = useAgendaStore((state) => state.isBlockMode);
  const isFocusMode = useAgendaStore((state) => state.isFocusMode);
  const selectedDayIndex = useAgendaStore((state) => state.selectedDayIndex);
  const setSelectedDayIndex = useAgendaStore(
    (state) => state.setSelectedDayIndex,
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
  } = useBlockedTimeMutations({ storeId });
  const { getPresence } = useAgendaPresence();

  /**
   * As mutações em lote recebem um único `storeMemberId`, então a seleção é
   * enviada em uma chamada por profissional.
   */
  const handleBulkBlock = useCallback(
    (slots: TSelectedSlot[]) => {
      groupSlotsByProfessional(slots).forEach(
        (professionalSlots, storeMemberId) => {
          const toUnblock = professionalSlots.filter((slot) => slot.isBlocked);
          const toBlock = professionalSlots.filter((slot) => !slot.isBlocked);

          if (toBlock.length > 0) {
            createBulkBlockedTime({ storeMemberId, blockedTimes: toBlock });
          }

          if (toUnblock.length > 0) {
            deleteBulkBlockedTime({
              storeMemberId,
              blockedTimes: toUnblock.map((slot) => ({ id: slot.id! })),
            });
          }
        },
      );
    },
    [createBulkBlockedTime, deleteBulkBlockedTime],
  );

  const bulkBlockHook = useAgendaGridBulkBlock({
    isBlockMode,
    onBulkBlock: handleBulkBlock,
  });
  const {
    clearSelection,
    handleSlotMouseDown,
    handleSlotMouseEnter,
    handleSlotMouseUp,
    isSlotSelected,
    removeSlotFromSelection,
    shouldIgnoreSlotClick,
  } = bulkBlockHook;

  // O id do slot usa o índice do dia: a seleção não pode sobreviver à troca de semana.
  useEffect(() => {
    clearSelection();
  }, [currentWeek, storeId, clearSelection]);

  const filteredProfessionals = useMemo(() => {
    if (selectedProfessionalId === 'all') {
      return professionals;
    }
    return professionals.filter(
      (professional) => professional.id === selectedProfessionalId,
    );
  }, [professionals, selectedProfessionalId]);

  const visibleMemberId =
    selectedProfessionalId === 'all' ? undefined : selectedProfessionalId;

  const hasTodayInWeek = useMemo(
    () => weekDates.some((date) => isToday(date)),
    [weekDates],
  );

  const dayData = useMemo(
    (): (TDayViewData | null)[] =>
      weekDates.map((date, dayIndex) => {
        const dayKey = workingDayKeys[dayIndex];
        const label = days[dayIndex];

        if (!dayKey || !label) return null;

        return {
          date,
          dayIndex,
          isToday: isToday(date),
          isWorkingDay: workingDays[dayKey],
          dayKey,
          label,
        };
      }),
    [weekDates, workingDayKeys, workingDays, days],
  );

  const selectedDayData = dayData[selectedDayIndex] ?? null;

  const weekDaysNavigation = useMemo(
    () =>
      dayData.flatMap((day) =>
        day
          ? [
              {
                index: day.dayIndex,
                label: day.label.substring(0, 3),
                day: day.date.getDate(),
                isToday: day.isToday,
                isWorkingDay: day.isWorkingDay,
                isSelected: day.dayIndex === selectedDayIndex,
              },
            ]
          : [],
      ),
    [dayData, selectedDayIndex],
  );

  const getDayAppointments = useCallback(
    (date: Date, memberId?: string): IAppointment[] => {
      const targetDate = dateToISOString(date);

      return appointments
        .filter(
          (appointment) =>
            appointment.date === targetDate &&
            appointment.status !== 'cancelled' &&
            (!memberId || appointment.storeMember.id === memberId),
        )
        .sort((first, second) =>
          first.startTime.localeCompare(second.startTime),
        );
    },
    [appointments],
  );

  const handleSlotClick = useCallback(
    (
      professional: IProfessional,
      dayIndex: number,
      time: string,
      blockedTime?: IBlockedTime,
    ) => {
      const date = weekDates[dayIndex];
      if (!date) return;

      const dateStr = dateToISOString(date);

      if (isBlockMode) {
        if (blockedTime) {
          deleteBlockedTime({
            id: blockedTime.id,
            date: dateStr,
            time,
            isRecurring: false,
            dayOfWeek: dayIndex,
            storeMember: professional,
          });
        } else {
          createBlockedTime({
            date: dateStr,
            time,
            isRecurring: false,
            dayOfWeek: dayIndex,
            storeMember: professional,
          });
        }

        removeSlotFromSelection(professional.id, dayIndex, time);
        return;
      }

      if (blockedTime) return;

      analytics.track('appointment_form_opened', { source: 'grid_slot' });
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
      analytics,
      isBlockMode,
      weekDates,
      createBlockedTime,
      deleteBlockedTime,
      removeSlotFromSelection,
      setIsAddAppointmentOpen,
    ],
  );

  const getSlot = useCallback(
    (
      professional: IProfessional,
      dayIndex: number,
      dateStr: string,
      time: string,
      options: { showInitials?: boolean; isGutter?: boolean } = {},
    ): TAgendaSlot => {
      const blockedTime = isBlockedTime(
        professional.blockedTimes,
        dateStr,
        time,
      );
      const isSelected =
        isBlockMode && isSlotSelected(professional.id, dayIndex, time);
      const state = getSlotState(!!blockedTime, isSelected);

      const [, month, day] = dateStr.split('-');
      const ariaLabel = `${getSlotAriaLabel(
        state,
        isBlockMode,
        time,
        getProfessionalFullName(professional),
      )}, dia ${day}/${month}`;

      const stateText = state === 'free' ? time : SLOT_STATE_TEXT[state];

      return {
        state,
        text: options.showInitials
          ? getProfessionalInitials(professional)
          : stateText,
        ariaLabel,
        isInteractive: isBlockMode || !blockedTime,
        isPressed: isBlockMode ? isSelected : undefined,
        isGutter: options.isGutter,
        handlers: {
          onClick: (event: MouseEvent<HTMLButtonElement>) => {
            if (shouldIgnoreSlotClick(event.detail)) return;
            handleSlotClick(professional, dayIndex, time, blockedTime);
          },
          onMouseDown: (event: MouseEvent<HTMLButtonElement>) => {
            if (!isBlockMode) return;
            event.preventDefault();
            handleSlotMouseDown(
              blockedTime,
              professional.id,
              dayIndex,
              time,
              dateStr,
            );
          },
          onMouseEnter: () =>
            handleSlotMouseEnter(
              blockedTime,
              professional.id,
              dayIndex,
              time,
              dateStr,
            ),
          onMouseUp: handleSlotMouseUp,
        },
      };
    },
    [
      isBlockMode,
      isSlotSelected,
      shouldIgnoreSlotClick,
      handleSlotClick,
      handleSlotMouseDown,
      handleSlotMouseEnter,
      handleSlotMouseUp,
    ],
  );

  /**
   * Coluna de um único profissional: slot próprio em cada linha livre.
   */
  const getProfessionalColumn = useCallback(
    (
      professional: IProfessional,
      dayIndex: number,
      options: { isCompact?: boolean } = {},
    ): TAgendaColumn | null => {
      const date = weekDates[dayIndex];
      if (!date) return null;

      const dateStr = dateToISOString(date);
      const positioned = buildAppointmentLayout(
        getDayAppointments(date, professional.id),
        timeSlots,
      );

      return {
        rows: timeSlots.map((time, rowIndex) => {
          const isOccupied = positioned.some(
            ({ rowStart, rowEnd }) =>
              rowStart <= rowIndex && rowIndex <= rowEnd,
          );

          return {
            time,
            slot: isOccupied
              ? null
              : getSlot(professional, dayIndex, dateStr, time, {
                  showInitials: options.isCompact,
                }),
          };
        }),
        blocks: positioned.map((item) => ({
          ...item,
          hasGutter: false,
          isCompact: !!options.isCompact || item.laneCount > 1,
          presence: getPresence(item.appointment),
        })),
      };
    },
    [weekDates, timeSlots, getDayAppointments, getSlot, getPresence],
  );

  /**
   * Coluna do dia com todos os profissionais filtrados na mesma faixa. A linha
   * livre agenda com o primeiro profissional disponível naquele horário; ao lado
   * de um agendamento, esse acesso vira um "+" para não sumir com a vaga.
   */
  const getMergedDayColumn = useCallback(
    (dayIndex: number): TAgendaColumn | null => {
      const date = weekDates[dayIndex];
      if (!date) return null;

      const dateStr = dateToISOString(date);
      const positioned = buildAppointmentLayout(
        getDayAppointments(date, visibleMemberId),
        timeSlots,
      );

      const rowStatus = timeSlots.map((time, rowIndex) => {
        const busyIds = positioned
          .filter(
            ({ rowStart, rowEnd }) =>
              rowStart <= rowIndex && rowIndex <= rowEnd,
          )
          .map(({ appointment }) => appointment.storeMember.id);
        const candidates = filteredProfessionals.filter(
          (professional) => !busyIds.includes(professional.id),
        );
        const bookable = candidates.find(
          (professional) =>
            !isBlockedTime(professional.blockedTimes, dateStr, time),
        );

        return { time, hasBusy: busyIds.length > 0, candidates, bookable };
      });

      return {
        rows: rowStatus.map(({ time, hasBusy, candidates, bookable }) => {
          if (bookable) {
            return {
              time,
              slot: getSlot(bookable, dayIndex, dateStr, time, {
                isGutter: hasBusy,
              }),
            };
          }

          const blockedProfessional = hasBusy ? undefined : candidates[0];

          return {
            time,
            slot: blockedProfessional
              ? getSlot(blockedProfessional, dayIndex, dateStr, time)
              : null,
          };
        }),
        blocks: positioned.map((item) => ({
          ...item,
          hasGutter: rowStatus
            .slice(item.clusterStart, item.clusterEnd + 1)
            .some(({ hasBusy, bookable }) => hasBusy && !!bookable),
          isCompact: item.laneCount > 1,
          presence: getPresence(item.appointment),
        })),
      };
    },
    [
      weekDates,
      timeSlots,
      filteredProfessionals,
      visibleMemberId,
      getDayAppointments,
      getSlot,
      getPresence,
    ],
  );

  const getSelectedDayAppointments = useCallback(() => {
    if (!selectedDayData) return [];

    return getDayAppointments(selectedDayData.date, visibleMemberId);
  }, [selectedDayData, visibleMemberId, getDayAppointments]);

  const handleQuickAdd = useCallback(
    (date?: Date) => {
      analytics.track('appointment_form_opened', { source: 'quick_add' });

      if (!date) {
        setIsAddAppointmentOpen({ isAddAppointmentOpen: true });
        return;
      }

      setIsAddAppointmentOpen({
        isAddAppointmentOpen: true,
        selectedAppointment: {
          ...INITIAL_APPOINTMENT_FORM,
          date: dateToISOString(date),
          storeMember:
            filteredProfessionals.length === 1 && filteredProfessionals[0]
              ? filteredProfessionals[0]
              : INITIAL_APPOINTMENT_FORM.storeMember,
        },
      });
    },
    [analytics, setIsAddAppointmentOpen, filteredProfessionals],
  );

  const handleAppointmentClick = useCallback(
    (appointment: IAppointment) => {
      setDetailsAppointment(appointment);
    },
    [setDetailsAppointment],
  );

  const handleSelectDay = useCallback(
    (dayIndex: number) => {
      setSelectedDayIndex(dayIndex);
    },
    [setSelectedDayIndex],
  );

  return {
    // Store state
    weekDates,
    timeSlots,
    selectedProfessionalId,
    isBlockMode,
    isFocusMode,
    selectedDayIndex,

    // Computed values
    filteredProfessionals,
    dayData,
    selectedDayData,
    weekDaysNavigation,
    hasTodayInWeek,
    scrollClassName: isFocusMode
      ? GRID_SCROLL_CLASS.FOCUS
      : GRID_SCROLL_CLASS.DEFAULT,

    // Functions
    getProfessionalColumn,
    getMergedDayColumn,
    getSelectedDayAppointments,
    getPresence,
    handleSlotClick,
    handleQuickAdd,
    handleAppointmentClick,
    handleSelectDay,

    // Bulk block hook
    bulkBlockHook,
  };
};
