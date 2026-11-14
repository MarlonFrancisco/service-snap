import type {
  ICustomerPackageBalance,
  IServicePackage,
  TPackagePaymentMethod,
} from '@/types/api/packages.types';
import { formatDay } from '../customers-module/customers-module.helpers';
import { parseMoneyInput } from '../dashboard-module/utils/metrics.helpers';
import type {
  TCustomerPackageView,
  TPaymentMethodOption,
  TRetentionChip,
} from './packages-module.types';

export const PAYMENT_METHOD_OPTIONS: readonly TPaymentMethodOption[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'credit_card', label: 'Cartão de crédito' },
  { value: 'debit_card', label: 'Cartão de débito' },
  { value: 'other', label: 'Outro' },
];

export const DEFAULT_PAYMENT_METHOD: TPackagePaymentMethod = 'pix';

export const MAX_PACKAGE_ITEMS = 20;
export const MAX_PACKAGE_QUANTITY = 100;
export const MAX_PACKAGE_VALIDITY_DAYS = 3650;

const pluralize = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

export const formatSessions = (count: number) =>
  pluralize(count, 'sessão', 'sessões');

/** "4 × Corte, 4 × Barba" */
export const formatPackageItems = (
  items: { quantity: number; name: string }[],
) => items.map((item) => `${item.quantity} × ${item.name}`).join(', ');

export const formatValidity = (validityDays: number | null) =>
  validityDays
    ? `vale ${pluralize(validityDays, 'dia', 'dias')}`
    : 'sem validade';

export const getPackageItemsLabel = (servicePackage: IServicePackage) =>
  formatPackageItems(
    servicePackage.items.map((item) => ({
      quantity: item.quantity,
      name: item.service.name,
    })),
  );

/** `YYYY-MM-DD` para `dd/mm`, sem passar por `Date`. */
export const formatShortDay = (day: string | null | undefined) =>
  formatDay(day).slice(0, 5);

/** Instante (ISO) para `dd/mm` no fuso da loja. */
export const formatShortDate = (
  value: string | null | undefined,
  timeZone?: string,
) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(timeZone && { timeZone }),
  }).format(date);
};

/** Hoje (`YYYY-MM-DD`) no fuso da loja, como a API conta a validade. */
export const getStoreToday = (timeZone?: string) => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(timeZone && { timeZone }),
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat('en-CA').format(new Date());
  }
};

export const addDaysToDay = (day: string, days: number) => {
  const [year = 1970, month = 1, date = 1] = day.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, date + days));

  return next.toISOString().slice(0, 10);
};

/** Último dia de uso de um pacote vendido hoje: a venda conta como o 1º dia. */
export const getPackageExpiryLabel = (
  validityDays: number | null,
  timeZone?: string,
) =>
  validityDays
    ? formatDay(addDaysToDay(getStoreToday(timeZone), validityDays - 1))
    : 'Não vence';

/** Valor digitado em dinheiro, com duas casas; `null` quando não é número. */
export const parseMoney = (raw: string) => {
  const value = parseMoneyInput(raw);

  return value === null ? null : Math.round(value * 100) / 100;
};

/** Número para o campo: `49,9` vira `49,90`. */
export const toMoneyInput = (value: number) =>
  value.toFixed(2).replace('.', ',');

export const getPackageChip = (isActive: boolean): TRetentionChip =>
  isActive
    ? { label: 'À venda', tone: 'ok' }
    : { label: 'Pausado', tone: 'neutral' };

const getRemaining = (balance: ICustomerPackageBalance) =>
  balance.items.reduce((total, item) => total + item.remaining, 0);

const getBalanceChip = (balance: ICustomerPackageBalance): TRetentionChip => {
  if (balance.status === 'cancelled') {
    return { label: 'Cancelado', tone: 'error' };
  }
  if (balance.isExpired) return { label: 'Vencido', tone: 'neutral' };
  if (getRemaining(balance) === 0) return { label: 'Usado', tone: 'info' };

  return { label: 'Ativo', tone: 'ok' };
};

const getBalanceSummary = (
  balance: ICustomerPackageBalance,
  timeZone?: string,
) => {
  const unused = getRemaining(balance);
  const unusedLabel = `${formatSessions(unused)} sem uso`;

  if (balance.status === 'cancelled') {
    return unused ? `Cancelado · ${unusedLabel}` : 'Cancelado';
  }
  if (balance.isExpired) {
    return `Venceu em ${formatShortDay(balance.expiresOn)} · ${unusedLabel}`;
  }

  const purchased = `Comprado em ${formatShortDate(balance.purchasedAt, timeZone)}`;

  return balance.expiresOn
    ? `${purchased} · vence em ${formatShortDay(balance.expiresOn)}`
    : `${purchased} · não vence`;
};

export const toCustomerPackageView = (
  balance: ICustomerPackageBalance,
  timeZone?: string,
): TCustomerPackageView => {
  const isUsable =
    balance.status === 'active' &&
    !balance.isExpired &&
    getRemaining(balance) > 0;

  return {
    id: balance.id,
    name: balance.name,
    summary: getBalanceSummary(balance, timeZone),
    chip: getBalanceChip(balance),
    isUsable,
    items: balance.items.map((item) => ({
      id: item.id,
      serviceName: item.serviceName,
      balanceLabel: `restam ${item.remaining} de ${item.quantity}`,
      usedPercent: item.quantity
        ? Math.round((Math.min(item.used, item.quantity) / item.quantity) * 100)
        : 0,
    })),
    usages: (balance.usages ?? []).map((usage) => ({
      id: usage.checkoutItemId,
      title: `${formatShortDay(usage.date)} · ${usage.serviceName}`,
      detail: usage.professionalName
        ? `Atendimento com ${usage.professionalName}`
        : 'Atendimento',
    })),
    source: balance,
  };
};
