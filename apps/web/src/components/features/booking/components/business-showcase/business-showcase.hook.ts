'use client';

import { useFavoritesMutations } from '@/hooks/use-mutations/use-favorites-mutations/use-favorites-mutations.hook';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { TWorkingDays } from '@/types/api/stores.types';
import { orderGalleryByMainImage } from '@/utils/helpers/gallery.helper';
import {
  instagramLabel,
  toInstagramUrl,
} from '@/utils/helpers/social.helper';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGetStore } from '../../booking.hook';

interface BusinessShowcaseData {
  businessName: string;
  businessAddress: string;
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

export const useBusinessShowcase = () => {
  const selectedStore = useGetStore();
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { createFavorite, deleteFavorite } = useFavoritesMutations();

  const { user, isLoggedIn } = useUserQuery();

  const favorite = useMemo(() => {
    return user?.favorites.find(
      (favorite) => favorite.store.id === selectedStore?.id,
    );
  }, [user, selectedStore]);

  const isFavorite = Boolean(favorite);

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

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setShowAllPhotos(true);
  }, []);

  const handleCloseGallery = useCallback(() => {
    setShowAllPhotos(false);
  }, []);

  const handleShare = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      navigator
        .share({
          title: 'Compartilhar negócio',
          url: window.location.href,
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
        })
        .catch(() => {
          toast.error('Falha ao copiar link');
        });
    }
  }, []);

  const handleSave = useCallback(() => {
    if (isFavorite) {
      deleteFavorite({
        id: favorite!.id,
        user: { id: user!.id },
      });
    } else {
      createFavorite({
        store: { id: selectedStore!.id },
        user: { id: user!.id },
      });
    }
  }, [
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
    isFavorite,
    isLoggedIn,
    selectedStore,
    allImages,
    rightSideGalleryImages,
    mainGalleryImage,
    handleImageClick,
    handleCloseGallery,
    handleShare,
    handleSave,
  };
};
