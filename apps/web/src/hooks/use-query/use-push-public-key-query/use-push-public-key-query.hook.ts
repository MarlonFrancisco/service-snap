import { PushService } from '@/service/push';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import { useQuery } from '@tanstack/react-query';

/** A chave VAPID só muda num deploy: uma leitura por sessão basta. */
export const usePushPublicKeyQuery = ({ enabled }: { enabled: boolean }) => {
  const { data: pushPublicKey, isPending } = useQuery({
    queryKey: CACHE_QUERY_KEYS.pushPublicKey(),
    queryFn: () => PushService.getPublicKey(),
    enabled,
    staleTime: Infinity,
    retry: 1,
  });

  return {
    isPushEnabled: Boolean(pushPublicKey?.enabled && pushPublicKey.publicKey),
    pushPublicKey: pushPublicKey?.publicKey ?? null,
    isPushPublicKeyPending: enabled && isPending,
  };
};
