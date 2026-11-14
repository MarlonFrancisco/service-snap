import { ConflictException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WhatsappBotService } from './whatsapp-bot.service';

const STORE_ID = '6f1d7c1a-0f3e-4b57-9f3a-1c2d3e4f5a6b';
const SERVICE_ID = '7a2e8d2b-1f4e-4c68-8a4b-2d3e4f5a6b7c';
const RAFAEL = '8b3f9e3c-2a5f-4d79-9b5c-3e4f5a6b7c8d';
const JULIA = '9c4a0f4d-3b6a-4e8a-8c6d-4f5a6b7c8d9e';
const SCHEDULE_ID = 'a1b2c3d4-0000-4000-8000-000000000001';
const CUSTOMER_ID = 'b2c3d4e5-0000-4000-8000-000000000002';
const PHONE = '5511900000000';
// Segunda-feira, 10h em São Paulo
const NOW = new Date('2030-12-23T13:00:00Z');
const TODAY = '2030-12-23';

const BUSINESS_DAYS = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: false,
};

const makeConfig = (phoneNumberId = 'phone-id') =>
  ({
    phoneNumberId,
    accessToken: 'token',
    isActive: true,
    store: {
      id: STORE_ID,
      name: 'Barbearia Central',
      timezone: 'America/Sao_Paulo',
      address: 'Rua das Flores, 100',
      city: 'São Paulo',
      businessDays: BUSINESS_DAYS,
    },
  }) as never;

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

const member = (id: string, firstName: string) => ({
  id,
  role: 'professional',
  isDeleted: false,
  user: { firstName, lastName: 'Lima' },
  services: [{ id: SERVICE_ID }],
});

const makeBot = () => {
  const whatsappService = {
    findOne: vi.fn(async () => makeConfig()),
    sendText: vi.fn().mockResolvedValue(undefined),
    sendInteractiveList: vi.fn().mockResolvedValue(undefined),
    sendInteractiveButtons: vi.fn().mockResolvedValue(undefined),
  };
  const categoryService = {
    findAll: vi.fn().mockResolvedValue([
      {
        name: 'Combos',
        services: [
          {
            id: SERVICE_ID,
            name: 'Corte + barba',
            description: '',
            duration: 60,
            price: 80,
            isActive: true,
          },
          { id: 'inactive', name: 'Antigo', duration: 30, isActive: false },
        ],
      },
    ]),
  };
  const storeMemberService = {
    findStoreMembers: vi
      .fn()
      .mockResolvedValue([member(RAFAEL, 'Rafael'), member(JULIA, 'Julia')]),
  };
  const scheduleService = {
    getAvailability: vi.fn(
      async (_storeId: string, { memberId }: { memberId?: string }) => [
        { time: '09:00', available: false, storeMemberId: null },
        { time: '11:30', available: true, storeMemberId: memberId ?? JULIA },
        { time: '14:00', available: true, storeMemberId: memberId ?? RAFAEL },
      ],
    ),
    create: vi.fn().mockResolvedValue([]),
    reschedule: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({ id: SCHEDULE_ID }),
    findUpcomingForCustomer: vi.fn().mockResolvedValue([
      {
        id: SCHEDULE_ID,
        date: '2030-12-27',
        startTime: '15:00',
        user: { id: CUSTOMER_ID },
        service: { id: SERVICE_ID, name: 'Corte + barba', duration: 60 },
        storeMember: {
          id: RAFAEL,
          user: { firstName: 'Rafael', lastName: 'Lima' },
        },
      },
    ]),
  };
  const usersService = {
    // Por padrão o cliente já tem e-mail: a etapa de e-mail não aparece
    findByOne: vi.fn().mockResolvedValue({ email: 'ana@example.com' }),
    linkVerifiedEmail: vi.fn().mockResolvedValue('linked'),
  };
  const notificationService = {
    sendEmailConfirmationCode: vi.fn().mockResolvedValue(undefined),
  };
  const cache = makeCache();
  const bot = new WhatsappBotService(
    whatsappService as never,
    categoryService as never,
    storeMemberService as never,
    scheduleService as never,
    usersService as never,
    notificationService as never,
    cache as never,
    {} as never,
    {} as never,
  );

  let messageCount = 0;
  const deliver = (message: object, config = makeConfig()) =>
    bot.handleIncomingMessage(
      config,
      { id: `wamid.${++messageCount}`, from: PHONE, ...message } as never,
      'Ana Ribeiro',
    );
  const say = (text: string, config?: never) =>
    deliver({ type: 'text', text: { body: text } }, config);
  const tap = (id: string, config?: never) =>
    deliver(
      { type: 'interactive', interactive: { list_reply: { id, title: id } } },
      config,
    );

  const lastText = () =>
    whatsappService.sendText.mock.calls.at(-1)?.[2] as string;
  const lastButtons = () => {
    const call = whatsappService.sendInteractiveButtons.mock.calls.at(-1);
    return {
      body: call?.[2] as string,
      ids: (call?.[3] as { id: string }[])?.map((b) => b.id),
    };
  };
  const lastList = () => {
    const list = whatsappService.sendInteractiveList.mock.calls.at(-1)?.[0];
    return {
      header: list?.headerText as string,
      sections: list?.sections as {
        title: string;
        rows: { id: string; title: string }[];
      }[],
      ids: (list?.sections ?? []).flatMap((s) =>
        s.rows.map((r: { id: string }) => r.id),
      ) as string[],
    };
  };
  const session = (phoneNumberId = 'phone-id') => {
    const raw = cache.data.get(`whatsapp:session:${phoneNumberId}:${PHONE}`);
    return raw ? JSON.parse(raw) : null;
  };

  return {
    bot,
    cache,
    categoryService,
    deliver,
    notificationService,
    usersService,
    lastButtons,
    lastList,
    lastText,
    say,
    scheduleService,
    session,
    storeMemberService,
    tap,
    whatsappService,
  };
};

describe('WhatsappBotService', () => {
  let ctx: ReturnType<typeof makeBot>;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    ctx = makeBot();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('greets by name with the store name and the main options', async () => {
    await ctx.say('Oi!');

    const { body, ids } = ctx.lastButtons();
    expect(body).toContain('Olá, Ana!');
    expect(body).toContain('*Barbearia Central*');
    expect(ids).toEqual(['menu:book', 'menu:appointments']);
  });

  it('books through tappable lists, from the menu to the confirmation', async () => {
    await ctx.say('oi');
    await ctx.tap('menu:book');

    // Só serviços ativos, com duração e preço
    expect(ctx.lastList().ids).toEqual([`svc:${SERVICE_ID}`]);

    await ctx.tap(`svc:${SERVICE_ID}`);
    expect(ctx.lastList().ids).toEqual([
      'pro:any',
      `pro:${RAFAEL}`,
      `pro:${JULIA}`,
    ]);

    await ctx.tap(`pro:${RAFAEL}`);
    const days = ctx.lastList();
    // Domingo fechado fica de fora; 10 linhas = 8 dias + "ver mais" + lista de espera
    expect(days.ids[0]).toBe(`day:${TODAY}`);
    expect(days.ids).not.toContain('day:2030-12-29');
    expect(days.ids).toHaveLength(10);
    expect(days.ids.at(-2)).toMatch(/^day:more:/);
    expect(days.ids.at(-1)).toBe('day:waitlist');

    await ctx.tap(`day:${TODAY}`);
    const times = ctx.lastList();
    expect(times.sections.map((s) => s.title)).toEqual([
      '☀️ Manhã',
      '🌤️ Tarde',
      'Outras opções',
    ]);
    expect(times.ids).toEqual(['time:11:30', 'time:14:00', 'time:days']);

    await ctx.tap('time:14:00');
    const summary = ctx.lastButtons();
    expect(summary.body).toContain('Corte + barba (1h)');
    expect(summary.body).toContain('Rafael Lima');
    expect(summary.body).toContain('14:00');
    expect(summary.ids).toEqual([
      'confirm:yes',
      'confirm:change',
      'confirm:no',
    ]);

    await ctx.tap('confirm:yes');

    expect(ctx.scheduleService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        store: { id: STORE_ID },
        storeMember: { id: RAFAEL },
        services: [{ id: SERVICE_ID, duration: 60 }],
        user: { telephone: PHONE, firstName: 'Ana', lastName: 'Ribeiro' },
        date: TODAY,
        startTime: '14:00',
      }),
    );
    expect(ctx.lastText()).toContain('Agendamento confirmado');
    expect(ctx.lastText()).toContain('Rua das Flores, 100, São Paulo');
    expect(ctx.session()).toBeNull();
  });

  it('assigns whoever is free when the customer picks any professional', async () => {
    await ctx.say('agendar');
    await ctx.tap(`svc:${SERVICE_ID}`);
    await ctx.tap('pro:any');

    expect(ctx.scheduleService.getAvailability).toHaveBeenLastCalledWith(
      STORE_ID,
      expect.not.objectContaining({ memberId: expect.anything() }),
    );

    await ctx.tap(`day:${TODAY}`);
    await ctx.tap('time:11:30');
    expect(ctx.lastButtons().body).toContain('Julia Lima');

    await ctx.tap('confirm:yes');
    expect(ctx.scheduleService.create).toHaveBeenCalledWith(
      expect.objectContaining({ storeMember: { id: JULIA } }),
    );
  });

  it('skips the professional step when only one does the service', async () => {
    ctx.storeMemberService.findStoreMembers.mockResolvedValue([
      member(RAFAEL, 'Rafael'),
      { ...member(JULIA, 'Julia'), isDeleted: true },
    ]);

    await ctx.say('agendar');
    await ctx.tap(`svc:${SERVICE_ID}`);

    expect(ctx.lastList().ids[0]).toBe(`day:${TODAY}`);

    // Voltar dali pula a etapa que não apareceu
    await ctx.say('voltar');
    expect(ctx.lastList().ids).toEqual([`svc:${SERVICE_ID}`]);
  });

  it('goes back one step with "voltar"', async () => {
    await ctx.say('agendar');
    await ctx.tap(`svc:${SERVICE_ID}`);
    await ctx.tap(`pro:${RAFAEL}`);
    await ctx.say('voltar');

    expect(ctx.lastList().ids[0]).toBe('pro:any');
  });

  it('accepts a typed time and rejects one that is not free', async () => {
    await ctx.say('agendar');
    await ctx.tap(`svc:${SERVICE_ID}`);
    await ctx.tap(`pro:${RAFAEL}`);
    await ctx.tap(`day:${TODAY}`);

    await ctx.say('9h');
    expect(ctx.lastText()).toContain('09:00 não está livre');

    await ctx.say('14h');
    expect(ctx.lastButtons().ids[0]).toBe('confirm:yes');
  });

  it('offers other times when the slot was taken in the meantime', async () => {
    ctx.scheduleService.create.mockRejectedValueOnce(
      new ConflictException('taken'),
    );

    await ctx.say('agendar');
    await ctx.tap(`svc:${SERVICE_ID}`);
    await ctx.tap(`pro:${RAFAEL}`);
    await ctx.tap(`day:${TODAY}`);
    await ctx.tap('time:14:00');
    await ctx.tap('confirm:yes');

    expect(ctx.lastText()).toContain('acabou de reservar');
    expect(ctx.lastList().ids).toContain('time:11:30');
    expect(ctx.session().state).toBe('SELECT_TIME');
  });

  it('does not book a service id that is not from this store', async () => {
    await ctx.say('agendar');
    await ctx.tap('svc:5c1e2d3f-0000-4000-8000-00000000ffff');

    expect(ctx.lastText()).toContain('não está mais disponível');
    expect(ctx.session().state).toBe('SELECT_SERVICE');
  });

  it('lists upcoming appointments and cancels one as the customer', async () => {
    await ctx.say('meus agendamentos');

    expect(ctx.scheduleService.findUpcomingForCustomer).toHaveBeenCalledWith(
      STORE_ID,
      PHONE,
      TODAY,
    );
    expect(ctx.lastList().ids).toEqual([`appt:${SCHEDULE_ID}`]);
    expect(ctx.lastList().sections[0].rows[0].title).toBe('Sex, 27/12 · 15:00');

    await ctx.tap(`appt:${SCHEDULE_ID}`);
    expect(ctx.lastButtons().ids).toEqual([
      'appt:reschedule',
      'appt:cancel',
      'appt:back',
    ]);

    await ctx.tap('appt:cancel');
    expect(ctx.lastButtons().ids).toEqual(['cancel:yes', 'cancel:no']);
    expect(ctx.scheduleService.delete).not.toHaveBeenCalled();

    await ctx.tap('cancel:yes');
    expect(ctx.scheduleService.delete).toHaveBeenCalledWith(
      STORE_ID,
      SCHEDULE_ID,
      CUSTOMER_ID,
    );
    expect(ctx.lastButtons().body).toContain('foi cancelado');
  });

  it('treats a typed "cancelar" on an open appointment as cancelling it', async () => {
    await ctx.say('meus agendamentos');
    await ctx.tap(`appt:${SCHEDULE_ID}`);
    await ctx.say('Cancelar');

    expect(ctx.lastButtons().ids).toEqual(['cancel:yes', 'cancel:no']);
  });

  it('reschedules an appointment instead of creating another', async () => {
    await ctx.tap('menu:appointments');
    await ctx.tap(`appt:${SCHEDULE_ID}`);
    await ctx.tap('appt:reschedule');

    expect(ctx.lastList().ids[0]).toBe('pro:any');

    await ctx.tap(`pro:${JULIA}`);
    await ctx.tap(`day:${TODAY}`);
    await ctx.tap('time:11:30');

    expect(ctx.lastButtons().body).toContain('Antes: Sex, 27/12 às 15:00');

    await ctx.tap('confirm:yes');

    expect(ctx.scheduleService.reschedule).toHaveBeenCalledWith(
      STORE_ID,
      SCHEDULE_ID,
      { date: TODAY, startTime: '11:30', storeMemberId: JULIA },
    );
    expect(ctx.scheduleService.create).not.toHaveBeenCalled();
    expect(ctx.lastText()).toContain('Agendamento remarcado');
  });

  it('hides appointments from earlier today', async () => {
    ctx.scheduleService.findUpcomingForCustomer.mockResolvedValue([
      {
        id: SCHEDULE_ID,
        date: TODAY,
        startTime: '08:00',
        user: { id: CUSTOMER_ID },
        service: { id: SERVICE_ID, name: 'Corte', duration: 30 },
        storeMember: null,
      },
    ]);

    await ctx.say('meus agendamentos');

    expect(ctx.lastButtons().body).toContain('não tem nenhum agendamento');
    expect(ctx.lastButtons().ids).toEqual(['menu:book', 'menu:home']);
  });

  it('ignores a message the webhook delivered twice', async () => {
    const message = { id: 'wamid.same', type: 'text', text: { body: 'oi' } };

    await ctx.deliver(message);
    await ctx.deliver(message);

    expect(ctx.whatsappService.sendInteractiveButtons).toHaveBeenCalledTimes(1);
  });

  it('restarts when an option from an expired conversation is tapped', async () => {
    await ctx.tap(`day:${TODAY}`);

    expect(ctx.lastText()).toContain('expirou');
    expect(ctx.lastButtons().ids).toEqual(['menu:book', 'menu:appointments']);
  });

  it('keeps one conversation per store number', async () => {
    await ctx.say('agendar', makeConfig('store-a') as never);
    await ctx.say('oi', makeConfig('store-b') as never);

    expect(ctx.session('store-a').state).toBe('SELECT_SERVICE');
    expect(ctx.session('store-b').state).toBe('MENU');
  });

  it('tells the customer and resets when something fails', async () => {
    ctx.categoryService.findAll.mockRejectedValueOnce(new Error('db down'));

    await ctx.say('agendar');

    expect(ctx.lastText()).toContain('Tivemos um problema');
    expect(ctx.session()).toBeNull();
  });

  it('only logs delivery statuses, without answering', async () => {
    await ctx.bot.handleWebhookMessage({
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: 'phone-id' },
                statuses: [{ id: 'wamid.1', status: 'failed', errors: [] }],
              },
            },
          ],
        },
      ],
    } as never);

    expect(ctx.whatsappService.findOne).not.toHaveBeenCalled();
    expect(ctx.whatsappService.sendText).not.toHaveBeenCalled();
  });

  it('only answers for an active store number', async () => {
    ctx.whatsappService.findOne.mockResolvedValueOnce({
      ...(makeConfig() as object),
      isActive: false,
    } as never);

    await ctx.bot.handleWebhookMessage({
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                metadata: { phone_number_id: 'phone-id' },
                contacts: [{ profile: { name: 'Ana' } }],
                messages: [
                  { id: 'wamid.x', from: PHONE, text: { body: 'oi' } },
                ],
              },
            },
          ],
        },
      ],
    } as never);

    expect(ctx.whatsappService.sendInteractiveButtons).not.toHaveBeenCalled();
  });

  describe('asking for the e-mail', () => {
    const reachEmailStep = async () => {
      ctx.usersService.findByOne.mockResolvedValue(null);
      await ctx.say('agendar');
      await ctx.tap(`svc:${SERVICE_ID}`);
      await ctx.tap(`pro:${RAFAEL}`);
      await ctx.tap(`day:${TODAY}`);
      await ctx.tap('time:14:00');
    };
    const sentCode = () =>
      (
        ctx.notificationService.sendEmailConfirmationCode.mock.calls.at(
          -1,
        )?.[1] as {
          code: string;
        }
      )?.code;

    it('does not ask when the customer already has an e-mail', async () => {
      await ctx.say('agendar');
      await ctx.tap(`svc:${SERVICE_ID}`);
      await ctx.tap(`pro:${RAFAEL}`);
      await ctx.tap(`day:${TODAY}`);
      await ctx.tap('time:14:00');

      expect(ctx.usersService.findByOne).toHaveBeenCalledWith({
        telephone: `+${PHONE}`,
      });
      expect(ctx.lastButtons().body).toContain(
        '📧 Confirmação para ana@example.com',
      );
    });

    it('saves the e-mail only after the code sent to it is typed', async () => {
      await reachEmailStep();
      expect(ctx.lastButtons().ids).toEqual(['email:skip']);

      await ctx.say(' Ana.Agendamentos@Gmail.com ');
      expect(
        ctx.notificationService.sendEmailConfirmationCode,
      ).toHaveBeenCalledWith('ana.agendamentos@gmail.com', {
        code: expect.stringMatching(/^\d{6}$/),
        storeName: 'Barbearia Central',
        minutes: 10,
      });
      expect(ctx.lastButtons().ids).toEqual([
        'email:resend',
        'email:change',
        'email:skip',
      ]);
      // O código não fica guardado em texto na sessão
      expect(JSON.stringify(ctx.session())).not.toContain(sentCode());
      expect(ctx.usersService.linkVerifiedEmail).not.toHaveBeenCalled();

      await ctx.say(sentCode().replace(/(\d{3})/, '$1 '));

      expect(ctx.usersService.linkVerifiedEmail).toHaveBeenCalledWith({
        telephone: PHONE,
        email: 'ana.agendamentos@gmail.com',
        firstName: 'Ana',
        lastName: 'Ribeiro',
      });
      expect(ctx.lastText()).toContain('E-mail confirmado');
      expect(ctx.lastButtons().body).toContain(
        'Confirmação para ana.agendamentos@gmail.com',
      );
    });

    it('rejects a malformed e-mail and a wrong code', async () => {
      await reachEmailStep();

      await ctx.say('ana@');
      expect(ctx.lastText()).toContain('não parece certo');
      expect(
        ctx.notificationService.sendEmailConfirmationCode,
      ).not.toHaveBeenCalled();

      await ctx.say('ana@gmail.com');
      const wrong = sentCode() === '000000' ? '111111' : '000000';
      await ctx.say(wrong);

      expect(ctx.lastText()).toContain('Código incorreto');
      expect(ctx.usersService.linkVerifiedEmail).not.toHaveBeenCalled();
      expect(ctx.session().state).toBe('VERIFY_EMAIL');
    });

    it('gives up on the e-mail after too many wrong codes', async () => {
      await reachEmailStep();
      await ctx.say('ana@gmail.com');
      const wrong = sentCode() === '000000' ? '111111' : '000000';

      for (let i = 0; i < 5; i++) await ctx.say(wrong);

      expect(ctx.lastButtons().ids[0]).toBe('confirm:yes');
      expect(ctx.usersService.linkVerifiedEmail).not.toHaveBeenCalled();
    });

    it('refuses an expired code', async () => {
      await reachEmailStep();
      await ctx.say('ana@gmail.com');
      vi.setSystemTime(new Date(NOW.getTime() + 11 * 60 * 1000));

      await ctx.say(sentCode());

      expect(ctx.lastText()).toContain('expirou');
      expect(ctx.usersService.linkVerifiedEmail).not.toHaveBeenCalled();
    });

    it('limits how many codes one conversation can send', async () => {
      await reachEmailStep();
      await ctx.say('ana@gmail.com');
      await ctx.tap('email:resend');
      await ctx.tap('email:resend');
      await ctx.tap('email:resend');

      expect(
        ctx.notificationService.sendEmailConfirmationCode,
      ).toHaveBeenCalledTimes(3);
      expect(ctx.lastButtons().ids[0]).toBe('confirm:yes');
    });

    it('lets the customer skip and books without asking again', async () => {
      await reachEmailStep();
      await ctx.tap('email:skip');
      expect(ctx.lastButtons().ids[0]).toBe('confirm:yes');

      // Trocar o horário não pergunta de novo
      await ctx.tap('confirm:change');
      await ctx.tap('time:11:30');
      expect(ctx.lastButtons().ids[0]).toBe('confirm:yes');

      await ctx.tap('confirm:yes');
      expect(ctx.scheduleService.create).toHaveBeenCalled();
      expect(
        ctx.notificationService.sendEmailConfirmationCode,
      ).not.toHaveBeenCalled();
    });

    it('goes on without the e-mail when it belongs to another account', async () => {
      ctx.usersService.linkVerifiedEmail.mockResolvedValue('conflict');
      await reachEmailStep();
      await ctx.say('ana@gmail.com');
      await ctx.say(sentCode());

      expect(ctx.lastText()).toContain('outro cadastro');
      expect(ctx.lastButtons().body).not.toContain('📧');
    });

    it('does not ask when rescheduling', async () => {
      ctx.usersService.findByOne.mockResolvedValue(null);
      await ctx.tap('menu:appointments');
      await ctx.tap(`appt:${SCHEDULE_ID}`);
      await ctx.tap('appt:reschedule');
      await ctx.tap(`pro:${JULIA}`);
      await ctx.tap(`day:${TODAY}`);
      await ctx.tap('time:11:30');

      expect(ctx.lastButtons().ids[0]).toBe('confirm:yes');
      expect(ctx.usersService.findByOne).not.toHaveBeenCalled();
    });
  });
});
