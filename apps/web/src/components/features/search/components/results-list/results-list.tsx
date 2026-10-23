'use client';

import { useSearchQuery } from '@/hooks/use-query/use-search-query';
import useSearchStore from '@/store/search/search.store';
import { IStoreSearchListItem } from '@/store/search/search.types';
import { fromStoresToSearch } from '@/utils/helpers/search.helper';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { ResultsListSkeleton } from './results-list-skeleton';
import { VirtualizedResultsList } from './virtualized-results-list';

export function ResultsList() {
  const params = useSearchParams();
  const { data, isPending } = useSearchQuery({
    query: params.get('query')!,
    location: params.get('location'),
    category: params.get('category'),
  });

  const selectedStore = useSearchStore((state) => state.selectedStore);
  const setSelectedStore = useSearchStore((state) => state.setSelectedStore);

  const displayStores: IStoreSearchListItem[] = useMemo(
    () => fromStoresToSearch(data),
    [data],
  );

  useEffect(() => {
    if (!selectedStore && displayStores.length > 0) {
      const firstStore = displayStores[0];

      setSelectedStore(firstStore!);
    }
  }, [selectedStore, displayStores, setSelectedStore]);

  if (isPending) {
    return <ResultsListSkeleton />;
  }

  return <VirtualizedResultsList stores={displayStores} />;
}
