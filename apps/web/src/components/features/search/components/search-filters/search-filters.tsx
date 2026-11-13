'use client';

import { cn } from '@repo/ui';
import { RatingFilter } from './rating-filter';
import { useSearchFilters } from './search-filters.hook';
import { searchFilterChipVariants } from './search-filters.styles';
import type { TSearchFiltersConfig } from './search-filters.types';

/** Linha de chips da busca: "Vaga hoje", "Nota" e "Limpar filtros". */
export const SearchFilters = ({
  className,
  ...props
}: TSearchFiltersConfig) => {
  const {
    isAvailableToday,
    isRatingActive,
    ratingValue,
    ratingLabel,
    ratingOptions,
    hasActiveFilters,
    isUpdating,
    toggleAvailableToday,
    changeMinRating,
    clearFilters,
  } = useSearchFilters();

  return (
    <div
      role="group"
      aria-label="Filtros"
      aria-busy={isUpdating || undefined}
      className={cn(
        'flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] md:flex-wrap md:gap-2.5 md:overflow-visible md:py-3.5 [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-pressed={isAvailableToday}
        onClick={toggleAvailableToday}
        className={searchFilterChipVariants({
          state: isAvailableToday ? 'active' : 'inactive',
        })}
      >
        Vaga hoje
      </button>

      <RatingFilter
        value={ratingValue}
        label={ratingLabel}
        isActive={isRatingActive}
        options={ratingOptions}
        onValueChange={changeMinRating}
      />

      {hasActiveFilters && (
        <button
          type="button"
          aria-label="Limpar filtros"
          onClick={clearFilters}
          className={searchFilterChipVariants({ state: 'link' })}
        >
          <span className="md:hidden">Limpar</span>
          <span className="hidden md:inline">Limpar filtros</span>
        </button>
      )}
    </div>
  );
};
