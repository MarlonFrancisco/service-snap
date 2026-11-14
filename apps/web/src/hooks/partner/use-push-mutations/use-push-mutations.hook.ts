import { PushDeviceService } from '@/service/push';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

/** Assinar e cancelar os avisos deste aparelho. A permissão é pedida antes, no clique. */
export const usePushMutations = ({
  onSubscribed,
  onUnsubscribed,
}: {
  onSubscribed: (subscription: PushSubscription) => void;
  onUnsubscribed: () => void;
}) => {
  const { mutate: subscribePush, isPending: isSubscribePending } = useMutation({
    mutationFn: (publicKey: string) => PushDeviceService.subscribe(publicKey),
    onSuccess: (subscription) => {
      onSubscribed(subscription);
      toast.success('Avisos ativados neste aparelho.');
    },
    onError: () => {
      toast.error('Não foi possível ativar os avisos. Tente novamente.');
    },
  });

  const { mutate: unsubscribePush, isPending: isUnsubscribePending } =
    useMutation({
      mutationFn: () => PushDeviceService.unsubscribe(),
      onSuccess: () => {
        onUnsubscribed();
        toast.success('Avisos desativados neste aparelho.');
      },
      onError: () => {
        toast.error('Não foi possível desativar os avisos. Tente novamente.');
      },
    });

  return {
    subscribePush,
    isSubscribePending,
    unsubscribePush,
    isUnsubscribePending,
  };
};
