import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Central de Ajuda | ServiceSnap',
  description:
    'Perguntas frequentes sobre agendamento, conta e uso do ServiceSnap.',
  path: '/help',
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
