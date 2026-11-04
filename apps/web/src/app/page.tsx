import { Homepage } from '@/components/features/homepage';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/utils/constants/site.constants';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: '/',
});

export default function HomePage() {
  return <Homepage />;
}
