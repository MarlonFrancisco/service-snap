'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@repo/ui';
import { SEARCH_RATING_ANY_VALUE } from '../../../search.constants';
import { searchFilterChipVariants } from '../search-filters.styles';
import type { TRatingFilterConfig } from './rating-filter.types';

const RATING_ITEM_CLASS =
  'min-h-11 cursor-pointer rounded-xl pl-9 text-sm font-semibold text-ink focus:bg-surface-2 focus:text-ink';

/** Chip "Nota" com o menu de nota mínima (3+, 4+, 4,5+). */
export const RatingFilter = ({
  value,
  label,
  isActive,
  options,
  onValueChange,
}: TRatingFilterConfig) => (
  <DropdownMenu modal={false}>
    <DropdownMenuTrigger
      className={searchFilterChipVariants({
        state: isActive ? 'active' : 'inactive',
      })}
    >
      {label} <span aria-hidden="true">▾</span>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="start"
      sideOffset={8}
      className="min-w-[200px] rounded-2xl border-line-strong bg-white p-1.5 text-ink shadow-[0_12px_40px_rgba(15,12,30,0.12)]"
    >
      <DropdownMenuLabel className="px-3 pt-2 pb-1 text-xs font-bold tracking-[0.06em] text-ink-muted uppercase">
        Nota mínima
      </DropdownMenuLabel>
      <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
        <DropdownMenuRadioItem
          value={SEARCH_RATING_ANY_VALUE}
          className={RATING_ITEM_CLASS}
        >
          Qualquer nota
        </DropdownMenuRadioItem>
        {options.map((option) => (
          <DropdownMenuRadioItem
            key={option.value}
            value={option.value}
            className={RATING_ITEM_CLASS}
          >
            {option.label}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);
