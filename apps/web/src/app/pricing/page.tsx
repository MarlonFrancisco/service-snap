import { Pricing } from '@/components/features/pricing';
import { PlansService } from '@/service/plans';
import { withBudget } from '@/utils/helpers/promise.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

const PLANS_PREFETCH_MS = 4000;

export const metadata = createPageMetadata({
  title: 'Planos e preços do sistema de agendamento | ServiceSnap',
  description:
    'Agenda online, lembretes automáticos por WhatsApp e gestão de clientes para o seu negócio. Compare os planos do ServiceSnap e teste grátis por 30 dias.',
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
