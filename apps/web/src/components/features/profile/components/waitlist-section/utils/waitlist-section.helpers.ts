import type { IWaitlistEntry } from '@/types/api/waitlist.types';
import { formatDateKeyShort } from '@/utils/helpers/date.helper';
import { getWaitlistProfessionalName } from '@/utils/helpers/waitlist.helper';

/** Ex.: "Sáb, 07/11 · Corte + barba · Rafael Lima". */
export const getWaitlistEntryDetails = (entry: IWaitlistEntry) =>
  [
    formatDateKeyShort(entry.date),
    entry.service.name,
    getWaitlistProfessionalName(entry),
  ].join(' · ');

/** A listagem geral traz a loja; sem ela não há como sair da fila. */
export const hasWaitlistStore = (
  entry: IWaitlistEntry,
): entry is IWaitlistEntry & { store: { id: string; name: string } } =>
  Boolean(entry.store?.id);
