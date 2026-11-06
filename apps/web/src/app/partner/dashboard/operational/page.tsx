import {
  OperationalMetricsModule,
  DashboardViewTracker,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function PartnerDashboardOperationalPage() {
  return (
    <>
      <DashboardViewTracker section="operational" />
      <PlanFeatureGate module="operational">
        <OperationalMetricsModule />
      </PlanFeatureGate>
    </>
  );
}
