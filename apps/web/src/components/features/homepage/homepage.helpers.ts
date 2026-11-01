import { STORE_PLACEHOLDER_IMAGE } from '@/components/ui/image-with-fallback/image-with-fallback.constants';
import { resolveStoreImageSrc } from '@/components/ui/image-with-fallback/image-with-fallback.helpers';
import type { ISearchResult } from '@/types/api/search.types';
import { formatStorePrice } from '@/utils/helpers/price.helper';
import type { TExperienceCard } from './homepage.types';

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

const getBadgeLabel = (store: ISearchResult, rating: number) => {
  const reviewCount = store.metadata.reviews.length;

  if (rating >= 4.9 && reviewCount >= 50) return 'Preferido dos clientes';
  if (store.metadata.gallery?.length) return 'Espaço verificado';

  return 'Agende agora';
};

export const mapSearchResultToExperienceCard = (
  store: ISearchResult,
  fallbackQuery: string,
): TExperienceCard => {
  const rating = getAverageRating(store);
  const averagePrice = getAveragePrice(store);
  const firstService = store.content.services[0];
  const category =
    store.content.categoryNames?.[0] || firstService?.name || fallbackQuery;

  return {
    id: store.id,
    name: store.content.name,
    rating: rating
      ? rating.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null,
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
    badgeLabel: getBadgeLabel(store, rating),
    query: category,
  };
};
