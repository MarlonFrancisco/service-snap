import { MarketingOptOutPage } from '@/components/features/marketing-opt-out';
import type { Metadata } from 'next';

// Link pessoal com token: fora do índice e sem mandar a URL como referer
export const metadata: Metadata = {
  title: 'Sair da lista | ServiceSnap',
  description: 'Pare de receber campanhas da loja.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

// O App Router exige export default na página
export default async function MarketingOptOutRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <MarketingOptOutPage token={token} />;
}
