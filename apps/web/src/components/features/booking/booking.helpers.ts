import { ICreateAppointment } from '@/types/api/schedule.types';
import { TBookingFormData } from './booking.schema';
import { ITimeSlot } from './booking.types';

const AFTERNOON_START_HOUR = 12;

type TBookingService = TBookingFormData['selectedServices'][number];

const timeToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** Soma preço e duração considerando a quantidade de cada serviço. */
export const getBookingTotals = (services: TBookingService[]) =>
  services.reduce(
    (totals, service) => ({
      totalPrice: totals.totalPrice + service.price * service.quantity,
      totalDuration: totals.totalDuration + service.duration * service.quantity,
    }),
    { totalPrice: 0, totalDuration: 0 },
  );

/** Horário `HH:MM` somado à duração em minutos. */
export const addMinutesToTime = (time: string, minutes: number) => {
  const total = timeToMinutes(time) + minutes;
  const hours = String(Math.floor(total / 60)).padStart(2, '0');
  const mins = String(total % 60).padStart(2, '0');
  return `${hours}:${mins}`;
};

/** Dia `YYYY-MM-DD` no fuso do cliente; `toISOString` poderia trocar o dia. */
export const getLocalDateKey = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/** Separa os serviços que o profissional realiza dos que ele não realiza. */
export const splitServicesByProfessional = (
  services: TBookingService[],
  professional: { services?: { id: string }[] },
) => {
  const canPerform = (service: TBookingService) =>
    professional.services?.some((s) => s.id === service.id) ?? false;

  return {
    performable: services.filter(canPerform),
    unavailable: services.filter((service) => !canPerform(service)),
  };
};

/** Um id por unidade: a API soma a duração de cada item recebido. */
export const getServiceIdsByQuantity = (services: TBookingService[]) =>
  services.flatMap((service) =>
    Array.from({ length: service.quantity }, () => service.id),
  );

/** A API cria um agendamento por item de `services`, um após o outro. */
export const buildSchedulePayload = ({
  services,
  date,
  startTime,
  professionalId,
}: {
  services: TBookingService[];
  date: Date;
  startTime: string;
  professionalId: string;
}) =>
  ({
    startTime,
    endTime: addMinutesToTime(
      startTime,
      getBookingTotals(services).totalDuration,
    ),
    date: getLocalDateKey(date),
    services: services.flatMap((service) =>
      Array.from({ length: service.quantity }, () => ({
        id: service.id,
        duration: service.duration,
      })),
    ),
    storeMember: { id: professionalId },
  }) satisfies Partial<ICreateAppointment>;

/** Iniciais exibidas no avatar: primeira letra do nome e do sobrenome. */
export const getInitials = (firstName?: string, lastName?: string) =>
  [firstName, lastName]
    .filter(Boolean)
    .map((name) => name?.[0])
    .join('')
    .toUpperCase();

/** Separa os horários nos grupos exibidos na tela. Grupos vazios saem da lista. */
export const groupSlotsByPeriod = <T extends ITimeSlot>(slots: T[]) =>
  [
    {
      label: 'Manhã',
      slots: slots.filter(
        (slot) => parseInt(slot.time, 10) < AFTERNOON_START_HOUR,
      ),
    },
    {
      label: 'Tarde',
      slots: slots.filter(
        (slot) => parseInt(slot.time, 10) >= AFTERNOON_START_HOUR,
      ),
    },
  ].filter((period) => period.slots.length > 0);
