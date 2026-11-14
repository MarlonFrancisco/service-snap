import { isNotFoundError, isUnauthorizedError } from '@/service/api';
import { TCurrencyCode } from '@repo/shared/constants';
import { isServer, QueryClient } from '@tanstack/react-query';

/** Filtros e paginação que entram na chave de cache. */
type TQueryParams = Record<string, string | number | boolean | undefined>;

export const maxAgeCache = 5 * 60 * 1000;

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: maxAgeCache,
        retry: (failureCount, error) =>
          !isNotFoundError(error) &&
          !isUnauthorizedError(error) &&
          failureCount <= 2,
      },
    },
  });
};

export const getQueryClient = () => {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!window.browserQueryClient) {
      window.browserQueryClient = makeQueryClient();
    }

    return window.browserQueryClient;
  }
};

export const CACHE_QUERY_KEYS = {
  reviews: (storeId: string) => [`partner/stores/${storeId}/reviews`],
  recommendationStores: () => ['recommendation/popular-stores'],
  user: (userIdentification: string) => ['user', { userIdentification }],
  referral: () => ['users/me/referral'],
  plans: (currency: TCurrencyCode) => ['plans', { currency }],
  currentPlan: () => ['subscription/current-plan'],
  checkoutSession: (sessionId: string) => [
    'subscription/checkout-session',
    sessionId,
  ],
  onboarding: () => ['partner/onboarding'],
  onboardingChecklist: (storeId: string) => [
    `partner/onboarding/stores/${storeId}/checklist`,
  ],
  stores: () => ['partner/stores'],
  storeMembers: (storeId: string) => [`partner/stores/${storeId}/members`],
  /** Prefixo de toda a agenda da loja: invalide este para recarregar qualquer período. */
  schedules: (storeId: string) => [`partner/schedules/${storeId}`],
  schedulesRange: (
    storeId: string,
    range: { from: string; to: string; memberId?: string },
  ) => [`partner/schedules/${storeId}`, range],
  holidays: (storeId: string, range?: { from?: string; to?: string }) => [
    `partner/stores/${storeId}/holidays`,
    range ?? {},
  ],
  customers: (storeId: string, params?: Record<string, unknown>) => [
    `partner/stores/${storeId}/customers`,
    params ?? {},
  ],
  customer: (storeId: string, userId: string) => [
    `partner/stores/${storeId}/customers`,
    'record',
    userId,
  ],
  customerHistory: (storeId: string, userId: string, page: number) => [
    `partner/stores/${storeId}/customers`,
    'history',
    userId,
    page,
  ],
  customerTags: (storeId: string) => [
    `partner/stores/${storeId}/customers`,
    'tags',
  ],
  availability: (
    storeId: string,
    params: { date: string; serviceIds: string[]; memberId?: string },
  ) => [`partner/schedules/${storeId}/availability`, params],
  blockedTimes: (storeId: string) => [
    `partner/schedules/blocked-times/${storeId}`,
  ],
  store: (storeId: string) => [`partner/stores/${storeId}`],
  categories: (storeId: string) => [`partner/categories/${storeId}`],
  notificationsHistory: (
    storeId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      search?: string;
    },
  ) => [`partner/stores/${storeId}/notifications/history`, { params }],
  notificationsSettings: (storeId: string) => [
    `partner/stores/${storeId}/notifications/settings`,
  ],
  metricsOverview: (storeId: string, period: string = 'week') => [
    `partner/stores/${storeId}/metrics/overview`,
    { period },
  ],
  metricsSales: (storeId: string, period: string = 'month') => [
    `partner/stores/${storeId}/metrics/sales`,
    { period },
  ],
  metricsOperational: (storeId: string, period: string = 'month') => [
    `partner/stores/${storeId}/metrics/operational`,
    { period },
  ],
  metricsCustomers: (storeId: string, period: string = 'month') => [
    `partner/stores/${storeId}/metrics/customers`,
    { period },
  ],
  search: (params: { query: string; location?: string; category?: string }) => [
    'search',
    params,
  ],
  whatsappConfig: (storeId: string) => [`partner/stores/${storeId}/whatsapp`],
  whatsappStatus: (storeId: string) => [
    `partner/stores/${storeId}/whatsapp/status`,
  ],
  whatsappTemplates: (storeId: string) => [
    `partner/stores/${storeId}/whatsapp/templates`,
  ],
  whatsappReminderTemplate: (storeId: string) => [
    `partner/stores/${storeId}/whatsapp/reminder-template`,
  ],

  // Fase 4: gestão, retenção e plataforma
  checkoutPreview: (storeId: string, scheduleIds: string[]) => [
    `partner/stores/${storeId}/checkouts/preview`,
    { scheduleIds },
  ],
  checkout: (storeId: string, id: string) => [
    `partner/stores/${storeId}/checkouts/${id}`,
  ],
  cashCurrent: (storeId: string) => [`partner/stores/${storeId}/cash/current`],
  cashSessions: (storeId: string, params?: TQueryParams) => [
    `partner/stores/${storeId}/cash/sessions`,
    { params },
  ],
  cashSession: (storeId: string, id: string) => [
    `partner/stores/${storeId}/cash/sessions/${id}`,
  ],
  payments: (storeId: string, params?: TQueryParams) => [
    `partner/stores/${storeId}/payments`,
    { params },
  ],
  commissionRules: (storeId: string) => [
    `partner/stores/${storeId}/commissions/rules`,
  ],
  commissionReport: (storeId: string, params?: TQueryParams) => [
    `partner/stores/${storeId}/commissions/report`,
    { params },
  ],
  myCommissions: (storeId: string, params?: TQueryParams) => [
    `partner/stores/${storeId}/commissions/me`,
    { params },
  ],
  servicePackages: (storeId: string) => [`partner/stores/${storeId}/packages`],
  customerPackages: (storeId: string, customerId: string) => [
    `partner/stores/${storeId}/packages/customers/${customerId}`,
  ],
  loyaltyProgram: (storeId: string) => [`partner/stores/${storeId}/loyalty`],
  loyaltyProgress: (storeId: string, customerId: string) => [
    `partner/stores/${storeId}/loyalty/customers/${customerId}`,
  ],
  campaigns: (storeId: string) => [`partner/stores/${storeId}/campaigns`],
  campaign: (storeId: string, id: string) => [
    `partner/stores/${storeId}/campaigns/${id}`,
  ],
  inactiveCustomers: (storeId: string, inactiveDays: number) => [
    `partner/stores/${storeId}/campaigns/inactive-customers`,
    { inactiveDays },
  ],
  scheduleSeriesBySchedule: (storeId: string, scheduleId: string) => [
    `partner/stores/${storeId}/schedule-series/by-schedule/${scheduleId}`,
  ],
  scheduleSeries: (storeId: string, id: string) => [
    `partner/stores/${storeId}/schedule-series/${id}`,
  ],
  anamnesisForms: (storeId: string) => [
    `partner/stores/${storeId}/anamnesis/forms`,
  ],
  customerAnamnesis: (storeId: string, customerId: string) => [
    `partner/stores/${storeId}/anamnesis/customers/${customerId}`,
  ],
  anamnesisResponse: (storeId: string, id: string) => [
    `partner/stores/${storeId}/anamnesis/responses/${id}`,
  ],
  anamnesisInvite: (token: string) => ['anamnesis', token],
  marketingOptOut: (token: string) => ['marketing/opt-out', token],
  apiKeys: (storeId: string) => [`partner/stores/${storeId}/api-keys`],
  webhooks: (storeId: string) => [`partner/stores/${storeId}/webhooks`],
  webhookDeliveries: (storeId: string, id: string) => [
    `partner/stores/${storeId}/webhooks/${id}/deliveries`,
  ],
  auditLogs: (storeId: string, params?: TQueryParams) => [
    `partner/stores/${storeId}/audit-logs`,
    { params },
  ],
  adminOverview: () => ['admin/overview'],
  adminStores: (params?: TQueryParams) => ['admin/stores', { params }],
  adminStore: (id: string) => [`admin/stores/${id}`],
  adminUsers: (params?: TQueryParams) => ['admin/users', { params }],
  adminAuditLogs: (params?: TQueryParams) => ['admin/audit-logs', { params }],
};
