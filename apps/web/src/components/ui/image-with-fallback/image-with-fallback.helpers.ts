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

  const cdn = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, '');
  if (!cdn) {
    return STORE_PLACEHOLDER_IMAGE;
  }

  return `${cdn}/stores/${src}`;
};

export const isStorePlaceholderImage = (src?: string | null) =>
  Boolean(src?.includes('store-placeholder'));
