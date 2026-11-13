export type TCustomerPackageStatus = 'active' | 'cancelled';

/** Saldo de um pacote com o que ainda dá para usar. */
export type TCustomerPackageBalance = {
  id: string;
  name: string;
  status: TCustomerPackageStatus;
  expiresOn: string | null;
  isExpired: boolean;
  pricePaid: number;
  purchasedAt: Date;
  items: {
    id: string;
    serviceId: string | null;
    serviceName: string;
    quantity: number;
    used: number;
    remaining: number;
  }[];
  /** Sessões usadas, das mais recentes: vêm dos fechamentos de atendimento. */
  usages: TCustomerPackageUsage[];
};

export type TCustomerPackageUsage = {
  checkoutItemId: string;
  date: string;
  serviceName: string;
  professionalName: string | null;
};
