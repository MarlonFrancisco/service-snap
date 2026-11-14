'use client';

import { ReferralClientPanel } from '@/components/features/referral/referral-share-card/components/referral-client-panel';
import { BillingCard } from './components/billing-card';
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
    // Desktop largo: plano no topo; recursos e histórico à esquerda, indicação à direita.
    <div className="grid items-start gap-4 min-[1280px]:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
      <CancellationWarningAlert />

      <PlanOverviewCard
        onCancelReactivateClick={() => setIsCancelDialogOpen(true)}
      />

      <div className="grid min-w-0 content-start gap-4">
        <BillingCard />
        <PlanFeaturesCard />
        <PaymentHistoryCard />
      </div>

      <ReferralClientPanel {...referralShare} isSticky={false} />

      <CancelReactivateDialog
        isOpen={isCancelDialogOpen}
        isFetching={isCancelingSubscription || isUpdatingSubscription}
        onConfirm={handleCancelSubscription}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
    </div>
  );
}
