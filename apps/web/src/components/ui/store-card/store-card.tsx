'use client';

import { ImageCarousel } from '@/components/ui/image-carousel';
import { useAuthStore } from '@/store/auth/auth.store';
import { formatRating } from '@/utils/helpers/search.helper';
import { cn } from '@repo/ui/index';
import { Heart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useStoreCardFavorite } from './store-card.hook';
import { StoreCardProps } from './store-card.types';

export function StoreCard({
  store,
  isSelected = false,
  onClick,
  showAvailabilityBadge = true,
  showServiceBadge = true,
  imageAspectRatio = 1,
}: StoreCardProps) {
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const { isLoggedIn, isFavorite, isAnimating, toggleFavorite } =
    useStoreCardFavorite(store.id);

  const { id, name, rating, reviewCount, location, averagePrice, gallery } =
    store;
  const services = store.services ?? [];
  const serviceNames = services
    .slice(0, 2)
    .map((service) => service.name)
    .join(' · ');
  const hasReviews = reviewCount > 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      openAuthAction({ source: 'favorite' });
      return;
    }

    toggleFavorite();
  };

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.article
      role="button"
      tabIndex={0}
      aria-label={
        hasReviews
          ? `${name} - ${formatRating(rating)} estrelas, ${reviewCount} avaliações`
          : `${name} - novo, sem avaliações`
      }
      aria-pressed={isSelected}
      className={cn(
        'group flex h-full cursor-pointer flex-col rounded-[26px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B0B0F] focus-visible:ring-offset-8',
        isSelected && 'md:outline-2 md:outline-offset-8 md:outline-[#0B0B0F]',
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-hidden rounded-[20px] bg-[#e8e7f1] md:rounded-[22px]">
        <ImageCarousel
          images={gallery}
          alt={name}
          showCounter={false}
          showFullscreenButton={false}
          rounded={false}
          className="h-full w-full"
          aspectRatio={imageAspectRatio}
        />

        <motion.button
          type="button"
          onClick={handleFavorite}
          aria-label={
            isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
          }
          aria-pressed={isFavorite}
          className="absolute top-1.5 right-1.5 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/92 text-[#0B0B0F] md:top-2 md:right-2"
          animate={isAnimating ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Heart
            className={cn(
              'h-[22px] w-[22px] transition-colors',
              isFavorite && 'fill-[#EF4444] text-[#EF4444]',
            )}
          />
        </motion.button>

        {showAvailabilityBadge && (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white px-[11px] py-1.5 text-xs font-bold text-[#0B0B0F] md:top-3.5 md:left-3.5 md:px-3">
            <span
              aria-hidden
              className="h-[7px] w-[7px] rounded-full bg-[#0A7D4F]"
            />
            Disponível hoje
          </span>
        )}

        {showServiceBadge && services[0] && (
          <span className="absolute bottom-3 left-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-[#0B0B0F] px-[11px] py-1.5 text-xs font-semibold text-white md:bottom-3.5 md:left-3.5 md:px-3">
            {services[0].name}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-2 md:mt-3.5">
        <h3 className="line-clamp-1 text-base font-bold text-[#0B0B0F]">
          {name}
        </h3>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#0B0B0F]">
          {hasReviews ? (
            <>
              <Star className="h-3.5 w-3.5 fill-[#0B0B0F]" aria-hidden />
              {formatRating(rating)} ({reviewCount})
            </>
          ) : (
            'Novo'
          )}
        </span>
      </div>

      <p className="mt-[3px] line-clamp-1 text-sm text-[#5F5C6E] md:hidden">
        {[location, serviceNames].filter(Boolean).join(' · ')}
      </p>
      <p className="mt-[3px] hidden truncate text-sm text-[#5F5C6E] md:block">
        {location}
      </p>
      {serviceNames && (
        <p className="mt-[3px] hidden truncate text-sm text-[#5F5C6E] md:block">
          {serviceNames}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 text-[13px] text-[#5F5C6E] md:pt-3">
        {averagePrice ? (
          <span className="min-w-0">
            <b className="text-base font-extrabold text-[#0B0B0F]">
              {averagePrice}
            </b>{' '}
            média
          </span>
        ) : (
          <b className="text-base font-extrabold text-[#0B0B0F]">A consultar</b>
        )}
        <Link
          href={`/booking/${id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 rounded-full bg-[#0B0B0F] px-5 py-[11px] text-[13px] font-bold text-white transition-colors hover:bg-[#2B2B2B]"
        >
          Agendar
        </Link>
      </div>
    </motion.article>
  );
}
