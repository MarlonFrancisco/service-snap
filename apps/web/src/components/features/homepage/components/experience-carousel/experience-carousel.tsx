'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@repo/ui';
import Link from 'next/link';
import type { TExperienceCard } from '../../homepage.types';
import { ExperienceCard } from '../experience-card';

const SLIDE_BASIS = 'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-[14.2857%]';

const arrowClassName =
  'static top-auto right-auto left-auto translate-x-0 translate-y-0';

type TExperienceCarouselConfig = {
  title: string;
  seeAllHref: string;
  items: TExperienceCard[];
};

export const ExperienceCarousel = ({
  title,
  seeAllHref,
  items,
}: TExperienceCarouselConfig) => {
  return (
    <section className="mx-auto w-full max-w-[90rem] px-6 py-6 lg:px-12">
      <Carousel
        opts={{
          align: 'start',
          slidesToScroll: 'auto',
          containScroll: 'trimSnaps',
        }}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-[#0A0A0A] sm:text-2xl">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <Link
              href={seeAllHref}
              className="mr-1 hidden text-sm font-semibold text-[#0A0A0A] hover:text-[#2B2B2B] sm:inline"
            >
              Ver todos
            </Link>
            <CarouselPrevious className={arrowClassName} />
            <CarouselNext className={arrowClassName} />
          </div>
        </div>
        <CarouselContent>
          {items.map((experience) => (
            <CarouselItem key={experience.id} className={SLIDE_BASIS}>
              <ExperienceCard experience={experience} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};
