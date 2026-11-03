// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlanFeatureGate } from './plan-feature-gate';
import { getMinPlanName, hasPlanAccess } from './plan-feature-gate.constants';
import type { TPlanFeatures } from './plan-feature-gate.types';

const subscription = vi.hoisted(() => ({
  currentPlan: undefined as unknown,
  isGettingCurrentPlan: false,
}));
const plansQuery = vi.hoisted(() => ({ enabled: undefined as unknown }));

vi.mock('@repo/ui', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));
vi.mock('@/utils/fonts/plus-jakarta-sans', () => ({
  plusJakartaSans: { className: '' },
}));
vi.mock('@/hooks/use-query/use-subscription-query', () => ({
  useSubscriptionQuery: () => subscription,
}));
vi.mock('@/hooks/use-query/use-plans-query', () => ({
  usePlansQuery: ({ enabled }: { enabled: boolean }) => {
    plansQuery.enabled = enabled;
    return {
      data: {
        month: [
          { name: 'Professional', price: 8990, currency: 'brl' },
          { name: 'Business', price: 19990, currency: 'brl' },
        ],
        year: [],
      },
    };
  },
}));

const features = (flags: Partial<TPlanFeatures>) => flags as TPlanFeatures;

const onPlan = (planName: string, flags: Partial<TPlanFeatures>) => {
  subscription.currentPlan = { planName, features: features(flags) };
};

describe('plan access rules', () => {
  it('requires every listed feature', () => {
    const flags = features({ DASHBOARD_GENERAL_ACCESS: true });

    expect(hasPlanAccess(['DASHBOARD_GENERAL_ACCESS'], flags)).toBe(true);
    expect(
      hasPlanAccess(
        ['DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_SALES_ACCESS'],
        flags,
      ),
    ).toBe(false);
  });

  it('asks for the highest plan among the missing features', () => {
    expect(
      getMinPlanName(
        ['DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_SALES_ACCESS'],
        features({}),
      ),
    ).toBe('Business');
    expect(getMinPlanName(['WHATSAPP_INTEGRATION'], features({}))).toBe(
      'Professional',
    );
  });
});

describe('PlanFeatureGate', () => {
  let container: HTMLDivElement;
  let root: Root;

  const render = (ui: ReactNode) => {
    act(() => root.render(ui));
    return container;
  };
  const text = () => container.textContent ?? '';
  const link = (name: string) =>
    [...container.querySelectorAll('a')].find((a) => a.textContent === name);

  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    subscription.isGettingCurrentPlan = false;
    plansQuery.enabled = undefined;
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders the module when the plan includes it', () => {
    onPlan('Business', {
      DASHBOARD_GENERAL_ACCESS: true,
      DASHBOARD_SALES_ACCESS: true,
    });

    render(
      <PlanFeatureGate module="sales">
        <p>Módulo de vendas</p>
      </PlanFeatureGate>,
    );

    expect(text()).toBe('Módulo de vendas');
    expect(plansQuery.enabled).toBe(false);
  });

  it('shows the upgrade notice instead of the module', () => {
    onPlan('Professional', { DASHBOARD_GENERAL_ACCESS: true });

    render(
      <PlanFeatureGate module="sales">
        <p>Módulo de vendas</p>
      </PlanFeatureGate>,
    );

    expect(text()).not.toContain('Módulo de vendas');
    expect(container.querySelector('h2')?.textContent).toBe(
      'A análise de vendas não está no seu plano',
    );
    expect(text()).toContain('Você está no plano Professional.');
    expect(link('Fazer upgrade para Business')?.getAttribute('href')).toBe(
      '/partner/plans/upgrade',
    );
    expect(text()).toMatch(/A partir de R\$\s?199,90\/mês\./);
  });

  it('renders nothing while the plan is loading', () => {
    subscription.currentPlan = undefined;
    subscription.isGettingCurrentPlan = true;

    render(
      <PlanFeatureGate module="home">
        <p>Painel</p>
      </PlanFeatureGate>,
    );

    expect(text()).toBe('');
  });
});
