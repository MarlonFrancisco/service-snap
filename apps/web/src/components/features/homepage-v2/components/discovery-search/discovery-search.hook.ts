import useSearchStore from '@/store/search/search.store';
import { useIsMobile } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const PLACEHOLDERS = [
  "Ex: 'salão de beleza perto de mim'",
  "Ex: 'massagem relaxante hoje'",
  "Ex: 'manicure urgente'",
  "Ex: 'cabelereiro com disponibilidade'",
];

export const useDiscoverySearch = () => {
  const router = useRouter();
  const isMobile = useIsMobile();
  const setIsMobileSearchOpen = useSearchStore(
    (state) => state.setIsMobileSearchOpen,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const explore = useCallback(() => {
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams({ query: searchQuery.trim() });
    router.push(`/booking?${params.toString()}`);
  }, [router, searchQuery]);

  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleInputClick = useCallback(() => {
    if (isMobile) {
      setIsMobileSearchOpen(true);
    }
  }, [isMobile, setIsMobileSearchOpen]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && searchQuery.trim()) {
        explore();
      }
    },
    [explore, searchQuery],
  );

  return {
    searchQuery,
    isFocused,
    placeholder: PLACEHOLDERS[placeholderIndex] ?? PLACEHOLDERS[0],
    handleInputChange,
    handleFocus,
    handleBlur,
    handleInputClick,
    handleKeyDown,
    explore,
  };
};
