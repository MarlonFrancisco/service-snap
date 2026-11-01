import { STORE_PLACEHOLDER_IMAGE } from '@/components/ui/image-with-fallback/image-with-fallback.constants';
import { resolveStoreImageSrc } from '@/components/ui/image-with-fallback/image-with-fallback.helpers';
import type { ISearchResult } from '@/types/api/search.types';
import { formatStorePrice } from '@/utils/helpers/price.helper';
import type {
  TExperienceBadgeTone,
  TExperienceCard,
} from './homepage.types';

const getAverageRating = (store: ISearchResult) => {
  const reviews = store.metadata.reviews;
  if (!reviews.length) return 0;

  return (
    reviews.reduce((sum, review) => sum + (review.rating || 0), 0) /
    reviews.length
  );
};

const getAveragePrice = (store: ISearchResult) => {
  const services = store.content.services;
  if (!services.length) return null;

  return (
    services.reduce((sum, service) => sum + service.price, 0) / services.length
  );
};

const getMainImage = (store: ISearchResult) => {
  const gallery = (store.metadata.gallery ?? []).filter((image) =>
    Boolean(image.url?.trim()),
  );
  const main = gallery.find((image) => image.isMain) ?? gallery[0];
  return resolveStoreImageSrc(main?.url) || STORE_PLACEHOLDER_IMAGE;
};

const getBadge = (
  store: ISearchResult,
  rating: number,
): { label: string; tone: TExperienceBadgeTone } => {
  const reviewCount = store.metadata.reviews.length;

  if (rating >= 4.9 && reviewCount >= 50) {
    return { label: 'Preferido dos clientes', tone: 'primary' };
  }

  if (store.metadata.gallery?.length) {
    return { label: 'Espaço verificado', tone: 'verified' };
  }

  return { label: 'Agende agora', tone: 'success' };
};

export const mapSearchResultToExperienceCard = (
  store: ISearchResult,
  fallbackQuery: string,
): TExperienceCard => {
  const rating = getAverageRating(store);
  const averagePrice = getAveragePrice(store);
  const badge = getBadge(store, rating);
  const firstService = store.content.services[0];
  const category =
    store.content.categoryNames?.[0] || firstService?.name || fallbackQuery;

  return {
    id: store.id,
    name: store.content.name,
    rating: rating ? rating.toFixed(2) : '—',
    reviews: store.metadata.reviews.length,
    location: [store.content.city, store.content.state]
      .filter(Boolean)
      .join(', '),
    service: firstService?.name || store.content.description || category,
    price: averagePrice
      ? formatStorePrice(
          averagePrice,
          store.metadata.currency,
          store.content.country,
        )
      : 'A consultar',
    image: getMainImage(store),
    imageAlt: store.content.name,
    badgeLabel: badge.label,
    badgeTone: badge.tone,
    query: category,
  };
};
