export const PLAN_UPGRADE_ROUTE = '/partner/plans/upgrade';

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
    label: 'Dono',
    description: 'Acesso total à loja, como o dono',
  },
  manager: {
    label: 'Gerente',
    description: 'Cuida da agenda de todos, clientes e serviços',
  },
  professional: {
    label: 'Profissional',
    description: 'Vê e edita só a própria agenda',
  },
} as const;

/**
 * Papéis que se dá ao adicionar ou editar alguém. `owner` aparece como "Sócio":
 * só quem é dono da loja dá esse papel (a API recusa o gerente com 403).
 */
export const TEAM_ROLE_OPTIONS = [
  {
    role: 'manager',
    label: STAFF_ROLES.manager.label,
    description: STAFF_ROLES.manager.description,
  },
  {
    role: 'professional',
    label: STAFF_ROLES.professional.label,
    description: STAFF_ROLES.professional.description,
  },
  {
    role: 'owner',
    label: 'Sócio',
    description: STAFF_ROLES.owner.description,
  },
] as const;

export const OWNER_ROLE_LOCKED_DESCRIPTION =
  'Só o dono da loja pode dar este papel';

/** Tabela "O que cada papel pode fazer": o mesmo que a API aplica por papel. */
export const TEAM_ROLE_PERMISSIONS = [
  { permission: 'Agenda de todos', owner: 'Sim', manager: 'Sim', professional: 'Só a própria' },
  { permission: 'Própria agenda e bloqueios', owner: 'Sim', manager: 'Sim', professional: 'Sim' },
  { permission: 'Clientes', owner: 'Sim', manager: 'Sim', professional: 'Não' },
  { permission: 'Serviços e galeria', owner: 'Sim', manager: 'Sim', professional: 'Não' },
  { permission: 'WhatsApp e notificações', owner: 'Sim', manager: 'Sim', professional: 'Não' },
  { permission: 'Métricas', owner: 'Sim', manager: 'Sim', professional: 'Não' },
  { permission: 'Configurações da loja', owner: 'Sim', manager: 'Sim', professional: 'Não' },
  { permission: 'Plano e cobrança', owner: 'Sim', manager: 'Não', professional: 'Não' },
] as const;
