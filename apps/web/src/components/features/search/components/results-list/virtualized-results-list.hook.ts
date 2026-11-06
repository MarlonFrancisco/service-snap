import { useAnalytics } from '@/providers/analytics.provider';
import useSearchStore from '@/store/search/search.store';
import { IStoreSearchListItem } from '@/store/search/search.types';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { SEARCH_LIST_NAME } from '../../search.constants';

const RESULTS_PAGE_SIZE = 6;

const getResultsSummary = (visible: number, total: number) => {
  if (total === 1) return 'Mostrando 1 resultado';
  if (visible >= total) return `Mostrando todos os ${total} resultados`;
  return `Mostrando ${visible} de ${total} resultados`;
};

export function useVirtualizedResultsList(stores: IStoreSearchListItem[]) {
  const analytics = useAnalytics();
  const setSelectedStore = useSearchStore((state) => state.setSelectedStore);
  const searchKey = useSearchParams().toString();
  const [visibleCount, setVisibleCount] = useState(RESULTS_PAGE_SIZE);

  // Reinicia pela busca, não por `stores`: a API não garante a ordem, então um
  // refetch gera outra referência e desfaria o "Carregar mais".
  useEffect(() => {
    setVisibleCount(RESULTS_PAGE_SIZE);
  }, [searchKey]);

  const showMore = useCallback(() => {
    const revealed = stores.slice(
      visibleCount,
      visibleCount + RESULTS_PAGE_SIZE,
    );
    analytics.track('view_item_list', {
      item_list_name: `${SEARCH_LIST_NAME}_load_more`,
      results_count: revealed.length,
      item_ids: revealed.map((store) => store.id),
    });
    setVisibleCount((count) => count + RESULTS_PAGE_SIZE);
  }, [analytics, stores, visibleCount]);

  const selectStore = useCallback(
    (store: IStoreSearchListItem, index: number) => {
      analytics.track('select_item', {
        item_id: store.id,
        item_list_name: SEARCH_LIST_NAME,
        index,
      });
      setSelectedStore(store);
    },
    [analytics, setSelectedStore],
  );

  const visibleStores = stores.slice(0, visibleCount);

  return {
    visibleStores,
    hasMore: visibleCount < stores.length,
    summary: getResultsSummary(visibleStores.length, stores.length),
    showMore,
    selectStore,
  };
}
