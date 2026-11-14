import { formatStoreCurrency } from '../../../../utils/helpers/format.helpers';
import { roundMoney } from '../../../../utils/helpers/money.helpers';
import type { TRegionSource } from '../../../../utils/helpers/region.types';
import type { LoyaltyProgram } from './loyalty-program.entity';
import type { LoyaltyReward } from './loyalty-reward.entity';

/** Texto que a loja e o cliente veem: "10% de desconto", "Corte grátis"... */
export const describeReward = (
  program: Pick<LoyaltyProgram, 'rewardType' | 'rewardValue' | 'rewardService'>,
  store?: TRegionSource | null,
) => {
  if (program.rewardType === 'free_service') {
    return `${program.rewardService?.name ?? 'Serviço'} grátis`;
  }

  return program.rewardType === 'percent'
    ? `${program.rewardValue}% de desconto`
    : `${formatStoreCurrency(program.rewardValue ?? 0, store)} de desconto`;
};

/** Recompensas que o cliente já deveria ter no ciclo. */
export const countEarnedRewards = (visits: number, visitsRequired: number) =>
  visitsRequired > 0 ? Math.floor(visits / visitsRequired) : 0;

export const isRewardExpired = (
  reward: Pick<LoyaltyReward, 'expiresOn' | 'status'>,
  today: string,
) =>
  reward.status === 'available' &&
  Boolean(reward.expiresOn && reward.expiresOn < today);

/**
 * Desconto da recompensa sobre o fechamento. Serviço grátis desconta o preço
 * do atendimento daquele serviço; sem ele na visita, não se aplica (`null`).
 */
export const getRewardDiscount = (
  reward: Pick<LoyaltyReward, 'rewardType' | 'rewardValue' | 'rewardService'>,
  items: { serviceId: string | null; price: number }[],
): number | null => {
  const subtotal = items.reduce((total, item) => total + item.price, 0);

  if (reward.rewardType === 'percent') {
    return roundMoney((subtotal * (reward.rewardValue ?? 0)) / 100);
  }

  if (reward.rewardType === 'fixed') {
    return roundMoney(Math.min(reward.rewardValue ?? 0, subtotal));
  }

  const item = items.find(
    (candidate) => candidate.serviceId === reward.rewardService?.id,
  );

  return item ? item.price : null;
};
