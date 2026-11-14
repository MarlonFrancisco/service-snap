'use client';

import { useCustomersSearchTerm } from '@/hooks/partner/use-customers-query';
import { useAdminUsersQuery } from '@/hooks/use-query/use-admin-query';
import { useEffect, useMemo, useState } from 'react';
import { useAuditLogPager } from '../../../partner/components/audit-logs-module/audit-logs-module.hook';
import { ADMIN_PAGE_SIZE, toAdminUserRow } from '../../admin.helpers';

export const useAdminUsers = () => {
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const search = useCustomersSearchTerm(searchInput);

  // Busca nova volta para a primeira página
  useEffect(() => {
    setPage(1);
  }, [search]);

  const {
    users,
    usersMeta,
    isLoadingUsers,
    isFetchingUsers,
    isUsersError,
    refetchUsers,
  } = useAdminUsersQuery({
    page,
    limit: ADMIN_PAGE_SIZE,
    search: search || undefined,
  });

  const rows = useMemo(() => users.map(toAdminUserRow), [users]);
  const pager = useAuditLogPager(usersMeta, setPage);

  return {
    searchInput,
    setSearchInput,
    hasSearch: !!search,
    clearSearch: () => setSearchInput(''),
    rows,
    isLoading: isLoadingUsers,
    isError: isUsersError,
    isRefreshing: isFetchingUsers && !isLoadingUsers,
    handleRetry: () => void refetchUsers(),
    ...pager,
  };
};
