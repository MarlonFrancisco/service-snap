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

  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const result = await Promise.race<PrefetchResult>([
      StoreService.get(id).then((store) => ({ type: 'data' as const, store })),
      new Promise<{ type: 'timeout' }>((resolve) => {
        timer = setTimeout(() => resolve({ type: 'timeout' }), STORE_PREFETCH_MS);
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });

    if (result.type === 'data') {
      if (!result.store?.id) {
        notFound();
      }
      queryClient.setQueryData(CACHE_QUERY_KEYS.store(id), result.store);
    }
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <BookingFlow />
    </HydrationBoundary>
  );
}
