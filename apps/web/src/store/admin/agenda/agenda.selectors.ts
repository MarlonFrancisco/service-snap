import { IPartnerStore } from '@/store/partner';
import { TWorkingHours } from '@/types/api/stores.types';
import {
  generateTimeSlots,
  getMonthGridDates,
  getWeekDates,
} from './agenda.helpers';
import type { IAgendaStore } from './agenda.types';

const timeSlotsCache = new Map<string, string[]>();

const serializeWorkingHours = (workingHours: TWorkingHours) =>
  `${workingHours.openTime}-${workingHours.closeTime}-${workingHours.lunchStartTime}-${workingHours.lunchEndTime}`;

export const selectTimeSlots = (state: IPartnerStore) => {
  const workingHours = {
    openTime: state.activeStore.openTime,
    closeTime: state.activeStore.closeTime,
    lunchStartTime: state.activeStore.lunchStartTime,
    lunchEndTime: state.activeStore.lunchEndTime,
  };

  const key = serializeWorkingHours(workingHours);

  if (timeSlotsCache.has(key)) {
    return timeSlotsCache.get(key)!;
  }

  const slots = generateTimeSlots(workingHours);
  timeSlotsCache.set(key, slots);
  return slots;
};

const weekDatesCache = new Map<string, Date[]>();

export const selectWeekDates = (state: IAgendaStore) => {
  const { currentWeek } = state;
  // A semana é relativa a hoje: o cache não pode atravessar a meia-noite.
  const cacheKey = `${new Date().toDateString()}|${currentWeek}`;

  if (weekDatesCache.has(cacheKey)) {
    return weekDatesCache.get(cacheKey)!;
  }

  const weekDates = getWeekDates(currentWeek);
  weekDatesCache.set(cacheKey, weekDates);
  return weekDates;
};

const monthDatesCache = new Map<string, Date[]>();

export const selectMonthGridDates = (state: IAgendaStore) => {
  const { currentMonth } = state;
  const cacheKey = `${new Date().toDateString()}|${currentMonth}`;

  if (monthDatesCache.has(cacheKey)) {
    return monthDatesCache.get(cacheKey)!;
  }

  const monthDates = getMonthGridDates(currentMonth);
  monthDatesCache.set(cacheKey, monthDates);
  return monthDates;
};
