import { PlanFeatureGate } from '@/components/features/partner';
import { CommissionsModule } from '@/components/features/partner/components/commissions-module';

// O App Router exige export default na página
export default function PartnerCommissionsPage() {
  return (
    <PlanFeatureGate module="commissions">
      <CommissionsModule />
    </PlanFeatureGate>
  );
}
