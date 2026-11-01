import { IAppointment } from '@/types/api/schedule.types';
import type { TWorkingHours } from './agenda.types';

export const generateTimeSlots = (workingHours: TWorkingHours): string[] => {
  const slots: string[] = [];
  const [startHour = 0, startMin = 0] = workingHours.openTime
    .split(':')
    .map(Number);
  const [endHour = 0, endMin = 0] = workingHours.closeTime
    .split(':')
    .map(Number);
  const [lunchStartHour = 0, lunchStartMin = 0] = workingHours.lunchStartTime
    .split(':')
    .map(Number);
  const [lunchEndHour = 0, lunchEndMin = 0] = workingHours.lunchEndTime
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

export const calculateDurationInMinutes = (
  startTime: string,
  endTime: string,
): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return endMinutes - startMinutes;
};

export const calculateEndTime = (
  startTime: string,
  durationMinutes: number,
): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
};

export const formatMonthYear = (date?: Date): string => {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

export const getAppointmentForSlot = (
  appointments: IAppointment[],
  professionalId: string,
  targetDate: string,
  time: string,
): IAppointment | null =>
  appointments.find(
    (appointment) =>
      appointment.storeMember.id === professionalId &&
      appointment.date === targetDate &&
      appointment.startTime === time &&
      appointment.status !== 'cancelled',
  ) ?? null;

export const isSlotOccupied = (
  appointments: IAppointment[],
  professionalId: string,
  targetDate: string,
  time: string,
): boolean => {
  const [timeHour, timeMin] = time.split(':').map(Number);
  const timeMinutes = timeHour * 60 + timeMin;

  return appointments.some((appointment) => {
    if (
      appointment.storeMember.id !== professionalId ||
      appointment.date !== targetDate ||
      appointment.status === 'cancelled'
    ) {
      return false;
    }

    const [startHour, startMin] = appointment.startTime.split(':').map(Number);
    const [endHour, endMin] = appointment.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return timeMinutes > startMinutes && timeMinutes < endMinutes;
  });
};

export const getSlotColor = (
  appointment: IAppointment | null,
  isBlocked: boolean,
): string => {
  if (isBlocked) {
    return 'bg-gray-100 border-gray-300 text-gray-500 cursor-pointer hover:bg-gray-200';
  }

  if (!appointment) {
    return 'bg-white hover:bg-gray-50 border-gray-200 cursor-pointer';
  }

  switch (appointment.status) {
    case 'scheduled':
      return 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 cursor-pointer';
    case 'completed':
      return 'bg-green-50 border-green-200 text-green-800 cursor-default';
    case 'cancelled':
      return 'bg-red-50 border-red-200 text-red-800 cursor-default';
    case 'no-show':
      return 'bg-orange-50 border-orange-200 text-orange-800 cursor-default';
    default:
      return 'bg-white border-gray-200';
  }
};

export const getSlotsSpan = (appointment: IAppointment): number => {
  const duration = calculateDurationInMinutes(
    appointment.startTime,
    appointment.endTime,
  );
  return Math.max(1, Math.ceil(duration / 30));
};
