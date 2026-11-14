'use client';

import { cn, Skeleton, Textarea } from '@repo/ui';
import { PARTNER_FOCUS_CLASS } from '../../../../partner/partner.styles';
import {
  PANEL_CARD_CLASS,
  PANEL_CARD_TITLE_CLASS,
  PANEL_CHIP_CLASS,
  PANEL_CHIP_TONE_CLASS,
  PANEL_DANGER_BUTTON_CLASS,
  PANEL_DETAILS_LIST_CLASS,
  PANEL_DETAILS_ROW_CLASS,
  PANEL_DETAILS_TERM_CLASS,
  PANEL_DETAILS_VALUE_CLASS,
  PANEL_FIELD_HINT_CLASS,
  PANEL_FIELD_LABEL_CLASS,
  PANEL_ITEM_CLASS,
  PANEL_PRIMARY_BUTTON_CLASS,
  PANEL_TEXTAREA_CLASS,
  PANEL_TEXT_CLASS,
} from '../../../../partner/components/audit-logs-module/audit-logs-module.styles';
import { ModuleErrorState } from '../../../../partner/components/notifications-module/components/module-state';
import { ADMIN_SUSPEND_REASON_MAX } from '../../../admin.helpers';
import { useAdminStoreDetails } from './admin-store-details.hook';
import type { TAdminStoreDetailsConfig } from './admin-store-details.types';

export const AdminStoreDetails = (config: TAdminStoreDetailsConfig) => {
  const { headingRef } = config;
  const {
    store,
    status,
    details,
    activity,
    reason,
    setReason,
    handleSuspend,
    handleReactivate,
    isSaving,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
  } = useAdminStoreDetails(config);

  const renderBody = () => {
    if (!config.storeId) {
      return (
        <p className={PANEL_TEXT_CLASS}>
          Escolha uma loja em Abrir para ver plano, equipe e atividade.
        </p>
      );
    }
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando loja"
          className="grid gap-2.5"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-4 w-full rounded-full bg-[#F0EEF4]"
            />
          ))}
        </div>
      );
    }
    if (isError || !store) {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      );
    }

    return (
      <>
        {status ? (
          <span
            className={cn(
              PANEL_CHIP_CLASS,
              PANEL_CHIP_TONE_CLASS[status.tone],
              'self-start',
            )}
          >
            {status.label}
          </span>
        ) : null}

        <dl className={PANEL_DETAILS_LIST_CLASS}>
          {details.map((item) => (
            <div key={item.term} className={PANEL_DETAILS_ROW_CLASS}>
              <dt className={PANEL_DETAILS_TERM_CLASS}>{item.term}</dt>
              <dd className={PANEL_DETAILS_VALUE_CLASS}>{item.value}</dd>
            </div>
          ))}
        </dl>

        {store.isDeleted ? (
          <p className={PANEL_TEXT_CLASS}>
            O dono excluiu esta loja. Ela não volta para a busca.
          </p>
        ) : store.isActive ? (
          <>
            <label className={PANEL_FIELD_LABEL_CLASS}>
              <span>
                Motivo da suspensão{' '}
                <span className={PANEL_FIELD_HINT_CLASS}>
                  Fica no histórico de ações da loja
                </span>
              </span>
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={ADMIN_SUSPEND_REASON_MAX}
                placeholder="Ex.: denúncia de golpe em análise"
                className={PANEL_TEXTAREA_CLASS}
              />
            </label>
            <button
              type="button"
              onClick={handleSuspend}
              disabled={isSaving}
              className={PANEL_DANGER_BUTTON_CLASS}
            >
              {isSaving ? 'Suspendendo...' : 'Suspender loja'}
            </button>
            <p className={PANEL_TEXT_CLASS}>
              Suspensa, a loja sai da busca. O dono vê a ação no histórico de
              ações dela.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isSaving}
              className={PANEL_PRIMARY_BUTTON_CLASS}
            >
              {isSaving ? 'Reativando...' : 'Reativar loja'}
            </button>
            <p className={PANEL_TEXT_CLASS}>
              Reativada, a loja volta para a busca. O dono vê a ação no
              histórico de ações dela.
            </p>
          </>
        )}

        <h4 className="text-base font-extrabold">Atividade recente</h4>
        {activity.length ? (
          <ul className="grid gap-2.5">
            {activity.map((item) => (
              <li key={item.id} className={PANEL_ITEM_CLASS}>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <b className="text-sm">{item.label}</b>
                  <span className="text-[13px] text-[#5F5C6E]">
                    {item.meta}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={PANEL_TEXT_CLASS}>Nenhuma ação registrada ainda.</p>
        )}
      </>
    );
  };

  return (
    <section
      aria-labelledby="admin-store-details-title"
      className={cn(PANEL_CARD_CLASS, 'lg:sticky lg:top-8')}
    >
      <h3
        id="admin-store-details-title"
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          PANEL_CARD_TITLE_CLASS,
          PARTNER_FOCUS_CLASS,
          'break-words',
        )}
      >
        {store && config.storeId ? store.name : 'Detalhes da loja'}
      </h3>
      {renderBody()}
    </section>
  );
};
