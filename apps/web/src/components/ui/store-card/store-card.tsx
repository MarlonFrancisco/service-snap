'use client';

import { ImageCarousel } from '@/components/ui/image-carousel';
import { cn } from '@repo/ui/index';
import { Heart, MapPin, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useStoreCardFavorite } from './store-card.hook';
import { StoreCardProps } from './store-card.types';

export function StoreCard({
  store,
  isSelected = false,
  onClick,
  showAvailabilityBadge = true,
  showServiceBadge = true,
}: StoreCardProps) {
  const { isLoggedIn, isFavorite, isAnimating, toggleFavorite } =
    useStoreCardFavorite(store.id);

  const { name, rating, reviewCount, location, price, gallery, services } =
    store;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite();
  };

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.article
      role="button"
      tabIndex={0}
      aria-label={`${name} - ${rating} estrelas, ${reviewCount} avaliações`}
      aria-pressed={isSelected}
      className={cn(
        'group -m-3 cursor-pointer rounded-2xl p-3 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] focus-visible:ring-offset-2',
        isSelected && 'bg-[#F4F4F5]',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-[#e8e7f1]">
        <ImageCarousel
          images={gallery}
          alt={name}
          showCounter={false}
          showFullscreenButton={false}
          rounded={false}
          className="h-full w-full"
          aspectRatio={1}
        />

        {isLoggedIn && (
          <motion.button
            onClick={handleFavorite}
            aria-label={
              isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
            }
            className="absolute top-3 right-3 z-20 rounded-full p-2 transition-transform hover:scale-110 active:scale-95"
            animate={isAnimating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Heart
              className={`h-6 w-6 drop-shadow-md transition-colors ${
                isFavorite
                  ? 'fill-[#EF4444] text-[#EF4444]'
                  : 'fill-black/40 text-white stroke-[1.5]'
              }`}
            />
          </motion.button>
        )}

        {showAvailabilityBadge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[#0A0A0A] shadow-sm backdrop-blur-sm sm:text-xs">
              Disponível hoje
            </span>
          </div>
        )}

        {showServiceBadge && services?.[0] && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="rounded-full bg-[#0A0A0A]/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm sm:text-xs">
              {services[0].name}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm leading-tight font-semibold text-[#0A0A0A]">
            {name}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-sm font-medium text-[#0A0A0A]">{rating}</span>
            <span className="text-sm text-[#71717A]">({reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#71717A]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1 text-sm">{location}</span>
        </div>

        {services && services.length > 1 && (
          <p className="line-clamp-1 text-sm text-[#71717A]">
            {services
              .slice(0, 3)
              .map((s) => s.name)
              .join(' · ')}
            {services.length > 3 && ` +${services.length - 3}`}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            <span className="text-sm font-semibold text-[#0A0A0A]">{price}</span>
            <span className="ml-1 text-sm text-[#71717A]">por serviço</span>
          </div>
          <span className="rounded-lg bg-[#0A0A0A] px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 md:inline-flex">
            Agendar
          </span>
        </div>
      </div>
    </motion.article>
  );
};
