export type TUseServicePackagesQueryConfig = {
  storeId: string | undefined;
  enabled?: boolean;
};

export type TUseCustomerPackagesQueryConfig = TUseServicePackagesQueryConfig & {
  customerId: string | undefined;
};
