import { roundMoney } from '../../../../utils/helpers/money.helpers';
import { toDateKey } from '../../../../utils/helpers/schedule.helpers';
import { getUserFullName } from '../../../../utils/helpers/user.helpers';
import type { CheckoutItem } from '../checkout/checkout.entity';
import type {
  CustomerPackage,
  CustomerPackageItem,
} from './customer-package.entity';
import type {
  TCustomerPackageBalance,
  TCustomerPackageUsage,
} from './packages.types';

export const isPackageExpired = (
  customerPackage: Pick<CustomerPackage, 'expiresOn'>,
  today: string,
) => Boolean(customerPackage.expiresOn && customerPackage.expiresOn < today);

export const toPackageBalance = (
  customerPackage: CustomerPackage,
  today: string,
  usages: TCustomerPackageUsage[] = [],
): TCustomerPackageBalance => ({
  id: customerPackage.id,
  name: customerPackage.name,
  status: customerPackage.status,
  expiresOn: customerPackage.expiresOn,
  isExpired: isPackageExpired(customerPackage, today),
  pricePaid: customerPackage.pricePaid,
  purchasedAt: customerPackage.purchasedAt,
  items: (customerPackage.items ?? []).map((item) => ({
    id: item.id,
    serviceId: item.service?.id ?? null,
    serviceName: item.serviceName,
    quantity: item.quantity,
    used: item.used,
    remaining: Math.max(item.quantity - item.used, 0),
  })),
  usages,
});

/** Uso de uma sessão a partir do item do fechamento que a consumiu. */
export const toPackageUsage = (item: CheckoutItem): TCustomerPackageUsage => ({
  checkoutItemId: item.id,
  date: toDateKey(item.schedule.date),
  serviceName:
    item.schedule.service?.name ?? item.customerPackageItem?.serviceName ?? '',
  professionalName: item.schedule.storeMember?.user
    ? getUserFullName(item.schedule.storeMember.user)
    : null,
});

/**
 * Sessão para dar baixa: pacote ativo, dentro da validade, com saldo do
 * serviço. Entre vários, o que vence primeiro (sem validade fica por último).
 */
export const pickPackageItem = (
  packages: CustomerPackage[],
  serviceId: string,
  today: string,
): CustomerPackageItem | null => {
  const usable = packages
    .filter(
      (customerPackage) =>
        customerPackage.status === 'active' &&
        !isPackageExpired(customerPackage, today),
    )
    .sort((a, b) =>
      (a.expiresOn ?? '9999-12-31').localeCompare(b.expiresOn ?? '9999-12-31'),
    );

  for (const customerPackage of usable) {
    const item = customerPackage.items.find(
      (candidate) =>
        candidate.service?.id === serviceId &&
        candidate.used < candidate.quantity,
    );

    if (item) return Object.assign(item, { customerPackage });
  }

  return null;
};

/** Valor de uma sessão: preço pago dividido pelo total de sessões do pacote. */
export const getSessionValue = (customerPackage: CustomerPackage) => {
  const sessions = customerPackage.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return sessions ? roundMoney(customerPackage.pricePaid / sessions) : 0;
};
