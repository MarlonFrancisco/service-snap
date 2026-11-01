import { IStoreSearchListItem } from '@/store/search/search.types';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const RESULTS_PAGE_SIZE = 6;

const getResultsSummary = (visible: number, total: number) => {
  if (total === 1) return 'Mostrando 1 resultado';
  if (visible >= total) return `Mostrando todos os ${total} resultados`;
  return `Mostrando ${visible} de ${total} resultados`;
};

export function useVirtualizedResultsList(stores: IStoreSearchListItem[]) {
  const searchKey = useSearchParams().toString();
  const [visibleCount, setVisibleCount] = useState(RESULTS_PAGE_SIZE);

  // Reinicia pela busca, não por `stores`: a API não garante a ordem, então um
  // refetch gera outra referência e desfaria o "Carregar mais".
  useEffect(() => {
    setVisibleCount(RESULTS_PAGE_SIZE);
  }, [searchKey]);

  const showMore = useCallback(() => {
    setVisibleCount((count) => count + RESULTS_PAGE_SIZE);
  }, []);

  const visibleStores = stores.slice(0, visibleCount);

  return {
    visibleStores,
    hasMore: visibleCount < stores.length,
    summary: getResultsSummary(visibleStores.length, stores.length),
    showMore,
  };
}
