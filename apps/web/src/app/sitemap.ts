import {
  CATEGORY_GUIDES,
  categoryGuidePath,
} from '@/utils/constants/category-guides.constants';
import { LEGAL_PAGES_UPDATED_AT } from '@/utils/constants/platform.constants';
import { SITE_URL } from '@/utils/constants/site.constants';
import type { MetadataRoute } from 'next';

/** Fresh lastmod at request time — avoid freezing the build date in prod. */
export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Conteúdo editorial: não depende do índice de busca.
  const categoryGuidePages: MetadataRoute.Sitemap = CATEGORY_GUIDES.map(
    (guide) => ({
      url: `${SITE_URL}${categoryGuidePath(guide.slug)}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
  );

  // Lojas dependem do índice de busca; ficam de fora até ele estar confiável.
  // Busca (`/booking?query=`) nunca entra: é página de resultado.
  return [...staticPages, ...categoryGuidePages];
}
