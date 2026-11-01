import { ISearchResult } from '@/service/search';
import { ISearchFilters } from '@/types/layout/search.types';
import { formatStorePrice } from './price.helper';

export const buildSearchUrl = (searchFilters: ISearchFilters) => {
  const query =
    searchFilters.query?.trim() || searchFilters.location?.trim() || '';

  if (!query) {
    return null;
  }

  const params = new URLSearchParams({ query });

  if (searchFilters.location?.trim()) {
    params.set('location', searchFilters.location.trim());
  }

  if (searchFilters.categories?.length) {
    params.set('category', searchFilters.categories[0]!);
  }

  if (searchFilters.date) {
    params.set('date', searchFilters.date.toISOString());
  }

  return `/booking?${params.toString()}`;
};

export const isSearchPage = (pathname: string) => {
  return pathname === '/booking';
};

export const formatRating = (rating: number) =>
  rating.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export const fromStoresToSearch = (stores?: ISearchResult[]) => {
  if (!stores) return [];

  return stores.map((result) => {
    const reviews = result.metadata.reviews;
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;

    const averagePrice =
      result.content.services.reduce((sum, service) => sum + service.price, 0) /
      result.content.services.length;

    const formattedAveragePrice = averagePrice
      ? formatStorePrice(
          averagePrice,
          result.metadata.currency,
          result.content.country,
        )
      : null;

    const price = formattedAveragePrice
      ? `Média de ${formattedAveragePrice}`
      : 'A consultar';

    return {
      id: result.id,
      name: result.content.name,
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
      location: `${result.content.city}, ${result.content.state}`,
      price,
      averagePrice: formattedAveragePrice,
      gallery: result.metadata.gallery.map((image) => image.url),
      description: result.content.description,
      phone: result.metadata.telephone,
      address: result.content.address,
      city: result.content.city,
      state: result.content.state,
      zipCode: result.content.zipCode,
      services: result.content.services,
      reviews: result.metadata.reviews,
      openTime: result.content.openTime,
      closeTime: result.content.closeTime,
      businessDays: result.content.businessDays,
      isActive: true,
      amenities: result.metadata.amenities,
      country: result.content.country,
      currency: result.metadata.currency,
      timezone: result.metadata.timezone,
      telephone: result.metadata.telephone,
    };
  });
};
