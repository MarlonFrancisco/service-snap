'use client';
import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

function resolveImageSrc(src?: string | null): string | null {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return null;
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
    return null;
  }

  return `${cdn}/stores/${src}`;
}

export function ImageWithFallback(
  props: { useFallback?: boolean; src?: string } & ImageProps,
) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, useFallback, ...rest } = props;
  const imageSrc = resolveImageSrc(src);
  const showFallback = didError || useFallback || !imageSrc;

  return showFallback ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <Image
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
      loading="lazy"
    />
  );
}
