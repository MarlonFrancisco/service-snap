'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { STORE_PLACEHOLDER_IMAGE } from './image-with-fallback.constants';
import {
  isStorePlaceholderImage,
  resolveStoreImageSrc,
} from './image-with-fallback.helpers';

type TImageWithFallbackProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
  /** Forces the fallback image immediately. */
  useFallback?: boolean;
};

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = STORE_PLACEHOLDER_IMAGE,
  useFallback = false,
  unoptimized,
  onError,
  onLoad,
  ...rest
}: TImageWithFallbackProps) {
  const resolvedSrc = resolveStoreImageSrc(src);
  const [imageSrc, setImageSrc] = useState(
    useFallback ? fallbackSrc : resolvedSrc,
  );

  useEffect(() => {
    setImageSrc(useFallback ? fallbackSrc : resolveStoreImageSrc(src));
  }, [src, fallbackSrc, useFallback]);

  const showFallback = () => {
    setImageSrc((current) =>
      current === fallbackSrc ? current : fallbackSrc,
    );
  };

  const showingFallback =
    useFallback ||
    imageSrc === fallbackSrc ||
    isStorePlaceholderImage(imageSrc);

  return (
    <Image
      {...rest}
      src={imageSrc}
      alt={alt}
      className={className}
      unoptimized={unoptimized ?? showingFallback}
      onError={(event) => {
        showFallback();
        onError?.(event);
      }}
      onLoad={(event) => {
        const image = event.currentTarget;
        if (image.naturalWidth === 0) {
          showFallback();
        }
        onLoad?.(event);
      }}
    />
  );
}
