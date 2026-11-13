'use client';

import { cn, Skeleton } from '@repo/ui';
import { Lock } from 'lucide-react';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_CARD_CLASS,
  CUSTOMERS_CARD_LEAD_CLASS,
  CUSTOMERS_CARD_TITLE_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
} from '../../../customers-module/customers-module.styles';
import {
  ANAMNESIS_ITEM_CLASS,
  ANAMNESIS_LOCK_NOTE_CLASS,
  ANAMNESIS_NOTE_ICON_CLASS,
  ANAMNESIS_TEXT_CLASS,
} from '../../anamnesis-module.styles';
import { AnamnesisResponseDialog } from './anamnesis-response-dialog';
import { useCustomerAnamnesisPanel } from './customer-anamnesis-panel.hook';
import type { TCustomerAnamnesisPanelConfig } from './customer-anamnesis-panel.types';

/** Ficha do cliente: as fichas de anamnese que ele preencheu. */
export const CustomerAnamnesisPanel = ({
  customerId,
}: TCustomerAnamnesisPanelConfig) => {
  const {
    storeId,
    rows,
    isLoading,
    isError,
    isForbidden,
    isRetrying,
    handleRetry,
    canDelete,
    openRow,
    handleOpen,
    handleClose,
  } = useCustomerAnamnesisPanel({ customerId });

  const renderBody = () => {
    if (isForbidden) {
      return (
        <div className={ANAMNESIS_LOCK_NOTE_CLASS}>
          <Lock aria-hidden="true" className={ANAMNESIS_NOTE_ICON_CLASS} />
          <p>
            <b className="block text-[#3B2A6B]">Ficha protegida</b>
            Só dono, gerente e o profissional deste atendimento abrem as
            respostas.
          </p>
        </div>
      );
    }
    if (isLoading) {
      return (
        <div
          role="status"
          aria-label="Carregando fichas"
          className="grid gap-2"
        >
          <Skeleton className="h-[68px] rounded-[16px] bg-[#F0EEF4]" />
          <Skeleton className="h-[68px] rounded-[16px] bg-[#F0EEF4]" />
        </div>
      );
    }
    if (isError) {
      return (
        <div role="alert" className="grid gap-3">
          <p className={ANAMNESIS_TEXT_CLASS}>
            Não foi possível carregar as fichas.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className={cn(
              CUSTOMERS_BUTTON_CLASS,
              CUSTOMERS_SMALL_BUTTON_CLASS,
              'justify-self-start',
            )}
          >
            Tentar de novo
          </button>
        </div>
      );
    }
    if (rows.length === 0) {
      return (
        <p className={ANAMNESIS_TEXT_CLASS}>
          Nenhuma ficha preenchida ainda. O link sai dos detalhes do
          agendamento.
        </p>
      );
    }

    return (
      <ul className="grid gap-2">
        {rows.map((row) => (
          <li key={row.id} className={ANAMNESIS_ITEM_CLASS}>
            <div className="grid min-w-0 gap-0.5">
              <b className="text-sm break-words">{row.formName}</b>
              <span className="text-[13px] text-[#5F5C6E]">{row.meta}</span>
            </div>
            <button
              type="button"
              onClick={() => handleOpen(row)}
              aria-label={`Abrir ${row.formName} de ${row.meta}`}
              className={cn(
                CUSTOMERS_BUTTON_CLASS,
                CUSTOMERS_SMALL_BUTTON_CLASS,
              )}
            >
              Abrir
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section
      aria-labelledby="customer-anamnesis-title"
      className={CUSTOMERS_CARD_CLASS}
    >
      <h3 id="customer-anamnesis-title" className={CUSTOMERS_CARD_TITLE_CLASS}>
        Fichas de anamnese
      </h3>
      <p className={CUSTOMERS_CARD_LEAD_CLASS}>
        Dado de saúde: cada abertura fica no histórico da loja
      </p>
      {renderBody()}

      <AnamnesisResponseDialog
        storeId={storeId}
        customerId={customerId}
        row={openRow}
        canDelete={canDelete}
        onClose={handleClose}
      />
    </section>
  );
};
