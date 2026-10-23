import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from '@/utils/constants/site.constants';
import type { Metadata } from 'next';

export { CONTACT_EMAIL, SITE_NAME, SITE_URL } from '@/utils/constants/site.constants';

/** Index only production deployments (not Vercel preview / local / explicit opt-out). */
export function shouldIndexSite(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true') {
    return true;
  }
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'false') {
    return false;
  }
  return process.env.VERCEL_ENV === 'production';
}

type CreatePageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({
  title,
  description,
  path,
}: CreatePageMetadataInput): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${SITE_URL}${normalizedPath === '/' ? '' : normalizedPath}`;
  const indexable = shouldIndexSite();

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
