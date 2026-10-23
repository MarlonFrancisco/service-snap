import { SITE_URL, shouldIndexSite } from '@/utils/helpers/site-metadata.helper';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  if (!shouldIndexSite()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/partner/', '/checkout/', '/profile/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
