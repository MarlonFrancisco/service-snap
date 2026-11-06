import {
  SalesRevenueMetricsModule,
  DashboardViewTracker,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function PartnerDashboardSalesPage() {
  return (
    <>
      <DashboardViewTracker section="sales" />
      <PlanFeatureGate module="sales">
        <SalesRevenueMetricsModule />
      </PlanFeatureGate>
    </>
  );
}
