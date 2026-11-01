import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { cn } from '@repo/ui';
import { BadgeCheck, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import type { TExperienceBadgeTone, TExperienceCard } from '../../homepage.types';
import { ExperienceFavoriteButton } from './experience-favorite-button';

const badgeClassName: Record<TExperienceBadgeTone, string> = {
  success: 'bg-[#10B981]',
  primary: 'bg-[#0A0A0A]',
  verified: 'bg-[#0A0A0A]',
};

type TExperienceCardConfig = {
  experience: TExperienceCard;
};

export const ExperienceCard = ({ experience }: TExperienceCardConfig) => {
  const BadgeIcon = experience.badgeTone === 'success' ? Zap : BadgeCheck;
  const bookingHref = `/booking/${experience.id}`;

  return (
    <article className="group relative flex h-full w-full min-w-0 flex-col rounded-2xl bg-white shadow-sm transition-all duration-300 active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-xl">
      <Link
        href={bookingHref}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`Ver ${experience.name}`}
      />
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-t-2xl bg-[#e8e7f1]">
        <ImageWithFallback
          src={experience.image}
          alt={experience.imageAlt}
          fill
          sizes="(min-width: 1024px) 14vw, (min-width: 640px) 33vw, 80vw"
          className="object-cover transition-transform duration-500 md:group-hover:scale-105"
        />
        <div
          className={cn(
            'absolute top-3 left-3 z-20 flex max-w-[calc(100%-2.75rem)] items-center gap-1 rounded-full px-2 py-1 text-[10px] leading-none text-white shadow-md',
            badgeClassName[experience.badgeTone],
          )}
        >
          <BadgeIcon className="h-3 w-3 shrink-0" />
          <span className="truncate">{experience.badgeLabel}</span>
        </div>
        <ExperienceFavoriteButton storeId={experience.id} />
      </div>
      <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-2 rounded-b-2xl p-3">
        <div className="min-h-0">
          <h3 className="line-clamp-1 text-sm font-semibold text-[#0A0A0A]">
            {experience.name}
          </h3>
          <div className="mt-1 flex items-center gap-0.5 text-[#0A0A0A]">
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            <span className="text-xs font-semibold">{experience.rating}</span>
            <span className="text-[10px] text-[#71717A]">
              ({experience.reviews})
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-[#71717A]">
            {experience.location}
          </p>
          <p className="mt-1 line-clamp-1 min-h-4 text-xs text-[#2B2B2B]">
            {experience.service}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <span className="block text-[10px] text-[#71717A]">A partir de</span>
            <span className="block text-sm font-semibold whitespace-nowrap text-[#0A0A0A]">
              {experience.price}
            </span>
          </div>
          <span className="relative z-20 shrink-0 rounded-lg bg-[#0A0A0A] px-2.5 py-1.5 text-xs font-semibold text-white pointer-events-none">
            Agendar
          </span>
        </div>
      </div>
    </article>
  );
};
