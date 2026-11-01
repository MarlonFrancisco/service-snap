import { ITimeSlot } from './booking.types';

const AFTERNOON_START_HOUR = 12;

/** Iniciais exibidas no avatar: primeira letra do nome e do sobrenome. */
export const getInitials = (firstName?: string, lastName?: string) =>
  [firstName, lastName]
    .filter(Boolean)
    .map((name) => name?.[0])
    .join('')
    .toUpperCase();

/** Separa os horários nos grupos exibidos na tela. Grupos vazios saem da lista. */
export const groupSlotsByPeriod = (slots: ITimeSlot[]) =>
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
