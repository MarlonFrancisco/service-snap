import type { SEARCH_MIN_RATING_VALUES } from './search.constants';

/** Notas mínimas aceitas pela API de busca (`GET /search?minRating=`). */
export type TSearchMinRating = (typeof SEARCH_MIN_RATING_VALUES)[number];

/** Filtros da busca pública, lidos e gravados na URL. */
export type TSearchFilters = {
  minRating?: TSearchMinRating;
  availableToday?: boolean;
};

/** Valores crus dos filtros, como chegam da URL. */
export type TSearchFiltersRaw = {
  minRating?: string | null;
  availableToday?: string | null;
};

/** Parâmetros completos da busca: termo, local, categoria e filtros. */
export type TSearchUrlParams = TSearchFilters & {
  query: string;
  location?: string;
  category?: string;
};

export type TSearchRatingOption = {
  value: TSearchMinRating;
  label: string;
};
