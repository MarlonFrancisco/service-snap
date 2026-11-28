import { describe, expect, it } from 'vitest';
import {
  isSelfServePlan,
  normalizeSubscriptionMetadata,
  PLAN_MODULES,
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

describe('modules by plan', () => {
  it('follows the approved matrix', () => {
    expect(PLAN_MODULES).toEqual({
      solo: {
        COMMISSIONS_ACCESS: false,
        AUDIT_LOG_ACCESS: false,
        LOYALTY_ACCESS: false,
        CAMPAIGNS_ACCESS: false,
        API_ACCESS: false,
      },
      team: {
        COMMISSIONS_ACCESS: true,
        AUDIT_LOG_ACCESS: true,
        LOYALTY_ACCESS: true,
        CAMPAIGNS_ACCESS: true,
        API_ACCESS: false,
      },
      multi: {
        COMMISSIONS_ACCESS: true,
        AUDIT_LOG_ACCESS: true,
        LOYALTY_ACCESS: true,
        CAMPAIGNS_ACCESS: true,
        API_ACCESS: true,
      },
      enterprise: {
        COMMISSIONS_ACCESS: true,
        AUDIT_LOG_ACCESS: true,
        LOYALTY_ACCESS: true,
        CAMPAIGNS_ACCESS: true,
        API_ACCESS: true,
      },
    });
  });

  it('come from the plan slug, not from the Stripe metadata', () => {
    expect(
      normalizeSubscriptionMetadata({ API_ACCESS: 'true' }, 'solo'),
    ).toMatchObject({ API_ACCESS: false, COMMISSIONS_ACCESS: false });
    expect(normalizeSubscriptionMetadata({}, 'team')).toMatchObject({
      COMMISSIONS_ACCESS: true,
      API_ACCESS: false,
    });
  });

  it('are inferred from the dashboards when the plan is unknown', () => {
    expect(
      normalizeSubscriptionMetadata(ENTERPRISE_METADATA, null),
    ).toMatchObject({ API_ACCESS: true, LOYALTY_ACCESS: true });
  });
});
