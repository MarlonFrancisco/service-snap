'use client';

import { cn } from '@repo/ui';
import { Search, Sparkles } from 'lucide-react';
import { useDiscoverySearch } from './discovery-search.hook';

export const DiscoverySearch = () => {
  const {
    searchQuery,
    isFocused,
    placeholder,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleInputClick,
    handleKeyDown,
    explore,
  } = useDiscoverySearch();

  return (
    <section
      id="descoberta"
      className="mx-auto w-full max-w-[90rem] px-6 pt-6 pb-2 lg:px-12"
    >
      <form
        className="w-full"
        onSubmit={(event) => {
          event.preventDefault();
          explore();
        }}
      >
        <label
          className={cn(
            'flex items-center gap-3 rounded-2xl border bg-white px-4 py-2.5 shadow-sm transition-colors sm:px-5 sm:py-3',
            isFocused
              ? 'border-[#0A0A0A] shadow-md'
              : 'border-[#E4E4E7] hover:border-[#D4D4D8]',
          )}
        >
          <Search
            className={cn(
              'h-5 w-5 shrink-0',
              isFocused ? 'text-[#0A0A0A]' : 'text-[#71717A]',
            )}
          />
          <input
            id="descoberta-query"
            type="search"
            value={searchQuery}
            placeholder={placeholder}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0A0A0A] outline-none placeholder:text-[#A1A1AA] sm:text-base"
            aria-label="Buscar serviços"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0A0A0A] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2B2B2B] sm:px-4 sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Busca com IA</span>
            <span className="sm:hidden">IA</span>
          </button>
        </label>
      </form>
    </section>
  );
};
