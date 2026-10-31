import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import type { TExperienceCard } from '../../homepage-v2.types';

export const useExperienceCard = (experience: TExperienceCard) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = useCallback(() => {
    setIsFavorite((current) => !current);
  }, []);

  const schedule = useCallback(() => {
    router.push(`/booking/${experience.id}`);
  }, [experience.id, router]);

  return { isFavorite, toggleFavorite, schedule };
};
