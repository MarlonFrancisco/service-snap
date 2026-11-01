import 'reflect-metadata';
import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCache } from 'cache-manager';
import type { AddressInfo } from 'node:net';
import Stripe from 'stripe';
import { QueryFailedError } from 'typeorm';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

process.env.IS_SERVELESS = 'true';

// createApp() real (parsers do main.ts) sobre um módulo só com o controller
vi.mock('../app.module', () => ({
  get AppModule() {
    return (globalThis as any).__AppModule;
  },
}));

const SECRET = 'whsec_local_validation';
const PERIOD_START = 1_790_000_000;
const PERIOD_END = 1_792_592_000;

const USER = { id: 'u1', email: 'u@test.dev', paymentCustomerId: 'cus_1' };

const stripeSubscription = (
  id: string,
  status: string,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  status,
  customer: USER.paymentCustomerId,
  created: PERIOD_START,
  ended_at: null,
  items: {
    data: [
      {
        current_period_start: PERIOD_START,
        current_period_end: PERIOD_END,
        price: { id: 'price_1', product: 'prod_1' },
      },
    ],
  },
  ...overrides,
});

function makeRepo() {
  const rows: any[] = [];
  const matches = (row: any, where: any) => {
    if (typeof where.subscriptionId === 'string') {
      return row.subscriptionId === where.subscriptionId;
    }
    if (where.user?.id && row.user?.id !== where.user.id) return false;
    if (where.status?.value && !where.status.value.includes(row.status)) {
      return false;
    }
    // Not(subscriptionId)
    if (row.subscriptionId === where.subscriptionId?.value) return false;
    return true;
  };
  const tick = () => new Promise((r) => setTimeout(r, 2));
  return {
    rows,
    findOne: async ({ where }: any) => {
      await tick();
      const row = rows.find((r) => matches(r, where));
      // Como o TypeORM: coluna `date` volta do banco como string
      return row
        ? {
            ...row,
            currentPeriodEnd: row.currentPeriodEnd?.toISOString().slice(0, 10),
          }
        : null;
    },
    find: async ({ where }: any) => {
      await tick();
      return rows.filter((row) => matches(row, where));
    },
    create: (data: any) => ({ ...data }),
    save: async (row: any) => {
      await tick();
      // Mesmo comportamento do índice único no Postgres
      if (rows.some((r) => r.subscriptionId === row.subscriptionId)) {
        throw new QueryFailedError('INSERT', [], {
          code: '23505',
        } as unknown as Error);
      }
      row.id = `row_${rows.length + 1}`;
      rows.push(row);
      return row;
    },
    update: async (where: any, data: any) => {
      rows
        .filter((r) => matches(r, where))
        .forEach((r) => Object.assign(r, data));
    },
  };
}

function makeStripe() {
  const state = new Map<string, any>();
  const stripe = new Stripe('sk_test_local_validation') as any;
  stripe.subscriptions = {
    retrieve: vi.fn(async (id: string) => {
      const subscription = state.get(id);
      if (!subscription) {
        throw new Stripe.errors.StripeInvalidRequestError({
          type: 'invalid_request_error',
          code: 'resource_missing',
          message: `No such subscription: ${id}`,
        });
      }
      return subscription;
    }),
    cancel: vi.fn(async (id: string) => {
      state.get(id).status = 'canceled';
    }),
  };
  stripe.products = { retrieve: vi.fn(async () => ({ metadata: {} })) };
  return { stripe, state };
}

const apps: any[] = [];

async function boot(shared?: {
  repo: ReturnType<typeof makeRepo>;
  stripe: any;
  state: Map<string, any>;
}) {
  const { createApp } = await import('../../main');

  const repo = shared?.repo ?? makeRepo();
  const { stripe, state } = shared ?? makeStripe();
  const notification = {
    invoicePaid: vi.fn(async () => undefined),
    paymentFailed: vi.fn(async () => undefined),
  };
  // Um cache por instância, como lambdas distintas sem cache compartilhado
  const service = new (SubscriptionService as any)(
    repo,
    {
      findByOne: async ({ paymentCustomerId }: any) =>
        paymentCustomerId === USER.paymentCustomerId ? USER : null,
    },
    stripe,
    {},
    {},
    notification,
    new ConfigService({ STRIPE_WEBHOOK_SECRET: SECRET }),
    createCache(),
  );

  // esbuild não emite metadata de decorators
  Reflect.defineMetadata(
    'design:paramtypes',
    [SubscriptionService],
    SubscriptionController,
  );
  class TestModule {}
  Module({
    controllers: [SubscriptionController],
    providers: [{ provide: SubscriptionService, useValue: service }],
  })(TestModule);
  (globalThis as any).__AppModule = TestModule;

  const app = await createApp();
  app.useLogger(false);
  apps.push(app);
  const server = app.getHttpServer().listen(0);
  await new Promise((r) => server.once('listening', r));
  const { port } = server.address() as AddressInfo;

  const send = (
    body: string,
    signature: string | null,
    contentType = 'application/json; charset=utf-8',
  ) =>
    fetch(`http://127.0.0.1:${port}/subscription/webhook`, {
      method: 'POST',
      headers: {
        'content-type': contentType,
        ...(signature ? { 'stripe-signature': signature } : {}),
      },
      body,
    });

  const sign = (
    payload: string,
    opts: { secret?: string; timestamp?: number } = {},
  ) =>
    stripe.webhooks.generateTestHeaderString({
      payload,
      secret: opts.secret ?? SECRET,
      timestamp: opts.timestamp,
    });

  const post = (payload: string) => send(payload, sign(payload));

  return { post, send, sign, repo, stripe, state, notification };
}

/** O payload pode estar defasado: o estado que vale é o de `state`. */
const subEvent = (id: string, type: string, subId = 'sub_new') =>
  JSON.stringify({
    id,
    object: 'event',
    type: `customer.subscription.${type}`,
    data: { object: { id: subId, status: 'stale_payload_status' } },
  });

const invoiceEvent = (id: string, type: string, subId = 'sub_new') =>
  JSON.stringify({
    id,
    object: 'event',
    type: `invoice.${type}`,
    data: {
      object: {
        id: 'in_1',
        attempt_count: 1,
        parent: { subscription_details: { subscription: subId } },
      },
    },
  });

afterEach(async () => {
  while (apps.length) await apps.pop().close();
  vi.restoreAllMocks();
});

describe('assinatura e raw body', () => {
  it('aceita evento assinado preservando os bytes exatos', async () => {
    const { post } = await boot();
    const payload = `{\n  "id": "evt_ok",   "object": "event", "type": "ping.ação", "data": {"object": {}}\n}`;

    const res = await post(payload);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: true });
  });

  it('rejeita sem processar quando a assinatura ou o corpo são inválidos', async () => {
    const { send, sign, repo, state } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));
    const payload = subEvent('evt_x', 'created');

    const responses = await Promise.all([
      send(payload.replace('sub_new', 'sub_other'), sign(payload)),
      send(payload, sign(payload, { secret: 'whsec_other' })),
      send(
        payload,
        sign(payload, { timestamp: Math.floor(Date.now() / 1000) - 3600 }),
      ),
      send(payload, null),
      send(payload, sign(payload), 'text/plain'),
    ]);

    expect(responses.map((r) => r.status)).toEqual([400, 400, 400, 400, 400]);
    expect(repo.rows).toHaveLength(0);
  });
});

describe('ciclo de vida', () => {
  it('acompanha created, invoice.paid, updated e deleted na mesma linha', async () => {
    const { post, repo, state, notification } = await boot();

    state.set('sub_new', stripeSubscription('sub_new', 'incomplete'));
    await post(subEvent('e1', 'created'));
    expect(repo.rows[0]).toMatchObject({ status: 'incomplete', user: USER });

    state.get('sub_new').status = 'active';
    expect((await post(invoiceEvent('e2', 'paid'))).status).toBe(200);
    expect(repo.rows[0].status).toBe('active');
    expect(repo.rows[0].currentPeriodEnd).toEqual(new Date(PERIOD_END * 1000));
    expect(notification.invoicePaid).toHaveBeenCalledOnce();

    state.get('sub_new').status = 'past_due';
    await post(subEvent('e3', 'updated'));
    expect(repo.rows[0].status).toBe('past_due');

    const endedAt = PERIOD_START + 100;
    Object.assign(state.get('sub_new'), {
      status: 'canceled',
      ended_at: endedAt,
    });
    await post(subEvent('e4', 'deleted'));
    expect(repo.rows[0].status).toBe('canceled');
    expect(repo.rows[0].currentPeriodEnd).toEqual(new Date(endedAt * 1000));

    expect(repo.rows).toHaveLength(1);
  });

  it('marca como cancelada a assinatura que não existe mais na Stripe', async () => {
    const { post, repo, state } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));
    await post(subEvent('e1', 'created'));

    state.delete('sub_new');
    const res = await post(subEvent('e2', 'deleted'));

    expect(res.status).toBe(200);
    expect(repo.rows[0].status).toBe('canceled');
  });

  it('não grava linha órfã para customer desconhecido', async () => {
    const { post, repo, state } = await boot();
    state.set(
      'sub_x',
      stripeSubscription('sub_x', 'active', { customer: 'cus_unknown' }),
    );

    const res = await post(subEvent('e1', 'created', 'sub_x'));

    expect(res.status).toBe(200);
    expect(repo.rows).toHaveLength(0);
  });
});

describe('idempotência', () => {
  it('ignora reentrega na mesma instância', async () => {
    const { post, state, stripe } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));
    const event = subEvent('dup', 'created');

    await post(event);
    const res = await post(event);

    expect(await res.json()).toEqual({ received: true, duplicate: true });
    expect(stripe.subscriptions.retrieve).toHaveBeenCalledOnce();
  });

  it('reentrega em outra instância não cancela a própria assinatura nem duplica linha', async () => {
    const a = await boot();
    const b = await boot({ repo: a.repo, stripe: a.stripe, state: a.state });
    a.state.set('sub_new', stripeSubscription('sub_new', 'active'));
    const event = subEvent('evt_re', 'created');

    expect((await a.post(event)).status).toBe(200);
    expect((await b.post(event)).status).toBe(200);

    expect(a.stripe.subscriptions.cancel).not.toHaveBeenCalled();
    expect(a.repo.rows).toHaveLength(1);
  });

  it('entregas simultâneas resultam em uma única linha', async () => {
    const { post, repo, state } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));
    const event = subEvent('evt_par', 'created');

    const results = await Promise.all([post(event), post(event)]);

    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(repo.rows).toHaveLength(1);
  });

  it('invoice.paid que perde a corrida do insert ainda notifica e responde 200', async () => {
    const { post, repo, state, notification } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));

    const results = await Promise.all([
      post(invoiceEvent('evt_inv_1', 'paid')),
      post(invoiceEvent('evt_inv_2', 'paid')),
    ]);

    expect(results.map((r) => r.status)).toEqual([200, 200]);
    expect(repo.rows).toHaveLength(1);
    expect(notification.invoicePaid).toHaveBeenCalledTimes(2);
  });

  it('propaga erro inesperado para a Stripe retentar, com log', async () => {
    const { post, stripe, state } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));
    stripe.products.retrieve.mockRejectedValueOnce(new Error('boom'));
    const errorSpy = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const event = subEvent('evt_err', 'created');

    expect((await post(event)).status).toBe(500);
    expect(errorSpy).toHaveBeenCalled();

    // O erro não marcou o evento como processado: o retry é executado
    const retry = await post(event);
    expect(await retry.json()).toEqual({ received: true });
  });
});

describe('eventos fora de ordem', () => {
  it('updated antes de created já grava o estado atual', async () => {
    const { post, repo, state } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));

    await post(subEvent('e_u', 'updated'));
    await post(subEvent('e_c', 'created'));

    expect(repo.rows).toHaveLength(1);
    expect(repo.rows[0].status).toBe('active');
  });

  it('deleted antes de created mantém a assinatura cancelada', async () => {
    const { post, repo, state } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'canceled'));

    await post(subEvent('e_d', 'deleted'));
    await post(subEvent('e_c', 'created'));

    expect(repo.rows).toHaveLength(1);
    expect(repo.rows[0].status).toBe('canceled');
  });

  it('invoice.paid antes de created cria a linha e notifica', async () => {
    const { post, repo, state, notification } = await boot();
    state.set('sub_new', stripeSubscription('sub_new', 'active'));

    const res = await post(invoiceEvent('e_i', 'paid'));

    expect(res.status).toBe(200);
    expect(repo.rows[0].status).toBe('active');
    expect(notification.invoicePaid).toHaveBeenCalledOnce();
  });
});

describe('troca de plano', () => {
  const setup = async (newStatus: string) => {
    const ctx = await boot();
    ctx.state.set('sub_old', stripeSubscription('sub_old', 'active'));
    ctx.state.set(
      'sub_new',
      stripeSubscription('sub_new', newStatus, { created: PERIOD_START + 10 }),
    );
    await ctx.post(subEvent('e_old', 'created', 'sub_old'));
    return ctx;
  };

  it('cancela a assinatura anterior quando a nova fica ativa', async () => {
    const { post, stripe } = await setup('active');

    await post(subEvent('e_new', 'created'));

    expect(stripe.subscriptions.cancel).toHaveBeenCalledOnce();
    expect(stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_old', {
      prorate: true,
    });
  });

  it('só cancela a anterior depois que a nova sai de incomplete', async () => {
    const { post, stripe, state } = await setup('incomplete');

    await post(subEvent('e_new', 'created'));
    expect(stripe.subscriptions.cancel).not.toHaveBeenCalled();

    state.get('sub_new').status = 'active';
    await post(subEvent('e_new2', 'updated'));
    expect(stripe.subscriptions.cancel).toHaveBeenCalledWith('sub_old', {
      prorate: true,
    });
  });

  it('evento atrasado da assinatura antiga não cancela a nova', async () => {
    const { post, stripe, state } = await setup('active');
    await post(subEvent('e_new', 'created'));
    stripe.subscriptions.cancel.mockClear();
    // Antiga ainda ativa na Stripe no momento do evento atrasado
    state.get('sub_old').status = 'active';

    await post(subEvent('e_old_late', 'updated', 'sub_old'));

    expect(stripe.subscriptions.cancel).not.toHaveBeenCalledWith(
      'sub_new',
      expect.anything(),
    );
  });
});
