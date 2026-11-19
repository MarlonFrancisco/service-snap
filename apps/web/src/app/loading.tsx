'use client';

import { AdminShellSkeleton } from '@/components/features/admin/components/admin-shell/admin-shell.skeleton';
import { PartnerSkeleton } from '@/components/features/partner/partner.skeleton';
import { PageLoading } from '@/components/layout/page-loading';
import { usePathname } from 'next/navigation';

/**
 * Aparece ao entrar numa página que ainda busca dados no servidor. O painel e
 * a área da plataforma buscam dados no layout, que fica acima dos loading.tsx
 * de cada rota, então o esqueleto deles é escolhido aqui pelo endereço. As
 * outras páginas com busca no servidor têm o próprio loading.tsx.
 */
export default function RootLoading() {
  const pathname = usePathname();

  if (pathname.startsWith('/partner')) return <PartnerSkeleton />;
  if (pathname.startsWith('/admin')) return <AdminShellSkeleton />;

  return <PageLoading />;
}
