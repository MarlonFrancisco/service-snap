import type {
  ICustomerPackageBalance,
  IServicePackage,
  TCreateServicePackage,
  TSellPackage,
  TUpdateServicePackage,
} from '@/types/api/packages.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

/**
 * Pacotes vendidos e cobrados fora do app. Modelos ficam com dono e gerente;
 * vender e consultar saldo, com a equipe.
 */
export class PackagesService {
  static apiClient: HttpClientService = apiClient;

  static async getAll(storeId: string) {
    return await this.apiClient.get<IServicePackage[]>(
      `/partner/stores/${storeId}/packages`,
    );
  }

  static async create(storeId: string, servicePackage: TCreateServicePackage) {
    return await this.apiClient.post<IServicePackage>(
      `/partner/stores/${storeId}/packages`,
      servicePackage,
    );
  }

  static async update(
    storeId: string,
    id: string,
    changes: TUpdateServicePackage,
  ) {
    return await this.apiClient.patch<IServicePackage>(
      `/partner/stores/${storeId}/packages/${id}`,
      changes,
    );
  }

  static async sell(storeId: string, id: string, sale: TSellPackage) {
    return await this.apiClient.post<ICustomerPackageBalance>(
      `/partner/stores/${storeId}/packages/${id}/sell`,
      sale,
    );
  }

  static async getForCustomer(storeId: string, customerId: string) {
    return await this.apiClient.get<ICustomerPackageBalance[]>(
      `/partner/stores/${storeId}/customers/${customerId}/packages`,
    );
  }

  /** Tira o saldo que sobrou; o que já foi usado fica no histórico. */
  static async cancelCustomerPackage(storeId: string, id: string) {
    return await this.apiClient.post<ICustomerPackageBalance>(
      `/partner/stores/${storeId}/customer-packages/${id}/cancel`,
      {},
    );
  }
}
