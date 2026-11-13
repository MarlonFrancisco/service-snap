'use client';

import { cn, Input, Skeleton } from '@repo/ui';
import { Search, Store } from 'lucide-react';
import {
  PANEL_BUTTON_CLASS,
  PANEL_CELL_CLASS,
  PANEL_CHIP_CLASS,
  PANEL_CHIP_TONE_CLASS,
  PANEL_FIELD_CLASS,
  PANEL_HEAD_CELL_CLASS,
  PANEL_PAGER_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_TABLE_CLASS,
  PANEL_TABLE_WRAPPER_CLASS,
  PANEL_TITLE_CLASS,
} from '../../../partner/components/audit-logs-module/audit-logs-module.styles';
import {
  ModuleErrorState,
  ModuleStatePanel,
} from '../../../partner/components/notifications-module/components/module-state';
import { AdminStoreDetails } from './admin-store-details';
import { useAdminStores } from './admin-stores.hook';
import type {
  TAdminStoresConfig,
  TAdminStoresTableConfig,
} from './admin-stores.types';

const COLUMNS = ['Loja', 'Cidade', 'Dono', 'Situação'];

const StoresTable = ({
  rows,
  selectedId,
  onSelect,
  isRefreshing,
}: TAdminStoresTableConfig) => (
  <div
    role="region"
    aria-label="Lojas"
    aria-busy={isRefreshing || undefined}
    tabIndex={0}
    className={cn(PANEL_TABLE_WRAPPER_CLASS, isRefreshing && 'opacity-70')}
  >
    <table className={cn(PANEL_TABLE_CLASS, 'min-w-[640px]')}>
      <thead>
        <tr>
          {COLUMNS.map((label) => (
            <th key={label} scope="col" className={PANEL_HEAD_CELL_CLASS}>
              {label}
            </th>
          ))}
          <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={cn('group', row.id === selectedId && 'bg-[#F7F6FA]')}
          >
            <td className={PANEL_CELL_CLASS}>
              <b className="break-words">{row.name}</b>
            </td>
            <td className={PANEL_CELL_CLASS}>{row.city}</td>
            <td className={cn(PANEL_CELL_CLASS, 'break-all text-[#5F5C6E]')}>
              {row.ownerEmail}
            </td>
            <td className={PANEL_CELL_CLASS}>
              <span
                className={cn(
                  PANEL_CHIP_CLASS,
                  PANEL_CHIP_TONE_CLASS[row.status.tone],
                )}
              >
                {row.status.label}
              </span>
            </td>
            <td className={cn(PANEL_CELL_CLASS, 'text-right')}>
              <button
                type="button"
                onClick={() => onSelect(row.id)}
                aria-pressed={row.id === selectedId}
                aria-label={`Abrir ${row.name}`}
                className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
              >
                Abrir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const AdminStores = ({ headingLevel, intro }: TAdminStoresConfig) => {
  const {
    searchInput,
    setSearchInput,
    hasSearch,
    clearSearch,
    rows,
    selectedStoreId,
    handleSelect,
    detailsHeadingRef,
    isLoading,
    isError,
    isRefreshing,
    handleRetry,
    rangeLabel,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  } = useAdminStores();

  const Heading = headingLevel;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div role="status" aria-label="Carregando lojas" className="grid gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-12 w-full rounded-2xl bg-[#E9E7EF]"
            />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={handleRetry}
          isRetrying={isRefreshing}
        />
      );
    }
    if (rows.length === 0) {
      return hasSearch ? (
        <ModuleStatePanel
          icon={Search}
          headingLevel="h3"
          title="Nenhuma loja encontrada"
          description="Tente outro nome, cidade ou e-mail do dono."
        >
          <button
            type="button"
            onClick={clearSearch}
            className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
          >
            Limpar busca
          </button>
        </ModuleStatePanel>
      ) : (
        <ModuleStatePanel
          icon={Store}
          headingLevel="h3"
          title="Nenhuma loja ainda"
          description="As lojas cadastradas na plataforma aparecem aqui."
        />
      );
    }

    return (
      <StoresTable
        rows={rows}
        selectedId={selectedStoreId}
        onSelect={handleSelect}
        isRefreshing={isRefreshing}
      />
    );
  };

  const showPager = !isLoading && !isError && rows.length > 0;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="grid min-w-0 gap-[18px]">
        {intro}

        <section
          aria-labelledby="admin-stores-title"
          className="grid min-w-0 gap-[18px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Heading
              id="admin-stores-title"
              className={
                headingLevel === 'h1'
                  ? PANEL_TITLE_CLASS
                  : 'text-lg font-extrabold text-[#0B0B0F]'
              }
            >
              Lojas
            </Heading>
            <label className="min-w-0 flex-[0_1_360px]">
              <span className="sr-only">Buscar lojas</span>
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Nome, cidade ou e-mail do dono"
                className={PANEL_FIELD_CLASS}
              />
            </label>
          </div>

          {renderContent()}

          {showPager ? (
            <nav aria-label="Paginação de lojas" className={PANEL_PAGER_CLASS}>
              <span>{rangeLabel}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goToPrevious}
                  disabled={!hasPrevious}
                  className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={!hasNext}
                  className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
                >
                  Próxima
                </button>
              </div>
            </nav>
          ) : null}
        </section>
      </div>

      <AdminStoreDetails
        storeId={selectedStoreId}
        headingRef={detailsHeadingRef}
      />
    </div>
  );
};
