'use client';

import { cn } from '@repo/ui';
import { Sparkles } from 'lucide-react';
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
      className="sticky top-16 z-40 bg-white/97 pt-2 pb-3 md:static md:z-auto md:bg-transparent md:pt-10 md:pb-0"
    >
      <h1 className="sr-only text-center font-extrabold tracking-[-0.035em] text-[#0B0B0F] md:not-sr-only md:text-[44px]">
        Agende serviços perto de você
      </h1>
      <form
        className="mx-5 md:mx-auto md:mt-7 md:max-w-[760px] md:px-5"
        onSubmit={(event) => {
          event.preventDefault();
          explore();
        }}
      >
        <label
          className={cn(
            'flex h-14 items-center gap-2 rounded-full border bg-white pr-2 pl-[18px] shadow-[0_8px_24px_rgba(15,12,30,0.08)] transition-colors md:h-[68px] md:gap-3 md:pr-2.5 md:pl-[26px] md:shadow-[0_10px_32px_rgba(15,12,30,0.08)]',
            isFocused ? 'border-[#0B0B0F]' : 'border-[#E3E1EA]',
          )}
        >
          <input
            id="descoberta-query"
            type="search"
            value={searchQuery}
            placeholder={placeholder}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#0B0B0F] outline-none placeholder:text-[#5F5C6E] md:text-base"
            aria-label="Buscar serviços com IA"
          />
          <span
            className="hidden shrink-0 items-center gap-1 rounded-full border border-[#E3E1EA] px-3.5 py-2 text-xs font-bold text-[#0B0B0F] md:inline-flex"
            title="Busca integrada com inteligência artificial"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            IA
          </span>
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#0B0B0F] px-[18px] text-sm font-bold text-white transition-colors hover:bg-[#2B2B2B] active:scale-[0.98] md:h-12 md:px-7 md:text-[15px]"
          >
            Buscar
          </button>
        </label>
      </form>
    </section>
  );
};
