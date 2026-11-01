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
    handleKeyDown,
    explore,
  } = useDiscoverySearch();

  return (
    <section
      id="descoberta"
      className="mx-auto w-full max-w-[90rem] px-4 pt-4 pb-1 sm:px-6 sm:pt-6 sm:pb-2 lg:px-12"
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
            'flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 shadow-sm transition-colors sm:gap-3 sm:px-5 sm:py-3',
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
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0A0A0A] outline-none placeholder:text-[#A1A1AA] sm:text-base"
            aria-label="Buscar serviços com IA"
          />
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold tracking-wide uppercase transition-colors sm:px-2.5 sm:text-xs',
              isFocused
                ? 'bg-[#0A0A0A] text-white'
                : 'bg-[#F4F4F5] text-[#2B2B2B]',
            )}
            title="Busca integrada com inteligência artificial"
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
            IA
          </span>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0A0A0A] px-3.5 py-2 text-xs font-semibold text-white transition-colors active:scale-[0.98] hover:bg-[#2B2B2B] sm:px-4 sm:text-sm"
          >
            Buscar
          </button>
        </label>
      </form>
    </section>
  );
};
