'use client';

import type { TAuditLogQuery } from '@/types/api/audit-logs.types';
import type { IPage } from '@/types/api/pagination.types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatPageRange } from '../customers-module/customers-module.helpers';
import { AUDIT_ALL_OPTION, AUDIT_PAGE_SIZE } from './audit-logs-module.helpers';
import type { TAuditLogRow } from './audit-logs-module.types';

type TPageMeta = IPage<unknown>['meta'];

/**
 * Filtros, página e linha aberta do histórico. Serve à loja e ao painel da
 * plataforma: cada tela só troca de onde vêm os dados.
 */
export const useAuditLogFilters = (resetKey?: string) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [actor, setActor] = useState(AUDIT_ALL_OPTION);
  const [area, setArea] = useState(AUDIT_ALL_OPTION);
  const [page, setPage] = useState(1);

  // A API só filtra por período com as duas datas
  const hasRange = !!from && !!to;
  const hasPartialRange = !!from !== !!to;
  const isRangeInverted = hasRange && from > to;

  // Filtro novo ou outra loja voltam para a primeira página
  useEffect(() => {
    setPage(1);
  }, [from, to, actor, area, resetKey]);

  // Pessoa de outra loja não vale aqui
  useEffect(() => {
    setActor(AUDIT_ALL_OPTION);
  }, [resetKey]);

  const query = useMemo<TAuditLogQuery>(
    () => ({
      page,
      limit: AUDIT_PAGE_SIZE,
      ...(hasRange && !isRangeInverted && { from, to }),
      ...(actor !== AUDIT_ALL_OPTION && { actorUserId: actor }),
      ...(area !== AUDIT_ALL_OPTION && { resourceType: area }),
    }),
    [page, hasRange, isRangeInverted, from, to, actor, area],
  );

  const hasActiveFilters =
    !!from || !!to || actor !== AUDIT_ALL_OPTION || area !== AUDIT_ALL_OPTION;

  const clearFilters = useCallback(() => {
    setFrom('');
    setTo('');
    setActor(AUDIT_ALL_OPTION);
    setArea(AUDIT_ALL_OPTION);
  }, []);

  const getRangeHint = () => {
    if (hasPartialRange) return 'Escolha as duas datas para filtrar o período.';
    if (isRangeInverted) return 'A data inicial vem antes da final.';
    return null;
  };

  return {
    query,
    from,
    to,
    actor,
    area,
    setFrom,
    setTo,
    setActor,
    setArea,
    page,
    setPage,
    rangeHint: getRangeHint(),
    hasActiveFilters,
    clearFilters,
  };
};

/** Paginação do rodapé, no formato "1–20 de 57". */
export const useAuditLogPager = (
  meta: TPageMeta | undefined,
  setPage: (update: (page: number) => number) => void,
) => {
  const totalPages = meta?.totalPages || 1;
  const page = meta?.page ?? 1;

  return {
    rangeLabel: formatPageRange(meta, meta?.limit ?? AUDIT_PAGE_SIZE),
    hasPrevious: page > 1,
    hasNext: page < totalPages,
    goToPrevious: () => setPage((current) => Math.max(1, current - 1)),
    goToNext: () => setPage((current) => Math.min(totalPages, current + 1)),
  };
};

/** Linha aberta no painel de detalhes; leva o foco para o painel ao abrir. */
export const useAuditLogSelection = (rows: TAuditLogRow[]) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const selectedRow = rows.find((row) => row.id === selectedId) ?? null;

  const handleSelectRow = useCallback((id: string) => {
    setSelectedId(id);
    // No celular o painel fica abaixo da tabela
    requestAnimationFrame(() => detailsHeadingRef.current?.focus());
  }, []);

  return { selectedRow, handleSelectRow, detailsHeadingRef };
};
