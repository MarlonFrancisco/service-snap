import {
  PlanFeatureGate,
  WhatsappConnectGuide,
} from '@/components/features/partner';
import { parseGuideStep } from '@/components/features/partner/components/whatsapp-settings-module/whatsapp-connect-guide';

export default async function WhatsappConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string | string[] }>;
}) {
  const { step } = await searchParams;

  return (
    <PlanFeatureGate module="whatsappIntegration">
      <WhatsappConnectGuide initialStep={parseGuideStep(step)} />
    </PlanFeatureGate>
  );
}
