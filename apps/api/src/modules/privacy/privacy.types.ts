/** Arquivo que o usuário baixa com tudo o que o ServiceSnap guarda dele. */
export type TUserDataExport = {
  exportedAt: string;
  profile: Record<string, unknown>;
  schedules: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  favorites: Record<string, unknown>[];
  anamnesis: Record<string, unknown>[];
  packages: Record<string, unknown>[];
  loyaltyRewards: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  storeMemberships: Record<string, unknown>[];
  ownedStores: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
};

export const ACCOUNT_HAS_ACTIVE_SUBSCRIPTION =
  'ACCOUNT_HAS_ACTIVE_SUBSCRIPTION';
