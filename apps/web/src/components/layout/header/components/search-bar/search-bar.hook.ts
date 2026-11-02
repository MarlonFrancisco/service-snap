import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const AI_SUGGESTIONS = [
  'Buscar serviços com IA...',
  'Encontre manicure, cabelo e mais...',
  'Descubra serviços próximos...',
  'Busca inteligente de beleza...',
];

export const useSearchBar = () => {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get('query') || '');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

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

  return {
    query,
    setQuery,
    isFocused,
    setIsFocused,
    placeholder: AI_SUGGESTIONS[placeholderIndex],
    handleSearch,
  };
};
