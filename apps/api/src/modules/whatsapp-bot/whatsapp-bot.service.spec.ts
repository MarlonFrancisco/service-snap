import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WhatsappBotService } from './whatsapp-bot.service';

const STORE_ID = '6f1d7c1a-0f3e-4b57-9f3a-1c2d3e4f5a6b';
const SERVICE_ID = '7a2e8d2b-1f4e-4c68-8a4b-2d3e4f5a6b7c';
const MEMBER_ID = '8b3f9e3c-2a5f-4d79-9b5c-3e4f5a6b7c8d';
const PHONE = '5511900000000';
const DATE = '25/12/2030';

// Como o Redis: o que entra é serializado, então referência a objeto não sobrevive
const makeCache = () => {
  const data = new Map<string, string>();

  return {
    data,
    get: vi.fn(async (key: string) => {
      const value = data.get(key);
      return value === undefined ? null : JSON.parse(value);
    }),
    set: vi.fn(async (key: string, value: unknown) => {
      data.set(key, JSON.stringify(value));
    }),
    del: vi.fn(async (key: string) => data.delete(key)),
  };
};

const makeBot = () => {
  const whatsappService = {
    findOne: vi.fn(),
    sendText: vi.fn().mockResolvedValue(undefined),
    sendInteractiveList: vi.fn().mockResolvedValue(undefined),
    sendInteractiveButtons: vi.fn().mockResolvedValue(undefined),
  };
  const categoryService = {
    findAll: vi.fn().mockResolvedValue([
      {
        name: 'Combos',
        services: [{ id: SERVICE_ID, name: 'Corte + barba', description: '' }],
      },
    ]),
  };
  const serviceService = {
    findOne: vi.fn().mockResolvedValue({
      id: SERVICE_ID,
      name: 'Corte + barba',
      duration: 60,
    }),
  };
  const member = {
    id: MEMBER_ID,
    user: { firstName: 'Rafael', lastName: 'Lima' },
    services: [{ id: SERVICE_ID }],
  };
  const storeMemberService = {
    findStoreMembers: vi.fn().mockResolvedValue([member]),
    findStoreMemberWithSchedules: vi.fn().mockResolvedValue(member),
  };
  const scheduleService = {
    getAvailability: vi.fn().mockResolvedValue([
      { time: '09:00', available: false, storeMemberId: null },
      { time: '09:30', available: true, storeMemberId: MEMBER_ID },
      { time: '10:00', available: true, storeMemberId: MEMBER_ID },
    ]),
    create: vi.fn().mockResolvedValue([]),
  };
  const cache = makeCache();
  const bot = new WhatsappBotService(
    whatsappService as never,
    categoryService as never,
    serviceService as never,
    storeMemberService as never,
    scheduleService as never,
    cache as never,
  );

  (bot as unknown as { config: unknown }).config = {
    phoneNumberId: 'phone-id',
    accessToken: 'token',
    isActive: true,
    store: {
      id: STORE_ID,
      businessDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
    },
  };

  const send = (text: string) =>
    bot.handleIncomingMessage(
      { from: PHONE, text: { body: text } } as never,
      'Ana Ribeiro',
    );
  const lastText = () =>
    whatsappService.sendText.mock.calls.at(-1)?.[2] as string;
  const lastButtons = () =>
    whatsappService.sendInteractiveButtons.mock.calls.at(-1)?.[2] as string;

  return { cache, lastButtons, lastText, scheduleService, send };
};

const reachTimeStep = async (send: (text: string) => Promise<unknown>) => {
  for (const text of ['agendar', SERVICE_ID, MEMBER_ID, DATE]) {
    await send(text);
  }
};

describe('WhatsappBotService', () => {
  let ctx: ReturnType<typeof makeBot>;

  beforeEach(() => {
    ctx = makeBot();
  });

  it('completes a booking from the menu to the confirmation', async () => {
    await reachTimeStep(ctx.send);

    expect(ctx.scheduleService.getAvailability).toHaveBeenCalledWith(STORE_ID, {
      date: '2030-12-25',
      serviceIds: SERVICE_ID,
      memberId: MEMBER_ID,
    });
    expect(ctx.lastText()).toContain('1. 09:30\n2. 10:00');
    expect(ctx.lastText()).not.toContain('09:00');

    await ctx.send('2');

    expect(ctx.lastButtons()).toContain('Serviço: Corte + barba');
    expect(ctx.lastButtons()).toContain('Profissional: Rafael Lima');
    expect(ctx.lastButtons()).toContain('Data: 25/12/2030');
    expect(ctx.lastButtons()).toContain('Horário: 10:00');

    await ctx.send('confirmar');

    expect(ctx.scheduleService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        store: { id: STORE_ID },
        storeMember: { id: MEMBER_ID },
        services: [{ id: SERVICE_ID, duration: 60 }],
        startTime: '10:00',
        user: {
          telephone: PHONE,
          firstName: 'Ana',
          lastName: 'Ribeiro',
        },
      }),
    );
    expect(ctx.lastText()).toContain('Agendamento Confirmado!');
    expect(ctx.cache.data.size).toBe(0);
  });

  it('asks for another date when none is available', async () => {
    ctx.scheduleService.getAvailability.mockResolvedValue([
      { time: '09:00', available: false, storeMemberId: null },
    ]);

    await reachTimeStep(ctx.send);

    expect(ctx.lastText()).toContain('Não há horários disponíveis');
    expect(ctx.cache.data.get(`whatsapp:session:${PHONE}`)).toBe(
      JSON.stringify('SELECT_DATE'),
    );
  });

  it('restarts when the session data expired before choosing a time', async () => {
    await reachTimeStep(ctx.send);
    ctx.cache.data.delete(`whatsapp:session:${PHONE}:availableSlots`);

    await ctx.send('1');

    expect(ctx.lastText()).toContain('reinicie o processo');
    expect(ctx.cache.data.has(`whatsapp:session:${PHONE}`)).toBe(false);
    expect(ctx.scheduleService.create).not.toHaveBeenCalled();
  });

  it('restarts when the professional expired before the summary', async () => {
    await reachTimeStep(ctx.send);
    ctx.cache.data.delete(`whatsapp:session:${PHONE}:storeMember`);

    await ctx.send('1');

    expect(ctx.lastText()).toContain('Sua sessão expirou');
    expect(ctx.cache.data.has(`whatsapp:session:${PHONE}`)).toBe(false);
  });

  it('rejects free text where a professional is expected', async () => {
    await ctx.send('agendar');
    await ctx.send(SERVICE_ID);
    await ctx.send('tanto faz');

    expect(ctx.lastText()).toContain('Profissionais não encontrados');
  });
});
