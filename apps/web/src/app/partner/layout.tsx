import { Partner } from '@/components/features/partner';
import { OnboardingService } from '@/service/partner/onboarding';
import { StoreService } from '@/service/store';
import { SubscriptionService } from '@/service/subscription';
import { IMySubscription } from '@/types/api';
import type { IStore } from '@/types/api/stores.types';
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

  const sessionHeaders = {
    Cookie: `access_token=${accessToken}`,
  };

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.currentPlan(),
      queryFn: () => SubscriptionService.getCurrentPlan(sessionHeaders),
    }),
    queryClient.prefetchQuery({
      queryKey: CACHE_QUERY_KEYS.stores(),
      queryFn: () => StoreService.getAll(sessionHeaders),
    }),
  ]);

  const subscription = queryClient.getQueryData<IMySubscription>(
    CACHE_QUERY_KEYS.currentPlan(),
  );
  const stores = queryClient.getQueryData<IStore[]>(CACHE_QUERY_KEYS.stores());
  // Equipe de outra loja entra pelo plano do dono, sem assinatura própria
  const isTeamMember = !!stores?.some(
    (store) => store.memberRole && store.memberRole !== 'owner',
  );

  if (!subscription?.isActive && !isTeamMember) {
    redirect('/pricing');
  }

  // Assinatura ativa sem espaço pronto volta para a etapa certa. Se esta leitura
  // falhar, o painel abre normalmente: não vale prender quem já tem loja.
  const onboarding = await OnboardingService.getState(sessionHeaders).catch(
    () => null,
  );

  // Quem só é da equipe não tem espaço próprio para preparar
  const skipsWelcome = isTeamMember && onboarding?.status === 'welcome';

  if (onboarding && onboarding.status !== 'not_needed' && !skipsWelcome) {
    redirect('/onboarding');
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Partner>{children}</Partner>
    </HydrationBoundary>
  );
}
