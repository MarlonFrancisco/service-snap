import { CategoryCityLanding } from '@/components/features/category-city/category-city-landing';
import { SITE_URL } from '@/utils/constants/site.constants';
import {
  buildCategoryCityJsonLd,
  categoryCityPath,
  resolveCategoryCity,
  serializeJsonLd,
} from '@/utils/helpers/category-city.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { loadCategoryCity } from './category-city.data';

type CategoryCityPageProps = {
  params: Promise<{ category: string; city: string }>;
};

export async function generateMetadata({
  params,
}: CategoryCityPageProps): Promise<Metadata> {
  const { category, city } = await params;
  const resolved = resolveCategoryCity(category, city);
  if (!resolved) return {};

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
  });
}

export default async function CategoryCityPage({
  params,
}: CategoryCityPageProps) {
  const { category, city } = await params;
  const resolved = resolveCategoryCity(category, city);
  if (!resolved) notFound();

  const loaded = await loadCategoryCity(resolved);
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
