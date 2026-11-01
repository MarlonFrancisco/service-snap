'use client';

import { ReferralClientPanel } from '@/components/features/referral/referral-share-card/components/referral-client-panel';
import { CancelReactivateDialog } from './components/cancel-reactivate-dialog';
import { CancellationWarningAlert } from './components/cancellation-warning-alert';
import { PaymentHistoryCard } from './components/payment-history-card';
import { PlanFeaturesCard } from './components/plan-features-card';
import { PlanOverviewCard } from './components/plan-overview-card';
import { useCurrentPlan } from './current-plan.hook';

export function CurrentPlan() {
  const {
    referralShare,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    handleCancelSubscription,
    isCancelingSubscription,
    isUpdatingSubscription,
  } = useCurrentPlan();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] items-start gap-4">
      <CancellationWarningAlert />

      <PlanOverviewCard
        onCancelReactivateClick={() => setIsCancelDialogOpen(true)}
      />

      <ReferralClientPanel {...referralShare} />

      <PlanFeaturesCard />

      <PaymentHistoryCard />

      <CancelReactivateDialog
        isOpen={isCancelDialogOpen}
        isFetching={isCancelingSubscription || isUpdatingSubscription}
        onConfirm={handleCancelSubscription}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </div>
  );
}
