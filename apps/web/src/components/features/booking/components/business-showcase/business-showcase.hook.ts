'use client';

import { useFavoritesMutations } from '@/hooks/use-mutations/use-favorites-mutations/use-favorites-mutations.hook';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useReviewsStore } from '@/store';
import { TWorkingDays } from '@/types/api/stores.types';
import { orderGalleryByMainImage } from '@/utils/helpers/gallery.helper';
import { instagramLabel, toInstagramUrl } from '@/utils/helpers/social.helper';
import type { CarouselApi } from '@repo/ui';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGetStore } from '../../booking.hook';

interface BusinessShowcaseData {
  businessName: string;
  businessAddress: string;
  businessLocation: string;
  images: string[];
  averageRating: number;
  reviewCount: number;
  description: string;
  amenities: string[];
  openTime: string;
  closeTime: string;
  businessDays: TWorkingDays;
  instagramUrl: string | null;
  instagramLabel: string | null;
}

/** Dados do espaço, lidos pelo cabeçalho e pelo bloco de informações. */
export const useBusinessData = () => {
  const selectedStore = useGetStore();

  const data: BusinessShowcaseData | null = useMemo(() => {
    if (!selectedStore) return null;

    const reviewCount = selectedStore.reviews.length;
    const totalRating =
      selectedStore.reviews?.reduce((sum, review) => sum + review.rating, 0) ||
      0;

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    const businessAddress = `${selectedStore.address}, ${selectedStore.city} - ${selectedStore.state}`;

    return {
      businessName: selectedStore.name,
      businessAddress,
      businessLocation: `${selectedStore.city}, ${selectedStore.state}`,
      averageRating,
      reviewCount,
      description: selectedStore.description || '',
      amenities: selectedStore.amenities || [],
      openTime: selectedStore.openTime,
      closeTime: selectedStore.closeTime,
      businessDays: selectedStore.businessDays || [],
      instagramUrl: toInstagramUrl(selectedStore.instagram),
      instagramLabel: instagramLabel(selectedStore.instagram),
    };
  }, [selectedStore]);

  return data;
};

/** Ações do bloco de informações (links externos da loja). */
export const useBusinessInfoActions = () => {
  const selectedStore = useGetStore();
  const analytics = useAnalytics();

  const handleInstagramClick = useCallback(() => {
    analytics.track('social_link_clicked', {
      network: 'instagram',
      store_id: selectedStore?.id,
      page: 'store',
    });
  }, [analytics, selectedStore?.id]);

  return { handleInstagramClick };
};

export const useBusinessShowcase = () => {
  const selectedStore = useGetStore();
  const data = useBusinessData();
  const analytics = useAnalytics();
  const { setReviewsAttributesAction } = useReviewsStore();
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [visibleImageIndex, setVisibleImageIndex] = useState(0);

  const { createFavorite, deleteFavorite } = useFavoritesMutations();

  const { user, isLoggedIn } = useUserQuery();

  const favorite = useMemo(() => {
    return user?.favorites.find(
      (favorite) => favorite.store.id === selectedStore?.id,
    );
  }, [user, selectedStore]);

  const isFavorite = Boolean(favorite);

  const handleCarouselApi = useCallback((api: CarouselApi) => {
    api?.on('select', () => setVisibleImageIndex(api.selectedScrollSnap()));
  }, []);

  const galleryTotal = selectedStore?.gallery?.length ?? 0;

  const handleImageClick = useCallback(
    (index: number) => {
      setSelectedImageIndex(index);
      setShowAllPhotos(true);
      analytics.track('gallery_opened', {
        image_index: index,
        total: galleryTotal,
      });
    },
    [analytics, galleryTotal],
  );

  const handleOpenReviews = useCallback(() => {
    setReviewsAttributesAction({
      storeId: selectedStore?.id,
      businessName: selectedStore?.name,
      isOpen: true,
    });
    if (selectedStore) {
      analytics.track('reviews_opened', {
        store_id: selectedStore.id,
        review_count: selectedStore.reviews?.length ?? 0,
      });
    }
  }, [analytics, selectedStore, setReviewsAttributesAction]);

  const handleCloseGallery = useCallback(() => {
    setShowAllPhotos(false);
  }, []);

  const handleShare = useCallback(() => {
    if (typeof window === 'undefined') return;

    const storeId = selectedStore?.id;

    if (navigator.share) {
      navigator
        .share({
          title: 'Compartilhar negócio',
          url: window.location.href,
        })
        .then(() => {
          analytics.track('share', {
            method: 'native_share',
            content_type: 'store',
            item_id: storeId,
          });
        })
        .catch(() => {
          // Silently fail if user cancels
        });
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          toast.success('Link copiado para a área de transferência');
          analytics.track('share', {
            method: 'clipboard',
            content_type: 'store',
            item_id: storeId,
          });
        })
        .catch(() => {
          toast.error('Falha ao copiar link');
        });
    }
  }, [analytics, selectedStore?.id]);

  const handleSave = useCallback(() => {
    const storeId = selectedStore!.id;
    const trackWishlist = (
      event: 'add_to_wishlist' | 'remove_from_wishlist',
    ) => analytics.track(event, { item_id: storeId, source: 'store_page' });

    if (isFavorite) {
      deleteFavorite(
        {
          id: favorite!.id,
          user: { id: user!.id },
        },
        { onSuccess: () => trackWishlist('remove_from_wishlist') },
      );
    } else {
      createFavorite(
        {
          store: { id: storeId },
          user: { id: user!.id },
        },
        { onSuccess: () => trackWishlist('add_to_wishlist') },
      );
    }
  }, [
    analytics,
    createFavorite,
    deleteFavorite,
    favorite,
    isFavorite,
    selectedStore,
    user,
  ]);

  const { allImages, mainGalleryImage, rightSideGalleryImages } =
    useMemo(() => {
      const allImages = orderGalleryByMainImage(
        selectedStore?.gallery || [],
      ).map((item: { url: string }) => item.url);
      const mainGalleryImage = allImages[0] || '';
      const rightSideGalleryImages = ['', '', '', ''].map(
        (_, index) => allImages[index + 1] || '',
      );

      return {
        allImages,
        mainGalleryImage,
        rightSideGalleryImages,
      };
    }, [selectedStore?.gallery]);

  return {
    data,
    showAllPhotos,
    selectedImageIndex,
    visibleImageIndex,
    isFavorite,
    isLoggedIn,
    selectedStore,
    allImages,
    rightSideGalleryImages,
    mainGalleryImage,
    handleCarouselApi,
    handleImageClick,
    handleCloseGallery,
    handleShare,
    handleSave,
    handleOpenReviews,
  };
};
