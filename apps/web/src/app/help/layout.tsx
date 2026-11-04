import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Central de Ajuda | ServiceSnap',
  description:
    'Tire dúvidas sobre como agendar e cancelar horários, como funcionam as avaliações e como cadastrar o seu negócio como parceiro no ServiceSnap.',
  path: '/help',
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
