import type { IStore } from '@/types/api/stores.types';
import type { TBookingConfirmation } from '../../booking.types';

export type TBookingConfirmationConfig = {
  confirmation: TBookingConfirmation;
  /** Volta para o começo do fluxo da mesma loja. */
  onBackToStore: () => void;
};

/** Evento de calendário com horário de parede no fuso da loja. */
export type TCalendarEvent = {
  uid: string;
  title: string;
  description: string;
  location: string;
  /** YYYY-MM-DD */
  dateKey: string;
  /** HH:MM */
  startTime: string;
  /** HH:MM */
  endTime: string;
  /** IANA, ex.: America/Sao_Paulo */
  timeZone: string;
};

export type TStoreNoticePolicy = Pick<
  IStore,
  'cancellationNoticeHours' | 'rescheduleNoticeHours'
>;

export type TStoreContact = Pick<IStore, 'telephone' | 'country' | 'name'>;
