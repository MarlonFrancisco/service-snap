export type TUseAnamnesisFormsQueryConfig = {
  storeId?: string;
  enabled?: boolean;
};

export type TUseCustomerAnamnesisQueryConfig = TUseAnamnesisFormsQueryConfig & {
  customerId?: string;
};

export type TUseAnamnesisResponseQueryConfig = TUseAnamnesisFormsQueryConfig & {
  responseId?: string;
};
