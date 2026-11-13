import type { IServicePackage } from '@/types/api/packages.types';

export type TPackageFormDialogConfig = {
  storeId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** `null` cria um pacote novo. */
  servicePackage: IServicePackage | null;
};

export type TUsePackageFormDialogConfig = TPackageFormDialogConfig;
