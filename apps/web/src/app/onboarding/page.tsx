import { PartnerOnboarding } from '@/components/features/partner-onboarding';
import { OnboardingService } from '@/service/partner/onboarding';
import type { TOnboardingState } from '@/types/api/onboarding.types';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Prepare seu espaço | ServiceSnap',
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/pricing');
  }

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: CACHE_QUERY_KEYS.onboarding(),
    queryFn: () =>
      OnboardingService.getState({ Cookie: `access_token=${accessToken}` }),
  });

  const state = queryClient.getQueryData<TOnboardingState>(
    CACHE_QUERY_KEYS.onboarding(),
  );

  if (state && !state.hasActiveSubscription) {
    redirect('/pricing');
  }

  if (state?.status === 'not_needed') {
    redirect('/partner/dashboard');
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PartnerOnboarding />
    </HydrationBoundary>
  );
}
