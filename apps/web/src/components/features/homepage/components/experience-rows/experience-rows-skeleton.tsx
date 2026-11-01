import { EXPERIENCE_ROW_CONFIGS } from '../../homepage.mock';
import { ExperienceCarouselSkeleton } from '../experience-carousel/experience-carousel-skeleton';

export const ExperienceRowsSkeleton = () => {
  return (
    <>
      {EXPERIENCE_ROW_CONFIGS.map((row) => (
        <ExperienceCarouselSkeleton key={row.id} title={row.title} />
      ))}
    </>
  );
};
