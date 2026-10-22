import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { In, MoreThanOrEqual, type Repository } from 'typeorm';

import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Stripe from 'stripe';
import {
  getSubscriptionPeriodDate,
  normalizeSubscriptionMetadata,
} from '../../utils';
import { NotificationService } from '../notification';
import { ScheduleService } from '../partner/stores/schedule/schedule.service';
import { StoresService } from '../partner/stores/stores.services';
import { StripeService } from '../stripe';
import { UsersService } from '../users';
import { CurrentPlanDto } from './dto/current-plan.dto';
import { CustomerSubscriptionCreatedDto } from './dto/customer-subscription-created.dto';
import { CustomerSubscriptionUpdateDto } from './dto/customer-subscription-update.dto';
import { Subscription } from './subscription.entity';
import { TSubscriptionStatus } from './subscription.types';

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
  ) {}

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
    userId: string,
    priceId: string,
    paymentCustomerId: string,
    expectedCurrency?: string,
  ) {
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

    let hasSubscription = false;

    if (!paymentCustomerId) {
      const user = await this.userService.findById(userId);
      paymentCustomerId = await this.userService.createStripeCustomer(user);
      user.paymentCustomerId = paymentCustomerId;
      await this.userService.update(user.id, user);
      hasSubscription = true;
    } else {
      const subscription = await this.subscriptionRepository.findOne({
        where: { user: { paymentCustomerId } },
      });
      hasSubscription = !!subscription;
    }

    const trialPeriodDays = parseInt(product.metadata.TRIAL_PERIOD_DAYS || '0');

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

  async handleCustomerSubscriptionCreated({
    user: { paymentCustomerId },
    ...customerSubscription
  }: CustomerSubscriptionCreatedDto) {
    try {
      const currentSubscription = await this.subscriptionRepository.findOne({
        where: {
          user: { paymentCustomerId },
          status: In(['active', 'trialing', 'paid']),
        },
        relations: ['user'],
      });

      const productDetails = await this.stripeService.products.retrieve(
        customerSubscription.productId,
      );

      const features = normalizeSubscriptionMetadata(productDetails.metadata);

      if (currentSubscription) {
        await this.stripeService.subscriptions.cancel(
          currentSubscription.subscriptionId,
          {
            prorate: true,
          },
        );

        const newSubscription = await this.subscriptionRepository.create({
          ...customerSubscription,
          user: currentSubscription.user,
          features,
        });

        await this.subscriptionRepository.save(newSubscription);

        return newSubscription;
      }

      const user = await this.userService.findByOne({ paymentCustomerId });

      const newSubscription = await this.subscriptionRepository.create({
        ...customerSubscription,
        user,
        features,
      });

      await this.subscriptionRepository.save(newSubscription);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async handleCustomerSubscriptionUpdated(
    customerSubscription: CustomerSubscriptionUpdateDto,
  ) {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscriptionId: customerSubscription.subscriptionId },
        relations: ['user'],
      });

      const productDetails = await this.stripeService.products.retrieve(
        customerSubscription.productId,
      );

      const features = normalizeSubscriptionMetadata(productDetails.metadata);

      await this.subscriptionRepository.update(subscription.id, {
        status: customerSubscription.status,
        currentPeriodStart: customerSubscription.currentPeriodStart,
        currentPeriodEnd: customerSubscription.currentPeriodEnd,
        priceId: customerSubscription.priceId,
        productId: customerSubscription.productId,
        features,
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async handleCustomerSubscriptionDeleted(subscriptionId: string) {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { subscriptionId },
      });

      if (!subscription) {
        return;
      }

      subscription.status = 'canceled';
      subscription.currentPeriodEnd = new Date();

      await this.subscriptionRepository.save(subscription);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async handleInvoicePaid(invoiceData: Stripe.InvoicePaidEvent.Data) {
    try {
      const subscriptionId = invoiceData.object.parent.subscription_details
        .subscription as string;

      const subscription = await this.subscriptionRepository.findOne({
        where: { subscriptionId },
        relations: ['user'],
      });

      if (!subscription) {
        this.logger.error(
          `[SubscriptionService.handleInvoicePaid] Subscription not found for ID: ${subscriptionId}`,
        );

        throw new NotFoundException('Subscription not found');
      }

      const { currentPeriodEnd } = getSubscriptionPeriodDate(
        invoiceData.object.lines.data[0].period.start,
        invoiceData.object.lines.data[0].period.end,
      );

      subscription.status = invoiceData.object.status as TSubscriptionStatus;
      subscription.currentPeriodEnd = currentPeriodEnd;

      await this.subscriptionRepository.save(subscription);

      void this.notificationService.invoicePaid(
        subscription.user.email,
        invoiceData.object.id,
        subscription.currentPeriodEnd.toISOString(),
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async handleInvoicePaymentFailed(
    event: Stripe.InvoicePaymentFailedEvent.Data,
  ) {
    try {
      const { id: subscriptionId, attempt_count } = event.object;

      const subscription = await this.subscriptionRepository.findOne({
        where: { subscriptionId },
        relations: ['user'],
      });

      if (!subscription) {
        this.logger.error(
          `[SubscriptionService.handleInvoicePaymentFailed] Subscription not found for ID: ${subscriptionId}`,
        );
        throw new NotFoundException('Subscription not found');
      }

      subscription.status = event.object.status as TSubscriptionStatus;

      await this.subscriptionRepository.save(subscription);

      await this.notificationService.paymentFailed(
        subscription.user.email,
        subscriptionId,
        attempt_count,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async webhook(event: Stripe.Event, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET is not configured');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const events = {
      'checkout.session.completed': async () => {
        this.logger.log(`[webhook] Checkout session completed: ${event.id}`);
      },
      'invoice.paid': async () =>
        this.handleInvoicePaid(event.data as Stripe.InvoicePaidEvent.Data),
      'invoice.payment_failed': async () =>
        this.handleInvoicePaymentFailed(
          event.data as Stripe.InvoicePaymentFailedEvent.Data,
        ),
      'customer.subscription.created': async () =>
        this.handleCustomerSubscriptionCreated(
          CustomerSubscriptionCreatedDto.fromStripe(
            event.data as Stripe.CustomerSubscriptionCreatedEvent.Data,
          ),
        ),
      'customer.subscription.updated': async () =>
        this.handleCustomerSubscriptionUpdated(
          CustomerSubscriptionUpdateDto.fromStripe(
            event.data as Stripe.CustomerSubscriptionUpdatedEvent.Data,
          ),
        ),
      'customer.subscription.deleted': async () => {
        const subscriptionId = (
          event.data
            .object as Stripe.CustomerSubscriptionDeletedEvent.Data['object']
        ).id;

        return this.handleCustomerSubscriptionDeleted(subscriptionId);
      },
    };

    return await events[event.type]?.();
  }
}
