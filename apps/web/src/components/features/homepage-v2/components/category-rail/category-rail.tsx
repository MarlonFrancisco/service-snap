'use client';

import { cn } from '@repo/ui';
import { MARKETPLACE_CATEGORIES } from '../../homepage-v2.mock';
import { useCategoryRail } from './category-rail.hook';

export const CategoryRail = () => {
  const { activeId, selectCategory } = useCategoryRail();

  return (
    <section className="sticky top-20 z-40 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full items-center justify-center px-4 py-3 sm:px-6">
        <div className="flex items-center justify-center gap-7 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MARKETPLACE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = category.id === activeId;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => selectCategory(category.id, category.query)}
                className={cn(
                  'group relative flex shrink-0 cursor-pointer flex-col items-center gap-2 pb-2',
                  isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100',
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6 transition-transform group-hover:scale-110',
                    isActive ? 'text-[#0A0A0A]' : 'text-[#2B2B2B]',
                  )}
                />
                <span
                  className={cn(
                    'text-sm whitespace-nowrap',
                    isActive
                      ? 'font-semibold text-[#0A0A0A]'
                      : 'text-[#2B2B2B]',
                  )}
                >
                  {category.label}
                </span>
                {isActive && (
                  <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#0A0A0A]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
