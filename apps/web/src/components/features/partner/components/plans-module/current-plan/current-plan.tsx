'use client';

import { ReferralShareCard } from '@/components/features/referral/referral-share-card';
import { CancelReactivateDialog } from './components/cancel-reactivate-dialog';
import { CancellationWarningAlert } from './components/cancellation-warning-alert';
import { PaymentHistoryCard } from './components/payment-history-card';
import { PlanFeaturesCard } from './components/plan-features-card';
import { PlanOverviewCard } from './components/plan-overview-card';
import { useCurrentPlan } from './current-plan.hook';

export function CurrentPlan() {
  const {
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    handleCancelSubscription,
    isCancelingSubscription,
    isUpdatingSubscription,
  } = useCurrentPlan();

  return (
    <div className="space-y-8">
      <CancellationWarningAlert />

      <PlanOverviewCard
        onCancelReactivateClick={() => setIsCancelDialogOpen(true)}
      />

      <ReferralShareCard variant="partner" delay={0.08} />

      <PlanFeaturesCard delay={0.12} />

      <PaymentHistoryCard delay={0.2} />

      <CancelReactivateDialog
        isOpen={isCancelDialogOpen}
        isFetching={isCancelingSubscription || isUpdatingSubscription}
        onConfirm={handleCancelSubscription}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </div>
  );
}
