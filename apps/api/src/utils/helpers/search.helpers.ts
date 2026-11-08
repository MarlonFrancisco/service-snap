import {
  isBookableProfessional,
  isStoreDraft,
} from '../../modules/partner/onboarding/onboarding.helpers';
import type { Store } from '../../modules/partner/stores/store.entity';
import type {
  IStoreSearchContent,
  IStoreSearchMetadata,
} from '../../modules/search/search.types';

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
    },
  };
};
