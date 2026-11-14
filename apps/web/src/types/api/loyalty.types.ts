export type TLoyaltyRewardType = 'percent' | 'fixed' | 'free_service';

/** `expired` é calculado na leitura: a recompensa venceu sem ser usada. */
export type TLoyaltyRewardStatus = 'available' | 'redeemed' | 'expired';

/** Um programa por loja. Mudar visitas ou serviços começa um ciclo novo. */
export interface ILoyaltyProgram {
  id: string;
  isActive: boolean;
  visitsRequired: number;
  rewardType: TLoyaltyRewardType;
  /** Percentual ou valor; `null` no serviço grátis. */
  rewardValue: number | null;
  /** Vazio conta todos os serviços. */
  eligibleServiceIds: string[];
  rewardValidityDays: number | null;
  /** `YYYY-MM-DD`: só visitas a partir daqui contam. */
  cycleStartsOn: string;
  rewardService: { id: string; name: string } | null;
}

export type TSaveLoyaltyProgram = {
  isActive: boolean;
  /** 1 a 100. */
  visitsRequired: number;
  rewardType: TLoyaltyRewardType;
  /** Percentual (1 a 100) ou valor; não vale para serviço grátis. */
  rewardValue?: number;
  rewardServiceId?: string;
  eligibleServiceIds?: string[];
  rewardValidityDays?: number;
};

export interface ILoyaltyReward {
  id: string;
  /** Texto pronto: "10% de desconto", "Barba grátis"... */
  description: string;
  rewardType: TLoyaltyRewardType;
  rewardValue: number | null;
  rewardServiceId: string | null;
  earnedAt: string;
  expiresOn: string | null;
  status: TLoyaltyRewardStatus;
  redeemedAt: string | null;
}

/** Visitas do ciclo atual e quanto falta para a próxima recompensa. */
export interface ILoyaltyProgress {
  isActive: boolean;
  visitsRequired: number;
  visits: number;
  visitsToNextReward: number;
  cycleStartsOn: string;
  rewards: ILoyaltyReward[];
}

export type TRedeemLoyaltyRewardResponse = {
  id: string;
  status: 'redeemed';
};
