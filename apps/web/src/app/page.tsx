import { Homepage } from '@/components/features/homepage';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/utils/constants/site.constants';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: '/',
});

// ISR: as vitrines são refeitas em segundo plano a cada 10 min.
export const revalidate = 600;

export default function HomePage() {
  return <Homepage />;
}
