'use client';

import { cn, Skeleton } from '@repo/ui';
import { Lock, Plus } from 'lucide-react';
import {
  ModuleErrorState,
  ModuleStatePanel,
  NoStoreState,
} from '../../../notifications-module/components/module-state';
import {
  CUSTOMERS_BUTTON_CLASS,
  CUSTOMERS_BUTTON_ICON_CLASS,
  CUSTOMERS_LEAD_CLASS,
  CUSTOMERS_PRIMARY_BUTTON_CLASS,
  CUSTOMERS_SMALL_BUTTON_CLASS,
  CUSTOMERS_TITLE_CLASS,
} from '../../../customers-module/customers-module.styles';
import {
  ANAMNESIS_CAPTION_CLASS,
  ANAMNESIS_CARD_CLASS,
  ANAMNESIS_CHIP_CLASS,
  ANAMNESIS_CHIP_TONE,
  ANAMNESIS_ITEM_CLASS,
  ANAMNESIS_LOCK_NOTE_CLASS,
  ANAMNESIS_NOTE_ICON_CLASS,
  ANAMNESIS_TEXT_CLASS,
} from '../../anamnesis-module.styles';
import { AnamnesisFormEditor } from './anamnesis-form-editor';
import { useAnamnesisForms } from './anamnesis-forms.hook';

const LEAD = 'Perguntas que o cliente responde antes do atendimento';

const FormsSkeleton = () => (
  <div
    role="status"
    aria-label="Carregando fichas"
    className="grid gap-7 min-[1180px]:grid-cols-[minmax(0,1fr)_420px]"
  >
    <Skeleton className="h-[560px] rounded-[24px] bg-[#F0EEF4]" />
    <Skeleton className="h-[240px] rounded-[24px] bg-[#F0EEF4]" />
  </div>
);

/** Gestão → Anamnese: as fichas da loja, as perguntas e a versão. */
export const AnamnesisForms = () => {
  const {
    storeId,
    storeState,
    hasNoAccess,
    serviceOptions,
    items,
    selectedForm,
    isCreating,
    editorKey,
    isLoading,
    isError,
    isRetrying,
    handleRetry,
    handleSelect,
    handleNewForm,
    handleSaved,
  } = useAnamnesisForms();

  if (storeState === 'no-store') return <NoStoreState />;
  if (hasNoAccess) {
    return (
      <ModuleStatePanel
        icon={Lock}
        headingLevel="h2"
        title="Fichas são da gestão"
        description="Só dono e gerente criam e editam as fichas de anamnese. O link para o cliente sai dos detalhes do agendamento."
      />
    );
  }

  const renderContent = () => {
    if (storeState !== 'ready' || isLoading) return <FormsSkeleton />;
    if (isError) {
      return (
        <ModuleErrorState
          headingLevel="h3"
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      );
    }

    return (
      <div className="grid items-start gap-7 min-[1180px]:grid-cols-[minmax(0,1fr)_420px]">
        <AnamnesisFormEditor
          key={editorKey}
          form={selectedForm}
          storeId={storeId}
          serviceOptions={serviceOptions}
          onSaved={handleSaved}
        />

        <aside aria-labelledby="anamnesis-list-title" className="grid gap-3.5">
          <p id="anamnesis-list-title" className={ANAMNESIS_CAPTION_CLASS}>
            Fichas da loja
          </p>
          <div className={ANAMNESIS_CARD_CLASS}>
            {items.length > 0 ? (
              <ul className="grid gap-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      ANAMNESIS_ITEM_CLASS,
                      item.isSelected && 'border-[#0B0B0F]',
                    )}
                  >
                    <div className="grid min-w-0 gap-0.5">
                      <b className="text-sm break-words">{item.name}</b>
                      <span className="text-[13px] text-[#5F5C6E]">
                        {item.meta}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          ANAMNESIS_CHIP_CLASS,
                          item.isActive
                            ? ANAMNESIS_CHIP_TONE.ok
                            : ANAMNESIS_CHIP_TONE.neutral,
                        )}
                      >
                        {item.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        aria-current={item.isSelected || undefined}
                        aria-label={`Abrir a ficha ${item.name}`}
                        className={cn(
                          CUSTOMERS_BUTTON_CLASS,
                          CUSTOMERS_SMALL_BUTTON_CLASS,
                        )}
                      >
                        Abrir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={ANAMNESIS_TEXT_CLASS}>
                Nenhuma ficha ainda. Monte a primeira ao lado.
              </p>
            )}
            {!isCreating ? (
              <button
                type="button"
                onClick={handleNewForm}
                className={cn(
                  CUSTOMERS_BUTTON_CLASS,
                  CUSTOMERS_SMALL_BUTTON_CLASS,
                  'self-start',
                )}
              >
                <Plus
                  aria-hidden="true"
                  className={CUSTOMERS_BUTTON_ICON_CLASS}
                />
                Nova ficha
              </button>
            ) : null}
          </div>

          <div className={ANAMNESIS_LOCK_NOTE_CLASS}>
            <Lock aria-hidden="true" className={ANAMNESIS_NOTE_ICON_CLASS} />
            <p>
              <b className="block text-[#3B2A6B]">Dado de saúde</b>
              As respostas ficam cifradas. Só dono, gerente e o profissional do
              atendimento abrem a ficha, e cada abertura fica no histórico da
              loja.
            </p>
          </div>
          <p className={ANAMNESIS_TEXT_CLASS}>
            O link para o cliente preencher sai dos detalhes de cada
            agendamento, e vale até o dia seguinte ao atendimento.
          </p>
        </aside>
      </div>
    );
  };

  return (
    <div className="grid gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className={CUSTOMERS_TITLE_CLASS}>Fichas de anamnese</h2>
          <p className={CUSTOMERS_LEAD_CLASS}>{LEAD}</p>
        </div>
        <button
          type="button"
          onClick={handleNewForm}
          disabled={storeState !== 'ready' || isCreating}
          className={CUSTOMERS_PRIMARY_BUTTON_CLASS}
        >
          <Plus aria-hidden="true" className={CUSTOMERS_BUTTON_ICON_CLASS} />
          Nova ficha
        </button>
      </div>

      {renderContent()}
    </div>
  );
};
