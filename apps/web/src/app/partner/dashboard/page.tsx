import {
  DashboardViewTracker,
  GeneralMetricsModule,
  PlanFeatureGate,
  WhatsappBotHomeCard,
} from '@/components/features/partner';
import { OnboardingHomeChecklist } from '@/components/features/partner-onboarding';

export default function PartnerDashboardPage() {
  return (
    <>
      <DashboardViewTracker section="overview" />
      <OnboardingHomeChecklist />
      <WhatsappBotHomeCard />
      <PlanFeatureGate module="home">
        <GeneralMetricsModule />
      </PlanFeatureGate>
    </>
  );
}
