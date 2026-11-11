import type { Store } from '../../modules/partner/stores/store.entity';

/** Horário pedido para um profissional, na ordem em que os serviços acontecem. */
export type TSlotRequest = {
  store: Store;
  storeMemberId: string;
  date: string; // formato YYYY-MM-DD
  items: { startTime: string; endTime: string }[];
  /** Atendimento que está sendo movido: não conta como conflito consigo mesmo. */
  excludeId?: string;
  /** Exige um horário que a loja ofereceria (expediente, bloqueios, não passado). */
  enforceAvailability: boolean;
};

export type TCalendarEvent = {
  title: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  timezone: string;
  location: string;
};
