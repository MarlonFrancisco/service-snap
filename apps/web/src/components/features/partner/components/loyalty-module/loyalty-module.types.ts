import type {
  ILoyaltyProgram,
  TLoyaltyRewardType,
} from '@/types/api/loyalty.types';
import type { TRetentionChip } from '../packages-module/packages-module.types';

export type TRewardTypeOption = {
  value: TLoyaltyRewardType;
  label: string;
};

export type TServicesScopeOption = {
  value: 'all' | 'some';
  label: string;
};

/** O que basta para descrever a recompensa: "Barba grátis", "10% de desconto". */
export type TRewardRule = Pick<
  ILoyaltyProgram,
  'rewardType' | 'rewardValue' | 'rewardService'
>;

export type TProgressDot = {
  number: number;
  state: 'done' | 'pending' | 'reward';
};

export type TLoyaltyRewardView = {
  id: string;
  description: string;
  /** "Ganha em dd/mm · vence em dd/mm", "Usada em dd/mm"... */
  summary: string;
  chip: TRetentionChip;
  canRedeem: boolean;
};
