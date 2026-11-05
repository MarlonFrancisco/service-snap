import {
  BUSINESS_HUB,
  BUSINESS_SEGMENTS,
  businessPagePath,
} from '@/utils/constants/business-pages.constants';
import {
  CATEGORY_GUIDES,
  categoryGuidePath,
} from '@/utils/constants/category-guides.constants';
import {
  LEGAL_PAGES_UPDATED_AT,
  MARKETING_PAGES_UPDATED_AT,
} from '@/utils/constants/platform.constants';
import { SITE_URL } from '@/utils/constants/site.constants';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: MARKETING_PAGES_UPDATED_AT,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: MARKETING_PAGES_UPDATED_AT,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: MARKETING_PAGES_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/help`,
      lastModified: MARKETING_PAGES_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: MARKETING_PAGES_UPDATED_AT,
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
      lastModified: MARKETING_PAGES_UPDATED_AT,
      changeFrequency: 'monthly',
      priority: 0.8,
    }),
  );

  const businessPages: MetadataRoute.Sitemap = [
    BUSINESS_HUB,
    ...BUSINESS_SEGMENTS,
  ].map((page) => ({
    url: `${SITE_URL}${businessPagePath(page.slug)}`,
    lastModified: MARKETING_PAGES_UPDATED_AT,
    changeFrequency: 'monthly',
    priority: page.slug ? 0.8 : 0.9,
  }));

  // Lojas dependem do índice de busca; ficam de fora até ele estar confiável.
  // Busca (`/booking?query=`) nunca entra: é página de resultado.
  return [...staticPages, ...businessPages, ...categoryGuidePages];
}
