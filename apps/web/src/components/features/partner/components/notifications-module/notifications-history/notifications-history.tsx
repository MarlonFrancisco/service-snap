'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { Bell, Search } from 'lucide-react';
import { PARTNER_PORTAL_CLASS } from '../../../partner.styles';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../components/module-state';
import {
  MODULE_ACTION_CLASS,
  MODULE_BADGE_CLASS,
  MODULE_DANGER_ACTION_CLASS,
  MODULE_DIALOG_CANCEL_CLASS,
  MODULE_DIALOG_CLASS,
  MODULE_DIALOG_DANGER_CLASS,
  MODULE_DIALOG_TEXT_CLASS,
  MODULE_DIALOG_TITLE_CLASS,
  MODULE_LEAD_CLASS,
  MODULE_TITLE_CLASS,
} from '../notifications-module.styles';
import { useNotificationsHistory } from './notifications-history.hook';
import { NotificationsHistorySkeleton } from './notifications-history.skeleton';

const FILTER_TRIGGER_CLASS =
  'min-h-11 w-full cursor-pointer rounded-full border-[#E3E1EA] bg-white px-4 text-[13px] font-semibold text-[#0B0B0F] shadow-none data-[size=default]:h-11 sm:w-auto';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'booking', label: 'Agendamentos' },
  { value: 'cancellation', label: 'Cancelamentos' },
  { value: 'reminder', label: 'Lembretes' },
  { value: 'system', label: 'Sistema' },
  { value: 'marketing', label: 'Marketing' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'sent', label: 'Enviada' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'failed', label: 'Falhou' },
  { value: 'pending', label: 'Pendente' },
];

export function NotificationsHistory() {
  const {
    notifications,
    unreadCount,
    searchQuery,
    filterType,
    filterStatus,
    hasActiveFilters,
    setSearchQuery,
    setFilterType,
    setFilterStatus,
    clearFilters,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
    pendingDeleteId,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
    page,
    totalPages,
    goToPreviousPage,
    goToNextPage,
    isLoading,
    isError,
    hasNoStore,
    handleRetry,
    isRetrying,
  } = useNotificationsHistory();

  const renderContent = () => {
    if (hasNoStore) return <NoStoreState headingLevel="h3" />;
    if (isLoading) return <NotificationsHistorySkeleton />;
    if (isError) {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      );
    }
    if (notifications.length === 0) {
      return hasActiveFilters ? (
        <ModuleStatePanel
          icon={Search}
          headingLevel="h3"
          title="Nenhuma notificação encontrada"
          description="Tente ajustar os filtros de busca."
        >
          <button
            type="button"
            onClick={clearFilters}
            className={MODULE_ACTION_CLASS}
          >
            Limpar filtros
          </button>
        </ModuleStatePanel>
      ) : (
        <ModuleStatePanel
          icon={Bell}
          headingLevel="h3"
          title="Nenhuma notificação ainda"
          description="As notificações enviadas aos seus clientes aparecem aqui."
        />
      );
    }

    return (
      <section
        aria-label="Notificações"
        className="overflow-hidden rounded-[22px] border border-[#EBE9F0]"
      >
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="flex flex-wrap justify-between gap-3 border-b border-[#F0EEF4] px-5 py-4 last:border-0"
          >
            <div className="min-w-0 flex-1 basis-64">
              <h3 className="flex flex-wrap items-center gap-2 text-[15px] font-bold">
                {notification.read ? null : (
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full bg-[#9810FA]"
                  />
                )}
                <span className="min-w-0 break-words">
                  {notification.title}
                </span>
                {notification.read ? null : (
                  <span className="sr-only">(não lida)</span>
                )}
                {notification.statusBadge ? (
                  <span
                    className={cn(
                      MODULE_BADGE_CLASS,
                      'px-[9px] py-[3px]',
                      notification.statusBadge.className,
                    )}
                  >
                    {notification.statusBadge.label}
                  </span>
                ) : null}
              </h3>
              <p className="mt-0.5 text-[13px] leading-normal break-words text-[#5F5C6E]">
                {notification.message}
              </p>
              <p className="mt-0.5 text-[13px] leading-normal break-all text-[#5F5C6E]">
                {notification.recipient
                  ? `Para ${notification.recipient} · ${notification.timeLabel}`
                  : notification.timeLabel}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-1.5">
              {notification.read ? null : (
                <button
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={MODULE_ACTION_CLASS}
                >
                  Marcar como lida
                </button>
              )}
              <button
                type="button"
                onClick={() => requestDelete(notification.id)}
                className={MODULE_DANGER_ACTION_CLASS}
              >
                Excluir
              </button>
            </div>
          </article>
        ))}
      </section>
    );
  };

  const canPaginate =
    !hasNoStore &&
    !isLoading &&
    !isError &&
    notifications.length > 0 &&
    totalPages > 1;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className={MODULE_TITLE_CLASS}>Histórico de notificações</h2>
          <p className={MODULE_LEAD_CLASS}>
            Visualize e gerencie todas as notificações enviadas aos seus
            clientes
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={isMarkingAllAsRead}
            className={MODULE_ACTION_CLASS}
          >
            Marcar todas como lidas
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          type="search"
          aria-label="Buscar notificações"
          placeholder="Buscar notificações..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-11 min-w-0 flex-[1_1_260px] rounded-full border-[#E3E1EA] bg-white px-[18px] text-base font-medium shadow-none placeholder:text-[#6F6C7E] md:text-sm"
        />

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger
            aria-label="Filtrar por tipo"
            className={FILTER_TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={PARTNER_PORTAL_CLASS}>
            {TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            aria-label="Filtrar por status"
            className={FILTER_TRIGGER_CLASS}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={PARTNER_PORTAL_CLASS}>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderContent()}

      {canPaginate ? (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-center gap-2 text-[13px] text-[#5F5C6E]"
        >
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={page === 1}
            className={MODULE_ACTION_CLASS}
          >
            Anterior
          </button>
          Página {page} de {totalPages}
          <button
            type="button"
            onClick={goToNextPage}
            disabled={page === totalPages}
            className={MODULE_ACTION_CLASS}
          >
            Próxima
          </button>
        </nav>
      ) : null}

      <AlertDialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) cancelDelete();
        }}
      >
        <AlertDialogContent className={MODULE_DIALOG_CLASS}>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className={MODULE_DIALOG_TITLE_CLASS}>
              Excluir esta notificação?
            </AlertDialogTitle>
            <AlertDialogDescription className={MODULE_DIALOG_TEXT_CLASS}>
              Ela sai do histórico da loja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2.5">
            <AlertDialogCancel
              disabled={isDeleting}
              className={MODULE_DIALOG_CANCEL_CLASS}
            >
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              className={MODULE_DIALOG_DANGER_CLASS}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
