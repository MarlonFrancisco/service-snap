import { useAnalytics } from '@/providers/analytics.provider';
import useSearchStore from '@/store/search/search.store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useStoreDetailsDrawer = () => {
  const router = useRouter();
  const analytics = useAnalytics();
  const selectedStore = useSearchStore((state) => state.selectedStore);
  const mobileDrawerOpen = useSearchStore((state) => state.mobileDrawerOpen);
  const setMobileDrawerOpen = useSearchStore(
    (state) => state.setMobileDrawerOpen,
  );

  const handleBooking = useCallback(() => {
    if (!selectedStore) return;
    const destination = `/booking/${selectedStore.id}`;

    analytics.track('select_content', {
      content_type: 'book_cta_drawer',
      item_id: selectedStore.id,
      destination,
    });
    router.push(destination);
  }, [analytics, router, selectedStore]);

  const handlePhoneClick = useCallback(() => {
    if (!selectedStore) return;
    analytics.track('contact_phone_clicked', {
      store_id: selectedStore.id,
      placement: 'search_drawer',
    });
  }, [analytics, selectedStore]);

  return {
    selectedStore,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    handleBooking,
    handlePhoneClick,
  };
};
