import type { IStoreGallery } from '@/types/api/stores.types';

export type TMultiImageUploadConfig = {
  images: IStoreGallery[];
  onChange: (images: IStoreGallery[]) => void;
  onChangeMain: (image: IStoreGallery) => void;
  onDelete: (imageId: string) => void;
  maxImages?: number;
  /** Em bytes. */
  maxFileSize?: number;
  className?: string;
};

export type TUseMultiImageUploadConfig = Pick<
  TMultiImageUploadConfig,
  'images' | 'onChange'
> & {
  maxImages: number;
  maxFileSize: number;
};
