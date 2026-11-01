'use client';

import { ImageGallery } from '@/components/layout/image-gallery';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import {
  AspectRatio,
  Badge,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@repo/ui';
import { cn } from '@repo/ui/index';
import { Maximize2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  showCounter?: boolean;
  showFullscreenButton?: boolean;
  rounded?: boolean;
  aspectRatio?: number;
}

export function ImageCarousel({
  images,
  alt,
  className = '',
  showCounter = true,
  showFullscreenButton = false,
  rounded = true,
  aspectRatio = 1 / 1,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const carouselApiRef = useRef<CarouselApi | null>(null);

  const handleSelectChange = useCallback((api: CarouselApi) => {
    if (api) {
      setCurrentIndex(api.selectedScrollSnap());
    }
  }, []);

  const goToSlide = (index: number) => {
    if (carouselApiRef.current) {
      carouselApiRef.current.scrollTo(index);
    }
  };

  if (!images || images.length === 0) {
    return (
      // Fotos são opcionais: loja sem foto mostra o placeholder no mesmo tamanho.
      <div className={cn('relative overflow-hidden', rounded && 'rounded-xl', className)}>
        <AspectRatio ratio={aspectRatio}>
          <ImageWithFallback
            alt={alt}
            useFallback
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        </AspectRatio>
      </div>
    );
  }

  // Limitar a exibição de dots (estilo Airbnb mostra no máximo 5)
  const maxDots = 5;
  const totalImages = images.length;
  const showDots = totalImages > 1;

  // Calcular quais dots mostrar (sliding window como Airbnb)
  const getVisibleDots = () => {
    if (totalImages <= maxDots) {
      return images.map((_, i) => i);
    }

    const halfMax = Math.floor(maxDots / 2);
    let start = currentIndex - halfMax;
    let end = currentIndex + halfMax;

    if (start < 0) {
      start = 0;
      end = maxDots - 1;
    } else if (end >= totalImages) {
      end = totalImages - 1;
      start = totalImages - maxDots;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visibleDots = getVisibleDots();

  return (
    <>
      <div
        className={cn('relative', rounded && 'rounded-xl', className)}
        style={{ overflow: 'hidden' }}
      >
        <Carousel
          opts={{
            align: 'start',
            loop: images.length > 1,
          }}
          setApi={(api: CarouselApi) => {
            carouselApiRef.current = api;
            if (api) {
              api.on('select', () => handleSelectChange(api));
            }
          }}
          className="w-full h-full relative group"
        >
          <CarouselContent className="m-0">
            {images.map((image, index) => (
              <CarouselItem key={index} className="p-0">
                <div className="relative bg-gray-200">
                  <AspectRatio ratio={aspectRatio}>
                    <ImageWithFallback
                      src={image}
                      alt={`${alt} - Imagem ${index + 1}`}
                      fill
                      sizes="(min-width: 728px) 350px, 150px"
                      loading="lazy"
                      className="object-cover"
                    />
                  </AspectRatio>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Buttons - Estilo Airbnb */}
          {images.length > 1 && (
            <>
              <CarouselPrevious
                className={cn(
                  'absolute left-2 top-1/2 -translate-y-1/2',
                  'w-8 h-8 p-0 bg-white hover:bg-white hover:scale-105',
                  'shadow-md rounded-full border border-gray-200',
                  'opacity-0 group-hover:opacity-100 transition-all duration-200',
                  'disabled:opacity-0',
                )}
              />
              <CarouselNext
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2',
                  'w-8 h-8 p-0 bg-white hover:bg-white hover:scale-105',
                  'shadow-md rounded-full border border-gray-200',
                  'opacity-0 group-hover:opacity-100 transition-all duration-200',
                  'disabled:opacity-0',
                )}
              />
            </>
          )}

          {/* Counter Badge */}
          {showCounter && images.length > 1 && (
            <div className="absolute top-2 right-2 z-10">
              <Badge
                variant="secondary"
                className="bg-black/60 text-white text-xs"
              >
                {currentIndex + 1} / {images.length}
              </Badge>
            </div>
          )}

          {/* Fullscreen Button */}
          {showFullscreenButton && (
            <button
              onClick={() => setIsFullscreenOpen(true)}
              className="absolute top-2 left-2 z-10 w-8 h-8 p-0 bg-white/80 hover:bg-white shadow-sm rounded-full flex items-center justify-center transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}

          {/* Dot Indicators - Estilo Airbnb Elegante */}
          {showDots && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-[6px] z-10">
              {visibleDots.map((dotIndex) => {
                const isActive = dotIndex === currentIndex;
                const isEdge =
                  totalImages > maxDots &&
                  (dotIndex === visibleDots[0] ||
                    dotIndex === visibleDots[visibleDots.length - 1]);
                const isNotAtEnd =
                  isEdge && dotIndex !== 0 && dotIndex !== totalImages - 1;

                return (
                  <button
                    key={dotIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(dotIndex);
                    }}
                    aria-label={`Ir para imagem ${dotIndex + 1}`}
                    className={cn(
                      'rounded-full transition-all duration-200',
                      isActive
                        ? 'w-[7px] h-[7px] bg-white'
                        : 'w-[6px] h-[6px] bg-white/60 hover:bg-white/80',
                      isNotAtEnd && 'w-[5px] h-[5px] opacity-70',
                    )}
                  />
                );
              })}
            </div>
          )}
        </Carousel>

        <ImageGallery
          isOpen={isFullscreenOpen}
          onClose={() => setIsFullscreenOpen(false)}
          images={images}
          businessName={alt}
          currentIndex={currentIndex}
        />
      </div>
    </>
  );
}
