/** Contrato público de agendamento (API `/v1` e webhooks). Só muda com versão nova. */
export type TPublicSchedule = {
  id: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  status: string;
  price: number | null;
  currency: string | null;
  notes: string | null;
  service: { id: string; name: string } | null;
  professional: { id: string; name: string } | null;
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    telephone: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type TPublicPage<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};
