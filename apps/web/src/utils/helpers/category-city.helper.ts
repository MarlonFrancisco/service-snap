import { PUBLIC_CATEGORY_NAMES } from '@/utils/constants/public-categories.constants';
import { slugify } from '@/utils/helpers/slug.helper';

const CITY_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const CATEGORY_BY_SLUG = new Map(
  PUBLIC_CATEGORY_NAMES.map((name) => [slugify(name), name]),
);

export type TResolvedCategoryCity = {
  categoryName: string;
  categorySlug: string;
  citySlug: string;
  cityLabel: string;
};

export type TCategoryCityBusiness = {
  name: string;
  /** Absolute URL for JSON-LD. */
  url: string;
  /** In-app path for the store booking page. */
  path: string;
  description?: string;
  telephone?: string;
  image?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  rating?: number;
  reviewCount?: number;
  /** Absolute Instagram profile, when the partner filled one in. */
  instagramUrl?: string;
};

export function categoryCityPath(
  categorySlug: string,
  citySlug: string,
): string {
  return `/categoria/${categorySlug}/${citySlug}`;
}

export function resolvePublicCategory(
  value: string,
): { slug: string; name: string } | null {
  const slug = slugify(value);
  const name = CATEGORY_BY_SLUG.get(slug);
  if (!name) return null;
  return { slug, name };
}

export function resolveCategoryCity(
  categorySlug: string,
  citySlug: string,
): TResolvedCategoryCity | null {
  const categoryName = CATEGORY_BY_SLUG.get(categorySlug);
  if (!categoryName || !isCitySlug(citySlug)) return null;

  return {
    categoryName,
    categorySlug,
    citySlug,
    cityLabel: labelFromSlug(citySlug),
  };
}

export function buildCategoryCityJsonLd(input: {
  categoryName: string;
  cityLabel: string;
  pageUrl: string;
  stores: TCategoryCityBusiness[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${input.categoryName} em ${input.cityLabel}`,
    url: input.pageUrl,
    numberOfItems: input.stores.length,
    itemListElement: input.stores.map((store, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'LocalBusiness',
        name: store.name,
        url: store.url,
        ...(store.description ? { description: store.description } : {}),
        ...(store.telephone ? { telephone: store.telephone } : {}),
        ...(store.image ? { image: store.image } : {}),
        ...(store.instagramUrl ? { sameAs: [store.instagramUrl] } : {}),
        address: {
          '@type': 'PostalAddress',
          ...(store.address ? { streetAddress: store.address } : {}),
          addressLocality: store.city || input.cityLabel,
          ...(store.state ? { addressRegion: store.state } : {}),
          ...(store.zipCode ? { postalCode: store.zipCode } : {}),
          addressCountry: store.country || 'BR',
        },
        ...(store.reviewCount && store.rating
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: store.rating,
                reviewCount: store.reviewCount,
              },
            }
          : {}),
      },
    })),
  };
}

function isCitySlug(slug: string): boolean {
  return slug.length >= 2 && slug.length <= 60 && CITY_SLUG.test(slug);
}

/** Preposições ficam minúsculas no meio do nome: "Rio de Janeiro". */
const LOWERCASE_PARTS = new Set(['da', 'das', 'de', 'do', 'dos', 'e']);

export function labelFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((part, index) =>
      index > 0 && LOWERCASE_PARTS.has(part)
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(' ');
}
