import type { IStoreHoliday } from '@/types/api/holidays.types';

export type THolidayItem = {
  id: string;
  dayLabel: string;
  monthShortLabel: string;
  /** "Sex, 20 de novembro" */
  dateLabel: string;
  name: string;
  removeLabel: string;
};

export type THolidayYearGroup = {
  year: number;
  items: THolidayItem[];
};

export type THolidayDraft = {
  date: string;
  name: string;
};

export type THolidaysSource = readonly IStoreHoliday[];
