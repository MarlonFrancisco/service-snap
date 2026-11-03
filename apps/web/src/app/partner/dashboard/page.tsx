import {
  GeneralMetricsModule,
  PlanFeatureGate,
} from '@/components/features/partner';
import { OnboardingHomeChecklist } from '@/components/features/partner-onboarding';

export default function PartnerDashboardPage() {
  return (
    <>
      <OnboardingHomeChecklist />
      <PlanFeatureGate module="home">
        <GeneralMetricsModule />
      </PlanFeatureGate>
    </>
  );
}
