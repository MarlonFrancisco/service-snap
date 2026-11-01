'use client';

import { cn } from '@repo/ui';
import { Heart } from 'lucide-react';
import { useState } from 'react';

export const ExperienceFavoriteButton = () => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <button
      type="button"
      aria-label={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
      aria-pressed={isFavorite}
      onClick={() => setIsFavorite((current) => !current)}
      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#2B2B2B] shadow backdrop-blur-md transition-colors hover:text-[#EF4444]"
    >
      <Heart
        className={cn(
          'h-[18px] w-[18px]',
          isFavorite && 'fill-[#EF4444] text-[#EF4444]',
        )}
      />
    </button>
  );
};
