'use client';

import { cn } from '@repo/ui';
import { Search, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

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
    <form onSubmit={handleSearch} className="hidden w-full md:block">
      <label
        className={cn(
          'flex items-center gap-2 rounded-full border bg-white px-3 py-2 shadow-sm transition-colors sm:gap-2.5 sm:px-4',
          isFocused
            ? 'border-[#0A0A0A] shadow-md'
            : 'border-[#E4E4E7] hover:border-[#D4D4D8]',
        )}
      >
        <Search
          className={cn(
            'h-4 w-4 shrink-0',
            isFocused ? 'text-[#0A0A0A]' : 'text-[#71717A]',
          )}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={AI_SUGGESTIONS[placeholderIndex]}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#0A0A0A] outline-none placeholder:text-[#A1A1AA]"
          aria-label="Buscar serviços com IA"
        />
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold tracking-wide uppercase transition-colors',
            isFocused
              ? 'bg-[#0A0A0A] text-white'
              : 'bg-[#F4F4F5] text-[#2B2B2B]',
          )}
          title="Busca integrada com inteligência artificial"
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          IA
        </span>
        <button
          type="submit"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors active:scale-[0.98] hover:bg-[#2B2B2B] sm:text-sm"
        >
          Buscar
        </button>
      </label>
    </form>
  );
};
