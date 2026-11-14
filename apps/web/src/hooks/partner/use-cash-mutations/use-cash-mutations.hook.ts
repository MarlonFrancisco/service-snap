import { CashService } from '@/service/partner/cash';
import type {
  TCloseCashSession,
  TOpenCashSession,
  TRegisterPayment,
} from '@/types/api/cash.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Caixa atual, histórico e pagamentos andam juntos: qualquer pagamento novo ou
 * estornado muda os totais de todos. O primeiro item da chave é o prefixo.
 */
export const invalidateCashQueries = (
  queryClient: QueryClient,
  storeId: string,
) =>
  Promise.all(
    [
      CACHE_QUERY_KEYS.cashCurrent(storeId),
      CACHE_QUERY_KEYS.cashSessions(storeId),
      CACHE_QUERY_KEYS.payments(storeId),
    ].map((key) =>
      queryClient.invalidateQueries({ queryKey: key.slice(0, 1) }),
    ),
  );

/** Detalhe de um caixa tem chave própria por id: invalida todos da loja. */
const invalidateCashSessionDetails = (
  queryClient: QueryClient,
  storeId: string,
) =>
  queryClient.invalidateQueries({
    predicate: (query) =>
      typeof query.queryKey[0] === 'string' &&
      query.queryKey[0].startsWith(
        CACHE_QUERY_KEYS.cashSession(storeId, '')[0] as string,
      ),
  });

export const useCashMutations = ({ storeId }: { storeId: string }) => {
  const queryClient = useQueryClient();

  const refresh = () =>
    Promise.all([
      invalidateCashQueries(queryClient, storeId),
      invalidateCashSessionDetails(queryClient, storeId),
    ]);

  const openSessionMutation = useMutation({
    mutationFn: (session: TOpenCashSession) =>
      CashService.open(storeId, session),
    onSuccess: refresh,
  });

  const closeSessionMutation = useMutation({
    mutationFn: ({ id, closing }: { id: string; closing: TCloseCashSession }) =>
      CashService.close(storeId, id, closing),
    onSuccess: refresh,
  });

  const registerPaymentMutation = useMutation({
    mutationFn: (payment: TRegisterPayment) =>
      CashService.registerPayment(storeId, payment),
    onSuccess: refresh,
  });

  const voidPaymentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      CashService.voidPayment(storeId, id, reason),
    onSuccess: refresh,
  });

  return {
    openSessionMutation,
    closeSessionMutation,
    registerPaymentMutation,
    voidPaymentMutation,
  };
};
