export const PLAN_UPGRADE_ROUTE = '/partner/plans/upgrade';

export const STORE_IMAGES_BASE_URL =
  'https://qwprndmtjhwgmtngiwjg.supabase.co/storage/v1/object/public/stores';

/**
 * Consequências conferidas em `apps/api`: as duas exclusões são físicas e o
 * banco remove em cascata os registros ligados. Nenhuma notifica clientes.
 */
export const STORE_DELETE_CONSEQUENCE =
  'A loja sai da busca e deixa de receber agendamentos. Equipe, serviços, galeria, avaliações e todos os agendamentos dela, inclusive os já marcados, são apagados, e os clientes não são avisados. Esta ação não pode ser desfeita. Para manter os dados, use "Pausar".';

export const PROFESSIONAL_REMOVE_CONSEQUENCE =
  'A pessoa deixa de receber novos agendamentos nesta loja e perde o vínculo com os serviços dela. Todos os agendamentos dela nesta loja, inclusive os já marcados e o histórico, são apagados, e os clientes não são avisados. Esta ação não pode ser desfeita. Para manter os agendamentos, use "Pausar".';

export const AMENITIES_LIST = [
  'Wi-Fi Gratuito',
  'Estacionamento',
  'Ar Condicionado',
  'Aceita Cartão',
  'Acessibilidade',
  'Café/Bebidas',
  'TV/Entretenimento',
  'Área de Espera',
] as const;

/** O valor salvo continua o de `AMENITIES_LIST`; muda só o rótulo do editor. */
export const AMENITY_LABELS: Record<(typeof AMENITIES_LIST)[number], string> = {
  'Wi-Fi Gratuito': 'Wi-Fi gratuito',
  Estacionamento: 'Estacionamento',
  'Ar Condicionado': 'Ar-condicionado',
  'Aceita Cartão': 'Aceita cartão',
  Acessibilidade: 'Acessibilidade',
  'Café/Bebidas': 'Café e bebidas',
  'TV/Entretenimento': 'TV e entretenimento',
  'Área de Espera': 'Área de espera',
};

export const STAFF_ROLES = {
  owner: {
    label: 'Proprietário',
    description: 'Acesso total ao sistema',
  },
  manager: {
    label: 'Gerente',
    description: 'Gerencia operações e equipe',
  },
  professional: {
    label: 'Profissional',
    description: 'Presta serviços aos clientes',
  },
} as const;
