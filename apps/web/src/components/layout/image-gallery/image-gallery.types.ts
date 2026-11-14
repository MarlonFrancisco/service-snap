import type { CarouselApi } from '@repo/ui';

export type TImageGalleryConfig = {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  businessName: string;
  currentIndex?: number;
};

export type TUseImageGalleryConfig = {
  images: string[];
  initialIndex?: number;
};

/** Declarado à mão: o tipo inferido apontaria para dentro do embla, que o web não instala direto. */
export type TUseImageGalleryResult = {
  activeIndex: number;
  isLoading: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  handleImageLoad: () => void;
  setCarouselApi: (api: CarouselApi | null) => void;
};

export type TSharePlatform =
  | 'copy'
  | 'facebook'
  | 'twitter'
  | 'whatsapp'
  | 'instagram';
