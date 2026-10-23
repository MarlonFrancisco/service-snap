import { Pricing } from '@/components/features/pricing';
import { PlansService } from '@/service/plans';
import { withBudget } from '@/utils/helpers/promise.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const PLANS_PREFETCH_MS = 4000;

export const metadata = createPageMetadata({
  title: 'Planos e preços | ServiceSnap',
  description:
    'Planos para profissionais e negócios gerenciarem agenda, WhatsApp e clientes no ServiceSnap.',
  path: '/pricing',
});

export default async function PricingPage() {
  const queryClient = getQueryClient();

  await withBudget(
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.plans('BRL'),
      queryFn: () => PlansService.getPlans('BRL'),
    }),
    PLANS_PREFETCH_MS,
  );

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Pricing />
    </HydrationBoundary>
  );
}
