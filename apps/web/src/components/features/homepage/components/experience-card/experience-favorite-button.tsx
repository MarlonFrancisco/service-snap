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
    useStoreCardFavorite(storeId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      openAuthAction({});
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
      className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#2B2B2B] shadow backdrop-blur-md transition-colors active:scale-95 hover:text-[#EF4444]"
    >
      <Heart
        className={cn(
          'h-[18px] w-[18px] transition-transform',
          isFavorite && 'fill-[#EF4444] text-[#EF4444]',
          isAnimating && 'scale-125',
        )}
      />
    </button>
  );
};
