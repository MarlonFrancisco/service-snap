import 'dotenv/config';
import Stripe from 'stripe';
import { EUR_PRICES } from './stripe-eur-prices';

/**
 * Teste da #23, só em modo de teste: a conta (LTDA brasileira) aceita EUR?
 * Cria um price BRL com `currency_options.eur` e outro só em EUR, mostra a
 * resposta exata do Stripe e arquiva tudo no fim. Não toca nos planos.
 *
 * Permissões da chave restrita: Products e Prices (escrita).
 */
const stripeKey = process.env.STRIPE_API_KEY;

if (!stripeKey) {
  console.error('❌ STRIPE_API_KEY não encontrada nas variáveis de ambiente');
  process.exit(1);
}

// Chave live nunca: o teste cria e arquiva objetos na conta
if (!/^(sk|rk)_test_/.test(stripeKey)) {
  console.error('❌ Use uma chave de teste (sk_test_ ou rk_test_)');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

type TAttempt = {
  label: string;
  params: Omit<Stripe.PriceCreateParams, 'product'>;
};

const ATTEMPTS: TAttempt[] = [
  {
    label: 'BRL com currency_options.eur',
    params: {
      currency: 'brl',
      unit_amount: 3990,
      recurring: { interval: 'month' },
      currency_options: { eur: { unit_amount: EUR_PRICES.month.solo } },
    },
  },
  {
    label: 'Só em EUR',
    params: {
      currency: 'eur',
      unit_amount: EUR_PRICES.month.solo,
      recurring: { interval: 'month' },
    },
  },
];

const describeError = (error: unknown) =>
  error instanceof Stripe.errors.StripeError
    ? `${error.type} / ${error.code ?? 'sem código'}: ${error.message}`
    : String(error);

async function run() {
  const product = await stripe.products.create({
    name: 'Teste EUR (#23) - pode arquivar',
    active: true,
    metadata: { purpose: 'issue-23-eur-test' },
  });
  console.log(`📦 Produto de teste: ${product.id}\n`);

  const created: string[] = [];
  let accepted = 0;

  try {
    for (const { label, params } of ATTEMPTS) {
      try {
        const price = await stripe.prices.create({
          ...params,
          product: product.id,
          expand: ['currency_options'],
        });
        created.push(price.id);
        accepted += 1;
        const options = Object.keys(price.currency_options ?? {}).join(', ');
        console.log(`✅ ${label}: aceite (${price.id}; moedas: ${options})`);
      } catch (error) {
        console.log(`❌ ${label}: recusado. ${describeError(error)}`);
      }
    }
  } finally {
    for (const id of created) {
      await stripe.prices.update(id, { active: false });
    }
    await stripe.products.update(product.id, { active: false });
    console.log(`\n🧹 Arquivados: ${[...created, product.id].join(', ')}`);
  }

  console.log(
    `\nResultado: ${accepted}/${ATTEMPTS.length} aceites. Copie as linhas acima para a #23.`,
  );
}

run().catch((error) => {
  console.error(`\n💥 Erro fatal: ${describeError(error)}`);
  process.exit(1);
});
