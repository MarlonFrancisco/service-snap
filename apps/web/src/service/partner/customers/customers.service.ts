import type {
  IStoreCustomer,
  TCreateCustomer,
  TCustomerQuery,
  TUpdateCustomer,
} from '@/types/api/customers.types';
import type { IPage, TPageQuery } from '@/types/api/pagination.types';
import type { IAppointment } from '@/types/api/schedule.types';
import { apiClient } from '../../api';
import { HttpClientService } from '../../api/http-client.service';

const toQuery = (params: Record<string, string | number | undefined>) => {
  const search = new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  );

  return search.size ? `?${search}` : '';
};

/** Clientes da loja: só dono e gerente acessam. */
export class CustomersService {
  static apiClient: HttpClientService = apiClient;

  static async getAll(storeId: string, query: TCustomerQuery = {}) {
    return await this.apiClient.get<IPage<IStoreCustomer>>(
      `/partner/stores/${storeId}/customers${toQuery({ page: 1, ...query })}`,
    );
  }

  static async getTags(storeId: string) {
    return await this.apiClient.get<string[]>(
      `/partner/stores/${storeId}/customers/tags`,
    );
  }

  static async get(storeId: string, userId: string) {
    return await this.apiClient.get<IStoreCustomer>(
      `/partner/stores/${storeId}/customers/${userId}`,
    );
  }

  static async getHistory(
    storeId: string,
    userId: string,
    query: TPageQuery = {},
  ) {
    return await this.apiClient.get<IPage<IAppointment>>(
      `/partner/stores/${storeId}/customers/${userId}/history${toQuery({ page: 1, ...query })}`,
    );
  }

  static async create(storeId: string, customer: TCreateCustomer) {
    return await this.apiClient.post<IStoreCustomer>(
      `/partner/stores/${storeId}/customers`,
      customer,
    );
  }

  static async update(storeId: string, userId: string, changes: TUpdateCustomer) {
    return await this.apiClient.patch<IStoreCustomer>(
      `/partner/stores/${storeId}/customers/${userId}`,
      changes,
    );
  }
}
