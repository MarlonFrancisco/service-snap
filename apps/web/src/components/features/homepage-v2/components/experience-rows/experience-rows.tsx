'use client';

import { ExperienceCarousel } from '../experience-carousel';
import { ExperienceCarouselSkeleton } from '../experience-carousel/experience-carousel-skeleton';
import { useExperienceRows } from './experience-rows.hook';

export const ExperienceRows = () => {
  const { rows } = useExperienceRows();

  return (
    <>
      {rows.map((row) => {
        if (row.isPending) {
          return (
            <ExperienceCarouselSkeleton key={row.id} title={row.title} />
          );
        }

        if (!row.items.length) {
          return null;
        }

        return <ExperienceCarousel key={row.id} row={row} />;
      })}
    </>
  );
};
