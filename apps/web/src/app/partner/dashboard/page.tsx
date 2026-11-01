import { GeneralMetricsModule } from '@/components/features/partner';
import { OnboardingHomeChecklist } from '@/components/features/partner-onboarding';

export default function PartnerDashboardPage() {
  return (
    <>
      <OnboardingHomeChecklist />
      <GeneralMetricsModule />
    </>
  );
}
