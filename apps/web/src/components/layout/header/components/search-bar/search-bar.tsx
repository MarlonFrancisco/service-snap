'use client';

import { cn } from '@repo/ui';
import { Search } from 'lucide-react';
import {
  HEADER_SEARCH_FIELD_CLASS,
  HEADER_SEARCH_ICON_CLASS,
} from '../../header.constants';
import { useSearchBar } from './search-bar.hook';

/** Campo de busca por texto, usado no header (desktop) e na busca mobile. */
export const SearchBar = () => {
  const {
    query,
    setQuery,
    isFocused,
    setIsFocused,
    placeholder,
    handleSearch,
  } = useSearchBar();

  return (
    <form onSubmit={handleSearch} className="w-full">
      <label
        className={cn(
          HEADER_SEARCH_FIELD_CLASS,
          'gap-2 transition-colors',
          isFocused ? 'border-ink' : 'border-line-strong',
        )}
      >
        <input
          type="search"
          enterKeyHint="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-muted"
          aria-label="Buscar serviços com IA"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className={cn(
            HEADER_SEARCH_ICON_CLASS,
            'transition-colors hover:bg-brand-hover active:scale-[0.98]',
          )}
        >
          <Search className="h-4 w-4" strokeWidth={2.6} aria-hidden />
        </button>
      </label>
    </form>
  );
};
