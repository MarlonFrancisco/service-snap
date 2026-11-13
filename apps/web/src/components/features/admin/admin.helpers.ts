import type {
  IAdminOverview,
  IAdminStore,
  IAdminStoreRow,
  IAdminUser,
  TStatusCount,
} from '@/types/api/admin.types';
import type { IAuditLog } from '@/types/api/audit-logs.types';
import {
  describeAuditAction,
  formatPanelDate,
  formatPanelMoment,
  getAuditActorName,
} from '../partner/components/audit-logs-module/audit-logs-module.helpers';
import type {
  TAdminActivityItem,
  TAdminChip,
  TAdminKpi,
  TAdminNavItem,
  TAdminStoreRow,
  TAdminUserRow,
} from './admin.types';

export const ADMIN_PAGE_SIZE = 20;
export const ADMIN_RECENT_ACTIVITY = 5;
export const ADMIN_SUSPEND_REASON_MAX = 300;

export const ADMIN_NAV_ITEMS: readonly TAdminNavItem[] = [
  { href: '/admin', label: 'Visão geral' },
  { href: '/admin/lojas', label: 'Lojas' },
  { href: '/admin/usuarios', label: 'Usuários' },
  { href: '/admin/historico-de-acoes', label: 'Histórico de ações' },
];

/** `/admin` só casa com ele mesmo; as outras rotas casam com as filhas. */
export const isAdminNavActive = (pathname: string, href: string) =>
  href === '/admin'
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

const formatCount = (value: number) => value.toLocaleString('pt-BR');

const sumOf = (counts: TStatusCount, keys?: string[]) =>
  Object.entries(counts)
    .filter(([key]) => !keys || keys.includes(key))
    .reduce((total, [, count]) => total + count, 0);

const plural = (count: number, singular: string, pluralForm: string) =>
  `${formatCount(count)} ${count === 1 ? singular : pluralForm}`;

/** Os quatro números do topo do painel. */
export const buildAdminKpis = (overview: IAdminOverview): TAdminKpi[] => {
  const schedules = overview.schedulesLast30Days;
  const subscriptions = overview.subscriptions;

  return [
    {
      label: 'Usuários',
      value: formatCount(overview.users.total),
      detail: `+${formatCount(overview.users.newLast30Days)} em 30 dias`,
    },
    {
      label: 'Lojas ativas',
      value: formatCount(overview.stores.active),
      detail: `de ${plural(overview.stores.total, 'loja', 'lojas')}`,
    },
    {
      label: 'Agendamentos em 30 dias',
      value: formatCount(sumOf(schedules)),
      detail: `${plural(sumOf(schedules, ['completed']), 'concluído', 'concluídos')} · ${plural(sumOf(schedules, ['cancelled']), 'cancelado', 'cancelados')}`,
    },
    {
      label: 'Assinaturas ativas',
      value: formatCount(sumOf(subscriptions, ['active', 'paid'])),
      detail: `${formatCount(sumOf(subscriptions, ['trialing']))} em teste · ${formatCount(sumOf(subscriptions, ['past_due', 'unpaid']))} com falha`,
    },
  ];
};

export const getAdminStoreStatus = (
  store: Pick<IAdminStoreRow, 'isActive' | 'isDeleted'>,
): TAdminChip => {
  if (store.isDeleted) return { label: 'Excluída', tone: 'neutral' };
  if (store.isActive) return { label: 'No ar', tone: 'success' };

  return { label: 'Suspensa', tone: 'danger' };
};

const SUBSCRIPTION_STATUS: Record<string, TAdminChip> = {
  active: { label: 'Ativa', tone: 'success' },
  paid: { label: 'Ativa', tone: 'success' },
  trialing: { label: 'Em teste', tone: 'info' },
  past_due: { label: 'Pagamento falhou', tone: 'warning' },
  unpaid: { label: 'Pagamento falhou', tone: 'warning' },
  incomplete: { label: 'Incompleta', tone: 'warning' },
  incomplete_expired: { label: 'Expirada', tone: 'neutral' },
  canceled: { label: 'Cancelada', tone: 'neutral' },
  paused: { label: 'Pausada', tone: 'neutral' },
};

/** "Ativa · até 30/11/2026"; sem assinatura, "Sem assinatura". */
export const describeAdminSubscription = (
  subscription: IAdminStore['subscription'],
) => {
  if (!subscription) return 'Sem assinatura';

  const status =
    SUBSCRIPTION_STATUS[subscription.status]?.label ?? subscription.status;
  const until = formatPanelDate(subscription.currentPeriodEnd);

  return until ? `${status} · até ${until}` : status;
};

export const toAdminStoreRow = (store: IAdminStoreRow): TAdminStoreRow => ({
  id: store.id,
  name: store.name,
  city: store.city || '—',
  ownerEmail: store.owner?.email || 'Sem dono',
  status: getAdminStoreStatus(store),
});

export const toAdminUserRow = (user: IAdminUser): TAdminUserRow => ({
  id: user.id,
  name: user.name?.trim() || 'Sem nome',
  email: user.email || '—',
  telephone: user.telephone || '—',
  createdAt: formatPanelDate(user.createdAt),
});

export const toAdminActivityItem = (log: IAuditLog): TAdminActivityItem => ({
  id: log.id,
  label: describeAuditAction(log).label,
  meta: `${getAuditActorName(log)} · ${formatPanelMoment(log.createdAt)}`,
});

export const formatPeopleCount = (count: number) =>
  plural(count, 'pessoa', 'pessoas');
