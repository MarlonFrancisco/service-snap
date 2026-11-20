import { describe, expect, it } from 'vitest';
import {
  isSelfServePlan,
  normalizeSubscriptionMetadata,
} from './subscription.helpers';

/** Metadata do Enterprise depois do backfill da #22. */
const ENTERPRISE_METADATA = {
  plan_slug: 'enterprise',
  self_serve: 'false',
  UNIT_LIMIT: 'UNLIMITED',
  PRO_LIMIT: 'UNLIMITED',
  RANK_TIER: 'TIER_1',
  WHATSAPP_INTEGRATION: 'true',
  DASHBOARD_GENERAL_ACCESS: 'true',
  DASHBOARD_SALES_ACCESS: 'true',
  DASHBOARD_OPERATIONAL_ACCESS: 'true',
  DASHBOARD_CUSTOMERS_ACCESS: 'true',
};

describe('existing Enterprise subscriptions after #22', () => {
  it('are no longer self-service', () => {
    expect(
      isSelfServePlan({ name: 'Enterprise', metadata: ENTERPRISE_METADATA }),
    ).toBe(false);
  });

  it('keep unlimited limits and every module', () => {
    expect(normalizeSubscriptionMetadata(ENTERPRISE_METADATA)).toMatchObject({
      UNIT_LIMIT: 0,
      PRO_LIMIT: 0,
      RANK_TIER: 'TIER_1',
      WHATSAPP_INTEGRATION: true,
      DASHBOARD_GENERAL_ACCESS: true,
      DASHBOARD_SALES_ACCESS: true,
      DASHBOARD_OPERATIONAL_ACCESS: true,
      DASHBOARD_CUSTOMERS_ACCESS: true,
    });
  });
});
