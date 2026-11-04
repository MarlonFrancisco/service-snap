import { CategoryGuide } from '@/components/features/category-guide';
import {
  CATEGORY_GUIDES,
  categoryGuidePath,
  getCategoryGuide,
  type TCategoryGuide,
} from '@/utils/constants/category-guides.constants';
import { SITE_URL } from '@/utils/constants/site.constants';
import { serializeJsonLd } from '@/utils/helpers/json-ld.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type CategoryGuidePageProps = {
  params: Promise<{ category: string }>;
};

// Só as categorias com conteúdo próprio viram página; as outras dão 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORY_GUIDES.map((guide) => ({ category: guide.slug }));
}

export async function generateMetadata({
  params,
}: CategoryGuidePageProps): Promise<Metadata> {
  const guide = getCategoryGuide((await params).category);
  if (!guide) return { robots: { index: false, follow: true } };

  return createPageMetadata({
    title: guide.title,
    description: guide.description,
    path: categoryGuidePath(guide.slug),
  });
}

function buildJsonLd(guide: TCategoryGuide) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: SITE_URL },
        {
          '@type': 'ListItem',
          position: 2,
          name: guide.name,
          item: `${SITE_URL}${categoryGuidePath(guide.slug)}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ];
}

export default async function CategoryGuidePage({
  params,
}: CategoryGuidePageProps) {
  const guide = getCategoryGuide((await params).category);
  if (!guide) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildJsonLd(guide)),
        }}
      />
      <CategoryGuide guide={guide} />
    </>
  );
}
