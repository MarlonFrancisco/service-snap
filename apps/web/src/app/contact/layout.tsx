import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Contato | ServiceSnap',
  description:
    'Fale com o ServiceSnap por e-mail para tirar dúvidas, pedir suporte, indicar um profissional ou cadastrar o seu negócio como parceiro.',
  path: '/contact',
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
