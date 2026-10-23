import { BookingFlow } from '@/components/features/booking';
import { isNotFoundError } from '@/service/api';
import { StoreService } from '@/service/store/store.service';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

const STORE_PREFETCH_MS = 4000;

type PrefetchResult =
  | { type: 'data'; store: Awaited<ReturnType<typeof StoreService.get>> }
  | { type: 'timeout' };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  let store: Awaited<ReturnType<typeof StoreService.get>> | undefined;

  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const result = await Promise.race<PrefetchResult>([
      StoreService.get(id).then((data) => ({ type: 'data' as const, store: data })),
      new Promise<{ type: 'timeout' }>((resolve) => {
        timer = setTimeout(() => resolve({ type: 'timeout' }), STORE_PREFETCH_MS);
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });

    if (result.type === 'data') {
      store = result.store;
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
  }

  // Outside try/catch so Next.js notFound() is not swallowed.
  if (store !== undefined) {
    if (!store?.id) {
      notFound();
    }
    queryClient.setQueryData(CACHE_QUERY_KEYS.store(id), store);
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <BookingFlow />
    </HydrationBoundary>
  );
}
