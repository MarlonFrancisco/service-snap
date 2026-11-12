import { useBlockedTimeMutations } from '@/hooks';
import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { useStoreMembersQuery } from '@/hooks/use-query/use-store-members-query/use-store-members-query.hook';
import { useAnalytics } from '@/providers/analytics.provider';
import { usePartnerStore } from '@/store';
import {
  INITIAL_APPOINTMENT_FORM,
  selectTimeSlots,
  selectWeekDates,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { TAgendaVisit, TWorkingDayKey } from '@/store/admin/agenda';
import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IProfessional } from '@/types/api/users.types';
import { useIsMobile } from '@repo/ui';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useAgendaHolidaysQuery } from '../agenda-data-state/agenda-data-state.hook';
import { useAgendaGridBulkBlock } from './agenda-grid-bulk-block.hook';
import type { TSelectedSlot } from './agenda-grid-bulk-block.types';
import { useAgendaGridDrag } from './agenda-grid-drag.hook';
import {
  blockedTimeAppliesOn,
  buildAppointmentLayout,
  dateToISOString,
  formatBlockedRange,
  getBlockedRows,
  getProfessionalFullName,
  getProfessionalInitials,
  groupSlotsByProfessional,
  groupVisits,
  isBlockedTime,
  isToday,
} from './agenda-grid.helpers';
import type {
  TAgendaBlockedBlock,
  TAgendaClosedNotice,
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

/** Folga fixa: o dia do profissional é `null` no expediente dele. */
const isProfessionalOff = (
  professional: IProfessional,
  dayKey: TWorkingDayKey,
): boolean => professional.workingHours?.[dayKey] === null;

/**
 * Bloqueios de mais de um slot viram um bloco na coluna; os de um slot
 * continuam como estado do slot (o clique do modo de bloqueio desfaz).
 */
const getBlockedBlocks = (
  professional: IProfessional,
  dateStr: string,
  timeSlots: string[],
): TAgendaBlockedBlock[] =>
  (professional.blockedTimes ?? []).flatMap((blockedTime) => {
    if (!blockedTimeAppliesOn(blockedTime, dateStr)) return [];

    const rows = getBlockedRows(blockedTime, timeSlots);
    const [rowStart] = rows;

    if (rows.length < 2 || rowStart === undefined) return [];

    return [
      {
        // O bloqueio chega aninhado no profissional, sem a referência a ele.
        blockedTime: { ...blockedTime, storeMember: professional },
        rowStart,
        rowSpan: rows.length,
        label: formatBlockedRange(blockedTime),
      },
    ];
  });

const isRowInBlocks = (blocks: TAgendaBlockedBlock[], rowIndex: number) =>
  blocks.some(
    ({ rowStart, rowSpan }) =>
      rowIndex >= rowStart && rowIndex < rowStart + rowSpan,
  );

/**
 * Hook base compartilhado para as visões da agenda (semana, dia e mobile)
 * Contém toda a lógica comum de manipulação de slots, appointments e blocked times
 */
export const useAgendaGrid = () => {
  const analytics = useAnalytics();
  const isMobile = useIsMobile();
  const { isProfessional, ownMember } = useAgendaMemberRole();
  const storeProfessionals = usePartnerStore(
    (state) => state.activeStore.storeMembers ?? EMPTY_PROFESSIONALS,
  );
  const storeId = usePartnerStore((state) => state.activeStore.id);
  const workingDays = usePartnerStore(
    (state) => state.activeStore.businessDays,
  );
  const timeSlots = usePartnerStore(selectTimeSlots);
  // A loja não traz o expediente de cada um; a lista da equipe traz.
  const { storeMembers } = useStoreMembersQuery({ storeId });
  const holidays = useAgendaHolidaysQuery();

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
  const setSelectedBlockedTime = useAgendaStore(
    (state) => state.setSelectedBlockedTime,
  );

  const drag = useAgendaGridDrag({ isEnabled: !isBlockMode && !isMobile });

  const {
    createBlockedTime,
    deleteBlockedTime,
    createBulkBlockedTime,
    deleteBulkBlockedTime,
  } = useBlockedTimeMutations({ storeId });

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

  const professionals = useMemo(() => {
    const workingHoursById = new Map(
      storeMembers.map((member) => [member.id, member.workingHours]),
    );
    const withHours = storeProfessionals.map((professional) => ({
      ...professional,
      workingHours:
        workingHoursById.get(professional.id) ?? professional.workingHours,
    }));

    // O profissional só vê (e mexe em) a própria agenda.
    if (isProfessional) {
      return withHours.filter(
        (professional) => professional.id === ownMember?.id,
      );
    }

    return withHours;
  }, [storeProfessionals, storeMembers, isProfessional, ownMember?.id]);

  const filteredProfessionals = useMemo(() => {
    if (selectedProfessionalId === 'all' || isProfessional) {
      return professionals;
    }
    return professionals.filter(
      (professional) => professional.id === selectedProfessionalId,
    );
  }, [professionals, selectedProfessionalId, isProfessional]);

  const visibleMemberId =
    selectedProfessionalId === 'all' || isProfessional
      ? undefined
      : selectedProfessionalId;

  const holidaysByDate = useMemo(
    () => new Map(holidays.map((holiday) => [holiday.date, holiday])),
    [holidays],
  );

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

        const holiday = holidaysByDate.get(dateToISOString(date));
        const isOff =
          filteredProfessionals.length > 0 &&
          filteredProfessionals.every((professional) =>
            isProfessionalOff(professional, dayKey),
          );
        const isWorkingDay = workingDays[dayKey];

        const getHeaderNote = () => {
          if (holiday) return 'Feriado';
          if (isOff && isWorkingDay) return 'Folga';
          return undefined;
        };

        return {
          date,
          dayIndex,
          isToday: isToday(date),
          isWorkingDay,
          dayKey,
          label,
          holiday,
          isOff,
          headerNote: getHeaderNote(),
        };
      }),
    [
      weekDates,
      workingDayKeys,
      workingDays,
      days,
      holidaysByDate,
      filteredProfessionals,
    ],
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
    (date: Date, memberId?: string): TAgendaVisit[] => {
      const targetDate = dateToISOString(date);

      return groupVisits(
        appointments.filter(
          (appointment) =>
            appointment.date === targetDate &&
            appointment.status !== 'cancelled' &&
            (!memberId || appointment.storeMember.id === memberId),
        ),
      ).sort((first, second) =>
        first.startTime.localeCompare(second.startTime),
      );
    },
    [appointments],
  );

  const getClosedNotice = useCallback(
    (
      dateStr: string,
      dayKey: TWorkingDayKey,
      columnProfessionals: IProfessional[],
    ): TAgendaClosedNotice | undefined => {
      const holiday = holidaysByDate.get(dateStr);

      if (holiday) {
        return {
          variant: 'holiday',
          title: holiday.name ? `Feriado · ${holiday.name}` : 'Feriado',
          text: 'Loja fechada o dia todo',
        };
      }

      const isEveryoneOff =
        columnProfessionals.length > 0 &&
        columnProfessionals.every((professional) =>
          isProfessionalOff(professional, dayKey),
        );

      if (!isEveryoneOff) return undefined;

      const [onlyProfessional] = columnProfessionals;

      return {
        variant: 'off',
        title: 'Folga',
        text:
          columnProfessionals.length === 1 && onlyProfessional
            ? `${getProfessionalFullName(onlyProfessional)} não atende neste dia`
            : 'Ninguém da equipe atende neste dia',
      };
    },
    [holidaysByDate],
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
            ...blockedTime,
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
      options: {
        showInitials?: boolean;
        isGutter?: boolean;
        /** Soltar aqui leva a visita para este profissional. */
        isMemberDrop?: boolean;
      } = {},
    ): TAgendaSlot => {
      const blockedTime = isBlockedTime(
        professional.blockedTimes,
        dateStr,
        time,
      );
      const isSelected =
        isBlockMode && isSlotSelected(professional.id, dayIndex, time);
      const state = getSlotState(!!blockedTime, isSelected);
      const professionalName = getProfessionalFullName(professional);

      const [, month, day] = dateStr.split('-');
      const ariaLabel = `${getSlotAriaLabel(
        state,
        isBlockMode,
        time,
        professionalName,
      )}, dia ${day}/${month}`;

      const stateText = state === 'free' ? time : SLOT_STATE_TEXT[state];
      const canDrop = state === 'free' && !isBlockMode && !options.isGutter;

      return {
        state,
        text: options.showInitials
          ? getProfessionalInitials(professional)
          : stateText,
        ariaLabel,
        isInteractive: isBlockMode || !blockedTime,
        isPressed: isBlockMode ? isSelected : undefined,
        isGutter: options.isGutter,
        dropTarget: canDrop
          ? {
              key: options.isMemberDrop
                ? `${dateStr}|${time}|${professional.id}`
                : `${dateStr}|${time}`,
              date: dateStr,
              time,
              storeMemberId: options.isMemberDrop ? professional.id : undefined,
              professionalName: options.isMemberDrop
                ? professionalName
                : undefined,
            }
          : undefined,
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
      const dayKey = workingDayKeys[dayIndex];
      if (!date || !dayKey) return null;

      const dateStr = dateToISOString(date);
      const closedNotice = getClosedNotice(dateStr, dayKey, [professional]);
      const positioned = buildAppointmentLayout(
        getDayAppointments(date, professional.id),
        timeSlots,
      );
      const blockedBlocks = closedNotice
        ? []
        : getBlockedBlocks(professional, dateStr, timeSlots);

      return {
        closedNotice,
        blockedBlocks,
        rows: timeSlots.map((time, rowIndex) => {
          const isOccupied =
            !!closedNotice ||
            isRowInBlocks(blockedBlocks, rowIndex) ||
            positioned.some(
              ({ rowStart, rowEnd }) =>
                rowStart <= rowIndex && rowIndex <= rowEnd,
            );

          return {
            time,
            slot: isOccupied
              ? null
              : getSlot(professional, dayIndex, dateStr, time, {
                  showInitials: options.isCompact,
                  isMemberDrop: true,
                }),
          };
        }),
        blocks: positioned.map((item) => ({
          ...item,
          hasGutter: false,
          isCompact: !!options.isCompact || item.laneCount > 1,
        })),
      };
    },
    [
      weekDates,
      workingDayKeys,
      timeSlots,
      getClosedNotice,
      getDayAppointments,
      getSlot,
    ],
  );

  /**
   * Coluna do dia com todos os profissionais filtrados na mesma faixa. A linha
   * livre agenda com o primeiro profissional disponível naquele horário; ao lado
   * de um agendamento, esse acesso vira um "+" para não sumir com a vaga.
   */
  const getMergedDayColumn = useCallback(
    (dayIndex: number): TAgendaColumn | null => {
      const date = weekDates[dayIndex];
      const dayKey = workingDayKeys[dayIndex];
      if (!date || !dayKey) return null;

      const dateStr = dateToISOString(date);
      const closedNotice = getClosedNotice(
        dateStr,
        dayKey,
        filteredProfessionals,
      );
      const positioned = buildAppointmentLayout(
        getDayAppointments(date, visibleMemberId),
        timeSlots,
      );
      const [onlyProfessional] = filteredProfessionals;
      // Com vários na faixa, o bloqueio de um não fecha a linha para os outros.
      const blockedBlocks =
        !closedNotice && filteredProfessionals.length === 1 && onlyProfessional
          ? getBlockedBlocks(onlyProfessional, dateStr, timeSlots)
          : [];
      const workingProfessionals = filteredProfessionals.filter(
        (professional) => !isProfessionalOff(professional, dayKey),
      );

      const rowStatus = timeSlots.map((time, rowIndex) => {
        const busyIds = positioned
          .filter(
            ({ rowStart, rowEnd }) =>
              rowStart <= rowIndex && rowIndex <= rowEnd,
          )
          .map(({ appointment }) => appointment.storeMember.id);
        const isClosedRow =
          !!closedNotice || isRowInBlocks(blockedBlocks, rowIndex);
        const candidates = isClosedRow
          ? []
          : workingProfessionals.filter(
              (professional) => !busyIds.includes(professional.id),
            );
        const bookable = candidates.find(
          (professional) =>
            !isBlockedTime(professional.blockedTimes, dateStr, time),
        );

        return { time, hasBusy: busyIds.length > 0, candidates, bookable };
      });

      return {
        closedNotice,
        blockedBlocks,
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
        })),
      };
    },
    [
      weekDates,
      workingDayKeys,
      timeSlots,
      filteredProfessionals,
      visibleMemberId,
      getClosedNotice,
      getDayAppointments,
      getSlot,
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
    (appointment: TAgendaVisit) => {
      setDetailsAppointment(appointment);
    },
    [setDetailsAppointment],
  );

  const handleBlockedBlockClick = useCallback(
    (blockedTime: IBlockedTime) => {
      setSelectedBlockedTime(blockedTime);
    },
    [setSelectedBlockedTime],
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
    handleSlotClick,
    handleQuickAdd,
    handleAppointmentClick,
    handleBlockedBlockClick,
    handleSelectDay,

    // Bulk block hook
    bulkBlockHook,

    // Arrastar para remarcar
    drag,
  };
};
