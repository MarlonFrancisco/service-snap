import type { TPlanSlug } from '@/types/api';
import type {
  TLockedModule,
  TLockedModuleId,
  TPlanFeatureFlag,
  TPlanFeatures,
} from './plan-feature-gate.types';

/**
 * Plano mais barato que libera cada recurso, pelo slug estável (`plan_slug` no
 * Stripe), nunca pelo nome visível. Os painéis e o WhatsApp espelham o metadata
 * em `apps/api/src/scripts/update-stripe-products-metadata.ts`; os outros
 * módulos, o `PLAN_MODULES` de `apps/api/src/utils/helpers/subscription.helpers.ts`.
 */
export const MIN_PLAN_BY_FEATURE: Record<TPlanFeatureFlag, TPlanSlug> = {
  DASHBOARD_GENERAL_ACCESS: 'team',
  WHATSAPP_INTEGRATION: 'team',
  DASHBOARD_SALES_ACCESS: 'multi',
  DASHBOARD_OPERATIONAL_ACCESS: 'multi',
  DASHBOARD_CUSTOMERS_ACCESS: 'multi',
  COMMISSIONS_ACCESS: 'team',
  AUDIT_LOG_ACCESS: 'team',
  LOYALTY_ACCESS: 'team',
  CAMPAIGNS_ACCESS: 'team',
  API_ACCESS: 'multi',
};

const PLAN_ORDER: readonly TPlanSlug[] = [
  'solo',
  'team',
  'multi',
  'enterprise',
];

/** Nome mostrado por slug (#22). Igual ao `productName` do script do Stripe. */
export const PLAN_DISPLAY_NAME: Record<TPlanSlug, string> = {
  solo: 'Solo',
  team: 'Equipe',
  multi: 'Multi',
  enterprise: 'Enterprise',
};

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
  commissions: {
    requires: ['COMMISSIONS_ACCESS'],
    title: 'As comissões não estão no seu plano',
    lead: 'Faça o upgrade para calcular automaticamente o que cada profissional tem a receber.',
    benefits: [
      'Regras por profissional e por serviço',
      'Relatório do período pronto para pagar a equipe',
      'Cada profissional vê as próprias comissões',
    ],
    preview: 'chart',
  },
  auditLog: {
    requires: ['AUDIT_LOG_ACCESS'],
    title: 'O histórico de ações não está no seu plano',
    lead: 'Faça o upgrade para saber quem da equipe fez cada alteração na loja.',
    benefits: [
      'Quem criou, mudou ou cancelou cada agendamento',
      'Filtros por pessoa, tipo de registro e período',
      'Registro de cada ação da equipe na loja',
    ],
    preview: 'form',
  },
  loyalty: {
    requires: ['LOYALTY_ACCESS'],
    title: 'A fidelidade não está no seu plano',
    lead: 'Faça o upgrade para premiar quem volta e trazer clientes de volta mais vezes.',
    benefits: [
      'Recompensa automática a cada número de visitas',
      'Progresso de cada cliente na ficha',
      'Resgate da recompensa no fechamento da comanda',
    ],
    preview: 'metrics',
  },
  campaigns: {
    requires: ['CAMPAIGNS_ACCESS'],
    title: 'As campanhas não estão no seu plano',
    lead: 'Faça o upgrade para chamar de volta os clientes que pararam de agendar.',
    benefits: [
      'Lista de clientes sem visita há um tempo',
      'Envio por e-mail, e por WhatsApp no mesmo plano',
      'Respeita quem pediu para não receber',
    ],
    preview: 'form',
  },
  integrations: {
    requires: ['API_ACCESS'],
    title: 'A API e os webhooks não estão no seu plano',
    lead: 'Faça o upgrade para ligar a agenda da sua loja aos seus outros sistemas.',
    benefits: [
      'Chaves de API para ler e criar agendamentos',
      'Webhooks a cada agendamento novo, alterado ou cancelado',
      'Histórico de entregas com reenvio',
    ],
    preview: 'form',
  },
};

export const hasPlanAccess = (
  requires: readonly TPlanFeatureFlag[] | undefined,
  features: TPlanFeatures | undefined,
) => !requires || requires.every((flag) => features?.[flag] === true);

/** O plano exigido é o mais alto entre os recursos que faltam. */
export const getMinPlanSlug = (
  requires: readonly TPlanFeatureFlag[],
  features: TPlanFeatures | undefined,
): TPlanSlug | undefined =>
  requires
    .filter((flag) => features?.[flag] !== true)
    .map((flag) => MIN_PLAN_BY_FEATURE[flag])
    .sort((a, b) => PLAN_ORDER.indexOf(b) - PLAN_ORDER.indexOf(a))[0];
