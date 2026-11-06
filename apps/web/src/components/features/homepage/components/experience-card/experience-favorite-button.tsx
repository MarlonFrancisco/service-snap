'use client';

import { useStoreCardFavorite } from '@/components/ui/store-card/store-card.hook';
import { useAuthStore } from '@/store/auth/auth.store';
import { cn } from '@repo/ui';
import { Heart } from 'lucide-react';
import type { MouseEvent } from 'react';

type TExperienceFavoriteButtonConfig = {
  storeId: string;
};

export const ExperienceFavoriteButton = ({
  storeId,
}: TExperienceFavoriteButtonConfig) => {
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const { isLoggedIn, isFavorite, isAnimating, toggleFavorite } =
    useStoreCardFavorite(storeId, 'home_card');

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      openAuthAction({ source: 'favorite' });
      return;
    }

    toggleFavorite();
  };

  return (
    <button
      type="button"
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
      aria-pressed={isFavorite}
      onClick={handleClick}
      className="absolute top-1.5 right-1.5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-[#0B0B0F] transition-colors active:scale-95 hover:text-[#EF4444] md:top-2 md:right-2"
    >
      <Heart
        className={cn(
          'h-[22px] w-[22px] transition-transform',
          isFavorite && 'fill-[#EF4444] text-[#EF4444]',
          isAnimating && 'scale-125',
        )}
      />
    </button>
  );
};
