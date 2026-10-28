import { SITE_URL } from '@/utils/constants/site.constants';

const INSTAGRAM_HOST = /(^|\.)instagram\.com$/i;

/** Public ServiceSnap page partners paste into Google Business Profile. */
export function storePublicUrl(storeId: string): string {
  return `${SITE_URL}/booking/${storeId}`;
}

/** Accepts `@conta`, `conta` or a full Instagram URL. */
export function toInstagramUrl(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      if (!INSTAGRAM_HOST.test(url.hostname)) return null;
      return url.toString();
    } catch {
      return null;
    }
  }

  const handle = raw.replace(/^@/, '').split(/[/?#]/)[0] ?? '';
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) return null;
  return `https://www.instagram.com/${handle}/`;
}

export function instagramLabel(value?: string | null): string | null {
  const url = toInstagramUrl(value);
  if (!url) return null;

  try {
    const handle = new URL(url).pathname.split('/').filter(Boolean)[0];
    return handle ? `@${handle}` : 'Instagram';
  } catch {
    return 'Instagram';
  }
}

export function buildStoreJsonLd(store: {
  id: string;
  name: string;
  description?: string | null;
  telephone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  instagram?: string | null;
  image?: string | null;
}) {
  const instagram = toInstagramUrl(store.instagram);

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: store.name,
    url: storePublicUrl(store.id),
    ...(store.description ? { description: store.description } : {}),
    ...(store.telephone ? { telephone: store.telephone } : {}),
    ...(store.image ? { image: store.image } : {}),
    ...(instagram ? { sameAs: [instagram] } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(store.address ? { streetAddress: store.address } : {}),
      ...(store.city ? { addressLocality: store.city } : {}),
      ...(store.state ? { addressRegion: store.state } : {}),
      ...(store.zipCode ? { postalCode: store.zipCode } : {}),
      addressCountry: store.country || 'BR',
    },
  };
}
