import { PlanFeatureGate } from '@/components/features/partner';
import { StoreAuditLogs } from '@/components/features/partner/components/audit-logs-module';

// O App Router exige export default na página
export default function PartnerAuditLogsPage() {
  return (
    <PlanFeatureGate module="auditLog">
      <StoreAuditLogs />
    </PlanFeatureGate>
  );
}
