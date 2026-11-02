'use client';

import { SearchBar } from '@/components/layout/header/components/search-bar/search-bar';

/** Busca fixa do mobile: o mesmo campo de texto do desktop. */
export function MobileSearchPill() {
  return (
    <div className="sticky top-16 z-40 -mt-4 border-b border-[#EBE9F0] bg-white/97 px-5 py-3 md:hidden">
      <SearchBar />
    </div>
  );
}
