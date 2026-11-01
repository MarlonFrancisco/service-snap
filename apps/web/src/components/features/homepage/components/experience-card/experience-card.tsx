import { cn } from '@repo/ui';
import { BadgeCheck, Star, Zap } from 'lucide-react';
import Image from 'next/image';
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
  const isPlaceholder = experience.image.endsWith('.svg');

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square w-full overflow-hidden bg-[#e8e7f1]">
        <Image
          src={experience.image}
          alt={experience.imageAlt}
          fill
          sizes="(min-width: 1024px) 14vw, (min-width: 640px) 33vw, 50vw"
          unoptimized={isPlaceholder}
          className={
            isPlaceholder
              ? 'object-contain p-8 opacity-40'
              : 'object-cover transition-transform duration-500 group-hover:scale-105'
          }
        />
        <div
          className={cn(
            'absolute top-3 left-3 flex max-w-[calc(100%-2.75rem)] items-center gap-1 rounded-full px-2 py-1 text-[10px] leading-none text-white shadow-md',
            badgeClassName[experience.badgeTone],
          )}
        >
          <BadgeIcon className="h-3 w-3 shrink-0" />
          <span className="truncate">{experience.badgeLabel}</span>
        </div>
        <ExperienceFavoriteButton />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
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
          <p className="mt-1 line-clamp-2 text-xs text-[#2B2B2B]">
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
          <Link
            href={`/booking/${experience.id}`}
            className="shrink-0 rounded-lg bg-[#F4F4F5] px-2 py-1 text-xs font-semibold text-[#0A0A0A] transition-colors hover:bg-[#0A0A0A] hover:text-white"
          >
            Agendar
          </Link>
        </div>
      </div>
    </article>
  );
};
