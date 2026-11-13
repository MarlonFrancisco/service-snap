export type TUseLoyaltyProgramQueryConfig = {
  storeId: string | undefined;
  enabled?: boolean;
};

export type TUseLoyaltyProgressQueryConfig = TUseLoyaltyProgramQueryConfig & {
  customerId: string | undefined;
};
