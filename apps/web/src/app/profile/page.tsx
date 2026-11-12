import { Profile } from '@/components/features/profile';
import type { TProfileTab } from '@/components/features/profile/profile.types';
import { isUnauthorizedError } from '@/service/api';
import { UsersService } from '@/service/users';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const PROFILE_TABS: TProfileTab[] = [
  'bookings',
  'favorites',
  'settings',
  'personal',
];

type TProfilePageParams = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProfilePage({
  searchParams,
}: TProfilePageParams) {
  const { tab } = await searchParams;
  const initialTab = PROFILE_TABS.find((profileTab) => profileTab === tab);
  const cookieStore = await cookies();
  const queryClient = getQueryClient();
  const accessToken = cookieStore.get('access_token')?.value;
  const userIdentification = cookieStore.get('user_identification')?.value;

  if (!userIdentification) {
    return redirect('/');
  }

  const user = await UsersService.getUser({
    Cookie: `access_token=${accessToken}`,
  }).catch((error) => {
    if (isUnauthorizedError(error)) return null;
    throw error;
  });

  if (!user) {
    return redirect('/');
  }

  await queryClient.prefetchQuery({
    queryKey: CACHE_QUERY_KEYS.user(userIdentification),
    queryFn: () => user,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Profile initialTab={initialTab} />
    </HydrationBoundary>
  );
}
