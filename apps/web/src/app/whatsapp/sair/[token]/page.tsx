import { WhatsappOptOutPage } from '@/components/features/whatsapp-opt-out';
import type { Metadata } from 'next';

// Link pessoal com token: fora do índice e sem mandar a URL como referer
export const metadata: Metadata = {
  title: 'Deixar de receber por WhatsApp | ServiceSnap',
  description: 'Pare de receber os lembretes da loja pelo WhatsApp.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

// O App Router exige export default na página
export default async function WhatsappOptOutRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <WhatsappOptOutPage token={token} />;
}
