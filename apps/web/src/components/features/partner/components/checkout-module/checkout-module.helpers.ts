import type { ICheckoutReward } from '@/types/api/checkout.types';
import type { TAppointmentStatus } from '@/types/api/schedule.types';
import {
  formatDateKey,
  getErrorMessage,
  getErrorStatus,
  roundMoney,
  sumMoney,
  toDateKey,
} from '../cash-module/cash-module.helpers';
import type {
  TCheckoutLineView,
  TCheckoutPreviewItems,
  TCheckoutTotals,
} from './checkout-module.types';

/** Cancelado e não compareceu não fecham. */
export const CHECKOUT_STATUSES: readonly TAppointmentStatus[] = [
  'scheduled',
  'completed',
];

export const MAX_CHECKOUT_PAYMENTS = 5;

/**
 * Atendimentos com o pacote aplicado como a API faz: uma sessão por
 * atendimento, enquanto houver saldo.
 */
export const buildCheckoutLines = (
  items: TCheckoutPreviewItems,
  usePackages: boolean,
): TCheckoutLineView[] => {
  const usedByPackage = new Map<string, number>();

  return items.map((item) => {
    const used = item.package
      ? usedByPackage.get(item.package.customerPackageId) ?? 0
      : 0;
    const fromPackage =
      usePackages && !!item.package && item.package.remaining > used;

    if (fromPackage && item.package) {
      usedByPackage.set(item.package.customerPackageId, used + 1);
    }

    return {
      scheduleId: item.scheduleId,
      serviceId: item.service?.id ?? null,
      serviceName: item.service?.name ?? 'Serviço',
      price: item.price,
      fromPackage,
      description:
        fromPackage && item.package
          ? `Sai do pacote ${item.package.name} · restam ${item.package.remaining - used - 1} de ${item.package.quantity}`
          : 'Preço reservado',
    };
  });
};

/** Desconto da recompensa; serviço grátis só vale com o serviço na visita. */
export const getRewardDiscount = (
  reward: Pick<
    ICheckoutReward,
    'rewardType' | 'rewardValue' | 'rewardServiceId'
  >,
  charged: TCheckoutLineView[],
): number | null => {
  const subtotal = sumMoney(charged.map((line) => line.price));

  if (reward.rewardType === 'percent') {
    return roundMoney((subtotal * (reward.rewardValue ?? 0)) / 100);
  }
  if (reward.rewardType === 'fixed') {
    return roundMoney(Math.min(reward.rewardValue ?? 0, subtotal));
  }

  const line = charged.find(
    (candidate) => candidate.serviceId === reward.rewardServiceId,
  );

  return line ? line.price : null;
};

/** Mesma conta do fechamento: o desconto nunca passa do subtotal. */
export const calculateCheckoutTotals = (
  lines: TCheckoutLineView[],
  rewardDiscount: number,
  manualDiscount: number,
): TCheckoutTotals => {
  const subtotal = sumMoney(
    lines.filter((line) => !line.fromPackage).map((line) => line.price),
  );
  const discount = roundMoney(
    Math.min(sumMoney([rewardDiscount, manualDiscount]), subtotal),
  );

  return {
    subtotal,
    rewardDiscount,
    discount,
    total: roundMoney(Math.max(subtotal - discount, 0)),
  };
};

/** "Ganha em 02/11/2026 · vence em 30/11/2026". */
export const describeReward = (reward: ICheckoutReward) => {
  const earned = new Date(reward.earnedAt);
  const parts = [
    Number.isNaN(earned.getTime())
      ? null
      : `Ganha em ${formatDateKey(toDateKey(earned))}`,
    reward.expiresOn ? `vence em ${formatDateKey(reward.expiresOn)}` : null,
  ];

  return parts.filter(Boolean).join(' · ');
};

/** "Terça, 12/11 · 10:00 às 11:00 · Ana". */
export const formatVisitLine = ({
  date,
  startTime,
  endTime,
  professionalName,
}: {
  date: string;
  startTime: string;
  endTime: string;
  professionalName: string;
}) => {
  const day = date.slice(0, 10);
  const parsed = new Date(`${day}T12:00:00`);
  const weekday = Number.isNaN(parsed.getTime())
    ? ''
    : parsed
        .toLocaleDateString('pt-BR', { weekday: 'long' })
        .replace('-feira', '');
  const label = weekday
    ? `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${formatDateKey(day).slice(0, 5)}`
    : formatDateKey(day);

  return [
    label,
    `${startTime.slice(0, 5)} às ${endTime.slice(0, 5)}`,
    professionalName,
  ]
    .filter(Boolean)
    .join(' · ');
};

export const getCreateCheckoutError = (error: unknown) => {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  if (status === 409 && /no sessions left/i.test(message)) {
    return 'O pacote não tem mais sessões. Desmarque o uso do pacote e tente de novo.';
  }
  if (status === 409 && /already checked out/i.test(message)) {
    return 'Este atendimento já foi fechado.';
  }
  if (status === 409) {
    return 'Atendimento cancelado não pode ser fechado.';
  }
  if (status === 400 && /reward/i.test(message)) {
    return 'O serviço da recompensa não está neste atendimento.';
  }
  if (status === 400) {
    return 'Confira os valores: cada forma de pagamento precisa de um valor maior que zero.';
  }

  return 'Não foi possível fechar o atendimento. Tente de novo.';
};

export const getUndoCheckoutError = (error: unknown) => {
  const status = getErrorStatus(error);

  if (status === 409) {
    return 'O caixa deste fechamento já foi fechado: não dá mais para desfazer.';
  }
  if (status === 403) return 'Só o dono e o gerente desfazem um fechamento.';

  return 'Não foi possível desfazer o fechamento. Tente de novo.';
};
