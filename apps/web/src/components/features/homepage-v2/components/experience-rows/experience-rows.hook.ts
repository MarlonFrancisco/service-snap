import { useRecomendationQuery } from '@/hooks/use-query/use-recomendation-query/use-recomendation-query.hook';
import { useSearchQuery } from '@/hooks/use-query/use-search-query/use-search-query.hook';
import { useMemo } from 'react';
import { mapSearchResultToExperienceCard } from '../../homepage-v2.helpers';
import { EXPERIENCE_ROW_CONFIGS } from '../../homepage-v2.mock';
import type { TExperienceRow } from '../../homepage-v2.types';

export const useExperienceRows = () => {
  const popularesConfig = EXPERIENCE_ROW_CONFIGS[0]!;
  const hojeConfig = EXPERIENCE_ROW_CONFIGS[1]!;
  const spasConfig = EXPERIENCE_ROW_CONFIGS[2]!;
  const saloesConfig = EXPERIENCE_ROW_CONFIGS[3]!;
  const bemEstarConfig = EXPERIENCE_ROW_CONFIGS[4]!;

  const { recommendationStores, isPendingRecommendationStores } =
    useRecomendationQuery({
      includePopularStores: true,
    });

  const hojeSearch = useSearchQuery({
    query: hojeConfig.query,
    category: hojeConfig.category,
  });
  const spasSearch = useSearchQuery({
    query: spasConfig.query,
    category: spasConfig.category,
  });
  const saloesSearch = useSearchQuery({
    query: saloesConfig.query,
    category: saloesConfig.category,
  });
  const bemEstarSearch = useSearchQuery({
    query: bemEstarConfig.query,
    category: bemEstarConfig.category,
  });

  const rows = useMemo<TExperienceRow[]>(
    () => [
      {
        ...popularesConfig,
        isPending: isPendingRecommendationStores,
        items: (recommendationStores ?? []).map((store) =>
          mapSearchResultToExperienceCard(
            store,
            popularesConfig.category || popularesConfig.query,
          ),
        ),
      },
      {
        ...hojeConfig,
        isPending: hojeSearch.isPending,
        items: (hojeSearch.data ?? []).map((store) =>
          mapSearchResultToExperienceCard(
            store,
            hojeConfig.category || hojeConfig.query,
          ),
        ),
      },
      {
        ...spasConfig,
        isPending: spasSearch.isPending,
        items: (spasSearch.data ?? []).map((store) =>
          mapSearchResultToExperienceCard(
            store,
            spasConfig.category || spasConfig.query,
          ),
        ),
      },
      {
        ...saloesConfig,
        isPending: saloesSearch.isPending,
        items: (saloesSearch.data ?? []).map((store) =>
          mapSearchResultToExperienceCard(
            store,
            saloesConfig.category || saloesConfig.query,
          ),
        ),
      },
      {
        ...bemEstarConfig,
        isPending: bemEstarSearch.isPending,
        items: (bemEstarSearch.data ?? []).map((store) =>
          mapSearchResultToExperienceCard(
            store,
            bemEstarConfig.category || bemEstarConfig.query,
          ),
        ),
      },
    ],
    [
      bemEstarConfig,
      bemEstarSearch.data,
      bemEstarSearch.isPending,
      hojeConfig,
      hojeSearch.data,
      hojeSearch.isPending,
      isPendingRecommendationStores,
      popularesConfig,
      recommendationStores,
      saloesConfig,
      saloesSearch.data,
      saloesSearch.isPending,
      spasConfig,
      spasSearch.data,
      spasSearch.isPending,
    ],
  );

  return { rows };
};
