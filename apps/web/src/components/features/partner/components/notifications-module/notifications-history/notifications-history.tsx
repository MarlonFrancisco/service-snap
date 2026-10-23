'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { Check, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  formatTimestamp,
  getNotificationColor,
  getNotificationIcon,
  getStatusBadgeConfig,
  Icons,
} from '../notifications-module.utils';
import { useNotificationsHistory } from './notifications-history.hook';
import { NotificationsHistorySkeleton } from './notifications-history.skeleton';

export function NotificationsHistory() {
  const {
    notifications,
    unreadCount,
    searchQuery,
    filterType,
    filterStatus,
    setSearchQuery,
    setFilterType,
    setFilterStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    page,
    setPage,
    totalPages,
    isLoading,
  } = useNotificationsHistory();
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-gray-900">Histórico de Notificações</h2>
        <p className="text-gray-600 text-sm">
          Visualize e gerencie todas as notificações enviadas aos seus clientes
        </p>
      </div>

      {/* Action Button */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="border-gray-300"
          >
            <Icons.CheckCircle className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      )}

      {/* History Card */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar notificações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Icons.Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="booking">Agendamentos</SelectItem>
                <SelectItem value="cancellation">Cancelamentos</SelectItem>
                <SelectItem value="reminder">Lembretes</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <NotificationsHistorySkeleton />
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Icons.Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-600 text-sm">
                Tente ajustar os filtros de busca
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                          notification.type,
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-gray-900">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {notification.status &&
                              (() => {
                                const config = getStatusBadgeConfig(
                                  notification.status,
                                );
                                return config ? (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${config.className}`}
                                  >
                                    {config.label}
                                  </Badge>
                                ) : null;
                              })()}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTimestamp(
                                new Date(notification.timestamp),
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Message */}
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>

                        {/* Recipient */}
                        {notification.recipient && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 min-w-0">
                            <Icons.User className="h-3 w-3 shrink-0" />
                            <span className="truncate break-all">
                              {notification.recipient}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="h-7 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    aria-disabled={page === 1}
                    className={
                      page === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {(() => {
                  const maxPagesToShow = 5;
                  const pages: number[] = [];

                  if (totalPages <= maxPagesToShow) {
                    // Show all pages
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Sliding window logic
                    let startPage = Math.max(1, page - 5);
                    const endPage = Math.min(
                      totalPages,
                      startPage + maxPagesToShow - 1,
                    );

                    // Adjust if we're near the end
                    if (endPage - startPage < maxPagesToShow - 1) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }
                  }

                  return pages.map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={page === p}
                        onClick={() => setPage(p)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ));
                })()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    aria-disabled={page === totalPages}
                    className={
                      page === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
