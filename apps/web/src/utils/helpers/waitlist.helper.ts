import type { IWaitlistEntry } from '@/types/api/waitlist.types';

export const ANY_PROFESSIONAL_LABEL = 'Qualquer profissional';

/** Fila sem profissional vale para qualquer um da loja. */
export const getWaitlistProfessionalName = ({ storeMember }: IWaitlistEntry) =>
  storeMember?.name ?? ANY_PROFESSIONAL_LABEL;
