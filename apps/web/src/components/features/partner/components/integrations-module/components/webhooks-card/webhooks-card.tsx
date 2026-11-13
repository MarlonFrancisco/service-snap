'use client';

import { cn, Skeleton } from '@repo/ui';
import { Plus, Webhook } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
} from '../../../notifications-module/components/module-state';
import {
  PANEL_BUTTON_CLASS,
  PANEL_BUTTON_ICON_CLASS,
  PANEL_CARD_CLASS,
  PANEL_CARD_TITLE_CLASS,
  PANEL_CODE_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../audit-logs-module/audit-logs-module.styles';
import { OneTimeSecret } from '../one-time-secret';
import { WebhookDeliveries } from './webhook-deliveries';
import { WebhookDialog } from './webhook-dialog';
import { WebhookEndpointItem } from './webhook-endpoint-item';
import { useWebhooksCard } from './webhooks-card.hook';
import type { TWebhooksCardConfig } from './webhooks-card.types';

export const WebhooksCard = ({ storeId }: TWebhooksCardConfig) => {
  const {
    webhooks,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
    isDialogOpen,
    setIsDialogOpen,
    editingEndpoint,
    openCreate,
    openEdit,
    handleCreated,
    createdSecret,
    dismissCreatedSecret,
    selectedEndpointId,
    setDeliveriesEndpointId,
  } = useWebhooksCard({ storeId });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando webhooks"
          className="grid gap-2"
        >
          <Skeleton className="h-28 w-full rounded-2xl bg-[#F0EEF4]" />
          <Skeleton className="h-16 w-full rounded-2xl bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      );
    }
    if (webhooks.length === 0) {
      return (
        <ModuleStatePanel
          icon={Webhook}
          headingLevel="h3"
          title="Nenhum webhook ainda"
          description="Cadastre o endereço do seu sistema para receber os agendamentos na hora."
        />
      );
    }

    return (
      <>
        <div className="grid gap-3">
          {webhooks.map((endpoint) => (
            <WebhookEndpointItem
              key={endpoint.id}
              storeId={storeId}
              endpoint={endpoint}
              onEdit={openEdit}
              onShowDeliveries={setDeliveriesEndpointId}
              isShowingDeliveries={endpoint.id === selectedEndpointId}
            />
          ))}
        </div>

        {selectedEndpointId ? (
          <WebhookDeliveries
            storeId={storeId}
            endpoints={webhooks}
            endpointId={selectedEndpointId}
            onEndpointChange={setDeliveriesEndpointId}
          />
        ) : null}
      </>
    );
  };

  return (
    <>
      {createdSecret ? (
        <OneTimeSecret
          title="Webhook criado"
          value={createdSecret.secret}
          onDismiss={dismissCreatedSecret}
          warning={
            <>
              <b>Guarde o segredo de assinatura.</b> Você pode mostrá-lo de novo
              depois, e isso fica registrado no histórico de ações.
            </>
          }
        >
          <p className={cn(PANEL_TEXT_CLASS, 'break-all')}>
            Endereço:{' '}
            <code className={PANEL_CODE_CLASS}>{createdSecret.url}</code>
          </p>
        </OneTimeSecret>
      ) : null}

      <div className={PANEL_CARD_CLASS}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-[1_1_240px]">
            <h3 className={PANEL_CARD_TITLE_CLASS}>Webhooks</h3>
            <p className={PANEL_TEXT_CLASS}>
              Avisamos seu sistema quando um agendamento é criado, alterado ou
              cancelado.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className={cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS)}
          >
            <Plus aria-hidden="true" className={PANEL_BUTTON_ICON_CLASS} />
            Novo webhook
          </button>
        </div>

        {renderContent()}

        <p className={PANEL_TEXT_CLASS}>
          Cada envio leva o cabeçalho{' '}
          <code className={PANEL_CODE_CLASS}>ServiceSnap-Signature</code> (HMAC
          SHA-256 com o segredo). Confira a assinatura e o horário antes de
          aceitar.
        </p>
      </div>

      <WebhookDialog
        storeId={storeId}
        isOpen={isDialogOpen}
        endpoint={editingEndpoint}
        onOpenChange={setIsDialogOpen}
        onCreated={handleCreated}
      />
    </>
  );
};
