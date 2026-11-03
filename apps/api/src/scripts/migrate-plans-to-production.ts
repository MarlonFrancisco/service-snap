import 'dotenv/config';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_API_KEY;

if (!stripeKey) {
  console.error(
    '❌ ERRO: STRIPE_API_KEY não encontrada nas variáveis de ambiente',
  );
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

const isLiveMode = stripeKey.startsWith('sk_live_');

if (!isLiveMode) {
  console.error('⚠️  ATENÇÃO: Esta chave parece ser de TEST MODE!');
  console.error(
    '   Para migrar para produção, use uma chave que comece com "sk_live_"',
  );
  console.error(
    '   Certifique-se de que STRIPE_API_KEY contém a chave de produção',
  );
  process.exit(1);
}

console.log('✅ Modo de produção detectado');
console.log('⚠️  Você está prestes a criar produtos em PRODUÇÃO!\n');

interface PlanConfig {
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  metadata: Record<string, string>;
  marketingFeatures: Array<{ name: string }>;
}

const plansConfig: PlanConfig[] = [
  {
    name: 'Starter',
    description:
      'Plano ideal para profissionais autônomos começando no Service Span',
    monthlyPrice: 4990,
    annualPrice: 53892,
    metadata: {
      UNIT_LIMIT: '1',
      PRO_LIMIT: '1',
      SCHEDULE_LIMIT: '100',
      RANK_TIER: 'TIER_3',
      SMS_REMINDER: 'false',
      DISPLAY_ORDER: '1',
      IS_RECOMMENDED: 'false',
    },
    marketingFeatures: [
      { name: '1 Loja' },
      { name: '1 Profissional' },
      { name: 'Até 100 agendamentos/mês' },
      { name: 'Ranqueamento Padrão' },
      { name: 'Suporte E-mail/FAQ' },
    ],
  },
  {
    name: 'Professional',
    description: 'Para profissionais que querem escalar',
    monthlyPrice: 9990,
    annualPrice: 107892,
    metadata: {
      UNIT_LIMIT: '2',
      PRO_LIMIT: '5',
      SCHEDULE_LIMIT: '300',
      RANK_TIER: 'TIER_2',
      SMS_REMINDER: 'false',
      DISPLAY_ORDER: '2',
      IS_RECOMMENDED: 'false',
    },
    marketingFeatures: [
      { name: 'Até 2 Lojas' },
      { name: 'Até 5 Profissionais' },
      { name: 'Até 300 agendamentos/mês' },
      { name: 'Ranqueamento Prioritário' },
      { name: 'Analytics Completo' },
      { name: 'Suporte Chat/E-mail' },
    ],
  },
  {
    name: 'Business',
    description: 'Para empresas estabelecidas',
    monthlyPrice: 19990,
    annualPrice: 215892,
    metadata: {
      UNIT_LIMIT: '10',
      PRO_LIMIT: 'UNLIMITED',
      SCHEDULE_LIMIT: '1000',
      RANK_TIER: 'TIER_1',
      SMS_REMINDER: 'false',
      DISPLAY_ORDER: '3',
      IS_RECOMMENDED: 'true',
    },
    marketingFeatures: [
      { name: 'Até 10 Lojas' },
      { name: 'Profissionais Ilimitados' },
      { name: 'Até 1.000 agendamentos/mês' },
      { name: 'Ranqueamento Máximo' },
      { name: 'Analytics Completo + Exportação' },
      { name: 'Suporte Prioritário' },
    ],
  },
  {
    name: 'Enterprise',
    description: 'Solução completa para grandes empresas',
    monthlyPrice: 39990,
    annualPrice: 431892,
    metadata: {
      UNIT_LIMIT: 'UNLIMITED',
      PRO_LIMIT: 'UNLIMITED',
      SCHEDULE_LIMIT: 'UNLIMITED',
      RANK_TIER: 'TIER_1',
      SMS_REMINDER: 'false',
      DISPLAY_ORDER: '4',
      IS_RECOMMENDED: 'false',
    },
    marketingFeatures: [
      { name: 'Lojas Ilimitadas' },
      { name: 'Profissionais Ilimitados' },
      { name: 'Agendamentos Ilimitados' },
      { name: 'Ranqueamento Máximo + Destaque' },
      { name: 'Analytics Completo + Exportação + API' },
      { name: 'Suporte Dedicado' },
    ],
  },
];

interface CreatedPlan {
  productId: string;
  monthlyPriceId: string;
  annualPriceId: string;
  planName: string;
}

async function migratePlansToProduction() {
  console.log('🚀 Iniciando migração de planos para produção no Stripe...\n');
  console.log(`📋 Total de planos a criar: ${plansConfig.length}\n`);

  const createdPlans: CreatedPlan[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const plan of plansConfig) {
    try {
      console.log(`📦 Criando plano: ${plan.name}...`);

      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        active: true,
        metadata: plan.metadata,
        marketing_features: plan.marketingFeatures,
      });

      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice,
        currency: 'brl',
        recurring: {
          interval: 'month',
          interval_count: 1,
        },
        active: true,
      });

      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.annualPrice,
        currency: 'brl',
        recurring: {
          interval: 'year',
          interval_count: 1,
        },
        active: true,
        metadata: {
          discount: '10',
        },
      });

      if (plan.name === 'Starter') {
        console.log(
          '   ⚠️  Lembrete: Configure trial_period_days: 7 no método create() do SubscriptionService para o preço mensal do Starter',
        );
      }

      createdPlans.push({
        productId: product.id,
        monthlyPriceId: monthlyPrice.id,
        annualPriceId: annualPrice.id,
        planName: plan.name,
      });

      successCount++;
      console.log(`✅ Plano "${plan.name}" criado com sucesso!`);
      console.log(`   Product ID: ${product.id}`);
      console.log(
        `   Preço Mensal: ${monthlyPrice.id} - R$ ${(plan.monthlyPrice / 100).toFixed(2)}/mês`,
      );
      console.log(
        `   Preço Anual: ${annualPrice.id} - R$ ${(plan.annualPrice / 100).toFixed(2)}/ano`,
      );
      console.log('');
    } catch (error) {
      errorCount++;
      console.error(`❌ Erro ao criar plano ${plan.name}:`);

      if (error instanceof Stripe.errors.StripeError) {
        console.error(`   Tipo: ${error.type}`);
        console.error(`   Código: ${error.code || 'N/A'}`);
        console.error(`   Mensagem: ${error.message}\n`);
      } else if (error instanceof Error) {
        console.error(`   Mensagem: ${error.message}\n`);
      }
    }
  }

  console.log('─'.repeat(60));
  console.log('✨ Migração concluída!');
  console.log(`   ✅ Sucessos: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log('─'.repeat(60));

  if (successCount > 0) {
    console.log('\n📝 IDs dos Planos Criados em Produção:\n');
    createdPlans.forEach((plan) => {
      console.log(`### ${plan.planName}`);
      console.log(`- Product ID: ${plan.productId}`);
      console.log(`- Preço Mensal: ${plan.monthlyPriceId}`);
      console.log(`- Preço Anual: ${plan.annualPriceId}`);
      console.log('');
    });

    console.log('⚠️  IMPORTANTE:');
    console.log('   1. Atualize os IDs no código da aplicação');
    console.log('   2. Configure o trial period de 7 dias no Starter mensal');
    console.log(
      '   3. Verifique se todos os webhooks estão configurados para produção',
    );
  }

  if (errorCount > 0) {
    console.log(
      '\n⚠️  Alguns planos não foram criados. Verifique os erros acima.',
    );
    process.exit(1);
  }
}

migratePlansToProduction().catch((error) => {
  console.error('\n💥 Erro fatal ao executar migração:');
  console.error(error);
  process.exit(1);
});
