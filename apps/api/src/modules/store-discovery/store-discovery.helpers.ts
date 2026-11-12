import { getActiveHitServices, type TSearchHit } from '../../utils/helpers/search-relevance.helpers';
import { getStoreTimezone } from '../../utils/helpers/region.helpers';
import { getStoreNow } from '../../utils/helpers/schedule.helpers';
import type { TSearchFilters } from '../search/search.types';
import type { SearchQueryDto } from './dto/search-query.dto';

const toOptionalNumber = (value?: string) =>
  value === undefined || value === '' ? undefined : Number(value);

export const toSearchFilters = (dto: SearchQueryDto): TSearchFilters => ({
  minPrice: toOptionalNumber(dto.minPrice),
  maxPrice: toOptionalNumber(dto.maxPrice),
  minRating: toOptionalNumber(dto.minRating),
});

/**
 * O serviço mais curto da loja: se nem ele cabe em algum horário de hoje,
 * nenhum outro cabe.
 */
export const getShortestServiceId = (hit: TSearchHit): string | undefined =>
  getActiveHitServices(hit).sort(
    (a, b) => (a.duration ?? Infinity) - (b.duration ?? Infinity),
  )[0]?.id;

/** "Hoje" é o dia no fuso da loja, não o do servidor. */
export const getStoreToday = (hit: TSearchHit, now = new Date()): string =>
  getStoreNow(
    getStoreTimezone({
      timezone: hit.metadata?.timezone,
      country: hit.content?.country,
    }),
    now,
  ).date;
