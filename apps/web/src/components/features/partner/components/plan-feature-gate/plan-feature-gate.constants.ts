import type {
  TLockedModule,
  TLockedModuleId,
  TPlanFeatureFlag,
  TPlanFeatures,
} from './plan-feature-gate.types';

/**
 * Plano mais barato que libera cada recurso. Espelha o metadata dos produtos no
 * Stripe (`apps/api/src/scripts/update-stripe-products-metadata.ts`).
 */
export const MIN_PLAN_BY_FEATURE: Record<TPlanFeatureFlag, string> = {
  DASHBOARD_GENERAL_ACCESS: 'Professional',
  WHATSAPP_INTEGRATION: 'Professional',
  DASHBOARD_SALES_ACCESS: 'Business',
  DASHBOARD_OPERATIONAL_ACCESS: 'Business',
  DASHBOARD_CUSTOMERS_ACCESS: 'Business',
};

const PLAN_ORDER = ['Professional', 'Business', 'Enterprise'];

const META_PRICE_NOTE =
  'As mensagens são cobradas pela Meta diretamente da sua loja.';

export const LOCKED_MODULES: Record<TLockedModuleId, TLockedModule> = {
  home: {
    requires: ['DASHBOARD_GENERAL_ACCESS'],
    title: 'O painel de métricas não está no seu plano',
    lead: 'Faça o upgrade para acompanhar o desempenho da sua loja em um só lugar.',
    benefits: [
      'Receita, ticket médio e taxa de ocupação',
      'Agendamentos e receita ao longo do período, com os serviços mais vendidos',
      'Lembretes automáticos via WhatsApp no mesmo plano',
    ],
    preview: 'metrics',
  },
  sales: {
    requires: ['DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_SALES_ACCESS'],
    title: 'A análise de vendas não está no seu plano',
    lead: 'Faça o upgrade para entender de onde vem a sua receita.',
    benefits: [
      'Evolução de receita e receita por hora',
      'Receita por categoria e serviços mais rentáveis',
      'Inclui também as análises de Operação e Clientes',
    ],
    preview: 'chart',
  },
  operational: {
    requires: ['DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_OPERATIONAL_ACCESS'],
    title: 'A análise de operação não está no seu plano',
    lead: 'Faça o upgrade para ver onde a sua agenda está cheia e onde sobra horário.',
    benefits: [
      'Taxa de ocupação e de conclusão',
      'Agendamentos por horário e dia da semana',
      'Desempenho de cada profissional',
    ],
    preview: 'heatmap',
  },
  customers: {
    requires: ['DASHBOARD_GENERAL_ACCESS', 'DASHBOARD_CUSTOMERS_ACCESS'],
    title: 'A análise de clientes não está no seu plano',
    lead: 'Faça o upgrade para saber quem volta, quem some e quem gera mais valor.',
    benefits: [
      'Taxa de retenção e valor médio por cliente',
      'Evolução de clientes nos últimos 6 meses',
      'Top clientes e valor por segmento',
    ],
    preview: 'chart',
  },
  whatsappReminders: {
    requires: ['WHATSAPP_INTEGRATION'],
    title: 'Lembretes por WhatsApp não estão no seu plano',
    lead: 'Seu plano já envia lembretes por e-mail. Faça o upgrade para lembrar seus clientes também pelo WhatsApp.',
    benefits: [
      'Lembrete automático com a antecedência que você escolher',
      'Mensagem personalizada com o jeito da sua loja',
      'Usa o WhatsApp da sua própria loja',
    ],
    preview: 'form',
    priceNote: META_PRICE_NOTE,
  },
  whatsappIntegration: {
    requires: ['WHATSAPP_INTEGRATION'],
    title: 'A integração com WhatsApp não está no seu plano',
    lead: 'Faça o upgrade para conectar o WhatsApp Business da sua loja ao ServiceSnap.',
    benefits: [
      'Conexão com a API oficial do WhatsApp Business',
      'Libera os lembretes automáticos por WhatsApp',
      'As mensagens saem do número da sua loja',
    ],
    preview: 'form',
    priceNote: META_PRICE_NOTE,
  },
};

export const hasPlanAccess = (
  requires: readonly TPlanFeatureFlag[] | undefined,
  features: TPlanFeatures | undefined,
) => !requires || requires.every((flag) => features?.[flag] === true);

/** O plano exigido é o mais alto entre os recursos que faltam. */
export const getMinPlanName = (
  requires: readonly TPlanFeatureFlag[],
  features: TPlanFeatures | undefined,
) =>
  requires
    .filter((flag) => features?.[flag] !== true)
    .map((flag) => MIN_PLAN_BY_FEATURE[flag])
    .sort((a, b) => PLAN_ORDER.indexOf(b) - PLAN_ORDER.indexOf(a))[0];
