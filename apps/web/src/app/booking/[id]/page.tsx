import { BookingFlow } from '@/components/features/booking';
import { StoreService } from '@/service/store/store.service';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const STORE_PREFETCH_MS = 4000;

async function prefetchStoreWithBudget(
  queryClient: ReturnType<typeof getQueryClient>,
  id: string,
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      queryClient.prefetchQuery({
        queryKey: CACHE_QUERY_KEYS.store(id),
        queryFn: () => StoreService.get(id),
      }),
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, STORE_PREFETCH_MS);
      }),
    ]);
  } catch {
    // Client BookingFlow will retry / show error state.
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = getQueryClient();

  await prefetchStoreWithBudget(queryClient, id);

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <BookingFlow />
    </HydrationBoundary>
  );
}
