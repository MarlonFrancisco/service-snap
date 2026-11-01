import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IAppointment } from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';
import type { TSelectedSlot } from './agenda-grid-bulk-block.types';
import { GRID_CONSTANTS } from './agenda-grid.constants';
import type {
  TAgendaColumnBlock,
  TPositionedAppointment,
} from './agenda-grid.types';

/**
 * Verifica se uma data é hoje
 */
export const isToday = (date: Date): boolean => {
  return date.toDateString() === new Date().toDateString();
};

/**
 * Formata o nome completo de um professional
 */
export const getProfessionalFullName = (
  professional: IProfessional,
): string => {
  return `${professional.user.firstName} ${professional.user.lastName}`;
};

export const getProfessionalInitials = (
  professional: IProfessional,
): string => {
  const { firstName, lastName } = professional.user;
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
};

/**
 * Formata uma data para o formato brasileiro
 */
export const formatDateBR = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });
};

export const capitalizeFirst = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Converte Date para YYYY-MM-DD no fuso local. `toISOString` usaria UTC e, à
 * noite no Brasil, apontaria para o dia seguinte.
 */
export const dateToISOString = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Verifica se um horário está bloqueado
 */
export const isBlockedTime = (
  blockedTimes: IBlockedTime[] | undefined,
  date: string,
  time: string,
): IBlockedTime | undefined => {
  return blockedTimes?.find(
    (blockedTime) => blockedTime.date === date && blockedTime.time === time,
  );
};

const timeToMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converte o intervalo do agendamento em linhas da grade. A grade pula o almoço
 * e pode não ter um slot exato para o início, então conta os slots em vez de
 * dividir a duração por 30.
 */
const getAppointmentRows = (
  appointment: IAppointment,
  timeSlots: string[],
): { rowStart: number; rowEnd: number } => {
  const slotMinutes = timeSlots.map(timeToMinutes);
  const startMinutes = timeToMinutes(appointment.startTime);
  const endMinutes = timeToMinutes(appointment.endTime);

  const rowStart = Math.max(
    slotMinutes.filter((minutes) => minutes <= startMinutes).length - 1,
    0,
  );
  const rowEnd = Math.max(
    slotMinutes.filter((minutes) => minutes < endMinutes).length - 1,
    rowStart,
  );

  return { rowStart, rowEnd };
};

type TPlacedAppointment = {
  appointment: IAppointment;
  rowStart: number;
  rowEnd: number;
};

/**
 * Distribui agendamentos em faixas lado a lado. Cada grupo de agendamentos que
 * se cruzam divide a largura pelo número de faixas de que precisa.
 */
export const buildAppointmentLayout = (
  appointments: IAppointment[],
  timeSlots: string[],
): TPositionedAppointment[] => {
  const placed: TPlacedAppointment[] = appointments
    .map((appointment) => ({
      appointment,
      ...getAppointmentRows(appointment, timeSlots),
    }))
    .sort(
      (first, second) =>
        first.rowStart - second.rowStart || second.rowEnd - first.rowEnd,
    );

  const clusters = placed.reduce<TPlacedAppointment[][]>((groups, item) => {
    const current = groups.at(-1);
    const currentEnd = current
      ? Math.max(...current.map((entry) => entry.rowEnd))
      : -1;

    if (current && item.rowStart <= currentEnd) {
      current.push(item);
    } else {
      groups.push([item]);
    }

    return groups;
  }, []);

  return clusters.flatMap((cluster) => {
    const laneEnds: number[] = [];
    const clusterStart = cluster[0]?.rowStart ?? 0;
    const clusterEnd = Math.max(...cluster.map((item) => item.rowEnd));

    const withLanes = cluster.map((item) => {
      const freeLane = laneEnds.findIndex((end) => end < item.rowStart);
      const lane = freeLane >= 0 ? freeLane : laneEnds.length;
      laneEnds[lane] = item.rowEnd;
      return { ...item, lane };
    });

    return withLanes.map((item) => ({
      ...item,
      rowSpan: item.rowEnd - item.rowStart + 1,
      laneCount: laneEnds.length,
      clusterStart,
      clusterEnd,
    }));
  });
};

/** Posição do bloco: depende de dados em tempo de execução, por isso não é classe. */
export const getBlockStyle = (
  block: TAgendaColumnBlock,
  slotHeight: number,
) => {
  const gutter = block.hasGutter ? GRID_CONSTANTS.FREE_GUTTER_WIDTH : 0;
  const laneWidth = `((100% - ${gutter}px) / ${block.laneCount})`;

  return {
    top: block.rowStart * slotHeight + 2,
    height: block.rowSpan * slotHeight - 5,
    left: `calc(${block.lane} * ${laneWidth} + 2px)`,
    width: `calc(${laneWidth} - 4px)`,
  };
};

export const getAppointmentAriaLabel = (appointment: IAppointment): string => {
  const { user, service, storeMember, startTime, endTime } = appointment;
  return `${user.firstName} ${user.lastName}, ${service.name}, ${startTime} a ${endTime}, ${getProfessionalFullName(storeMember)}`;
};

export const getBulkActionLabel = (slots: TSelectedSlot[]): string => {
  const unblockCount = slots.filter((slot) => slot.isBlocked).length;
  const blockCount = slots.length - unblockCount;

  if (unblockCount === 0) return 'Aplicar bloqueio';
  if (blockCount === 0) return 'Aplicar desbloqueio';

  return `Bloquear ${blockCount} e desbloquear ${unblockCount}`;
};

export const groupSlotsByProfessional = (
  slots: TSelectedSlot[],
): Map<string, TSelectedSlot[]> =>
  slots.reduce((groups, slot) => {
    groups.set(slot.professionalId, [
      ...(groups.get(slot.professionalId) ?? []),
      slot,
    ]);
    return groups;
  }, new Map<string, TSelectedSlot[]>());
