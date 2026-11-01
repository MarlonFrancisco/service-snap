'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  cn,
} from '@repo/ui';
import Link from 'next/link';
import type { TExperienceCard } from '../../homepage.types';
import { ExperienceCard } from '../experience-card';

/**
 * Larguras com peek do próximo card:
 * mobile ~1.2 | sm ~2.1 | md ~3.1 | lg ~5.2 | xl ~7
 * Gap controlado via pl/-ml (sobrescreve o pl-4 padrão do CarouselItem).
 */
const SLIDE_BASIS =
  'basis-[82%] sm:basis-[46%] md:basis-[31%] lg:basis-[19%] xl:basis-[14.2857%]';

const arrowClassName =
  'static top-auto right-auto left-auto hidden size-8 translate-x-0 translate-y-0 sm:inline-flex';

type TExperienceCarouselConfig = {
  title: string;
  seeAllHref: string;
  items: TExperienceCard[];
  priorityFirstImage?: boolean;
};

export const ExperienceCarousel = ({
  title,
  seeAllHref,
  items,
  priorityFirstImage = false,
}: TExperienceCarouselConfig) => {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-12">
      <Carousel
        opts={{
          align: 'start',
          slidesToScroll: 'auto',
          containScroll: 'trimSnaps',
        }}
      >
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4 sm:items-center">
          <h2 className="min-w-0 flex-1 text-lg font-semibold tracking-tight text-[#0A0A0A] sm:text-xl md:text-2xl">
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={seeAllHref}
              className="text-xs font-semibold text-[#0A0A0A] active:opacity-70 sm:mr-1 sm:text-sm sm:hover:text-[#2B2B2B]"
            >
              Ver todos
            </Link>
            <CarouselPrevious className={arrowClassName} />
            <CarouselNext className={arrowClassName} />
          </div>
        </div>
        <CarouselContent className="-ml-3 items-stretch py-3 sm:-ml-4 lg:-ml-5">
          {items.map((experience, index) => (
            <CarouselItem
              key={experience.id}
              className={cn(SLIDE_BASIS, 'flex pl-3 sm:pl-4 lg:pl-5')}
            >
              <div className="h-full min-h-0 w-full min-w-0">
                <ExperienceCard
                  experience={experience}
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
