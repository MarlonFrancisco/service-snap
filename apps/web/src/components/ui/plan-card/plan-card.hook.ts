import { useSubscriptionMutations } from '@/hooks';
import { useUserQuery } from '@/hooks/use-query/use-user-query';
import { SubscriptionService } from '@/service/subscription';
import { useAuthStore } from '@/store/auth/auth.store';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const usePlanCard = ({ priceId }: { priceId: string }) => {
  const { isLoggedIn } = useUserQuery();
  const openAuthAction = useAuthStore((state) => state.openAuthAction);

  const { mutateAsync: createSubscription } = useMutation({
    mutationFn: (priceId: string) =>
      SubscriptionService.createSubscription(priceId),
  });

  const { createSubscriptionMutation } = useSubscriptionMutations();

  const generateSubscriptionUrl = useCallback(async () => {
    const { url } = await createSubscriptionMutation.mutateAsync(priceId);

    if (url) {
      window.location.href = url;
    } else {
      toast.error('Erro ao criar assinatura');
    }
  }, [createSubscriptionMutation, priceId]);

  const handleCreateSubscription = async () => {
    if (!isLoggedIn) {
      openAuthAction({
        onAuth: generateSubscriptionUrl,
      });

      return;
    }

    generateSubscriptionUrl();
  };

  return { handleCreateSubscription };
};
