import { toDateKey } from '../../../../utils/helpers/schedule.helpers';
import type { TStoreCustomer, TStoreCustomerRow } from './customer.types';

export const MAX_CUSTOMER_TAGS = 10;

/** Etiquetas sem espaço sobrando, sem vazias e sem repetir (ignorando caixa). */
export function normalizeTags(tags: string[] | undefined): string[] {
  const seen = new Set<string>();

  return (tags ?? [])
    .map((tag) => tag.trim().replace(/\s+/g, ' '))
    .filter((tag) => {
      const key = tag.toLowerCase();

      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_CUSTOMER_TAGS);
}

const toDay = (value: string | Date | null) => (value ? toDateKey(value) : null);

export const toStoreCustomer = (row: TStoreCustomerRow): TStoreCustomer => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  telephone: row.telephone,
  notes: row.notes,
  tags: row.tags ?? [],
  visits: Number(row.visits) || 0,
  completed: Number(row.completed) || 0,
  noShows: Number(row.no_shows) || 0,
  cancelled: Number(row.cancelled) || 0,
  lastVisit: toDay(row.last_visit),
  nextVisit: toDay(row.next_visit),
  totalSpent: Number(row.total_spent) || 0,
});
