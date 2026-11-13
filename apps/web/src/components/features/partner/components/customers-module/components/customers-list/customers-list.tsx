'use client';

import { cn, Input } from '@repo/ui';
import { Plus, Search, Users } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_BUTTON_ICON_CLASS,
  CUSTOMERS_CHIP_ACTIVE_CLASS,
  CUSTOMERS_CHIP_CLASS,
  CUSTOMERS_LEAD_CLASS,
  CUSTOMERS_PAGER_CLASS,
  CUSTOMERS_PRIMARY_BUTTON_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
  CUSTOMERS_TITLE_CLASS,
} from '../../customers-module.styles';
import { CustomersNoAccess } from '../customers-state';
import { useCustomersList } from './customers-list.hook';
import { CustomersTable, CustomersTableSkeleton } from './customers-table';
import { NewCustomerDialog } from './new-customer-dialog';

const LEAD = 'Quem já agendou aqui e quem a equipe cadastrou';

export const CustomersList = () => {
  const {
    storeId,
    storeState,
    hasNoAccess,
    searchInput,
    setSearchInput,
    tags,
    activeTag,
    handleTagChange,
    hasActiveFilters,
    clearFilters,
    rows,
    countLabel,
    rangeLabel,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
    isLoading,
    isError,
    isRefreshing,
    handleRetry,
    isNewCustomerOpen,
    setIsNewCustomerOpen,
  } = useCustomersList();

  if (storeState === 'no-store') return <NoStoreState />;
  if (hasNoAccess) return <CustomersNoAccess />;

  const renderContent = () => {
    if (isLoading) return <CustomersTableSkeleton />;
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
      return hasActiveFilters ? (
        <ModuleStatePanel
          icon={Search}
          headingLevel="h3"
          title="Nenhum cliente encontrado"
          description="Tente outra busca ou outra etiqueta."
        >
          <button
            type="button"
            onClick={clearFilters}
            className={cn(CUSTOMERS_BUTTON_CLASS, CUSTOMERS_SMALL_BUTTON_CLASS)}
          >
            Limpar filtros
          </button>
        </ModuleStatePanel>
      ) : (
        <ModuleStatePanel
          icon={Users}
          headingLevel="h3"
          title="Nenhum cliente ainda"
          description="Quem agendar na loja ou for cadastrado pela equipe aparece aqui."
        >
          <button
            type="button"
            onClick={() => setIsNewCustomerOpen(true)}
            className={cn(
              CUSTOMERS_PRIMARY_BUTTON_CLASS,
              CUSTOMERS_SMALL_BUTTON_CLASS,
            )}
          >
            Novo cliente
          </button>
        </ModuleStatePanel>
      );
    }

    return <CustomersTable rows={rows} isRefreshing={isRefreshing} />;
  };

  const showPager = !isLoading && !isError && rows.length > 0;

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className={CUSTOMERS_TITLE_CLASS}>Clientes da loja</h2>
          <p className={CUSTOMERS_LEAD_CLASS}>
            {countLabel ? `${LEAD} · ${countLabel}` : LEAD}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsNewCustomerOpen(true)}
          disabled={storeState !== 'ready'}
          className={CUSTOMERS_PRIMARY_BUTTON_CLASS}
        >
          <Plus aria-hidden="true" className={CUSTOMERS_BUTTON_ICON_CLASS} />
          Novo cliente
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-[1_1_360px] sm:max-w-[520px]">
          <span className="sr-only">Buscar clientes</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-4 left-4 size-[18px] stroke-2 text-[#5F5C6E]"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone"
            className="h-[50px] rounded-[14px] border-[#E3E1EA] bg-white pr-4 pl-11 text-base font-medium shadow-none placeholder:text-[#6F6C7E] md:text-[15px]"
          />
        </label>

        {tags.length > 0 ? (
          <div
            role="group"
            aria-label="Filtrar por etiqueta"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-[13px] font-semibold text-[#5F5C6E]">
              Etiquetas
            </span>
            <button
              type="button"
              aria-pressed={activeTag === null}
              onClick={() => handleTagChange(null)}
              className={cn(
                CUSTOMERS_CHIP_CLASS,
                activeTag === null && CUSTOMERS_CHIP_ACTIVE_CLASS,
              )}
            >
              Todas
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={activeTag === tag}
                onClick={() => handleTagChange(tag)}
                className={cn(
                  CUSTOMERS_CHIP_CLASS,
                  activeTag === tag && CUSTOMERS_CHIP_ACTIVE_CLASS,
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {renderContent()}

      {showPager ? (
        <nav
          aria-label="Paginação de clientes"
          className={CUSTOMERS_PAGER_CLASS}
        >
          <span>{rangeLabel}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={!hasPrevious}
              className={cn(
                CUSTOMERS_BUTTON_CLASS,
                CUSTOMERS_SMALL_BUTTON_CLASS,
              )}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={goToNext}
              disabled={!hasNext}
              className={cn(
                CUSTOMERS_BUTTON_CLASS,
                CUSTOMERS_SMALL_BUTTON_CLASS,
              )}
            >
              Próxima
            </button>
          </div>
        </nav>
      ) : null}

      <NewCustomerDialog
        storeId={storeId}
        isOpen={isNewCustomerOpen}
        onOpenChange={setIsNewCustomerOpen}
      />
    </div>
  );
};
