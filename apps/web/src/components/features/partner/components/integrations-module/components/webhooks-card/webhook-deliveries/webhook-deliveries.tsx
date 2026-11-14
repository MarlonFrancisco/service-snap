'use client';

import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@repo/ui';
import { PARTNER_PORTAL_CLASS } from '../../../../../partner.styles';
import {
  PANEL_BUTTON_CLASS,
  PANEL_CAPTION_CLASS,
  PANEL_CELL_CLASS,
  PANEL_CHIP_CLASS,
  PANEL_CHIP_TONE_CLASS,
  PANEL_HEAD_CELL_CLASS,
  PANEL_NUMBER_CLASS,
  PANEL_SELECT_TRIGGER_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_TABLE_CLASS,
  PANEL_TABLE_WRAPPER_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../../audit-logs-module/audit-logs-module.styles';
import { useWebhookDeliveries } from './webhook-deliveries.hook';
import type { TWebhookDeliveriesConfig } from './webhook-deliveries.types';

const COLUMNS = [
  { label: 'Evento' },
  { label: 'Situação' },
  { label: 'Tentativas', isNumber: true },
  { label: 'HTTP', isNumber: true },
  { label: 'Quando', isNumber: true },
];

export const WebhookDeliveries = (config: TWebhookDeliveriesConfig) => {
  const { endpoints, endpointId, onEndpointChange } = config;
  const {
    rows,
    isLoading,
    isError,
    isRefreshing,
    handleReload,
    handleRetry,
    retryingId,
  } = useWebhookDeliveries(config);

  const renderBody = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando entregas"
          className="grid gap-2"
        >
          <Skeleton className="h-11 w-full rounded-2xl bg-[#F0EEF4]" />
          <Skeleton className="h-11 w-full rounded-2xl bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
      return (
        <p
          role="alert"
          className={cn(PANEL_TEXT_CLASS, 'flex flex-wrap items-center gap-3')}
        >
          Não foi possível carregar as entregas.
          <button
            type="button"
            onClick={handleReload}
            className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
          >
            Tentar novamente
          </button>
        </p>
      );
    }
    if (rows.length === 0) {
      return (
        <p className={PANEL_TEXT_CLASS}>
          Nenhuma entrega ainda. Use Enviar teste para conferir o endereço.
        </p>
      );
    }

    return (
      <div
        role="region"
        aria-label="Entregas recentes"
        aria-busy={isRefreshing || undefined}
        tabIndex={0}
        className={PANEL_TABLE_WRAPPER_CLASS}
      >
        <table className={cn(PANEL_TABLE_CLASS, 'min-w-[560px]')}>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.label}
                  scope="col"
                  className={cn(
                    PANEL_HEAD_CELL_CLASS,
                    column.isNumber && 'text-right',
                  )}
                >
                  {column.label}
                </th>
              ))}
              <th scope="col" className={PANEL_HEAD_CELL_CLASS}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group">
                <td className={PANEL_CELL_CLASS}>
                  <code className="text-[13px]">{row.event}</code>
                </td>
                <td className={PANEL_CELL_CLASS}>
                  <span
                    title={row.error ?? undefined}
                    className={cn(
                      PANEL_CHIP_CLASS,
                      PANEL_CHIP_TONE_CLASS[row.status.tone],
                    )}
                  >
                    {row.status.label}
                  </span>
                </td>
                <td className={cn(PANEL_CELL_CLASS, PANEL_NUMBER_CLASS)}>
                  {row.attempts}
                </td>
                <td className={cn(PANEL_CELL_CLASS, PANEL_NUMBER_CLASS)}>
                  {row.httpStatus}
                </td>
                <td className={cn(PANEL_CELL_CLASS, PANEL_NUMBER_CLASS)}>
                  {row.when}
                </td>
                <td className={cn(PANEL_CELL_CLASS, 'text-right')}>
                  {row.canRetry ? (
                    <button
                      type="button"
                      onClick={() => handleRetry(row.id)}
                      disabled={retryingId === row.id}
                      aria-label={`Reenviar ${row.event} de ${row.when}`}
                      className={cn(
                        PANEL_BUTTON_CLASS,
                        PANEL_SMALL_BUTTON_CLASS,
                      )}
                    >
                      {retryingId === row.id ? 'Reenviando...' : 'Reenviar'}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section aria-labelledby="webhook-deliveries-title" className="grid gap-3">
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h4 id="webhook-deliveries-title" className={PANEL_CAPTION_CLASS}>
          Entregas recentes
        </h4>
        {endpoints.length > 1 ? (
          <Select value={endpointId} onValueChange={onEndpointChange}>
            <SelectTrigger
              aria-label="Webhook das entregas"
              className={cn(
                PANEL_SELECT_TRIGGER_CLASS,
                'max-w-full sm:max-w-[320px]',
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={PARTNER_PORTAL_CLASS}>
              {endpoints.map((endpoint) => (
                <SelectItem key={endpoint.id} value={endpoint.id}>
                  {endpoint.description || endpoint.url}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      {renderBody()}
    </section>
  );
};
