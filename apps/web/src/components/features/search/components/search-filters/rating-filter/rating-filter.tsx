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
  'min-h-11 cursor-pointer rounded-xl pl-9 text-sm font-semibold text-[#0B0B0F] focus:bg-[#F4F3F7] focus:text-[#0B0B0F]';

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
      className="min-w-[200px] rounded-2xl border-[#E3E1EA] bg-white p-1.5 text-[#0B0B0F] shadow-[0_12px_40px_rgba(15,12,30,0.12)]"
    >
      <DropdownMenuLabel className="px-3 pt-2 pb-1 text-xs font-bold tracking-[0.06em] text-[#5F5C6E] uppercase">
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
