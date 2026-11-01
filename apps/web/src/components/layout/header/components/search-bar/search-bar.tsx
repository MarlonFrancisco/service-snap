'use client';

import { cn } from '@repo/ui';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  HEADER_SEARCH_FIELD_CLASS,
  HEADER_SEARCH_ICON_CLASS,
} from '../../header.constants';

const AI_SUGGESTIONS = [
  'Buscar serviços com IA...',
  'Encontre manicure, cabelo e mais...',
  'Descubra serviços próximos...',
  'Busca inteligente de beleza...',
];

/** Desktop-only search field for the marketplace header center. */
export const SearchBar = () => {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('query') || '');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % AI_SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setQuery(params.get('query') || '');
  }, [params]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const next = new URLSearchParams();
    next.set('query', query.trim());
    const location = params.get('location');
    const category = params.get('category');
    if (location) next.set('location', location);
    if (category) next.set('category', category);
    router.push(`/booking?${next.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch();
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <label
        className={cn(
          HEADER_SEARCH_FIELD_CLASS,
          'gap-2 transition-colors',
          isFocused ? 'border-[#0B0B0F]' : 'border-[#E3E1EA]',
        )}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={AI_SUGGESTIONS[placeholderIndex]}
          className="min-w-0 flex-1 bg-transparent text-[#0B0B0F] outline-none placeholder:text-[#5F5C6E]"
          aria-label="Buscar serviços com IA"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className={cn(
            HEADER_SEARCH_ICON_CLASS,
            'transition-colors hover:bg-[#2B2B2B] active:scale-[0.98]',
          )}
        >
          <Search className="h-4 w-4" strokeWidth={2.6} aria-hidden />
        </button>
      </label>
    </form>
  );
};
