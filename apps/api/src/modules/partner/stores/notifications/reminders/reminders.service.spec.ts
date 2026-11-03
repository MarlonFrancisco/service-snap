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
    update: vi.fn(async ({ id }: { id: string }, { status }) => {
      rows.get(id).status = status;
    }),
  };
};

const setup = (
  schedules: unknown[],
  scheduleReminder = vi.fn().mockResolvedValue({}),
  {
    templateStatus = 'APPROVED',
    missingFeatures = [] as string[],
  }: { templateStatus?: string; missingFeatures?: string[] } = {},
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
    findReminderTemplate: vi.fn().mockResolvedValue({ status: templateStatus }),
  };
  const planFeatureGuard = {
    getMissingFeatures: vi.fn().mockResolvedValue(missingFeatures),
  };
  const service = new RemindersService(
    { createQueryBuilder: () => builder } as never,
    reminders as never,
    { create: createHistory } as never,
    { scheduleReminder } as never,
    { get: () => 'https://app.test' } as never,
    whatsapp as never,
    planFeatureGuard as never,
  );

  return {
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

  it('keeps processing when a store has an invalid timezone', async () => {
    const base = schedule();
    const { service, scheduleReminder } = setup([
      schedule({
        id: 'schedule-broken',
        store: { ...base.store, timezone: 'Lua/Base' },
      }),
      schedule(),
    ]);

    await service.sendDueEmailReminders(NOW);

    expect(scheduleReminder).toHaveBeenCalledTimes(1);
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
});
