export type TReferralShareCardConfig = {
  /** Client profile emphasizes `/?ref=`; partner plan emphasizes `/pricing?ref=`. */
  variant: 'client' | 'partner';
  delay?: number;
};
