import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Contato | ServiceSnap',
  description:
    'Fale com o ServiceSnap por e-mail. Dúvidas, suporte ou interesse em ser parceiro.',
  path: '/contact',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
