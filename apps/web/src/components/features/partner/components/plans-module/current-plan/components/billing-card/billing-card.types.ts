import type { TModuleBadgeTone } from '../../../../notifications-module/notifications-module.styles';

export type TBillingStatus = {
  label: string;
  tone: TModuleBadgeTone;
};

export type TBillingCharge = {
  label: string;
  value: string;
};
