import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { Star } from 'lucide-react';
import { TrackedLink } from '@/components/ui/tracked-link';
import type { TExperienceCard } from '../../homepage.types';
import { ExperienceFavoriteButton } from './experience-favorite-button';

type TExperienceCardConfig = {
  experience: TExperienceCard;
  /** Lista de origem e posição do card, para o evento `select_item`. */
  listName: string;
  index: number;
  priority?: boolean;
};

export const ExperienceCard = ({
  experience,
  listName,
  index,
  priority = false,
}: TExperienceCardConfig) => {
  const bookingHref = `/booking/${experience.id}`;
  const unratedDetails = [experience.location, experience.service]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col">
      <TrackedLink
        href={bookingHref}
        event="select_item"
        properties={{ item_id: experience.id, item_list_name: listName, index }}
        className="absolute inset-0 z-10 rounded-[20px] md:rounded-[22px]"
        aria-label={`Ver ${experience.name}`}
      />
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-[20px] bg-[#e8e7f1] md:rounded-[22px]">
        <ImageWithFallback
          src={experience.image}
          alt={experience.imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 252px"
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 max-w-[calc(100%-4.5rem)] truncate rounded-full bg-[#0B0B0F] px-[11px] py-1.5 text-xs font-semibold text-white md:top-3.5 md:left-3.5 md:px-3">
          {experience.badgeLabel}
        </span>
        <ExperienceFavoriteButton storeId={experience.id} />
      </div>
      <h3 className="mt-3 line-clamp-1 text-base font-bold tracking-[-0.01em] text-[#0B0B0F] md:mt-3.5">
        {experience.name}
      </h3>
      <p className="mt-[3px] line-clamp-1 text-sm text-[#5F5C6E] md:mt-1">
        {experience.rating ? (
          <>
            <Star
              className="mr-1 inline h-3.5 w-3.5 -translate-y-px fill-[#0B0B0F] text-[#0B0B0F]"
              aria-hidden
            />
            <b className="text-[#0B0B0F]">{experience.rating}</b> (
            {experience.reviews}) · {experience.location}
          </>
        ) : (
          unratedDetails
        )}
      </p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-2.5 md:pt-3">
        <span className="min-w-0 text-xs text-[#5F5C6E]">
          A partir de
          <b className="block text-[17px] font-extrabold whitespace-nowrap text-[#0B0B0F]">
            {experience.price}
          </b>
        </span>
        <span className="shrink-0 rounded-full bg-[#0B0B0F] px-5 py-[11px] text-[13px] font-bold text-white">
          Agendar
        </span>
      </div>
    </article>
  );
};
