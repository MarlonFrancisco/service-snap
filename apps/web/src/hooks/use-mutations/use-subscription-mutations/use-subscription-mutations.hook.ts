import { useAnalytics } from '@/providers/analytics.provider';
import { SubscriptionService } from '@/service/subscription/subscription.service';
import { IMySubscription } from '@/types/api';
import { toBillingPeriod } from '@/utils/helpers/analytics.helper';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useSubscriptionMutations = () => {
  const queryClient = useQueryClient();
  const analytics = useAnalytics();

  const getCachedPlan = () =>
    queryClient.getQueryData<IMySubscription>(CACHE_QUERY_KEYS.currentPlan());

  const createSubscriptionMutation = useMutation({
    mutationFn: (priceId: string) =>
      SubscriptionService.createSubscription(priceId),
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => SubscriptionService.cancelSubscription(),
    onSuccess: (data) => {
      if (data.cancelAtPeriodEnd) {
        const plan = getCachedPlan();
        if (plan?.planId) {
          analytics.track('subscription_cancel_scheduled', {
            plan_id: plan.planId,
            billing_period: plan.billingPeriod
              ? toBillingPeriod(plan.billingPeriod)
              : undefined,
          });
        }
        queryClient.setQueryData(
          CACHE_QUERY_KEYS.currentPlan(),
          (old: IMySubscription) => ({
            ...old,
            cancelAtPeriodEnd: true,
          }),
        );
        toast.success('Plano cancelado com sucesso');
      } else {
        analytics.track('subscription_cancel_failed', {});
        toast.error('Erro ao cancelar plano');
      }
    },
    onError: () => {
      analytics.track('subscription_cancel_failed', {});
      toast.error('Erro ao cancelar plano');
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ cancelAtPeriodEnd }: { cancelAtPeriodEnd: boolean }) =>
      SubscriptionService.updateSubscription({ cancelAtPeriodEnd }),
    onSuccess: (data, { cancelAtPeriodEnd }) => {
      if (!cancelAtPeriodEnd) {
        analytics.track('subscription_reactivated', {
          plan_id: getCachedPlan()?.planId,
        });
      }
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.currentPlan(),
        (old: IMySubscription) => ({
          ...old,
          ...data,
        }),
      );
      toast.success('Plano atualizado com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar plano');
    },
  });

  return {
    createSubscriptionMutation,
    cancelSubscriptionMutation,
    updateSubscriptionMutation,
  };
};
