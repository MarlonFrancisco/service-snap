export type TLoyaltyRewardType = 'percent' | 'fixed' | 'free_service';

export type TLoyaltyRewardStatus = 'available' | 'redeemed';

/** Visitas contadas no ciclo atual e quanto falta para a próxima recompensa. */
export type TLoyaltyProgress = {
  isActive: boolean;
  visitsRequired: number;
  visits: number;
  visitsToNextReward: number;
  cycleStartsOn: string;
  rewards: {
    id: string;
    description: string;
    rewardType: TLoyaltyRewardType;
    rewardValue: number | null;
    rewardServiceId: string | null;
    earnedAt: Date;
    expiresOn: string | null;
    status: TLoyaltyRewardStatus | 'expired';
    redeemedAt: Date | null;
  }[];
};
