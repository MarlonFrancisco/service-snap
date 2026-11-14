import type {
  ICustomerPackageBalance,
  IServicePackage,
  TPackagePaymentMethod,
} from '@/types/api/packages.types';
import type { TRetentionChipTone } from './packages-module.styles';

export type TRetentionChip = {
  label: string;
  tone: TRetentionChipTone;
};

export type TPaymentMethodOption = {
  value: TPackagePaymentMethod;
  label: string;
};

/** Linha da lista de pacotes à venda, já formatada. */
export type TPackageRow = {
  id: string;
  name: string;
  /** "4 × Corte · vale 30 dias" */
  summary: string;
  price: string;
  chip: TRetentionChip;
  isActive: boolean;
  source: IServicePackage;
};

/** Situação de tela: o que mostrar antes da lista. */
export type TRetentionView =
  | 'loading'
  | 'no-store'
  | 'no-access'
  | 'error'
  | 'ready';

export type TCustomerPackageItemView = {
  id: string;
  serviceName: string;
  /** "restam 3 de 4" */
  balanceLabel: string;
  /** 0 a 100: quanto já foi usado. */
  usedPercent: number;
};

export type TCustomerPackageView = {
  id: string;
  name: string;
  /** "Comprado em dd/mm · vence em dd/mm" ou "Venceu em dd/mm · 1 sessão sem uso" */
  summary: string;
  chip: TRetentionChip;
  /** Ativo, dentro da validade e com saldo: dá para cancelar. */
  isUsable: boolean;
  items: TCustomerPackageItemView[];
  usages: TCustomerPackageUsageView[];
  source: ICustomerPackageBalance;
};

export type TCustomerPackageUsageView = {
  id: string;
  /** "12/11 · Corte" */
  title: string;
  /** "Atendimento com Paulo" */
  detail: string;
};
