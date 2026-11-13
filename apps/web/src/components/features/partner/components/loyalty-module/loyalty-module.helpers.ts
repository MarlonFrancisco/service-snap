import type {
  ILoyaltyProgram,
  ILoyaltyProgress,
  ILoyaltyReward,
  TSaveLoyaltyProgram,
} from '@/types/api/loyalty.types';
import {
  formatShortDate,
  formatShortDay,
  parseMoney,
  toMoneyInput,
} from '../packages-module/packages-module.helpers';
import type { TLoyaltyProgramSchema } from './loyalty-module.schema';
import type {
  TLoyaltyRewardView,
  TProgressDot,
  TRewardRule,
  TRewardTypeOption,
  TServicesScopeOption,
} from './loyalty-module.types';

export const MAX_VISITS_REQUIRED = 100;
export const MAX_REWARD_VALIDITY_DAYS = 3650;
export const DEFAULT_VISITS_REQUIRED = 5;

export const REWARD_TYPE_OPTIONS: readonly TRewardTypeOption[] = [
  { value: 'percent', label: '% de desconto' },
  { value: 'fixed', label: 'Valor de desconto' },
  { value: 'free_service', label: 'Serviço grátis' },
];

export const SERVICES_SCOPE_OPTIONS: readonly TServicesScopeOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'some', label: 'Escolher serviços' },
];

export const LOYALTY_EMPTY_VALUES: TLoyaltyProgramSchema = {
  isActive: true,
  visitsRequired: String(DEFAULT_VISITS_REQUIRED),
  servicesScope: 'all',
  eligibleServiceIds: [],
  rewardType: 'percent',
  rewardValue: '',
  rewardServiceId: '',
  rewardValidityDays: '',
};

export const toLoyaltyFormValues = (
  program: ILoyaltyProgram | null,
): TLoyaltyProgramSchema =>
  program
    ? {
        isActive: program.isActive,
        visitsRequired: String(program.visitsRequired),
        servicesScope: program.eligibleServiceIds.length ? 'some' : 'all',
        eligibleServiceIds: program.eligibleServiceIds,
        rewardType: program.rewardType,
        rewardValue:
          program.rewardValue === null
            ? ''
            : program.rewardType === 'fixed'
              ? toMoneyInput(program.rewardValue)
              : String(program.rewardValue).replace('.', ','),
        rewardServiceId: program.rewardService?.id ?? '',
        rewardValidityDays: program.rewardValidityDays
          ? String(program.rewardValidityDays)
          : '',
      }
    : LOYALTY_EMPTY_VALUES;

/** Validade vazia vai sem o campo: a API grava "não vence". */
export const toLoyaltyPayload = (
  values: TLoyaltyProgramSchema,
): TSaveLoyaltyProgram => ({
  isActive: values.isActive,
  visitsRequired: Number(values.visitsRequired),
  rewardType: values.rewardType,
  ...(values.rewardType === 'free_service'
    ? { rewardServiceId: values.rewardServiceId }
    : { rewardValue: parseMoney(values.rewardValue) ?? 0 }),
  eligibleServiceIds:
    values.servicesScope === 'some' ? values.eligibleServiceIds : [],
  ...(values.rewardValidityDays && {
    rewardValidityDays: Number(values.rewardValidityDays),
  }),
});

/** Mesmo texto que a API grava na recompensa. */
export const describeReward = (
  rule: TRewardRule,
  formatMoney: (value: number) => string,
) => {
  if (rule.rewardType === 'free_service') {
    return `${rule.rewardService?.name ?? 'Serviço'} grátis`;
  }

  return rule.rewardType === 'percent'
    ? `${rule.rewardValue ?? 0}% de desconto`
    : `${formatMoney(rule.rewardValue ?? 0)} de desconto`;
};

/** Uma bolinha por visita do ciclo; a última é a da recompensa. */
export const getProgressDots = (
  progress: Pick<ILoyaltyProgress, 'visitsRequired' | 'visitsToNextReward'>,
): TProgressDot[] => {
  const done = progress.visitsRequired - progress.visitsToNextReward;

  return Array.from({ length: progress.visitsRequired }, (_, index) => {
    const number = index + 1;

    if (number <= done) return { number, state: 'done' };
    if (number === progress.visitsRequired) return { number, state: 'reward' };
    return { number, state: 'pending' };
  });
};

export const getVisitsLeftLabel = (visitsLeft: number) =>
  visitsLeft === 1 ? 'Falta 1 visita' : `Faltam ${visitsLeft} visitas`;

export const toRewardView = (
  reward: ILoyaltyReward,
  timeZone?: string,
): TLoyaltyRewardView => {
  const earned = `Ganha em ${formatShortDate(reward.earnedAt, timeZone)}`;

  if (reward.status === 'redeemed') {
    return {
      id: reward.id,
      description: reward.description,
      summary: `Usada em ${formatShortDate(reward.redeemedAt, timeZone)}`,
      chip: { label: 'Usada', tone: 'neutral' },
      canRedeem: false,
    };
  }

  if (reward.status === 'expired') {
    return {
      id: reward.id,
      description: reward.description,
      summary: `Venceu em ${formatShortDay(reward.expiresOn)}`,
      chip: { label: 'Vencida', tone: 'warn' },
      canRedeem: false,
    };
  }

  return {
    id: reward.id,
    description: reward.description,
    summary: reward.expiresOn
      ? `${earned} · vence em ${formatShortDay(reward.expiresOn)}`
      : `${earned} · não vence`,
    chip: { label: 'Disponível', tone: 'ok' },
    canRedeem: true,
  };
};
