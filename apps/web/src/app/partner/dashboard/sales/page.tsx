import {
  SalesRevenueMetricsModule,
  PlanFeatureGate,
} from '@/components/features/partner';

export default function PartnerDashboardSalesPage() {
  return (
    <PlanFeatureGate module="sales">
      <SalesRevenueMetricsModule />
    </PlanFeatureGate>
  );
}
