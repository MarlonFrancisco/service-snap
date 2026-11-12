/** Por onde a reserva entrou. */
export type TBookingSource = 'customer' | 'store' | 'whatsapp';

/** Novo dia, início e profissional de um atendimento (o grupo inteiro anda junto). */
export type TRescheduleRequest = {
  date: string; // formato YYYY-MM-DD
  startTime: string;
  /** Sem profissional, fica com o atual. */
  storeMemberId?: string;
};

/** Quem pede a remarcação ou o cancelamento. */
export type TScheduleActor = {
  /** Cliente (ou o bot em nome dele): vale a política e a agenda oferecida. */
  asCustomer: boolean;
};

export type TPolicyAction = 'cancel' | 'reschedule';

/** Código no corpo do 403 quando a política da loja barra o cliente. */
export const SCHEDULE_POLICY_CODE = 'SCHEDULE_POLICY_NOTICE';

/** Filtro e paginação de `GET /schedules`. */
export type TScheduleListQuery = {
  from?: string;
  to?: string;
  memberId?: string;
  page?: number;
  limit?: number;
};
