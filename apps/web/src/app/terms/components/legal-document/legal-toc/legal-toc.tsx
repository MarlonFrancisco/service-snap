'use client';

import { cn } from '@repo/ui';
import type { TLegalTocConfig } from '../legal-document.types';
import { useLegalToc } from './legal-toc.hook';

export const LegalToc = ({ items }: TLegalTocConfig) => {
  const { activeId, handleSelect } = useLegalToc(items);

  return (
    <nav
      aria-label="Nesta página"
      className="flex-[1_1_240px] md:max-w-[280px] lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
    >
      <h2 className="mb-2 text-[13px] font-bold tracking-[0.06em] text-[#5F5C6E] uppercase">
        Nesta página
      </h2>
      {items.map((item) => {
        const isActive = item.id === activeId;

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={isActive ? 'location' : undefined}
            onClick={() => handleSelect(item.id)}
            className={cn(
              'flex min-h-11 items-center text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0B0B0F]',
              isActive
                ? 'font-bold text-[#0B0B0F]'
                : 'font-medium text-[#5F5C6E] hover:text-[#0B0B0F]',
            )}
          >
            {item.title}
          </a>
        );
      })}
    </nav>
  );
};
