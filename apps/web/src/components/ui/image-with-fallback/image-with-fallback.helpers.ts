import { getStoreImageUrl } from '@/utils/helpers/storage.helper';
import { STORE_PLACEHOLDER_IMAGE } from './image-with-fallback.constants';

export const resolveStoreImageSrc = (src?: string | null): string => {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return STORE_PLACEHOLDER_IMAGE;
  }

  if (
    src.startsWith('https://') ||
    src.startsWith('http://') ||
    src.startsWith('data:') ||
    src.startsWith('/')
  ) {
    return src;
  }

  return getStoreImageUrl(src) ?? STORE_PLACEHOLDER_IMAGE;
};

export const isStorePlaceholderImage = (src?: string | null) =>
  Boolean(src?.includes('store-placeholder'));
