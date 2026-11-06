import { useAnalytics } from '@/providers/analytics.provider';
import useSearchStore from '@/store/search/search.store';
import { formatBusinessHours } from '@/utils/helpers/business-hours.helper';
import { formatStorePrice } from '@/utils/helpers/price.helper';
import { formatRating } from '@/utils/helpers/search.helper';
import { generateStoreWhatsAppLink } from '@/utils/helpers/whatsapp.helper';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/** Foto, resumo e botão são fixos; em telas baixas a foto cede espaço aos detalhes. */
const SHORT_SCREEN_QUERY = '(max-height: 800px)';

export function useStorePreview() {
  const selectedStore = useSearchStore((state) => state.selectedStore);
  const router = useRouter();
  const analytics = useAnalytics();
  const [isShortScreen, setIsShortScreen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(SHORT_SCREEN_QUERY);
    const handleChange = () => setIsShortScreen(media.matches);

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const handleBookingClick = useCallback(() => {
    if (!selectedStore) return;
    analytics.track('select_content', {
      content_type: 'book_cta_preview',
      item_id: selectedStore.id,
      destination: `/booking/${selectedStore.id}`,
    });
    router.push(`/booking/${selectedStore.id}`);
  }, [selectedStore, router, analytics]);

  const handleWhatsAppClick = useCallback(() => {
    if (!selectedStore) return;
    analytics.track('contact_whatsapp_clicked', {
      store_id: selectedStore.id,
      placement: 'search_preview',
    });
  }, [selectedStore, analytics]);

  const formattedPrice = selectedStore
    ? formatStorePrice(
        selectedStore.services.reduce(
          (sum, service) => sum + service.price,
          0,
        ) / selectedStore.services.length || 0,
        selectedStore.currency,
        selectedStore.country,
      )
    : '';

  const formattedHours = selectedStore
    ? formatBusinessHours(
        selectedStore.openTime,
        selectedStore.closeTime,
        selectedStore.businessDays,
      )
    : '';

  const whatsAppLink = selectedStore
    ? generateStoreWhatsAppLink(selectedStore.telephone, selectedStore.name)
    : '';

  const showCarouselControls =
    selectedStore && selectedStore.gallery.length > 1;

  const hasReviews = selectedStore && selectedStore.reviews?.length > 0;

  const displayReviews = selectedStore ? selectedStore.reviews.slice(0, 3) : [];

  const ratingSummary = selectedStore
    ? [
        selectedStore.reviewCount > 0
          ? `${formatRating(selectedStore.rating)} · ${selectedStore.reviewCount} ${selectedStore.reviewCount === 1 ? 'avaliação' : 'avaliações'}`
          : 'Novo',
        selectedStore.location,
      ].join(' · ')
    : '';

  return {
    selectedStore,
    formattedPrice,
    formattedHours,
    ratingSummary,
    imageAspectRatio: isShortScreen ? 21 / 9 : 16 / 10,
    whatsAppLink,
    showCarouselControls,
    hasReviews,
    displayReviews,
    handleBookingClick,
    handleWhatsAppClick,
  };
}
