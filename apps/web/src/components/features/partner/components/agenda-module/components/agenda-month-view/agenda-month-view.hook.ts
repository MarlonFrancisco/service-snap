import { useAgendaMemberRole } from '@/hooks/partner/use-agenda-member-role';
import { usePartnerStore } from '@/store';
import {
  AGENDA_WORKING_DAY_KEYS,
  getMonthStart,
  selectMonthGridDates,
  useAgendaStore,
} from '@/store/admin/agenda';
import type { IAppointment } from '@/types/api/schedule.types';
import { isBusinessDay } from '@/utils/helpers/business-hours.helper';
import { useCallback, useMemo } from 'react';
import { useAgendaHolidaysQuery } from '../agenda-data-state/agenda-data-state.hook';
import {
  dateToISOString,
  groupVisits,
  isToday,
} from '../agenda-grid/agenda-grid.helpers';
import {
  countVisitsByStatus,
  formatCompletedCount,
  formatNoShowCount,
  formatScheduledCount,
} from './agenda-month-view.helpers';
import type {
  TAgendaMonthDay,
  TAgendaMonthWeekday,
} from './agenda-month-view.types';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/**
 * Visão Mês: cada dia mostra quantas visitas há por status. Clicar no dia
 * abre a visão Dia dele.
 */
export const useAgendaMonthView = () => {
  const { isProfessional } = useAgendaMemberRole();
  const monthDates = useAgendaStore(selectMonthGridDates);
  const currentMonth = useAgendaStore((state) => state.currentMonth);
  const appointments = useAgendaStore((state) => state.appointments);
  const selectedProfessional = useAgendaStore(
    (state) => state.selectedProfessional,
  );
  const openDay = useAgendaStore((state) => state.openDay);
  const businessDays = usePartnerStore(
    (state) => state.activeStore.businessDays,
  );
  const holidays = useAgendaHolidaysQuery();

  const memberId =
    selectedProfessional === 'all' || isProfessional
      ? undefined
      : selectedProfessional;

  const weekdays = useMemo<TAgendaMonthWeekday[]>(
    () =>
      WEEKDAY_LABELS.map((label, index) => {
        const dayKey = AGENDA_WORKING_DAY_KEYS[index];
        return {
          label,
          isClosed: !!dayKey && !isBusinessDay(businessDays, dayKey),
        };
      }),
    [businessDays],
  );

  const days = useMemo<TAgendaMonthDay[]>(() => {
    const month = getMonthStart(currentMonth).getMonth();
    const holidaysByDate = new Map(
      holidays.map((holiday) => [holiday.date, holiday]),
    );
    const appointmentsByDate = appointments.reduce((byDate, appointment) => {
      if (appointment.status === 'cancelled') return byDate;
      if (memberId && appointment.storeMember.id !== memberId) return byDate;
      byDate.set(appointment.date, [
        ...(byDate.get(appointment.date) ?? []),
        appointment,
      ]);
      return byDate;
    }, new Map<string, IAppointment[]>());

    return monthDates.map((date, index) => {
      const key = dateToISOString(date);
      const dayKey = AGENDA_WORKING_DAY_KEYS[index % 7];
      const holiday = holidaysByDate.get(key);
      const isClosed = !!dayKey && !isBusinessDay(businessDays, dayKey);
      const counts = countVisitsByStatus(
        groupVisits(appointmentsByDate.get(key) ?? []),
      );
      const today = isToday(date);

      const labelParts = [
        date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
        today && 'hoje',
        holiday &&
          `feriado${holiday.name ? ` ${holiday.name}` : ''}, loja fechada`,
        !holiday && isClosed && 'loja fechada',
        counts.scheduled > 0 && formatScheduledCount(counts.scheduled),
        counts.completed > 0 && formatCompletedCount(counts.completed),
        counts.noShow > 0 && formatNoShowCount(counts.noShow),
      ].filter(Boolean);

      return {
        key,
        date,
        day: date.getDate(),
        isCurrentMonth: date.getMonth() === month,
        isToday: today,
        isClosed,
        holiday,
        counts,
        ariaLabel: `${labelParts.join(', ')}. Abrir o dia`,
      };
    });
  }, [
    monthDates,
    currentMonth,
    appointments,
    memberId,
    holidays,
    businessDays,
  ]);

  const handleOpenDay = useCallback(
    (date: Date) => {
      openDay(date);
    },
    [openDay],
  );

  return {
    weekdays,
    days,
    handleOpenDay,
  };
};
