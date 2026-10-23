import { Pricing } from '@/components/features/pricing';
import { createPageMetadata } from '@/utils/helpers/site-metadata.helper';

export const metadata = createPageMetadata({
  title: 'Planos e preços | ServiceSnap',
  description:
    'Planos para profissionais e negócios gerenciarem agenda, WhatsApp e clientes no ServiceSnap.',
  path: '/pricing',
});

export default async function PricingPage() {
  return <Pricing />;
}
