// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWhatsappOptIn } from './whatsapp-opt-in.hook';

const service = vi.hoisted(() => ({
  getText: vi.fn(),
  getMine: vi.fn(),
  grant: vi.fn(),
}));

vi.mock('@/service/whatsapp-consent', () => ({
  WhatsappConsentService: service,
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('@/utils/helpers/query.helper', async (original) => ({
  ...(await original<object>()),
  getQueryClient: () => ({ setQueryData: vi.fn() }),
}));

type THook = ReturnType<typeof useWhatsappOptIn>;

describe('useWhatsappOptIn', () => {
  let container: HTMLDivElement;
  let root: Root;
  let result: THook;

  const Probe = (props: Parameters<typeof useWhatsappOptIn>[0]) => {
    result = useWhatsappOptIn(props);
    return null;
  };

  const render = async (ui: ReactNode) => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
      );
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  };

  const props = {
    storeId: 'store-1',
    hasWhatsapp: true,
    hasPhone: true,
    isLoggedIn: true,
  };

  beforeEach(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    root = createRoot(container);
    service.getText.mockResolvedValue({
      version: 'checkout-v1',
      text: 'Quero receber lembretes por WhatsApp.',
    });
    service.getMine.mockResolvedValue({ status: null });
    service.grant.mockResolvedValue({ status: 'granted' });
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.clearAllMocks();
  });

  it('asks unchecked, with the text from the API', async () => {
    await render(<Probe {...props} />);

    expect(result.isVisible).toBe(true);
    expect(result.isChecked).toBe(false);
    expect(result.text).toBe('Quero receber lembretes por WhatsApp.');
  });

  it.each([
    ['the store has no WhatsApp', { hasWhatsapp: false }],
    ['the customer has no phone', { hasPhone: false }],
  ])('does not ask when %s', async (_name, overrides) => {
    await render(<Probe {...props} {...overrides} />);

    expect(result.isVisible).toBe(false);
    expect(service.getText).not.toHaveBeenCalled();
  });

  it('does not ask again after a yes', async () => {
    service.getMine.mockResolvedValue({ status: 'granted' });
    await render(<Probe {...props} />);

    expect(result.isVisible).toBe(false);
  });

  it('only records the opt-in when the box is checked', async () => {
    await render(<Probe {...props} />);

    await act(() => result.grantIfChecked());
    expect(service.grant).not.toHaveBeenCalled();

    act(() => result.setIsChecked(true));
    await act(() => result.grantIfChecked());
    expect(service.grant).toHaveBeenCalledWith('store-1', 'checkout');
  });
});
