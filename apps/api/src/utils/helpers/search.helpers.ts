import {
  isBookableProfessional,
  isStoreDraft,
} from '../../modules/partner/onboarding/onboarding.helpers';
import type { Store } from '../../modules/partner/stores/store.entity';
import type {
  IStoreSearchContent,
  IStoreSearchMetadata,
} from '../../modules/search/search.types';
import type { Subscription } from '../../modules/subscription/subscription.entity';
import { getStoreTimezone } from './region.helpers';

/** Loja cujo dono não tem plano ativo fica depois de todos os planos. */
export const NO_PLAN_RANK_TIER = 4;

const RANK_TIERS: Record<string, number> = {
  TIER_1: 1,
  TIER_2: 2,
  TIER_3: 3,
};

/** `RANK_TIER` vem dos metadados do produto na Stripe; ausente ou inválido conta como sem plano. */
export const toRankTier = (
  subscription: Pick<Subscription, 'features'> | null | undefined,
): number => RANK_TIERS[subscription?.features?.RANK_TIER ?? ''] ?? NO_PLAN_RANK_TIER;

const roundTo = (value: number, digits: number) =>
  Math.round(value * 10 ** digits) / 10 ** digits;

const summarizeReviews = (store: Store) => {
  const ratings = (store.reviews || [])
    .map((review) => Number(review.rating))
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  return {
    reviewCount: ratings.length,
    averageRating: ratings.length
      ? roundTo(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length, 2)
      : 0,
  };
};

/**
 * Só entra na busca quem o cliente consegue agendar: serviço ativo e profissional
 * que faça algum serviço. Fotos não contam, porque são opcionais no onboarding.
 */
export const availableToIndexStore = (store: Store): boolean => {
  return (
    Boolean(store.isActive) &&
    !isStoreDraft(store) &&
    store.services.some((service) => service.isActive) &&
    store.storeMembers.some(isBookableProfessional)
  );
};

export const mountStoreSearchIndex = (
  store: Store,
  rankTier: number = NO_PLAN_RANK_TIER,
): {
  content: IStoreSearchContent;
  metadata: IStoreSearchMetadata;
} => {
  const categoryNames = (store.categories || [])
    .map((category) => category?.name)
    .filter((name): name is string => Boolean(name));

  const serviceNames = (store.services || [])
    .map((service) => service?.name)
    .filter((name): name is string => Boolean(name));

  const searchText = [
    store.name,
    store.description,
    store.city,
    store.state,
    store.address,
    ...categoryNames,
    ...serviceNames,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    content: {
      name: store.name,
      description: store.description,
      country: store.country,
      address: store.address,
      city: store.city,
      state: store.state,
      zipCode: store.zipCode,
      services: store.services,
      categories: store.categories,
      categoryNames,
      serviceNames,
      searchText,
      openTime: store.openTime,
      closeTime: store.closeTime,
      businessDays: store.businessDays,
    },
    metadata: {
      ownerId: store.owner.id,
      createdAt: store.createdAt.toISOString(),
      updatedAt: (store.updatedAt ?? store.createdAt).toISOString(),
      telephone: store.telephone,
      email: store.email,
      website: store.website,
      instagram: store.instagram,
      facebook: store.facebook,
      amenities: store.amenities,
      gallery: store.gallery,
      reviews: store.reviews,
      currency: store.currency,
      rankTier,
      ...summarizeReviews(store),
      timezone: getStoreTimezone(store),
    },
  };
};
