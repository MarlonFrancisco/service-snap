/** Página de uma lista, no mesmo formato do histórico de notificações. */
export type TPage<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
