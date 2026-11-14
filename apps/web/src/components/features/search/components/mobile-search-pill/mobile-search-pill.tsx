'use client';

import { SearchBar } from '@/components/layout/header/components/search-bar/search-bar';
import { SearchFilters } from '../search-filters';

/** Busca fixa do mobile: o mesmo campo de texto do desktop e os filtros. */
export function MobileSearchPill() {
  return (
    <div className="sticky top-16 z-40 -mt-4 border-b border-[#EBE9F0] bg-white/97 px-5 pt-3 md:hidden">
      <SearchBar />
      <SearchFilters className="-mx-5 px-5" />
    </div>
  );
}
