'use client';

import { ImageGallery } from '@/components/layout/image-gallery';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useReviewsStore } from '@/store';
import { formatRating } from '@/utils/helpers/search.helper';
import { Carousel, CarouselContent, CarouselItem, cn } from '@repo/ui';
import { Heart, Share, Star } from 'lucide-react';
import { useBusinessShowcase } from './business-showcase.hook';

const HEADER_ACTION_CLASS =
  'flex h-11 items-center gap-2 rounded-full border border-[#E3E1EA] bg-white px-[18px] text-sm font-semibold text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7]';
const PHOTO_ACTION_CLASS =
  'grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[#0B0B0F]';
const GALLERY_TILE_CLASS =
  'group relative h-full w-full overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white disabled:cursor-default';
const GALLERY_IMAGE_CLASS =
  'object-cover transition-transform duration-300 group-enabled:group-hover:scale-105';

export function BusinessShowcase() {
  const { setReviewsAttributesAction } = useReviewsStore();

  const {
    data,
    showAllPhotos,
    selectedImageIndex,
    visibleImageIndex,
    isFavorite,
    isLoggedIn,
    selectedStore,
    rightSideGalleryImages,
    mainGalleryImage,
    allImages,
    handleCarouselApi,
    handleImageClick,
    handleShare,
    handleCloseGallery,
    handleSave,
  } = useBusinessShowcase();

  if (!data) {
    return null;
  }

  const { businessName, businessLocation, averageRating, reviewCount } = data;
  const mobileImages = allImages.length > 0 ? allImages : [''];
  const favoriteIcon = (
    <Heart
      className={cn('h-4 w-4', isFavorite && 'fill-[#EF4444] text-[#EF4444]')}
      aria-hidden
    />
  );

  return (
    <div className="mx-auto -mt-4 w-full max-w-[82.5rem] md:mt-0 md:px-10">
      <div className="flex flex-col">
        {/* Título e ações */}
        <div className="order-2 flex flex-wrap items-end justify-between gap-6 px-5 pt-5 md:order-1 md:px-0 md:pt-4">
          <div className="min-w-0">
            <h1 className="text-[26px] font-extrabold tracking-[-0.03em] text-[#0B0B0F] md:text-4xl">
              {businessName}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-1 text-sm text-[#5F5C6E] md:text-[15px]">
              {reviewCount > 0 ? (
                <b className="flex items-center gap-1 font-bold text-[#0B0B0F]">
                  <Star className="h-3.5 w-3.5 fill-[#0B0B0F]" aria-hidden />
                  {formatRating(averageRating)}
                </b>
              ) : (
                <b className="font-bold text-[#0B0B0F]">Novo</b>
              )}
              <span aria-hidden>·</span>
              <button
                type="button"
                onClick={() =>
                  setReviewsAttributesAction({
                    storeId: selectedStore?.id,
                    businessName: selectedStore?.name,
                    isOpen: true,
                  })
                }
                className="underline transition-colors hover:text-[#0B0B0F]"
              >
                {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
              </button>
              <span aria-hidden>·</span>
              <span>{businessLocation}</span>
            </p>
          </div>

          <div className="hidden gap-2.5 md:flex">
            <button
              type="button"
              onClick={handleShare}
              className={HEADER_ACTION_CLASS}
            >
              Compartilhar
            </button>

            {isLoggedIn && (
              <button
                type="button"
                onClick={handleSave}
                aria-pressed={isFavorite}
                className={HEADER_ACTION_CLASS}
              >
                {favoriteIcon}
                Salvar
              </button>
            )}
          </div>
        </div>

        {/* Galeria */}
        <div className="relative order-1 md:order-2 md:mt-6">
          {/* Desktop: grade */}
          <div
            role="group"
            aria-label="Galeria de fotos"
            className="hidden grid-cols-[2fr_1fr_1fr] grid-rows-[220px_220px] gap-2 overflow-hidden rounded-[28px] bg-[#F4F3F7] md:grid"
          >
            <div className="row-span-2">
              <button
                type="button"
                disabled={!mainGalleryImage}
                onClick={() => handleImageClick(0)}
                aria-label={`Abrir foto 1 de ${businessName}`}
                className={GALLERY_TILE_CLASS}
              >
                <ImageWithFallback
                  src={mainGalleryImage}
                  fill
                  priority
                  sizes="(min-width: 1320px) 620px, 50vw"
                  alt={businessName}
                  className={GALLERY_IMAGE_CLASS}
                />
              </button>
            </div>

            {rightSideGalleryImages.map((image: string, index: number) => (
              <button
                key={index}
                type="button"
                disabled={!image}
                onClick={() => handleImageClick(index + 1)}
                aria-label={`Abrir foto ${index + 2} de ${businessName}`}
                className={GALLERY_TILE_CLASS}
              >
                <ImageWithFallback
                  fill
                  sizes="(min-width: 1320px) 310px, 25vw"
                  src={image}
                  alt={`${businessName} - ${index + 2}`}
                  className={GALLERY_IMAGE_CLASS}
                />
              </button>
            ))}
          </div>

          {/* Mobile: foto de ponta a ponta com deslize */}
          <div
            role="group"
            aria-label="Galeria de fotos"
            className="relative md:hidden"
          >
            <Carousel
              className="w-full"
              opts={{ loop: mobileImages.length > 1, align: 'start' }}
              setApi={handleCarouselApi}
            >
              <CarouselContent className="ml-0">
                {mobileImages.map((image: string, index: number) => (
                  <CarouselItem key={index} className="pl-0">
                    <button
                      type="button"
                      disabled={!image}
                      onClick={() => handleImageClick(index)}
                      aria-label={`Abrir foto ${index + 1} de ${businessName}`}
                      className="relative block aspect-[4/3] w-full bg-[#F4F3F7]"
                    >
                      <ImageWithFallback
                        fill
                        sizes="100vw"
                        priority={index === 0}
                        src={image}
                        alt={`${businessName} - ${index + 1}`}
                        className="object-cover"
                      />
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Compartilhar"
                className={PHOTO_ACTION_CLASS}
              >
                <Share className="h-[18px] w-[18px]" aria-hidden />
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={handleSave}
                  aria-label={
                    isFavorite
                      ? 'Remover dos favoritos'
                      : 'Salvar nos favoritos'
                  }
                  aria-pressed={isFavorite}
                  className={PHOTO_ACTION_CLASS}
                >
                  {favoriteIcon}
                </button>
              )}
            </div>

            {allImages.length > 1 && (
              <span className="pointer-events-none absolute right-3.5 bottom-3.5 grid h-8 place-items-center rounded-full bg-[#0B0B0F]/70 px-3 text-xs font-semibold text-white">
                {visibleImageIndex + 1} / {allImages.length}
              </span>
            )}
          </div>

          {!showAllPhotos && allImages.length > 0 && (
            <button
              type="button"
              onClick={() => handleImageClick(0)}
              className="absolute right-4 bottom-4 hidden h-11 rounded-full bg-white px-[18px] text-[13px] font-bold text-[#0B0B0F] transition-colors hover:bg-[#F4F3F7] md:block"
            >
              Ver todas ({allImages.length})
            </button>
          )}
        </div>
      </div>

      <ImageGallery
        isOpen={showAllPhotos}
        onClose={handleCloseGallery}
        images={allImages}
        businessName={businessName}
        currentIndex={selectedImageIndex}
      />
    </div>
  );
}
