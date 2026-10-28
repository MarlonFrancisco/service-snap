import { BookingFlow } from '@/components/features/booking';
import { StoreService } from '@/service/store/store.service';
import type { IStore } from '@/types/api/stores.types';
import { serializeJsonLd } from '@/utils/helpers/category-city.helper';
import { withBudget } from '@/utils/helpers/promise.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { buildStoreJsonLd } from '@/utils/helpers/social.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const STORE_PREFETCH_MS = 4000;

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await withBudget(
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.store(id),
      queryFn: () => StoreService.get(id),
    }),
    STORE_PREFETCH_MS,
  );

  const store = queryClient.getQueryData<IStore>(CACHE_QUERY_KEYS.store(id));
  const galleryImage = store?.gallery?.find((item) => item.url)?.url;
  const jsonLd = store
    ? buildStoreJsonLd({
        id: store.id,
        name: store.name,
        description: store.description,
        telephone: store.telephone,
        address: store.address,
        city: store.city,
        state: store.state,
        zipCode: store.zipCode,
        country: store.country,
        instagram: store.instagram,
        image: galleryImage?.startsWith('http') ? galleryImage : undefined,
      })
    : null;

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      ) : null}
      <BookingFlow />
    </HydrationBoundary>
  );
}
