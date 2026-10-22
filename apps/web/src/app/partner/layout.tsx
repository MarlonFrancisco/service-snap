import { Partner } from '@/components/features/partner';
import { StoreService } from '@/service/store';
import { SubscriptionService } from '@/service/subscription';
import { IMySubscription } from '@/types/api';
import { IStore } from '@/types/api/stores.types';
import { createRedisPersister } from '@/utils/helpers/query-server.helpers';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

interface PartnerLayoutProps {
  children: ReactNode;
}

export default async function PartnerLayout({ children }: PartnerLayoutProps) {
  const queryClient = getQueryClient();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/pricing');
  }

  const { persistClient, restoreClient } =
    await createRedisPersister(queryClient);

  StoreService.headers = {
    Cookie: `access_token=${accessToken}`,
  };

  SubscriptionService.headers = {
    Cookie: `access_token=${accessToken}`,
  };

  await restoreClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.currentPlan(),
      queryFn: () => SubscriptionService.getCurrentPlan(),
    }),
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.stores(),
      queryFn: () => StoreService.getAll(),
    }),
  ]);

  const subscription = queryClient.getQueryData<IMySubscription>(
    CACHE_QUERY_KEYS.currentPlan(),
  );

  const stores = queryClient.getQueryData<IStore[]>(CACHE_QUERY_KEYS.stores());

  if (stores) {
    await Promise.all(
      stores?.map((store) =>
        queryClient.prefetchQuery({
          queryKey: CACHE_QUERY_KEYS.store(store.id),
          queryFn: () => StoreService.get(store.id),
        }),
      ),
    );
  }

  if (!subscription?.isActive) {
    redirect('/pricing');
  }

  const dehydratedState = dehydrate(queryClient);

  await persistClient();

  return (
    <HydrationBoundary state={dehydratedState}>
      <Partner>{children}</Partner>
    </HydrationBoundary>
  );
}
