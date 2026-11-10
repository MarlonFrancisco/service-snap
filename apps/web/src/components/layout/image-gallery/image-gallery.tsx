'use client';

import {
  Button,
  Carousel,
  CarouselContent,
  CarouselItem,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui';
import { resolveStoreImageSrc } from '@/components/ui/image-with-fallback/image-with-fallback.helpers';
import {
  Download,
  Grid3X3,
  Heart,
  RotateCcw,
  Share,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import { useImageGallery } from './image-gallery.hook';
import type { TImageGalleryConfig } from './image-gallery.types';
import { useGalleryControls } from './use-gallery-controls.hook';

export const ImageGallery = ({
  isOpen,
  onClose,
  images,
  businessName,
  currentIndex = 0,
}: TImageGalleryConfig) => {
  const {
    activeIndex,
    isLoading: isImageLoading,
    goToNext,
    goToPrevious,
    goToIndex,
    handleImageLoad,
    setCarouselApi,
  } = useImageGallery({
    images,
    initialIndex: currentIndex,
  });

  const {
    showThumbnails,
    zoom,
    setShowThumbnails,
    handleShare,
    handleDownload,
    handleZoomIn,
    handleZoomOut,
    resetZoom,
    handleDoubleClick,
  } = useGalleryControls({
    businessName,
    images,
    activeIndex,
    isOpen,
    goToNext,
    goToPrevious,
    onClose,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[95vw] w-full h-[85vh] sm:h-[80vh] p-0 border-0 bg-black/95 backdrop-blur-md [&>button]:hidden">
        <DialogTitle className="sr-only">
          Galeria de Imagens - {businessName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Navegue pelas {images.length} fotos de {businessName}. Use as setas do
          teclado para navegar.
        </DialogDescription>
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex-shrink-0"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="text-white min-w-0">
                  <h2 className="font-semibold text-sm sm:text-lg truncate">
                    {businessName}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/70">
                    {activeIndex + 1} de {images.length} fotos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Zoom Controls - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-xl p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-white text-sm min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetZoom}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare()}
                    className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  >
                    <Share className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="hidden sm:flex h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Carousel Area */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 w-full">
            <Carousel
              className="w-full"
              opts={{
                align: 'center',
                loop: true,
                startIndex: currentIndex,
              }}
              setApi={setCarouselApi}
            >
              <CarouselContent className="h-full -ml-0">
                {images.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-0 basis-full flex items-center justify-center"
                  >
                    <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-8 py-16 sm:py-20">
                      {isImageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                          <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                              <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-r-white/50 rounded-full animate-spin animate-reverse"></div>
                            </div>
                            <div className="text-center">
                              <p className="text-white/90 text-sm font-medium">
                                Carregando imagem...
                              </p>
                              <p className="text-white/60 text-xs mt-1">
                                {index + 1} de {images.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <Image
                        width={800}
                        height={800}
                        src={resolveStoreImageSrc(image)}
                        alt={`${businessName} - Foto ${index + 1}`}
                        className="w-auto h-auto max-w-full max-h-[calc(85vh-12rem)] sm:max-h-[calc(80vh-12rem)] object-contain transition-all duration-500 ease-out"
                        style={{
                          transform: `scale(${zoom})`,
                          cursor: zoom > 1 ? 'grab' : 'default',
                          transition: 'transform 0.3s ease-out',
                        }}
                        onLoad={handleImageLoad}
                        onDoubleClick={handleDoubleClick}
                        draggable={false}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Bottom Thumbnails */}
          {showThumbnails && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 sm:p-6">
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 justify-center">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className={`
                      flex-shrink-0 w-16 h-12 sm:w-24 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden border-2 sm:border-3 transition-all duration-200
                      ${
                        index === activeIndex
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-white/40 hover:border-white/70 hover:scale-105'
                      }
                    `}
                  >
                    <Image
                      width={100}
                      height={60}
                      src={resolveStoreImageSrc(image)}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Counter Dots */}
          {images.length > 1 && !showThumbnails && (
            <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-40">
              <div className="flex gap-1.5 sm:gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToIndex(index)}
                    className={`
                      w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200
                      ${
                        index === activeIndex
                          ? 'bg-white scale-125'
                          : 'bg-white/50 hover:bg-white/75 hover:scale-110'
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
