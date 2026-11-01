'use client';
import useSearchStore from '@/store/search/search.store';
import { Button, Sheet, SheetContent, SheetTitle } from '@repo/ui';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { DateField } from './components/date-field';
import { FilterChips } from './components/filter-chips';
import { LocationField } from './components/location-field';
import { ProgressBar } from './components/progress-bar';
import { QueryField } from './components/query-field';
import { useMobileSearchOverlay } from './mobile-search-overlay.hook';

export const MobileSearchOverlay = () => {
  const isMobileSearchOpen = useSearchStore(
    (state) => state.isMobileSearchOpen,
  );
  const setIsMobileSearchOpen = useSearchStore(
    (state) => state.setIsMobileSearchOpen,
  );

  const {
    activeField,
    activeFiltersCount,
    filteredLocationSuggestions,
    filteredQuerySuggestions,
    popularQueries,
    searchFilters,
    setSearchFilters,
    setActiveField,
    clearField,
    handleLocationSelect,
    handleQuerySelect,
    handleDateSelect,
    handleSearch,
    clearAllFilters,
  } = useMobileSearchOverlay();

  return (
    <Sheet open={isMobileSearchOpen} onOpenChange={setIsMobileSearchOpen}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[95vh] p-0 border-t-0 rounded-t-3xl overflow-hidden"
      >
        <div className="flex flex-col h-full bg-[#FAFAFA]">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2 bg-white">
            <div className="w-12 h-1.5 bg-[#D4D4D8] rounded-full" />
          </div>

          {/* Header */}
          <div className="bg-white border-b border-[#E4E4E7]">
            <div className="flex items-center justify-between px-6 py-3">
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-[#F4F4F5] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-[#2B2B2B]" />
              </button>
              <div className="text-center">
                <SheetTitle className="text-base font-semibold text-[#0A0A0A]">
                  Buscar
                </SheetTitle>
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-[#71717A] mt-0.5">
                    {activeFiltersCount} de 3 filtros
                  </p>
                )}
              </div>
              <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Active Filters Chips */}
            <FilterChips
              location={searchFilters.location}
              query={searchFilters.query}
              date={searchFilters.date}
              onClearLocation={() => clearField('location')}
              onClearQuery={() => clearField('query')}
              onClearDate={() => clearField('date')}
            />
          </div>

          {/* Search Fields */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-[#FAFAFA]">
            <div className="space-y-3">
              {/* Location Field */}
              <LocationField
                value={searchFilters.location || ''}
                isActive={activeField === 'location'}
                suggestions={filteredLocationSuggestions}
                onChange={(value) => {
                  setSearchFilters({ ...searchFilters, location: value });
                }}
                onSelect={handleLocationSelect}
                onClear={() => clearField('location')}
                onToggleActive={() =>
                  setActiveField(activeField === 'location' ? null : 'location')
                }
              />

              {/* Query Field */}
              <QueryField
                value={searchFilters.query || ''}
                isActive={activeField === 'query'}
                suggestions={filteredQuerySuggestions}
                popularQueries={popularQueries}
                onChange={(value) => {
                  setSearchFilters({ ...searchFilters, query: value });
                }}
                onSelect={handleQuerySelect}
                onClear={() => clearField('query')}
                onToggleActive={() =>
                  setActiveField(activeField === 'query' ? null : 'query')
                }
              />

              {/* Date Field */}
              <DateField
                value={searchFilters.date}
                isActive={activeField === 'date'}
                onSelect={handleDateSelect}
                onClear={() => clearField('date')}
                onToggleActive={() =>
                  setActiveField(activeField === 'date' ? null : 'date')
                }
              />
            </div>
          </div>

          {/* Footer - Search Button */}
          <div className="p-6 border-t border-[#E4E4E7] bg-white shadow-2xl">
            {/* Progress Bar */}
            {activeFiltersCount > 0 && (
              <ProgressBar current={activeFiltersCount} total={3} />
            )}

            <Button
              onClick={handleSearch}
              size="lg"
              disabled={activeFiltersCount === 0}
              className="w-full bg-[#0A0A0A] hover:bg-[#2B2B2B] text-white py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0A0A0A] group"
            >
              <Search className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {activeFiltersCount === 0
                ? 'Adicione filtros para buscar'
                : 'Buscar serviços'}
            </Button>

            {activeFiltersCount > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={clearAllFilters}
                className="w-full mt-3 text-sm text-[#2B2B2B] hover:text-[#0A0A0A] underline font-medium py-2 transition-colors"
              >
                Limpar todos os filtros
              </motion.button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
