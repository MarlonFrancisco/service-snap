import type { TAgendaVisit } from '@/store/admin/agenda';
import type { IBlockedTime } from '@/types/api/blocked-times.types';
import type { IAppointment } from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';
import type { TSelectedSlot } from './agenda-grid-bulk-block.types';
import {
  GRID_CONSTANTS,
  PRESENCE_CONFIG,
  STATUS_CONFIG,
} from './agenda-grid.constants';
import type {
  TAgendaBlockedBlock,
  TAgendaColumnBlock,
  TAppointmentPresence,
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
  // Convidado só com e-mail chega sem sobrenome (`null`).
  return [professional.user.firstName, professional.user.lastName]
    .filter(Boolean)
    .join(' ');
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

export const timeToMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Bloqueio antigo, sem fim, ocupa um slot de 30 minutos. */
const LEGACY_BLOCK_MINUTES = 30;

/** Dia da semana de YYYY-MM-DD no padrão da API: domingo é 0. */
export const getApiDayOfWeek = (date: string): number =>
  new Date(`${date}T12:00:00`).getDay();

/** O bloqueio semanal vale em todo dia da semana dele; o comum, só na data. */
export const blockedTimeAppliesOn = (
  blockedTime: IBlockedTime,
  date: string,
): boolean =>
  blockedTime.isRecurring
    ? // O enum do Postgres chega como texto ("2")
      Number(blockedTime.dayOfWeek) === getApiDayOfWeek(date)
    : String(blockedTime.date).slice(0, 10) === date;

export const getBlockedRangeMinutes = (
  blockedTime: IBlockedTime,
): [number, number] => {
  const start = timeToMinutes(blockedTime.time);
  const end = blockedTime.endTime
    ? timeToMinutes(blockedTime.endTime)
    : start + LEGACY_BLOCK_MINUTES;
  return [start, end];
};

/**
 * Bloqueio que cobre o slot: o início do slot cai dentro do intervalo
 * `[time, endTime)` de um bloqueio que vale no dia.
 */
export const isBlockedTime = (
  blockedTimes: IBlockedTime[] | undefined,
  date: string,
  time: string,
): IBlockedTime | undefined => {
  const slotMinutes = timeToMinutes(time);

  return blockedTimes?.find((blockedTime) => {
    if (!blockedTimeAppliesOn(blockedTime, date)) return false;
    const [start, end] = getBlockedRangeMinutes(blockedTime);
    return slotMinutes >= start && slotMinutes < end;
  });
};

/** Linhas da grade cobertas por um bloqueio no dia (vazio se nenhuma). */
export const getBlockedRows = (
  blockedTime: IBlockedTime,
  timeSlots: string[],
): number[] => {
  const [start, end] = getBlockedRangeMinutes(blockedTime);

  return timeSlots.flatMap((time, rowIndex) => {
    const minutes = timeToMinutes(time);
    return minutes >= start && minutes < end ? [rowIndex] : [];
  });
};

export const formatBlockedRange = (blockedTime: IBlockedTime): string => {
  const end = blockedTime.endTime?.trim();

  if (blockedTime.time === '00:00' && end === '24:00') return 'dia inteiro';

  return end ? `${blockedTime.time}–${end}` : blockedTime.time;
};

/**
 * Junta os serviços de uma mesma reserva num bloco só (início do primeiro,
 * fim do último). Cancelados ficam de fora antes de chegar aqui.
 */
export const groupVisits = (appointments: IAppointment[]): TAgendaVisit[] => {
  const groups = appointments.reduce((visits, appointment) => {
    const key = `${appointment.booking?.id ?? appointment.id}|${appointment.date}|${appointment.storeMember.id}`;
    visits.set(key, [...(visits.get(key) ?? []), appointment]);
    return visits;
  }, new Map<string, IAppointment[]>());

  return [...groups.values()].map((items) => {
    const sorted = [...items].sort((first, second) =>
      first.startTime.localeCompare(second.startTime),
    );
    const [first] = sorted;
    const last = sorted.at(-1);

    if (!first || !last || sorted.length === 1) {
      return first as TAgendaVisit;
    }

    return { ...first, endTime: last.endTime, visitItems: sorted };
  });
};

export const getVisitItems = (visit: TAgendaVisit): IAppointment[] =>
  visit.visitItems ?? [visit];

export const getVisitServiceNames = (visit: TAgendaVisit): string =>
  getVisitItems(visit)
    .map((item) => item.service.name)
    .join(' + ');

/** "30min", "1h", "1h 30min". */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
};

export const getVisitDuration = (visit: TAgendaVisit): string =>
  formatDuration(timeToMinutes(visit.endTime) - timeToMinutes(visit.startTime));

/** "qui, 5": dia da semana abreviado, sem o ponto do `pt-BR`. */
export const formatShortDay = (date: string): string => {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00`);
  const weekday = parsed
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '');
  return `${weekday}, ${parsed.getDate()}`;
};

/**
 * Converte o intervalo do agendamento em linhas da grade. A grade pula o almoço
 * e pode não ter um slot exato para o início, então conta os slots em vez de
 * dividir a duração por 30.
 */
const getAppointmentRows = (
  appointment: TAgendaVisit,
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
  appointment: TAgendaVisit;
  rowStart: number;
  rowEnd: number;
};

/**
 * Distribui agendamentos em faixas lado a lado. Cada grupo de agendamentos que
 * se cruzam divide a largura pelo número de faixas de que precisa.
 */
export const buildAppointmentLayout = (
  appointments: TAgendaVisit[],
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

/** Bloqueio em faixa: ocupa a largura toda da coluna, nas linhas que cobre. */
export const getBlockedBlockStyle = (
  block: TAgendaBlockedBlock,
  slotHeight: number,
) => ({
  top: block.rowStart * slotHeight + 2,
  height: block.rowSpan * slotHeight - 5,
  left: 2,
  width: 'calc(100% - 4px)',
});

/** Cliente criado só com e-mail chega sem nome: a API devolve `null`. */
export const getClientName = (user: IAppointment['user']): string =>
  [user.firstName, user.lastName].filter(Boolean).join(' ') ||
  'Cliente sem nome';

export const getAppointmentAriaLabel = (appointment: TAgendaVisit): string => {
  const { user, storeMember, startTime, endTime } = appointment;
  const items = getVisitItems(appointment);
  const services =
    items.length > 1
      ? `${items.length} serviços: ${items.map((item) => item.service.name).join(' e ')}`
      : appointment.service.name;
  return `${getClientName(user)}, ${services}, ${startTime} a ${endTime}, ${getProfessionalFullName(storeMember)}`;
};

/**
 * Presença só vale enquanto o horário está de pé: concluído, cancelado ou falta
 * já dizem o que aconteceu. `awaitingById` mapeia `scheduleId` → envio do lembrete.
 */
export const getAppointmentPresence = (
  appointment: IAppointment,
  awaitingById: ReadonlyMap<string, string>,
): TAppointmentPresence | null => {
  if (appointment.status !== 'scheduled') return null;

  if (appointment.presenceConfirmedAt) {
    return { kind: 'confirmed', confirmedAt: appointment.presenceConfirmedAt };
  }

  const reminderSentAt = awaitingById.get(appointment.id);

  return reminderSentAt ? { kind: 'awaiting', reminderSentAt } : null;
};

/** Rótulo do cartão para leitor de tela: dados, status e, se houver, presença. */
export const getAppointmentCardAriaLabel = (
  appointment: IAppointment,
  presence: TAppointmentPresence | null,
): string =>
  [
    getAppointmentAriaLabel(appointment),
    STATUS_CONFIG[appointment.status].label,
    presence && PRESENCE_CONFIG[presence.kind].label,
  ]
    .filter(Boolean)
    .join(', ');

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
