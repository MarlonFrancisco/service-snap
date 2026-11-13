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
} from '@repo/ui';
import { Check, Copy } from 'lucide-react';
import {
  MODULE_DIALOG_CANCEL_CLASS,
  MODULE_DIALOG_CLASS,
  MODULE_DIALOG_DANGER_CLASS,
  MODULE_DIALOG_TEXT_CLASS,
  MODULE_DIALOG_TITLE_CLASS,
} from '../../../../notifications-module/notifications-module.styles';
import {
  PANEL_BUTTON_CLASS,
  PANEL_BUTTON_ICON_CLASS,
  PANEL_CHIP_CLASS,
  PANEL_CHIP_TONE_CLASS,
  PANEL_CODE_CLASS,
  PANEL_DANGER_BUTTON_CLASS,
  PANEL_ITEM_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
} from '../../../../audit-logs-module/audit-logs-module.styles';
import { useWebhookEndpointItem } from './webhook-endpoint-item.hook';
import type { TWebhookEndpointItemConfig } from './webhook-endpoint-item.types';

const SMALL_BUTTON_CLASS = cn(PANEL_BUTTON_CLASS, PANEL_SMALL_BUTTON_CLASS);
const SMALL_DANGER_BUTTON_CLASS = cn(
  PANEL_DANGER_BUTTON_CLASS,
  PANEL_SMALL_BUTTON_CLASS,
);

const CONFIRM_COPY = {
  rotate: {
    title: 'Trocar o segredo?',
    description:
      'O segredo atual deixa de valer na hora. Até você atualizar seu sistema, ele vai recusar os envios.',
    action: 'Trocar segredo',
    pending: 'Trocando...',
  },
  remove: {
    title: 'Excluir este webhook?',
    description:
      'O endereço para de receber eventos e as entregas registradas são apagadas.',
    action: 'Excluir',
    pending: 'Excluindo...',
  },
} as const;

export const WebhookEndpointItem = (config: TWebhookEndpointItemConfig) => {
  const { endpoint, onEdit, onShowDeliveries, isShowingDeliveries } = config;
  const {
    eventsLabel,
    statusLabel,
    disabledLabel,
    revealedSecret,
    handleRevealSecret,
    handleHideSecret,
    handleCopySecret,
    isSecretCopied,
    isRevealingSecret,
    handleSendTest,
    isSendingTest,
    handleReactivate,
    isReactivating,
    confirmAction,
    setConfirmAction,
    handleConfirmOpenChange,
    handleConfirm,
    isConfirming,
  } = useWebhookEndpointItem(config);

  const confirmCopy = confirmAction ? CONFIRM_COPY[confirmAction] : null;

  const urlBlock = (
    <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-0.5">
      <b className="text-sm">
        <code className={cn(PANEL_CODE_CLASS, 'break-all')}>
          {endpoint.url}
        </code>
      </b>
      <span className="text-[13px] text-[#5F5C6E]">
        {endpoint.isActive ? eventsLabel : disabledLabel}
        {endpoint.description ? ` · ${endpoint.description}` : ''}
      </span>
    </div>
  );

  return (
    <article aria-label={`Webhook ${endpoint.url}`}>
      {endpoint.isActive ? (
        <div className={cn(PANEL_ITEM_CLASS, 'flex-col items-stretch gap-3')}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            {urlBlock}
            <span
              className={cn(PANEL_CHIP_CLASS, PANEL_CHIP_TONE_CLASS.success)}
            >
              {statusLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
              <b className="text-sm">Segredo de assinatura</b>
              <code
                className={cn(
                  PANEL_CODE_CLASS,
                  'text-[#5F5C6E] [overflow-wrap:anywhere]',
                )}
              >
                {revealedSecret ?? 'whsec_••••••••••••••••'}
              </code>
              <span className="text-xs text-[#5F5C6E]">
                Mostrar o segredo fica registrado no histórico de ações.
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {revealedSecret ? (
                <>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className={SMALL_BUTTON_CLASS}
                  >
                    {isSecretCopied ? (
                      <Check
                        aria-hidden="true"
                        className={PANEL_BUTTON_ICON_CLASS}
                      />
                    ) : (
                      <Copy
                        aria-hidden="true"
                        className={PANEL_BUTTON_ICON_CLASS}
                      />
                    )}
                    {isSecretCopied ? 'Copiado' : 'Copiar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleHideSecret}
                    className={SMALL_BUTTON_CLASS}
                  >
                    Ocultar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleRevealSecret}
                  disabled={isRevealingSecret}
                  className={SMALL_BUTTON_CLASS}
                >
                  {isRevealingSecret ? 'Mostrando...' : 'Mostrar'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmAction('rotate')}
                className={SMALL_BUTTON_CLASS}
              >
                Trocar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest}
              className={SMALL_BUTTON_CLASS}
            >
              {isSendingTest ? 'Enviando...' : 'Enviar teste'}
            </button>
            <button
              type="button"
              onClick={() => onEdit(endpoint)}
              className={SMALL_BUTTON_CLASS}
            >
              Editar
            </button>
            {!isShowingDeliveries ? (
              <button
                type="button"
                onClick={() => onShowDeliveries(endpoint.id)}
                className={SMALL_BUTTON_CLASS}
              >
                Ver entregas
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setConfirmAction('remove')}
              className={SMALL_DANGER_BUTTON_CLASS}
            >
              Excluir
            </button>
          </div>
        </div>
      ) : (
        <div className={PANEL_ITEM_CLASS}>
          {urlBlock}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={cn(PANEL_CHIP_CLASS, PANEL_CHIP_TONE_CLASS.danger)}
            >
              {statusLabel}
            </span>
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isReactivating}
              className={SMALL_BUTTON_CLASS}
            >
              {isReactivating ? 'Religando...' : 'Religar'}
            </button>
            <button
              type="button"
              onClick={() => onEdit(endpoint)}
              className={SMALL_BUTTON_CLASS}
            >
              Editar
            </button>
            {!isShowingDeliveries ? (
              <button
                type="button"
                onClick={() => onShowDeliveries(endpoint.id)}
                className={SMALL_BUTTON_CLASS}
              >
                Ver entregas
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setConfirmAction('remove')}
              className={SMALL_DANGER_BUTTON_CLASS}
            >
              Excluir
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!confirmAction}
        onOpenChange={handleConfirmOpenChange}
      >
        <AlertDialogContent className={MODULE_DIALOG_CLASS}>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className={MODULE_DIALOG_TITLE_CLASS}>
              {confirmCopy?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className={MODULE_DIALOG_TEXT_CLASS}>
              {confirmCopy?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2.5">
            <AlertDialogCancel
              disabled={isConfirming}
              className={MODULE_DIALOG_CANCEL_CLASS}
            >
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isConfirming}
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
              }}
              className={MODULE_DIALOG_DANGER_CLASS}
            >
              {isConfirming ? confirmCopy?.pending : confirmCopy?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
};
