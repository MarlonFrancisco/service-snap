import { BadRequestException, GoneException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  getConsentText,
  isWhatsappOptOutReply,
} from './whatsapp-consent.helpers';
import { WhatsappConsentService } from './whatsapp-consent.service';

const KEY = Buffer.alloc(32, 7).toString('base64');

const setup = ({ affected = 0, country = 'BR', granted = true } = {}) => {
  const consentRepository = {
    update: vi.fn().mockResolvedValue({ affected }),
    insert: vi.fn().mockResolvedValue({}),
    exists: vi.fn().mockResolvedValue(granted),
    findOne: vi.fn().mockResolvedValue(null),
  };
  const storeRepository = {
    findOne: vi
      .fn()
      .mockResolvedValue({ id: 'store-1', name: 'Loja', country }),
  };
  const config = {
    get: (key: string) =>
      key === 'DATA_ENCRYPTION_KEY' ? KEY : 'https://app.test',
  };
  const service = new WhatsappConsentService(
    consentRepository as never,
    storeRepository as never,
    config as never,
  );

  return { service, consentRepository };
};

describe('WhatsApp consent texts', () => {
  it('speaks pt-PT to stores in Portugal', () => {
    expect(getConsentText('checkout-v1', 'checkout', 'PT')?.text).toContain(
      'marcações',
    );
    expect(getConsentText('checkout-v1', 'checkout', 'BR')?.text).toContain(
      'agendamentos',
    );
  });

  it('stores the whole text the checkout shows, how to stop included', () => {
    for (const country of ['BR', 'PT']) {
      expect(getConsentText('checkout-v2', 'checkout', country)?.text).toMatch(
        /WhatsApp\. Para deixar de receber, responda PARAR no WhatsApp\.$/,
      );
    }
  });

  it('refuses a version that does not belong to the source', () => {
    expect(getConsentText('bot-v1', 'checkout')).toBeNull();
    expect(getConsentText('checkout-v9', 'checkout')).toBeNull();
  });
});

describe('isWhatsappOptOutReply', () => {
  it.each([
    ['PARAR', false, true],
    ['Parar!', false, true],
    ['parar', true, false], // numa conversa, "parar" só a encerra
    ['PARAR LEMBRETES', true, true],
    ['não quero receber', true, true],
    ['stop', false, true],
    ['quero parar de fumar', false, false],
  ])('%s (in conversation: %s) → %s', (text, inConversation, expected) => {
    expect(isWhatsappOptOutReply(text, inConversation)).toBe(expected);
  });
});

describe('WhatsappConsentService', () => {
  it('stores the accepted text and the number in E.164', async () => {
    const { service, consentRepository } = setup();

    await expect(
      service.grant({
        storeId: 'store-1',
        customerId: 'user-1',
        phone: '(11) 98888-7777',
        source: 'checkout',
        textVersion: 'checkout-v1',
      }),
    ).resolves.toMatchObject({ status: 'granted', textVersion: 'checkout-v1' });

    expect(consentRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'granted',
        phone: '5511988887777',
        consentText: getConsentText('checkout-v1', 'checkout', 'BR')?.text,
        store: { id: 'store-1' },
        customer: { id: 'user-1' },
      }),
    );
  });

  it('renews an existing consent instead of inserting a second one', async () => {
    const { service, consentRepository } = setup({ affected: 1 });

    await service.grant({
      storeId: 'store-1',
      customerId: 'user-1',
      phone: '11988887777',
      source: 'profile',
      textVersion: 'checkout-v1',
    });

    expect(consentRepository.update).toHaveBeenCalledWith(
      { store: { id: 'store-1' }, customer: { id: 'user-1' } },
      expect.objectContaining({ revokedAt: null, revokedVia: null }),
    );
    expect(consentRepository.insert).not.toHaveBeenCalled();
  });

  it.each([
    ['an unknown text', { textVersion: 'checkout-v9', phone: '11988887777' }],
    ['an invalid phone', { textVersion: 'checkout-v1', phone: '1234' }],
  ])('refuses %s', async (_name, input) => {
    const { service } = setup();

    await expect(
      service.grant({
        storeId: 'store-1',
        customerId: 'user-1',
        source: 'checkout',
        ...input,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('only counts the consent for the number that gave it', async () => {
    const { service, consentRepository } = setup();

    await service.hasConsent('store-1', 'user-1', '5511988887777');

    expect(consentRepository.exists).toHaveBeenCalledWith({
      where: {
        store: { id: 'store-1' },
        customer: { id: 'user-1' },
        phone: '5511988887777',
        status: 'granted',
      },
    });
  });

  it('opts out through the signed email link', async () => {
    const { service, consentRepository } = setup();
    consentRepository.update.mockResolvedValue({ affected: 1 });

    const link = await service.findOptOutLink('store-1', 'user-1');
    const token = link.split('/whatsapp/sair/')[1];

    expect(link).toMatch(/^https:\/\/app\.test\/whatsapp\/sair\//);
    await expect(service.optOutByToken(token)).resolves.toEqual({
      storeName: 'Loja',
      optedOut: true,
    });
    expect(consentRepository.update).toHaveBeenCalledWith(
      {
        store: { id: 'store-1' },
        customer: { id: 'user-1' },
        status: 'granted',
      },
      expect.objectContaining({ status: 'revoked', revokedVia: 'link' }),
    );
  });

  it('gives no link to customers who do not receive WhatsApp', async () => {
    const { service } = setup({ granted: false });

    await expect(service.findOptOutLink('store-1', 'user-1')).resolves.toBe(
      null,
    );
  });

  it('answers 410 to a tampered link', async () => {
    const { service } = setup();
    const link = await service.findOptOutLink('store-1', 'user-1');

    await expect(
      service.optOutByToken(`${link.split('/').pop()}x`),
    ).rejects.toBeInstanceOf(GoneException);
  });
});
