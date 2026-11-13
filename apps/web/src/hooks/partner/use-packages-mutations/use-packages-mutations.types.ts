import type {
  TSellPackage,
  TUpdateServicePackage,
} from '@/types/api/packages.types';

export type TUsePackagesMutationsConfig = {
  storeId: string;
};

export type TUpdatePackageVariables = {
  id: string;
  changes: TUpdateServicePackage;
};

export type TSellPackageVariables = {
  packageId: string;
  sale: TSellPackage;
};

export type TCancelCustomerPackageVariables = {
  customerPackageId: string;
  customerId: string;
};
