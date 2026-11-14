import { invalidateCustomers } from '@/hooks/partner/use-customers-mutations';
import { PackagesService } from '@/service/partner/packages';
import type { TCreateServicePackage } from '@/types/api/packages.types';
import { CACHE_QUERY_KEYS } from '@/utils/helpers/query.helper';
import type { QueryClient } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  TCancelCustomerPackageVariables,
  TSellPackageVariables,
  TUpdatePackageVariables,
  TUsePackagesMutationsConfig,
} from './use-packages-mutations.types';

/** Toda ficha de cliente da loja: na venda para cliente novo, o id ainda não existe. */
const invalidateAllCustomerPackages = (
  queryClient: QueryClient,
  storeId: string,
) => {
  const prefix = `partner/stores/${storeId}/packages/customers/`;

  return queryClient.invalidateQueries({
    predicate: ({ queryKey }) =>
      typeof queryKey[0] === 'string' && queryKey[0].startsWith(prefix),
  });
};

export const usePackagesMutations = ({
  storeId,
}: TUsePackagesMutationsConfig) => {
  const queryClient = useQueryClient();

  const invalidatePackages = () =>
    queryClient.invalidateQueries({
      queryKey: CACHE_QUERY_KEYS.servicePackages(storeId),
    });

  const createPackageMutation = useMutation({
    mutationFn: (servicePackage: TCreateServicePackage) =>
      PackagesService.create(storeId, servicePackage),
    onSuccess: invalidatePackages,
  });

  const updatePackageMutation = useMutation({
    mutationFn: ({ id, changes }: TUpdatePackageVariables) =>
      PackagesService.update(storeId, id, changes),
    onSuccess: invalidatePackages,
  });

  const sellPackageMutation = useMutation({
    mutationFn: ({ packageId, sale }: TSellPackageVariables) =>
      PackagesService.sell(storeId, packageId, sale),
    onSuccess: () =>
      Promise.all([
        invalidateAllCustomerPackages(queryClient, storeId),
        // Cliente novo entra na lista; o pagamento entra no caixa
        invalidateCustomers(queryClient, storeId),
        queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.cashCurrent(storeId),
        }),
        queryClient.invalidateQueries({
          queryKey: CACHE_QUERY_KEYS.payments(storeId).slice(0, 1),
        }),
      ]),
  });

  const cancelCustomerPackageMutation = useMutation({
    mutationFn: ({ customerPackageId }: TCancelCustomerPackageVariables) =>
      PackagesService.cancelCustomerPackage(storeId, customerPackageId),
    onSuccess: (_, { customerId }) =>
      queryClient.invalidateQueries({
        queryKey: CACHE_QUERY_KEYS.customerPackages(storeId, customerId),
      }),
  });

  return {
    createPackageMutation,
    updatePackageMutation,
    sellPackageMutation,
    cancelCustomerPackageMutation,
  };
};
