import type { TPanelChipTone } from '../partner/components/audit-logs-module/audit-logs-module.types';

export type TAdminNavItem = {
  href: string;
  label: string;
};

export type TAdminKpi = {
  label: string;
  value: string;
  detail: string;
};

export type TAdminChip = {
  label: string;
  tone: TPanelChipTone;
};

export type TAdminStoreRow = {
  id: string;
  name: string;
  city: string;
  ownerEmail: string;
  status: TAdminChip;
};

export type TAdminUserRow = {
  id: string;
  name: string;
  email: string;
  telephone: string;
  createdAt: string;
};

export type TAdminActivityItem = {
  id: string;
  label: string;
  meta: string;
};
