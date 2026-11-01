'use client';

import { cn } from '@repo/ui';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { MARKETPLACE_CATEGORIES } from './category-rail.constants';

export const CategoryRail = () => {
  const [isPaused, setIsPaused] = useState(false);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  return (
    <div className="relative w-full border-t border-[#EDEDED]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent sm:w-12"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent sm:w-12"
      />
      <div className="w-full overflow-hidden px-4 py-2.5 sm:px-6 md:py-3 lg:px-12">
        <nav
          aria-label="Categorias"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocusCapture={pause}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              resume();
            }
          }}
          onPointerDown={pause}
          onPointerUp={resume}
          onPointerCancel={resume}
        >
          <ul
            className={cn(
              'flex w-max items-center gap-5 py-1 md:gap-7 motion-safe:animate-category-marquee',
              isPaused && 'motion-safe:[animation-play-state:paused]',
            )}
          >
            {[...MARKETPLACE_CATEGORIES, ...MARKETPLACE_CATEGORIES].map(
              (category, index) => {
                const Icon = category.icon;
                const isDuplicate = index >= MARKETPLACE_CATEGORIES.length;
                const params = new URLSearchParams({
                  query: category.query,
                  category: category.query,
                });

                return (
                  <li key={`${category.id}-${index}`} className="shrink-0">
                    <Link
                      href={`/booking?${params.toString()}`}
                      tabIndex={isDuplicate ? -1 : undefined}
                      aria-hidden={isDuplicate || undefined}
                      className="group relative flex flex-col items-center gap-1.5 pb-1.5 opacity-70 transition-opacity active:opacity-100 md:gap-2 md:pb-2 md:hover:opacity-100"
                    >
                      <Icon className="h-5 w-5 text-[#2B2B2B] transition-transform md:h-6 md:w-6 md:group-hover:scale-110" />
                      <span className="text-[11px] whitespace-nowrap text-[#2B2B2B] md:text-sm">
                        {category.label}
                      </span>
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};
