export type TNewCustomerDialogConfig = {
  storeId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export type TUseNewCustomerDialogConfig = TNewCustomerDialogConfig;
