/** O que identifica uma fila: o dia, o serviço e o profissional (ou qualquer um). */
export type TWaitlistEntryMatch = {
  date: string;
  serviceId: string;
  storeMemberId?: string;
};
