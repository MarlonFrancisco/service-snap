import { Injectable } from '@nestjs/common';
import { StripeService } from '../stripe';
import { PlanDto } from './plans.dto';

// Supported currencies for plans
const SUPPORTED_CURRENCIES = [
  'BRL',
  // 'USD',
  // 'EUR',
  // 'MXN',
  // 'ARS',
  // 'CLP',
  // 'COP',
  // 'PEN',
  // 'GBP',
];

@Injectable()
export class PlansService {
  constructor(private readonly stripe: StripeService) {}

  /**
   * Get all available plans, optionally filtered by currency
   * @param paymentCustomerId - Stripe customer ID (optional)
   * @param currency - Filter plans by currency (defaults to BRL for backwards compatibility)
   * @returns Plans grouped by interval (month/year)
   */
  async findAll(paymentCustomerId?: string, currency: string = 'BRL') {
    const normalizedCurrency = currency.toUpperCase();

    const subscriptions = await this.stripe.subscriptions.list({
      customer: paymentCustomerId,
      limit: 1,
    });

    // O padrão da Stripe é 10 itens: preços a mais sumiriam da página de planos.
    const responseProducts = await this.stripe.products.list({
      active: true,
      limit: 100,
    });
    const responsePrices = await this.stripe.prices.list({
      active: true,
      limit: 100,
      ...(SUPPORTED_CURRENCIES.includes(normalizedCurrency) && {
        currency: normalizedCurrency.toLowerCase(),
      }),
    });

    const plans = responsePrices.data
      .map((price) => {
        const product = responseProducts.data.find(
          (product) => product.id === price.product,
        );

        if (!product) return undefined;

        return { product, price };
      })
      .filter((item) => item)
      .sort((a, b) => {
        const aOrder = parseInt(a.product.metadata.DISPLAY_ORDER || '0');
        const bOrder = parseInt(b.product.metadata.DISPLAY_ORDER || '0');
        return aOrder - bOrder;
      })
      .map(({ product, price }) =>
        PlanDto.fromStripe(product, price, subscriptions.data),
      );

    return plans.reduce(
      (acc, plan) => {
        acc[plan.interval].push(plan);
        return acc;
      },
      { month: [] as PlanDto[], year: [] as PlanDto[] },
    );
  }
}
