'use client';

import {
  useCustomerHistoryQuery,
  useCustomerQuery,
} from '@/hooks/partner/use-customers-query';
import { INITIAL_APPOINTMENT_FORM, useAgendaStore } from '@/store/admin/agenda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCustomersAccess } from '../../customers-module.hook';
import {
  APPOINTMENT_STATUS_BADGE,
  CUSTOMER_HISTORY_PAGE_SIZE,
  formatDay,
  formatPageRange,
  getCustomerContactSummary,
  getCustomerName,
  getCustomerWhatsappLink,
} from '../../customers-module.helpers';
import type { TCustomerHistoryRow } from './customer-history';
import type {
  TCustomerStat,
  TUseCustomerProfileConfig,
} from './customer-profile.types';

export const useCustomerProfile = ({ userId }: TUseCustomerProfileConfig) => {
  const { storeId, country, storeState, isProfessional, formatMoney } =
    useCustomersAccess();
  const [historyPage, setHistoryPage] = useState(1);
  const setIsAddAppointmentOpen = useAgendaStore(
    (state) => state.setIsAddAppointmentOpen,
  );

  const canQuery = storeState === 'ready' && !isProfessional;

  const {
    customer,
    isLoadingCustomer,
    isFetchingCustomer,
    isCustomerError,
    isCustomerForbidden,
    isCustomerNotFound,
    refetchCustomer,
  } = useCustomerQuery({ storeId, userId, enabled: canQuery });

  const {
    history,
    historyMeta,
    isLoadingHistory,
    isFetchingHistory,
    isHistoryError,
    refetchHistory,
  } = useCustomerHistoryQuery({
    storeId,
    userId,
    page: historyPage,
    limit: CUSTOMER_HISTORY_PAGE_SIZE,
    enabled: canQuery && !!customer,
  });

  useEffect(() => {
    setHistoryPage(1);
  }, [storeId, userId]);

  // O formulário de agendamento mora no store da agenda: saindo da ficha, fecha
  useEffect(
    () => () => {
      if (useAgendaStore.getState().isAddAppointmentOpen) {
        useAgendaStore
          .getState()
          .setIsAddAppointmentOpen({ isAddAppointmentOpen: false });
      }
    },
    [],
  );

  const stats = useMemo<TCustomerStat[]>(() => {
    if (!customer) return [];

    return [
      {
        label: 'Visitas',
        value: String(customer.visits),
        hint: `${customer.completed} ${customer.completed === 1 ? 'concluída' : 'concluídas'}`,
      },
      { label: 'Faltas', value: String(customer.noShows) },
      { label: 'Cancelamentos', value: String(customer.cancelled) },
      {
        label: 'Total gasto',
        value: formatMoney(customer.totalSpent),
        hint: 'Só atendimentos concluídos',
      },
    ];
  }, [customer, formatMoney]);

  const historyRows = useMemo<TCustomerHistoryRow[]>(
    () =>
      history.map((appointment) => ({
        id: appointment.id,
        day: formatDay(appointment.date),
        time: appointment.startTime?.slice(0, 5) ?? '',
        service: appointment.service?.name ?? 'Serviço removido',
        professional:
          [
            appointment.storeMember?.user?.firstName,
            appointment.storeMember?.user?.lastName,
          ]
            .filter(Boolean)
            .join(' ') || 'Profissional removido',
        status: APPOINTMENT_STATUS_BADGE[appointment.status],
      })),
    [history],
  );

  const visitsLine = customer
    ? [
        customer.lastVisit
          ? `Última visita ${formatDay(customer.lastVisit)}`
          : 'Ainda não veio',
        customer.nextVisit
          ? `Próxima visita ${formatDay(customer.nextVisit)}`
          : 'Sem horário marcado',
      ].join(' · ')
    : '';

  const handleNewAppointment = useCallback(() => {
    if (!customer) return;

    setIsAddAppointmentOpen({
      isAddAppointmentOpen: true,
      selectedAppointment: {
        ...INITIAL_APPOINTMENT_FORM,
        user: {
          ...INITIAL_APPOINTMENT_FORM.user,
          id: customer.id,
          firstName: customer.firstName ?? '',
          lastName: customer.lastName ?? '',
          email: customer.email ?? '',
          telephone: customer.telephone ?? '',
        },
      },
    });
  }, [customer, setIsAddAppointmentOpen]);

  const historyTotalPages = historyMeta?.totalPages ?? 1;

  return {
    storeId,
    storeState,
    hasNoAccess: isProfessional || isCustomerForbidden,
    isLoading: storeState === 'loading' || isLoadingCustomer,
    isError:
      storeState === 'error' ||
      (isCustomerError && !isCustomerForbidden && !isCustomerNotFound),
    isNotFound: isCustomerNotFound,
    isRetrying: isFetchingCustomer,
    handleRetry: () => void refetchCustomer(),
    customer,
    name: customer ? getCustomerName(customer) : '',
    contactLine: customer ? getCustomerContactSummary(customer, country) : '',
    visitsLine,
    whatsappLink: getCustomerWhatsappLink(customer?.telephone),
    stats,
    handleNewAppointment,
    history: {
      rows: historyRows,
      rangeLabel: formatPageRange(historyMeta, CUSTOMER_HISTORY_PAGE_SIZE),
      hasPrevious: historyPage > 1,
      hasNext: historyPage < historyTotalPages,
      onPrevious: () => setHistoryPage((page) => Math.max(1, page - 1)),
      onNext: () =>
        setHistoryPage((page) => Math.min(historyTotalPages, page + 1)),
      isLoading:
        isLoadingHistory || (!!customer && !historyMeta && !isHistoryError),
      isError: isHistoryError,
      isRefreshing: isFetchingHistory && !isLoadingHistory,
      onRetry: () => void refetchHistory(),
    },
  };
};
