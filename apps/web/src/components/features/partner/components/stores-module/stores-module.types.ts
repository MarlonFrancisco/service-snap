export type TPlanUsage = {
  current: number;
  limit: number;
  isUnlimited: boolean;
  isAtLimit: boolean;
  label: string;
};
