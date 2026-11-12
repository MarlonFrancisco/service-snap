import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  In,
  MoreThanOrEqual,
  Not,
  QueryFailedError,
  type Repository,
} from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import Stripe from 'stripe';
import {
  getSubscriptionIdFromInvoice,
  normalizeSubscriptionMetadata,
} from '../../utils';
import { formatCurrency } from '../../utils/helpers/format.helpers';
import { NotificationService } from '../notification';
import { ScheduleService } from '../partner/stores/schedule/schedule.service';
import { StoresService } from '../partner/stores/stores.services';
import { StripeService } from '../stripe';
import { UsersService } from '../users';
import { CurrentPlanDto } from './dto/current-plan.dto';
import { CustomerSubscriptionUpdateDto } from './dto/customer-subscription-update.dto';
import { Subscription } from './subscription.entity';
import { TCheckoutSessionStatus } from './subscription.types';

/** Stripe retenta webhooks por ~3 dias; TTL cobre retries sem acumular chaves. */
const WEBHOOK_EVENT_TTL_MS = 72 * 60 * 60 * 1000;

const PG_UNIQUE_VIOLATION = '23505';

const isStripeResourceMissing = (error: unknown) =>
  error instanceof Stripe.errors.StripeError &&
  error.code === 'resource_missing';

const isUniqueViolation = (error: unknown) =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string })?.code === PG_UNIQUE_VIOLATION;

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UsersService,
    private readonly stripeService: StripeService,
    private readonly scheduleService: ScheduleService,
    private readonly storesService: StoresService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Sessão do portal de cobrança do Stripe, onde o dono troca o cartão, vê as
   * faturas e atualiza os dados de cobrança. Volta para a tela de planos.
   */
  async createBillingPortalSession(userId: string): Promise<{ url: string }> {
    const user = await this.userService.findById(userId);

    if (!user?.paymentCustomerId) {
      throw new BadRequestException('No billing account for this user');
    }

    const session = await this.stripeService.billingPortal.sessions.create({
      customer: user.paymentCustomerId,
      return_url: `${this.configService.get<string>('FRONTEND_URL')}/partner/plans`,
    });

    return { url: session.url };
  }

  async cancel(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user: { id: userId },
        status: In(['active', 'paid', 'trialing']),
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const response = await this.stripeService.subscriptions.update(
      subscription.subscriptionId,
      {
        cancel_at_period_end: true,
      },
    );

    return { cancelAtPeriodEnd: response.cancel_at_period_end };
  }

  async update(userId: string, cancelAtPeriodEnd: boolean) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user: { id: userId },
        status: In(['active', 'paid', 'trialing']),
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const response = await this.stripeService.subscriptions.update(
      subscription.subscriptionId,
      {
        cancel_at_period_end: cancelAtPeriodEnd,
      },
    );
    return { cancelAtPeriodEnd: response.cancel_at_period_end };
  }

  async getCurrentPlan(userId: string): Promise<CurrentPlanDto> {
    try {
      const currentDate = new Date();
      // 1. Buscar subscription ativa do usuário no banco
      const subscription = await this.subscriptionRepository.findOne({
        where: {
          user: { id: userId },
          status: In(['active', 'paid', 'trialing']),
          currentPeriodEnd: MoreThanOrEqual(currentDate),
        },
        relations: ['user'],
      });

      if (!subscription) {
        throw new NotFoundException(
          'Nenhuma subscription ativa encontrada para este usuário',
        );
      }

      // 2. Buscar subscription detalhada do Stripe
      const stripeSubscription =
        await this.stripeService.subscriptions.retrieve(
          subscription.subscriptionId,
        );

      // 3. Buscar detalhes do produto e preço do Stripe
      const product = await this.stripeService.products.retrieve(
        subscription.productId,
      );

      const price = await this.stripeService.prices.retrieve(
        subscription.priceId,
      );

      const nextBillingDate = new Date(stripeSubscription.start_date * 1000);

      const schedules = await this.scheduleService.getSchedulesByMonth(
        userId,
        nextBillingDate.getDate(),
        currentDate.getMonth() - 1,
        currentDate.getFullYear(),
      );

      nextBillingDate.setMonth(currentDate.getMonth() + 1);

      const activeStores = await this.storesService.getActiveStores(userId);

      const schedulesLength = schedules.length || 0;
      const storesLength = activeStores.length || 0;
      const storeMembersLength = activeStores.reduce(
        (acc, store) => acc + store.storeMembers.length,
        0,
      );

      // 4. Buscar histórico de pagamentos (invoices) dos últimos 12 meses
      const twelveMonthsAgo = Math.floor(
        (Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) / 1000,
      );
      const invoicesResponse = await this.stripeService.invoices.list({
        customer: subscription.user.paymentCustomerId,
        limit: 12,
        status: 'paid',
        created: {
          gte: twelveMonthsAgo,
        },
      });

      return CurrentPlanDto.fromStripe({
        product,
        price,
        subscription: stripeSubscription,
        invoices: invoicesResponse.data,
        schedulesLength,
        storesLength,
        storeMembersLength,
        nextBillingDate,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        '[SubscriptionService.getCurrentPlan] Error fetching current plan:',
        error instanceof Error ? error.message : error,
      );
      throw new InternalServerErrorException(
        'Erro ao buscar informações do plano atual',
      );
    }
  }

  /**
   * Create a subscription checkout session
   * @param priceId - Stripe price ID (currency is defined in the price)
   * @param paymentCustomerId - Stripe customer ID
   * @param expectedCurrency - Optional: validate that the price matches expected currency
   * @returns Checkout session URL
   */
  async create(
    priceId: string,
    paymentCustomerId: string,
    expectedCurrency?: string,
  ) {
    const hasSubscription = await this.subscriptionRepository.findOne({
      where: {
        user: { paymentCustomerId },
        status: In(['active', 'paid', 'trialing']),
      },
    });

    // Block checkout while cancel_at_period_end is set — UI already guides
    // partners to reactivate first; enforce the same rule server-side.
    if (hasSubscription?.subscriptionId) {
      const stripeSubscription =
        await this.stripeService.subscriptions.retrieve(
          hasSubscription.subscriptionId,
        );
      if (stripeSubscription.cancel_at_period_end) {
        throw new BadRequestException(
          'Há um cancelamento agendado nesta assinatura. Reative o plano atual antes de iniciar um novo checkout.',
        );
      }
    }

    const price = await this.stripeService.prices.retrieve(priceId);
    const product = await this.stripeService.products.retrieve(
      price.product as string,
    );

    // Validate currency if provided
    if (
      expectedCurrency &&
      price.currency.toUpperCase() !== expectedCurrency.toUpperCase()
    ) {
      throw new BadRequestException(
        `Price currency (${price.currency.toUpperCase()}) does not match expected currency (${expectedCurrency.toUpperCase()})`,
      );
    }

    // Trial só no mensal: quem escolhe o anual já decidiu pelo plano.
    const trialPeriodDays =
      price.recurring?.interval === 'month'
        ? parseInt(product.metadata.TRIAL_PERIOD_DAYS || '0')
        : 0;

    const session = await this.stripeService.checkout.sessions.create({
      mode: 'subscription',
      customer: paymentCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data:
        !hasSubscription && trialPeriodDays
          ? { trial_period_days: trialPeriodDays }
          : undefined,
      success_url: `${process.env.FRONTEND_URL}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });

    return {
      url: session.url,
      currency: price.currency.toUpperCase(),
    };
  }

  /**
   * Confere no Stripe o retorno do checkout, em vez de confiar no `session_id`
   * da URL. `processing` é o intervalo até o webhook gravar a assinatura local,
   * que é o que libera o painel.
   */
  async getCheckoutSessionStatus(
    sessionId: string,
    userId: string,
    paymentCustomerId: string,
  ): Promise<{ status: TCheckoutSessionStatus }> {
    let session: Stripe.Checkout.Session;

    try {
      session = await this.stripeService.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      if (
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === 'resource_missing'
      ) {
        return { status: 'invalid' };
      }
      throw error;
    }

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;

    // Sessão de outra pessoa responde igual à inexistente: não confirma nada.
    if (
      session.mode !== 'subscription' ||
      !customerId ||
      customerId !== paymentCustomerId ||
      session.status === 'expired'
    ) {
      return { status: 'invalid' };
    }

    if (
      session.status !== 'complete' ||
      (session.payment_status !== 'paid' &&
        session.payment_status !== 'no_payment_required')
    ) {
      return { status: 'pending' };
    }

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    const subscription = await this.subscriptionRepository.findOne({
      where: {
        subscriptionId,
        user: { id: userId },
        status: In(['active', 'paid', 'trialing']),
      },
    });

    return { status: subscription ? 'active' : 'processing' };
  }

  /**
   * Alinha o registro local com o estado atual na Stripe. A Stripe não garante
   * ordem nem entrega única, então o payload do evento serve só como gatilho:
   * reprocessar ou receber eventos fora de ordem converge para o mesmo estado.
   */
  async syncSubscription(subscriptionId: string): Promise<Subscription | null> {
    let stripeSubscription: Stripe.Subscription;

    try {
      stripeSubscription =
        await this.stripeService.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      if (!isStripeResourceMissing(error)) {
        throw error;
      }
      // Removida na Stripe (ex.: customer excluído): não há mais o que buscar
      this.logger.warn(
        `[syncSubscription] Subscription ${subscriptionId} not found on Stripe; marking as canceled`,
      );
      await this.subscriptionRepository.update(
        { subscriptionId },
        { status: 'canceled', currentPeriodEnd: new Date() },
      );
      return null;
    }

    const { user, ...dto } = CustomerSubscriptionUpdateDto.fromStripe({
      object: stripeSubscription,
    } as Stripe.CustomerSubscriptionUpdatedEvent.Data);

    const productDetails = await this.stripeService.products.retrieve(
      dto.productId,
    );

    const subscription = await this.saveSubscription(
      user.paymentCustomerId,
      subscriptionId,
      {
        status: dto.status,
        priceId: dto.priceId,
        productId: dto.productId,
        currentPeriodStart: dto.currentPeriodStart,
        currentPeriodEnd: stripeSubscription.ended_at
          ? new Date(stripeSubscription.ended_at * 1000)
          : dto.currentPeriodEnd,
        features: normalizeSubscriptionMetadata(productDetails.metadata),
      },
    );

    if (subscription && ['active', 'trialing'].includes(dto.status)) {
      await this.cancelOlderSubscriptions(subscription, stripeSubscription);
    }

    return subscription;
  }

  private async saveSubscription(
    paymentCustomerId: string,
    subscriptionId: string,
    fields: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const findExisting = () =>
      this.subscriptionRepository.findOne({
        where: { subscriptionId },
        relations: ['user'],
      });

    const existing = await findExisting();

    if (existing) {
      await this.subscriptionRepository.update({ subscriptionId }, fields);
      return Object.assign(existing, fields);
    }

    const user = await this.userService.findByOne({ paymentCustomerId });

    if (!user) {
      this.logger.warn(
        `[saveSubscription] No user for customer ${paymentCustomerId}; skipping subscription ${subscriptionId}`,
      );
      return null;
    }

    try {
      return await this.subscriptionRepository.save(
        this.subscriptionRepository.create({
          ...fields,
          subscriptionId,
          user,
        }),
      );
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
      // Outra entrega concorrente inseriu primeiro; o índice único impediu a duplicata
      await this.subscriptionRepository.update({ subscriptionId }, fields);
      // Coluna `date` volta do banco como string; `fields` mantém os Date
      return Object.assign(await findExisting(), fields);
    }
  }

  /**
   * Troca de plano: encerra as assinaturas anteriores do usuário. Compara a data
   * de criação na Stripe para que um evento atrasado da assinatura antiga nunca
   * cancele a mais nova, nem a assinatura cancele a si mesma em uma reentrega.
   */
  private async cancelOlderSubscriptions(
    subscription: Subscription,
    stripeSubscription: Stripe.Subscription,
  ) {
    const others = await this.subscriptionRepository.find({
      where: {
        user: { id: subscription.user.id },
        status: In(['active', 'trialing', 'paid']),
        subscriptionId: Not(subscription.subscriptionId),
      },
    });

    for (const { subscriptionId } of others) {
      try {
        const other =
          await this.stripeService.subscriptions.retrieve(subscriptionId);

        if (
          other.status !== 'canceled' &&
          other.created < stripeSubscription.created
        ) {
          await this.stripeService.subscriptions.cancel(subscriptionId, {
            prorate: true,
          });
        }
      } catch (error) {
        if (!isStripeResourceMissing(error)) {
          throw error;
        }
      }
    }
  }

  async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    if (session.mode !== 'subscription') {
      this.logger.log(
        `[webhook] Ignoring non-subscription checkout ${session.id}`,
      );
      return;
    }

    if (
      session.payment_status !== 'paid' &&
      session.payment_status !== 'no_payment_required'
    ) {
      this.logger.warn(
        `[webhook] Checkout ${session.id} payment_status=${session.payment_status}; waiting for async payment`,
      );
      return;
    }

    // Fonte da verdade do registro local: customer.subscription.created / invoice.paid
    this.logger.log(
      `[webhook] Checkout session completed: ${session.id} (subscription=${session.subscription})`,
    );
  }

  async handleInvoicePaid(invoiceData: Stripe.InvoicePaidEvent.Data) {
    const subscriptionId = getSubscriptionIdFromInvoice(invoiceData.object);

    if (!subscriptionId) {
      this.logger.warn(
        `[handleInvoicePaid] Invoice ${invoiceData.object.id} has no subscription parent; skipping`,
      );
      return;
    }

    const subscription = await this.syncSubscription(subscriptionId);

    if (!subscription) {
      return;
    }

    // Com await, uma falha no e-mail vira erro e a Stripe reenvia o evento
    await this.notificationService.invoicePaid(
      subscription.user.email,
      invoiceData.object.id,
      subscription.currentPeriodEnd.toISOString(),
    );
  }

  async handleInvoicePaymentFailed(
    event: Stripe.InvoicePaymentFailedEvent.Data,
  ) {
    const invoice = event.object;
    const subscriptionId = getSubscriptionIdFromInvoice(invoice);
    const { attempt_count } = invoice;

    if (!subscriptionId) {
      this.logger.warn(
        `[handleInvoicePaymentFailed] Invoice ${invoice.id} has no subscription parent; skipping`,
      );
      return;
    }

    const subscription = await this.syncSubscription(subscriptionId);

    if (!subscription) {
      return;
    }

    await this.notificationService.paymentFailed(
      subscription.user.email,
      invoice.id,
      attempt_count,
    );
  }

  /** A Stripe avisa 3 dias antes do fim do teste. */
  async handleTrialWillEnd({ id }: Stripe.Subscription) {
    const subscription = await this.syncSubscription(id);

    if (!subscription) {
      return;
    }

    const stripeSubscription = await this.stripeService.subscriptions.retrieve(
      id,
      { expand: ['default_payment_method'] },
    );
    const { trial_end: trialEnd, default_payment_method: paymentMethod } =
      stripeSubscription;

    // Sem próxima cobrança, o aviso prometeria algo que não vai acontecer
    if (
      stripeSubscription.status !== 'trialing' ||
      stripeSubscription.cancel_at_period_end ||
      !trialEnd
    ) {
      return;
    }

    const [preview, product] = await Promise.all([
      // A prévia já considera cupons, que o preço de tabela não mostra
      this.stripeService.invoices.createPreview({ subscription: id }),
      this.stripeService.products.retrieve(subscription.productId),
    ]);
    const daysLeft = Math.max(
      1,
      Math.ceil((trialEnd * 1000 - Date.now()) / (24 * 60 * 60 * 1000)),
    );

    await this.notificationService.trialEnding(subscription.user.email, {
      planName: product.name,
      chargeDate: new Date(trialEnd * 1000).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      amount: formatCurrency(preview.amount_due / 100, preview.currency),
      cardLast4:
        typeof paymentMethod === 'object'
          ? paymentMethod?.card?.last4
          : undefined,
      daysLeftLabel: daysLeft === 1 ? '1 dia' : `${daysLeft} dias`,
      manageLink: `${this.configService.get<string>('FRONTEND_URL')}/partner/plans/me`,
    });
  }

  /** Avisa só na transição para cancelamento agendado, não a cada update. */
  async handleSubscriptionUpdated({
    object,
    previous_attributes: previous,
  }: Stripe.CustomerSubscriptionUpdatedEvent.Data) {
    const subscription = await this.syncSubscription(object.id);

    if (
      !subscription ||
      previous?.cancel_at_period_end !== false ||
      !object.cancel_at_period_end
    ) {
      return;
    }

    // O evento pode chegar depois de uma reativação; vale o estado atual
    const stripeSubscription = await this.stripeService.subscriptions.retrieve(
      object.id,
    );

    if (!stripeSubscription.cancel_at_period_end) {
      return;
    }

    const product = await this.stripeService.products.retrieve(
      subscription.productId,
    );

    await this.notificationService.subscriptionCancelScheduled(
      subscription.user.email,
      {
        planName: product.name,
        accessUntil: new Date(subscription.currentPeriodEnd).toLocaleDateString(
          'pt-BR',
          { timeZone: 'America/Sao_Paulo' },
        ),
        manageLink: `${this.configService.get<string>('FRONTEND_URL')}/partner/plans/me`,
      },
    );
  }

  async webhook(rawBody: Buffer | undefined, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not configured');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    if (!rawBody?.length) {
      throw new BadRequestException('Missing raw request body');
    }

    let event: Stripe.Event;

    try {
      event = this.stripeService.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.warn(
        `[webhook] Signature verification failed: ${error instanceof Error ? error.message : error}`,
      );
      throw new BadRequestException('Invalid Stripe signature');
    }

    // Só evita trabalho e e-mails repetidos: a consistência vem do syncSubscription
    const cacheKey = `stripe:webhook:event:${event.id}`;
    const alreadyProcessed = await this.cacheManager.get(cacheKey);

    if (alreadyProcessed) {
      this.logger.log(`[webhook] Duplicate event ${event.id}; skipping`);
      return { received: true, duplicate: true };
    }

    const syncFromEvent = () =>
      this.syncSubscription((event.data.object as Stripe.Subscription).id);

    const handlers: Record<string, () => Promise<unknown>> = {
      'checkout.session.completed': () =>
        this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        ),
      'checkout.session.async_payment_succeeded': () =>
        this.handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
        ),
      'invoice.paid': () =>
        this.handleInvoicePaid(event.data as Stripe.InvoicePaidEvent.Data),
      'invoice.payment_failed': () =>
        this.handleInvoicePaymentFailed(
          event.data as Stripe.InvoicePaymentFailedEvent.Data,
        ),
      'customer.subscription.created': syncFromEvent,
      'customer.subscription.updated': () =>
        this.handleSubscriptionUpdated(
          event.data as Stripe.CustomerSubscriptionUpdatedEvent.Data,
        ),
      'customer.subscription.deleted': syncFromEvent,
      'customer.subscription.trial_will_end': () =>
        this.handleTrialWillEnd(event.data.object as Stripe.Subscription),
    };

    const handler = handlers[event.type];

    if (!handler) {
      this.logger.log(`[webhook] Unhandled event type: ${event.type}`);
      return { received: true };
    }

    await handler();

    await this.cacheManager.set(cacheKey, '1', WEBHOOK_EVENT_TTL_MS);

    return { received: true };
  }
}
