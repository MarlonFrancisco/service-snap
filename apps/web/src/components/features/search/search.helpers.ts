import {
  SEARCH_FILTER_PARAMS,
  SEARCH_MIN_RATING_VALUES,
} from './search.constants';
import type {
  TSearchFilters,
  TSearchFiltersRaw,
  TSearchMinRating,
} from './search.types';

const SEARCH_RESULTS_COUNT_CAP = 100;

const isSearchMinRating = (value: string): value is TSearchMinRating =>
  (SEARCH_MIN_RATING_VALUES as readonly string[]).includes(value);

/** Nota mínima válida ou `undefined` (valor fora da lista é ignorado). */
export const parseMinRating = (
  value?: string | null,
): TSearchMinRating | undefined => {
  const trimmed = value?.trim();
  return trimmed && isSearchMinRating(trimmed) ? trimmed : undefined;
};

/** Só `'true'` liga o filtro; o resto vira `undefined` para não sujar a chave. */
export const parseAvailableToday = (value?: string | null) =>
  value?.trim() === 'true' ? true : undefined;

/** Lê e valida os filtros vindos da URL (página server ou `useSearchParams`). */
export const parseSearchFilters = ({
  minRating,
  availableToday,
}: TSearchFiltersRaw): TSearchFilters => ({
  minRating: parseMinRating(minRating),
  availableToday: parseAvailableToday(availableToday),
});

export const hasActiveSearchFilters = ({
  minRating,
  availableToday,
}: TSearchFilters) => Boolean(minRating || availableToday);

/** `4.5` → `4,5`, no formato pt-BR. */
export const formatSearchRating = (value: TSearchMinRating) =>
  value.replace('.', ',');

/** Rótulo do chip de nota: `Nota 4,5+` com escolha, `Nota` sem. */
export const getRatingFilterLabel = (minRating?: TSearchMinRating) =>
  minRating ? `Nota ${formatSearchRating(minRating)}+` : 'Nota';

/**
 * Contador acima do título, ex.: "6 lojas com vaga hoje e nota 4,5 ou mais".
 * Sem filtros, mantém o texto de sempre ("6 lojas" / "Mais de 100 lojas").
 */
export const buildSearchResultsCountLabel = (
  total: number,
  { minRating, availableToday }: TSearchFilters,
) => {
  const base =
    total > SEARCH_RESULTS_COUNT_CAP
      ? `Mais de ${SEARCH_RESULTS_COUNT_CAP} lojas`
      : `${total} ${total === 1 ? 'loja' : 'lojas'}`;

  const conditions = [
    availableToday ? 'vaga hoje' : null,
    minRating ? `nota ${formatSearchRating(minRating)} ou mais` : null,
  ].filter((condition): condition is string => Boolean(condition));

  return conditions.length > 0 ? `${base} com ${conditions.join(' e ')}` : base;
};

/** Grava os filtros em `target`, removendo os que estão desligados. */
export const applySearchFiltersToParams = (
  target: URLSearchParams,
  { minRating, availableToday }: TSearchFilters,
) => {
  if (minRating) target.set(SEARCH_FILTER_PARAMS.minRating, minRating);
  else target.delete(SEARCH_FILTER_PARAMS.minRating);

  if (availableToday) target.set(SEARCH_FILTER_PARAMS.availableToday, 'true');
  else target.delete(SEARCH_FILTER_PARAMS.availableToday);

  return target;
};

/** URL de `/booking` com os novos filtros, sem perder query/location/category. */
export const buildSearchFiltersHref = (
  current: URLSearchParams,
  filters: TSearchFilters,
) => {
  const next = applySearchFiltersToParams(
    new URLSearchParams(current.toString()),
    filters,
  );
  return `/booking?${next.toString()}`;
};
