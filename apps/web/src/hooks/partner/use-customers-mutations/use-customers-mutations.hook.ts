import { CustomersService } from '@/service/partner/customers';
import type {
  IStoreCustomer,
  TCreateCustomer,
  TUpdateCustomer,
} from '@/types/api/customers.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Lista, ficha, histórico e etiquetas dividem o mesmo prefixo: invalidar ele
 * recarrega tudo de clientes da loja.
 */
export const invalidateCustomers = (
  queryClient: QueryClient,
  storeId: string,
) =>
  queryClient.invalidateQueries({
    queryKey: CACHE_QUERY_KEYS.customers(storeId).slice(0, 1),
  });

export const useCustomersMutations = ({ storeId }: { storeId: string }) => {
  const queryClient = useQueryClient();

  const createCustomerMutation = useMutation({
    mutationFn: (customer: TCreateCustomer) =>
      CustomersService.create(storeId, customer),
    onSuccess: () => invalidateCustomers(queryClient, storeId),
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({
      userId,
      changes,
    }: {
      userId: string;
      changes: TUpdateCustomer;
    }) => CustomersService.update(storeId, userId, changes),
    onSuccess: (customer: IStoreCustomer) => {
      // A ficha já volta pronta: mostra na hora, sem esperar a releitura
      queryClient.setQueryData(
        CACHE_QUERY_KEYS.customer(storeId, customer.id),
        customer,
      );
      return invalidateCustomers(queryClient, storeId);
    },
  });

  return { createCustomerMutation, updateCustomerMutation };
};
