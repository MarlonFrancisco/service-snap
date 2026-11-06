'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  cn,
} from '@repo/ui';
import { TrackedLink } from '@/components/ui/tracked-link';
import type { TExperienceCard } from '../../homepage.types';
import { ExperienceCard } from '../experience-card';
import {
  EXPERIENCE_SLIDE_CLASS,
  EXPERIENCE_TRACK_CLASS,
} from './experience-carousel.constants';

const arrowClassName =
  'static top-auto right-auto left-auto hidden size-9 translate-x-0 translate-y-0 border-[#E3E1EA] bg-white md:inline-flex';

type TExperienceCarouselConfig = {
  /** Identificador estável da lista nos eventos de analytics. */
  listName: string;
  title: string;
  seeAllHref: string;
  items: TExperienceCard[];
  priorityFirstImage?: boolean;
};

export const ExperienceCarousel = ({
  listName,
  title,
  seeAllHref,
  items,
  priorityFirstImage = false,
}: TExperienceCarouselConfig) => {
  return (
    <section className="mx-auto w-full max-w-[82.5rem] pt-9 md:px-10 md:pt-14">
      <Carousel
        opts={{
          align: 'start',
          slidesToScroll: 'auto',
          containScroll: 'trimSnaps',
        }}
      >
        <div className="mb-4 flex items-baseline justify-between gap-3 px-5 md:mb-[22px] md:items-center md:px-0">
          <h2 className="min-w-0 flex-1 text-xl font-bold tracking-[-0.02em] text-[#0B0B0F] md:text-2xl md:tracking-[-0.025em]">
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-3">
            <TrackedLink
              href={seeAllHref}
              event="select_content"
              properties={{
                content_type: 'see_all',
                item_id: listName,
                destination: seeAllHref,
              }}
              className="text-[13px] font-semibold text-[#0B0B0F] underline md:text-sm md:no-underline md:hover:underline"
            >
              Ver todos
            </TrackedLink>
            <CarouselPrevious className={arrowClassName} />
            <CarouselNext className={arrowClassName} />
          </div>
        </div>
        <CarouselContent className={EXPERIENCE_TRACK_CLASS}>
          {items.map((experience, index) => (
            <CarouselItem
              key={experience.id}
              className={cn(EXPERIENCE_SLIDE_CLASS, 'flex')}
            >
              <div className="h-full min-h-0 w-full min-w-0">
                <ExperienceCard
                  experience={experience}
                  listName={listName}
                  index={index}
                  priority={priorityFirstImage && index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};
