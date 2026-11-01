'use client';

import { StoreCard as BaseStoreCard } from '@/components/ui/store-card';
import useSearchStore from '@/store/search/search.store';
import { IStoreSearchListItem } from '@/store/search/search.types';
import { useIsMobile } from '@repo/ui';

interface SearchStoreCardProps {
  store: IStoreSearchListItem;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Wrapper do StoreCard para uso na página de busca.
 * Adiciona comportamento específico como abrir drawer no mobile.
 */
export function StoreCard({
  store,
  isSelected,
  onClick,
}: SearchStoreCardProps) {
  const isMobile = useIsMobile();
  const setMobileDrawerOpen = useSearchStore(
    (state) => state.setMobileDrawerOpen,
  );

  const handleClick = () => {
    onClick();
    if (isMobile) {
      setMobileDrawerOpen(true);
    }
  };

  return (
    <BaseStoreCard
      store={{
        id: store.id,
        name: store.name,
        location: store.location,
        rating: store.rating,
        reviewCount: store.reviewCount,
        averagePrice: store.averagePrice,
        gallery: store.gallery,
        services: store.services,
      }}
      isSelected={isSelected}
      onClick={handleClick}
      showAvailabilityBadge
      showServiceBadge
      imageAspectRatio={isMobile ? 4 / 3 : 1}
    />
  );
}
