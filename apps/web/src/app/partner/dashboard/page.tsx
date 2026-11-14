import {
  DashboardViewTracker,
  GeneralMetricsModule,
  PlanFeatureGate,
  WhatsappBotHomeCard,
} from '@/components/features/partner';
import { PushAlerts } from '@/components/features/partner/components/push-alerts';
import { OnboardingHomeChecklist } from '@/components/features/partner-onboarding';

export default function PartnerDashboardPage() {
  return (
    <>
      <PushAlerts />
      <DashboardViewTracker section="overview" />
      <OnboardingHomeChecklist />
      <WhatsappBotHomeCard />
      <PlanFeatureGate module="home">
        <GeneralMetricsModule />
      </PlanFeatureGate>
    </>
  );
}
