import type { TWorkingHours } from './agenda.types';

export const generateTimeSlots = (workingHours: TWorkingHours): string[] => {
  const slots: string[] = [];
  const [startHour = 0, startMin = 0] = workingHours.openTime
    .split(':')
    .map(Number);
  const [endHour = 0, endMin = 0] = workingHours.closeTime
    .split(':')
    .map(Number);
  // Sem pausa de almoço a API devolve `null`.
  const [lunchStartHour = 0, lunchStartMin = 0] = (
    workingHours.lunchStartTime ?? ''
  )
    .split(':')
    .map(Number);
  const [lunchEndHour = 0, lunchEndMin = 0] = (workingHours.lunchEndTime ?? '')
    .split(':')
    .map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const lunchStartMinutes = lunchStartHour * 60 + lunchStartMin;
  const lunchEndMinutes = lunchEndHour * 60 + lunchEndMin;

  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 30) {
    if (minutes >= lunchStartMinutes && minutes < lunchEndMinutes) {
      continue;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(
      `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
    );
  }

  return slots;
};

export const getWeekDates = (currentWeek: number): Date[] => {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() + currentWeek * 7);
  const monday = new Date(weekStart);
  const dayOfWeek = monday.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    return date;
  });
};

/** Índice do dia na grade: segunda é 0, domingo é 6. */
export const getTodayDayIndex = (today: Date = new Date()): number =>
  (today.getDay() + 6) % 7;

export const formatMonthYear = (date?: Date): string => {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};
