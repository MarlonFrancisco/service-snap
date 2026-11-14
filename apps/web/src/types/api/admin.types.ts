import type { IAuditLog } from './audit-logs.types';
import type { TPageQuery } from './pagination.types';

/** Contagens por status (`{ active: 3, trialing: 1 }`). */
export type TStatusCount = Record<string, number>;

export interface IAdminOverview {
  users: { total: number; newLast30Days: number };
  stores: { total: number; active: number };
  schedulesLast30Days: TStatusCount;
  subscriptions: TStatusCount;
}

export type TAdminPerson = {
  id: string;
  name: string;
  email: string | null;
};

export interface IAdminStoreRow {
  id: string;
  name: string;
  city: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  owner: TAdminPerson | null;
}

export interface IAdminStore extends IAdminStoreRow {
  state: string | null;
  telephone: string | null;
  email: string | null;
  subscription: {
    status: string;
    productId: string | null;
    currentPeriodEnd: string | null;
  } | null;
  membersCount: number;
  servicesCount: number;
  schedulesLast30Days: number;
  recentActivity: IAuditLog[];
}

export interface IAdminUser {
  id: string;
  name: string;
  email: string | null;
  telephone: string | null;
  createdAt: string;
}

export type TAdminListQuery = TPageQuery;

export type TAdminUpdateStore = {
  /** `false` suspende (sai da busca), `true` reativa. */
  isActive: boolean;
  reason?: string;
};
