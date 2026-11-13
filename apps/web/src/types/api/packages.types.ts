/** Formas de receber, fora do app: o ServiceSnap não cobra o cliente. */
export type TPackagePaymentMethod =
  | 'cash'
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'other';

export interface IServicePackageItem {
  id: string;
  quantity: number;
  service: { id: string; name: string; price?: number };
}

/** Modelo de pacote que a loja vende (ex.: 4 cortes em 30 dias). */
export interface IServicePackage {
  id: string;
  name: string;
  description: string | null;
  /** Preço de tabela; o cobrado de cada cliente fica no pacote vendido. */
  price: number;
  /** Dias de validade a partir da venda; `null` não vence. */
  validityDays: number | null;
  isActive: boolean;
  items: IServicePackageItem[];
  createdAt: string;
  updatedAt: string;
}

export type TPackageItemInput = {
  serviceId: string;
  /** 1 a 100. */
  quantity: number;
};

export type TCreateServicePackage = {
  name: string;
  description?: string;
  price: number;
  validityDays?: number | null;
  items: TPackageItemInput[];
};

export type TUpdateServicePackage = Partial<TCreateServicePackage> & {
  isActive?: boolean;
};

export type TPackagePaymentInput = {
  method: TPackagePaymentMethod;
  amount: number;
  notes?: string;
};

/** Contato de quem ainda não é cliente da loja: telefone ou e-mail. */
export type TPackageNewCustomer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  telephone?: string;
};

export type TSellPackage = {
  customerId?: string;
  customer?: TPackageNewCustomer;
  /** Sem valor, vale o preço de tabela. */
  pricePaid?: number;
  /** O que o cliente pagou agora, registrado no caixa. */
  payments?: TPackagePaymentInput[];
  notes?: string;
};

export type TCustomerPackageStatus = 'active' | 'cancelled';

export interface ICustomerPackageBalanceItem {
  id: string;
  serviceId: string | null;
  serviceName: string;
  quantity: number;
  used: number;
  remaining: number;
}

/** Pacote vendido, com o saldo de cada serviço. */
export interface ICustomerPackageBalance {
  id: string;
  name: string;
  status: TCustomerPackageStatus;
  /** `YYYY-MM-DD`; `null` não vence. */
  expiresOn: string | null;
  isExpired: boolean;
  pricePaid: number;
  purchasedAt: string;
  items: ICustomerPackageBalanceItem[];
  /** Sessões usadas, das mais recentes. */
  usages: ICustomerPackageUsage[];
}

/** Uma sessão usada, vinda do fechamento do atendimento. */
export interface ICustomerPackageUsage {
  checkoutItemId: string;
  /** `YYYY-MM-DD` */
  date: string;
  serviceName: string;
  professionalName: string | null;
}
