import useSearchStore from '@/store/search/search.store';
import { buildSearchUrl } from '@/utils/helpers/search.helper';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  TSearchField,
  TUseMobileSearchOverlayConfig,
} from './mobile-search-overlay.types';

export const useMobileSearchOverlay = (
  _config: TUseMobileSearchOverlayConfig = {},
) => {
  const setIsMobileSearchOpen = useSearchStore(
    (state) => state.setIsMobileSearchOpen,
  );

  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [activeField, setActiveField] = useState<TSearchField>(null);
  const [searchFilters, setSearchFilters] = useState<{
    location: string;
    query: string;
    date?: Date;
  }>({
    location: '',
    query: '',
    date: undefined,
  });

  const locationRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // Static data
  const locationSuggestions = useMemo(
    () => [
      'São Paulo, SP',
      'Rio de Janeiro, RJ',
      'Belo Horizonte, MG',
      'Porto Alegre, RS',
      'Curitiba, PR',
      'Salvador, BA',
    ],
    [],
  );

  const querySuggestions = useMemo(
    () => [
      'Corte de cabelo',
      'Manicure',
      'Massagem relaxante',
      'Limpeza de pele',
      'Sobrancelha',
      'Barboterapia',
      'Depilação',
      'Tratamento facial',
    ],
    [],
  );

  const popularQueries = useMemo(
    () => [
      { name: 'Cabelo', icon: '✂️' },
      { name: 'Unhas', icon: '💅' },
      { name: 'Massagem', icon: '💆' },
      { name: 'Depilação', icon: '✨' },
    ],
    [],
  );

  // Filtered suggestions
  const filteredLocationSuggestions = useMemo(() => {
    return locationSuggestions
      .filter((location) =>
        location
          .toLowerCase()
          .includes(searchFilters.location?.toLowerCase() || ''),
      )
      .slice(0, 5);
  }, [locationSuggestions, searchFilters.location]);

  const filteredQuerySuggestions = useMemo(() => {
    return querySuggestions
      .filter((service) =>
        service
          .toLowerCase()
          .includes(searchFilters.query?.toLowerCase() || ''),
      )
      .slice(0, 5);
  }, [querySuggestions, searchFilters.query]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return [
      searchFilters.location,
      searchFilters.query,
      searchFilters.date,
    ].filter(Boolean).length;
  }, [searchFilters]);

  // Clear individual field
  const clearField = useCallback(
    (field: 'location' | 'query' | 'date') => {
      if (field === 'location') {
        setSearchFilters({ ...searchFilters, location: '' });
      } else if (field === 'query') {
        setSearchFilters({ ...searchFilters, query: '' });
      } else if (field === 'date') {
        setSearchFilters({ ...searchFilters, date: undefined });
      }
    },
    [searchFilters, setSearchFilters],
  );

  // Auto-scroll to next field
  const scrollToNextField = useCallback(
    (currentField: 'location' | 'query' | 'date') => {
      const nextField =
        currentField === 'location'
          ? 'query'
          : currentField === 'query'
            ? 'date'
            : null;
      if (nextField) {
        setTimeout(() => setActiveField(nextField), 300);
      }
    },
    [],
  );

  const handleLocationSelect = useCallback(
    (location: string) => {
      setSearchFilters({ ...searchFilters, location });
      setShowLocationSuggestions(false);
      scrollToNextField('location');
    },
    [searchFilters, setSearchFilters, scrollToNextField],
  );

  const handleQuerySelect = useCallback(
    (query: string) => {
      setSearchFilters({ ...searchFilters, query });
      setShowQuerySuggestions(false);
      scrollToNextField('query');
    },
    [searchFilters, setSearchFilters, scrollToNextField],
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setSearchFilters({
          ...searchFilters,
          date,
        });
      }
    },
    [searchFilters, setSearchFilters],
  );

  const handleSearch = useCallback(() => {
    const url = buildSearchUrl(searchFilters);
    if (!url) return;

    setIsMobileSearchOpen(false);
    setActiveField(null);
    router.push(url);
  }, [searchFilters, router, setIsMobileSearchOpen]);
  const clearAllFilters = useCallback(() => {
    setSearchFilters({
      location: '',
      query: '',
      date: undefined,
    });
    setActiveField(null);
  }, [setSearchFilters]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
      if (
        queryRef.current &&
        !queryRef.current.contains(event.target as Node)
      ) {
        setShowQuerySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    // States
    activeField,
    showLocationSuggestions,
    showQuerySuggestions,
    activeFiltersCount,
    searchFilters,

    // Suggestions data
    locationSuggestions,
    querySuggestions,
    popularQueries,
    filteredLocationSuggestions,
    filteredQuerySuggestions,

    // Actions
    setActiveField,
    clearField,
    handleLocationSelect,
    handleQuerySelect,
    handleDateSelect,
    handleSearch,
    clearAllFilters,
    setSearchFilters,
  };
};
