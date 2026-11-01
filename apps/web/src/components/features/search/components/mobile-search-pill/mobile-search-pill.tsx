'use client';

import useSearchStore from '@/store/search/search.store';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

/** Busca fixa do mobile; abre o overlay completo (termo, local e data). */
export function MobileSearchPill() {
  const query = useSearchParams().get('query');
  const setIsMobileSearchOpen = useSearchStore(
    (state) => state.setIsMobileSearchOpen,
  );

  return (
    <div className="sticky top-16 z-40 -mt-4 border-b border-[#EBE9F0] bg-white/97 px-5 py-3 md:hidden">
      <button
        type="button"
        aria-label="Abrir busca"
        onClick={() => setIsMobileSearchOpen(true)}
        className="flex h-[52px] w-full items-center gap-2.5 rounded-full border border-[#E3E1EA] bg-white px-[18px] text-left text-[15px] font-semibold text-[#0B0B0F] shadow-[0_6px_20px_rgba(15,12,30,0.08)]"
      >
        <Search className="h-[18px] w-[18px] shrink-0" strokeWidth={2.4} />
        <span className="truncate">{query}</span>
      </button>
    </div>
  );
}
