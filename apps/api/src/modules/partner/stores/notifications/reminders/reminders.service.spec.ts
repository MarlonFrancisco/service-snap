import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { RemindersService } from './reminders.service';

const NOW = new Date('2026-11-02T13:00:00Z');

const schedule = (overrides: Record<string, unknown> = {}) => ({
  id: 'schedule-1',
  date: '2026-11-03',
  startTime: '09:30', // 12:30 UTC, 23h30 depois de NOW
  status: 'scheduled',
  user: { email: 'cliente@teste.com', firstName: 'Ana' },
  service: { name: 'Corte' },
  storeMember: { user: { firstName: 'Bia' } },
  store: {
    id: 'store-1',
    name: 'Loja',
    timezone: 'America/Sao_Paulo',
    notificationsSettings: {
      emailReminderEnabled: true,
      emailReminderAdvanceHours: '24h',
      emailReminderCustomMessage: 'Até logo!',
    },
  },
  ...overrides,
});

const withAdvance = (emailReminderAdvanceHours: string | null) => {
  const base = schedule();

  return schedule({
    store: {
      ...base.store,
      notificationsSettings: {
        ...base.store.notificationsSettings,
        emailReminderAdvanceHours,
      },
    },
  });
};

/** Reproduz o ON CONFLICT da trava, cuja execução real exige Postgres. */
const fakeReminderRepository = () => {
  const rows = new Map<
    string,
    { id: string; status: string; attempts: number }
  >();

  return {
    rows,
    query: vi.fn(
      async (_sql: string, [id, channel, key, maxAttempts]: never[]) => {
        const slot = `${id}|${channel}|${key}`;
        const row = rows.get(slot);

        if (!row) {
          const created = { id: slot, status: 'sending', attempts: 1 };
          rows.set(slot, created);
          return [{ id: created.id, attempts: created.attempts }];
        }

        if (row.status !== 'failed' || row.attempts >= maxAttempts) return [];

        row.status = 'sending';
        row.attempts += 1;
        return [{ id: row.id, attempts: row.attempts }];
      },
    ),
    update: vi.fn(async ({ id }: { id: string }, { status, attempts }) => {
      rows.get(id).status = status;
      if (attempts) rows.get(id).attempts = attempts;
    }),
  };
};

const setup = (
  schedules: unknown[],
  scheduleReminder = vi.fn().mockResolvedValue({}),
  {
    templateStatus = 'APPROVED',
    missingFeatures = [] as string[],
    hasConsent = true,
  }: {
    templateStatus?: string;
    missingFeatures?: string[];
    hasConsent?: boolean;
  } = {},
) => {
  const builder = new Proxy(
    { getMany: vi.fn().mockResolvedValue(schedules) },
    {
      get: (target, key, proxy) =>
        target[key as 'getMany'] ?? vi.fn().mockReturnValue(proxy),
    },
  );
  const reminders = fakeReminderRepository();
  const createHistory = vi.fn().mockResolvedValue(undefined);
  const whatsapp = {
    sendTemplate: vi.fn().mockResolvedValue(undefined),
    // O template antigo aprovado: os novos ainda esperam a Meta
    findReminderTemplate: vi.fn().mockResolvedValue({
      name: 'servicesnap_lembrete_agendamento',
      status: templateStatus,
    }),
    ensureStoreTemplates: vi.fn().mockResolvedValue([]),
  };
  const planFeatureGuard = {
    getMissingFeatures: vi.fn().mockResolvedValue(missingFeatures),
  };
  const consent = {
    hasConsent: vi.fn().mockResolvedValue(hasConsent),
    findOptOutLink: vi.fn().mockResolvedValue(null),
  };
  const service = new RemindersService(
    { createQueryBuilder: () => builder } as never,
    reminders as never,
    { create: createHistory } as never,
    { scheduleReminder } as never,
    { get: () => 'https://app.test' } as never,
    whatsapp as never,
    planFeatureGuard as never,
    consent as never,
  );

  return {
    consent,
    service,
    scheduleReminder,
    createHistory,
    reminders,
    whatsapp,
    planFeatureGuard,
  };
};

const whatsappSchedule = (overrides: Record<string, unknown> = {}) => {
  const base = schedule();

  return schedule({
    user: { firstName: 'Ana', telephone: '(11) 98888-7777' },
    store: {
      ...base.store,
      address: 'Rua A, 1',
      whatsappConfig: { phoneNumberId: 'phone-1', accessToken: 'token-1' },
      notificationsSettings: {
        whatsappReminderEnabled: true,
        whatsappReminderAdvanceHours: '24h',
        whatsappReminderCustomMessage: 'Traga\n o cartão.',
      },
    },
    ...overrides,
  });
};

describe('RemindersService', () => {
  it('sends one email and writes one history row inside the window', async () => {
    const { service, scheduleReminder, createHistory } = setup([schedule()]);

    await expect(service.sendDueEmailReminders(NOW)).resolves.toEqual({
      sent: 1,
      failed: 0,
    });

    expect(scheduleReminder).toHaveBeenCalledTimes(1);
    expect(scheduleReminder).toHaveBeenCalledWith(
      'cliente@teste.com',
      expect.objectContaining({
        scheduleDay: 'Terça-feira, 3 de novembro',
        scheduleTime: '09:30',
        price: 'Sob consulta',
        customMessage: 'Até logo!',
        manageLink: 'https://app.test/profile',
      }),
    );
    expect(createHistory).toHaveBeenCalledTimes(1);
    expect(createHistory.mock.calls[0][0]).toMatchObject({
      type: 'reminder',
      status: 'sent',
      recipient: 'cliente@teste.com',
    });
  });

  it('does not repeat the reminder on later or concurrent runs', async () => {
    const { service, scheduleReminder, createHistory } = setup([schedule()]);

    await Promise.all([
      service.sendDueEmailReminders(NOW),
      service.sendDueEmailReminders(NOW),
    ]);
    await service.sendDueEmailReminders(new Date(NOW.getTime() + 900_000));

    expect(scheduleReminder).toHaveBeenCalledTimes(1);
    expect(createHistory).toHaveBeenCalledTimes(1);
  });

  it('sends again when the appointment moves to another time', async () => {
    const { service, scheduleReminder } = setup([schedule()]);
    await service.sendDueEmailReminders(NOW);

    const moved = setup([schedule({ startTime: '10:00' })]);
    moved.reminders.rows.set('schedule-1|email|2026-11-03T09:30', {
      id: 'old',
      status: 'sent',
      attempts: 1,
    });
    await moved.service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).toHaveBeenCalledTimes(1);
    expect(moved.scheduleReminder).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['before the advance configured by the store', withAdvance('12h')],
    [
      'after the appointment started',
      schedule({ startTime: '09:59', date: '2026-11-02' }),
    ],
    ['when the customer has no email', schedule({ user: { email: null } })],
    ['when the appointment has no time', schedule({ startTime: null })],
  ])('skips %s', async (_name, candidate) => {
    const { service, scheduleReminder, reminders } = setup([candidate]);

    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).not.toHaveBeenCalled();
    expect(reminders.rows.size).toBe(0);
  });

  it.each([
    ['24h', true],
    ['24', true],
    ['23h', false],
    [null, true], // o painel assume 24h
    ['abc', true],
  ])('reads the advance %s', async (advance, sends) => {
    const { service, scheduleReminder } = setup([withAdvance(advance)]);

    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).toHaveBeenCalledTimes(sends ? 1 : 0);
  });

  it('uses the store timezone to place the window', async () => {
    const base = schedule();
    const { service, scheduleReminder } = setup([
      schedule({
        startTime: '12:45', // Em Tóquio, 03:45 UTC: faltam menos de 24h
        store: { ...base.store, timezone: 'Asia/Tokyo' },
      }),
      schedule({
        id: 'schedule-2',
        startTime: '14:00', // Em São Paulo, 17:00 UTC: faltam mais de 24h
      }),
    ]);

    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).toHaveBeenCalledTimes(1);
  });

  it('falls back to the country timezone when a store has an invalid one', async () => {
    const base = schedule();
    const { service, scheduleReminder } = setup([
      schedule({
        id: 'schedule-broken',
        store: { ...base.store, timezone: 'Lua/Base' },
      }),
      schedule(),
    ]);

    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).toHaveBeenCalledTimes(2);
  });

  it('retries a failed send without an extra history row', async () => {
    const scheduleReminder = vi
      .fn()
      .mockRejectedValueOnce(new ServiceUnavailableException())
      .mockResolvedValue({});
    const { service, createHistory } = setup([schedule()], scheduleReminder);

    await expect(service.sendDueEmailReminders(NOW)).resolves.toEqual({
      sent: 0,
      failed: 1,
    });
    expect(createHistory).not.toHaveBeenCalled();

    await expect(service.sendDueEmailReminders(NOW)).resolves.toEqual({
      sent: 1,
      failed: 0,
    });
    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).toHaveBeenCalledTimes(2);
    expect(createHistory).toHaveBeenCalledTimes(1);
    expect(createHistory.mock.calls[0][0].status).toBe('sent');
  });

  it('records the failure once after the last attempt', async () => {
    const scheduleReminder = vi
      .fn()
      .mockRejectedValue(new ServiceUnavailableException());
    const { service, createHistory } = setup([schedule()], scheduleReminder);

    for (let run = 0; run < 5; run += 1) {
      await service.sendDueEmailReminders(NOW);
    }

    expect(scheduleReminder).toHaveBeenCalledTimes(3);
    expect(createHistory).toHaveBeenCalledTimes(1);
    expect(createHistory.mock.calls[0][0].status).toBe('failed');
  });

  it('does not resend when the history row cannot be written', async () => {
    const { service, scheduleReminder, createHistory } = setup([schedule()]);
    createHistory.mockRejectedValueOnce(new Error('db down'));

    await service.sendDueEmailReminders(NOW);
    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).toHaveBeenCalledTimes(1);
  });
});

describe('RemindersService WhatsApp', () => {
  it('sends the approved template to the customer phone', async () => {
    const { service, whatsapp, createHistory } = setup([whatsappSchedule()]);

    await expect(service.sendDueWhatsappReminders(NOW)).resolves.toEqual({
      sent: 1,
      failed: 0,
    });

    expect(whatsapp.sendTemplate).toHaveBeenCalledWith(
      'phone-1',
      '5511988887777',
      {
        name: 'servicesnap_lembrete_agendamento',
        language: 'pt_BR',
        bodyParams: [
          'Ana',
          'Loja',
          'Terça-feira, 3 de novembro',
          '09:30',
          'Bia',
          'Corte',
          'Rua A, 1',
          'Traga o cartão.',
        ],
      },
      'token-1',
    );
    expect(createHistory.mock.calls[0][0]).toMatchObject({
      status: 'sent',
      recipient: '5511988887777',
      message: 'Lembrete por WhatsApp do agendamento de 03/11/2026 às 09:30',
    });
  });

  it('keeps the email and WhatsApp reminders of one appointment apart', async () => {
    const { service, scheduleReminder, whatsapp, reminders } = setup([
      whatsappSchedule({
        user: { email: 'a@a.com', telephone: '11988887777' },
      }),
    ]);
    reminders.rows.set('schedule-1|email|2026-11-03T09:30', {
      id: 'email',
      status: 'sent',
      attempts: 1,
    });

    await service.sendDueWhatsappReminders(NOW);

    expect(scheduleReminder).not.toHaveBeenCalled();
    expect(whatsapp.sendTemplate).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['the template is not approved yet', { templateStatus: 'PENDING' }],
    ['the plan lost WhatsApp', { missingFeatures: ['WHATSAPP_INTEGRATION'] }],
  ])('waits without claiming when %s', async (_name, options) => {
    const { service, whatsapp, reminders } = setup(
      [whatsappSchedule()],
      undefined,
      options,
    );

    await service.sendDueWhatsappReminders(NOW);

    expect(whatsapp.sendTemplate).not.toHaveBeenCalled();
    expect(reminders.rows.size).toBe(0);
  });

  it('checks each store once per run', async () => {
    const { service, whatsapp, planFeatureGuard } = setup([
      whatsappSchedule(),
      whatsappSchedule({ id: 'schedule-2' }),
    ]);

    await service.sendDueWhatsappReminders(NOW);

    expect(whatsapp.sendTemplate).toHaveBeenCalledTimes(2);
    expect(whatsapp.findReminderTemplate).toHaveBeenCalledTimes(1);
    expect(planFeatureGuard.getMissingFeatures).toHaveBeenCalledTimes(1);
  });

  it('skips customers without a usable phone', async () => {
    const { service, whatsapp } = setup([
      whatsappSchedule({ user: { firstName: 'Ana', telephone: '1234' } }),
    ]);

    await service.sendDueWhatsappReminders(NOW);

    expect(whatsapp.sendTemplate).not.toHaveBeenCalled();
  });

  it('still sends emails when the WhatsApp channel breaks', async () => {
    const { service, whatsapp } = setup([schedule()]);
    vi.spyOn(service, 'sendDueWhatsappReminders').mockRejectedValue(
      new Error('db down'),
    );

    await expect(service.sendDueReminders(NOW)).resolves.toEqual({
      email: { sent: 1, failed: 0 },
      whatsapp: null,
    });
    expect(whatsapp.sendTemplate).not.toHaveBeenCalled();
  });

  it('checks the opt-in on the number it is sending to', async () => {
    const { service, consent } = setup([
      whatsappSchedule({
        user: { id: 'user-1', firstName: 'Ana', telephone: '11988887777' },
      }),
    ]);

    await service.sendDueWhatsappReminders(NOW);

    expect(consent.hasConsent).toHaveBeenCalledWith(
      'store-1',
      'user-1',
      '5511988887777',
    );
  });
});

describe('RemindersService WhatsApp opt-in fallback', () => {
  const withEmail = (emailReminderEnabled?: boolean) => {
    const base = whatsappSchedule();

    return whatsappSchedule({
      user: {
        firstName: 'Ana',
        email: 'ana@teste.com',
        telephone: '11988887777',
      },
      store: {
        ...base.store,
        notificationsSettings: {
          ...base.store.notificationsSettings,
          emailReminderEnabled,
        },
      },
    });
  };

  it('emails once at the WhatsApp time when the customer did not opt in', async () => {
    const { service, whatsapp, scheduleReminder, createHistory } = setup(
      [withEmail(false)],
      undefined,
      { hasConsent: false },
    );

    await service.sendDueWhatsappReminders(NOW);
    await service.sendDueWhatsappReminders(NOW);

    expect(whatsapp.sendTemplate).not.toHaveBeenCalled();
    expect(scheduleReminder).toHaveBeenCalledTimes(1);
    expect(scheduleReminder).toHaveBeenCalledWith(
      'ana@teste.com',
      expect.anything(),
    );
    expect(createHistory).toHaveBeenCalledTimes(1);
    expect(createHistory.mock.calls[0][0]).toMatchObject({
      status: 'sent',
      recipient: 'ana@teste.com',
      message:
        'Lembrete por e-mail (no lugar do WhatsApp) do agendamento de 03/11/2026 às 09:30',
    });
  });

  it('leaves it to the email reminder when the store already sends it', async () => {
    const { service, whatsapp, scheduleReminder, reminders } = setup(
      [withEmail(true)],
      undefined,
      { hasConsent: false },
    );

    await service.sendDueWhatsappReminders(NOW);

    expect(whatsapp.sendTemplate).not.toHaveBeenCalled();
    expect(scheduleReminder).not.toHaveBeenCalled();
    expect(reminders.rows.size).toBe(0);
  });

  it('does not email twice when the email reminder already went out', async () => {
    const { service, scheduleReminder, reminders } = setup(
      [withEmail(false)],
      undefined,
      { hasConsent: false },
    );
    reminders.rows.set('schedule-1|email|2026-11-03T09:30', {
      id: 'email',
      status: 'sent',
      attempts: 1,
    });

    await service.sendDueWhatsappReminders(NOW);

    expect(scheduleReminder).not.toHaveBeenCalled();
  });

  it('records once that the reminder could not go anywhere', async () => {
    const { service, scheduleReminder, createHistory } = setup(
      [whatsappSchedule()],
      undefined,
      { hasConsent: false },
    );

    await service.sendDueWhatsappReminders(NOW);
    await service.sendDueWhatsappReminders(NOW);

    expect(scheduleReminder).not.toHaveBeenCalled();
    expect(createHistory).toHaveBeenCalledTimes(1);
    expect(createHistory.mock.calls[0][0]).toMatchObject({
      status: 'failed',
      title: 'Lembrete não enviado',
      message:
        'Lembrete de 03/11/2026 às 09:30 não enviado: sem opt-in de WhatsApp e sem e-mail',
    });
  });

  it('emails once after the last WhatsApp attempt fails', async () => {
    const { service, whatsapp, scheduleReminder } = setup([withEmail(false)]);
    whatsapp.sendTemplate.mockRejectedValue(new Error('meta down'));

    for (let run = 0; run < 4; run += 1) {
      await service.sendDueWhatsappReminders(NOW);
      if (run < 2) expect(scheduleReminder).not.toHaveBeenCalled();
    }

    expect(whatsapp.sendTemplate).toHaveBeenCalledTimes(3);
    expect(scheduleReminder).toHaveBeenCalledTimes(1);
  });

  it('adds the WhatsApp opt-out link to the email', async () => {
    const { service, scheduleReminder, consent } = setup([schedule()]);
    consent.findOptOutLink.mockResolvedValue(
      'https://app.test/whatsapp/sair/t',
    );

    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder.mock.calls[0][1]).toMatchObject({
      whatsappOptOutLink: 'https://app.test/whatsapp/sair/t',
    });
  });
});
