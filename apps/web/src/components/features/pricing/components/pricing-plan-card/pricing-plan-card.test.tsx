// @vitest-environment jsdom
import type { IPlan } from '@/types/api';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PricingPlanCard } from './pricing-plan-card';

const push = vi.fn();
const handleCreateSubscription = vi.fn();
const track = vi.fn();

vi.mock('@repo/ui', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/components/ui/plan-card/plan-card.hook', () => ({
  usePlanCard: () => ({ handleCreateSubscription }),
}));
vi.mock('@/providers/analytics.provider', () => ({
  useAnalytics: () => ({ track }),
}));

const plan = (overrides: Partial<IPlan> = {}): IPlan => ({
  id: 'prod_1',
  priceId: 'price_1',
  name: 'Enterprise',
  slug: 'enterprise',
  description: 'Para redes',
  price: 49990,
  popular: false,
  features: ['Lojas ilimitadas'],
  interval: 'month',
  discount: 0,
  trialPeriodDays: 30,
  currency: 'BRL',
  selfServe: false,
  ...overrides,
});

describe('PricingPlanCard contact-only plan (#22)', () => {
  let container: HTMLDivElement;

  const render = (props: Parameters<typeof PricingPlanCard>[0]) => {
    const root = createRoot(container);
    act(() => root.render(<PricingPlanCard {...props} />));
    return container;
  };

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows "Fale conosco" with no price, trial or checkout', () => {
    const view = render({ plan: plan(), isCurrentPlan: false });

    expect(view.textContent).toContain('Sob consulta');
    expect(view.textContent).not.toContain('R$');
    expect(view.textContent).not.toContain('dias grátis');

    act(() => view.querySelector('button')!.click());

    expect(push).toHaveBeenCalledWith('/contact');
    expect(handleCreateSubscription).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalledWith('begin_checkout', expect.anything());
  });

  it('sends the panel upgrade to contact too, instead of the checkout', () => {
    const onSelectPlan = vi.fn();
    const view = render({ plan: plan(), isCurrentPlan: false, onSelectPlan });

    act(() => view.querySelector('button')!.click());

    expect(onSelectPlan).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/contact');
  });

  it('keeps an existing Enterprise subscriber on their current plan', () => {
    const view = render({ plan: plan(), isCurrentPlan: true });

    expect(view.textContent).toContain('Seu plano atual');
    expect(view.textContent).not.toContain('Fale conosco');
  });

  it('keeps the checkout of a self-service plan', () => {
    const view = render({
      plan: plan({ name: 'Equipe', slug: 'team', selfServe: true }),
      isCurrentPlan: false,
    });

    act(() => view.querySelector('button')!.click());

    expect(view.textContent).toContain('Assinar plano');
    expect(handleCreateSubscription).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
