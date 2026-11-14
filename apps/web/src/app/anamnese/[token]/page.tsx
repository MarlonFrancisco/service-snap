import { AnamnesisInvitePage } from '@/components/features/anamnesis';
import type { Metadata } from 'next';

// Link pessoal com token: fora do índice e sem mandar a URL como referer
export const metadata: Metadata = {
  title: 'Ficha de saúde | ServiceSnap',
  description: 'Preencha a ficha antes do seu atendimento.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

// O App Router exige export default na página
export default async function AnamnesisPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <AnamnesisInvitePage token={token} />;
}
