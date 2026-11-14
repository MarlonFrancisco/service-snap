import type { IStoreHoliday } from '@/types/api/holidays.types';

export type TAgendaMonthDayCounts = {
  scheduled: number;
  completed: number;
  noShow: number;
};

export type TAgendaMonthDay = {
  key: string;
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isClosed: boolean;
  holiday?: IStoreHoliday;
  counts: TAgendaMonthDayCounts;
  ariaLabel: string;
};

export type TAgendaMonthWeekday = {
  label: string;
  isClosed: boolean;
};
