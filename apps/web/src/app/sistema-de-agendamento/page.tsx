import {
  BusinessLanding,
  buildBusinessJsonLd,
} from '@/components/features/business-landing';
import {
  BUSINESS_HUB,
  businessPagePath,
} from '@/utils/constants/business-pages.constants';
import { serializeJsonLd } from '@/utils/helpers/json-ld.helper';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: BUSINESS_HUB.title,
  description: BUSINESS_HUB.description,
  path: businessPagePath(''),
});

export default function BusinessHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(buildBusinessJsonLd(BUSINESS_HUB)),
        }}
      />
      <BusinessLanding page={BUSINESS_HUB} />
    </>
  );
}
