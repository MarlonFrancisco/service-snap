import { cn } from '@repo/ui';
import Link from 'next/link';
import { PROFILE_ACTION_PRIMARY_CLASS } from '../../profile.styles';
import type { TProfileEmptyStateConfig } from './profile-empty-state.types';

export const ProfileEmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
}: TProfileEmptyStateConfig) => {
  return (
    <section className="flex flex-col items-center rounded-[22px] border border-[#E3E1EA] px-6 py-12 text-center md:rounded-3xl">
      <span className="grid size-14 place-items-center rounded-full bg-[#F4F3F7]">
        <Icon className="size-6" strokeWidth={1.7} aria-hidden />
      </span>
      <h2 className="mt-4 text-xl font-extrabold tracking-[-0.02em]">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-normal text-[#5F5C6E]">
        {description}
      </p>
      <Link
        href="/"
        className={cn(PROFILE_ACTION_PRIMARY_CLASS, 'mt-5 flex-none px-[18px]')}
      >
        {actionLabel}
      </Link>
    </section>
  );
};
