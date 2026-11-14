import { capitalizeFirst } from '../agenda-grid/agenda-grid.helpers';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type TRelativeMoment = {
  /** `hoje`, `ontem` ou `dd/mm`. */
  day: string;
  isRelative: boolean;
  time: string;
};

/** Dias de calendário entre as datas no fuso local (o arredondamento absorve o horário de verão). */
const getCalendarDayDiff = (from: Date, to: Date): number => {
  const fromDay = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  return Math.round((toDay.getTime() - fromDay.getTime()) / DAY_IN_MS);
};

const getRelativeMoment = (
  isoDate: string,
  now: Date,
): TRelativeMoment | null => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;

  const time = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dayDiff = getCalendarDayDiff(date, now);

  if (dayDiff === 0) return { day: 'hoje', isRelative: true, time };
  if (dayDiff === 1) return { day: 'ontem', isRelative: true, time };

  const day = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });

  return { day, isRelative: false, time };
};

/** "Hoje às 08:12, em resposta ao lembrete." */
export const getPresenceConfirmedText = (
  confirmedAt: string,
  now: Date = new Date(),
): string => {
  const moment = getRelativeMoment(confirmedAt, now);

  return moment
    ? `${capitalizeFirst(moment.day)} às ${moment.time}, em resposta ao lembrete.`
    : 'Em resposta ao lembrete.';
};

/** "Enviado ontem às 09:30. O cliente pode responder até o horário." */
export const getReminderSentText = (
  reminderSentAt: string,
  now: Date = new Date(),
): string => {
  const moment = getRelativeMoment(reminderSentAt, now);
  const reply = 'O cliente pode responder até o horário.';

  if (!moment) return reply;

  const day = moment.isRelative ? moment.day : `em ${moment.day}`;

  return `Enviado ${day} às ${moment.time}. ${reply}`;
};
