import { Injectable, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import { StripeService } from '../stripe';
import { PlanDto } from './plans.dto';

type TPlanEntry = { product: Stripe.Product; price: Stripe.Price };

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly stripe: StripeService) {}

  /**
   * Planos ativos agrupados por intervalo. A moeda vem do Stripe (#23/#24):
   * sem customer, a moeda padrão do price; com customer, a dele, quando o
   * price a tiver em `currency_options`. Nenhuma moeda é fixada aqui.
   */
  async findAll(paymentCustomerId?: string) {
    // Sem customer o Stripe listaria as assinaturas da conta inteira
    const [subscriptions, customerCurrency]: [
      Stripe.Subscription[],
      string | undefined,
    ] = paymentCustomerId
      ? await Promise.all([
          this.stripe.subscriptions
            .list({ customer: paymentCustomerId, limit: 1 })
            .then((response) => response.data),
          this.findCustomerCurrency(paymentCustomerId),
        ])
      : [[], undefined];

    // O padrão da Stripe é 10 itens: preços a mais sumiriam da página de planos.
    const responseProducts = await this.stripe.products.list({
      active: true,
      limit: 100,
    });
    const responsePrices = await this.stripe.prices.list({
      active: true,
      limit: 100,
      expand: ['data.currency_options'],
    });

    const plans = this.uniqueByProductAndInterval(
      responsePrices.data
        .map((price) => {
          const product = responseProducts.data.find(
            (product) => product.id === price.product,
          );

          return product ? { product, price } : undefined;
        })
        .filter((item): item is TPlanEntry => Boolean(item)),
    )
      .sort((a, b) => {
        const aOrder = parseInt(a.product.metadata.DISPLAY_ORDER || '0');
        const bOrder = parseInt(b.product.metadata.DISPLAY_ORDER || '0');
        return aOrder - bOrder;
      })
      .map(({ product, price }) => {
        const plan = PlanDto.fromStripe(
          product,
          price,
          subscriptions,
          customerCurrency,
        );

        if (customerCurrency && plan.currency !== customerCurrency) {
          this.logger.warn(
            `Price ${price.id} sem ${customerCurrency} em currency_options: mostrando ${plan.currency}`,
          );
        }

        return plan;
      });

    return plans.reduce(
      (acc, plan) => {
        acc[plan.interval].push(plan);
        return acc;
      },
      { month: [] as PlanDto[], year: [] as PlanDto[] },
    );
  }

  /** O Stripe fixa a moeda do customer na primeira assinatura. */
  private async findCustomerCurrency(paymentCustomerId: string) {
    try {
      const customer = await this.stripe.customers.retrieve(paymentCustomerId);
      if (!('currency' in customer) || !customer.currency) return undefined;

      return customer.currency.toUpperCase();
    } catch (error) {
      // Sem a moeda do customer a página mostra a padrão do price
      this.logger.warn(
        `Moeda do customer ${paymentCustomerId} indisponível: ${(error as Error).message}`,
      );
      return undefined;
    }
  }

  /**
   * Sem o filtro por moeda, um price antigo numa outra moeda viraria um
   * segundo cartão do mesmo plano. Fica o primeiro (o Stripe lista do mais
   * novo para o mais antigo); os outros devem ser arquivados.
   */
  private uniqueByProductAndInterval(entries: TPlanEntry[]) {
    const seen = new Set<string>();

    return entries.filter(({ product, price }) => {
      const key = `${product.id}:${price.recurring?.interval}`;
      if (!seen.has(key)) {
        seen.add(key);
        return true;
      }

      this.logger.warn(
        `Price ${price.id} ignorado: ${product.id} já tem um price ${price.recurring?.interval}`,
      );
      return false;
    });
  }
}
