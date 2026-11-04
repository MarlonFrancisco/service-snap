import {
  BusinessLanding,
  buildBusinessJsonLd,
} from '@/components/features/business-landing';
import {
  BUSINESS_SEGMENTS,
  businessPagePath,
  getBusinessSegment,
} from '@/utils/constants/business-pages.constants';
import { serializeJsonLd } from '@/utils/helpers/json-ld.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type BusinessSegmentPageProps = {
  params: Promise<{ segment: string }>;
};

// Só os segmentos com conteúdo próprio viram página; os outros dão 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return BUSINESS_SEGMENTS.map((segment) => ({ segment: segment.slug }));
}

export async function generateMetadata({
  params,
}: BusinessSegmentPageProps): Promise<Metadata> {
  const page = getBusinessSegment((await params).segment);
  if (!page) return { robots: { index: false, follow: true } };

  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: businessPagePath(page.slug),
  });
}

export default async function BusinessSegmentPage({
  params,
}: BusinessSegmentPageProps) {
  const page = getBusinessSegment((await params).segment);
  if (!page) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildBusinessJsonLd(page)),
        }}
      />
      <BusinessLanding page={page} />
    </>
  );
}
