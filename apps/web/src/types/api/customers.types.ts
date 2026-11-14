import type { TPageQuery } from './pagination.types';

/** Cliente da loja, com o resumo das visitas (só dono e gerente veem). */
export interface IStoreCustomer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  telephone: string | null;
  notes: string | null;
  tags: string[];
  /** Uma visita com vários serviços conta uma vez. */
  visits: number;
  completed: number;
  noShows: number;
  cancelled: number;
  /** YYYY-MM-DD */
  lastVisit: string | null;
  nextVisit: string | null;
  /** Soma do que foi atendido, na moeda da loja. */
  totalSpent: number;
}

export type TCustomerQuery = TPageQuery & { tag?: string };

export type TUpdateCustomer = {
  notes?: string | null;
  /** Até 10. */
  tags?: string[];
};

/** Cadastro manual: nome e telefone ou e-mail. */
export type TCreateCustomer = TUpdateCustomer & {
  firstName: string;
  lastName?: string;
  telephone?: string;
  email?: string;
};
