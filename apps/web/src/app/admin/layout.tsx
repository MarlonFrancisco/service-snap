import { AdminNotAllowed, AdminShell } from '@/components/features/admin';
import { AdminService } from '@/service/admin';
import { isApiHttpError, isUnauthorizedError } from '@/service/api';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Painel da plataforma',
  robots: { index: false, follow: false },
};

type TAdminLayoutParams = {
  children: ReactNode;
};

/**
 * Painel da equipe do ServiceSnap. Quem decide é a API (`PLATFORM_ADMIN_EMAILS`):
 * sem sessão volta para o início; sem permissão (403) vê o aviso, sem o painel.
 */
export default async function AdminLayout({ children }: TAdminLayoutParams) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) redirect('/');

  const queryClient = getQueryClient();
  const access = await AdminService.getOverview({
    Cookie: `access_token=${accessToken}`,
  })
    .then((overview) => {
      queryClient.setQueryData(CACHE_QUERY_KEYS.adminOverview(), overview);
      return 'allowed' as const;
    })
    .catch((error: unknown) => {
      if (isUnauthorizedError(error)) return 'signed-out' as const;
      if (isApiHttpError(error) && error.status === 403) {
        return 'forbidden' as const;
      }
      throw error;
    });

  if (access === 'signed-out') redirect('/');
  if (access === 'forbidden') return <AdminNotAllowed />;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminShell>{children}</AdminShell>
    </HydrationBoundary>
  );
}
