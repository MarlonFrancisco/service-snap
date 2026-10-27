import { SearchService } from '@/service/search';
import type { ISearchResult } from '@/types/api/search.types';
import { SITE_URL } from '@/utils/constants/site.constants';
import {
  slugifyPlace,
  type TCategoryCityBusiness,
  type TResolvedCategoryCity,
} from '@/utils/helpers/category-city.helper';
import { withBudget } from '@/utils/helpers/promise.helper';
import { cache } from 'react';

const SEARCH_MS = 4000;

export type TCategoryCityLoad = {
  status: 'ok' | 'unavailable';
  stores: TCategoryCityBusiness[];
  displayCity: string;
};

export const loadCategoryCity = cache(
  async (resolved: TResolvedCategoryCity): Promise<TCategoryCityLoad> => {
    const location = resolved.citySlug.replace(/-/g, ' ');
    const results = await withBudget(
      SearchService.searchStores({
        query: resolved.categoryName,
        category: resolved.categoryName,
        location,
      }),
      SEARCH_MS,
    );

    if (!results) {
      return {
        status: 'unavailable',
        stores: [],
        displayCity: resolved.cityLabel,
      };
    }

    const stores = results.map(toBusiness);
    const matchedCity = stores.find(
      (store) => store.city && slugifyPlace(store.city) === resolved.citySlug,
    )?.city;

    return {
      status: 'ok',
      stores,
      displayCity: matchedCity || resolved.cityLabel,
    };
  },
);

function toBusiness(result: ISearchResult): TCategoryCityBusiness {
  const reviews = result.metadata?.reviews ?? [];
  const reviewCount = reviews.length;
  const rating =
    reviewCount > 0
      ? Math.round(
          (reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviewCount) *
            10,
        ) / 10
      : undefined;
  const image = result.metadata?.gallery?.find((item) => item.url)?.url;

  return {
    name: result.content.name,
    path: `/booking/${result.id}`,
    url: `${SITE_URL}/booking/${result.id}`,
    description: result.content.description || undefined,
    telephone: result.metadata?.telephone || undefined,
    image: image?.startsWith('http') ? image : undefined,
    address: result.content.address || undefined,
    city: result.content.city || undefined,
    state: result.content.state || undefined,
    zipCode: result.content.zipCode || undefined,
    country: result.content.country || undefined,
    rating,
    reviewCount: reviewCount || undefined,
  };
}
