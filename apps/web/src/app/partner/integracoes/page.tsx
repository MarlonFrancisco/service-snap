import { PlanFeatureGate } from '@/components/features/partner';
import { Integrations } from '@/components/features/partner/components/integrations-module';

// O App Router exige export default na página
export default function PartnerIntegrationsPage() {
  return (
    <PlanFeatureGate module="integrations">
      <Integrations />
    </PlanFeatureGate>
  );
}
