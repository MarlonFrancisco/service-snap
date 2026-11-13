import type { TAgendaVisit } from '@/store/admin/agenda';
import type {
  IAppointment,
  TRescheduleRequest,
} from '@/types/api/schedule.types';
import type { IProfessional } from '@/types/api/users.types';

const timeToMinutes = (time: string): number => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (total: number): string =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

/**
 * Leva os serviços da visita para o novo dia e início, mantendo a duração e a
 * ordem de cada um. Usado para a grade responder antes da API.
 */
export const moveVisitInList = (
  appointments: IAppointment[],
  visit: TAgendaVisit,
  request: TRescheduleRequest,
  professional?: IProfessional,
): IAppointment[] => {
  const items = visit.visitItems ?? [visit];
  const itemIds = new Set(items.map((item) => item.id));
  const delta =
    timeToMinutes(request.startTime) - timeToMinutes(visit.startTime);

  return appointments.map((appointment) =>
    itemIds.has(appointment.id)
      ? {
          ...appointment,
          date: request.date,
          startTime: minutesToTime(
            timeToMinutes(appointment.startTime) + delta,
          ),
          endTime: minutesToTime(timeToMinutes(appointment.endTime) + delta),
          storeMember: professional ?? appointment.storeMember,
        }
      : appointment,
  );
};
