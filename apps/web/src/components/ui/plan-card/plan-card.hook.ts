import { useSubscriptionMutations } from '@/hooks';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { useAnalytics } from '@/providers/analytics.provider';
import { SubscriptionService } from '@/service/subscription';
import { useAuthStore } from '@/store/auth/auth.store';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const usePlanCard = ({ priceId }: { priceId: string }) => {
  const { isLoggedIn } = useUserQuery();
  const openAuthAction = useAuthStore((state) => state.openAuthAction);
  const analytics = useAnalytics();

  const { mutateAsync: createSubscription } = useMutation({
    mutationFn: (priceId: string) =>
      SubscriptionService.createSubscription(priceId),
  });

  const { createSubscriptionMutation } = useSubscriptionMutations();

  const generateSubscriptionUrl = useCallback(async () => {
    try {
      const { url } = await createSubscriptionMutation.mutateAsync(priceId);

      if (url) {
        analytics.track('add_payment_info', { price_id: priceId });
        window.location.href = url;
      } else {
        analytics.track('checkout_failed', {
          reason: 'no_url',
          source: 'pricing',
        });
        toast.error('Erro ao criar assinatura');
      }
    } catch (error) {
      analytics.track('checkout_failed', {
        reason: 'api_error',
        source: 'pricing',
      });
      throw error;
    }
  }, [createSubscriptionMutation, priceId, analytics]);

  const handleCreateSubscription = async () => {
    if (!isLoggedIn) {
      openAuthAction({
        source: 'plan',
        onAuth: generateSubscriptionUrl,
      });

      return;
    }

    generateSubscriptionUrl();
  };

  return { handleCreateSubscription };
};
