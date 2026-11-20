import { CategoryCityLanding } from '@/components/features/category-city/category-city-landing';
import { SITE_URL } from '@/utils/constants/site.constants';
import {
  buildCategoryCityJsonLd,
  categoryCityPath,
  resolveCategoryCity,
} from '@/utils/helpers/category-city.helper';
import { serializeJsonLd } from '@/utils/helpers/json-ld.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import { isIndexableCategoryCity } from '@/utils/helpers/store-sitemap.helper';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadCategoryCity } from './category-city.data';

// ISR: refeita em segundo plano a cada 10 min; a lista vazia liga o cache
// para qualquer cidade.
export const revalidate = 600;

export function generateStaticParams() {
  return [];
}

type CategoryCityPageProps = {
  params: Promise<{ category: string; city: string }>;
};

export async function generateMetadata({
  params,
}: CategoryCityPageProps): Promise<Metadata> {
  const { category, city } = await params;
  const resolved = resolveCategoryCity(category, city);
  // A página vira 404; sem isso o robots do layout (index) entra junto.
  if (!resolved) return { robots: { index: false, follow: true } };

  const loaded = await loadCategoryCity(resolved);
  const path = categoryCityPath(resolved.categorySlug, resolved.citySlug);
  const count = loaded.stores.length;
  const description =
    loaded.status === 'ok' && count > 0
      ? `${count} ${count === 1 ? 'profissional' : 'profissionais'} de ${resolved.categoryName} em ${loaded.displayCity}. Agende no ServiceSnap.`
      : `Encontre ${resolved.categoryName} em ${loaded.displayCity} e agende no ServiceSnap.`;

  return createPageMetadata({
    title: `${resolved.categoryName} em ${loaded.displayCity} | ServiceSnap`,
    description,
    path,
    // Qualquer cidade gera uma URL válida; com poucas lojas é conteúdo raso.
    // Mesmo limite do sitemap. Se a busca falhar, não muda a decisão às cegas.
    noindex: loaded.status === 'ok' && !isIndexableCategoryCity(count),
  });
}

export default async function CategoryCityPage({
  params,
}: CategoryCityPageProps) {
  const { category, city } = await params;
  const resolved = resolveCategoryCity(category, city);
  if (!resolved) notFound();

  const loaded = await loadCategoryCity(resolved);
  // API fora: mantém no cache a última versão boa.
  if (loaded.status === 'unavailable') {
    throw new Error(`Busca indisponível: ${category}/${city}`);
  }
  const path = categoryCityPath(resolved.categorySlug, resolved.citySlug);
  const jsonLd =
    loaded.stores.length > 0
      ? serializeJsonLd(
          buildCategoryCityJsonLd({
            categoryName: resolved.categoryName,
            cityLabel: loaded.displayCity,
            pageUrl: `${SITE_URL}${path}`,
            stores: loaded.stores,
          }),
        )
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}
      <CategoryCityLanding
        resolved={resolved}
        status={loaded.status}
        displayCity={loaded.displayCity}
        stores={loaded.stores}
      />
    </>
  );
}
