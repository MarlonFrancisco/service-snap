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
import {
  loadStoreSitemap,
  toCategoryCityLinks,
  toLastModified,
} from '@/utils/helpers/store-sitemap.helper';
import type { MetadataRoute } from 'next';

// Lojas entram e saem do sitemap sem deploy; 1 h basta para o Google.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Lojas e pares categoria + cidade vêm do índice da busca, que só guarda quem
  // dá para agendar. Se a API falhar, o sitemap sai só com o fixo.
  // Busca (`/booking?query=`) nunca entra: é página de resultado.
  const storeSitemap = await loadStoreSitemap();

  const storePages: MetadataRoute.Sitemap = (storeSitemap?.stores ?? []).map(
    (store) => ({
      url: `${SITE_URL}/booking/${store.id}`,
      lastModified: toLastModified(store.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }),
  );

  const categoryCityPages: MetadataRoute.Sitemap = toCategoryCityLinks(
    storeSitemap,
  ).map((link) => ({
    url: `${SITE_URL}${link.path}`,
    lastModified: toLastModified(link.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...businessPages,
    ...categoryGuidePages,
    ...categoryCityPages,
    ...storePages,
  ];
}
