'use client';
import { useStoreQuery } from '@/hooks/use-query/use-store-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const useGetStore = () => {
  const params = useParams();
  const storeId = params.id as string;
  const { store } = useStoreQuery({ storeId });
  return store;
};

/** Registra a visualização (ou a falha) da loja uma única vez por id. */
export const useStoreViewTracking = (storeId: string) => {
  const analytics = useAnalytics();
  const { store, isError } = useStoreQuery({ storeId });
  const reportedStoreIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!storeId || reportedStoreIdRef.current === storeId) return;

    if (store) {
      reportedStoreIdRef.current = storeId;
      const reviews = store.reviews ?? [];
      const rating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : undefined;

      analytics.track('view_item', {
        item_id: store.id,
        services_count: store.services?.length ?? 0,
        review_count: reviews.length,
        rating,
        currency: store.currency,
      });
    } else if (isError) {
      reportedStoreIdRef.current = storeId;
      analytics.track('store_not_found', { store_id: storeId });
    }
  }, [analytics, storeId, store, isError]);
};
