import type { TPaymentInput, TPaymentMethod } from './cash.types';
import type { TAppointmentStatus } from './schedule.types';

export type TCheckoutRewardType = 'percent' | 'fixed' | 'free_service';

/** Recompensa de fidelidade disponível para usar no fechamento. */
export interface ICheckoutReward {
  id: string;
  description: string;
  rewardType: TCheckoutRewardType;
  rewardValue: number | null;
  rewardServiceId: string | null;
  earnedAt: string;
  expiresOn: string | null;
  status: 'available' | 'redeemed' | 'expired';
  redeemedAt: string | null;
}

export interface ICheckoutPreviewItem {
  scheduleId: string;
  date: string;
  startTime: string;
  status: TAppointmentStatus;
  service: { id: string; name: string } | null;
  /** Preço reservado. */
  price: number;
  /** Fechamento que já inclui este atendimento. */
  checkoutId: string | null;
  /** Pacote do cliente que cobre o serviço, com o saldo antes de usar. */
  package: {
    customerPackageId: string;
    name: string;
    /** Sessões do serviço no pacote. */
    quantity: number;
    remaining: number;
  } | null;
}

export interface ICheckoutPreview {
  customer: { id: string; name: string } | null;
  items: ICheckoutPreviewItem[];
  rewards: ICheckoutReward[];
}

export interface ICheckoutItem {
  id: string;
  price: number;
  baseAmount: number;
  scheduleId: string;
  serviceName: string | null;
  fromPackage: boolean;
}

export interface ICheckout {
  id: string;
  closedAt: string;
  closedById: string | null;
  closedByName: string | null;
  subtotal: number;
  discount: number;
  total: number;
  received: number;
  notes: string | null;
  customer: { id: string; name: string } | null;
  loyaltyReward: { id: string; description: string } | null;
  items: ICheckoutItem[];
  /** Como a loja recebeu; estornados vêm com `voidedAt`. */
  payments: {
    id: string;
    method: TPaymentMethod;
    amount: number;
    voidedAt: string | null;
  }[];
}

export type TCreateCheckout = {
  scheduleIds: string[];
  payments: TPaymentInput[];
  usePackages?: boolean;
  rewardId?: string;
  discount?: number;
  notes?: string;
};
