import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Buscar serviços | ServiceSnap',
  description:
    'Busque profissionais e agende serviços perto de você no ServiceSnap.',
  path: '/booking',
});

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
