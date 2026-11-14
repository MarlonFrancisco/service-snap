import type { IServicePackage } from '@/types/api/packages.types';

export type TSellPackageDialogConfig = {
  storeId: string;
  /** `null` fecha o diálogo. */
  servicePackage: IServicePackage | null;
  onOpenChange: (isOpen: boolean) => void;
};

export type TUseSellPackageDialogConfig = TSellPackageDialogConfig;

export type TSellCustomerOption = {
  id: string;
  name: string;
  contact: string;
};

export type TSellPackageSummaryRow = {
  label: string;
  value: string;
};
