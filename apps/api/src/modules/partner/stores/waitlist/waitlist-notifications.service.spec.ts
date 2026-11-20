import { describe, expect, it, vi } from 'vitest';
import { WaitlistNotificationsService } from './waitlist-notifications.service';

const entry = (overrides: Record<string, unknown> = {}) => ({
  id: 'entry-1',
  date: '2026-11-03',
  status: 'waiting',
  channel: 'whatsapp',
  user: {
    id: 'user-1',
    firstName: 'Ana',
    email: 'ana@teste.com',
    telephone: '11988887777',
  },
  store: { id: 'store-1', name: 'Loja', country: 'BR' },
  service: { id: 'service-1', name: 'Corte' },
  storeMember: null,
  ...overrides,
});

const setup = (hasConsent: boolean) => {
  const waitlistRepository = {
    find: vi.fn().mockResolvedValue([entry()]),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
  };
  const whatsappService = {
    findActiveConfig: vi
      .fn()
      .mockResolvedValue({ phoneNumberId: 'phone-1', accessToken: 'token-1' }),
    findWaitlistTemplate: vi.fn().mockResolvedValue({ status: 'APPROVED' }),
    sendTemplate: vi.fn().mockResolvedValue(undefined),
    sendInteractiveButtons: vi.fn().mockResolvedValue(undefined),
  };
  const notificationService = {
    waitlistSlotAvailable: vi.fn().mockResolvedValue(undefined),
  };
  const consentService = {
    hasConsent: vi.fn().mockResolvedValue(hasConsent),
    findOptOutLink: vi.fn().mockResolvedValue(null),
  };
  const service = new WaitlistNotificationsService(
    waitlistRepository as never,
    {
      getAvailability: vi
        .fn()
        .mockResolvedValue([{ time: '10:00', available: true }]),
    } as never,
    { onSlotFreed: vi.fn() } as never,
    whatsappService as never,
    notificationService as never,
    { getMissingFeatures: vi.fn().mockResolvedValue([]) } as never,
    { get: () => 'https://app.test' } as never,
    consentService as never,
  );

  return { service, whatsappService, notificationService, consentService };
};

describe('WaitlistNotificationsService WhatsApp opt-in', () => {
  it('sends by WhatsApp to the number that opted in', async () => {
    const { service, whatsappService, notificationService, consentService } =
      setup(true);

    await service.notifySlotFreed({ storeId: 'store-1', date: '2026-11-03' });

    expect(consentService.hasConsent).toHaveBeenCalledWith(
      'store-1',
      'user-1',
      '5511988887777',
    );
    expect(whatsappService.sendTemplate).toHaveBeenCalledTimes(1);
    expect(notificationService.waitlistSlotAvailable).not.toHaveBeenCalled();
  });

  it('falls back to email without an opt-in', async () => {
    const { service, whatsappService, notificationService } = setup(false);

    await service.notifySlotFreed({ storeId: 'store-1', date: '2026-11-03' });

    expect(whatsappService.sendTemplate).not.toHaveBeenCalled();
    expect(whatsappService.sendInteractiveButtons).not.toHaveBeenCalled();
    expect(notificationService.waitlistSlotAvailable).toHaveBeenCalledWith(
      'ana@teste.com',
      expect.objectContaining({ storeName: 'Loja' }),
    );
  });
});
