import type { TAdminUpdateStore } from '@/types/api/admin.types';

export type TUpdateAdminStoreVariables = {
  storeId: string;
  changes: TAdminUpdateStore;
};
