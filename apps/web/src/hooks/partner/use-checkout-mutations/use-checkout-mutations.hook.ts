import { CheckoutService } from '@/service/partner/checkout';
import type { TCreateCheckout } from '@/types/api/checkout.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invalidateCashQueries } from '../use-cash-mutations/use-cash-mutations.hook';

/**
 * Fechar ou desfazer mexe na agenda, no caixa, nas comissões, no pacote e na
 * fidelidade do cliente. O primeiro item da chave é o prefixo de cada uma.
 */
const invalidateAfterCheckout = (
  queryClient: QueryClient,
  storeId: string,
  customerId?: string | null,
) =>
  Promise.all([
    invalidateCashQueries(queryClient, storeId),
    ...[
      CACHE_QUERY_KEYS.schedules(storeId),
      CACHE_QUERY_KEYS.customers(storeId),
      CACHE_QUERY_KEYS.checkoutPreview(storeId, []),
      CACHE_QUERY_KEYS.commissionReport(storeId),
      CACHE_QUERY_KEYS.myCommissions(storeId),
      ...(customerId
        ? [
            CACHE_QUERY_KEYS.customerPackages(storeId, customerId),
            CACHE_QUERY_KEYS.loyaltyProgress(storeId, customerId),
          ]
        : []),
    ].map((key) =>
      queryClient.invalidateQueries({ queryKey: key.slice(0, 1) }),
    ),
  ]);

export const useCheckoutMutations = ({ storeId }: { storeId: string }) => {
  const queryClient = useQueryClient();

  const createCheckoutMutation = useMutation({
    mutationFn: (checkout: TCreateCheckout) =>
      CheckoutService.create(storeId, checkout),
    onSuccess: (checkout) => {
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.checkout(storeId, checkout.id),
        checkout,
      );
      return invalidateAfterCheckout(
        queryClient,
        storeId,
        checkout.customer?.id,
      );
    },
  });

  const undoCheckoutMutation = useMutation({
    mutationFn: ({ id }: { id: string; customerId?: string | null }) =>
      CheckoutService.undo(storeId, id),
    onSuccess: (_data, { id, customerId }) => {
      queryClient.removeQueries({
        queryKey: CACHE_QUERY_KEYS.checkout(storeId, id),
      });
      return invalidateAfterCheckout(queryClient, storeId, customerId);
    },
  });

  return { createCheckoutMutation, undoCheckoutMutation };
};
