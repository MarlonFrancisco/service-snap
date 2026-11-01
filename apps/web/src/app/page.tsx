import { Homepage } from '@/components/features/homepage';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'ServiceSnap — Agende cuidados perto de você',
  description:
    'Encontre barbearias, salões, spas e terapeutas com horário confirmado na hora.',
  path: '/',
});

export default function HomePage() {
  return <Homepage />;
}
