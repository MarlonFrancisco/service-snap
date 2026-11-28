import { PlanFeatureGate } from '@/components/features/partner';
import { CampaignsModule } from '@/components/features/partner/components/campaigns-module';

// O App Router exige export default na página
export default function PartnerCampaignsPage() {
  return (
    <PlanFeatureGate module="campaigns">
      <CampaignsModule />
    </PlanFeatureGate>
  );
}
