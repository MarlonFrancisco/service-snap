import type {
  ICheckoutPreviewItem,
  ICheckoutReward,
} from '@/types/api/checkout.types';
import type { IAppointment } from '@/types/api/schedule.types';

/** A visita aberta na agenda: o atendimento clicado e os serviços dela. */
export type TCheckoutVisitConfig = {
  appointment: IAppointment;
  items: IAppointment[];
};

/** Um atendimento no cálculo da tela, já sabendo se sai do pacote. */
export type TCheckoutLineView = {
  scheduleId: string;
  serviceId: string | null;
  serviceName: string;
  price: number;
  fromPackage: boolean;
  /** "Sai do pacote 4 cortes · restam 3" ou "Preço reservado". */
  description: string;
};

export type TCheckoutRewardView = ICheckoutReward & {
  /** Desconto que daria nesta visita; `null` quando não se aplica. */
  discount: number | null;
  details: string;
};

export type TCheckoutTotals = {
  subtotal: number;
  rewardDiscount: number;
  discount: number;
  total: number;
};

export type TCheckoutPreviewItems = ICheckoutPreviewItem[];
