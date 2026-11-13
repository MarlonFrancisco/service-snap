'use client';

import { cn, Input, Skeleton } from '@repo/ui';
import { Search, Users } from 'lucide-react';
import {
  PANEL_BUTTON_CLASS,
  PANEL_CELL_CLASS,
  PANEL_FIELD_CLASS,
  PANEL_HEAD_CELL_CLASS,
  PANEL_NUMBER_CLASS,
  PANEL_PAGER_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_TABLE_CLASS,
  PANEL_TABLE_WRAPPER_CLASS,
  PANEL_TEXT_CLASS,
  PANEL_TITLE_CLASS,
} from '../../../partner/components/audit-logs-module/audit-logs-module.styles';
import {
  ModuleErrorState,
  ModuleStatePanel,
} from '../../../partner/components/notifications-module/components/module-state';
import { useAdminUsers } from './admin-users.hook';

export const AdminUsers = () => {
  const {
    searchInput,
    setSearchInput,
    hasSearch,
    clearSearch,
    rows,
    isLoading,
    isError,
    isRefreshing,
    handleRetry,
    rangeLabel,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  } = useAdminUsers();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando usuários"
          className="grid gap-2"
        >
          {Array.from({ length: 5 }, (_, index) => (
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
          headingLevel="h2"
          onRetry={handleRetry}
          isRetrying={isRefreshing}
        />
      );
    }
    if (rows.length === 0) {
      return hasSearch ? (
        <ModuleStatePanel
          icon={Search}
          title="Nenhum usuário encontrado"
          description="Tente outro nome, e-mail ou telefone."
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
          icon={Users}
          title="Nenhum usuário ainda"
          description="As contas criadas na plataforma aparecem aqui."
        />
      );
    }

    return (
      <div
        role="region"
        aria-label="Usuários"
        aria-busy={isRefreshing || undefined}
        tabIndex={0}
        className={cn(PANEL_TABLE_WRAPPER_CLASS, isRefreshing && 'opacity-70')}
      >
        <table className={cn(PANEL_TABLE_CLASS, 'min-w-[640px]')}>
          <thead>
            <tr>
              <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
                Nome
              </th>
              <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
                E-mail
              </th>
              <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
                Telefone
              </th>
              <th
                scope="col"
                className={cn(PANEL_HEAD_CELL_CLASS, 'text-right')}
              >
                Cadastro
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group">
                <td className={PANEL_CELL_CLASS}>
                  <b className="break-words">{row.name}</b>
                </td>
                <td className={cn(PANEL_CELL_CLASS, 'break-all')}>
                  {row.email}
                </td>
                <td className={cn(PANEL_CELL_CLASS, 'whitespace-nowrap')}>
                  {row.telephone}
                </td>
                <td className={cn(PANEL_CELL_CLASS, PANEL_NUMBER_CLASS)}>
                  {row.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const showPager = !isLoading && !isError && rows.length > 0;

  return (
    <div className="grid max-w-[1100px] gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className={PANEL_TITLE_CLASS}>Usuários</h1>
          <p className={PANEL_TEXT_CLASS}>
            Contas de clientes, donos e equipes, sem as excluídas.
          </p>
        </div>
        <label className="min-w-0 flex-[0_1_360px]">
          <span className="sr-only">Buscar usuários</span>
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nome, e-mail ou telefone"
            className={PANEL_FIELD_CLASS}
          />
        </label>
      </div>

      {renderContent()}

      {showPager ? (
        <nav aria-label="Paginação de usuários" className={PANEL_PAGER_CLASS}>
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
    </div>
  );
};
