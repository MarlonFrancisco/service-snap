/** Cliente na lista da loja, com o resumo das visitas. */
export type TStoreCustomer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  telephone: string | null;
  notes: string | null;
  tags: string[];
  visits: number;
  completed: number;
  noShows: number;
  cancelled: number;
  lastVisit: string | null;
  nextVisit: string | null;
  /** Soma do que foi atendido (preço da reserva), na moeda da loja. */
  totalSpent: number;
};

/** Linha crua da consulta da lista, em snake_case como vem do Postgres. */
export type TStoreCustomerRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  telephone: string | null;
  notes: string | null;
  tags: string[] | null;
  visits: string | number;
  completed: string | number;
  no_shows: string | number;
  cancelled: string | number;
  last_visit: string | Date | null;
  next_visit: string | Date | null;
  total_spent: string | number | null;
};

export type TCustomerListFilter = {
  search?: string;
  tag?: string;
};
