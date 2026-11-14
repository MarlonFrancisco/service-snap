/** Página de uma lista da API (`?page=`): itens e totais. */
export interface IPage<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type TPageQuery = {
  page?: number;
  limit?: number;
  search?: string;
};
