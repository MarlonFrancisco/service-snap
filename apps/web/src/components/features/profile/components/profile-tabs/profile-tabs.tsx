'use client';

import { cn } from '@repo/ui';
import Link from 'next/link';
import { PROFILE_FOCUS_CLASS } from '../../profile.styles';
import { useProfileTabs } from './profile-tabs.hook';
import type { TProfileTabsConfig } from './profile-tabs.types';

export const ProfileTabs = (config: TProfileTabsConfig) => {
  const { tabs, handleNavigate } = useProfileTabs(config);

  return (
    <nav
      aria-label="Seções do perfil"
      className="-mx-5 mt-[22px] flex gap-6 overflow-x-auto border-b border-line px-5 md:mx-0 md:mt-8 md:gap-8 md:px-0"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          onNavigate={(event) => handleNavigate(event, tab.href)}
          aria-current={tab.isActive ? 'page' : undefined}
          className={cn(
            'flex min-h-12 flex-none items-center gap-1.5 border-b-2 text-sm font-semibold transition-colors md:gap-2',
            PROFILE_FOCUS_CLASS,
            'focus-visible:-outline-offset-2',
            tab.isActive
              ? 'border-ink text-ink'
              : 'border-transparent text-ink-muted hover:text-ink',
          )}
        >
          <span className="md:hidden">{tab.shortLabel}</span>
          <span className="hidden md:inline">{tab.label}</span>
          {tab.count > 0 && (
            <span className="rounded-full bg-surface-2 px-[7px] py-px text-xs font-bold text-ink md:px-2 md:py-0.5">
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
};
