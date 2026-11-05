import { RecomendationService } from '@/service/recomendation';
import { SearchService } from '@/service/search';
import type { ISearchResult } from '@/types/api/search.types';
import { withBudget } from '@/utils/helpers/promise.helper';
import { mapSearchResultToExperienceCard } from './homepage.helpers';
import { EXPERIENCE_ROW_CONFIGS } from './homepage.mock';
import type { TExperienceRow, TExperienceRowConfig } from './homepage.types';

const mapStores = (stores: ISearchResult[], config: TExperienceRowConfig) =>
  stores.map((store) =>
    mapSearchResultToExperienceCard(store, config.category || config.query),
  );

const loadRowItems = async (config: TExperienceRowConfig) => {
  if (config.source === 'popular') {
    const stores = await RecomendationService.getRecommendationStores();
    return mapStores(stores ?? [], config);
  }

  const stores = await SearchService.searchStores({
    query: config.query,
    category: config.category,
  });

  return mapStores(stores ?? [], config);
};

/** A home espera as vitrines antes de responder; API lenta não pode segurar a página. */
const EXPERIENCE_ROWS_MS = 1500;

export const getExperienceRows = async (): Promise<TExperienceRow[]> =>
  (await withBudget(loadExperienceRows(), EXPERIENCE_ROWS_MS)) ?? [];

const loadExperienceRows = async (): Promise<TExperienceRow[]> => {
  const rows = await Promise.all(
    EXPERIENCE_ROW_CONFIGS.map(async (config) => {
      try {
        const items = await loadRowItems(config);
        return { ...config, items };
      } catch {
        return { ...config, items: [] };
      }
    }),
  );

  return rows.filter((row) => row.items.length > 0);
};
