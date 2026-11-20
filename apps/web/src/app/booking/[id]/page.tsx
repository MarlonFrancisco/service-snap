import { BookingFlow } from '@/components/features/booking';
import { serializeJsonLd } from '@/utils/helpers/json-ld.helper';
import { CACHE_QUERY_KEYS, getQueryClient } from '@/utils/helpers/query.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import { buildStoreJsonLd } from '@/utils/helpers/social.helper';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  loadStorePage,
  STORE_ID,
  storePageDescription,
  storePageTitle,
} from './store-page.data';

// ISR: a página fica no cache da Vercel e é refeita em segundo plano a cada
// 10 min, para que visitas (e bots) não chamem a API a cada pedido. A lista
// vazia liga o cache também para as lojas que não existiam no build.
export const revalidate = 600;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const loaded = await loadStorePage(id);
  const path = `/booking/${(loaded.status === 'ok' && loaded.store.slug) || id}`;

  if (loaded.status !== 'ok') {
    return createPageMetadata({
      title: 'Agendar | ServiceSnap',
      description: 'Veja o profissional e agende um horário no ServiceSnap.',
      path,
      noindex: loaded.status === 'missing',
    });
  }

  return createPageMetadata({
    title: storePageTitle(loaded.store),
    description: storePageDescription(loaded.store),
    path,
    // Loja desativada continua acessível pelo link, mas fora do índice.
    noindex: !loaded.store.isActive,
  });
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = getQueryClient();

  const loaded = await loadStorePage(id);
  if (loaded.status === 'missing') notFound();
  // API fora: o erro mantém no cache a última versão boa, em vez de guardar
  // por 10 min uma página sem a loja.
  if (loaded.status === 'unavailable') {
    throw new Error(`Loja ${id} indisponível na API`);
  }

  const store = loaded.status === 'ok' ? loaded.store : undefined;

  // Endereço antigo (com o id) vai para o link curto, sem perder SEO
  if (store?.slug && STORE_ID.test(id)) {
    permanentRedirect(`/booking/${store.slug}`);
  }

  if (store) queryClient.setQueryData(CACHE_QUERY_KEYS.store(id), store);
  const galleryImage = store?.gallery?.find((item) => item.url)?.url;
  const jsonLd = store
    ? buildStoreJsonLd({
        id: store.id,
        slug: store.slug,
        name: store.name,
        description: store.description,
        telephone: store.telephone,
        address: store.address,
        city: store.city,
        state: store.state,
        zipCode: store.zipCode,
        country: store.country,
        instagram: store.instagram,
        image: galleryImage?.startsWith('http') ? galleryImage : undefined,
      })
    : null;

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      ) : null}
      <BookingFlow />
    </HydrationBoundary>
  );
}
