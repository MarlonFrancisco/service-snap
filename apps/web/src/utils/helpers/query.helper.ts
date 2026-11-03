import { isNotFoundError, isUnauthorizedError } from '@/service/api';
import { TCurrencyCode } from '@repo/shared/constants';
import { isServer, QueryClient } from '@tanstack/react-query';

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
  schedules: (storeId: string) => [`partner/schedules/${storeId}`],
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
  search: (params: {
    query: string;
    location?: string;
    category?: string;
  }) => ['search', params],
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
};
