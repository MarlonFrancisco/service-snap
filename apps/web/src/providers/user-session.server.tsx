import { UsersService } from '@/service/users';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { UserIdentificationProvider } from './user-identification.provider';

/**
 * Sessão do usuário já no HTML do servidor, só nas áreas que leem cookies de
 * qualquer jeito (painel, perfil). Fica fora do layout raiz: ler cookies lá
 * tornava todas as páginas dinâmicas e impedia o ISR das páginas públicas,
 * que agora buscam o usuário no navegador.
 */
export async function UserSession({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const userIdentification = cookieStore.get('user_identification')?.value;

  if (!userIdentification) {
    return <>{children}</>;
  }

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: CACHE_QUERY_KEYS.user(userIdentification),
    queryFn: () =>
      UsersService.getUser({
        Cookie: `access_token=${cookieStore.get('access_token')?.value}`,
      }),
  });

  return (
    <UserIdentificationProvider value={userIdentification}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        {children}
      </HydrationBoundary>
    </UserIdentificationProvider>
  );
}
