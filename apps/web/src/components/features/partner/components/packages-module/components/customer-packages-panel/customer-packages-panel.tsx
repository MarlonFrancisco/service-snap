'use client';

import { cn, Skeleton } from '@repo/ui';
import { useId } from 'react';
import {
  CUSTOMERS_CARD_CLASS,
  CUSTOMERS_CARD_TITLE_CLASS,
} from '../../../customers-module/customers-module.styles';
import {
  getRetentionChipClass,
  RETENTION_BAR_FILL_CLASS,
  RETENTION_BAR_TRACK_CLASS,
  RETENTION_BUTTON_CLASS,
  RETENTION_DANGER_BUTTON_CLASS,
  RETENTION_ITEM_CLASS,
  RETENTION_ITEM_LINES_CLASS,
  RETENTION_SMALL_BUTTON_CLASS,
  RETENTION_TEXT_CLASS,
} from '../../packages-module.styles';
import { RetentionConfirmDialog } from '../retention-confirm-dialog';
import { useCustomerPackagesPanel } from './customer-packages-panel.hook';
import type { TCustomerPackagesPanelConfig } from './customer-packages-panel.types';

const SECTION_TITLE_CLASS = 'text-sm font-extrabold';

/** Saldo de pacotes na ficha do cliente. Para montar na ficha: `{ customerId }`. */
export const CustomerPackagesPanel = (config: TCustomerPackagesPanelConfig) => {
  const titleId = useId();
  const {
    title,
    activePackages,
    pastPackages,
    isEmpty,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
    handleAskCancel,
    handleCloseCancel,
    handleConfirmCancel,
    cancelDialog,
  } = useCustomerPackagesPanel(config);

  const renderBody = () => {
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando pacotes"
          className="grid gap-3"
        >
          <Skeleton className="h-[132px] rounded-2xl bg-[#F0EEF4]" />
          <Skeleton className="h-16 rounded-2xl bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
      return (
        <div role="alert" className="grid justify-items-start gap-2.5">
          <p className={RETENTION_TEXT_CLASS}>
            Não foi possível carregar os pacotes.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className={cn(RETENTION_BUTTON_CLASS, RETENTION_SMALL_BUTTON_CLASS)}
          >
            {isRetrying ? 'Tentando...' : 'Tentar novamente'}
          </button>
        </div>
      );
    }
    if (isEmpty) {
      return (
        <p className={RETENTION_TEXT_CLASS}>
          Nenhum pacote ainda. Os pacotes vendidos para este cliente aparecem
          aqui, com o saldo de cada serviço.
        </p>
      );
    }

    return (
      <>
        {activePackages.map((view) => (
          <div
            key={view.id}
            className={cn(RETENTION_ITEM_CLASS, 'flex-col items-stretch gap-3')}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={RETENTION_ITEM_LINES_CLASS}>
                <b>{view.name}</b>
                <span>{view.summary}</span>
              </div>
              <span className={getRetentionChipClass(view.chip.tone)}>
                {view.chip.label}
              </span>
            </div>
            {view.items.map((item) => (
              <div key={item.id} className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span>{item.serviceName}</span>
                  <b>{item.balanceLabel}</b>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${item.serviceName}: ${item.balanceLabel}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={item.usedPercent}
                  className={RETENTION_BAR_TRACK_CLASS}
                >
                  <div
                    className={RETENTION_BAR_FILL_CLASS}
                    style={{ width: `${item.usedPercent}%` }}
                  />
                </div>
              </div>
            ))}
            {view.usages.length > 0 ? (
              <div className="grid gap-2">
                <h5 className="text-[13px] font-bold">Uso</h5>
                <ul className="grid gap-2">
                  {view.usages.map((usage) => (
                    <li
                      key={usage.id}
                      className="flex items-center justify-between gap-3 text-[13px]"
                    >
                      <span className="grid">
                        <b>{usage.title}</b>
                        <span className="text-[#5f5c6e]">{usage.detail}</span>
                      </span>
                      <span className="shrink-0 text-[#5f5c6e]">1 sessão</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleAskCancel(view)}
                className={cn(
                  RETENTION_DANGER_BUTTON_CLASS,
                  RETENTION_SMALL_BUTTON_CLASS,
                )}
              >
                Cancelar saldo
                <span className="sr-only"> de {view.name}</span>
              </button>
            </div>
          </div>
        ))}

        {pastPackages.length > 0 ? (
          <>
            <h4 className={SECTION_TITLE_CLASS}>Anteriores</h4>
            {pastPackages.map((view) => (
              <div key={view.id} className={RETENTION_ITEM_CLASS}>
                <div className={RETENTION_ITEM_LINES_CLASS}>
                  <b>{view.name}</b>
                  <span>{view.summary}</span>
                </div>
                <span className={getRetentionChipClass(view.chip.tone)}>
                  {view.chip.label}
                </span>
              </div>
            ))}
          </>
        ) : null}

        {activePackages.length > 0 ? (
          <p className={RETENTION_TEXT_CLASS}>
            Cancelar tira o saldo que sobrou. O que já foi usado fica no
            histórico.
          </p>
        ) : null}
      </>
    );
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn(CUSTOMERS_CARD_CLASS, 'grid gap-3.5')}
    >
      <h3
        id={titleId}
        className={cn(CUSTOMERS_CARD_TITLE_CLASS, 'break-words')}
      >
        {title}
      </h3>
      {renderBody()}

      <RetentionConfirmDialog
        isOpen={cancelDialog.isOpen}
        title={cancelDialog.title}
        description={cancelDialog.description}
        confirmLabel="Cancelar saldo"
        pendingLabel="Cancelando..."
        tone="danger"
        isPending={cancelDialog.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseCancel}
      />
    </section>
  );
};
