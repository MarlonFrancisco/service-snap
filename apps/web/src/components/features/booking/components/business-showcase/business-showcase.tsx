'use client';

import { ImageGallery } from '@/components/layout/image-gallery';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { useReviewsStore } from '@/store';
import { formatBusinessHours } from '@/utils/helpers/business-hours.helper';
import {
  Badge,
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@repo/ui';
import {
  Clock,
  Heart,
  Images,
  Instagram,
  MapPinIcon,
  Share,
  Star,
} from 'lucide-react';
import { useBusinessShowcase } from './business-showcase.hook';

export function BusinessShowcase() {
  const { setReviewsAttributesAction } = useReviewsStore();

  const {
    data,
    showAllPhotos,
    selectedImageIndex,
    isFavorite,
    isLoggedIn,
    selectedStore,
    rightSideGalleryImages,
    mainGalleryImage,
    allImages,
    handleImageClick,
    handleShare,
    handleCloseGallery,
    handleSave,
  } = useBusinessShowcase();

  if (!data) {
    return null;
  }

  const {
    businessName,
    businessAddress,
    averageRating,
    reviewCount,
    description,
    amenities,
    openTime,
    closeTime,
    businessDays,
    instagramUrl,
    instagramLabel,
  } = data;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Business Name and Actions */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl text-[#1a2b4c] truncate">
              {businessName}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                <Share className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>

            {isLoggedIn && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg border-gray-300 hover:bg-gray-50"
              >
                {isFavorite ? (
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                Salvar
              </Button>
            )}
          </div>
        </div>

        {/* Images Gallery */}
        <div className="mb-4 md:mb-8 relative">
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-4 gap-1 h-[420px] rounded-xl overflow-hidden">
            {/* Main Image - Left Side */}
            <div className="col-span-2 relative group cursor-pointer overflow-hidden">
              <ImageWithFallback
                src={mainGalleryImage}
                fill
                sizes="(min-width: 768px) 300px, (min-width: 1368px) 500px, (min-width: 1920px) 600px, 150px"
                alt={businessName}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl aspect-square"
                onClick={() => handleImageClick(0)}
              />
            </div>

            {/* Right Side Grid */}
            <div className="col-span-2 grid grid-cols-2 gap-1">
              {rightSideGalleryImages?.map((image: string, index: number) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden"
                  onClick={() => handleImageClick(index + 1)}
                >
                  <ImageWithFallback
                    fill
                    sizes="100px"
                    src={image}
                    alt={`${businessName} - ${index + 2}`}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Image Carousel with Swipe */}
          <div className="md:hidden relative rounded-xl overflow-hidden">
            <Carousel
              className="w-full"
              opts={{
                loop: true,
                align: 'start',
              }}
            >
              <CarouselContent>
                {allImages.map((image: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="relative h-64">
                      <ImageWithFallback
                        width={500}
                        height={256}
                        src={image}
                        alt={`${businessName} - ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleImageClick(index)}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {allImages.length > 1 && (
                <>
                  <CarouselPrevious className="left-2 bg-white/90 hover:bg-white border-0 shadow-lg" />
                  <CarouselNext className="right-2 bg-white/90 hover:bg-white border-0 shadow-lg" />

                  {/* Photo Counter */}
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm pointer-events-none">
                    1 / {allImages.length}
                  </div>

                  {/* View All Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm hover:bg-white"
                    onClick={() => handleImageClick(0)}
                  >
                    <Images className="h-4 w-4 mr-1" />
                    Ver todas
                  </Button>
                </>
              )}
            </Carousel>
          </div>

          {/* Show All Photos Button - Bottom Right (Desktop Only) */}
          {!showAllPhotos && allImages.length > 0 && (
            <Button
              variant="outline"
              className="hidden md:flex absolute bottom-4 right-4 bg-white text-black border-black hover:bg-gray-100 rounded-lg shadow-lg"
              onClick={() => handleImageClick(0)}
            >
              <Images className="h-4 w-4 mr-2" />
              Ver todas ({allImages.length})
            </Button>
          )}
        </div>

        {/* Business Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            <div className="mb-4 md:mb-6">
              <p className="text-gray-600 mb-4">{description}</p>

              {/* Amenities - Above Reviews */}
              {amenities.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-black text-black" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span>·</span>
                <button
                  onClick={() =>
                    setReviewsAttributesAction({
                      storeId: selectedStore?.id,
                      businessName: selectedStore?.name,
                      isOpen: true,
                    })
                  }
                  className="underline cursor-pointer hover:text-gray-700 transition-colors"
                >
                  {reviewCount} avaliações
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Opening Hours */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[#20b2aa]" />
                <h3 className="text-[#1a2b4c]">Horário de Funcionamento</h3>
              </div>
              <p className="text-sm text-gray-600">
                {formatBusinessHours(openTime, closeTime, businessDays)}
              </p>
              <div className="flex items-start gap-2 mt-4 pt-4 border-t border-gray-200">
                <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{businessAddress}</p>
              </div>
              {instagramUrl && instagramLabel ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700 hover:text-gray-900"
                >
                  <Instagram className="h-4 w-4 flex-shrink-0" />
                  {instagramLabel}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Modern Photo Gallery */}
        <ImageGallery
          isOpen={showAllPhotos}
          onClose={handleCloseGallery}
          images={allImages}
          businessName={businessName}
          currentIndex={selectedImageIndex}
        />
      </div>
    </div>
  );
}
