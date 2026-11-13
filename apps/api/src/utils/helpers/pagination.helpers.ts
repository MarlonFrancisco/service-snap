import type { TPage } from './pagination.types';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** `skip`/`take` do TypeORM a partir de página (base 1) e tamanho, com teto. */
export function toSkipTake(page: number | string, limit?: number | string) {
  const take = Math.min(
    Math.max(Number(limit) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const current = Math.max(Number(page) || 1, 1);

  return { skip: (current - 1) * take, take, page: current };
}

export function toPage<T>(
  data: T[],
  total: number,
  page: number | string,
  limit: number,
): TPage<T> {
  return {
    data,
    meta: {
      total,
      page: Math.max(Number(page) || 1, 1),
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
