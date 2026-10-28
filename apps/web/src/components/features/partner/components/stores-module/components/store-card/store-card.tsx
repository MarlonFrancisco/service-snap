'use client';
import { StorePublicPresence } from '@/components/features/partner/components/stores-module/components/store-public-presence';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { orderGalleryByMainImage } from '@/utils/helpers/gallery.helper';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  useIsMobile,
} from '@repo/ui';
import {
  ChevronRight,
  Clock,
  Edit,
  Images,
  MapPin,
  Pause,
  Phone,
  Play,
  Trash2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { useStoreCard } from './store-card.hook';
import { StoreCardSkeleton } from './store-card.skeleton';
import type { TStoreCardConfig } from './store-card.types';

export const StoreCard = ({ store, index }: TStoreCardConfig) => {
  const isMobile = useIsMobile();
  const {
    isLoading,
    handleEditStore,
    handleToggleStatus,
    handleDeleteStore,
    handleViewDetails,
  } = useStoreCard(store);

  const orderedGallery = useMemo(
    () => orderGalleryByMainImage(store.gallery || []),
    [store.gallery],
  );

  if (isLoading) return <StoreCardSkeleton />;

  return (
    <motion.div
      key={store.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Card
        className={`py-0 relative overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 ${
          !store.isActive ? 'opacity-60' : ''
        }`}
      >
        {/* Mobile Layout */}
        {isMobile && (
          <div className="lg:hidden">
            {/* Store Image */}
            <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageWithFallback
                src={
                  orderedGallery[0]?.url
                    ? `https://qwprndmtjhwgmtngiwjg.supabase.co/storage/v1/object/public/stores/${orderedGallery[0].url}`
                    : ''
                }
                alt={`Foto da ${store.name}`}
                fill
                sizes="(min-width: 728px) 320px, 140px"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Quick Actions */}
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditStore}
                  className="h-9 w-9 p-0 bg-white/95 hover:bg-white backdrop-blur-sm shadow-lg border border-gray-200/50 transition-all"
                >
                  <Edit className="h-4 w-4 text-gray-700" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleToggleStatus}
                  className={`h-9 w-9 p-0 backdrop-blur-sm shadow-lg border transition-all ${
                    store.isActive
                      ? 'bg-white/95 hover:bg-white border-gray-200/50'
                      : 'bg-green-500/95 hover:bg-green-500 border-green-400/50'
                  }`}
                >
                  {store.isActive ? (
                    <Pause className="h-4 w-4 text-gray-700" />
                  ) : (
                    <Play className="h-4 w-4 text-white" />
                  )}
                </Button>
              </div>

              {/* Status & Info Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <Badge
                  className={`shadow-md ${
                    store.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {store.isActive ? 'Ativa' : 'Pausada'}
                </Badge>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                {orderedGallery && orderedGallery.length > 1 && (
                  <Badge className="bg-black/70 text-white border-white/20 backdrop-blur-sm shadow-md text-xs">
                    <Images className="h-3 w-3 mr-1" />
                    {orderedGallery.length}
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="pb-3 pt-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-gray-900 text-base mb-1 truncate">
                    {store.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {store.city} - {store.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{store.telephone}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-gray-300 hover:bg-gray-50"
                  onClick={handleViewDetails}
                >
                  Ver mais detalhes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </div>
        )}

        {/* Desktop Layout */}
        {!isMobile && (
          <div className="hidden lg:flex">
            {/* Store Image - Left Side */}
            <div className="relative w-80 shrink-0 bg-gradient-to-br from-gray-100 to-gray-200">
              {orderedGallery.length > 0 ? (
                <Carousel>
                  <CarouselContent>
                    {orderedGallery.map((image) => (
                      <CarouselItem key={image.id}>
                        <div className="relative w-full min-h-[320px]">
                          <ImageWithFallback
                            src={`https://qwprndmtjhwgmtngiwjg.supabase.co/storage/v1/object/public/stores/${image.url}`}
                            alt={`Foto da ${store.name}`}
                            fill
                            sizes="(min-width: 728px) 320px, 240px"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              ) : (
                <ImageWithFallback
                  src={orderedGallery[0]?.url || ''}
                  useFallback
                  alt={`Foto da ${store.name}`}
                  fill
                  sizes="(min-width: 728px) 320px, 240px"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Status & Info Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <Badge
                  className={`shadow-md ${
                    store.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {store.isActive ? 'Ativa' : 'Pausada'}
                </Badge>
              </div>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
                {orderedGallery && orderedGallery.length > 1 && (
                  <Badge className="bg-black/70 text-white border-white/20 backdrop-blur-sm shadow-md text-xs">
                    <Images className="h-3 w-3 mr-1" />
                    {orderedGallery.length}
                  </Badge>
                )}
              </div>
            </div>

            {/* Store Content - Right Side */}
            <div className="flex-1 flex flex-col min-w-0 py-3 justify-center h-full">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-gray-900 text-xl mb-1.5">
                      {store.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {store.description}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditStore}
                      className="h-9 px-3 border-gray-300 hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-1.5" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleToggleStatus}
                      className={`h-9 px-3 ${
                        store.isActive
                          ? 'border-gray-300 hover:bg-gray-50'
                          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {store.isActive ? (
                        <>
                          <Pause className="h-4 w-4 mr-1.5" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1.5" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Contact Info Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <MapPin className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Endereço</p>
                      <p className="text-sm text-gray-900 leading-snug truncate">
                        {store.address}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {store.city} - {store.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Clock className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">Horário</p>
                      <p className="text-sm text-gray-900 leading-snug">
                        horários variados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Phone className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 mb-0.5">Telefone</p>
                      <p className="text-sm text-gray-900">{store.telephone}</p>
                    </div>
                  </div>
                </div>

                <StorePublicPresence
                  storeId={store.id}
                  instagram={store.instagram}
                />

                {/* Amenities */}
                {store.amenities && store.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {store.amenities.slice(0, 4).map((amenity, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs border-gray-300 bg-white"
                      >
                        {amenity}
                      </Badge>
                    ))}
                    {store.amenities.length > 4 && (
                      <Badge
                        variant="outline"
                        className="text-xs border-gray-300 bg-white"
                      >
                        +{store.amenities.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Delete Action */}
                <div className="pt-2 border-t border-gray-200">
                  <AlertDialog>
                    <AlertDialogTrigger className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-3">
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Excluir Loja
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Loja</AlertDialogTitle>
                        <AlertDialogDescription>
                          Você tem certeza que deseja excluir esta loja?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteStore}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
