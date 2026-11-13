import { BookingFlow } from '@/components/features/booking';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { loadStorePage } from '../store-page.data';

/** Página do iframe do widget: fora do índice, canonical na página da loja. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const loaded = await loadStorePage(id);
  const storeName = loaded.status === 'ok' ? loaded.store.name : null;

  return createPageMetadata({
    title: storeName
      ? `Agendar em ${storeName} | ServiceSnap`
      : 'Agendar | ServiceSnap',
    description: 'Escolha o serviço, o profissional e o horário.',
    path: `/booking/${id}`,
    noindex: true,
  });
}

// O App Router exige o export default na página.
export default async function BookingEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Sem `notFound()`: a 404 do site inteira não cabe no iframe. Loja inexistente
  // cai no aviso compacto do casco quando a busca do cliente falha.
  const loaded = await loadStorePage(id);
  if (loaded.status === 'ok') {
    queryClient.setQueryData(CACHE_QUERY_KEYS.store(id), loaded.store);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BookingFlow embedded />
    </HydrationBoundary>
  );
}
