'use client';

import { useApiKeysQuery } from '@/hooks/partner/use-api-keys-query';
import { useAuditLogsQuery } from '@/hooks/partner/use-audit-logs-query';
import { useStoreMembersQuery } from '@/hooks/use-query/use-store-members-query/use-store-members-query.hook';
import { useCallback, useMemo } from 'react';
import { useCustomersAccess } from '../../../customers-module/customers-module.hook';
import { getMemberLabel, toAuditLogRow } from '../../audit-logs-module.helpers';
import {
  useAuditLogFilters,
  useAuditLogPager,
  useAuditLogSelection,
} from '../../audit-logs-module.hook';
import type { TAuditActorOption } from '../../audit-logs-module.types';

/** Histórico da loja ativa: só dono e gerente (a API devolve 403 aos demais). */
export const useStoreAuditLogs = () => {
  const { storeId, storeState, isProfessional } = useCustomersAccess();
  const filters = useAuditLogFilters(storeId);
  const canQuery = storeState === 'ready' && !isProfessional;

  const {
    auditLogs,
    auditLogsMeta,
    isLoadingAuditLogs,
    isFetchingAuditLogs,
    isAuditLogsError,
    isAuditLogsForbidden,
    refetchAuditLogs,
  } = useAuditLogsQuery({ storeId, ...filters.query, enabled: canQuery });
  const { storeMembers } = useStoreMembersQuery({
    storeId,
    enabled: canQuery,
  });
  // Ação de integração mostra o nome da chave, não só "Chave de API"
  const { apiKeys } = useApiKeysQuery({ storeId, enabled: canQuery });

  const actorOptions = useMemo<TAuditActorOption[]>(
    () =>
      storeMembers
        .filter((member) => member.user?.id)
        .map((member) => ({
          value: member.user.id,
          label: getMemberLabel(member.user),
        })),
    [storeMembers],
  );

  const apiKeyNames = useMemo(
    () => new Map(apiKeys.map((apiKey) => [apiKey.id, apiKey.name])),
    [apiKeys],
  );

  const rows = useMemo(
    () => auditLogs.map((log) => toAuditLogRow(log, apiKeyNames)),
    [auditLogs, apiKeyNames],
  );

  const { selectedRow, handleSelectRow, detailsHeadingRef } =
    useAuditLogSelection(rows);
  const pager = useAuditLogPager(auditLogsMeta, filters.setPage);

  const handleRetry = useCallback(() => {
    void refetchAuditLogs();
  }, [refetchAuditLogs]);

  return {
    storeState,
    hasNoAccess: isProfessional || isAuditLogsForbidden,
    filters: {
      from: filters.from,
      to: filters.to,
      onFromChange: filters.setFrom,
      onToChange: filters.setTo,
      area: filters.area,
      onAreaChange: filters.setArea,
      actor: filters.actor,
      onActorChange: filters.setActor,
      actorOptions,
      rangeHint: filters.rangeHint,
    },
    rows,
    selectedRow,
    handleSelectRow,
    detailsHeadingRef,
    isLoading: storeState === 'loading' || isLoadingAuditLogs,
    isError:
      storeState === 'error' || (isAuditLogsError && !isAuditLogsForbidden),
    isRefreshing: isFetchingAuditLogs && !isLoadingAuditLogs,
    handleRetry,
    hasActiveFilters: filters.hasActiveFilters,
    clearFilters: filters.clearFilters,
    ...pager,
  };
};
