import { RecomendationService } from '@/service/recomendation';
import { LEGAL_PAGES_UPDATED_AT } from '@/utils/constants/platform.constants';
import { PUBLIC_CATEGORY_NAMES } from '@/utils/constants/public-categories.constants';
import { SITE_URL } from '@/utils/constants/site.constants';
import {
  categoryCityPath,
  resolvePublicCategory,
  slugifyPlace,
} from '@/utils/helpers/category-city.helper';
import { withBudget } from '@/utils/helpers/promise.helper';
import type { MetadataRoute } from 'next';

/** Fresh lastmod at request time — avoid freezing the build date in prod. */
export const dynamic = 'force-dynamic';

const STORES_SITEMAP_MS = 2500;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: LEGAL_PAGES_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: LEGAL_PAGES_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = PUBLIC_CATEGORY_NAMES.map(
    (name) => {
      const params = new URLSearchParams({
        query: name,
        category: name,
      });
      return {
        url: `${SITE_URL}/booking?${params.toString()}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    },
  );

  const popularStores =
    (await withBudget(
      RecomendationService.getRecommendationStores(),
      STORES_SITEMAP_MS,
    )) ?? [];

  const storePages: MetadataRoute.Sitemap = popularStores
    .filter((store) => Boolean(store.id))
    .map((store) => ({
      url: `${SITE_URL}/booking/${store.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

  const placePages: MetadataRoute.Sitemap = [];
  const seenPlaces = new Set<string>();

  for (const store of popularStores) {
    const citySlug = slugifyPlace(store.content?.city || '');
    if (!citySlug) continue;

    for (const name of store.content?.categoryNames ?? []) {
      const category = resolvePublicCategory(name);
      if (!category) continue;

      const path = categoryCityPath(category.slug, citySlug);
      if (seenPlaces.has(path)) continue;
      seenPlaces.add(path);
      placePages.push({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return [...staticPages, ...categoryPages, ...placePages, ...storePages];
}
