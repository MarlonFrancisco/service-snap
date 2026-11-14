import { CarouselApi } from '@repo/ui';
import { useCallback, useEffect, useState } from 'react';
import type {
  TUseImageGalleryConfig,
  TUseImageGalleryResult,
} from './image-gallery.types';

export const useImageGallery = ({
  images,
  initialIndex = 0,
}: TUseImageGalleryConfig): TUseImageGalleryResult => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!carouselApi) return;

    carouselApi.on('select', (api) => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [carouselApi, initialIndex, setActiveIndex]);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.scrollTo(activeIndex);
  }, [carouselApi, activeIndex]);

  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) {
        setActiveIndex(index);
      }
    },
    [images.length],
  );

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    activeIndex,
    isLoading,
    goToNext,
    goToPrevious,
    goToIndex,
    handleImageLoad,
    setCarouselApi,
  };
};
